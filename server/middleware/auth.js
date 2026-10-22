import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import User from '../models/User.js'
import { forbidden, unauthorized } from '../utils/httpError.js'

export const COOKIE_NAME = 'trendi_token'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function setAuthCookie(res, userId) {
  const token = jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: '7d' })
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: MAX_AGE_MS,
  })
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
  })
}

async function userFromRequest(req) {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) return null
  try {
    const { id } = jwt.verify(token, env.jwtSecret)
    return await User.findById(id)
  } catch {
    return null
  }
}

// Requires a signed-in user.
export async function protect(req, res, next) {
  const user = await userFromRequest(req)
  if (!user) throw unauthorized()
  req.user = user
  next()
}

// Attaches the user if signed in, but lets guests through.
export async function optionalAuth(req, res, next) {
  req.user = await userFromRequest(req)
  next()
}

// Requires the signed-in user to be an admin. Use after protect.
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') throw forbidden('Admin access only')
  next()
}
