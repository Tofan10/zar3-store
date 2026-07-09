import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkApiKey } from '@/lib/auth'

// GET /api/v1/products/[id]
// Header: x-api-key: <the key you gave them>
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: 'Invalid or missing API key. Send it in the "x-api-key" header.' }, { status: 401 })
  }

  const { id } = await params
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, original_price, stock, images, specs, featured, warranty, created_at, category:categories(id,name,slug,icon)')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (error) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json({ data })
}
