export const HARDWARE_SLUGS = ['processors-cpu', 'graphics-cards-gpu', 'motherboards', 'memory-ram', 'storage', 'power-supplies-psu', 'computer-cases', 'cooling-fans', 'pc-builds']
export const ACCESSORY_SLUGS = ['mouse', 'keyboard', 'headset', 'mousepad', 'accessories']
export const MONITOR_SLUGS = ['monitor']

export function groupCategories(categories: any[]) {
  const hardware = categories.filter(c => HARDWARE_SLUGS.includes(c.slug))
  const accessories = categories.filter(c => ACCESSORY_SLUGS.includes(c.slug))
  const monitors = categories.filter(c => MONITOR_SLUGS.includes(c.slug))
  const known = new Set([...HARDWARE_SLUGS, ...ACCESSORY_SLUGS, ...MONITOR_SLUGS])
  const more = categories.filter(c => !known.has(c.slug))
  return [
    { key: 'hardware', title: 'Hardware', icon: '🖥️', anchor: 'new-in-hardware', items: hardware },
    { key: 'accessories', title: 'Accessories', icon: '🎧', anchor: 'new-in-accessories', items: accessories },
    { key: 'monitors', title: 'Monitors', icon: '🖥️', anchor: 'new-in-monitors', items: monitors },
    { key: 'more', title: 'More', icon: '📦', anchor: 'new-in-more', items: more },
  ].filter(g => g.items.length > 0)
}
