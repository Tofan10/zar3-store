'use client'
import { useState } from 'react'
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
  const [search, setSearch] = useState('')
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
    <div>
      {/* Sticky search + sort bar */}
      <div style={{
        position: 'sticky', top: 57, zIndex: 90,
        background: '#0d1117', paddingBottom: 16, paddingTop: 8,
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="🔍  Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, background: '#161b22', border: '1px solid #21262d',
              borderRadius: 10, padding: '12px 16px', fontSize: 15, color: '#e6edf3',
              outline: 'none', boxSizing: 'border-box'
            }}
            onFocus={e => e.target.style.borderColor = '#378ADD'}
            onBlur={e => e.target.style.borderColor = '#21262d'}
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            style={{
              background: '#161b22', border: '1px solid #21262d',
              borderRadius: 10, padding: '12px 14px', fontSize: 13,
              color: '#e6edf3', outline: 'none', cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <option value="default">Default</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="name_asc">Name A-Z</option>
            <option value="stock_desc">Most Stock</option>
          </select>
        </div>
        {search && (
          <div style={{ color: '#8b949e', fontSize: 13, marginTop: 8 }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </div>
        )}
      </div>

      {!search && sort === 'default' && featured.length > 0 && (
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
