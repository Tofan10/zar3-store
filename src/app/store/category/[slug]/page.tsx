import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/types'
import { notFound } from 'next/navigation'
import SearchableProducts from '../../SearchableProducts'

async function getData(slug: string) {
  const { data: category } = await supabase
    .from('categories').select('*').eq('slug', slug).single()
  if (!category) return { category: null, products: [] }
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('active', true)
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })
  return { category, products: products || [] }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { category, products } = await getData(slug)
  if (!category) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{category.icon}</div>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#e6edf3', marginBottom: 6 }}>{category.name}</h1>
        <p style={{ color: '#8b949e', fontSize: 15 }}>{category.description}</p>
        <div style={{ color: '#378ADD', fontSize: 13, marginTop: 8 }}>{products.length} products available</div>
      </div>

      <SearchableProducts products={products} />
    </div>
  )
}
