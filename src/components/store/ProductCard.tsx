'use client'
import Link from 'next/link'
import Image from 'next/image'
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
    <Link href={`/store/product/${product.id}`} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
      <div style={{
        background: '#161b22',
        border: cartQty > 0 ? '2px solid #378ADD' : '1px solid #21262d',
        borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.15s', height: '100%',
        opacity: inStock ? 1 : 0.7,
      }}
        onMouseEnter={e => { if (cartQty === 0) e.currentTarget.style.borderColor = '#378ADD' }}
        onMouseLeave={e => { if (cartQty === 0) e.currentTarget.style.borderColor = '#21262d' }}
      >
        {/* Image */}
        <div style={{ background: '#0d1117', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              style={{ objectFit: 'contain', padding: 12 }}
              sizes="(max-width: 768px) 50vw, 220px"
            />
          ) : (
            <span style={{ fontSize: 48, opacity: 0.3 }}>🖥️</span>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 1 }}>
            {product.featured && (
              <span style={{ background: '#1a6fc4', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>Featured</span>
            )}
            {!inStock && (
              <span style={{ background: '#6e2c2c', color: '#ffa8a8', fontSize: 10, padding: '2px 8px', borderRadius: 20 }}>Out of Stock</span>
            )}
          </div>

          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', zIndex: 1 }}>
            {product.warranty && (
              <span style={{ background: '#2d2208', color: '#e3b341', fontSize: 10, padding: '2px 8px', borderRadius: 20 }}>🛡️ {product.warranty}d</span>
            )}
            {cartQty > 0 && inStock && (
              <span style={{ background: '#0c2a4a', color: '#85b7eb', fontSize: 10, padding: '2px 8px', borderRadius: 20 }}>{cartQty} in cart</span>
            )}
          </div>
        </div>

        {/* Content */}
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

          {/* Price + Stock + Button */}
          <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #21262d' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#3fb950' }}>
                {product.price.toLocaleString()} EGP
              </div>
              <div style={{ fontSize: 11, color: inStock ? '#3fb950' : '#f85149' }}>
                {inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
              </div>
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
