'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useQuickView } from '@/lib/QuickViewContext'
import { useCart } from '@/lib/CartContext'
import { getDiscount } from '@/lib/pricing'

function getOptimizedUrl(url: string) {
  if (url && url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', '/upload/w_500,q_auto,f_auto/')
  }
  return url
}

export default function QuickViewModal() {
  const { product, close } = useQuickView()
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)

  if (!product) return null

  const inStock = product.stock > 0
  const cartItem = items.find(i => i.product.id === product.id)
  const cartQty = cartItem?.quantity || 0
  const discount = getDiscount(product.price, product.original_price)
  const imgUrl = product.images?.[0] ? getOptimizedUrl(product.images[0]) : null

  function handleAdd() {
    if (!inStock) return
    addItem(product!)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="quickview-grid reveal"
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
          maxWidth: 720, width: '100%', maxHeight: '88vh', overflowY: 'auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
          boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ background: 'var(--brand-50)', minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <button onClick={close} style={{
            position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%',
            background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
            cursor: 'pointer', fontSize: 16, zIndex: 2,
          }}>✕</button>
          {discount && (
            <div style={{
              position: 'absolute', top: 10, left: 10, background: '#f85149', color: '#fff',
              fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, zIndex: 2,
            }}>
              -{discount.percent}%
            </div>
          )}
          {imgUrl ? (
            <img src={imgUrl} alt={product.name} style={{ width: '100%', height: '100%', maxHeight: 340, objectFit: 'contain', padding: 24 }} />
          ) : (
            <span style={{ fontSize: 60, opacity: 0.2 }}>🖥️</span>
          )}
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {product.category && (
            <div style={{ fontSize: 11, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
              {(product.category as any).icon} {(product.category as any).name}
            </div>
          )}
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{product.name}</h2>
          {product.description && <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{product.description}</p>}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--brand-dark)' }}>{product.price.toLocaleString()} EGP</span>
            {discount && (
              <span style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'line-through' }}>{discount.originalPrice.toLocaleString()} EGP</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: inStock ? '#3fb950' : '#f85149', fontWeight: 500 }}>
            {inStock ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            {cartQty > 0 && <span style={{ color: 'var(--brand-dark)', marginLeft: 8 }}>· {cartQty} in cart</span>}
          </div>

          {Object.keys(product.specs || {}).length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
              {Object.entries(product.specs).slice(0, 4).map(([k, v]) => (
                <div key={k} style={{ fontSize: 12, color: 'var(--muted)', padding: '3px 0' }}>
                  • {k}{v ? `: ${v}` : ''}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10 }}>
            <button onClick={handleAdd} disabled={!inStock} className={inStock ? 'btn-sky' : ''} style={{
              border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 600,
              cursor: inStock ? 'pointer' : 'not-allowed',
              background: added ? '#1a4d1a' : inStock ? undefined : '#1a2233',
              color: added ? '#3fb950' : inStock ? '#fff' : '#4a5568',
            }}>
              {added ? '✓ Added to Cart' : inStock ? '+ Add to Cart' : 'Out of Stock'}
            </button>
            <Link href={`/store/product/${product.id}`} onClick={close} style={{
              textAlign: 'center', border: '1px solid var(--border)', borderRadius: 10, padding: '11px',
              fontSize: 13, color: 'var(--text)', textDecoration: 'none',
            }}>
              View Full Details →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .quickview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
