import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseIntent } from '@/lib/assistantIntent'

// Lightweight, free AI shopping assistant for the storefront.
// Uses Groq's free/fast API (OpenAI-compatible) and grounds every answer
// in a live lookup against the products table — never invents stock or
// prices. For full-build requests it ONLY recommends from the store
// owner's pre-verified "Ready-made Bundles" (see /ziad/dashboard → Ready
// Bundles) — it never assembles a combination of parts itself, since it
// can't reliably confirm things like CPU/motherboard socket compatibility
// from product names alone.

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

async function getBundles() {
  const { data: bundles } = await supabase.from('bundles').select('*').eq('active', true)
  if (!bundles || bundles.length === 0) return []

  const allProductIds = Array.from(new Set(bundles.flatMap(b => b.product_ids || [])))
  const { data: products } = allProductIds.length
    ? await supabase.from('products').select('id, name, price, stock, active').in('id', allProductIds)
    : { data: [] as any[] }
  const byId = Object.fromEntries((products || []).map(p => [p.id, p]))

  return bundles.map(b => {
    const items = (b.product_ids || []).map((id: string) => byId[id]).filter(Boolean)
    const total = items.reduce((s: number, p: any) => s + p.price, 0)
    const inStock = items.length > 0 && items.every((p: any) => p.active && p.stock > 0)
    return { name: b.name, description: b.description, items, total, inStock }
  }).filter(b => b.inStock)
}

function formatBundle(b: any) {
  const lines = b.items.map((p: any) => `  - ${p.name}`).join('\n')
  return `${b.name}${b.description ? ` (${b.description})` : ''} — ${b.total.toLocaleString()} EGP total:\n${lines}`
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

  if (intent.isBuildRequest) {
    // Full build request: ONLY recommend from the store owner's
    // pre-verified bundles — never assemble parts ourselves.
    const bundles = await getBundles()
    const inBudget = intent.budget
      ? bundles.filter(b => b.total <= intent.budget! * 1.2).sort((a, b) => b.total - a.total)
      : bundles

    productContext = inBudget.slice(0, 4).map(formatBundle).join('\n\n')
    extraInstructions = `
The customer wants a full PC build${intent.budget ? ` with a budget of about ${intent.budget} EGP` : ''}. Recommend ONLY from the READY-MADE BUNDLES listed below (pre-verified compatible by the store owner) — do NOT invent or assemble your own combination of parts, even if you think you could make a cheaper one.
- If one or more bundles fit, list each one's name, its parts (each on its own line, prefixed with "- "), and its total price.
- If NONE fit the budget, say so honestly and suggest the closest one anyway, or point them to WhatsApp (01124424414) so the team can build something custom for them.
- Keep it brief — no long explanations.`
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
      .limit(12) : { data: [] }
    productContext = (data || []).map(formatProduct).join('\n')
    extraInstructions = `\nThe customer has a budget of about ${intent.budget} EGP for this category. List ALL matching in-stock options below (not just one) as a bullet list, each on its own line prefixed with "- ", sorted from best/most expensive to cheapest, with prices — let them compare and pick. Do not merge them into a sentence or paragraph.`
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
    extraInstructions = `\nIf you list more than one product, put each on its own line prefixed with "- " — never merge multiple items into one sentence or paragraph.`
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
        .limit(6)
      products = data || []
    }
    if (products.length === 0) {
      const { data } = await supabase
        .from('products')
        .select(PRODUCT_FIELDS)
        .eq('active', true)
        .order('featured', { ascending: false })
        .limit(6)
      products = data || []
    }
    productContext = products.map(formatProduct).join('\n')
    extraInstructions = `\nIf you list more than one product, put each on its own line prefixed with "- " — never merge multiple items into one sentence or paragraph.`
  }

  const systemPrompt = `You are "مساعد ZAR3" — the sharp, street-smart shopping assistant for ZAR3 Hardware, a computer hardware store in Egypt (all prices in EGP). You know PC hardware well, but you NEVER let that knowledge leak into claims about specific products you don't have data on.

Tone:
- Talk like a real Egyptian guy who knows his hardware — عامية مصرية بسيطة وطبيعية, not formal/classical Arabic (فصحى), not stiff or robotic. Short, direct, confident sentences. It's fine to use light hardware slang customers actually use (كارت، بروسيسور، رامة، تجميعة).
- If the customer writes in English, reply in natural English the same way — casual and direct, not corporate.
- No fluff, no over-explaining, no repeating the question back to them.

Hard rules — breaking these makes you useless, so follow them exactly:
1. ONLY state stock levels, prices, and specs that literally appear in the CURRENT STOCK DATA below. If a customer asks about specs, RAM speed, VRAM, wattage, generation, etc. that ISN'T written in the data, say you don't have that exact detail on hand rather than pulling it from general knowledge — even if you're confident you "know" the real spec. A wrong guess is worse than "مش متأكد، بس المتاح عندي كذا".
2. Use each product's category exactly as given (e.g. a "Computer Cases" item is a case, not "a computer") — never relabel or reinterpret what something is.
3. Never assemble or suggest your own combination of separate parts (CPU + motherboard + RAM etc.) — you cannot reliably verify socket/compatibility. Only ever recommend complete builds from the READY-MADE BUNDLES data when the customer wants a full PC.
4. If nothing below matches what the customer asked, say so plainly and suggest they browse the site or message WhatsApp/Facebook — never fill the gap with a guess.
5. Keep answers short (2-4 sentences) unless listing multiple items — then use a clean bullet list, one item per line, never run them together in a paragraph.
6. To order, point customers to WhatsApp (01124424414), the Facebook page, or the "Add to Cart" button on the product itself.
7. Don't repeat information already given earlier in this conversation.${extraInstructions}

CURRENT STOCK DATA (live from the database — this is the ONLY source of truth you have):
${productContext || 'No specific products matched this question — ask the customer to clarify what they are looking for (which category, and their budget).'}`

  const maxTokens = intent.isBuildRequest ? 350 : intent.categorySlug && intent.budget ? 450 : 300

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
          ...(Array.isArray(history) ? history.slice(-4) : []),
          { role: 'user', content: message },
        ],
        temperature: intent.isBuildRequest ? 0.15 : 0.4,
        max_tokens: maxTokens,
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
