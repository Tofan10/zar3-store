'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import CartSidebar from './CartSidebar'
import { groupCategories } from '@/lib/categoryGroups'

const LOGO_URL = 'https://gumjhqrfsvngjppciowu.supabase.co/storage/v1/object/sign/logo/481354976_122205531740136612_8758662314822517452_n.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84MDU0Y2IzOC04OWQ3LTQzODgtODM4ZC02MmE4MGJmODE3NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvLzQ4MTM1NDk3Nl8xMjIyMDU1MzE3NDAxMzY2MTJfODc1ODY2MjMxNDgyMjUxNzQ1Ml9uLmpwZyIsImlhdCI6MTc3NzI1Mjg2NiwiZXhwIjoyMDkyNjEyODY2fQ.DktxglH6FH6lD5_5wMCoOs4yZPtnGAotyvike91iPqY'

export default function StoreNavbar({ categories }: { categories: any[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  function isActive(slug: string) {
    return pathname === `/store/category/${slug}`
  }

  const isAllActive = pathname === '/store'
  const groups = groupCategories(categories)

  return (
    <>
      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 8px 2px #0ea5e988, 0 0 16px 4px #0284c744; }
          50% { box-shadow: 0 0 16px 4px #38bdf8cc, 0 0 32px 8px #0ea5e988; }
        }
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
        @media (max-width: 900px) { .desktop-nav-links { display: none !important; } }
      `}</style>

      {/* MAIN NAVBAR */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px -6px rgba(0,0,0,0.4)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link href="/store" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <img
              src={LOGO_URL}
              alt="ZAR3"
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', animation: 'glow 2.5s ease-in-out infinite' }}
            />
            <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
              ZAR<span style={{ color: 'var(--brand)' }}>3</span> Hardware
            </span>
          </Link>

          {/* Center quick nav (desktop) */}
          <div className="desktop-nav-links" style={{ display: 'flex', gap: 26, alignItems: 'center' }}>
            {groups.map(g => (
              <a key={g.key} href={g.anchor ? `/store#${g.anchor}` : '/store'} className="nav-link-underline" style={{ color: 'var(--text)', fontSize: 13.5, fontWeight: 500, textDecoration: 'none' }}>
                {g.icon} {g.title}
              </a>
            ))}
            <a href="/store#ready-bundles" className="nav-link-underline" style={{ color: 'var(--text)', fontSize: 13.5, fontWeight: 500, textDecoration: 'none' }}>
              🛠️ تجميعات جاهزة
            </a>
            <Link href="/store/build" style={{
              background: 'var(--brand-100)', color: 'var(--brand-dark)', fontSize: 13, fontWeight: 700,
              textDecoration: 'none', padding: '6px 14px', borderRadius: 20, border: '1px solid var(--brand)',
            }}>
              🛠️ جمّع تجميعتك
            </Link>
          </div>

          {/* Right: Cart + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <CartSidebar />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-only"
              style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                padding: '6px 12px', cursor: 'pointer', color: 'var(--text)', fontSize: 18, lineHeight: 1,
              }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            background: 'var(--surface)', borderTop: '1px solid var(--border)',
            padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8,
            maxHeight: '70vh', overflowY: 'auto'
          }}>
            <Link href="/store" onClick={() => setMenuOpen(false)}
              style={{ color: isAllActive ? 'var(--brand-dark)' : 'var(--muted)', fontSize: 14, textDecoration: 'none', padding: '10px 12px', borderRadius: 6, border: `1px solid ${isAllActive ? '#1a3a5c' : 'var(--border)'}`, background: isAllActive ? 'var(--brand-100)' : 'transparent' }}>
              🗂️ All
            </Link>
            <Link href="/store/build" onClick={() => setMenuOpen(false)}
              style={{ color: 'var(--brand-dark)', fontSize: 14, fontWeight: 700, textDecoration: 'none', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--brand)', background: 'var(--brand-100)' }}>
              🛠️ جمّع تجميعتك
            </Link>
            <a href="/store#ready-bundles" onClick={() => setMenuOpen(false)}
              style={{ color: 'var(--brand-dark)', fontSize: 14, fontWeight: 700, textDecoration: 'none', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--brand)', background: 'var(--brand-100)' }}>
              🛠️ تجميعات جاهزة
            </a>
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/store/category/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                style={{ color: isActive(cat.slug) ? 'var(--brand-dark)' : 'var(--muted)', fontSize: 14, textDecoration: 'none', padding: '10px 12px', borderRadius: 6, border: `1px solid ${isActive(cat.slug) ? '#1a3a5c' : 'var(--border)'}`, background: isActive(cat.slug) ? 'var(--brand-100)' : 'transparent' }}>
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  )
}
