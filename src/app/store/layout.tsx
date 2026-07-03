import { supabase } from '@/lib/supabase'
import { CartProvider } from '@/lib/CartContext'
import { QuickViewProvider } from '@/lib/QuickViewContext'
import StoreNavbar from '@/components/store/StoreNavbar'
import QuickViewModal from '@/components/store/QuickViewModal'

async function getCategories() {
  const { data } = await supabase.from('categories').select('*').order('sort_order')
  return data || []
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories()
  return (
    <CartProvider>
      <QuickViewProvider>
      <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

        <StoreNavbar categories={categories} />

        <main>{children}</main>

        <footer style={{ background: '#080c12', borderTop: '1px solid var(--border)', padding: '28px 0', marginTop: 60 }}>
          <div   style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>© 2026 Ziad Mohamed</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <a href="https://wa.me/201124424414" target="_blank" rel="noopener" style={{ color: '#25d366', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>WhatsApp</a>
              <a href="https://www.facebook.com/profile.php?id=61554098374352" target="_blank" rel="noopener" style={{ color: '#1877f2', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Facebook</a>
            </div>
          </div>
        </footer>

        <QuickViewModal />

      </div>
      </QuickViewProvider>
    </CartProvider>
  )
}
