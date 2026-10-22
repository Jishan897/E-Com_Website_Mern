// Loads the sample catalogue into MongoDB.
//   npm run seed            → adds sample products that aren't in the database yet
//   npm run seed -- --reset → deletes ALL products first, then adds the samples
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import { products } from '../data/sampleProducts.js'
import Product from '../models/Product.js'

const reset = process.argv.includes('--reset')

await connectDB()

if (reset) {
  const { deletedCount } = await Product.deleteMany({})
  console.log(`Deleted ${deletedCount} products`)
}

let added = 0
for (const p of products) {
  const res = await Product.updateOne({ slug: p.slug }, { $setOnInsert: p }, { upsert: true, runValidators: true })
  if (res.upsertedCount) added += 1
}
console.log(`Added ${added} new products (${products.length - added} already existed)`)

await mongoose.disconnect()
