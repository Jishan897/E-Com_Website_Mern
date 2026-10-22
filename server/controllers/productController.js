import fs from 'node:fs/promises'
import path from 'node:path'
import mongoose from 'mongoose'
import { CATEGORIES } from '../config/store.js'
import { UPLOAD_DIR } from '../middleware/upload.js'
import Product, { slugify } from '../models/Product.js'
import { badRequest, notFound } from '../utils/httpError.js'

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const asArray = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v])
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const sizeRank = (label) => {
  const n = Number(label)
  if (!Number.isNaN(n)) return n
  const i = SIZE_ORDER.indexOf(label)
  return i === -1 ? 1000 : 100 + i
}

const SORTS = {
  featured: { createdAt: 1 },
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
}

// GET /api/products — public catalogue with filters, sort, pagination and facets.
export async function listProducts(req, res) {
  const { category, q, size, tag, instant, min, max, ids } = req.query
  const sort = req.query.sort ?? 'featured'
  const brands = asArray(req.query.brand)
  const limit = Math.min(60, Math.max(1, Number(req.query.limit) || 12))
  const page = Math.max(1, Number(req.query.page) || 1)

  const base = { isActive: true }
  if (category) {
    if (!CATEGORIES.includes(category)) throw badRequest('Unknown category')
    base.category = category
  }

  const filter = { ...base }
  if (ids) {
    filter._id = { $in: String(ids).split(',').filter((id) => mongoose.isValidObjectId(id)) }
  }
  if (q) {
    const rx = new RegExp(escapeRegex(String(q).slice(0, 80)), 'i')
    filter.$or = [{ name: rx }, { brand: rx }]
  }
  if (brands.length) filter.brand = { $in: brands }
  if (size) filter.sizes = { $elemMatch: { label: size, stock: { $gt: 0 } } }
  if (tag) filter.tags = tag
  if (instant === '1') filter.instantShip = true
  const minPrice = Number(min)
  const maxPrice = Number(max)
  if ((min && Number.isFinite(minPrice)) || (max && Number.isFinite(maxPrice))) {
    filter.price = {}
    if (min && Number.isFinite(minPrice)) filter.price.$gte = minPrice
    if (max && Number.isFinite(maxPrice)) filter.price.$lte = maxPrice
  }

  let query
  if (sort === 'discount') {
    // Discount isn't stored, so compute it in an aggregation.
    query = Product.aggregate([
      { $match: filter },
      { $addFields: { _discount: { $cond: [{ $gt: ['$mrp', 0] }, { $divide: ['$price', '$mrp'] }, 1] } } },
      { $sort: { _discount: 1, _id: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]).then((docs) => docs.map((d) => Product.hydrate(d).toJSON()))
  } else {
    query = Product.find(filter)
      .sort({ ...(SORTS[sort] ?? SORTS.featured), _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
  }

  const [products, total, brandFacet, sizeFacet] = await Promise.all([
    query,
    Product.countDocuments(filter),
    Product.aggregate([
      { $match: base },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Product.distinct('sizes.label', base),
  ])

  res.json({
    products,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    facets: {
      brands: brandFacet.map((b) => ({ name: b._id, count: b.count })),
      sizes: sizeFacet.filter((s) => s !== 'One size').sort((a, b) => sizeRank(a) - sizeRank(b)),
    },
  })
}

// GET /api/products/:slug — one product plus related items.
export async function getProduct(req, res) {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
  if (!product) throw notFound('Product not found')

  const sameCategory = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
  }).limit(12)
  const related = sameCategory
    .sort((a, b) => (b.brand === product.brand) - (a.brand === product.brand))
    .slice(0, 6)

  res.json({ product, related })
}

// ---------- Admin ----------

const FIELDS = ['name', 'slug', 'brand', 'category', 'description', 'price', 'mrp', 'images', 'sizes', 'tags', 'instantShip', 'isActive']

function pickProductFields(body) {
  const data = {}
  for (const key of FIELDS) if (body[key] !== undefined) data[key] = body[key]
  if (typeof data.slug === 'string') data.slug = slugify(data.slug)
  if (data.slug === '') delete data.slug
  if (Array.isArray(data.sizes)) {
    data.sizes = data.sizes
      .filter((s) => s && String(s.label ?? '').trim())
      .map((s) => ({ label: String(s.label).trim(), stock: Math.max(0, Number(s.stock) || 0) }))
  }
  if (Array.isArray(data.images)) data.images = data.images.filter((u) => typeof u === 'string' && u.trim())
  return data
}

// GET /api/admin/products — every product, including hidden ones.
export async function adminListProducts(req, res) {
  const { q, category } = req.query
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
  const page = Math.max(1, Number(req.query.page) || 1)
  const filter = {}
  if (category) filter.category = category
  if (q) {
    const rx = new RegExp(escapeRegex(String(q).slice(0, 80)), 'i')
    filter.$or = [{ name: rx }, { brand: rx }, { slug: rx }]
  }
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ])
  res.json({ products, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
}

export async function adminGetProduct(req, res) {
  const product = await Product.findById(req.params.id)
  if (!product) throw notFound('Product not found')
  res.json({ product })
}

export async function createProduct(req, res) {
  const product = await Product.create(pickProductFields(req.body))
  res.status(201).json({ product })
}

export async function updateProduct(req, res) {
  const product = await Product.findById(req.params.id)
  if (!product) throw notFound('Product not found')
  const before = [...product.images]
  product.set(pickProductFields(req.body))
  await product.save()
  await deleteLocalImages(before.filter((url) => !product.images.includes(url)))
  res.json({ product })
}

export async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) throw notFound('Product not found')
  await deleteLocalImages(product.images)
  res.json({ ok: true })
}

// POST /api/admin/uploads — returns URLs for the uploaded image files.
export function uploadProductImages(req, res) {
  if (!req.files?.length) throw badRequest('Choose at least one image')
  res.status(201).json({ urls: req.files.map((f) => `/uploads/${f.filename}`) })
}

// Remove files we stored ourselves; external image URLs are left alone.
async function deleteLocalImages(urls) {
  await Promise.all(
    urls
      .filter((u) => u.startsWith('/uploads/'))
      .map((u) => fs.unlink(path.join(UPLOAD_DIR, path.basename(u))).catch(() => {})),
  )
}
