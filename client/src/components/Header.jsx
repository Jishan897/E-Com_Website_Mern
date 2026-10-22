import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { useStore } from '../context/store'
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons'

const NAV = [
  { to: '/shop/sneakers', label: 'Sneakers' },
  { to: '/shop/apparel', label: 'Apparel' },
  { to: '/shop/accessories', label: 'Accessories' },
  { to: '/shop/collectibles', label: 'Collectibles' },
  { to: '/shop', label: 'Brands', end: true },
  { to: '/shop?sort=discount', label: 'Sale', accent: true },
]

const iconBtn = 'flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10'

export default function Header() {
  const { cartCount, wishlist } = useStore()
  const { user, isAdmin } = useAuth()
  const accountTo = user ? '/account' : '/login'
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Overlays remember which location they were opened on, so any
  // navigation closes them without an effect.
  const [menuAt, setMenuAt] = useState(null)
  const [searchAt, setSearchAt] = useState(null)
  const menuOpen = menuAt === location.key
  const searchOpen = searchAt === location.key
  const setMenuOpen = (open) => setMenuAt(open ? location.key : null)
  const setSearchOpen = (open) => setSearchAt(open ? location.key : null)

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const submitSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
  }

  return (
    <>
      <div className="bg-volt px-4 py-2.5 text-center text-[13px] font-bold tracking-wide text-ink">
        100% AUTHENTIC · EVERY PAIR VERIFIED BEFORE IT SHIPS
      </div>

      <header className="sticky top-0 z-40 bg-ink text-white">
        <div className="container-page flex items-center justify-between gap-4 py-3.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`${iconBtn} lg:hidden`}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </button>
            <Link to="/" className="font-display text-[26px] tracking-wide text-white sm:text-[30px]">
              TRENDI
            </Link>
          </div>

          <nav aria-label="Primary" className="hidden gap-7 text-[15px] font-medium lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `py-2 hover:text-volt ${item.accent || (isActive && !item.end) ? 'text-volt' : 'text-white'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className={iconBtn}
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <SearchIcon />
            </button>
            <Link to="/wishlist" className={`${iconBtn} relative hidden sm:flex`} aria-label={`Wishlist, ${wishlist.length} items`}>
              <HeartIcon />
            </Link>
            {isAdmin && (
              <Link to="/admin" className="mr-1 hidden rounded-full border border-white/30 px-3 py-1.5 text-xs font-bold tracking-wider hover:border-volt hover:text-volt sm:block">
                ADMIN
              </Link>
            )}
            <Link to={accountTo} className={`${iconBtn} hidden sm:flex`} aria-label={user ? 'My account' : 'Sign in'}>
              <UserIcon />
            </Link>
            <Link to="/cart" className={`${iconBtn} relative`} aria-label={`Bag, ${cartCount} items`}>
              <BagIcon />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-volt px-1 text-[11px] font-bold text-ink">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-white/10 bg-ink">
            <form role="search" onSubmit={submitSearch} className="container-page flex gap-2 py-4">
              <label htmlFor="site-search" className="sr-only">Search products</label>
              <input
                id="site-search"
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                placeholder="Search sneakers, brands, apparel…"
                className="min-h-12 flex-1 rounded-full border border-white/25 bg-[#1C1C1C] px-5 text-[15px] text-white placeholder:text-soft"
              />
              <button type="submit" className="min-h-12 rounded-full bg-volt px-6 font-bold text-ink">
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(320px,85vw)] flex-col bg-ink p-6 text-white">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-2xl">TRENDI</span>
              <button type="button" className={iconBtn} aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`border-b border-white/10 py-4 text-lg font-medium ${item.accent ? 'text-volt' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/wishlist" className="border-b border-white/10 py-4 text-lg font-medium">Wishlist</Link>
              {isAdmin && (
                <Link to="/admin" className="border-b border-white/10 py-4 text-lg font-medium text-volt">Admin panel</Link>
              )}
              <Link to={accountTo} className="py-4 text-lg font-medium">{user ? 'My account' : 'Sign in'}</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
