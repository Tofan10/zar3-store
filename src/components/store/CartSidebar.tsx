'use client'
import { useCart } from '@/lib/CartContext'
import { useState } from 'react'

export default function CartSidebar() {
  const { items, removeItem, updateQty, clearCart, total, count } = useCart()
  const [open, setOpen] = useState(false)

  function buildOrderMessage() {
    const lines = items.map(i =>
      `• ${i.product.name} x${i.quantity} = ${(i.product.price * i.quantity).toLocaleString()} EGP`
    )
    return `Hello ZAR3 Hardware, I'd like to order:\n\n${lines.join('\n')}\n\nTotal: ${total.toLocaleString()} EGP`
  }

  function orderWhatsApp() {
    window.open(`https://wa.me/201124424414?text=${encodeURIComponent(buildOrderMessage())}`, '_blank')
  }

  function orderFacebook() {
    window.open('https://www.facebook.com/profile.php?id=61554098374352', '_blank')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'relative', background: '#161b22',
          border: '1px solid #21262d', borderRadius: 8,
          color: '#e6edf3', padding: '7px 14px', cursor: 'pointer',
          fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
          transition: 'border-color 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#378ADD'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#21262d'}
      >
        <CartIcon />
        Cart
        {count > 0 && (
          <span style={{
            background: '#1a6fc4', color: '#fff', borderRadius: '50%',
            width: 18, height: 18, fontSize: 11, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>{count}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', justifyContent: 'flex-end'
        }}>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
          />
          <div style={{
            position: 'relative', width: 400, maxWidth: '95vw',
            background: '#0d1117', borderLeft: '1px solid #21262d',
            height: '100vh', display: 'flex', flexDirection: 'column',
            zIndex: 1
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #21262d',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{ color: '#e6edf3', fontWeight: 500, fontSize: 16 }}>
                Cart {count > 0 && <span style={{ color: '#8b949e', fontSize: 13, fontWeight: 400 }}>({count} items)</span>}
              </span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {items.length > 0 && (
                  <button onClick={clearCart} style={{
                    background: 'none', border: 'none', color: '#f85149',
                    fontSize: 12, cursor: 'pointer', textDecoration: 'underline'
                  }}>Clear all</button>
                )}
                <button onClick={() => setOpen(false)} style={{
                  background: 'none', border: 'none', color: '#8b949e',
                  fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 0
                }}>×</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8b949e', paddingTop: 80 }}>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🛒</div>
                  <div style={{ fontSize: 15 }}>Your cart is empty</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>Add products to start your order</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} style={{
                      background: '#161b22', border: '1px solid #21262d',
                      borderRadius: 10, padding: 14, display: 'flex', gap: 12
                    }}>
                      <div style={{
                        width: 56, height: 56, background: '#0d1117', borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {product.images?.[0]
                          ? <img src={product.images[0]} alt="" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 6 }} />
                          : <span style={{ fontSize: 24, opacity: 0.4 }}>🖥️</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#e6edf3', fontSize: 13, fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>{product.name}</div>
                        <div style={{ color: '#3fb950', fontSize: 13, marginBottom: 8 }}>
                          {(product.price * quantity).toLocaleString()} EGP
                          {quantity > 1 && <span style={{ color: '#8b949e', fontSize: 11 }}> ({product.price.toLocaleString()} × {quantity})</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => updateQty(product.id, quantity - 1)} style={qtyBtn}>−</button>
                          <span style={{ color: '#e6edf3', fontSize: 14, minWidth: 20, textAlign: 'center' }}>{quantity}</span>
                          <button onClick={() => updateQty(product.id, quantity + 1)} disabled={quantity >= product.stock} style={qtyBtn}>+</button>
                          <button onClick={() => removeItem(product.id)} style={{
                            marginLeft: 'auto', background: 'none', border: 'none',
                            color: '#f85149', cursor: 'pointer', fontSize: 12
                          }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div style={{ padding: '20px 24px', borderTop: '1px solid #21262d' }}>
                <div style={{
                  background: '#161b22', borderRadius: 10, padding: '14px 16px', marginBottom: 16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b949e', fontSize: 13, marginBottom: 6 }}>
                    <span>Items ({count})</span>
                    <span>{total.toLocaleString()} EGP</span>
                  </div>
                  <div style={{ borderTop: '1px solid #21262d', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#e6edf3', fontWeight: 500 }}>Total</span>
                    <span style={{ color: '#3fb950', fontSize: 20, fontWeight: 600 }}>{total.toLocaleString()} EGP</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={orderWhatsApp} style={{
                    background: '#128c7e', border: 'none', borderRadius: 10,
                    color: '#fff', padding: '13px', fontSize: 15, fontWeight: 500,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8, transition: 'background 0.15s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#25d366'}
                    onMouseLeave={e => e.currentTarget.style.background = '#128c7e'}
                  >
                    <WhatsAppIcon /> Order via WhatsApp
                  </button>
                  <button onClick={orderFacebook} style={{
                    background: '#1877f2', border: 'none', borderRadius: 10,
                    color: '#fff', padding: '13px', fontSize: 15, fontWeight: 500,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8, transition: 'background 0.15s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0d65d9'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1877f2'}
                  >
                    <FacebookIcon /> Order via Facebook
                  </button>
                </div>
                <p style={{ color: '#6e7681', fontSize: 11, textAlign: 'center', marginTop: 10 }}>
                  Your order details will be sent automatically
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const qtyBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, background: '#21262d',
  border: '1px solid #30363d', color: '#e6edf3', cursor: 'pointer',
  fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: 1
}

function CartIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}
