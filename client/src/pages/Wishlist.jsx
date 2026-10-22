import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { CardSkeleton } from '../components/ProductRow'
import { useStore } from '../context/store'
import { useApi } from '../hooks/useApi'

export default function Wishlist() {
  const { wishlist } = useStore()
  const ids = [...wishlist].sort().join(',')
  const { data, loading } = useApi(ids ? `/api/products?ids=${ids}&limit=60` : null)
  // Keep the user's saved order and hide items they just removed.
  const byId = Object.fromEntries((data?.products ?? []).map((p) => [p._id, p]))
  const items = wishlist.map((id) => byId[id]).filter(Boolean)

  return (
    <section className="container-page pt-10 pb-20">
      <h1 className="mb-8 font-display text-4xl md:text-5xl">WISHLIST</h1>
      {loading && !items.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: Math.min(wishlist.length, 8) }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : items.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-concrete p-10 text-center">
          <p className="text-lg font-bold">No saved items yet.</p>
          <p className="mt-2 text-muted">Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-bold text-white">
            Browse products
          </Link>
        </div>
      )}
    </section>
  )
}
