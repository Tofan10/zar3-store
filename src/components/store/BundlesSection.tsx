'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/CartContext'
import type { EnrichedBundle } from '@/lib/bundles'

export default function BundlesSection({ bundles }: { bundles: EnrichedBundle[] }) {
  if (!bundles || bundles.length === 0) return null

  return (
    <section id="ready-bundles" className="reveal" style={{ marginBottom: 44, scrollMarginTop: 120 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          🛠️ تجميعات جاهزة
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 4 }}>قطع متأكدين إنها متوافقة مع بعض 100% — ضيفها للسلة بضغطة واحدة</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {bundles.map((b, i) => (
          <BundleCard key={b.id} bundle={b} delay={i * 0.06} />
        ))}
      </div>
    </section>
  )
}

function BundleCard({ bundle, delay }: { bundle: EnrichedBundle; delay: number }) {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)

  function addAllToCart() {
    bundle.items.forEach((p: any) => addItem(p))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const cartHasBundle = bundle.items.length > 0 && bundle.items.every((p: any) => items.some(i => i.product.id === p.id))

  return (
    <div className="store-card reveal" style={{
      animationDelay: `${delay}s`,
      background: 'var(--surface)', border: cartHasBundle ? '2px solid var(--brand)' : '1px solid var(--border)',
      borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div>
        <div style={{ color: 'var(--text)', fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{bundle.name}</div>
        {bundle.description && <div style={{ color: 'var(--muted)', fontSize: 12 }}>{bundle.description}</div>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
        {bundle.items.map((p: any) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'var(--muted)' }}>• {p.name}</span>
            <span style={{ color: 'var(--brand-dark)', flexShrink: 0, marginLeft: 8 }}>{p.price.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--muted)', fontSize: 11 }}>{bundle.items.length} قطع</span>
        <span style={{ color: 'var(--text)', fontSize: 20, fontWeight: 800 }}>{bundle.total.toLocaleString()} EGP</span>
      </div>

      <button
        onClick={addAllToCart}
        className="btn-sky"
        style={{
          border: 'none', borderRadius: 10, padding: '11px 0', fontSize: 13, fontWeight: 700, color: '#fff',
          cursor: 'pointer', background: added ? '#1a4d1a' : undefined,
        }}
      >
        {added ? '✓ اتضافت للسلة' : '+ ضيف التجميعة كاملة للسلة'}
      </button>

      <a
        href={`https://wa.me/201124424414?text=${encodeURIComponent(`عايز أطلب "${bundle.name}":\n` + bundle.items.map((p: any) => `- ${p.name} (${p.price.toLocaleString()} EGP)`).join('\n') + `\n\nالإجمالي: ${bundle.total.toLocaleString()} EGP`)}`}
        target="_blank" rel="noopener"
        style={{
          textAlign: 'center', background: '#128c7e', color: '#fff', borderRadius: 10, padding: '10px 0',
          fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}
      >
        واتساب مباشر
      </a>
    </div>
  )
}
