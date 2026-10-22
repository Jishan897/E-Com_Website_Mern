import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { AuthContext } from './auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  // Restore the session from the httpOnly cookie on first load.
  useEffect(() => {
    api('/api/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { user } = await api('/api/auth/login', { method: 'POST', body: { email, password } })
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const { user } = await api('/api/auth/register', { method: 'POST', body: { name, email, password } })
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, checking, isAdmin: user?.role === 'admin', login, register, logout }),
    [user, checking, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
