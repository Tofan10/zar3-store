'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/CartContext'

interface Part {
  slug: string
  label: string
  icon: string
  required: boolean
  products: Product[]
}

export default function PCBuilderClient({ parts }: { parts: Part[] }) {
  const { addItem } = useCart()
  const [selected, setSelected] = useState<Record<string, string>>({}) // slug -> product id ('' = none)
  const [justAdded, setJustAdded] = useState(false)

  const chosen = useMemo(() => {
    return parts
      .map(part => {
        const pid = selected[part.slug]
        const product = part.products.find(p => p.id === pid)
        return product ? { part, product } : null
      })
      .filter(Boolean) as { part: Part; product: Product }[]
  }, [selected, parts])

  const total = chosen.reduce((sum, c) => sum + c.product.price, 0)

  function pick(slug: string, id: string) {
    setSelected(s => ({ ...s, [slug]: id }))
  }

  function addAllToCart() {
    chosen.forEach(c => addItem(c.product))
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  const missingRequired = parts.filter(p => p.required && !selected[p.slug])

  return (
    <div className="reveal" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 80px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ color: 'var(--brand)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>🛠️ PC Builder</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>جمّع تجميعتك بنفسك</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>اختار كل قطعة من الستوك المتوفر فعليًا، والإجمالي بيتحدّث لحظيًا. لما تخلص، ضيف كل حاجة للسلة بدوسة واحدة.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {parts.map(part => {
          const selectedId = selected[part.slug] || ''
          const selectedProduct = part.products.find(p => p.id === selectedId)
          return (
            <div key={part.slug} style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
              padding: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            }}>
              <div style={{ fontSize: 22, width: 34, textAlign: 'center' }}>{part.icon}</div>
              <div style={{ minWidth: 140 }}>
                <div style={{ color: 'var(--text)', fontSize: 13.5, fontWeight: 700 }}>{part.label}</div>
                <div style={{ color: 'var(--muted)', fontSize: 11 }}>{part.required ? 'مطلوبة' : 'اختيارية'} · {part.products.length} متاح</div>
              </div>

              <select
                value={selectedId}
                onChange={e => pick(part.slug, e.target.value)}
                style={{
                  flex: 1, minWidth: 220, background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--text)', outline: 'none',
                }}
              >
                <option value="">— من غير {part.label} —</option>
                {part.products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.price.toLocaleString()} EGP ({p.stock} متاح)
                  </option>
                ))}
              </select>

              {selectedProduct && (
                <div style={{ color: 'var(--brand-dark)', fontWeight: 700, fontSize: 14, minWidth: 80, textAlign: 'left' }}>
                  {selectedProduct.price.toLocaleString()} EGP
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary bar */}
      <div style={{
        position: 'sticky', bottom: 16, marginTop: 28,
        background: 'var(--surface)', border: '1px solid var(--brand)', borderRadius: 16,
        padding: 18, boxShadow: '0 20px 50px -14px rgba(14,165,233,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>{chosen.length} قطعة مختارة</div>
          <div style={{ color: 'var(--text)', fontSize: 24, fontWeight: 800 }}>{total.toLocaleString()} EGP</div>
          {missingRequired.length > 0 && (
            <div style={{ color: '#e3b341', fontSize: 11.5, marginTop: 4 }}>
              لسه ناقص: {missingRequired.map(p => p.label).join('، ')}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={addAllToCart}
            disabled={chosen.length === 0}
            className={chosen.length ? 'btn-sky' : ''}
            style={{
              border: 'none', borderRadius: 10, padding: '13px 22px', fontSize: 14, fontWeight: 700,
              color: chosen.length ? '#fff' : '#4a5568',
              background: justAdded ? '#1a4d1a' : chosen.length ? undefined : '#1a2233',
              cursor: chosen.length ? 'pointer' : 'not-allowed',
            }}
          >
            {justAdded ? '✓ اتضافت للسلة' : '+ ضيف كل القطع للسلة'}
          </button>
          <a href={`https://wa.me/201124424414?text=${encodeURIComponent('عايز أطلب التجميعة دي:\n' + chosen.map(c => `- ${c.product.name} (${c.product.price.toLocaleString()} EGP)`).join('\n') + `\n\nالإجمالي: ${total.toLocaleString()} EGP`)}`}
            target="_blank" rel="noopener"
            style={{
              background: '#128c7e', color: '#fff', borderRadius: 10, padding: '13px 20px',
              fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center',
            }}
          >
            واتساب مباشر
          </a>
        </div>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Link href="/store" style={{ color: 'var(--muted)', fontSize: 13, textDecoration: 'none' }}>← رجوع للمتجر</Link>
      </div>
    </div>
  )
}
