import mongoose from 'mongoose'
import Product from '../models/Product.js'
import { badRequest } from '../utils/httpError.js'

const validIds = (ids) => (Array.isArray(ids) ? ids.filter((id) => mongoose.isValidObjectId(id)) : [])

async function respondWithWishlist(req, res) {
  const products = await Product.find({ _id: { $in: req.user.wishlist }, isActive: true })
  res.json({ ids: req.user.wishlist.map(String), products })
}

export const getWishlist = respondWithWishlist

export async function addToWishlist(req, res) {
  const { productId } = req.params
  if (!mongoose.isValidObjectId(productId)) throw badRequest('Invalid product')
  if (!req.user.wishlist.some((id) => String(id) === productId)) {
    req.user.wishlist.push(productId)
    await req.user.save()
  }
  await respondWithWishlist(req, res)
}

export async function removeFromWishlist(req, res) {
  req.user.wishlist = req.user.wishlist.filter((id) => String(id) !== req.params.productId)
  await req.user.save()
  await respondWithWishlist(req, res)
}

// Merge a guest's saved items into their account after they sign in.
export async function mergeWishlist(req, res) {
  const current = new Set(req.user.wishlist.map(String))
  for (const id of validIds(req.body.ids).slice(0, 200)) current.add(id)
  const existing = await Product.find({ _id: { $in: [...current] } }).distinct('_id')
  req.user.wishlist = existing
  await req.user.save()
  await respondWithWishlist(req, res)
}
