import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Lightweight, free AI shopping assistant for the storefront.
// Uses Groq's free/fast API (OpenAI-compatible) and grounds every answer
// in a live lookup against the products table — never invents stock or
// prices.

export async function POST(req: NextRequest) {
  const { message, history } = await req.json()

  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'AI assistant is not configured yet (missing GROQ_API_KEY).' }, { status: 503 })
  }

  // Pull real products that match words in the customer's message, so the
  // assistant answers from actual current stock/price instead of guessing.
  const words = message
    .toLowerCase()
    .split(/\s+/)
    .filter((w: string) => w.length > 2)
    .slice(0, 5)

  let products: any[] = []
  if (words.length) {
    const orFilter = words.map((w: string) => `name.ilike.%${w}%`).join(',')
    const { data } = await supabase
      .from('products')
      .select('name, price, original_price, stock, description, warranty, category:categories(name)')
      .eq('active', true)
      .or(orFilter)
      .limit(10)
    products = data || []
  }

  // Fallback so the assistant always has something concrete to point to.
  if (products.length === 0) {
    const { data } = await supabase
      .from('products')
      .select('name, price, original_price, stock, description, warranty, category:categories(name)')
      .eq('active', true)
      .order('featured', { ascending: false })
      .limit(8)
    products = data || []
  }

  const productContext = products
    .map((p) => {
      const cat = (p.category as any)?.name || ''
      const stock = p.stock > 0 ? `${p.stock} available` : 'OUT OF STOCK'
      const price = p.original_price && p.original_price > p.price
        ? `${p.price} EGP (was ${p.original_price} EGP)`
        : `${p.price} EGP`
      const warranty = p.warranty ? ` | Warranty: ${p.warranty} days` : ''
      return `- ${p.name} | ${cat} | ${price} | Stock: ${stock}${warranty}`
    })
    .join('\n')

  const systemPrompt = `You are the friendly shopping assistant for ZAR3 Hardware, a computer hardware store in Egypt (all prices in EGP).

Rules:
- ONLY state stock levels and prices from the CURRENT STOCK DATA below — never invent or guess numbers.
- If nothing below matches what the customer asked, say you're not sure and suggest they browse the site or message on WhatsApp/Facebook, rather than making something up.
- Keep answers short and conversational (2-4 sentences) unless the customer asks for more detail.
- To order, point customers to WhatsApp (01124424414), the Facebook page, or the "Add to Cart" button on the product itself.
- Reply in the same language the customer wrote in (Arabic or English).

CURRENT STOCK DATA (live from the database):
${productContext || 'No specific products matched this question — ask the customer to clarify what they are looking for.'}`

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(Array.isArray(history) ? history.slice(-6) : []),
          { role: 'user', content: message },
        ],
        temperature: 0.4,
        max_tokens: 400,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      return NextResponse.json({ error: 'AI request failed', detail: errText }, { status: 502 })
    }

    const data = await groqRes.json()
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response."
    return NextResponse.json({ reply })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}
