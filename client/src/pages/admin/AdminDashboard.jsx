import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { formatINR } from '../../utils/format'

export default function AdminDashboard() {
  const { data, error } = useApi('/api/admin/stats')

  const tiles = data
    ? [
        { label: 'Revenue (excl. cancelled)', value: formatINR(data.revenue) },
        { label: 'Orders', value: data.orders },
        { label: 'Orders to process', value: data.pending, to: '/admin/orders?status=placed' },
        { label: 'Products live', value: `${data.activeProducts} / ${data.products}`, to: '/admin/products' },
      ]
    : []

  return (
    <div className="flex flex-col gap-8">
      {error && <p className="text-sale">{error.message}</p>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data
          ? tiles.map((t) => {
              const body = (
                <>
                  <span className="text-sm text-muted">{t.label}</span>
                  <span className="text-3xl font-bold">{t.value}</span>
                </>
              )
              return t.to ? (
                <Link key={t.label} to={t.to} className="flex flex-col gap-2 rounded-2xl border border-line p-5 hover:border-ink">
                  {body}
                </Link>
              ) : (
                <div key={t.label} className="flex flex-col gap-2 rounded-2xl border border-line p-5">{body}</div>
              )
            })
          : Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-concrete" />)}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/products/new" className="rounded-full bg-ink px-6 py-3.5 font-bold text-white">
          + Add product
        </Link>
        <Link to="/admin/orders" className="rounded-full border-[1.5px] border-ink px-6 py-3.5 font-bold">
          Manage orders
        </Link>
      </div>
    </div>
  )
}
