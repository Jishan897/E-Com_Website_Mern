import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageLoading } from '../../components/RequireAuth'
import { CATEGORIES } from '../../data/site'
import { useApi } from '../../hooks/useApi'
import { api, assetUrl } from '../../lib/api'

const SIZE_PRESETS = {
  'UK 6–12': ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '11', '12'],
  'XS–XL': ['XS', 'S', 'M', 'L', 'XL'],
  'One size': ['One size'],
}

const TAGS = [
  { value: 'trending', label: 'Trending Now' },
  { value: 'new', label: 'New Arrivals' },
  { value: 'steal', label: 'Steals of the Week' },
]

const BLANK = {
  name: '', brand: '', category: 'sneakers', slug: '', description: '',
  price: '', mrp: '', images: [], sizes: [], tags: [], instantShip: false, isActive: true,
}

const input = 'min-h-11 w-full rounded-[10px] border border-field bg-white px-3.5 text-[15px] font-normal'

export default function AdminProductForm() {
  const { id } = useParams()
  const isNew = !id
  const { data, error } = useApi(isNew ? null : `/api/admin/products/${id}`)

  if (error) return <p role="alert" className="text-sale">{error.message}</p>
  if (!isNew && data?.product._id !== id) return <PageLoading />

  // key makes the form start fresh for each product
  return <ProductForm key={id ?? 'new'} initial={isNew ? BLANK : toForm(data.product)} isNew={isNew} />
}

const toForm = (p) => ({
  ...BLANK,
  ...p,
  price: String(p.price),
  mrp: String(p.mrp),
  sizes: p.sizes.map((s) => ({ label: s.label, stock: String(s.stock) })),
})

