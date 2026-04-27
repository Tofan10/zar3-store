import { supabase } from '@/lib/supabase'
import { Product, Category } from '@/lib/types'
import Link from 'next/link'
import SearchableProducts from './SearchableProducts'

const LOGO_URL = 'https://gumjhqrfsvngjppciowu.supabase.co/storage/v1/object/sign/logo/481354976_122205531740136612_8758662314822517452_n.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84MDU0Y2IzOC04OWQ3LTQzODgtODM4ZC02MmE4MGJmODE3NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvLzQ4MTM1NDk3Nl8xMjIyMDU1MzE3NDAxMzY2MTJfODc1ODY2MjMxNDgyMjUxNzQ1Ml9uLmpwZyIsImlhdCI6MTc3NzI1Mjg2NiwiZXhwIjoyMDkyNjEyODY2fQ.DktxglH6FH6lD5_5wMCoOs4yZPtnGAotyvike91iPqY'

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
    // md:pr-[190px] عشان المحتوى متتغطاش بالسايدبار على الديسكتوب
    <div className="md:pr-[190px]">

      {/* HERO SECTION */}
      <div style={{ background: '#080c12', borderBottom: '1px solid #21262d', textAlign: 'center' }}
        className="px-4 py-10 sm:py-16">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <img
            src={LOGO_URL}
            alt="ZAR3"
            style={{
              width: 90, height: 90, borderRadius: '50%', objectFit: 'cover',
              boxShadow: '0 0 20px 6px #378ADD88, 0 0 40px 10px #1a6fc444',
            }}
          />
        </div>
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
        <SearchableProducts products={products} />
      </div>

    </div>
  )
}
