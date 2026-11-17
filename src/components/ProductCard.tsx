import { Link } from 'react-router-dom'
import type { Product } from '../lib/types'
import { brl, effectivePrice, hasPromo, inStock, mainImage, sortedImages } from '../lib/format'

export default function ProductCard({ p }: { p: Product }) {
  const imgs = sortedImages(p)
  const promo = hasPromo(p)
  const ok = inStock(p)
  const pct = promo ? Math.round((1 - effectivePrice(p) / p.price) * 100) : 0
  return (
    <Link to={`/produto/${p.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-graphite">
        {mainImage(p) ? (
          <>
            <img src={imgs[0].url} alt={p.name} loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${imgs[1] ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`} />
            {imgs[1] && <img src={imgs[1].url} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100" />}
          </>
        ) : <div className="flex h-full items-center justify-center text-xs text-mute">Sem foto</div>}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {promo && <span className="bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-black">-{pct}%</span>}
          {!ok && <span className="bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">Esgotado</span>}
        </div>
      </div>
      <div className="mt-3">
        {p.categories?.name && <p className="text-[10px] uppercase tracking-widest text-mute">{p.categories.name}</p>}
        <h3 className="mt-0.5 text-sm font-semibold leading-snug">{p.name}</h3>
        <p className="mt-1 text-sm">
          {promo && <span className="mr-2 text-mute line-through">{brl(p.price)}</span>}
          <span className="font-bold">{brl(effectivePrice(p))}</span>
        </p>
      </div>
    </Link>
  )
}
