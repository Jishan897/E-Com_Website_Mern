import { clearAuthCookie, setAuthCookie } from '../middleware/auth.js'
import User from '../models/User.js'
import { badRequest, unauthorized } from '../utils/httpError.js'

const clean = (v) => (typeof v === 'string' ? v.trim() : '')

export async function register(req, res) {
  const name = clean(req.body.name)
  const email = clean(req.body.email).toLowerCase()
  const password = typeof req.body.password === 'string' ? req.body.password : ''

  if (!name || !email || !password) throw badRequest('Name, email and password are required')
  if (password.length < 8) throw badRequest('Password must be at least 8 characters')
  if (await User.exists({ email })) throw badRequest('An account with this email already exists')

  const user = await User.create({ name, email, password })
  setAuthCookie(res, user._id)
  res.status(201).json({ user: user.toPublic() })
}

export async function login(req, res) {
  const email = clean(req.body.email).toLowerCase()
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  if (!email || !password) throw badRequest('Email and password are required')

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.matchPassword(password))) throw unauthorized('Wrong email or password')

  setAuthCookie(res, user._id)
  res.json({ user: user.toPublic() })
}

export function logout(req, res) {
  clearAuthCookie(res)
  res.json({ ok: true })
}

// Returns { user: null } for guests so the site can check without an error.
export function me(req, res) {
  res.json({ user: req.user ? req.user.toPublic() : null })
}
