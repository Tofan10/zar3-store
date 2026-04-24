
'use client'
import { useState } from 'react'
import Link from 'next/link'
import CartSidebar from './CartSidebar'

export default function StoreNavbar({ categories }: { categories: any[] }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{ background: '#080c12', borderBottom: '1px solid #21262d', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo */}
        <Link href="/store" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a6fc4, #85b7eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, color: '#fff'
          }}>Z3</div>
          <span style={{ fontSize: 17, fontWeight: 500, color: '#e6edf3' }}>
            ZAR<span style={{ color: '#378ADD' }}>3</span> Hardware
          </span>
        </Link>

        {/* Desktop categories */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1, margin: '0 16px' }}>
          <Link href="/store" style={{ color: '#8b949e', fontSize: 13, textDecoration: 'none', padding: '5px 10px', borderRadius: 6, border: '1px solid #21262d' }}>
            All
          </Link>
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/store/category/${cat.slug}`}
              style={{ color: '#8b949e', fontSize: 13, textDecoration: 'none', padding: '5px 10px', borderRadius: 6, border: '1px solid #21262d' }}>
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>

        {/* Right: Cart + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <CartSidebar />
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none', border: '1px solid #21262d', borderRadius: 6,
              padding: '6px 12px', cursor: 'pointer', color: '#e6edf3', fontSize: 18, lineHeight: 1
            }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden" style={{
          background: '#080c12', borderTop: '1px solid #21262d',
          padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8,
          maxHeight: '70vh', overflowY: 'auto'
        }}>
          <Link href="/store" onClick={() => setMenuOpen(false)}
            style={{ color: '#8b949e', fontSize: 14, textDecoration: 'none', padding: '10px 12px', borderRadius: 6, border: '1px solid #21262d' }}>
            🗂️ All
          </Link>
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/store/category/${cat.slug}`}
              onClick={() => setMenuOpen(false)}
              style={{ color: '#8b949e', fontSize: 14, textDecoration: 'none', padding: '10px 12px', borderRadius: 6, border: '1px solid #21262d' }}>
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
