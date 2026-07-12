import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/auth'

// GET /api/bundles          -> active bundles only (storefront + assistant)
// GET /api/bundles?all=true -> all bundles, admin only (dashboard)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'

  if (all && !(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let query = supabase.from('bundles').select('*').order('created_at', { ascending: false })
  if (!all) query = query.eq('active', true)

  const { data: bundles, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Populate each bundle's real product details + computed total price
  const allProductIds = Array.from(new Set((bundles || []).flatMap(b => b.product_ids || [])))
  let productsById: Record<string, any> = {}
  if (allProductIds.length) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, stock, images, active, category:categories(name,icon)')
      .in('id', allProductIds)
    productsById = Object.fromEntries((products || []).map(p => [p.id, p]))
  }

  const enriched = (bundles || []).map(b => {
    const items = (b.product_ids || []).map((id: string) => productsById[id]).filter(Boolean)
    const total = items.reduce((sum: number, p: any) => sum + (p?.price || 0), 0)
    const allInStock = items.length > 0 && items.every((p: any) => p.active && p.stock > 0)
    return { ...b, items, total, allInStock }
  })

  return NextResponse.json(enriched)
}

export async function POST(req: NextRequest) {
  if (!await checkAdminAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('bundles')
    .insert([body])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
