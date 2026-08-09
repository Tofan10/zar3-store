import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'
import SearchableProducts from './SearchableProducts'
import ProductCarousel from '@/components/store/ProductCarousel'
import BrandStrip from '@/components/store/BrandStrip'
import TopSearchBar from '@/components/store/TopSearchBar'
import BundlesSection from '@/components/store/BundlesSection'
import { groupCategories } from '@/lib/categoryGroups'
import { getActiveBundles } from '@/lib/bundles'

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
