// Detects a product's condition (New / Like New / Open Box / Used) from
// its free-text description, so we can show it as a clear badge instead
// of the customer having to read the whole description to figure it out.

export type Condition = 'New' | 'Like New' | 'Open Box' | 'Used'

export function detectCondition(description: string | null | undefined): Condition | null {
  if (!description) return null
  const d = description.toLowerCase()

  // Order matters — check the more specific phrases first.
  if (/\blike\s*new\b/.test(d)) return 'Like New'
  if (/\bopen\s*(box|test)?\b/.test(d) && !/\bnot\s+open/.test(d)) return 'Open Box'
  if (/\bused\b/.test(d)) return 'Used'
  if (/\bnew\b/.test(d) || /\bbrand\s*new\b/.test(d)) return 'New'

  return null
}

export function conditionStyle(condition: Condition): { bg: string; color: string } {
  switch (condition) {
    case 'New': return { bg: '#0c2a0c', color: '#3fb950' }
    case 'Like New': return { bg: '#0d1b2a', color: '#38bdf8' }
    case 'Open Box': return { bg: '#2a1e0d', color: '#e3b341' }
    case 'Used': return { bg: '#21262d', color: '#8b949e' }
  }
}
