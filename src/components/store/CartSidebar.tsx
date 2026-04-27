'use client'
import { useCart } from '@/lib/CartContext'
import { useState } from 'react'

const LOGO_URL = 'https://gumjhqrfsvngjppciowu.supabase.co/storage/v1/object/sign/logo/481354976_122205531740136612_8758662314822517452_n.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84MDU0Y2IzOC04OWQ3LTQzODgtODM4ZC02MmE4MGJmODE3NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvLzQ4MTM1NDk3Nl8xMjIyMDU1MzE3NDAxMzY2MTJfODc1ODY2MjMxNDgyMjUxNzQ1Ml9uLmpwZyIsImlhdCI6MTc3NzI1Mjg2NiwiZXhwIjoyMDkyNjEyODY2fQ.DktxglH6FH6lD5_5wMCoOs4yZPtnGAotyvike91iPqY'

export default function CartSidebar() {
  const { items, removeItem, updateQty, clearCart, total, count } = useCart()
  const [open, setOpen] = useState(false)
  const [ordered, setOrdered] = useState<'whatsapp' | 'facebook' | null>(null)

  function buildOrderMessage() {
    const lines = items.map(i =>
      `• ${i.product.name} x${i.quantity} = ${(i.product.price * i.quantity).toLocaleString()} EGP`
    )
    return `Hello ZAR3 Hardware! 👋\n\nI'd like to place the following order:\n\n${lines.join('\n')}\n\n💰 Total: ${total.toLocaleString()} EGP\n\nPlease confirm availability. Thank you!`
  }

  function orderWhatsApp() {
    window.open(`https://wa.me/201124424414?text=${encodeURIComponent(buildOrderMessage())}`, '_blank')
    setOrdered('whatsapp')
    clearCart()
  }

  function orderFacebook() {
    window.open('https://www.facebook.com/profile.php?id=61554098374352', '_blank')
    setOrdered('facebook')
    clearCart()
  }

  function handleClose() {
    setOpen(false)
    setTimeout(() => setOrdered(null), 400)
  }

  function downloadQuote() {
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    const rows = items.map(({ product, quantity }) => `
      <tr>
        <td>${product.name}</td>
        <td>${(product.category as any)?.name || ''}</td>
        <td>${product.warranty ? product.warranty + ' Days' : '—'}</td>
        <td style="text-align:center">${quantity}</td>
        <td style="text-align:right">${product.price.toLocaleString()}</td>
        <td style="text-align:right;font-weight:600">${(product.price * quantity).toLocaleString()}</td>
      </tr>
    `).join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #e0e0e0; }
          .logo-area { display: flex; align-items: center; gap: 14px; }
          .logo-img { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; }
          .company-name { font-size: 26px; font-weight: 800; color: #111; letter-spacing: -0.5px; }
          .company-sub { font-size: 12px; color: #1a6fc4; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 3px; }
          .date { font-size: 12px; color: #666; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          thead tr { background: #f0f4f8; }
          th { padding: 12px 14px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #444; border-bottom: 2px solid #ddd; }
          td { padding: 12px 14px; border-bottom: 1px solid #eee; vertical-align: middle; }
          tr:last-child td { border-bottom: none; }
          tr:nth-child(even) { background: #fafbfc; }
          .total-row { margin-top: 24px; display: flex; justify-content: flex-end; }
          .total-box { background: #f0f4f8; border-radius: 8px; padding: 16px 24px; min-width: 220px; }
          .total-label { font-size: 13px; color: #666; text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
          .total-value { font-size: 22px; font-weight: 800; color: #1a6fc4; text-align: center; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            <img src="${LOGO_URL}" class="logo-img" alt="ZAR3" />
            <div>
              <div class="company-name">ZAR3 HARDWARE</div>
              <div class="company-sub">Hardware Price Quotation</div>
            </div>
          </div>
          <div class="date">${dateStr}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Category</th>
              <th>Warranty</th>
              <th style="text-align:center">QTY</th>
              <th style="text-align:right">Unit Price</th>
              <th style="text-align:right">Total (EGP)</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="total-row">
          <div class="total-box">
            <div class="total-label">Total</div>
            <div class="total-value">${total.toLocaleString()} EGP</div>
          </div>
        </div>

        <div class="footer">
          ZAR3 Hardware · wa.me/201124424414 · facebook.com/profile.php?id=61554098374352
        </div>
      </body>
      </html>
    `

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={handleClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{
            position: 'relative', width: 400, maxWidth: '95vw',
            background: '#0d1117', borderLeft: '1px solid #21262d',
            height: '100vh', display: 'flex', flexDirection: 'column', zIndex: 1
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #21262d',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{ color: '#e6edf3', fontWeight: 500, fontSize: 16 }}>
                Cart {count > 0 && !ordered && <span style={{ color: '#8b949e', fontSize: 13, fontWeight: 400 }}>({count} items)</span>}
              </span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {items.length > 0 && !ordered && (
                  <button onClick={clearCart} style={{
                    background: 'none', border: 'none', color: '#f85149',
                    fontSize: 12, cursor: 'pointer', textDecoration: 'underline'
                  }}>Clear all</button>
                )}
                <button onClick={handleClose} style={{
                  background: 'none', border: 'none', color: '#8b949e',
                  fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 0
                }}>×</button>
              </div>
            </div>

            {ordered ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
                <h2 style={{ color: '#e6edf3', fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
                  Thank you for your order!
                </h2>
                <p style={{ color: '#8b949e', fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
                  Your order has been sent via{' '}
                  <span style={{ color: ordered === 'whatsapp' ? '#25d366' : '#1877f2', fontWeight: 500 }}>
                    {ordered === 'whatsapp' ? 'WhatsApp' : 'Facebook'}
                  </span>.
                </p>
                <p style={{ color: '#8b949e', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                  Our team at <span style={{ color: '#378ADD' }}>ZAR3 Hardware</span> will get back to you shortly to confirm your order and arrange delivery. 🚀
                </p>
                <div style={{
                  background: '#161b22', border: '1px solid #21262d',
                  borderRadius: 12, padding: '16px 20px', width: '100%', marginBottom: 24
                }}>
                  <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 4 }}>Contact us directly</div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 }}>
                    <a href="https://wa.me/201124424414" target="_blank" rel="noopener" style={{
                      background: '#128c7e', color: '#fff', borderRadius: 8,
                      padding: '8px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 500
                    }}>WhatsApp</a>
                    <a href="https://www.facebook.com/profile.php?id=61554098374352" target="_blank" rel="noopener" style={{
                      background: '#1877f2', color: '#fff', borderRadius: 8,
                      padding: '8px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 500
                    }}>Facebook</a>
                  </div>
                </div>
                <button onClick={handleClose} style={{
                  background: '#1a6fc4', border: 'none', borderRadius: 8,
                  color: '#fff', padding: '10px 28px', fontSize: 14, cursor: 'pointer', fontWeight: 500
                }}>Continue Shopping</button>
              </div>
            ) : (
              <>
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
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            overflow: 'hidden'
                          }}>
                            {product.images?.[0]
                              ? <img src={product.images[0]} alt="" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 6 }} referrerPolicy="no-referrer" />
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
                    <div style={{ background: '#161b22', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
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
                      <button onClick={downloadQuote} style={{
                        background: 'none', border: '1px solid #378ADD', borderRadius: 10,
                        color: '#378ADD', padding: '11px', fontSize: 14, fontWeight: 500,
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8, transition: 'all 0.15s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#0c2a4a' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                      >
                        📄 Download Price Quote
                      </button>
                    </div>
                    <p style={{ color: '#6e7681', fontSize: 11, textAlign: 'center', marginTop: 10 }}>
                      Your order details will be sent automatically
                    </p>
                  </div>
                )}
              </>
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
