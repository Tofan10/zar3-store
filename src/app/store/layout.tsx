import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CartProvider } from '@/lib/CartContext'
import CartSidebar from '@/components/store/CartSidebar'

async function getCategories() {
  const { data } = await supabase.from('categories').select('*').order('sort_order')
  return data || []
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories()

  return (
    <CartProvider>
      <div className="min-h-screen" style={{ background: '#0d1117' }}>
        <nav style={{ background: '#080c12', borderBottom: '1px solid #21262d', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1 }}>
              <Link href="/store" style={{ color: '#8b949e', fontSize: 13, textDecoration: 'none', padding: '5px 10px', borderRadius: 6, border: '1px solid #21262d' }}>
                All
              </Link>
              {categories.map((cat: any) => (
                <Link key={cat.id} href={`/store/category/${cat.slug}`} style={{ color: '#8b949e', fontSize: 13, textDecoration: 'none', padding: '5px 10px', borderRadius: 6, border: '1px solid #21262d' }}>
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>

            <CartSidebar />
          </div>
        </nav>

        <main>{children}</main>

        <footer style={{ background: '#080c12', borderTop: '1px solid #21262d', padding: '24px 0', marginTop: 60 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: '#8b949e', fontSize: 13 }}>© 2025 ZAR3 Hardware</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <a href="https://wa.me/201124424414" target="_blank" rel="noopener" style={{ color: '#25d366', fontSize: 13, textDecoration: 'none' }}>WhatsApp</a>
              <a href="https://www.facebook.com/profile.php?id=61554098374352" target="_blank" rel="noopener" style={{ color: '#1877f2', fontSize: 13, textDecoration: 'none' }}>Facebook</a>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}
