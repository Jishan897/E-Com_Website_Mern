import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Accordion from '../components/Accordion'
import { HeartIcon, ReturnIcon, ShieldIcon, TruckIcon } from '../components/Icons'
import ProductArt from '../components/ProductArt'
import ProductRow from '../components/ProductRow'
import { PageLoading } from '../components/RequireAuth'
import { useStore } from '../context/store'
import { CATEGORIES } from '../data/site'
import { useApi } from '../hooks/useApi'
import { discountPercent, formatINR } from '../utils/format'
import NotFound from './NotFound'

export default function ProductDetail() {
  const { slug } = useParams()
  const { data, loading, error, reload } = useApi(`/api/products/${encodeURIComponent(slug)}`)

  if (error?.status === 404) return <NotFound />
  if (error) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-lg font-bold">Couldn't load this product.</p>
        <button type="button" onClick={reload} className="mt-6 rounded-full bg-ink px-6 py-3 font-bold text-white">
          Try again
        </button>
      </div>
    )
  }
  if (loading || data?.product.slug !== slug) return <PageLoading />
  // key resets size/photo state when navigating between products
  return <ProductView key={data.product._id} product={data.product} related={data.related} />
}

function ProductView({ product, related }) {
  const navigate = useNavigate()
  const { addToCart, isWishlisted, toggleWishlist } = useStore()
  const oneSize = product.sizes.length === 1
  const soldOut = product.sizes.length === 0 || product.sizes.every((s) => !s.inStock)
  const [size, setSize] = useState(oneSize && !soldOut ? product.sizes[0].label : null)
  const [view, setView] = useState(0)
  const [message, setMessage] = useState(null)

  const off = discountPercent(product.price, product.mrp)
  const category = CATEGORIES.find((c) => c.slug === product.category)
  const saved = isWishlisted(product._id)
  const isSneaker = product.category === 'sneakers'
  const images = product.images ?? []

  const add = (thenCheckout) => {
    if (!size) {
      setMessage({ tone: 'error', text: 'Pick a size first.' })
      return
    }
    addToCart(product._id, size)
    if (thenCheckout) {
      navigate('/cart')
    } else {
      setMessage({ tone: 'ok', text: `Added to bag — size ${size}.` })
    }
  }

  return (
    <>
      <div className="container-page pt-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-[13px] text-muted">
          <Link to="/" className="hover:text-ink">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/shop/${product.category}`} className="hover:text-ink">{category?.name}</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      <section className="container-page flex flex-col gap-10 pt-6 pb-12 lg:flex-row lg:items-start lg:gap-12">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-[1_1_55%]">
          <div className="relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] bg-concrete">
            <ProductArt product={product} image={images[view]} />
            {product.instantShip && (
              <span className="absolute top-4 left-4 rounded bg-ink px-2.5 py-1.5 text-xs font-bold tracking-wider text-white">
                INSTANT SHIP
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  aria-label={`Show photo ${i + 1}`}
                  aria-pressed={view === i}
                  onClick={() => setView(i)}
                  className={`flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 bg-concrete ${
                    view === i ? 'border-ink' : 'border-transparent hover:border-field'
                  }`}
                >
                  <ProductArt product={product} image={img} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:flex-[1_1_45%]">
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold tracking-widest text-muted uppercase">{product.brand}</span>
            <h1 className="font-display text-3xl leading-tight md:text-[40px]">{product.name}</h1>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold">{formatINR(product.price)}</span>
              {off > 0 && (
                <>
                  <span className="text-[17px] text-muted line-through">{formatINR(product.mrp)}</span>
                  <span className="text-[15px] font-bold text-sale">{off}% off</span>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-muted">Inclusive of all taxes · No-cost EMI available</p>
          </div>

          {!oneSize && !soldOut && (
            <fieldset className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <legend className="text-[15px] font-bold">
                  Select size{isSneaker ? ' (UK)' : ''}
                  {size && <span className="font-medium text-muted"> · {size}</span>}
                </legend>
                <Link to="/help/size-guide" className="text-sm font-medium underline">Size guide</Link>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((s) => {
                  const on = size === s.label
                  return (
                    <button
                      key={s.label}
                      type="button"
                      disabled={!s.inStock}
                      aria-pressed={on}
                      aria-label={s.inStock ? `Size ${s.label}` : `Size ${s.label}, sold out`}
                      onClick={() => {
                        setSize(s.label)
                        setMessage(null)
                      }}
                      className={`min-h-[52px] rounded-[10px] border-[1.5px] text-[15px] font-medium ${
                        on
                          ? 'border-ink bg-ink text-white'
                          : s.inStock
                            ? 'border-field bg-white hover:border-ink'
                            : 'cursor-not-allowed border-field bg-concrete text-[#8A8A84] line-through'
                      }`}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}

          <div className="flex flex-wrap gap-3">
            {soldOut ? (
              <button
                type="button"
                disabled
                className="min-h-14 flex-[1_1_180px] cursor-not-allowed rounded-full bg-concrete text-base font-bold text-muted"
              >
                Sold out
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => add(false)}
                  className="min-h-14 flex-[1_1_180px] rounded-full bg-ink text-base font-bold text-white hover:bg-[#2A2A28]"
                >
                  Add to bag
                </button>
                <button
                  type="button"
                  onClick={() => add(true)}
                  className="min-h-14 flex-[1_1_180px] rounded-full bg-volt text-base font-bold text-ink hover:brightness-95"
                >
                  Buy now
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => toggleWishlist(product._id)}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              className="flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-field hover:border-ink"
            >
              <HeartIcon filled={saved} />
            </button>
          </div>
          {message && (
            <p role="status" className={`-mt-2 text-sm font-medium ${message.tone === 'error' ? 'text-sale' : 'text-ok'}`}>
              {message.text}{' '}
              {message.tone === 'ok' && <Link to="/cart" className="underline">View bag</Link>}
            </p>
          )}

          <div className="grid grid-cols-3 gap-2 rounded-[14px] bg-concrete p-4">
            {[
              { Icon: ShieldIcon, text: '100% authentic' },
              { Icon: TruckIcon, text: product.instantShip ? 'Instant ship' : 'Tracked delivery' },
              { Icon: ReturnIcon, text: 'Easy returns' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 text-center text-[13px] font-medium">
                <Icon width={24} height={24} />
                {text}
              </div>
            ))}
          </div>

          <Accordion
            items={[
              { title: 'Description', body: product.description || 'No description yet.' },
              { title: 'Authenticity', body: 'This item is inspected by the Trendi team before dispatch and ships with a verification tag.' },
              { title: 'Shipping & returns', body: '[Add your shipping and return policy here.]' },
            ]}
          />
        </div>
      </section>

      <ProductRow title="You may also like" products={related} />
      <div className="pb-10" />
    </>
  )
}
