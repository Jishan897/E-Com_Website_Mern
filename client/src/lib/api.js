// Small fetch wrapper for the Trendi API.
// In development Vite proxies /api and /uploads to the Express server.
// In production set VITE_API_URL to the server's address (e.g. https://api.trendi.in).
const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export async function api(path, { method = 'GET', body, form, signal } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    signal,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.message || `Request failed (${res.status})`)
  return data
}

// Turn a stored image path into a full URL.
export const assetUrl = (url) => (url?.startsWith('/uploads/') ? `${BASE}${url}` : url)

// Build "?a=1&b=2" from an object, skipping empty values. Arrays repeat the key.
export function toQuery(params) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((v) => q.append(key, v))
    else if (value !== undefined && value !== null && value !== '') q.set(key, value)
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}
