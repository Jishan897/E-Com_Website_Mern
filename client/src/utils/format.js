export const formatINR = (amount) => `₹${Math.round(amount).toLocaleString('en-IN')}`

export const discountPercent = (price, mrp) =>
  mrp > price ? Math.round((1 - price / mrp) * 100) : 0

export const formatDate = (iso, withTime = false) =>
  new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  })

export const ORDER_STATUS_LABELS = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
