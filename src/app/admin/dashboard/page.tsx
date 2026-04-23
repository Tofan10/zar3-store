'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Product, Category } from '@/lib/types'

type Tab = 'products' | 'categories'

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCatForm, setShowCatForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCat, setEditingCat] = useState<Category | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [pr, cr] = await Promise.all([
      fetch('/api/products?all=true').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ])
    if (!pr.error) setProducts(pr)
    if (!cr.error) setCategories(cr)
    setLoading(false)
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin')
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category? Products in it will lose their category.')) return
    await fetch('/api/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchAll()
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    })
    fetchAll()
  }

  async function toggleFeatured(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !p.featured }),
    })
    fetchAll()
  }

  const navStyle = (active: boolean) => ({
    background: active ? '#0c2a4a' : 'transparent',
    border: `1px solid ${active ? '#378ADD' : '#21262d'}`,
    color: active ? '#85b7eb' : '#8b949e',
    borderRadius: 8, padding: '8px 18px', fontSize: 14,
    cursor: 'pointer', transition: 'all 0.15s'
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>
      <div style={{ background: '#080c12', borderBottom: '1px solid #21262d', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6fc4,#85b7eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>Z3</div>
          <span style={{ color: '#e6edf3', fontWeight: 500 }}>ZAR3 Admin</span>
          <span style={{ background: '#1a2e1a', color: '#3fb950', fontSize: 11, padding: '2px 8px', borderRadius: 20, border: '1px solid #3fb95040' }}>Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/store" target="_blank" style={{ color: '#378ADD', fontSize: 13, textDecoration: 'none', padding: '6px 12px', border: '1px solid #21262d', borderRadius: 8 }}>View Store ↗</a>
          <button onClick={logout} style={{ background: 'none', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', fontSize: 13, padding: '6px 12px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          <button style={navStyle(tab === 'products')} onClick={() => setTab('products')}>Products ({products.length})</button>
          <button style={navStyle(tab === 'categories')} onClick={() => setTab('categories')}>Categories ({categories.length})</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: '80px 0' }}>Loading...</div>
        ) : tab === 'products' ? (
          <ProductsTab
            products={products} categories={categories}
            onAdd={() => { setEditingProduct(null); setShowProductForm(true) }}
            onEdit={(p: Product) => { setEditingProduct(p); setShowProductForm(true) }}
            onDelete={deleteProduct}
            onToggleActive={toggleActive}
            onToggleFeatured={toggleFeatured}
            showForm={showProductForm}
            editingProduct={editingProduct}
            onFormClose={() => { setShowProductForm(false); setEditingProduct(null); fetchAll() }}
          />
        ) : (
          <CategoriesTab
            categories={categories}
            onAdd={() => { setEditingCat(null); setShowCatForm(true) }}
            onEdit={(c: Category) => { setEditingCat(c); setShowCatForm(true) }}
            onDelete={deleteCategory}
            showForm={showCatForm}
            editingCat={editingCat}
            onFormClose={() => { setShowCatForm(false); setEditingCat(null); fetchAll() }}
          />
        )}
      </div>
    </div>
  )
}

