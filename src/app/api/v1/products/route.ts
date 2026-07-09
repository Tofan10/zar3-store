import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkApiKey } from '@/lib/auth'

// Public-facing products API for external/third-party access.
// Usage:  GET /api/v1/products
//         Header: x-api-key: <the key you gave them>
//
// Optional query params:
//   category  - filter by category slug, e.g. ?category=processors-cpu
//   featured  - "true" to only return featured products
//   q         - search by product name
//   page      - page number (default 1)
//   limit     - results per page (default 20, max 100)
//
// Only returns ACTIVE products. No write access is exposed here — this
// route is read-only by design, separate from the admin-only routes
// under /api/products used by the dashboard.

export async function GET(req: NextRequest) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: 'Invalid or missing API key. Send it in the "x-api-key" header.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const q = searchParams.get('q')
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20))
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('products')
    .select('id, name, description, price, original_price, stock, images, specs, featured, warranty, created_at, category:categories(id,name,slug,icon)', { count: 'exact' })
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('categories.slug', category)
  if (featured === 'true') query = query.eq('featured', true)
  if (q) query = query.ilike('name', `%${q}%`)

  const { data, error, count } = await query.range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
    },
  })
}
