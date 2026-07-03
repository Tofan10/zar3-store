import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import SearchableProducts from '../../SearchableProducts'
import { BRANDS, brandSlug } from '@/lib/brands'

export const revalidate = 60

async function getData(slug: string) {
  const brand = BRANDS.find(b => brandSlug(b.name) === slug)
  if (!brand) return { brand: null, products: [] }
  const { data: allProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('active', true)
    .order('created_at', { ascending: false })
  const products = (allProducts || []).filter(p => {
    const name = ` ${p.name.toLowerCase()} `
    return brand.match.some(kw => name.includes(kw))
  })
  return { brand, products }
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandParam } = await params
  const { brand, products } = await getData(brandParam)
  if (!brand) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="reveal" style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>🏷️ Shop by Brand</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: brand.color === '#000000' ? 'var(--text)' : brand.color, marginBottom: 6 }}>{brand.name}</h1>
        <div style={{ color: 'var(--brand)', fontSize: 13, marginTop: 8, fontWeight: 600 }}>{products.length} products available</div>
      </div>

      <SearchableProducts products={products} />
    </div>
  )
}
