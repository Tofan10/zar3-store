import { supabase } from '@/lib/supabase'
import { CartProvider } from '@/lib/CartContext'
import StoreNavbar from '@/components/store/StoreNavbar'

async function getCategories() {
  const { data } = await supabase.from('categories').select('*').order('sort_order')
  return data || []
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories()
  return (
    <CartProvider>
      <div className="min-h-screen" style={{ background: '#0d1117' }}>

        <StoreNavbar categories={categories} />

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
