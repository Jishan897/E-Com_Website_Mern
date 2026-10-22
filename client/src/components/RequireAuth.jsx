import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth'

export function PageLoading() {
  return (
    <div className="container-page py-24 text-center text-muted" role="status">
      Loading…
    </div>
  )
}

// Wrap routes that need a signed-in user (or an admin).
export default function RequireAuth({ admin = false }) {
  const { user, checking, isAdmin } = useAuth()
  const location = useLocation()

  if (checking) return <PageLoading />
  if (!user) {
    const back = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${back}`} replace />
  }
  if (admin && !isAdmin) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-4xl">ADMINS ONLY</h1>
        <p className="mt-3 text-muted">Your account doesn't have access to this page.</p>
      </div>
    )
  }
  return <Outlet />
}
