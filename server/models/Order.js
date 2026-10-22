import mongoose from 'mongoose'
import { ORDER_STATUSES } from '../config/store.js'
import { addressSchema } from './User.js'

// Items keep a snapshot of name/price/image so old orders stay correct
// even if the product is edited or deleted later.
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, default: '' },
    category: { type: String, required: true },
    size: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    shippingAddress: { type: addressSchema, required: true },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    status: { type: String, enum: ORDER_STATUSES, default: 'placed' },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        at: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    mrpTotal: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
  },
  { timestamps: true },
)

orderSchema.pre('save', function setOrderNumber() {
  if (!this.orderNumber) {
    const stamp = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    this.orderNumber = `TR-${stamp}${rand}`
  }
  if (this.isNew) this.statusHistory = [{ status: this.status }]
})

export default mongoose.model('Order', orderSchema)
