'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { Product } from '@/lib/types'

interface QuickViewContextType {
  product: Product | null
  open: (product: Product) => void
  close: () => void
}

const QuickViewContext = createContext<QuickViewContextType | null>(null)

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null)
  return (
    <QuickViewContext.Provider value={{ product, open: setProduct, close: () => setProduct(null) }}>
      {children}
    </QuickViewContext.Provider>
  )
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext)
  if (!ctx) throw new Error('useQuickView must be used inside QuickViewProvider')
  return ctx
}
