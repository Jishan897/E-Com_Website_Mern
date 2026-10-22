import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { FilterIcon } from '../components/Icons'
import ProductCard from '../components/ProductCard'
import { CardSkeleton } from '../components/ProductRow'
import { CATEGORIES } from '../data/site'
import { useApi } from '../hooks/useApi'
import { toQuery } from '../lib/api'
import NotFound from './NotFound'

const PAGE_SIZE = 12

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
]

const TAG_TITLES = { trending: 'Trending Now', new: 'New Arrivals', steal: 'Steals of the Week' }

export default function Shop() {
  const { category } = useParams()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const q = params.get('q') ?? ''
  const tag = params.get('tag')
  const sort = params.get('sort') ?? 'featured'
  const brands = params.getAll('brand')
  const size = params.get('size')
  const instant = params.get('instant') === '1'
  const page = Math.max(1, Number(params.get('page')) || 1)

  const categoryInfo = CATEGORIES.find((c) => c.slug === category)

  const path = `/api/products${toQuery({
    category,
    q,
    tag,
    sort,
    brand: brands,
    size,
    instant: instant ? '1' : null,
    min: params.get('min'),
    max: params.get('max'),
    page,
    limit: PAGE_SIZE,
  })}`
  const { data, loading, error, reload } = useApi(category && !categoryInfo ? null : path)

  if (category && !categoryInfo) return <NotFound />

  const products = data?.products ?? []
  const total = data?.total ?? 0
  const pageCount = data?.pages ?? 1
  const brandOptions = data?.facets.brands ?? []
  const sizeOptions = data?.facets.sizes ?? []

  const update = (changes) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => {
      next.delete(key)
      if (Array.isArray(value)) value.forEach((v) => next.append(key, v))
      else if (value !== null && value !== undefined && value !== '') next.set(key, value)
    })
    if (!('page' in changes)) next.delete('page')
    setParams(next)
  }

  const toggleBrand = (b) =>
    update({ brand: brands.includes(b) ? brands.filter((x) => x !== b) : [...brands, b] })

  const title = q ? `Results for "${q}"` : tag ? TAG_TITLES[tag] : categoryInfo?.name ?? 'All Products'
  const hasFilters = brands.length || size || instant || params.get('min') || params.get('max')
  const firstLoad = loading && !data

  return (
    <div className="container-page pt-6 pb-18">
      <nav aria-label="Breadcrumb" className="flex gap-2 text-[13px] text-muted">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true">/</span>
        {categoryInfo ? (
          <>
            <Link to="/shop" className="hover:text-ink">Shop</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink">{categoryInfo.name}</span>
          </>
        ) : (
          <span className="text-ink">Shop</span>
        )}
      </nav>

      <div className="mt-4 mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-none uppercase md:text-5xl">{title}</h1>
          <p className="mt-2 text-[15px] text-muted" aria-live="polite">
            {firstLoad ? 'Loading…' : `${total} ${total === 1 ? 'product' : 'products'}`}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="filters"
            className="flex min-h-11 items-center gap-2 rounded-[10px] border border-field px-4 text-[15px] font-medium lg:hidden"
          >
            <FilterIcon width={18} height={18} /> Filters
          </button>
          <label htmlFor="sort" className="hidden text-sm text-muted sm:block">Sort by</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => update({ sort: e.target.value === 'featured' ? null : e.target.value })}
            className="min-h-11 rounded-[10px] border border-field bg-white px-3.5 text-[15px]"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside
          id="filters"
          aria-label="Filters"
          className={`${filtersOpen ? 'flex' : 'hidden'} flex-col gap-7 lg:sticky lg:top-24 lg:flex lg:w-[260px] lg:shrink-0`}
        >
          {!category && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[15px] font-bold tracking-wider">CATEGORY</legend>
              {CATEGORIES.map((c) => (
                <Link key={c.slug} to={`/shop/${c.slug}`} className="py-1 text-[15px] hover:underline">
                  {c.name}
                </Link>
              ))}
            </fieldset>
          )}

          {brandOptions.length > 0 && (
            <fieldset className="flex flex-col gap-1">
              <legend className="mb-2 text-[15px] font-bold tracking-wider">BRAND</legend>
              {brandOptions.map(({ name, count }) => (
                <label key={name} className="flex min-h-9 cursor-pointer items-center gap-2.5 text-[15px]">
                  <input
                    type="checkbox"
                    checked={brands.includes(name)}
                    onChange={() => toggleBrand(name)}
                    className="h-[18px] w-[18px] accent-ink"
                  />
                  {name}
                  <span className="ml-auto text-[13px] text-muted">{count}</span>
                </label>
              ))}
            </fieldset>
          )}

          {sizeOptions.length > 0 && (
            <fieldset>
              <legend className="mb-3 text-[15px] font-bold tracking-wider">
                SIZE{category === 'sneakers' || !category ? ' (UK)' : ''}
              </legend>
              <div className="grid grid-cols-4 gap-2">
                {sizeOptions.map((s) => {
                  const on = size === s
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => update({ size: on ? null : s })}
                      className={`min-h-11 rounded-[10px] border text-sm font-medium ${
                        on ? 'border-ink bg-ink text-white' : 'border-field bg-white hover:border-ink'
                      }`}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}

          {/* key remounts the uncontrolled inputs when filters are cleared */}
          <fieldset key={`${params.get('min')}-${params.get('max')}`}>
            <legend className="mb-3 text-[15px] font-bold tracking-wider">PRICE (₹)</legend>
            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
                Min
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="0"
                  defaultValue={params.get('min') ?? ''}
                  onBlur={(e) => update({ min: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && update({ min: e.currentTarget.value })}
                  className="min-h-11 w-full rounded-[10px] border border-field px-3 text-[15px] text-ink"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
                Max
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="Any"
                  defaultValue={params.get('max') ?? ''}
                  onBlur={(e) => update({ max: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && update({ max: e.currentTarget.value })}
                  className="min-h-11 w-full rounded-[10px] border border-field px-3 text-[15px] text-ink"
                />
              </label>
            </div>
          </fieldset>

          <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-[15px]">
            <input
              type="checkbox"
              checked={instant}
              onChange={() => update({ instant: instant ? null : '1' })}
              className="h-[18px] w-[18px] accent-ink"
            />
            Instant ship only
          </label>

          {hasFilters ? (
            <button
              type="button"
              onClick={() => update({ brand: [], size: null, instant: null, min: null, max: null })}
              className="min-h-12 rounded-full border-[1.5px] border-ink font-bold hover:bg-ink hover:text-white"
            >
              Clear filters
            </button>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-10" aria-busy={loading}>
          {error ? (
            <div className="rounded-2xl bg-concrete p-10 text-center">
              <p className="text-lg font-bold">Couldn't load products.</p>
              <p className="mt-2 text-muted">{error.message}</p>
              <button type="button" onClick={reload} className="mt-6 rounded-full bg-ink px-6 py-3 font-bold text-white">
                Try again
              </button>
            </div>
          ) : firstLoad ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : products.length ? (
            <div
              className={`grid grid-cols-2 gap-x-4 gap-y-8 transition-opacity sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4 ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-concrete p-10 text-center">
              <p className="text-lg font-bold">Nothing matches those filters.</p>
              <p className="mt-2 text-muted">Try removing a filter or searching for something else.</p>
              <Link to="/shop" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-bold text-white">
                View all products
              </Link>
            </div>
          )}

          {pageCount > 1 && (
            <nav aria-label="Pagination" className="flex justify-center gap-2">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-current={n === page ? 'page' : undefined}
                  onClick={() => {
                    update({ page: n === 1 ? null : String(n) })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`h-11 w-11 rounded-[10px] font-medium ${
                    n === page ? 'bg-ink font-bold text-white' : 'border border-field hover:border-ink'
                  }`}
                >
                  {n}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
