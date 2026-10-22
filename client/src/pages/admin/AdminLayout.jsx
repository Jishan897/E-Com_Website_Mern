import { NavLink, Outlet } from 'react-router-dom'

const TABS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
]

export default function AdminLayout() {
  return (
    <div className="container-page pt-8 pb-20">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <h1 className="font-display text-3xl md:text-4xl">ADMIN</h1>
        <nav aria-label="Admin" className="flex gap-1 rounded-full bg-concrete p-1">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex min-h-10 items-center rounded-full px-4 text-sm font-bold ${isActive ? 'bg-ink text-white' : 'hover:bg-white'}`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  )
}
