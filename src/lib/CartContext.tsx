'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { Product } from './types'
import { supabase } from './supabase'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, qty?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  refreshStock: () => void
  removedNotice: string | null
  clearRemovedNotice: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [removedNotice, setRemovedNotice] = useState<string | null>(null)
  const itemsRef = useRef<CartItem[]>([])
  itemsRef.current = items

  // Load cart from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zar3-cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    setLoaded(true)
  }, [])

  // Persist to localStorage whenever the cart changes
  useEffect(() => {
    if (loaded) localStorage.setItem('zar3-cart', JSON.stringify(items))
  }, [items, loaded])

  // Cart items keep a *snapshot* of the product taken when they were added,
  // so they don't automatically notice if that product later sells out,
  // goes inactive, or gets deleted. Check the real, current stock and
  // silently drop/clamp anything that's no longer actually available —
  // once right after the saved cart loads, then again periodically while
  // the site stays open.
  async function validateStock() {
    const current = itemsRef.current
    if (current.length === 0) return

    const ids = current.map(i => i.product.id)
    const { data, error } = await supabase.from('products').select('id, stock, active').in('id', ids)
    if (error) return
    const statusById = Object.fromEntries((data || []).map((p: any) => [p.id, p]))

    const removedNames: string[] = []
    const next = current
      .filter(i => {
        const s = statusById[i.product.id]
        const ok = !!s && s.active && s.stock > 0
        if (!ok) removedNames.push(i.product.name)
        return ok
      })
      .map(i => {
        const s = statusById[i.product.id]
        return s.stock < i.quantity ? { ...i, quantity: s.stock } : i
      })

    if (removedNames.length > 0) {
      setItems(next)
      setRemovedNotice(
        removedNames.length === 1
          ? `تم إزالة "${removedNames[0]}" من السلة لأنه غير متوفر حاليًا`
          : `تم إزالة ${removedNames.length} منتجات من السلة لأنها غير متوفرة حاليًا`
      )
    }
  }

  useEffect(() => {
    if (!loaded) return
    validateStock()
    const interval = setInterval(validateStock, 120000) // re-check every 2 minutes
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  function addItem(product: Product, qty = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i)
      }
      return [...prev, { product, quantity: qty }]
    })
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }

  function updateQuantity(productId: string, qty: number) {
    if (qty <= 0) { removeItem(productId); return }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i))
  }

  function clearCart() {
    setItems([])
  }

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      refreshStock: validateStock,
      removedNotice, clearRemovedNotice: () => setRemovedNotice(null),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
