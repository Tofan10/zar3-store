'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { BRANDS, brandSlug, detectBrand } from '@/lib/brands'
import { Product } from '@/lib/types'

export default function BrandStrip({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  // Only show brands that actually have products in the catalog
  const activeBrands = BRANDS.filter(b => {
    return products.some(p => detectBrand(p.name)?.name === b.name)
  })

  if (activeBrands.length === 0) return null

  function scrollByCards(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * 4 * 152, behavior: 'smooth' })
  }

  return (
    <section className="reveal" style={{ marginBottom: 44 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)' }}>🏷️ Shop by Brand</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => scrollByCards(-1)} aria-label="Previous"
            style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--brand-dark)', cursor: 'pointer', fontSize: 15 }}>
            ‹
          </button>
          <button onClick={() => scrollByCards(1)} aria-label="Next"
            style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--brand-dark)', cursor: 'pointer', fontSize: 15 }}>
            ›
          </button>
        </div>
      </div>
      <div ref={trackRef} className="carousel-track scrollbar-hide" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {activeBrands.map((b, i) => (
          <Link
            key={b.name}
            href={`/store/brand/${brandSlug(b.name)}`}
            className="store-card reveal"
            style={{
              animationDelay: `${i * 0.04}s`,
              flex: '0 0 140px', width: 140, height: 76,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
              textDecoration: 'none', textAlign: 'center', padding: '0 10px',
            }}
          >
            <span style={{ color: b.color === '#000000' ? 'var(--text)' : b.color, fontSize: 16, fontWeight: 800, letterSpacing: 0.4 }}>
              {b.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
