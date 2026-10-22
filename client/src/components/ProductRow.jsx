import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'

const CARD = 'w-[200px] shrink-0 snap-start sm:w-[248px]'

export function CardSkeleton({ className = '' }) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`} aria-hidden="true">
      <div className="aspect-square animate-pulse rounded-[14px] bg-concrete" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-concrete" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-concrete" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-concrete" />
    </div>
  )
}

// Horizontally scrolling product rail with a section heading.
export default function ProductRow({ title, products, loading, viewAllTo }) {
  if (!loading && !products?.length) return null

  return (
    <section className="container-page py-8 md:py-12" aria-busy={loading}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
        {viewAllTo && (
          <Link to={viewAllTo} className="border-b-[1.5px] border-ink pb-0.5 text-sm font-bold whitespace-nowrap">
            View all →
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-6 flex snap-x gap-5 overflow-x-auto px-6 pb-2">
        {loading
          ? Array.from({ length: 5 }, (_, i) => <CardSkeleton key={i} className={CARD} />)
          : products.map((p) => <ProductCard key={p._id} product={p} className={CARD} />)}
      </div>
    </section>
  )
}
