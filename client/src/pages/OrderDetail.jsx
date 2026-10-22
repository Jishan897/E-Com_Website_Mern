import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import ProductArt from '../components/ProductArt'
import { PageLoading } from '../components/RequireAuth'
import StatusBadge from '../components/StatusBadge'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { formatDate, formatINR, ORDER_STATUS_LABELS } from '../utils/format'
import NotFound from './NotFound'

const STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'delivered']

export default function OrderDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { data, error, reload } = useApi(`/api/orders/${id}`)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  if (error) {
    if (error.status < 500) return <NotFound />
    return (
      <div className="container-page py-24 text-center">
        <p className="text-lg font-bold">Couldn't load this order.</p>
        <button type="button" onClick={reload} className="mt-6 rounded-full bg-ink px-6 py-3 font-bold text-white">Try again</button>
      </div>
    )
  }
  if (!data || data.order._id !== id) return <PageLoading />

  const { order } = data
  const step = STEPS.indexOf(order.status)
  const canCancel = ['placed', 'confirmed'].includes(order.status)

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return
    setCancelling(true)
    setCancelError('')
    try {
      await api(`/api/orders/${order._id}/cancel`, { method: 'POST' })
      reload()
    } catch (err) {
      setCancelError(err.message)
    } finally {
      setCancelling(false)
    }
  }

  const a = order.shippingAddress

  return (
    <section className="container-page pt-10 pb-20">
      {params.get('placed') && (
        <div role="status" className="mb-8 rounded-2xl bg-ink p-6 text-white md:p-8">
          <p className="text-[13px] font-bold tracking-[0.18em] text-volt">ORDER PLACED</p>
          <p className="mt-2 font-display text-3xl md:text-4xl">THANK YOU!</p>
          <p className="mt-2 text-soft">
            Your order {order.orderNumber} is confirmed. Pay {formatINR(order.total)} in cash when it arrives.
          </p>
        </div>
      )}

      <Link to="/account" className="text-sm font-bold hover:underline">← All orders</Link>
      <div className="mt-4 mb-8 flex flex-wrap items-center gap-4">
        <h1 className="font-display text-3xl md:text-4xl">{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
        <span className="text-muted">{formatDate(order.createdAt, true)}</span>
      </div>

      {order.status !== 'cancelled' && (
        <ol className="mb-10 grid grid-cols-5 gap-1" aria-label="Order progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-col gap-2">
              <span className={`h-1.5 rounded-full ${i <= step ? 'bg-ink' : 'bg-line'}`} />
              <span className={`text-xs sm:text-sm ${i <= step ? 'font-bold' : 'text-muted'}`}>{ORDER_STATUS_LABELS[s]}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <ul className="flex min-w-0 flex-1 flex-col border-t border-line">
          {order.items.map((it) => (
            <li key={`${it.product}-${it.size}`} className="flex gap-4 border-b border-line py-5">
              <Link
                to={`/product/${it.slug}`}
                className="flex aspect-square w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-concrete"
                aria-label={it.name}
              >
                <ProductArt product={it} image={it.image || undefined} className="w-[80%]" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-xs font-bold tracking-wider text-muted uppercase">{it.brand}</span>
                <span className="font-bold">{it.name}</span>
                <span className="text-sm text-muted">Size {it.size} · Qty {it.qty}</span>
              </div>
              <span className="font-bold">{formatINR(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>

        <aside className="flex flex-col gap-6 lg:w-[380px]">
          <div className="flex flex-col gap-3 rounded-[20px] bg-concrete p-6">
            <h2 className="text-lg font-bold">Payment</h2>
            <div className="flex justify-between text-[15px]"><span>Subtotal (MRP)</span><span>{formatINR(order.mrpTotal)}</span></div>
            {order.mrpTotal > order.subtotal && (
              <div className="flex justify-between text-[15px]"><span>Discount</span><span className="font-bold text-ok">− {formatINR(order.mrpTotal - order.subtotal)}</span></div>
            )}
            <div className="flex justify-between text-[15px]"><span>Shipping</span><span>{order.shippingFee ? formatINR(order.shippingFee) : 'Free'}</span></div>
            <div className="flex justify-between border-t border-field pt-3 text-lg font-bold"><span>Total</span><span>{formatINR(order.total)}</span></div>
            <p className="text-sm text-muted">
              Cash on Delivery · {order.paymentStatus === 'paid' ? 'Paid' : 'To be paid on delivery'}
            </p>
          </div>
          <div className="rounded-[20px] border border-line p-6">
            <h2 className="mb-2 text-lg font-bold">Delivery address</h2>
            <address className="text-[15px] leading-relaxed text-muted not-italic">
              {a.fullName}<br />
              {a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />
              {a.city}, {a.state} {a.pincode}<br />
              {a.phone}
            </address>
          </div>
          {canCancel && (
            <div>
              <button
                type="button"
                onClick={cancel}
                disabled={cancelling}
                className="min-h-12 w-full rounded-full border-[1.5px] border-sale font-bold text-sale hover:bg-[#FBEAE9] disabled:opacity-60"
              >
                {cancelling ? 'Cancelling…' : 'Cancel order'}
              </button>
              {cancelError && <p role="alert" className="mt-2 text-sm text-sale">{cancelError}</p>}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
