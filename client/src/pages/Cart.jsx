import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LockIcon } from '../components/Icons'
import ProductArt from '../components/ProductArt'
import { PageLoading } from '../components/RequireAuth'
import { MAX_QTY, useStore } from '../context/store'
import { formatINR } from '../utils/format'

export default function Cart() {
  const { lines, cartLoading, mrpTotal, subtotal, discount, updateQty, removeFromCart, toggleWishlist, isWishlisted } = useStore()
  const [coupon, setCoupon] = useState('')
  const [couponMsg, setCouponMsg] = useState('')

  if (cartLoading && !lines.length) return <PageLoading />

  const cartCount = lines.reduce((sum, l) => sum + l.qty, 0)

  if (!lines.length) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-display text-4xl md:text-5xl">YOUR BAG IS EMPTY</h1>
        <p className="text-muted">Find something you like and it will show up here.</p>
        <Link to="/shop" className="mt-2 rounded-full bg-ink px-7 py-4 font-bold text-white">
          Start shopping
        </Link>
      </div>
    )
  }

  const applyCoupon = (e) => {
    e.preventDefault()
    setCouponMsg(coupon.trim() ? "Coupons aren't available yet." : '')
  }

  return (
    <section className="container-page pt-10 pb-20">
      <h1 className="mb-8 font-display text-4xl leading-none md:text-5xl">
        YOUR BAG{' '}
        <span className="font-sans text-xl font-medium text-muted">
          ({cartCount} {cartCount === 1 ? 'item' : 'items'})
        </span>
      </h1>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col border-t border-line">
          {lines.map(({ product, size, qty }) => (
            <div key={`${product._id}-${size}`} className="flex gap-4 border-b border-line py-6 sm:gap-6">
              <Link
                to={`/product/${product.slug}`}
                className="flex aspect-square w-24 shrink-0 items-center justify-center rounded-[14px] bg-concrete sm:w-36"
                aria-label={product.name}
              >
                <ProductArt product={product} className="w-[75%]" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-xs font-bold tracking-wider text-muted uppercase">{product.brand}</span>
                    <Link to={`/product/${product.slug}`} className="block text-base font-bold hover:underline sm:text-lg">
                      {product.name}
                    </Link>
                    <span className="text-sm text-muted">Size: {product.category === 'sneakers' ? 'UK ' : ''}{size}</span>
                    {!product.sizes.find((s) => s.label === size)?.inStock && (
                      <span className="block text-sm font-bold text-sale">This size just sold out — remove it to check out.</span>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-base font-bold sm:text-lg">{formatINR(product.price * qty)}</span>
                    {product.mrp > product.price && (
                      <span className="text-[13px] text-muted line-through">{formatINR(product.mrp * qty)}</span>
                    )}
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-3">
                  <div className="flex items-center rounded-full border border-field">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${product.name}`}
                      onClick={() => updateQty(product._id, size, qty - 1)}
                      className="h-11 w-11 text-xl"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center font-bold" aria-live="polite">{qty}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${product.name}`}
                      onClick={() => updateQty(product._id, size, qty + 1)}
                      disabled={qty >= MAX_QTY || qty >= (product.sizes.find((s) => s.label === size)?.stock ?? 0)}
                      className="h-11 w-11 text-xl disabled:text-field"
                    >
                      +
                    </button>
                  </div>
                  <button type="button" onClick={() => removeFromCart(product._id, size)} className="min-h-11 text-sm font-medium underline">
                    Remove
                  </button>
                  {!isWishlisted(product._id) && (
                    <button
                      type="button"
                      onClick={() => {
                        toggleWishlist(product._id)
                        removeFromCart(product._id, size)
                      }}
                      className="min-h-11 text-sm font-medium underline"
                    >
                      Move to wishlist
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Link to="/shop" className="mt-6 text-[15px] font-bold hover:underline">← Continue shopping</Link>
        </div>

        <aside aria-label="Order summary" className="flex flex-col gap-4 rounded-[20px] bg-concrete p-7 lg:sticky lg:top-24 lg:w-[380px]">
          <h2 className="text-xl font-bold">Order summary</h2>
          <div className="flex justify-between text-[15px]"><span>Subtotal (MRP)</span><span>{formatINR(mrpTotal)}</span></div>
          {discount > 0 && (
            <div className="flex justify-between text-[15px]"><span>Discount</span><span className="font-bold text-ok">− {formatINR(discount)}</span></div>
          )}
          <div className="flex justify-between text-[15px]"><span>Shipping</span><span>Calculated at checkout</span></div>
          <form onSubmit={applyCoupon} className="flex gap-2">
            <label htmlFor="coupon" className="sr-only">Coupon code</label>
            <input
              id="coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              className="min-h-12 min-w-0 flex-1 rounded-[10px] border border-field bg-white px-3.5 text-[15px]"
            />
            <button type="submit" className="min-h-12 rounded-[10px] border-[1.5px] border-ink bg-white px-4 font-bold">Apply</button>
          </form>
          {couponMsg && <p role="status" className="-mt-2 text-sm text-muted">{couponMsg}</p>}
          <div className="flex items-baseline justify-between border-t border-field pt-4">
            <span className="text-[17px] font-bold">Total</span>
            <span className="text-[26px] font-bold">{formatINR(subtotal)}</span>
          </div>
          <span className="-mt-2.5 text-[13px] text-muted">Inclusive of all taxes</span>
          <Link
            to="/checkout"
            className="flex min-h-14 items-center justify-center rounded-full bg-ink text-base font-bold text-white hover:bg-[#2A2A28]"
          >
            Proceed to checkout
          </Link>
          <div className="flex items-center justify-center gap-2 text-[13px] text-muted">
            <LockIcon width={16} height={16} /> Secure checkout · UPI · Cards · EMI
          </div>
        </aside>
      </div>
    </section>
  )
}
