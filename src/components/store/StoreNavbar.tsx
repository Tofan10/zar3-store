'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import CartSidebar from './CartSidebar'
import { groupCategories } from '@/lib/categoryGroups'

const LOGO_URL = 'https://gumjhqrfsvngjppciowu.supabase.co/storage/v1/object/sign/logo/481354976_122205531740136612_8758662314822517452_n.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84MDU0Y2IzOC04OWQ3LTQzODgtODM4ZC02MmE4MGJmODE3NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvLzQ4MTM1NDk3Nl8xMjIyMDU1MzE3NDAxMzY2MTJfODc1ODY2MjMxNDgyMjUxNzQ1Ml9uLmpwZyIsImlhdCI6MTc3NzI1Mjg2NiwiZXhwIjoyMDkyNjEyODY2fQ.DktxglH6FH6lD5_5wMCoOs4yZPtnGAotyvike91iPqY'


export default function StoreNavbar({ categories }: { categories: any[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deptOpen, setDeptOpen] = useState(false)
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
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
        @media (max-width: 900px) { .desktop-nav-links { display: none !important; } }
        .dept-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: #fff; border-radius: 7px; padding: 7px 14px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.15s; }
        .dept-btn:hover { background: rgba(255,255,255,0.25); }
        .top-link { color: #e0f2fe; font-size: 13px; text-decoration: none; display: flex; align-items: center; gap: 5px; white-space: nowrap; }
        .top-link:hover { color: #fff; }
      `}</style>

      {/* TOP UTILITY BAR */}
      <div style={{ background: 'linear-gradient(90deg, #0369a1, #0ea5e9)', padding: '9px 16px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <button className="dept-btn" onClick={() => setDeptOpen(!deptOpen)} onBlur={() => setTimeout(() => setDeptOpen(false), 150)}>
              ☰ ALL DEPARTMENTS
            </button>
            {deptOpen && (
              <div style={{
                position: 'absolute', top: '110%', left: 0, background: 'var(--surface)', borderRadius: 12,
                border: '1px solid var(--border)', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.35)',
                padding: 14, width: 560, zIndex: 200, display: 'flex', gap: 20, animation: 'dropIn 0.18s ease',
              }}>
                {groups.map(g => (
                  <div key={g.key} style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-dark)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{g.icon}</span> {g.title}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {g.items.map((cat: any) => (
                        <Link key={cat.id} href={`/store/category/${cat.slug}`} onClick={() => setDeptOpen(false)}
                          style={{ color: 'var(--muted)', fontSize: 12.5, textDecoration: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-dark)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                        >
                          {cat.icon} {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <a className="top-link" href="https://wa.me/201124424414" target="_blank" rel="noopener">💬 WhatsApp Us</a>
            <a className="top-link" href="https://www.facebook.com/profile.php?id=61554098374352" target="_blank" rel="noopener">📘 Facebook</a>
            <span className="top-link" style={{ cursor: 'default' }}>📞 01124424414</span>
          </div>
        </div>
      </div>

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
