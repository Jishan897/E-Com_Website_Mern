import { Link } from 'react-router-dom'
import { useStore } from '../context/store'
import { discountPercent, formatINR } from '../utils/format'
import { HeartIcon } from './Icons'
import ProductArt from './ProductArt'

export default function ProductCard({ product, className = '' }) {
  const { isWishlisted, toggleWishlist } = useStore()
  const off = discountPercent(product.price, product.mrp)
  const saved = isWishlisted(product._id)

  return (
    <article className={`group relative flex flex-col gap-2.5 ${className}`}>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[14px] bg-concrete">
        <div className="flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <ProductArt product={product} />
        </div>
        {product.instantShip && (
          <span className="absolute top-3 left-3 rounded bg-ink px-2 py-1 text-[11px] font-bold tracking-wider text-white">
            INSTANT SHIP
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleWishlist(product._id)}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
          className="absolute top-2 right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-white/70"
        >
          <HeartIcon filled={saved} width={20} height={20} />
        </button>
      </div>
      <div className="text-xs font-bold tracking-wider text-muted uppercase">{product.brand}</div>
      <h3 className="min-h-10 text-[15px] leading-snug font-medium">
        <Link to={`/product/${product.slug}`} className="after:absolute after:inset-0 hover:underline">
          {product.name}
        </Link>
      </h3>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-[17px] font-bold">{formatINR(product.price)}</span>
        {off > 0 && (
          <>
            <span className="text-[13px] text-muted line-through">{formatINR(product.mrp)}</span>
            <span className="text-[13px] font-bold text-sale">{off}% off</span>
          </>
        )}
      </div>
    </article>
  )
}
