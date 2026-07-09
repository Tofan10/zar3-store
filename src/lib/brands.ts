export interface Brand {
  name: string
  match: string[] // lowercase keywords to look for inside product name
  color: string // brand accent color for the badge
}

export const BRANDS: Brand[] = [
  { name: 'AMD', match: ['amd', 'ryzen', 'radeon', ' r3 ', ' r5 ', ' r7 ', ' r9 ', 'threadripper', 'epyc', 'x3d'], color: '#ED1C24' },
  { name: 'Intel', match: ['intel', 'core i', 'pentium', 'celeron', ' i3 ', ' i5 ', ' i7 ', ' i9 '], color: '#0071C5' },
  { name: 'NVIDIA', match: ['nvidia', 'geforce', 'rtx', 'gtx'], color: '#76B900' },
  { name: 'ASUS', match: ['asus', 'rog', 'tuf'], color: '#000000' },
  { name: 'MSI', match: ['msi'], color: '#FF0000' },
  { name: 'Gigabyte', match: ['gigabyte', 'aorus'], color: '#FF7A00' },
  { name: 'ASRock', match: ['asrock'], color: '#1B75BB' },
  { name: 'Corsair', match: ['corsair'], color: '#FFD400' },
  { name: 'Cooler Master', match: ['cooler master', 'coolermaster'], color: '#F37021' },
  { name: 'NZXT', match: ['nzxt'], color: '#8B5CF6' },
  { name: 'Thermaltake', match: ['thermaltake'], color: '#00A650' },
  { name: 'Xigmatek', match: ['xigmatek'], color: '#38bdf8' },
  { name: 'Kingston', match: ['kingston', 'hyperx'], color: '#B71234' },
  { name: 'Logitech', match: ['logitech'], color: '#00B8FC' },
  { name: 'Razer', match: ['razer'], color: '#44D62C' },
  { name: 'SteelSeries', match: ['steelseries'], color: '#FF5200' },
  { name: 'Meetion', match: ['meetion'], color: '#38bdf8' },
  { name: 'Elgato', match: ['elgato'], color: '#FF3D3D' },
  { name: 'Samsung', match: ['samsung'], color: '#1428A0' },
  { name: 'Western Digital', match: ['western digital', ' wd '], color: '#0072CE' },
  { name: 'Seagate', match: ['seagate'], color: '#6DBE45' },
  { name: 'Deepcool', match: ['deepcool'], color: '#38bdf8' },
]

// Fallback pattern-based detection for products where the seller only typed
// the bare model number (e.g. "12400f", "5600x") without writing the brand
// name itself. Only used if no direct keyword above already matched.
//   Intel: i3/i5/i7/i9 followed by a model number, OR a bare 4-5 digit
//          model number in Intel's numbering ranges (9xxx, 10xxx-14xxx),
//          optionally followed by a suffix letter like F/K/KF/T/KS.
//   AMD:   a bare Ryzen-style model number (1000-9000 series), optionally
//          followed by a suffix like X/G/XT/X3D.
const INTEL_MODEL = /\bi[3579][\s-]?\d{3,5}[a-z]{0,2}\b|\bultra\s?[3579]\b|\b(?:9\d{3}|1[0-4]\d{3}|2\d{2})(?:k|kf|f|t|ks)?\b/i
const AMD_MODEL = /\b[1-9]\d{3}(?:x3d|xt|x|g|ge)?\b/i

export function detectBrand(productName: string): Brand | null {
  const n = ` ${productName.toLowerCase()} `
  for (const b of BRANDS) {
    if (b.match.some(kw => n.includes(kw))) return b
  }
  // Only apply numeric-pattern fallback to products that read like a CPU
  // model number, so we don't misfire on prices, stock counts, etc.
  if (INTEL_MODEL.test(productName)) {
    return BRANDS.find(b => b.name === 'Intel') || null
  }
  if (AMD_MODEL.test(productName)) {
    return BRANDS.find(b => b.name === 'AMD') || null
  }
  return null
}

export function brandSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
