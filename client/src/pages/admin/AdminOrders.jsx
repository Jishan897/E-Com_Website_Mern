import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useApi } from '../../hooks/useApi'
import { api, toQuery } from '../../lib/api'
import { formatDate, formatINR, ORDER_STATUS_LABELS } from '../../utils/format'

const STATUSES = Object.keys(ORDER_STATUS_LABELS)

export default function AdminOrders() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const { data, loading, error, reload } = useApi(`/api/admin/orders${toQuery({ status, page, limit: 20 })}`)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')

  const setFilter = (value) => {
    const next = new URLSearchParams()
    if (value) next.set('status', value)
    setParams(next)
  }

  const changeStatus = async (order, next) => {
    if (next === 'cancelled' && !window.confirm(`Cancel ${order.orderNumber}? Stock will be returned.`)) return
    setBusyId(order._id)
    setActionError('')
    try {
      await api(`/api/admin/orders/${order._id}/status`, { method: 'PUT', body: { status: next } })
      reload()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const orders = data?.orders ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {['', ...STATUSES].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            aria-pressed={status === s}
            onClick={() => setFilter(s)}
            className={`min-h-10 rounded-full px-4 text-sm font-bold ${status === s ? 'bg-ink text-white' : 'border border-field hover:border-ink'}`}
          >
            {s ? ORDER_STATUS_LABELS[s] : 'All'}
          </button>
        ))}
      </div>

      {(error || actionError) && <p role="alert" className="text-sale">{actionError || error.message}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-concrete text-xs tracking-wider text-muted uppercase">
            <tr>
              <th scope="col" className="p-3">Order</th>
              <th scope="col" className="p-3">Customer</th>
              <th scope="col" className="p-3">Items</th>
              <th scope="col" className="p-3">Total</th>
              <th scope="col" className="p-3">Status</th>
              <th scope="col" className="p-3">Update</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {orders.map((o) => (
              <tr key={o._id} className="border-t border-line align-top">
                <td className="p-3">
                  <Link to={`/account/orders/${o._id}`} className="font-bold underline">{o.orderNumber}</Link>
                  <div className="text-muted">{formatDate(o.createdAt, true)}</div>
                </td>
                <td className="p-3">
                  <div className="font-bold">{o.shippingAddress.fullName}</div>
                  <div className="text-muted">{o.user?.email ?? '—'}</div>
                  <div className="text-muted">{o.shippingAddress.phone} · {o.shippingAddress.city} {o.shippingAddress.pincode}</div>
                </td>
                <td className="p-3">
                  {o.items.map((it) => (
                    <div key={`${it.product}-${it.size}`}>
                      {it.qty} × {it.name} <span className="text-muted">({it.size})</span>
                    </div>
                  ))}
                </td>
                <td className="p-3">
                  <div className="font-bold">{formatINR(o.total)}</div>
                  <div className="text-muted">COD · {o.paymentStatus}</div>
                </td>
                <td className="p-3"><StatusBadge status={o.status} /></td>
                <td className="p-3">
                  {o.status === 'cancelled' ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <>
                      <label htmlFor={`status-${o._id}`} className="sr-only">Status for {o.orderNumber}</label>
                      <select
                        id={`status-${o._id}`}
                        value={o.status}
                        disabled={busyId === o._id}
                        onChange={(e) => changeStatus(o, e.target.value)}
                        className="min-h-10 rounded-[10px] border border-field bg-white px-2"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!loading && !orders.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">No orders here yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.pages > 1 && (
        <nav aria-label="Pagination" className="flex justify-center gap-2">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === page ? 'page' : undefined}
              onClick={() => {
                const next = new URLSearchParams(params)
                if (n === 1) next.delete('page')
                else next.set('page', String(n))
                setParams(next)
              }}
              className={`h-11 w-11 rounded-[10px] font-medium ${n === page ? 'bg-ink text-white' : 'border border-field'}`}
            >
              {n}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
