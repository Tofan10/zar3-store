import { supabase } from '@/lib/supabase'
import { Product, Category } from '@/lib/types'
import Link from 'next/link'
import SearchableProducts from './SearchableProducts'

export const revalidate = 60

async function getData() {
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, category:categories(*)').eq('active', true).order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('sort_order'),
  ])
  return { products: products || [], categories: categories || [] }
}

export default async function StorePage() {
  const { products, categories } = await getData()

  return (
    <div>
      <div style={{ background: '#080c12', borderBottom: '1px solid #21262d', padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 40, fontWeight: 600, color: '#e6edf3', marginBottom: 12, letterSpacing: '-1px' }}>
          ZAR<span style={{ color: '#378ADD' }}>3</span> Hardware
        </h1>
        <p style={{ color: '#8b949e', fontSize: 16, marginBottom: 28 }}>
          PC Builds · Monitors · Accessories · Parts — Order via WhatsApp or Facebook
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://wa.me/201124424414?text=Hello, I'd like to order from ZAR3 Hardware"
            target="_blank" rel="noopener"
            style={{ background: '#128c7e', color: '#fff', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
            Order on WhatsApp
          </a>
          <a href="https://www.facebook.com/profile.php?id=61554098374352"
            target="_blank" rel="noopener"
            style={{ background: '#1877f2', color: '#fff', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
            Message on Facebook
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 48 }}>
          {categories.map((cat: Category) => (
            <Link key={cat.id} href={`/store/category/${cat.slug}`} style={{
              background: '#161b22', border: '1px solid #21262d', borderRadius: 12,
              padding: '20px', textDecoration: 'none', textAlign: 'center',
              transition: 'border-color 0.15s', display: 'block'
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.icon}</div>
              <div style={{ color: '#e6edf3', fontWeight: 500, fontSize: 15 }}>{cat.name}</div>
              <div style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>{cat.description}</div>
            </Link>
          ))}
        </div>

        <SearchableProducts products={products} />
      </div>
    </div>
  )
}
