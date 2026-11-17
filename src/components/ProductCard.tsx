import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { Product } from '../lib/types'
import { brl, effectivePrice, hasPromo, inStock, sortedImages } from '../lib/format'

export default function ProductCard({ p }: { p: Product }) {
  const imgs = sortedImages(p)
  const promo = hasPromo(p)
  const ok = inStock(p)
  const pct = promo ? Math.round((1 - effectivePrice(p) / p.price) * 100) : 0
  const sizes = [...new Set(p.product_variants.filter(v => v.stock > 0).map(v => v.size))]
  return (
    <Link to={`/produto/${p.slug}`} className="group block rounded-[28px] bg-white p-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,.08)]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-soft">
        {imgs[0] ? (
          <>
            <img src={imgs[0].url} alt={p.name} loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${imgs[1] ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`} />
            {imgs[1] && <img src={imgs[1].url} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100" />}
          </>
        ) : <div className="flex h-full items-center justify-center text-xs text-sub">Sem foto</div>}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {promo && <span className="rounded-full bg-charcoal px-2.5 py-1 text-[11px] font-bold text-white">-{pct}%</span>}
          {!ok && <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold">Esgotado</span>}
        </div>
      </div>
      <div className="flex items-end justify-between gap-2 px-1.5 pb-1.5 pt-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold leading-tight">{p.name}</h3>
          <p className="mt-0.5 truncate text-xs text-sub">{sizes.length ? sizes.join(' · ') : p.categories?.name ?? ' '}</p>
          <p className="mt-1.5 text-sm">
            <span className="font-extrabold">{brl(effectivePrice(p))}</span>
            {promo && <span className="ml-1.5 text-xs text-sub line-through">{brl(p.price)}</span>}
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-charcoal text-white transition-transform group-hover:scale-110" aria-hidden><Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" /></span>
      </div>
    </Link>
  )
}
