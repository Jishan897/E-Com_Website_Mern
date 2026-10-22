// Store-wide settings. Change these to match your business policy.
export const STORE = {
  // Flat shipping fee in rupees, waived when the order subtotal reaches freeShippingFrom.
  shippingFee: 0,
  freeShippingFrom: 0,
  paymentMethods: ['COD'],
  maxQtyPerItem: 5,
}

export const CATEGORIES = ['sneakers', 'apparel', 'accessories', 'collectibles']

export const ORDER_STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']
