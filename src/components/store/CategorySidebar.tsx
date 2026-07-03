'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { groupCategories } from '@/lib/categoryGroups'

export default function CategorySidebar({ categories }: { categories: any[] }) {
  const pathname = usePathname()
  const groups = groupCategories(categories)
  const isAllActive = pathname === '/store'

  function isActive(slug: string) {
    return pathname === `/store/category/${slug}`
  }

  return (
    <aside className="category-sidebar">
      <style>{`
        .category-sidebar { position: sticky; top: 96px; align-self: start; display: flex; flex-direction: column; gap: 14px; }
        .cs-group { border-radius: 14px; overflow: hidden; border: 1px solid var(--border); background: var(--surface); opacity: 0; animation: fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease; }
        .cs-group:hover { border-color: var(--brand); transform: translateX(-4px); box-shadow: 0 10px 26px -12px rgba(14,165,233,0.35); }
        .cs-head { display: flex; align-items: center; gap: 10px; padding: 14px 14px; background: linear-gradient(135deg, #0d1b2a, #0c2a4a); }
        .cs-head-icon { font-size: 20px; transition: transform 0.3s ease; }
        .cs-group:hover .cs-head-icon { transform: scale(1.15) rotate(-6deg); }
        .cs-head-title { font-size: 13.5px; font-weight: 700; color: var(--brand-dark); letter-spacing: 0.3px; }
        .cs-list { display: flex; flex-direction: column; padding: 6px; }
        .cs-link { position: relative; color: var(--muted); font-size: 13px; text-decoration: none; padding: 8px 10px 8px 16px; border-radius: 8px; display: flex; align-items: center; gap: 8px; transition: all 0.15s ease; }
        .cs-link::before { content: ''; position: absolute; left: 4px; top: 50%; transform: translateY(-50%) scaleY(0); width: 3px; height: 60%; background: var(--brand); border-radius: 2px; transition: transform 0.2s ease; }
        .cs-link:hover { color: var(--text); background: var(--brand-50); padding-left: 20px; }
        .cs-link:hover::before { transform: translateY(-50%) scaleY(1); }
        .cs-link.active { color: var(--brand-dark); background: var(--brand-100); font-weight: 600; }
        .cs-link.active::before { transform: translateY(-50%) scaleY(1); }
        .cs-all { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); text-decoration: none; font-size: 13.5px; font-weight: 600; transition: all 0.2s ease; }
        .cs-all:hover, .cs-all.active { color: var(--brand-dark); border-color: var(--brand); background: var(--brand-100); }
        @media (max-width: 900px) { .category-sidebar { display: none; } }
      `}</style>

      <Link href="/store" className={`cs-all${isAllActive ? ' active' : ''}`}>
        🗂️ All Products
      </Link>

      {groups.map((g, i) => (
        <div key={g.key} className="cs-group" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="cs-head">
            <span className="cs-head-icon">{g.icon}</span>
            <span className="cs-head-title">{g.title.toUpperCase()}</span>
          </div>
          <div className="cs-list">
            {g.items.map((cat: any) => (
              <Link key={cat.id} href={`/store/category/${cat.slug}`}
                className={`cs-link${isActive(cat.slug) ? ' active' : ''}`}>
                <span>{cat.icon}</span> {cat.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </aside>
  )
}
