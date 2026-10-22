import { Link, useNavigate } from 'react-router-dom'
import ProductArt from '../components/ProductArt'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/auth'
import { useApi } from '../hooks/useApi'
import { formatDate, formatINR } from '../utils/format'

export default function Account() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useApi('/api/orders/mine')
  const orders = data?.orders ?? []

  const signOut = async () => {
    await logout()
    navigate('/')
  }

  return (
    <section className="container-page pt-10 pb-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">MY ACCOUNT</h1>
          <p className="mt-2 text-muted">
            {user.name} · {user.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <Link to="/admin" className="flex min-h-11 items-center rounded-full bg-volt px-5 font-bold text-ink">
              Admin panel
            </Link>
          )}
          <Link to="/wishlist" className="flex min-h-11 items-center rounded-full border-[1.5px] border-ink px-5 font-bold">
            Wishlist
          </Link>
          <button type="button" onClick={signOut} className="min-h-11 rounded-full border-[1.5px] border-field px-5 font-bold hover:border-ink">
            Sign out
          </button>
        </div>
      </div>

      <h2 className="mb-4 text-2xl font-bold">Orders</h2>
      {loading && !data ? (
        <p className="text-muted" role="status">Loading orders…</p>
      ) : error ? (
        <p className="text-muted">
          Couldn't load orders. <button type="button" onClick={reload} className="font-bold underline">Try again</button>
        </p>
      ) : orders.length ? (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o._id}>
              <Link
                to={`/account/orders/${o._id}`}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-line p-4 hover:border-ink sm:p-5"
              >
                <span className="flex -space-x-3">
                  {o.items.slice(0, 3).map((it) => (
                    <span
                      key={`${it.product}-${it.size}`}
                      className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-concrete"
                    >
                      <ProductArt product={it} image={it.image || undefined} className="w-[80%]" />
                    </span>
                  ))}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold">{o.orderNumber}</span>
                  <span className="text-sm text-muted">
                    {formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.qty, 0)} items
                  </span>
                </span>
                <StatusBadge status={o.status} />
                <span className="font-bold">{formatINR(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl bg-concrete p-10 text-center">
          <p className="text-lg font-bold">No orders yet.</p>
          <Link to="/shop" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-bold text-white">
            Start shopping
          </Link>
        </div>
      )}
    </section>
  )
}
