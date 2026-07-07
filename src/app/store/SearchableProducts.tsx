'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/store/ProductCard'
import { Product } from '@/lib/types'

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'stock_desc'

function sortProducts(products: Product[], sort: SortOption) {
  const arr = [...products]
  switch (sort) {
    case 'price_asc': return arr.sort((a, b) => a.price - b.price)
    case 'price_desc': return arr.sort((a, b) => b.price - a.price)
    case 'name_asc': return arr.sort((a, b) => a.name.localeCompare(b.name))
    case 'stock_desc': return arr.sort((a, b) => b.stock - a.stock)
    default: return arr
  }
}

export default function SearchableProducts({ products }: { products: Product[] }) {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [sort, setSort] = useState<SortOption>('default')

  const featured = products.filter(p => p.featured)

  const filtered = sortProducts(
    products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
    ),
    sort

  )

  return (
    <div id="all-products-search">
      {/* Sticky search + sort bar */}
      <div style={{
        position: 'sticky', top: 96, zIndex: 90,
        background: 'var(--bg)', paddingBottom: 16, paddingTop: 8,
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder="🔍  Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '12px 16px', fontSize: 15, color: 'var(--text)',
            outline: 'none', boxSizing: 'border-box', marginBottom: 8,
            boxShadow: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />

        {/* Sort row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--muted)', fontSize: 13, flexShrink: 0 }}>Sort:</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {([
              { value: 'default', label: 'Default' },
              { value: 'price_asc', label: 'Price ↑' },
              { value: 'price_desc', label: 'Price ↓' },
              { value: 'name_asc', label: 'A-Z' },
              { value: 'stock_desc', label: 'Stock' },
            ] as { value: SortOption; label: string }[]).map(opt => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                style={{
                  background: sort === opt.value ? 'var(--brand-100)' : 'var(--surface)',
                  border: `1px solid ${sort === opt.value ? 'var(--brand)' : 'var(--border)'}`,
                  color: sort === opt.value ? 'var(--brand-dark)' : 'var(--muted)',
                  borderRadius: 6, padding: '5px 10px', fontSize: 12,
                  cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: sort === opt.value ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {search && (
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </div>
        )}
      </div>

      {!search && sort === 'default' && featured.length > 0 && (
        <>
          <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>⭐ Featured Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 48 }}>
            {featured.map((p, i) => (
              <div key={p.id} className="reveal" style={{ animationDelay: `${(i % 8) * 0.05}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </>
      )}

      <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        {search ? 'Search Results' : 'All Products'}
      </h2>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0', fontSize: 15 }}>
          No products found for "{search}"
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {filtered.map((p, i) => (
            <div key={p.id} className="reveal" style={{ animationDelay: `${(i % 12) * 0.04}s` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
