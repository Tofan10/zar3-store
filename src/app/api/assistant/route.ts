import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseIntent, BUILD_ALLOCATION } from '@/lib/assistantIntent'

// Lightweight, free AI shopping assistant for the storefront.
// Uses Groq's free/fast API (OpenAI-compatible) and grounds every answer
// in a live lookup against the products table — never invents stock or
// prices. Understands budget + category + "build me a PC" intent, not just
// literal product-name keyword matches.

const PRODUCT_FIELDS = 'name, price, original_price, stock, description, warranty, category:categories(name,slug)'

async function getCategoryId(slug: string): Promise<string | null> {
  const { data } = await supabase.from('categories').select('id').eq('slug', slug).single()
  return data?.id ?? null
}

function formatProduct(p: any) {
  const cat = (p.category as any)?.name || ''
  const stock = p.stock > 0 ? `${p.stock} available` : 'OUT OF STOCK'
  const price = p.original_price && p.original_price > p.price
    ? `${p.price} EGP (was ${p.original_price} EGP)`
    : `${p.price} EGP`
  const warranty = p.warranty ? ` | Warranty: ${p.warranty} days` : ''
  return `- ${p.name} | ${cat} | ${price} | Stock: ${stock}${warranty}`
}

export async function POST(req: NextRequest) {
  const { message, history } = await req.json()

  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'AI assistant is not configured yet (missing GROQ_API_KEY).' }, { status: 503 })
  }

  const intent = parseIntent(message)
  let productContext = ''
  let extraInstructions = ''

  if (intent.isBuildRequest && intent.budget) {
    // Full build request with a budget: pull realistic candidates per
    // category, split across a rough budget allocation, so the model can
    // assemble one or more complete builds within the total.
    const sections: string[] = []
    for (const part of BUILD_ALLOCATION) {
      const subBudget = Math.round(intent.budget * part.share * 1.3) // some headroom
      const catId = await getCategoryId(part.slug)
      if (!catId) continue
      const { data } = await supabase
        .from('products')
        .select(PRODUCT_FIELDS)
        .eq('active', true)
        .eq('category_id', catId)
        .lte('price', subBudget)
        .gt('stock', 0)
        .order('price', { ascending: false })
        .limit(6)
      if (data && data.length) {
        sections.push(`${part.label} (target ~${subBudget} EGP):\n${data.map(formatProduct).join('\n')}`)
      }
    }
    productContext = sections.join('\n\n')
    extraInstructions = `
The customer wants a full PC build with a total budget of about ${intent.budget} EGP. Using ONLY the in-stock items listed below (grouped by part), assemble ONE clear, well-balanced build that fits the total budget (if both Intel and AMD CPU options exist below, you may offer one build of each so the customer can choose, but do not present more than 2 builds).

Follow these rules strictly:
- Use each part's name and category EXACTLY as written below — never rename or reinterpret a part (e.g. a "Computer Cases" item is a case, not "a computer"; do not invent a friendlier label for it).
- Prefer at least 16GB of total RAM if any combination of the listed RAM options reaches that within budget. If the best you can do within budget is below 16GB, say so plainly (e.g. "only 8GB fits this budget — recommend upgrading later") instead of presenting it as ideal.
- Make sure the CPU and motherboard you pick are the same platform (an AMD CPU needs an AMD motherboard, an Intel CPU needs an Intel-compatible motherboard) — never mix an AMD CPU with an Intel board or vice versa.
- Be decisive and consistent: pick the single best-value combination from the options given rather than a random mix, so the same question would get essentially the same recommendation each time.
- End with the parts list, each item's price, and the running total.`
  } else if (intent.categorySlug && intent.budget) {
    // Category + budget: e.g. "GPU for 14k" — list every matching in-stock
    // item, not just a handful, since the customer explicitly wants to
    // compare all the options.
    const catId = await getCategoryId(intent.categorySlug)
    const { data } = catId ? await supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('active', true)
      .eq('category_id', catId)
      .lte('price', Math.round(intent.budget * 1.1))
      .gt('stock', 0)
      .order('price', { ascending: false })
      .limit(20) : { data: [] }
    productContext = (data || []).map(formatProduct).join('\n')
    extraInstructions = `\nThe customer has a budget of about ${intent.budget} EGP for this category. List ALL matching in-stock options below (not just one), sorted from best/most expensive to cheapest, with prices — let them compare and pick.`
  } else if (intent.categorySlug) {
    const catId = await getCategoryId(intent.categorySlug)
    const { data } = catId ? await supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('active', true)
      .eq('category_id', catId)
      .order('featured', { ascending: false })
      .limit(15) : { data: [] }
    productContext = (data || []).map(formatProduct).join('\n')
  } else {
    // Generic keyword search fallback against product names.
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
        .select(PRODUCT_FIELDS)
        .eq('active', true)
        .or(orFilter)
        .limit(10)
      products = data || []
    }
    if (products.length === 0) {
      const { data } = await supabase
        .from('products')
        .select(PRODUCT_FIELDS)
        .eq('active', true)
        .order('featured', { ascending: false })
        .limit(8)
      products = data || []
    }
    productContext = products.map(formatProduct).join('\n')
  }

  const systemPrompt = `You are the friendly shopping assistant for ZAR3 Hardware, a computer hardware store in Egypt (all prices in EGP).

Rules:
- ONLY state stock levels and prices from the CURRENT STOCK DATA below — never invent or guess numbers.
- Use each product's category exactly as given (e.g. a "Computer Cases" item is a case, not "a computer") — never relabel or reinterpret what something is.
- If nothing below matches what the customer asked, say you're not sure and suggest they browse the site or message on WhatsApp/Facebook, rather than making something up.
- Keep answers short and conversational unless the customer asks for a build/comparison, in which case a clear list is fine.
- To order, point customers to WhatsApp (01124424414), the Facebook page, or the "Add to Cart" button on the product itself.
- Reply in the same language the customer wrote in (Arabic or English).${extraInstructions}

CURRENT STOCK DATA (live from the database):
${productContext || 'No specific products matched this question — ask the customer to clarify what they are looking for (which category, and their budget).'}`

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
        temperature: intent.isBuildRequest ? 0.15 : 0.4,
        max_tokens: 600,
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
