import { supabase } from '@/lib/supabase'
import PCBuilderClient from './PCBuilderClient'

export const revalidate = 60

const BUILD_PARTS = [
  { slug: 'processors-cpu', label: 'المعالج (CPU)', icon: '⚙️', required: true },
  { slug: 'motherboards', label: 'اللوحة الأم', icon: '🔌', required: true },
  { slug: 'memory-ram', label: 'الرامة (RAM)', icon: '💾', required: true },
  { slug: 'graphics-cards-gpu', label: 'كارت الشاشة (GPU)', icon: '🎮', required: false },
  { slug: 'storage', label: 'وحدة التخزين', icon: '💿', required: true },
  { slug: 'power-supplies-psu', label: 'الباور (PSU)', icon: '⚡', required: true },
  { slug: 'computer-cases', label: 'الكيس', icon: '🖥️', required: true },
  { slug: 'cooling-fans', label: 'التبريد', icon: '❄️', required: false },
]

async function getData() {
  const { data: categories } = await supabase.from('categories').select('id, slug')
  const slugToId: Record<string, string> = {}
  ;(categories || []).forEach((c: any) => { slugToId[c.slug] = c.id })

  const parts = await Promise.all(
    BUILD_PARTS.map(async (part) => {
      const catId = slugToId[part.slug]
      if (!catId) return { ...part, products: [] }
      const { data } = await supabase
        .from('products')
        .select('id, name, description, price, original_price, stock, images, specs, featured, warranty, created_at, category_id, category:categories(id,name,slug,icon)')
        .eq('active', true)
        .eq('category_id', catId)
        .gt('stock', 0)
        .order('price', { ascending: true })
      return { ...part, products: (data || []).map((p: any) => ({ ...p, active: true })) }
    })
  )

  return parts
}

export default async function BuildPage() {
  const parts = await getData()
  return <PCBuilderClient parts={parts} />
}
