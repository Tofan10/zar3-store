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
      {/* HERO SECTION */}
      <div style={{ background: '#080c12', borderBottom: '1px solid #21262d', textAlign: 'center' }}
        className="px-4 py-10 sm:py-16">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight mb-3"
          style={{ color: '#e6edf3' }}>
          ZAR<span style={{ color: '#378ADD' }}>3</span> Hardware
        </h1>
        <p className="text-sm sm:text-base mb-6 px-2" style={{ color: '#8b949e' }}>
          PC Builds · Monitors · Accessories · Parts — Order via WhatsApp or Facebook
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
          <a href="https://wa.me/201124424414?text=Hello, I'd like to order from ZAR3 Hardware"
            target="_blank" rel="noopener"
            className="w-full sm:w-auto text-center"
            style={{ background: '#128c7e', color: '#fff', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
            Order on WhatsApp
          </a>
          <a href="https://www.facebook.com/profile.php?id=61554098374352"
            target="_blank" rel="noopener"
            className="w-full sm:w-auto text-center"
            style={{ background: '#1877f2', color: '#fff', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
            Message on Facebook
          </a>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        
        {/* CATEGORIES GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
          {categories.map((cat: Category) => (
            <Link key={cat.id} href={`/store/category/${cat.slug}`}
              className="block text-center rounded-xl p-4 sm:p-5 transition-colors duration-150"
              style={{ background: '#161b22', border: '1px solid #21262d', textDecoration: 'none' }}>
              <div className="text-2xl sm:text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm sm:text-base font-medium" style={{ color: '#e6edf3' }}>{cat.name}</div>
              <div className="text-xs sm:text-sm mt-1" style={{ color: '#8b949e' }}>{cat.description}</div>
            </Link>
          ))}
        </div>

        <SearchableProducts products={products} />
      </div>
    </div>
  )
}
