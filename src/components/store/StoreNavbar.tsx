'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import CartSidebar from './CartSidebar'

const LOGO_URL = 'https://gumjhqrfsvngjppciowu.supabase.co/storage/v1/object/sign/logo/481354976_122205531740136612_8758662314822517452_n.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84MDU0Y2IzOC04OWQ3LTQzODgtODM4ZC02MmE4MGJmODE3NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvLzQ4MTM1NDk3Nl8xMjIyMDU1MzE3NDAxMzY2MTJfODc1ODY2MjMxNDgyMjUxNzQ1Ml9uLmpwZyIsImlhdCI6MTc3NzI1Mjg2NiwiZXhwIjoyMDkyNjEyODY2fQ.DktxglH6FH6lD5_5wMCoOs4yZPtnGAotyvike91iPqY'

export default function StoreNavbar({ categories }: { categories: any[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  function isActive(slug: string) {
    return pathname === `/store/category/${slug}`
  }

  const isAllActive = pathname === '/store'

  return (
    <>
      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 8px 2px #378ADD88, 0 0 16px 4px #1a6fc444; }
          50% { box-shadow: 0 0 16px 4px #378ADDcc, 0 0 32px 8px #1a6fc488; }
        }
        .desktop-cat-sidebar { position: fixed; top: 67px; right: 0; width: 190px; height: calc(100vh - 67px); background: #080c12; border-left: 1px solid #21262d; padding: 12px 10px; display: flex; flex-direction: column; gap: 5px; overflow-y: auto; z-index: 90; scrollbar-width: none; }
        .desktop-cat-sidebar::-webkit-scrollbar { display: none; }
        .sidebar-cat-link { color: #8b949e; font-size: 13px; text-decoration: none; padding: 8px 12px; border-radius: 6px; border: 1px solid transparent; display: flex; align-items: center; gap: 8px; transition: all 0.15s; }
        .sidebar-cat-link:hover { color: #e6edf3; border-color: #21262d; background: #0d1117; }
        .sidebar-cat-link.active { color: #378ADD !important; border-color: #1a3a5c !important; background: #0d1b2a !important; font-weight: 600; }
        @media (max-width: 768px) { .desktop-cat-sidebar { display: none !important; } }
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
      `}</style>

      {/* TOP NAVBAR */}
      <nav style={{ background: '#080c12', borderBottom: '1px solid #21262d', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link href="/store" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <img
              src={LOGO_URL}
              alt="ZAR3"
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', animation: 'glow 2.5s ease-in-out infinite' }}
            />
            <span style={{ fontSize: 17, fontWeight: 500, color: '#e6edf3' }}>
              ZAR<span style={{ color: '#378ADD' }}>3</span> Hardware
            </span>
          </Link>

          {/* Right: Cart + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <CartSidebar />
            <button
              className="mobile-only"
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
          <div className="mobile-only" style={{
            background: '#080c12', borderTop: '1px solid #21262d',
            padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8,
            maxHeight: '70vh', overflowY: 'auto'
          }}>
            <Link href="/store" onClick={() => setMenuOpen(false)}
              style={{ color: isAllActive ? '#378ADD' : '#8b949e', fontSize: 14, textDecoration: 'none', padding: '10px 12px', borderRadius: 6, border: `1px solid ${isAllActive ? '#1a3a5c' : '#21262d'}`, background: isAllActive ? '#0d1b2a' : 'transparent' }}>
              🗂️ All
            </Link>
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/store/category/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                style={{ color: isActive(cat.slug) ? '#378ADD' : '#8b949e', fontSize: 14, textDecoration: 'none', padding: '10px 12px', borderRadius: 6, border: `1px solid ${isActive(cat.slug) ? '#1a3a5c' : '#21262d'}`, background: isActive(cat.slug) ? '#0d1b2a' : 'transparent' }}>
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* DESKTOP SIDEBAR */}
      <aside className="desktop-cat-sidebar">
        <div style={{ fontSize: 10, fontWeight: 700, color: '#3d4b5c', textTransform: 'uppercase', letterSpacing: 1, padding: '4px 12px 8px', borderBottom: '1px solid #161b22', marginBottom: 4 }}>
          Categories
        </div>
        <Link href="/store" className={`sidebar-cat-link${isAllActive ? ' active' : ''}`}>
          🗂️ All
        </Link>
        {categories.map((cat: any) => (
          <Link key={cat.id} href={`/store/category/${cat.slug}`}
            className={`sidebar-cat-link${isActive(cat.slug) ? ' active' : ''}`}>
            {cat.icon} {cat.name}
          </Link>
        ))}
      </aside>
    </>
  )
}
