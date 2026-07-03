export function getDiscount(price: number, originalPrice: number | null | undefined) {
  if (!originalPrice || originalPrice <= price) return null
  const percent = Math.round(((originalPrice - price) / originalPrice) * 100)
  if (percent <= 0) return null
  return { originalPrice, percent }
}
