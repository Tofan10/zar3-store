export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category_id: string
  category?: Category
  images: string[]
  specs: Record<string, string>
  featured: boolean
  active: boolean
  created_at: string
}
