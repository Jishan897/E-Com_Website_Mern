import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Accordion from '../components/Accordion'
import { CardIcon, ShieldIcon, TruckIcon } from '../components/Icons'
import ProductArt from '../components/ProductArt'
import ProductRow from '../components/ProductRow'
import { BRANDS, CATEGORIES, FAQS } from '../data/site'
import { useApi } from '../hooks/useApi'

const SLIDES = [
  {
    eyebrow: 'NEW DROP · THIS WEEK',
    title: ['FRESH PAIRS.', 'ZERO FAKES.'],
    body: 'Sneakers, streetwear and collectibles from the brands you chase — checked by hand and shipped across India.',
    cta: { to: '/shop?sort=newest', label: 'Shop new arrivals' },
  },
  {
    eyebrow: 'JORDAN · RESTOCKED',
    title: ['THE JORDAN', 'EDIT.'],
    body: 'Lows, mids and 4s in the colourways everyone is asking for.',
    cta: { to: '/shop/sneakers?brand=Jordan', label: 'Shop Jordan' },
  },
  {
    eyebrow: 'STREETWEAR',
    title: ['LAYER UP.', 'STAND OUT.'],
    body: 'Hoodies, tees and essentials to match your rotation.',
    cta: { to: '/shop/apparel', label: 'Shop apparel' },
  },
]

const WHY = [
  { Icon: ShieldIcon, title: 'Verified authentic', body: 'Every order goes through a multi-step authenticity check before it leaves our hands.' },
  { Icon: CardIcon, title: 'Secure payments & EMI', body: 'UPI, cards, net banking and no-cost EMI through a secure payment gateway.' },
  { Icon: TruckIcon, title: 'Fast, tracked delivery', body: 'Instant-ship pairs leave quickly, and you can track every order from your account.' },
]

const CATEGORY_STYLES = {
  sneakers: 'bg-ink text-white',
  apparel: 'bg-[#E9E7E1] text-ink',
  accessories: 'bg-[#E9E7E1] text-ink',
  collectibles: 'bg-ink text-white',
}

function Hero() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const slide = SLIDES[index]

  useEffect(() => {
    if (paused) return undefined
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000)
    return () => clearInterval(t)
  }, [paused])

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-page flex flex-wrap items-center gap-12 pt-14 pb-10 md:pt-18">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-6" aria-live="polite">
          <p className="text-[13px] font-bold tracking-[0.18em] text-volt">{slide.eyebrow}</p>
          <h1 className="font-display text-[clamp(44px,6vw,88px)] leading-[0.95]">
            {slide.title[0]}
            <br />
            {slide.title[1]}
          </h1>
          <p className="max-w-[460px] text-lg leading-relaxed text-soft">{slide.body}</p>
          <div className="flex flex-wrap gap-3">
            <Link to={slide.cta.to} className="rounded-full bg-volt px-7 py-4 text-[15px] font-bold text-ink hover:brightness-95">
              {slide.cta.label}
            </Link>
            <Link to="/shop" className="rounded-full border-[1.5px] border-white px-7 py-[15px] text-[15px] font-bold hover:bg-white hover:text-ink">
              Explore brands
            </Link>
          </div>
        </div>
        <div className="flex aspect-[4/3] min-w-0 flex-[1_1_520px] flex-col items-center justify-center gap-3 rounded-[20px] bg-[#1C1C1C]">
          <ProductArt product={{ category: 'sneakers' }} className="w-[55%]" stroke="#6E6E68" />
          <span className="text-[13px] tracking-widest text-[#8E8E88]">[HERO CAMPAIGN IMAGE]</span>
        </div>
      </div>
      <div className="flex justify-center gap-1 pb-6">
        {SLIDES.map((s, i) => (
          <button
            key={s.eyebrow}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className="flex h-11 items-center px-1"
          >
            <span className={`block h-1 rounded-full transition-all ${i === index ? 'w-8 bg-white' : 'w-4 bg-[#4A4A46]'}`} />
          </button>
        ))}
      </div>
    </section>
  )
}

function TagRow({ tag, title }) {
  const { data, loading } = useApi(`/api/products?tag=${tag}&limit=10`)
  return <ProductRow title={title} products={data?.products} loading={loading} viewAllTo={`/shop?tag=${tag}`} />
}

export default function Home() {
  return (
    <>
      <Hero />

      <section aria-label="Shop by brand" className="border-b border-line">
        <div className="container-page no-scrollbar flex gap-8 overflow-x-auto py-7 md:justify-between">
          {BRANDS.map((b) => (
            <Link
              key={b}
              to={`/shop?brand=${encodeURIComponent(b)}`}
              className="font-display text-xl tracking-wide whitespace-nowrap uppercase hover:text-muted"
            >
              {b}
            </Link>
          ))}
        </div>
      </section>

      <div className="pt-6">
        <TagRow tag="trending" title="Trending Now" />
      </div>

      <section className="container-page py-8 md:py-12">
        <h2 className="mb-6 font-display text-3xl md:text-4xl">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/shop/${c.slug}`}
              className={`group flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-2xl p-5 md:p-6 ${CATEGORY_STYLES[c.slug]}`}
            >
              <span className="text-xs tracking-widest opacity-80">[CATEGORY IMAGE]</span>
              <span className="flex flex-col gap-1.5">
                <span className="font-display text-2xl md:text-[28px]">{c.name}</span>
                <span className="text-sm font-bold group-hover:underline">Shop now →</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <TagRow tag="new" title="New Arrivals" />

      <section className="mt-6 bg-ink text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 py-14">
          <div className="flex flex-col gap-2.5">
            <p className="text-[13px] font-bold tracking-[0.18em] text-volt">LIMITED TIME</p>
            <h2 className="font-display text-[clamp(36px,5vw,64px)] leading-none">STEALS OF THE WEEK</h2>
            <p className="text-[17px] text-soft">Hand-picked pairs at their lowest price. Gone when they're gone.</p>
          </div>
          <Link to="/shop?tag=steal" className="rounded-full bg-volt px-7 py-4 text-[15px] font-bold text-ink hover:brightness-95">
            Shop the steals
          </Link>
        </div>
      </section>

      <TagRow tag="steal" title="Steals of the Week" />

      <section className="container-page py-12 md:py-16">
        <h2 className="mb-8 font-display text-3xl md:text-4xl">Why Trendi</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {WHY.map(({ Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3 rounded-2xl border border-line p-7">
              <Icon width={32} height={32} />
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-6 pt-4 pb-18">
        <h2 className="mb-6 text-center font-display text-3xl md:text-4xl">FAQ</h2>
        <Accordion size="lg" items={FAQS.map((f) => ({ title: f.q, body: f.a }))} />
      </section>
    </>
  )
}
