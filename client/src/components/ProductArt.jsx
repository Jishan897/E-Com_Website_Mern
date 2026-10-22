import { assetUrl } from '../lib/api'

// Shows the product's photo (or the given image), or an outline drawing
// when the product has no photos yet.
export default function ProductArt({ product, image, className = 'w-[70%]', stroke = '#A3A39C' }) {
  const src = image ?? product.images?.[0]
  if (src) {
    return (
      <img
        src={assetUrl(src)}
        alt={product.name}
        className="h-full w-full object-contain"
        loading="lazy"
      />
    )
  }

  const common = { fill: 'none', stroke, strokeWidth: 1.6, strokeLinejoin: 'round', 'aria-hidden': true }

  if (product.category === 'apparel') {
    return (
      <svg viewBox="0 0 120 100" className={`${className} max-w-[60%]`} {...common}>
        <path d="M42 12 L20 24 L8 46 L24 54 L30 44 V92 H90 V44 L96 54 L112 46 L100 24 L78 12 Q60 26 42 12 Z" />
      </svg>
    )
  }

  if (product.category === 'accessories' || product.category === 'collectibles') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} max-w-[45%]`} {...common}>
        <path d="M50 10 L88 30 V72 L50 92 L12 72 V30 Z" />
        <path d="M12 30 L50 50 L88 30 M50 50 V92" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 120 60" className={className} {...common}>
      <path d="M8 50V31q0-7 7-7h18q6 0 11 5l9 7q6 4 16 4l28 2q15 1 15 8v1z" />
      <path d="M8 50h104" />
      <path d="M30 24l4 9M38 26l4 8M46 31l3 6" />
    </svg>
  )
}
