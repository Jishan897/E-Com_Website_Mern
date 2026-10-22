import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

// GET a path and track loading/error. Pass null to skip.
// The result is keyed by path, so changing the path shows loading again.
export function useApi(path) {
  const [nonce, setNonce] = useState(0)
  const key = path ? `${path}#${nonce}` : null
  const [result, setResult] = useState({ key: null, data: null, error: null })

  useEffect(() => {
    if (!key) return undefined
    const controller = new AbortController()
    api(path, { signal: controller.signal })
      .then((data) => setResult({ key, data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setResult({ key, data: null, error })
      })
    return () => controller.abort()
  }, [key, path])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  const loading = Boolean(key) && result.key !== key

  return {
    // Keep showing the previous data while the next request loads.
    data: result.data,
    error: loading ? null : result.error,
    loading,
    reload,
  }
}
