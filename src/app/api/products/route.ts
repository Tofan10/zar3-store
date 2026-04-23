import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')

  let query = supabaseAdmin
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  if (all !== 'true') {
    query = query.eq('active', true)
  }
  if (category) query = query.eq('categories.slug', category)
  if (featured === 'true') query = query.eq('featured', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await checkAdminAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([body])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
