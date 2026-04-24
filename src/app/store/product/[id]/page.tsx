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
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/store" style={{ color: '#8b949e', fontSize: 13, textDecoration: 'none' }}>Store</Link>
        <span style={{ color: '#8b949e', margin: '0 6px' }}>›</span>
        <Link href={`/store/category/${(product.category as any)?.slug}`} style={{ color: '#8b949e', fontSize: 13, textDecoration: 'none' }}>{(product.category as any)?.name}</Link>
        <span style={{ color: '#8b949e', margin: '0 6px' }}>›</span>
        <span style={{ color: '#e6edf3', fontSize: 13 }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 48 }}>
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 16, overflow: 'hidden' }}>
          {product.images?.[0] ? (
            <div style={{ position: 'relative', height: 380 }}>
              <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'contain', padding: 24 }} />
            </div>
          ) : (
            <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, opacity: 0.2 }}>🖥️</div>
          )}
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid #21262d' }}>
              {product.images.map((img: string, i: number) => (
                <div key={i} style={{ width: 60, height: 60, position: 'relative', border: '1px solid #21262d', borderRadius: 8, overflow: 'hidden' }}>
                  <Image src={img} alt="" fill style={{ objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ color: '#378ADD', fontSize: 12, marginBottom: 8 }}>{(product.category as any)?.icon} {(product.category as any)?.name}</div>
            <h1 style={{ color: '#e6edf3', fontSize: 26, fontWeight: 600, lineHeight: 1.3, marginBottom: 8 }}>{product.name}</h1>
            {product.description && <p style={{ color: '#8b949e', fontSize: 14, lineHeight: 1.7 }}>{product.description}</p>}
          </div>

          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#3fb950', marginBottom: 4 }}>{product.price.toLocaleString()} EGP</div>
            <div style={{ fontSize: 13, color: inStock ? '#3fb950' : '#f85149' }}>
              {inStock ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </div>
            {product.warranty && (
              <div style={{ fontSize: 13, color: '#e3b341', marginTop: 8 }}>
                🛡️ Warranty: {product.warranty} days
              </div>
            )}
          </div>

          {Object.keys(product.specs || {}).length > 0 && (
            <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 20 }}>
              <div style={{ color: '#e6edf3', fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Specifications</div>
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #21262d', fontSize: 13 }}>
                  <span style={{ color: '#8b949e' }}>{k}</span>
                  <span style={{ color: '#e6edf3' }}>{String(v)}</span>
                </div>
              ))}
            </div>
          )}

          <AddToCartButton product={product} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href={`https://wa.me/201124424414?text=Hello, I'd like to order: ${encodeURIComponent(product.name)} - ${product.price.toLocaleString()} EGP`}
              target="_blank" rel="noopener"
              style={{ background: '#128c7e', color: '#fff', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>
              Order via WhatsApp
            </a>
            <a href="https://www.facebook.com/profile.php?id=61554098374352"
              target="_blank" rel="noopener"
              style={{ background: '#1877f2', color: '#fff', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>
              Order via Facebook
            </a>
          </div>
        </div>
      </div>

      {related && related.length > 0 && (
        <div>
          <h2 style={{ color: '#e6edf3', fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Related Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {related.map((p: Product) => (
              <Link key={p.id} href={`/store/product/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ background: '#0d1117', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'contain', padding: 12 }} /> : <span style={{ fontSize: 40, opacity: 0.2 }}>🖥️</span>}
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ color: '#e6edf3', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ color: '#3fb950', fontSize: 14, fontWeight: 600 }}>{p.price.toLocaleString()} EGP</div>
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
