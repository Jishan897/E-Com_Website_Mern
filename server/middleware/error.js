import multer from 'multer'
import { env } from '../config/env.js'

export function notFoundRoute(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500
  let message = err.message || 'Something went wrong'

  if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  } else if (err.name === 'CastError') {
    status = 400
    message = `Invalid ${err.path}`
  } else if (err.code === 11000) {
    status = 409
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'value'
    message = `That ${field} is already in use`
  } else if (err instanceof multer.MulterError) {
    status = 400
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 5 MB or smaller' : err.message
  }

  if (status >= 500) console.error(err)
  res.status(status).json({
    message: status >= 500 && env.isProduction ? 'Server error' : message,
  })
}
