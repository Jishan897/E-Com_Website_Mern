import { useState } from 'react'
import { Link } from 'react-router-dom'

const YEAR = new Date().getFullYear()

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { to: '/shop/sneakers', label: 'Sneakers' },
      { to: '/shop/apparel', label: 'Apparel' },
      { to: '/shop/accessories', label: 'Accessories' },
      { to: '/shop/collectibles', label: 'Collectibles' },
    ],
  },
  {
    title: 'Help',
    links: [
      { to: '/account', label: 'Track order' },
      { to: '/help/returns', label: 'Returns' },
      { to: '/help/size-guide', label: 'Size guide' },
      { to: '/help/contact', label: 'Contact us' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/authenticity', label: 'Authenticity' },
      { to: '/privacy', label: 'Privacy' },
      { to: '/terms', label: 'Terms' },
    ],
  },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const onSubscribe = (e) => {
    e.preventDefault()
    // TODO: POST /api/newsletter once the backend is ready.
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="bg-ink text-soft">
      <div className="container-page flex flex-wrap justify-between gap-12 pt-16 pb-8">
        <div className="flex max-w-[420px] flex-[1_1_320px] flex-col gap-4">
          <span className="font-display text-[32px] text-white">TRENDI</span>
          <p className="text-[15px] leading-relaxed">Get first word on drops and restocks.</p>
          {subscribed ? (
            <p role="status" className="text-[15px] font-bold text-volt">You're on the list.</p>
          ) : (
            <form onSubmit={onSubscribe} className="flex flex-wrap gap-2">
              <label htmlFor="news-email" className="sr-only">Email address</label>
              <input
                id="news-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="min-h-12 flex-[1_1_200px] rounded-full border border-[#4A4A46] bg-[#1C1C1C] px-4 text-[15px] text-white placeholder:text-soft"
              />
              <button type="submit" className="min-h-12 rounded-full bg-volt px-6 font-bold text-ink">
                Subscribe
              </button>
            </form>
          )}
        </div>
        <div className="flex flex-wrap gap-12">
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3 text-[15px]">
              <span className="font-bold text-white">{col.title}</span>
              {col.links.map((l) => (
                <Link key={l.label} to={l.to} className="hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="container-page border-t border-[#2A2A28] pt-5 pb-8 text-[13px]">
        © {YEAR} Trendi. All rights reserved.
      </div>
    </footer>
  )
}
