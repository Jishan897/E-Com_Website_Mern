import mongoose from 'mongoose'
import { CATEGORIES } from '../config/store.js'

const sizeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
)

sizeSchema.virtual('inStock').get(function inStock() {
  return this.stock > 0
})

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    description: { type: String, default: '', maxlength: 4000 },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    images: [{ type: String, trim: true }],
    sizes: { type: [sizeSchema], default: [] },
    tags: [{ type: String, enum: ['trending', 'new', 'steal'] }],
    instantShip: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
)

productSchema.index({ category: 1, isActive: 1 })
productSchema.index({ name: 'text', brand: 'text' })

// Fill slug from brand + name when it isn't given.
productSchema.pre('validate', function makeSlug() {
  if (!this.slug && this.name) this.slug = slugify(`${this.brand ?? ''} ${this.name}`)
  if (this.mrp < this.price) this.mrp = this.price
})

productSchema.virtual('discount').get(function discount() {
  return this.mrp > this.price ? Math.round((1 - this.price / this.mrp) * 100) : 0
})

export { slugify }
export default mongoose.model('Product', productSchema)
