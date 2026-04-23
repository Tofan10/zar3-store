'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/CartContext'
import { useState } from 'react'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)
  const inStock = product.stock > 0
  const cartItem = items.find(i => i.product.id === product.id)
  const cartQty = cartItem?.quantity || 0

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (!inStock) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <Link href={`/store/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#161b22', border: '1px solid #21262d', borderRadius: 12,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.15s', height: '100%'
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#378ADD')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#21262d')}
      >
        <div style={{ background: '#0d1117', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'contain', padding: 12 }} />
          ) : (
            <span style={{ fontSize: 48, opacity: 0.3 }}>🖥️</span>
          )}
          {product.featured && (
            <div style={{ position: 'absolute', top: 8, left: 8, background: '#1a6fc4', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>Featured</div>
          )}
          {!inStock && (
            <div style={{ position: 'absolute', top: 8, right: 8, background: '#6e2c2c', color: '#ffa8a8', fontSize: 10, padding: '2px 8px', borderRadius: 20 }}>Out of Stock</div>
          )}
          {cartQty > 0 && inStock && (
            <div style={{ position: 'absolute', bottom: 8, right: 8, background: '#1a6fc4', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 20 }}>
              {cartQty} in cart
            </div>
          )}
        </div>
        <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {product.category && (
            <div style={{ fontSize: 11, color: '#378ADD', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {(product.category as any).icon} {(product.category as any).name}
            </div>
          )}
          <div style={{ fontSize: 14, fontWeight: 500, color: '#e6edf3', lineHeight: 1.3 }}>{product.name}</div>
          {product.description && (
            <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.5 }}>{product.description}</div>
          )}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>
              {Object.entries(product.specs).slice(0, 3).map(([k, v]) => (
                <div key={k}><span style={{ color: '#6e7681' }}>{k}:</span> {String(v)}</div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 'auto', paddingTop: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#3fb950', marginBottom: 4 }}>
              {product.price.toLocaleString()} EGP
            </div>
            <div style={{ fontSize: 11, color: inStock ? '#3fb950' : '#f85149', marginBottom: 10 }}>
              {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </div>
            <button
              onClick={handleAdd}
              disabled={!inStock}
              style={{
                width: '100%', border: 'none', borderRadius: 8,
                padding: '10px 0', fontSize: 13, fontWeight: 500,
                cursor: inStock ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                background: added ? '#1a4d1a' : inStock ? '#1a6fc4' : '#1a2233',
                color: added ? '#3fb950' : inStock ? '#fff' : '#4a5568',
              }}
            >
              {added ? '✓ Added to Cart' : inStock ? '+ Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
