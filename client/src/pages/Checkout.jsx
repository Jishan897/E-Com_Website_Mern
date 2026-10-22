import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import ProductArt from '../components/ProductArt'
import { PageLoading } from '../components/RequireAuth'
import { useAuth } from '../context/auth'
import { useStore } from '../context/store'
import { api } from '../lib/api'
import { formatINR } from '../utils/format'

const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal',
]

const EMPTY = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' }

const input = 'min-h-12 w-full rounded-[10px] border border-field bg-white px-4 text-[15px] font-normal'

export default function Checkout() {
  const { user } = useAuth()
  const { lines, cartLoading, mrpTotal, subtotal, discount, clearCart } = useStore()
  const navigate = useNavigate()
  const [address, setAddress] = useState(() => ({ ...EMPTY, fullName: user.name, ...(user.lastAddress ?? {}) }))
  const [error, setError] = useState('')
  const [placing, setPlacing] = useState(false)

  if (cartLoading && !lines.length) return <PageLoading />
  if (!lines.length && !placing) return <Navigate to="/cart" replace />

  const set = (key) => (e) => setAddress((a) => ({ ...a, [key]: e.target.value }))

  const placeOrder = async (e) => {
    e.preventDefault()
    setError('')
    setPlacing(true)
    try {
      const { order } = await api('/api/orders', {
        method: 'POST',
        body: {
          items: lines.map((l) => ({ productId: l.productId, size: l.size, qty: l.qty })),
          shippingAddress: address,
          paymentMethod: 'COD',
        },
      })
      clearCart()
      navigate(`/account/orders/${order._id}?placed=1`, { replace: true })
    } catch (err) {
      setError(err.message)
      setPlacing(false)
    }
  }

  return (
    <section className="container-page pt-10 pb-20">
      <h1 className="mb-8 font-display text-4xl leading-none md:text-5xl">CHECKOUT</h1>
      <form onSubmit={placeOrder} className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <fieldset className="flex flex-col gap-4">
            <legend className="mb-4 text-xl font-bold">Delivery address</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Full name
                <input required autoComplete="name" value={address.fullName} onChange={set('fullName')} className={input} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Mobile number
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  pattern="[0-9+ ]{10,14}"
                  placeholder="10-digit mobile"
                  value={address.phone}
                  onChange={set('phone')}
                  className={input}
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              House / flat, street
              <input required autoComplete="address-line1" value={address.line1} onChange={set('line1')} className={input} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              Area, landmark <span className="font-normal text-muted">(optional)</span>
              <input autoComplete="address-line2" value={address.line2} onChange={set('line2')} className={input} />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                City
                <input required autoComplete="address-level2" value={address.city} onChange={set('city')} className={input} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                State
                <select required autoComplete="address-level1" value={address.state} onChange={set('state')} className={input}>
                  <option value="">Select</option>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Pincode
                <input
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                  pattern="\d{6}"
                  maxLength={6}
                  value={address.pincode}
                  onChange={set('pincode')}
                  className={input}
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 text-xl font-bold">Payment</legend>
            <label className="flex min-h-14 items-center gap-3 rounded-[14px] border-[1.5px] border-ink px-4">
              <input type="radio" name="payment" checked readOnly className="h-[18px] w-[18px] accent-ink" />
              <span className="font-bold">Cash on Delivery</span>
              <span className="ml-auto text-sm text-muted">Pay when your order arrives</span>
            </label>
            <p className="mt-2 text-sm text-muted">Online payments (UPI, cards, EMI) are coming soon.</p>
          </fieldset>
        </div>

        <aside aria-label="Order summary" className="flex flex-col gap-4 rounded-[20px] bg-concrete p-7 lg:sticky lg:top-24 lg:w-[400px]">
          <h2 className="text-xl font-bold">Order summary</h2>
          <ul className="flex flex-col gap-3">
            {lines.map(({ product, size, qty }) => (
              <li key={`${product._id}-${size}`} className="flex gap-3">
                <span className="flex aspect-square w-16 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white">
                  <ProductArt product={product} className="w-[80%]" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col text-sm">
                  <span className="truncate font-bold">{product.name}</span>
                  <span className="text-muted">Size {size} · Qty {qty}</span>
                </span>
                <span className="text-sm font-bold">{formatINR(product.price * qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-field pt-4 text-[15px]"><span>Subtotal (MRP)</span><span>{formatINR(mrpTotal)}</span></div>
          {discount > 0 && (
            <div className="flex justify-between text-[15px]"><span>Discount</span><span className="font-bold text-ok">− {formatINR(discount)}</span></div>
          )}
          <div className="flex items-baseline justify-between border-t border-field pt-4">
            <span className="text-[17px] font-bold">Total</span>
            <span className="text-[26px] font-bold">{formatINR(subtotal)}</span>
          </div>
          {error && (
            <p role="alert" className="rounded-[10px] bg-[#FBEAE9] px-4 py-3 text-sm font-medium text-sale">{error}</p>
          )}
          <button
            type="submit"
            disabled={placing}
            className="min-h-14 rounded-full bg-ink text-base font-bold text-white hover:bg-[#2A2A28] disabled:opacity-60"
          >
            {placing ? 'Placing order…' : `Place order · ${formatINR(subtotal)}`}
          </button>
          <Link to="/cart" className="text-center text-sm font-medium underline">Back to bag</Link>
        </aside>
      </form>
    </section>
  )
}
