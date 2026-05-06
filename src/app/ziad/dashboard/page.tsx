'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { read, utils } from 'xlsx'
import { Product, Category } from '@/lib/types'

type Tab = 'stats' | 'products' | 'categories'

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('stats')
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

  const totalProducts = products.length
  const activeProducts = products.filter(p => p.active).length
  const outOfStock = products.filter(p => p.stock === 0).length
  const featured = products.filter(p => p.featured).length
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const catCounts = categories.map(c => ({
    ...c,
    count: products.filter(p => p.category_id === c.id).length
  })).sort((a, b) => b.count - a.count)

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
          <button style={navStyle(tab === 'stats')} onClick={() => setTab('stats')}>Stats</button>
          <button style={navStyle(tab === 'products')} onClick={() => setTab('products')}>Products ({products.length})</button>
          <button style={navStyle(tab === 'categories')} onClick={() => setTab('categories')}>Categories ({categories.length})</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: '80px 0' }}>Loading...</div>
        ) : tab === 'stats' ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Total Products', value: totalProducts, color: '#378ADD' },
                { label: 'Active Products', value: activeProducts, color: '#3fb950' },
                { label: 'Out of Stock', value: outOfStock, color: '#f85149' },
                { label: 'Featured', value: featured, color: '#e3b341' },
                { label: 'Categories', value: categories.length, color: '#85b7eb' },
                { label: 'Inventory Value', value: totalValue.toLocaleString() + ' EGP', color: '#3fb950' },
              ].map(s => (
                <div key={s.label} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 20 }}>
                  <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ color: s.color, fontSize: 28, fontWeight: 700 }}>{s.value}</div>
                </div>
              ))}
            </div>
            <h3 style={{ color: '#e6edf3', fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Products per Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {catCounts.map(c => (
                <div key={c.id} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <span style={{ color: '#e6edf3', fontSize: 14, flex: 1 }}>{c.name}</span>
                  <div style={{ background: '#0d1117', borderRadius: 8, padding: '4px 12px', color: '#378ADD', fontSize: 13, fontWeight: 600 }}>{c.count} products</div>
                  <div style={{ width: 120, height: 6, background: '#21262d', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${totalProducts > 0 ? (c.count / totalProducts) * 100 : 0}%`, height: '100%', background: '#378ADD', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ inserted?: number; skipped?: any[]; error?: string } | null>(null)
  const [search, setSearch] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const slugMap: Record<string, string> = {
    'Processors (CPU)': 'processors-cpu',
    'Graphics Cards (GPU)': 'graphics-cards-gpu',
    'Motherboards': 'motherboards',
    'Memory (RAM)': 'memory-ram',
    'Storage (SSD/HDD)': 'storage',
    'Power Supplies (PSU)': 'power-supplies-psu',
    'Computer Cases': 'computer-cases',
    'Cooling & Fans': 'cooling-fans',
    'Monitor': 'monitor',
    'Mouse': 'mouse',
    'Keyboard': 'keyboard',
    'Headset': 'headset',
    'Mousepad': 'mousepad',
    'Accessories': 'accessories',
    'PC Builds': 'pc-builds',
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)

    const buffer = await file.arrayBuffer()
    const wb = read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const raw: any[] = utils.sheet_to_json(ws, { defval: '' })

    const nameToSlug: Record<string, string> = {}
    categories.forEach((c: any) => { nameToSlug[c.name] = c.slug })

    const rows = raw.map(r => {
      const row: Record<string, any> = {}
      for (const k in r) row[k.toLowerCase().trim()] = r[k]

      const rawCat = (row['category'] || row['category_slug'] || '').toString().trim()
      const category_slug = nameToSlug[rawCat] || slugMap[rawCat] || rawCat

      // ✅ Parse warranty: "180 Days" → 180
      const warrantyRaw = (row['warranty'] || '').toString().trim()
      const warrantyNum = warrantyRaw ? parseInt(warrantyRaw) || null : null

      // ✅ Notes → description
      const notes = (row['notes'] || '').toString().trim()
      const description = notes === '-' ? '' : notes

      // ✅ SKU → specs
      const sku = (row['sku/serial'] || row['sku'] || '').toString().trim()
      const specs: Record<string, string> = {}
      if (sku) specs['SKU'] = sku

      return {
        name: (row['name'] || '').toString().trim(),
        price: row['sale price'] ?? row['price'] ?? 0,
        stock: row['stock'] ?? 0,
        category_slug,
        warranty: warrantyNum,
        description,
        specs,
      }
    }).filter(r => r.name)

    const res = await fetch('/api/products/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    })
    const data = await res.json()
    setImporting(false)
    setImportResult(data)
    if (!data.error) onFormClose()
    e.target.value = ''
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#e6edf3', fontSize: 18, fontWeight: 500 }}>Products</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => importRef.current?.click()}
            disabled={importing}
            style={{
              background: importing ? '#161b22' : '#0c2a0c',
              border: '1px solid #3fb950',
              color: importing ? '#8b949e' : '#3fb950',
              borderRadius: 8, padding: '8px 16px', fontSize: 13,
              cursor: importing ? 'not-allowed' : 'pointer', fontWeight: 500
            }}
          >
            {importing ? '⏳ Importing...' : '📥 Import Excel'}
          </button>
          <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImportExcel} style={{ display: 'none' }} />
          <button className="btn-primary" onClick={onAdd}>+ Add Product</button>
        </div>
      </div>

      {importResult && (
        <div style={{
          background: importResult.error ? '#1a0a0a' : '#0a1a0a',
          border: `1px solid ${importResult.error ? '#f85149' : '#3fb950'}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ color: importResult.error ? '#f85149' : '#3fb950', fontSize: 13 }}>
            {importResult.error
              ? `❌ Error: ${importResult.error}`
              : `✅ Imported ${importResult.inserted} products successfully${importResult.skipped?.length ? ` (${importResult.skipped.length} skipped)` : ''}`
            }
          </span>
          <button onClick={() => setImportResult(null)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      )}

      <input
        type="text"
        placeholder="🔍 Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', background: '#161b22', border: '1px solid #21262d',
          borderRadius: 10, padding: '10px 16px', fontSize: 14, color: '#e6edf3',
          outline: 'none', boxSizing: 'border-box', marginBottom: 16
        }}
        onFocus={e => e.target.style.borderColor = '#378ADD'}
        onBlur={e => e.target.style.borderColor = '#21262d'}
      />
      {search && (
        <div style={{ color: '#8b949e', fontSize: 13, marginBottom: 12 }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </div>
      )}

      {showForm && <ProductForm categories={categories} product={editingProduct} onClose={onFormClose} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {products.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: '60px 0' }}>No products yet. Add your first product!</div>
        )}
        {filtered.map((p: Product) => (
          <div key={p.id} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, background: '#0d1117', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {p.images?.[0]
                ? <img src={p.images[0]} alt="" referrerPolicy="no-referrer" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6 }} />
                : <span style={{ fontSize: 24, opacity: 0.4 }}>🖥️</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#e6edf3', fontWeight: 500, fontSize: 14 }}>{p.name}</div>
              <div style={{ color: '#8b949e', fontSize: 12, marginTop: 2 }}>
                {(p.category as any)?.name || 'No category'} · {p.price.toLocaleString()} EGP · Stock: {p.stock}
                {(p as any).warranty ? ` · Warranty: ${(p as any).warranty} days` : ''}
              </div>
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
      <div style={{ width: 32, height: 18, borderRadius: 9, background: value ? '#1a6fc4' : '#21262d', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: value ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
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
    specs: product?.specs ? Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`).join('\n') : '',
    featured: product?.featured || false,
    active: product?.active ?? true,
    warranty: (product as any)?.warranty ?? '',
  })
  const [imageUrl, setImageUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pasting, setPasting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function addImageUrl() {
    const url = imageUrl.trim()
    if (!url) return
    if (!url.startsWith('http')) { setUrlError('URL must start with http'); return }
    if (form.images.includes(url)) { setUrlError('Image already added'); return }
    setForm(f => ({ ...f, images: [...f.images, url] }))
    setImageUrl('')
    setUrlError('')
  }

  async function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        setPasting(true)
        const file = item.getAsFile()
        if (!file) continue
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        setPasting(false)
        if (data.url) setForm(f => ({ ...f, images: [...f.images, data.url] }))
        else setError('Paste upload failed: ' + data.error)
        break
      }
    }
  }

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
    form.specs.split('\n').forEach((line: string) => {
      if (line.trim()) specs[line.trim()] = ''
    })
    const body = {
      ...form,
      specs,
      price: Number(form.price),
      stock: Number(form.stock),
      warranty: form.warranty !== '' ? Number(form.warranty) : null,
    }
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

      <form onSubmit={handleSave} onPaste={handlePaste}>
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
          <div>
            <label style={labelStyle}>Warranty (days)</label>
            <input
              type="number"
              value={form.warranty}
              onChange={e => setForm(f => ({ ...f, warranty: e.target.value }))}
              min={0}
              placeholder="e.g. 365"
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Short product description..." style={{ resize: 'vertical' }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Specs</label>
          <textarea value={form.specs} onChange={e => setForm(f => ({ ...f, specs: e.target.value }))} rows={4}
            placeholder={"RTX 4070 Ti\n16GB GDDR6X\nPCIe 4.0"}
            style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>
            Images
            {pasting && <span style={{ color: '#378ADD', fontSize: 11, marginLeft: 8, fontWeight: 400 }}>Uploading pasted image...</span>}
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={imageUrl}
              onChange={e => { setImageUrl(e.target.value); setUrlError('') }}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
              placeholder="Paste image URL here, or press Ctrl+V anywhere to paste a screenshot"
              style={{ flex: 1 }}
            />
            <button type="button" onClick={addImageUrl} style={{
              background: '#1a6fc4', border: 'none', borderRadius: 8,
              color: '#fff', padding: '8px 16px', fontSize: 13,
              cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500
            }}>Add URL</button>
          </div>
          {urlError && <div style={{ color: '#f85149', fontSize: 12, marginBottom: 8 }}>{urlError}</div>}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {form.images.map((url: string) => (
              <div key={url} style={{ position: 'relative', width: 80, height: 80 }}>
                <img src={url} alt="" referrerPolicy="no-referrer"
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #21262d' }}
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
                />
                <button type="button" onClick={() => removeImage(url)} style={{
                  position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                  borderRadius: '50%', background: '#f85149', border: 'none',
                  color: '#fff', cursor: 'pointer', fontSize: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>×</button>
              </div>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{
              width: 80, height: 80, background: '#161b22', border: '1px dashed #30363d',
              borderRadius: 8, color: '#8b949e', cursor: 'pointer', fontSize: 13,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4
            }}>
              <span style={{ fontSize: 22 }}>{uploading ? '⏳' : '+'}</span>
              <span style={{ fontSize: 10 }}>{uploading ? 'Uploading' : 'Upload'}</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadImage} style={{ display: 'none' }} />
          </div>
          <div style={{ color: '#6e7681', fontSize: 11, marginTop: 8 }}>
            3 ways to add images: Ctrl+V to paste screenshot · paste URL above · or upload file
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
