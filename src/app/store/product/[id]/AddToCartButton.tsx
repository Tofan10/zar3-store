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
    <button onClick={handleAdd} disabled={!inStock} className={inStock ? 'btn-sky' : ''} style={{
      width: '100%', border: 'none', borderRadius: 10,
      padding: '14px', fontSize: 15, fontWeight: 600,
      cursor: inStock ? 'pointer' : 'not-allowed',
      background: added ? '#dcfce7' : inStock ? undefined : '#f1f5f9',
      color: added ? '#16a34a' : inStock ? '#fff' : '#94a3b8',
    }}>
      {added ? '✓ Added to Cart' : inStock ? '+ Add to Cart' : 'Out of Stock'}
    </button>
  )
}
