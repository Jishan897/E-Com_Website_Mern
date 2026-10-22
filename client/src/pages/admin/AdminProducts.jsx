import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductArt from '../../components/ProductArt'
import { CATEGORIES } from '../../data/site'
import { useApi } from '../../hooks/useApi'
import { api, toQuery } from '../../lib/api'
import { formatINR } from '../../utils/format'

export default function AdminProducts() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const { data, loading, error, reload } = useApi(`/api/admin/products${toQuery({ q, category, page, limit: 20 })}`)
  const [search, setSearch] = useState(q)
  const [actionError, setActionError] = useState('')

  const update = (changes) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    if (!('page' in changes)) next.delete('page')
    setParams(next)
  }

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone. Tip: untick "Visible in store" to hide it instead.`)) return
    setActionError('')
    try {
      await api(`/api/admin/products/${p._id}`, { method: 'DELETE' })
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const toggleActive = async (p) => {
    setActionError('')
    try {
      await api(`/api/admin/products/${p._id}`, { method: 'PUT', body: { isActive: !p.isActive } })
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const products = data?.products ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            update({ q: search.trim() })
          }}
          className="flex flex-1 gap-2"
        >
          <label htmlFor="admin-search" className="sr-only">Search products</label>
          <input
            id="admin-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, brand or slug"
            className="min-h-11 min-w-0 flex-1 rounded-[10px] border border-field px-4"
          />
          <button type="submit" className="min-h-11 rounded-[10px] border-[1.5px] border-ink px-4 font-bold">Search</button>
        </form>
        <label htmlFor="admin-cat" className="sr-only">Category</label>
        <select
          id="admin-cat"
          value={category}
          onChange={(e) => update({ category: e.target.value })}
          className="min-h-11 rounded-[10px] border border-field bg-white px-3"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <Link to="/admin/products/new" className="flex min-h-11 items-center rounded-full bg-ink px-5 font-bold text-white">
          + Add product
        </Link>
      </div>

      {(error || actionError) && <p role="alert" className="text-sale">{actionError || error.message}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-concrete text-xs tracking-wider text-muted uppercase">
            <tr>
              <th scope="col" className="p-3">Product</th>
              <th scope="col" className="p-3">Category</th>
              <th scope="col" className="p-3">Price</th>
              <th scope="col" className="p-3">Stock</th>
              <th scope="col" className="p-3">Visible</th>
              <th scope="col" className="p-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {products.map((p) => {
              const stock = p.sizes.reduce((n, s) => n + s.stock, 0)
              return (
                <tr key={p._id} className="border-t border-line">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-concrete">
                        <ProductArt product={p} className="w-[80%]" />
                      </span>
                      <span className="flex flex-col">
                        <span className="font-bold">{p.name}</span>
                        <span className="text-muted">{p.brand}</span>
                      </span>
                    </div>
                  </td>
                  <td className="p-3 capitalize">{p.category}</td>
                  <td className="p-3">
                    <span className="font-bold">{formatINR(p.price)}</span>
                    {p.mrp > p.price && <span className="ml-1 text-muted line-through">{formatINR(p.mrp)}</span>}
                  </td>
                  <td className={`p-3 ${stock === 0 ? 'font-bold text-sale' : ''}`}>{stock === 0 ? 'Sold out' : stock}</td>
                  <td className="p-3">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={p.isActive} onChange={() => toggleActive(p)} className="h-[18px] w-[18px] accent-ink" />
                      <span className="sr-only">Visible in store</span>
                      {p.isActive ? 'Live' : 'Hidden'}
                    </label>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/products/${p._id}`} className="rounded-full border border-field px-4 py-2 font-bold hover:border-ink">
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(p)}
                        className="rounded-full border border-field px-4 py-2 font-bold text-sale hover:border-sale"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!loading && !products.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.pages > 1 && (
        <nav aria-label="Pagination" className="flex justify-center gap-2">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === page ? 'page' : undefined}
              onClick={() => update({ page: n === 1 ? '' : String(n) })}
              className={`h-11 w-11 rounded-[10px] font-medium ${n === page ? 'bg-ink text-white' : 'border border-field'}`}
            >
              {n}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
