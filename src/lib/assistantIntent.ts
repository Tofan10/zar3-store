// Understands budget and category intent from natural Arabic/English
// questions like "جمعلي تجميعة بـ30 ألف" or "عايز كارت بـ14 ألف" so the
// assistant can pull the right slice of real stock instead of relying on
// literal product-name keyword matches.

const CATEGORY_KEYWORDS: { slug: string; words: string[] }[] = [
  { slug: 'graphics-cards-gpu', words: ['كارت شاشه', 'كارت شاشة', 'كارت جرافيك', 'كارت', 'جرافيك', 'gpu', 'graphics card', 'video card'] },
  { slug: 'processors-cpu', words: ['معالج', 'برسيسور', 'بروسيسور', 'cpu', 'processor'] },
  { slug: 'motherboards', words: ['بوردة', 'بورد', 'مذربورد', 'motherboard', 'mobo'] },
  { slug: 'memory-ram', words: ['رامة', 'رام', ' ram', 'memory'] },
  { slug: 'storage', words: ['هارد', 'تخزين', 'ssd', 'hdd', 'nvme', 'storage'] },
  { slug: 'power-supplies-psu', words: ['باور', 'power supply', ' psu'] },
  { slug: 'computer-cases', words: ['كيس', 'كيسة', 'computer case', ' case'] },
  { slug: 'cooling-fans', words: ['كولر', 'تبريد', 'مروحة', 'cooling', 'fan'] },
  { slug: 'monitor', words: ['شاشة', 'شاشه', 'monitor'] },
  { slug: 'mouse', words: ['ماوس', 'mouse'] },
  { slug: 'keyboard', words: ['كيبورد', 'لوحة مفاتيح', 'keyboard'] },
  { slug: 'headset', words: ['هيدسيت', 'سماعة', 'headset', 'headphone'] },
]

const BUILD_WORDS = ['تجميعة', 'تجميعه', 'تجميع كمبيوتر', 'تجميع جهاز', 'بيلد', 'build', 'pc build', 'full pc', 'جهاز كامل']

export interface QueryIntent {
  budget: number | null
  categorySlug: string | null
  isBuildRequest: boolean
}

export function parseIntent(message: string): QueryIntent {
  const text = message.toLowerCase()

  // Budget: "30 ألف", "30الف", "14k", or a bare 4-6 digit number
  let budget: number | null = null
  const thousandsMatch = text.match(/(\d+(?:\.\d+)?)\s*(ألف|الف|k\b)/i)
  if (thousandsMatch) {
    budget = Math.round(parseFloat(thousandsMatch[1]) * 1000)
  } else {
    const bareMatch = text.match(/\b(\d{4,6})\b/)
    if (bareMatch) budget = parseInt(bareMatch[1], 10)
  }

  const isBuildRequest = BUILD_WORDS.some(w => text.includes(w))

  let categorySlug: string | null = null
  if (!isBuildRequest) {
    for (const c of CATEGORY_KEYWORDS) {
      if (c.words.some(w => text.includes(w))) {
        categorySlug = c.slug
        break
      }
    }
  }

  return { budget, categorySlug, isBuildRequest }
}

// Rough budget split for a full build suggestion.
export const BUILD_ALLOCATION: { slug: string; label: string; share: number }[] = [
  { slug: 'processors-cpu', label: 'CPU', share: 0.25 },
  { slug: 'motherboards', label: 'Motherboard', share: 0.12 },
  { slug: 'memory-ram', label: 'RAM', share: 0.10 },
  { slug: 'graphics-cards-gpu', label: 'GPU', share: 0.30 },
  { slug: 'storage', label: 'Storage', share: 0.08 },
  { slug: 'power-supplies-psu', label: 'PSU', share: 0.08 },
  { slug: 'computer-cases', label: 'Case', share: 0.07 },
]
