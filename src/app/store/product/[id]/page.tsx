import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AddToCartButton from './AddToCartButton'

export const revalidate = 60

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const { data: related } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', product.category_id)
    .eq('active', true)
    .neq('id', id)
    .limit(4)

  const inStock = product.stock > 0

  return (
    <div className="reveal" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/store" style={{ color: 'var(--muted)', fontSize: 13, textDecoration: 'none' }}>Store</Link>
        <span style={{ color: 'var(--muted)', margin: '0 6px' }}>›</span>
        <Link href={`/store/category/${(product.category as any)?.slug}`} style={{ color: 'var(--muted)', fontSize: 13, textDecoration: 'none' }}>{(product.category as any)?.name}</Link>
        <span style={{ color: 'var(--muted)', margin: '0 6px' }}>›</span>
        <span style={{ color: 'var(--text)', fontSize: 13 }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 48 }} className="product-grid">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {product.images?.[0] ? (
            <div style={{ position: 'relative', height: 380, background: 'var(--brand-50)' }}>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                style={{ objectFit: 'contain', padding: 24 }}
                sizes="(max-width: 768px) 100vw, 550px"
                priority
              />
            </div>
          ) : (
            <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, opacity: 0.2, background: 'var(--brand-50)' }}>🖥️</div>
          )}
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
              {product.images.map((img: string, i: number) => (
                <div key={i} style={{ width: 60, height: 60, position: 'relative', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--brand-50)' }}>
                  <Image src={img} alt="" fill style={{ objectFit: 'contain' }} sizes="60px" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ color: 'var(--brand)', fontSize: 12, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{(product.category as any)?.icon} {(product.category as any)?.name}</div>
            <h1 style={{ color: 'var(--text)', fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{product.name}</h1>
            {product.description && <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>{product.description}</p>}
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--brand-dark)', marginBottom: 4 }}>{product.price.toLocaleString()} EGP</div>
            <div style={{ fontSize: 13, color: inStock ? '#3fb950' : '#f85149', fontWeight: 500 }}>
              {inStock ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </div>
            {product.warranty && (
              <div style={{ fontSize: 13, color: '#e3b341', marginTop: 8, fontWeight: 500 }}>
                🛡️ Warranty: {product.warranty} days
              </div>
            )}
          </div>

          {Object.keys(product.specs || {}).length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Specifications</div>
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--muted)' }}>{k}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{String(v)}</span>
                </div>
              ))}
            </div>
          )}

          <AddToCartButton product={product} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href={`https://wa.me/201124424414?text=Hello, I'd like to order: ${encodeURIComponent(product.name)} - ${product.price.toLocaleString()} EGP`}
              target="_blank" rel="noopener"
              style={{ background: '#128c7e', color: '#fff', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, textDecoration: 'none', textAlign: 'center', boxShadow: '0 6px 16px -6px rgba(18,140,126,0.5)' }}>
              Order via WhatsApp
            </a>
            <a href="https://www.facebook.com/profile.php?id=61554098374352"
              target="_blank" rel="noopener"
              style={{ background: '#1877f2', color: '#fff', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, textDecoration: 'none', textAlign: 'center', boxShadow: '0 6px 16px -6px rgba(24,119,242,0.5)' }}>
              Order via Facebook
            </a>
          </div>
        </div>
      </div>

      {related && related.length > 0 && (
        <div>
          <h2 style={{ color: 'var(--text)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Related Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {related.map((p: Product, i: number) => (
              <Link key={p.id} href={`/store/product/${p.id}`} style={{ textDecoration: 'none' }} className="reveal" >
                <div className="store-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--brand-50)', height: 140, position: 'relative' }}>
                    {p.images?.[0]
                      ? <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'contain', padding: 12 }} sizes="220px" />
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 40, opacity: 0.2 }}>🖥️</span></div>}
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ color: 'var(--brand-dark)', fontSize: 14, fontWeight: 700 }}>{p.price.toLocaleString()} EGP</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
