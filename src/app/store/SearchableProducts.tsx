'use client'
import { useState } from 'react'
import ProductCard from '@/components/store/ProductCard'
import { Product } from '@/lib/types'

export default function SearchableProducts({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('')
  const featured = products.filter(p => p.featured)
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      {/* Sticky search bar */}
      <div style={{
        position: 'sticky', top: 57, zIndex: 90,
        background: '#0d1117', paddingBottom: 16, paddingTop: 8,
      }}>
        <input
          type="text"
          placeholder="🔍  Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', background: '#161b22', border: '1px solid #21262d',
            borderRadius: 10, padding: '12px 16px', fontSize: 15, color: '#e6edf3',
            outline: 'none', boxSizing: 'border-box'
          }}
          onFocus={e => e.target.style.borderColor = '#378ADD'}
          onBlur={e => e.target.style.borderColor = '#21262d'}
        />
        {search && (
          <div style={{ color: '#8b949e', fontSize: 13, marginTop: 8 }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </div>
        )}
      </div>

      {!search && featured.length > 0 && (
        <>
          <h2 style={{ color: '#e6edf3', fontSize: 20, fontWeight: 500, marginBottom: 20 }}>Featured Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 48 }}>
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}

      <h2 style={{ color: '#e6edf3', fontSize: 20, fontWeight: 500, marginBottom: 20 }}>
        {search ? 'Search Results' : 'All Products'}
      </h2>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#8b949e', padding: '60px 0', fontSize: 15 }}>
          No products found for "{search}"
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
