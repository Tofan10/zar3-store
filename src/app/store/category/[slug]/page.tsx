import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/store/ProductCard'
import { Product, Category } from '@/lib/types'
import { notFound } from 'next/navigation'

async function getData(slug: string) {
  const [{ data: category }, { data: products }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', slug).single(),
    supabase.from('products').select('*, category:categories(*)').eq('active', true)
      .eq('category_id', (await supabase.from('categories').select('id').eq('slug', slug).single()).data?.id)
      .order('created_at', { ascending: false }),
  ])
  return { category, products: products || [] }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { category, products } = await getData(params.slug)
  if (!category) notFound()

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{category.icon}</div>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#e6edf3', marginBottom: 6 }}>{category.name}</h1>
        <p style={{ color: '#8b949e', fontSize: 15 }}>{category.description}</p>
        <div style={{ color: '#378ADD', fontSize: 13, marginTop: 8 }}>{products.length} products available</div>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#8b949e', padding: '80px 0', fontSize: 15 }}>
          No products in this category yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {products.map((p: Product) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
