export interface Brand {
  name: string
  match: string[] // lowercase keywords to look for inside product name
  color: string // brand accent color for the badge
}

export const BRANDS: Brand[] = [
  { name: 'AMD', match: ['amd', 'ryzen', 'radeon'], color: '#ED1C24' },
  { name: 'Intel', match: ['intel', 'core i'], color: '#0071C5' },
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

export function detectBrand(productName: string): Brand | null {
  const n = ` ${productName.toLowerCase()} `
  for (const b of BRANDS) {
    if (b.match.some(kw => n.includes(kw))) return b
  }
  return null
}

export function brandSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
