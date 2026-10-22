import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <p className="font-display text-7xl md:text-8xl">404</p>
      <h1 className="text-2xl font-bold">This page isn't here yet.</h1>
      <p className="text-muted">It may have moved, or it's still being built.</p>
      <Link to="/" className="mt-2 rounded-full bg-ink px-7 py-4 font-bold text-white">
        Back to home
      </Link>
    </section>
  )
}
