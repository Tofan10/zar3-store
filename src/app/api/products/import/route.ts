import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!await checkAdminAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rows } = await req.json()
  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 })

  const { data: categories, error: catError } = await supabaseAdmin.from('categories').select('id, slug')
  if (catError) return NextResponse.json({ error: catError.message }, { status: 500 })

  const slugToId: Record<string, string> = {}
  for (const c of categories ?? []) slugToId[c.slug] = c.id

  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('id, name, category_id, images, specs, featured, active, warranty, description')

  const existingMap: Record<string, any> = {}
  for (const p of existing ?? []) existingMap[`${p.name}||${p.category_id}`] = p

  // ✅ احفظ الصور بالاسم بس (مش بالكاتيجوري) عشان لو اتنقل كاتيجوري نرجعله صوره
  const imagesByName: Record<string, string[]> = {}
  for (const p of existing ?? []) {
    if (p.images?.length > 0) imagesByName[p.name.trim()] = p.images
  }

  const mergedMap: Record<string, any> = {}
  const skipped: any[] = []

  for (const row of rows) {
    const name = row.name?.toString().trim()
    const price = parseFloat(row.price)
    const stock = parseInt(row.stock)
    const slug = row.category_slug?.toString().trim()
    const category_id = slugToId[slug]
    const warranty = row.warranty ? parseInt(row.warranty) : null
    const description = (row.description || '').toString().trim()
    const specs = row.specs && Object.keys(row.specs).length > 0 ? row.specs : {}

    if (!name || isNaN(price) || isNaN(stock)) {
      skipped.push({ row, reason: 'missing name/price/stock' })
      continue
    }
    if (!category_id) {
      skipped.push({ row, reason: `unknown category_slug: ${slug}` })
      continue
    }

    const key = `${name}||${category_id}`
    if (mergedMap[key]) {
      mergedMap[key].stock += stock
      if (specs && Object.keys(specs).length > 0)
        mergedMap[key].specs = { ...mergedMap[key].specs, ...specs }
    } else {
      mergedMap[key] = { name, price, stock, category_id, warranty, description, specs }
    }
  }

  if (Object.keys(mergedMap).length === 0)
    return NextResponse.json({ error: 'No valid rows to insert', skipped }, { status: 400 })

  let inserted = 0
  let updated = 0
  let deleted = 0

  for (const [key, row] of Object.entries(mergedMap) as any) {
    const existing_product = existingMap[key]

    if (existing_product) {
      await supabaseAdmin.from('products').update({
        price: row.price,
        stock: row.stock,
        warranty: row.warranty ?? existing_product.warranty,
        description: row.description || existing_product.description,
        specs: { ...existing_product.specs, ...row.specs },
        // ✅ الصور ما بتتغيرش أبداً عند الـ update
        images: existing_product.images ?? [],
      }).eq('id', existing_product.id)
      updated++
    } else {
      // ✅ منتج جديد — شوف لو عنده صور من قبل بنفس الاسم
      const savedImages = imagesByName[row.name] ?? []
      await supabaseAdmin.from('products').insert({
        name: row.name,
        price: row.price,
        stock: row.stock,
        category_id: row.category_id,
        warranty: row.warranty,
        description: row.description,
        specs: row.specs,
        images: savedImages,  // ✅ رجّع الصور القديمة لو موجودة
        featured: false,
        active: true,
      })
      inserted++
    }
  }

  // ✅ Delete: لكن احفظ الصور في imagesByName قبل الحذف (موجودة فوق)
  for (const [key, existing_product] of Object.entries(existingMap) as any) {
    if (!mergedMap[key]) {
      await supabaseAdmin.from('products').delete().eq('id', existing_product.id)
      deleted++
    }
  }

  return NextResponse.json({ inserted, updated, deleted, skipped })
}
