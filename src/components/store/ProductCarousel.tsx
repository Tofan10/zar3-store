'use client'
import { useRef, useState, useEffect } from 'react'
import { Product } from '@/lib/types'
import ProductCard from './ProductCard'

export default function ProductCarousel({ title, icon, products, anchorId }: { title: string; icon?: string; products: Product[]; anchorId?: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)

  const cardWidth = 232 // approx card width + gap, used to compute page dots
  const perView = 4

  function scrollByCards(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * (cardWidth * perView), behavior: 'smooth' })
  }

  function handleScroll() {
    const el = trackRef.current
    if (!el) return
    const p = Math.round(el.scrollLeft / (cardWidth * perView))
    setPage(p)
  }

  const totalPages = Math.max(1, Math.ceil(products.length / perView))

  if (products.length === 0) return null

  return (
    <section id={anchorId} className="reveal" style={{ marginBottom: 44, scrollMarginTop: 120 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: 0.2 }}>
          {icon && <span>{icon}</span>} {title}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => scrollByCards(-1)} aria-label="Previous"
            style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: '#fff', color: 'var(--brand-dark)', cursor: 'pointer', fontSize: 15 }}>
            ‹
          </button>
          <button onClick={() => scrollByCards(1)} aria-label="Next"
            style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: '#fff', color: 'var(--brand-dark)', cursor: 'pointer', fontSize: 15 }}>
            ›
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="carousel-track scrollbar-hide"
        style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4 }}
      >
        {products.map((p, i) => (
          <div key={p.id} className="reveal" style={{ animationDelay: `${i * 0.05}s`, flex: '0 0 216px', width: 216 }}>
            <ProductCard product={p} isNew={i < 2} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <span key={i} style={{
              width: page === i ? 18 : 7, height: 7, borderRadius: 4,
              background: page === i ? 'var(--brand)' : 'var(--border)',
              transition: 'all 0.25s ease',
            }} />
          ))}
        </div>
      )}
    </section>
  )
}
