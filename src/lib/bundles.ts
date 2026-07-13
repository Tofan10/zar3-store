import { supabase } from '@/lib/supabase'

export interface EnrichedBundle {
  id: string
  name: string
  description: string
  active: boolean
  created_at: string
  items: any[]
  total: number
  allInStock: boolean
}

/** Fetches active bundles with their real product details + computed total, for use in server components (homepage, etc). */
export async function getActiveBundles(): Promise<EnrichedBundle[]> {
  const { data: bundles } = await supabase
    .from('bundles')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (!bundles || bundles.length === 0) return []

  const allProductIds = Array.from(new Set(bundles.flatMap(b => b.product_ids || [])))
  let productsById: Record<string, any> = {}
  if (allProductIds.length) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, stock, images, active, description, original_price, specs, featured, warranty, created_at, category_id, category:categories(name,icon,slug)')
      .in('id', allProductIds)
    productsById = Object.fromEntries((products || []).map(p => [p.id, p]))
  }

  return bundles.map(b => {
    const items = (b.product_ids || []).map((id: string) => productsById[id]).filter(Boolean)
    const total = items.reduce((sum: number, p: any) => sum + (p?.price || 0), 0)
    const allInStock = items.length > 0 && items.every((p: any) => p.active && p.stock > 0)
    return { ...b, items, total, allInStock }
  }).filter(b => b.allInStock)
}
