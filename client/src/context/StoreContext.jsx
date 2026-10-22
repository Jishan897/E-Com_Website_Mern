import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from './auth'
import { MAX_QTY, StoreContext } from './store'

const CART_KEY = 'trendi.cart'
const WISHLIST_KEY = 'trendi.wishlist'

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable (private mode); the store still works in memory.
  }
}

export function StoreProvider({ children }) {
  const { user } = useAuth()

  // Cart lines: { productId, size, qty }. Product details are fetched from the API
  // so prices and stock are always current.
  const [cart, setCart] = useState(() => load(CART_KEY, []).filter((l) => /^[a-f\d]{24}$/i.test(l.productId)))
  const [products, setProducts] = useState({ key: null, byId: {} })

  // Guests keep their wishlist in the browser; signed-in users keep it on their account.
  const [guestWishlist, setGuestWishlist] = useState(() => load(WISHLIST_KEY, []))
  const [accountWishlist, setAccountWishlist] = useState({ userId: null, ids: [] })

  useEffect(() => save(CART_KEY, cart), [cart])
  useEffect(() => save(WISHLIST_KEY, guestWishlist), [guestWishlist])

  const idsKey = [...new Set(cart.map((l) => l.productId))].sort().join(',')

  useEffect(() => {
    if (!idsKey) return undefined
    const controller = new AbortController()
    api(`/api/products?ids=${idsKey}&limit=60`, { signal: controller.signal })
      .then(({ products: list }) =>
        setProducts({ key: idsKey, byId: Object.fromEntries(list.map((p) => [p._id, p])) }),
      )
      .catch(() => {})
    return () => controller.abort()
  }, [idsKey])

  // When someone signs in, move their guest wishlist onto the account.
  const userId = user?._id
  useEffect(() => {
    if (!userId) return
    const local = load(WISHLIST_KEY, [])
    const request = local.length
      ? api('/api/users/wishlist/merge', { method: 'POST', body: { ids: local } })
      : api('/api/users/wishlist')
    request
      .then(({ ids }) => {
        setAccountWishlist({ userId, ids })
        setGuestWishlist([])
      })
      .catch(() => {})
  }, [userId])

  const userWishlist = user?.wishlist
  const wishlist = useMemo(() => {
    if (!userId) return guestWishlist
    return accountWishlist.userId === userId ? accountWishlist.ids : (userWishlist ?? [])
  }, [userId, guestWishlist, accountWishlist, userWishlist])

  const toggleWishlist = useCallback(
    async (productId) => {
      const saved = wishlist.includes(productId)
      if (!userId) {
        setGuestWishlist((prev) => (saved ? prev.filter((id) => id !== productId) : [...prev, productId]))
        return
      }
      setAccountWishlist({ userId, ids: saved ? wishlist.filter((id) => id !== productId) : [...wishlist, productId] })
      try {
        const { ids } = await api(`/api/users/wishlist/${productId}`, { method: saved ? 'DELETE' : 'POST' })
        setAccountWishlist({ userId, ids })
      } catch {
        setAccountWishlist({ userId, ids: wishlist })
      }
    },
    [userId, wishlist],
  )

  const value = useMemo(() => {
    const cartLoading = Boolean(idsKey) && products.key !== idsKey
    const lines = cart
      .map((line) => ({ ...line, product: products.byId[line.productId] }))
      .filter((line) => line.product)
    const mrpTotal = lines.reduce((sum, l) => sum + l.product.mrp * l.qty, 0)
    const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0)

    return {
      lines,
      cartLoading,
      cartCount: cart.reduce((sum, l) => sum + l.qty, 0),
      mrpTotal,
      subtotal,
      discount: mrpTotal - subtotal,

      addToCart(productId, size, qty = 1) {
        setCart((prev) => {
          const existing = prev.find((l) => l.productId === productId && l.size === size)
          if (existing) {
            return prev.map((l) => (l === existing ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
          }
          return [...prev, { productId, size, qty: Math.min(MAX_QTY, qty) }]
        })
      },
      updateQty(productId, size, qty) {
        setCart((prev) =>
          qty <= 0
            ? prev.filter((l) => !(l.productId === productId && l.size === size))
            : prev.map((l) =>
                l.productId === productId && l.size === size ? { ...l, qty: Math.min(MAX_QTY, qty) } : l,
              ),
        )
      },
      removeFromCart(productId, size) {
        setCart((prev) => prev.filter((l) => !(l.productId === productId && l.size === size)))
      },
      clearCart() {
        setCart([])
      },

      wishlist,
      isWishlisted: (productId) => wishlist.includes(productId),
      toggleWishlist,
    }
  }, [cart, products, idsKey, wishlist, toggleWishlist])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