function ProductForm({ initial, isNew }) {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState(initial)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  // ---- images ----
  const uploadFiles = async (files) => {
    if (!files?.length) return
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      ;[...files].forEach((f) => fd.append('images', f))
      const { urls } = await api('/api/admin/uploads', { method: 'POST', form: fd })
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const addImageUrl = () => {
    const url = imageUrl.trim()
    if (!/^https?:\/\//i.test(url)) {
      setError('Image links must start with http:// or https://')
      return
    }
    setForm((f) => ({ ...f, images: [...f.images, url] }))
    setImageUrl('')
    setError('')
  }

  const moveImage = (i, dir) =>
    setForm((f) => {
      const images = [...f.images]
      const j = i + dir
      if (j < 0 || j >= images.length) return f
      ;[images[i], images[j]] = [images[j], images[i]]
      return { ...f, images }
    })

  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, k) => k !== i) }))

  // ---- sizes ----
  const setSize = (i, key, value) =>
    setForm((f) => ({ ...f, sizes: f.sizes.map((s, k) => (k === i ? { ...s, [key]: value } : s)) }))
  const addSize = () => setForm((f) => ({ ...f, sizes: [...f.sizes, { label: '', stock: '0' }] }))
  const removeSize = (i) => setForm((f) => ({ ...f, sizes: f.sizes.filter((_, k) => k !== i) }))
  const applyPreset = (labels) =>
    setForm((f) => ({
      ...f,
      sizes: labels.map((label) => f.sizes.find((s) => s.label === label) ?? { label, stock: '0' }),
    }))

  const toggleTag = (tag) =>
    setForm((f) => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag] }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaved('')
    if (Number(form.mrp) < Number(form.price)) {
      setError('MRP must be the same as or higher than the selling price.')
      return
    }
    setSaving(true)
    const body = {
      ...form,
      price: Number(form.price),
      mrp: Number(form.mrp),
      sizes: form.sizes.map((s) => ({ label: s.label.trim(), stock: Number(s.stock) || 0 })).filter((s) => s.label),
    }
    try {
      if (isNew) {
        await api('/api/admin/products', { method: 'POST', body })
        navigate('/admin/products', { replace: true })
      } else {
        const { product } = await api(`/api/admin/products/${form._id}`, { method: 'PUT', body })
        setForm(toForm(product))
        setSaved('Saved.')
        setSaving(false)
      }
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin/products" className="text-sm font-bold hover:underline">← Products</Link>
          <h2 className="mt-2 text-2xl font-bold">{isNew ? 'Add product' : `Edit: ${initial.name}`}</h2>
        </div>
        {!isNew && form.isActive && (
          <Link to={`/product/${form.slug}`} className="text-sm font-bold underline" target="_blank">
            View in store ↗
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <fieldset className="flex flex-col gap-4 rounded-2xl border border-line p-5 md:p-6">
            <legend className="px-1 text-lg font-bold">Details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Name
                <input required value={form.name} onChange={set('name')} className={input} placeholder='Dunk Low "Panda"' />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Brand
                <input required value={form.brand} onChange={set('brand')} className={input} placeholder="Nike" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Category
                <select value={form.category} onChange={set('category')} className={input}>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                URL slug <span className="font-normal text-muted">(leave empty to create from the name)</span>
                <input value={form.slug} onChange={set('slug')} className={input} placeholder="nike-dunk-low-panda" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Selling price (₹)
                <input required type="number" min="0" step="1" value={form.price} onChange={set('price')} className={input} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                MRP (₹)
                <input required type="number" min="0" step="1" value={form.mrp} onChange={set('mrp')} className={input} />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              Description
              <textarea rows={4} value={form.description} onChange={set('description')} className={`${input} py-3`} />
            </label>
          </fieldset>

          <fieldset className="flex flex-col gap-4 rounded-2xl border border-line p-5 md:p-6">
            <legend className="px-1 text-lg font-bold">Images</legend>
            <p className="-mt-2 text-sm text-muted">The first image is the cover shown on product cards. JPG, PNG, WEBP or AVIF, up to 5 MB each.</p>
            {form.images.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {form.images.map((url, i) => (
                  <li key={`${url}-${i}`} className="flex flex-col gap-2 rounded-xl border border-line p-2">
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-concrete">
                      <img src={assetUrl(url)} alt={`Product image ${i + 1}`} className="h-full w-full object-contain" />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">COVER</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label={`Move image ${i + 1} left`} className="h-9 flex-1 rounded-lg border border-field disabled:opacity-30">←</button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} aria-label={`Move image ${i + 1} right`} className="h-9 flex-1 rounded-lg border border-field disabled:opacity-30">→</button>
                      <button type="button" onClick={() => removeImage(i)} aria-label={`Remove image ${i + 1}`} className="h-9 flex-1 rounded-lg border border-field text-sale">✕</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex flex-1 flex-col gap-1.5 text-sm font-bold">
                Upload from computer
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  disabled={uploading}
                  onChange={(e) => uploadFiles(e.target.files)}
                  className="text-sm font-normal file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-5 file:font-bold file:text-white"
                />
              </label>
              {uploading && <span className="text-sm text-muted" role="status">Uploading…</span>}
            </div>
            <div className="flex gap-2">
              <label htmlFor="image-url" className="sr-only">Image link</label>
              <input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addImageUrl()
                  }
                }}
                placeholder="…or paste an image link (https://…)"
                className={`${input} flex-1`}
              />
              <button type="button" onClick={addImageUrl} className="min-h-11 rounded-[10px] border-[1.5px] border-ink px-4 font-bold">
                Add link
              </button>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4 rounded-2xl border border-line p-5 md:p-6">
            <legend className="px-1 text-lg font-bold">Sizes &amp; stock</legend>
            <div className="-mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Quick fill:</span>
              {Object.entries(SIZE_PRESETS).map(([name, labels]) => (
                <button key={name} type="button" onClick={() => applyPreset(labels)} className="rounded-full border border-field px-3 py-1.5 font-bold hover:border-ink">
                  {name}
                </button>
              ))}
            </div>
            {form.sizes.length > 0 && (
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-sm">
                <span className="font-bold text-muted">Size</span>
                <span className="font-bold text-muted">Stock</span>
                <span />
                {form.sizes.map((s, i) => (
                  <div key={i} className="contents">
                    <input aria-label={`Size ${i + 1} label`} value={s.label} onChange={(e) => setSize(i, 'label', e.target.value)} className={input} />
                    <input aria-label={`Size ${s.label || i + 1} stock`} type="number" min="0" value={s.stock} onChange={(e) => setSize(i, 'stock', e.target.value)} className={input} />
                    <button type="button" onClick={() => removeSize(i)} aria-label={`Remove size ${s.label || i + 1}`} className="h-11 w-11 rounded-[10px] border border-field text-sale">✕</button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={addSize} className="self-start rounded-full border-[1.5px] border-ink px-4 py-2 text-sm font-bold">
              + Add size
            </button>
          </fieldset>
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl bg-concrete p-5 md:p-6 lg:sticky lg:top-24 lg:w-[320px]">
          <h3 className="text-lg font-bold">Visibility</h3>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="h-[18px] w-[18px] accent-ink" />
            Visible in store
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={form.instantShip} onChange={set('instantShip')} className="h-[18px] w-[18px] accent-ink" />
            Instant ship badge
          </label>
          <h3 className="mt-2 text-lg font-bold">Home page sections</h3>
          {TAGS.map((t) => (
            <label key={t.value} className="flex cursor-pointer items-center gap-2.5">
              <input type="checkbox" checked={form.tags.includes(t.value)} onChange={() => toggleTag(t.value)} className="h-[18px] w-[18px] accent-ink" />
              {t.label}
            </label>
          ))}
          {error && <p role="alert" className="rounded-[10px] bg-[#FBEAE9] px-4 py-3 text-sm font-medium text-sale">{error}</p>}
          {saved && <p role="status" className="text-sm font-bold text-ok">{saved}</p>}
          <button
            type="submit"
            disabled={saving || uploading}
            className="mt-2 min-h-12 rounded-full bg-ink font-bold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
          </button>
        </aside>
      </div>
    </form>
  )
}