function ProductsTab({ products, categories, onAdd, onEdit, onDelete, onToggleActive, onToggleFeatured, showForm, editingProduct, onFormClose }: any) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#e6edf3', fontSize: 18, fontWeight: 500 }}>Products</h2>
        <button className="btn-primary" onClick={onAdd}>+ Add Product</button>
      </div>

      {showForm && (
        <ProductForm categories={categories} product={editingProduct} onClose={onFormClose} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {products.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: '60px 0' }}>No products yet. Add your first product!</div>
        )}
        {products.map((p: Product) => (
          <div key={p.id} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, background: '#0d1117', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6 }} /> : <span style={{ fontSize: 24, opacity: 0.4 }}>🖥️</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#e6edf3', fontWeight: 500, fontSize: 14 }}>{p.name}</div>
              <div style={{ color: '#8b949e', fontSize: 12, marginTop: 2 }}>{(p.category as any)?.name || 'No category'} · {p.price.toLocaleString()} EGP · Stock: {p.stock}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <Toggle label="Active" value={p.active} onChange={() => onToggleActive(p)} />
              <Toggle label="Featured" value={p.featured} onChange={() => onToggleFeatured(p)} />
              <button onClick={() => onEdit(p)} style={{ background: '#0c2a4a', border: '1px solid #378ADD', color: '#85b7eb', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Edit</button>
              <button className="btn-danger" onClick={() => onDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoriesTab({ categories, onAdd, onEdit, onDelete, showForm, editingCat, onFormClose }: any) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#e6edf3', fontSize: 18, fontWeight: 500 }}>Categories</h2>
        <button className="btn-primary" onClick={onAdd}>+ Add Category</button>
      </div>

      {showForm && <CategoryForm category={editingCat} onClose={onFormClose} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {categories.length === 0 && !showForm && (
          <div style={{ color: '#8b949e', fontSize: 14 }}>No categories yet.</div>
        )}
        {categories.map((c: Category) => (
          <div key={c.id} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ color: '#e6edf3', fontWeight: 500, marginBottom: 4 }}>{c.name}</div>
            <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 6 }}>{c.description}</div>
            <div style={{ color: '#6e7681', fontSize: 11, marginBottom: 14 }}>slug: {c.slug}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onEdit(c)} style={{ background: '#0c2a4a', border: '1px solid #378ADD', color: '#85b7eb', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Edit</button>
              <button className="btn-danger" onClick={() => onDelete(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8b949e', cursor: 'pointer' }} onClick={onChange}>
      <div style={{
        width: 32, height: 18, borderRadius: 9, background: value ? '#1a6fc4' : '#21262d',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 16 : 2,
          width: 14, height: 14, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s'
        }} />
      </div>
      {label}
    </div>
  )
}

function ProductForm({ product, categories, onClose }: { product: Product | null; categories: Category[]; onClose: () => void }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    category_id: product?.category_id || '',
    images: product?.images || [] as string[],
    specs: product?.specs ? Object.entries(product.specs).map(([k,v]) => `${k}: ${v}`).join('\n') : '',
    featured: product?.featured || false,
    active: product?.active ?? true,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (data.url) setForm(f => ({ ...f, images: [...f.images, data.url] }))
    else setError('Upload failed: ' + data.error)
  }

  function removeImage(url: string) {
    setForm(f => ({ ...f, images: f.images.filter((i: string) => i !== url) }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const specs: Record<string, string> = {}
    form.specs.split('\n').forEach((line: string) => { if (line.trim()) specs[line.trim()] = '' })

    const body = { ...form, specs, price: Number(form.price), stock: Number(form.stock) }
    const url = product ? `/api/products/${product.id}` : '/api/products'
    const method = product ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setSaving(false)
    if (data.error) { setError(data.error); return }
    onClose()
  }

  const labelStyle = { fontSize: 13, color: '#8b949e', marginBottom: 6, display: 'block' as const }

  return (
    <div style={{ background: '#0d1117', border: '1px solid #378ADD', borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ color: '#e6edf3', fontSize: 16, fontWeight: 500 }}>{product ? 'Edit Product' : 'New Product'}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Product Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. RTX 4070 Ti" required />
          </div>
          <div>
            <label style={labelStyle}>Category *</label>
            <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} required>
              <option value="">Select category...</option>
              {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Price (EGP) *</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} min={0} required />
          </div>
          <div>
            <label style={labelStyle}>Stock Quantity *</label>
            <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} min={0} required />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Short product description..." style={{ resize: 'vertical' }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Specs</label>
          <textarea value={form.specs} onChange={e => setForm(f => ({ ...f, specs: e.target.value }))} rows={4}
            placeholder={'{\n  "GPU": "RTX 4070 Ti",\n  "VRAM": "12GB GDDR6X"\n}'}
            style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Images</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            {form.images.map((url: string) => (
              <div key={url} style={{ position: 'relative', width: 80, height: 80 }}>
                <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #21262d' }} />
                <button type="button" onClick={() => removeImage(url)} style={{
                  position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                  borderRadius: '50%', background: '#f85149', border: 'none',
                  color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>×</button>
              </div>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{
              width: 80, height: 80, background: '#161b22', border: '1px dashed #30363d',
              borderRadius: 8, color: '#8b949e', cursor: 'pointer', fontSize: 24
            }}>{uploading ? '...' : '+'}</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadImage} style={{ display: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
          <Toggle label="Active (visible in store)" value={form.active} onChange={() => setForm(f => ({ ...f, active: !f.active }))} />
          <Toggle label="Featured (shown at top)" value={form.featured} onChange={() => setForm(f => ({ ...f, featured: !f.featured }))} />
        </div>

        {error && <div style={{ color: '#f85149', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : (product ? 'Save Changes' : 'Add Product')}</button>
          <button type="button" onClick={onClose} style={{ background: 'none', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

function CategoryForm({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || '🖥️',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const body = category ? { id: category.id, ...form } : form
    const method = category ? 'PUT' : 'POST'
    const res = await fetch('/api/categories', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setSaving(false)
    if (data.error) { setError(data.error); return }
    onClose()
  }

  const labelStyle = { fontSize: 13, color: '#8b949e', marginBottom: 6, display: 'block' as const }

  return (
    <div style={{ background: '#0d1117', border: '1px solid #378ADD', borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ color: '#e6edf3', fontSize: 16, fontWeight: 500 }}>{category ? 'Edit Category' : 'New Category'}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
      </div>
      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Category Name *</label>
            <input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) })) }} placeholder="e.g. PC Builds" required />
          </div>
          <div>
            <label style={labelStyle}>Icon (emoji)</label>
            <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🖥️" maxLength={4} />
          </div>
          <div>
            <label style={labelStyle}>Slug (auto-generated)</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="pc-builds" required />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..." />
          </div>
        </div>
        {error && <div style={{ color: '#f85149', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : (category ? 'Save Changes' : 'Add Category')}</button>
          <button type="button" onClick={onClose} style={{ background: 'none', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
