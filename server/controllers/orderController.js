import mongoose from 'mongoose'
import { ORDER_STATUSES, STORE } from '../config/store.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { badRequest, forbidden, notFound } from '../utils/httpError.js'

const ADDRESS_FIELDS = ['fullName', 'phone', 'line1', 'line2', 'city', 'state', 'pincode']

function readAddress(body) {
  const a = {}
  for (const key of ADDRESS_FIELDS) a[key] = typeof body?.[key] === 'string' ? body[key].trim() : ''
  const missing = ADDRESS_FIELDS.filter((k) => k !== 'line2' && !a[k])
  if (missing.length) throw badRequest(`Please fill in: ${missing.join(', ')}`)
  if (!/^[6-9]\d{9}$/.test(a.phone.replace(/\D/g, '').slice(-10))) throw badRequest('Enter a valid 10-digit mobile number')
  if (!/^\d{6}$/.test(a.pincode)) throw badRequest('Enter a valid 6-digit pincode')
  return a
}

// Take stock for one line; returns false if there isn't enough.
const takeStock = (productId, size, qty) =>
  Product.updateOne(
    { _id: productId, isActive: true, sizes: { $elemMatch: { label: size, stock: { $gte: qty } } } },
    { $inc: { 'sizes.$.stock': -qty } },
  ).then((r) => r.modifiedCount === 1)

const returnStock = (productId, size, qty) =>
  Product.updateOne({ _id: productId, 'sizes.label': size }, { $inc: { 'sizes.$.stock': qty } })

// POST /api/orders — place a Cash on Delivery order.
export async function createOrder(req, res) {
  const rawItems = Array.isArray(req.body.items) ? req.body.items : []
  if (!rawItems.length) throw badRequest('Your bag is empty')
  if (rawItems.length > 30) throw badRequest('Too many items in one order')
  const paymentMethod = req.body.paymentMethod ?? 'COD'
  if (!STORE.paymentMethods.includes(paymentMethod)) throw badRequest('Payment method not available')
  const shippingAddress = readAddress(req.body.shippingAddress)

  // Merge duplicate lines and validate shape.
  const merged = new Map()
  for (const it of rawItems) {
    const qty = Math.floor(Number(it?.qty))
    if (!mongoose.isValidObjectId(it?.productId) || !it?.size || !(qty > 0)) throw badRequest('Invalid item in bag')
    const key = `${it.productId}|${it.size}`
    merged.set(key, { productId: it.productId, size: String(it.size), qty: (merged.get(key)?.qty ?? 0) + qty })
  }
  const lines = [...merged.values()]
  if (lines.some((l) => l.qty > STORE.maxQtyPerItem)) throw badRequest(`Max ${STORE.maxQtyPerItem} per item`)

  const products = await Product.find({ _id: { $in: lines.map((l) => l.productId) }, isActive: true })
  const byId = new Map(products.map((p) => [String(p._id), p]))

  const items = lines.map((l) => {
    const p = byId.get(l.productId)
    if (!p) throw badRequest('An item in your bag is no longer available')
    if (!p.sizes.some((s) => s.label === l.size)) throw badRequest(`${p.name}: size ${l.size} doesn't exist`)
    return {
      product: p._id, name: p.name, brand: p.brand, slug: p.slug, image: p.images[0] ?? '',
      category: p.category, size: l.size, qty: l.qty, price: p.price, mrp: p.mrp,
    }
  })

  // Reserve stock line by line; undo everything if one line fails.
  const taken = []
  for (const it of items) {
    if (await takeStock(it.product, it.size, it.qty)) {
      taken.push(it)
    } else {
      await Promise.all(taken.map((t) => returnStock(t.product, t.size, t.qty)))
      throw badRequest(`${it.name} (size ${it.size}) doesn't have enough stock`)
    }
  }

  const mrpTotal = items.reduce((s, i) => s + i.mrp * i.qty, 0)
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shippingFee = STORE.freeShippingFrom && subtotal >= STORE.freeShippingFrom ? 0 : STORE.shippingFee

  try {
    const order = await Order.create({
      user: req.user._id, items, shippingAddress, paymentMethod,
      mrpTotal, subtotal, shippingFee, total: subtotal + shippingFee,
    })
    req.user.lastAddress = shippingAddress
    await req.user.save()
    res.status(201).json({ order })
  } catch (err) {
    await Promise.all(taken.map((t) => returnStock(t.product, t.size, t.qty)))
    throw err
  }
}

export async function myOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json({ orders })
}

export async function getOrder(req, res) {
  const order = await Order.findById(req.params.id).populate('user', 'name email')
  if (!order) throw notFound('Order not found')
  if (req.user.role !== 'admin' && String(order.user._id) !== String(req.user._id)) throw forbidden()
  res.json({ order })
}

async function cancel(order) {
  await Promise.all(order.items.map((i) => returnStock(i.product, i.size, i.qty)))
  order.status = 'cancelled'
  order.statusHistory.push({ status: 'cancelled' })
  await order.save()
}

// Customers can cancel until the order is packed.
export async function cancelMyOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
  if (!order) throw notFound('Order not found')
  if (!['placed', 'confirmed'].includes(order.status)) throw badRequest('This order can no longer be cancelled')
  await cancel(order)
  res.json({ order })
}

// ---------- Admin ----------

export async function adminListOrders(req, res) {
  const { status } = req.query
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
  const page = Math.max(1, Number(req.query.page) || 1)
  const filter = status ? { status } : {}
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('user', 'name email'),
    Order.countDocuments(filter),
  ])
  res.json({ orders, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
}

export async function adminUpdateOrderStatus(req, res) {
  const { status } = req.body
  if (!ORDER_STATUSES.includes(status)) throw badRequest('Unknown status')
  const order = await Order.findById(req.params.id)
  if (!order) throw notFound('Order not found')
  if (order.status === 'cancelled') throw badRequest('Cancelled orders cannot be changed')
  if (order.status === status) return res.json({ order })

  if (status === 'cancelled') {
    await cancel(order)
  } else {
    order.status = status
    order.statusHistory.push({ status })
    // Cash on Delivery is paid when the parcel is delivered.
    if (status === 'delivered' && order.paymentMethod === 'COD') order.paymentStatus = 'paid'
    await order.save()
  }
  res.json({ order })
}

export async function adminStats(req, res) {
  const [products, activeProducts, orders, pending, revenue] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'packed'] } }),
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
  ])
  res.json({ products, activeProducts, orders, pending, revenue: revenue[0]?.sum ?? 0 })
}
