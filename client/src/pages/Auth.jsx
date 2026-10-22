import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/auth'

// Only allow redirects to pages on this site.
const safeRedirect = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : '/account')

export default function Auth({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const redirect = safeRedirect(params.get('redirect'))
  if (user) return <Navigate to={redirect} replace />

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isLogin) await login(form.email, form.password)
      else await register(form.name, form.email, form.password)
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const switchTo = `${isLogin ? '/register' : '/login'}${params.get('redirect') ? `?redirect=${encodeURIComponent(redirect)}` : ''}`

  return (
    <section className="container-page flex justify-center py-16 md:py-24">
      <div className="w-full max-w-[440px]">
        <h1 className="font-display text-4xl md:text-5xl">{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</h1>
        <p className="mt-3 text-muted">
          {isLogin ? 'Track orders, save your wishlist and check out faster.' : 'Join Trendi to get early access to drops.'}
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          {!isLogin && (
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              Full name
              <input
                required
                autoComplete="name"
                value={form.name}
                onChange={set('name')}
                className="min-h-12 rounded-[10px] border border-field px-4 text-[15px] font-normal"
              />
            </label>
          )}
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              className="min-h-12 rounded-[10px] border border-field px-4 text-[15px] font-normal"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Password
            <input
              type="password"
              required
              minLength={8}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={set('password')}
              className="min-h-12 rounded-[10px] border border-field px-4 text-[15px] font-normal"
            />
            {!isLogin && <span className="text-xs font-normal text-muted">At least 8 characters</span>}
          </label>
          {error && (
            <p role="alert" className="rounded-[10px] bg-[#FBEAE9] px-4 py-3 text-sm font-medium text-sale">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-2 min-h-14 rounded-full bg-ink text-base font-bold text-white hover:bg-[#2A2A28] disabled:opacity-60"
          >
            {busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-8 text-[15px]">
          {isLogin ? 'New to Trendi?' : 'Already have an account?'}{' '}
          <Link to={switchTo} className="font-bold underline">
            {isLogin ? 'Create an account' : 'Sign in'}
          </Link>
        </p>
      </div>
    </section>
  )
}
