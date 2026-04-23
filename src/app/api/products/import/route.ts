import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!await checkAdminAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { rows } = body // [{ name, price, stock, category_slug }]

  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 })

  // Fetch all categories to map slug -> id
  const { data: categories, error: catError } = await supabaseAdmin
    .from('categories')
    .select('id, slug')

  if (catError) return NextResponse.json({ error: catError.message }, { status: 500 })

  const slugToId: Record<string, string> = {}
  for (const c of categories ?? []) slugToId[c.slug] = c.id

  // Delete all existing products
  const { error: deleteError } = await supabaseAdmin
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // delete all

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  // Build insert rows
  const inserts = []
  const skipped = []

  for (const row of rows) {
    const name = row.name?.toString().trim()
    const price = parseFloat(row.price)
    const stock = parseInt(row.stock)
    const slug = row.category_slug?.toString().trim()
    const category_id = slugToId[slug]

    if (!name || isNaN(price) || isNaN(stock)) {
      skipped.push({ row, reason: 'missing name/price/stock' })
      continue
    }
    if (!category_id) {
      skipped.push({ row, reason: `unknown category_slug: ${slug}` })
      continue
    }

    inserts.push({
      name,
      price,
      stock,
      category_id,
      images: [],
      specs: {},
      featured: false,
      active: true,
    })
  }

  if (inserts.length === 0)
    return NextResponse.json({ error: 'No valid rows to insert', skipped }, { status: 400 })

  const { error: insertError } = await supabaseAdmin
    .from('products')
    .insert(inserts)

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  return NextResponse.json({ inserted: inserts.length, skipped })
}
