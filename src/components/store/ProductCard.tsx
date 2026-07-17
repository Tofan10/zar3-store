'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/CartContext'
import { useQuickView } from '@/lib/QuickViewContext'
import { getDiscount } from '@/lib/pricing'
import { detectCondition, conditionStyle } from '@/lib/condition'

function getOptimizedUrl(url: string) {
  if (url && url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', '/upload/w_400,q_auto,f_auto/')
  }
  return url
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart()
  const { open: openQuickView } = useQuickView()
  const [added, setAdded] = useState(false)
  const inStock = product.stock > 0
  const cartItem = items.find(i => i.product.id === product.id)
  const cartQty = cartItem?.quantity || 0
  const discount = getDiscount(product.price, product.original_price)
  const condition = detectCondition(product.description)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (!inStock) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  function handleQuickView(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    openQuickView(product)
  }

  const imgUrl = product.images?.[0] ? getOptimizedUrl(product.images[0]) : null

  return (
    <Link href={`/store/product/${product.id}`} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
      <div className="store-card" style={{
        background: 'var(--surface)',
        border: cartQty > 0 ? '2px solid var(--brand)' : '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        height: '100%',
        opacity: inStock ? 1 : 0.75,
        }}
      >
        {/* Image */}
        <div className="product-card-img" style={{ background: 'var(--brand-50)', height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={product.name}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }}
            />
          ) : (
            <span style={{ fontSize: 44, opacity: 0.25 }}>🖥️</span>
          )}

          {/* Quickview button — appears on hover */}
          <button
            onClick={handleQuickView}
            className="quickview-btn"
            title="Quick View"
            style={{
              position: 'absolute', bottom: 8, right: 8, width: 30, height: 30, borderRadius: '50%',
              background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--brand-dark)',
              cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 3, opacity: 0, transform: 'translateY(6px)', transition: 'opacity 0.2s, transform 0.2s',
            }}
          >
            👁
          </button>

          {/* Discount ribbon */}
          {discount && (
            <div style={{
              position: 'absolute', top: 8, left: 8, background: '#f85149', color: '#fff',
              fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, zIndex: 2,
            }}>
              -{discount.percent}%
            </div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', zIndex: 1 }}>
            {condition && (() => {
              const cs = conditionStyle(condition)
              return (
                <span style={{
                  background: cs.bg, color: cs.color, fontSize: 10, padding: '2px 9px', borderRadius: 20, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 3,
                  boxShadow: cs.glow ? `0 0 10px 1px ${cs.glow}` : undefined,
                  border: cs.glow ? `1px solid ${cs.color}55` : undefined,
                }}>
                  {cs.icon && <span>{cs.icon}</span>} {condition}
                </span>
              )
            })()}
            {product.featured && (
              <span style={{ background: 'var(--brand)', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Featured</span>
            )}
            {!inStock && (
              <span style={{ background: '#6e2c2c', color: '#ffa8a8', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Out of Stock</span>
            )}
            {product.warranty && (
              <span style={{ background: '#2d2208', color: '#e3b341', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>🛡️ {product.warranty}d</span>
            )}
            {cartQty > 0 && inStock && (
              <span style={{ background: 'var(--brand-100)', color: 'var(--brand-dark)', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{cartQty} in cart</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {product.category && (
            <div style={{ fontSize: 11, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              {(product.category as any).icon} {(product.category as any).name}
            </div>
          )}
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{product.name}</div>
          {product.description && (
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{product.description}</div>
          )}

          {/* Price + Stock + Button */}
          <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-dark)' }}>
                  {product.price.toLocaleString()} EGP
                </span>
                {discount && (
                  <span style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>
                    {discount.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: inStock ? '#3fb950' : '#f85149', fontWeight: 500 }}>
                {inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!inStock}
              className={inStock ? 'btn-sky' : ''}
              style={{
                width: '100%', border: 'none', borderRadius: 8,
                padding: '10px 0', fontSize: 13, fontWeight: 600,
                cursor: inStock ? 'pointer' : 'not-allowed',
                background: added ? '#1a4d1a' : inStock ? undefined : '#1a2233',
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
