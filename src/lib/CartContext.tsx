'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/lib/types'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zar3-cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('zar3-cart', JSON.stringify(items))
  }, [items])

  function addItem(product: Product) {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i => i.product.id === product.id
          ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
          : i)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) { removeItem(productId); return }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i))
  }

  function clearCart() { setItems([]) }

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
