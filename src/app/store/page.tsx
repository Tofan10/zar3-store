import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'
import SearchableProducts from './SearchableProducts'
import ProductCarousel from '@/components/store/ProductCarousel'
import BrandStrip from '@/components/store/BrandStrip'
import TopSearchBar from '@/components/store/TopSearchBar'
import BundlesSection from '@/components/store/BundlesSection'
import { groupCategories } from '@/lib/categoryGroups'
import { getActiveBundles } from '@/lib/bundles'

const LOGO_URL = 'https://gumjhqrfsvngjppciowu.supabase.co/storage/v1/object/sign/logo/481354976_122205531740136612_8758662314822517452_n.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84MDU0Y2IzOC04OWQ3LTQzODgtODM4ZC02MmE4MGJmODE3NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvLzQ4MTM1NDk3Nl8xMjIyMDU1MzE3NDAxMzY2MTJfODc1ODY2MjMxNDgyMjUxNzQ1Ml9uLmpwZyIsImlhdCI6MTc3NzI1Mjg2NiwiZXhwIjoyMDkyNjEyODY2fQ.DktxglH6FH6lD5_5wMCoOs4yZPtnGAotyvike91iPqY'

export const revalidate = 60

async function getData() {
  const [{ data: products }, { data: categories }, bundles] = await Promise.all([
    supabase.from('products').select('*, category:categories(*)').eq('active', true).order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('sort_order'),
    getActiveBundles(),
  ])
  return { products: products || [], categories: categories || [], bundles }
}

export default async function StorePage() {
  const { products, categories, bundles } = await getData()
  const groups = groupCategories(categories)

  return (
    <div style={{ paddingTop: 20 }}>

      <TopSearchBar />

      {/* HERO SECTION */}
      <div style={{ background: 'linear-gradient(135deg, #0369a1, #0ea5e9 55%, #38bdf8)', textAlign: 'center', position: 'relative', overflow: 'hidden', borderRadius: 16 }}
        className="px-4 py-12 sm:py-20">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 0, transparent 40%), radial-gradient(circle at 80% 70%, #fff 0, transparent 40%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="spin-slow" style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <img
              src={LOGO_URL}
              alt="ZAR3"
              style={{
                width: 96, height: 96, borderRadius: '50%', objectFit: 'cover',
                boxShadow: '0 0 0 6px rgba(255,255,255,0.25), 0 10px 30px rgba(0,0,0,0.35)',
              }}
            />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 reveal"
            style={{ color: '#fff' }}>
            ZAR<span style={{ color: '#e0f2fe' }}>3</span> Hardware
          </h1>
          <p className="text-sm sm:text-base mb-7 px-2 reveal" style={{ color: '#e0f2fe', animationDelay: '0.1s' }}>
            PC Builds · Monitors · Accessories · Parts — Order via WhatsApp or Facebook
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4 reveal" style={{ animationDelay: '0.2s' }}>
            <a href="https://wa.me/201124424414?text=Hello, I'd like to order from ZAR3 Hardware"
              target="_blank" rel="noopener"
              className="w-full sm:w-auto text-center"
              style={{ background: '#128c7e', color: '#fff', borderRadius: 10, padding: '13px 26px', fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 8px 20px -6px rgba(0,0,0,0.35)' }}>
              💬 Order on WhatsApp
            </a>
            <a href="https://www.facebook.com/profile.php?id=61554098374352"
              target="_blank" rel="noopener"
              className="w-full sm:w-auto text-center"
              style={{ background: '#1877f2', color: '#fff', borderRadius: 10, padding: '13px 26px', fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 8px 20px -6px rgba(0,0,0,0.35)' }}>
              📘 Message on Facebook
            </a>
          </div>
        </div>
      </div>

      {/* TAGLINE STRIP */}
      <div style={{ background: '#080c12', border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center', padding: '10px 16px', marginTop: 16 }}>
        <span style={{ color: 'var(--brand-dark)', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.6 }}>
          CHECK LATEST PRODUCTS FROM HARDWARE, ACCESSORIES, AND MONITORS
        </span>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <BundlesSection bundles={bundles} />

        {groups.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {groups.map(g => {
              const groupProducts = products.filter((p: any) => g.items.some((c: any) => c.id === p.category_id)).slice(0, 12)
              return (
                <ProductCarousel
                  key={g.key}
                  anchorId={g.anchor}
                  title={g.title}
                  icon={g.icon}
                  products={groupProducts}
                />
              )
            })}
          </div>
        )}

        <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 36px' }} />

        <BrandStrip products={products} />

        <Suspense fallback={null}>
        <SearchableProducts products={products} />
      </Suspense>
      </div>

    </div>
  )
}
