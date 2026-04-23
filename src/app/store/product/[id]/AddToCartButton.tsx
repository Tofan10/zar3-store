'use client'
import { useState } from 'react'
import { useCart } from '@/lib/CartContext'
import { Product } from '@/lib/types'

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const inStock = product.stock > 0

  function handleAdd() {
    if (!inStock) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button onClick={handleAdd} disabled={!inStock} style={{
      width: '100%', border: 'none', borderRadius: 10,
      padding: '14px', fontSize: 15, fontWeight: 500,
      cursor: inStock ? 'pointer' : 'not-allowed',
      background: added ? '#1a4d1a' : inStock ? '#1a6fc4' : '#1a2233',
      color: added ? '#3fb950' : inStock ? '#fff' : '#4a5568',
      transition: 'all 0.2s'
    }}>
      {added ? '✓ Added to Cart' : inStock ? '+ Add to Cart' : 'Out of Stock'}
    </button>
  )
}
