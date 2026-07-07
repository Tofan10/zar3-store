'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TopSearchBar() {
  const router = useRouter()
  const [value, setValue] = useState('')

  function goSearch() {
    const q = value.trim()
    router.push(`/store${q ? `?q=${encodeURIComponent(q)}` : ''}#all-products-search`)
  }

  return (
    <div style={{
      position: 'sticky', top: 66, zIndex: 95, background: 'var(--bg)',
      padding: '14px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') goSearch() }}
          placeholder="🔍  Search for CPUs, GPUs, monitors, accessories..."
          style={{
            flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '13px 16px', fontSize: 15, color: 'var(--text)',
            outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
        <button onClick={goSearch} className="btn-sky" style={{
          border: 'none', borderRadius: 10, padding: '13px 22px', fontSize: 14,
          fontWeight: 600, color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          Search
        </button>
      </div>
    </div>
  )
}
