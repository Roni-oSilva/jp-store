import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { brl } from '../lib/format'
import { useSEO } from '../lib/hooks'

export default function CartPage() {
  useSEO('Sacola')
  const { items, remove, setQty, changeVariant, subtotal, discount, total, clear } = useCart()

  if (items.length === 0) {
    return (
      <div className="container-x flex flex-col items-center gap-4 py-28 text-center">
        <ShoppingBag size={44} className="text-mute" />
        <h1 className="h-display text-3xl">Sua sacola está vazia</h1>
        <Link to="/loja" className="btn-light mt-2">Explorar a loja</Link>
      </div>
    )
  }

  return (
    <div className="container-x py-10 md:py-14">
      <h1 className="h-display mb-8 text-4xl md:text-6xl">Sacola</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {items.map(i => {
            const sizes = [...new Set(i.variants.map(v => v.size))]
            const colors = [...new Set(i.variants.map(v => v.color))]
            const avail = (s: string, c: string) => (i.variants.find(v => v.size === s && v.color === c)?.stock ?? 0) > 0
            return (
              <li key={i.key} className="flex gap-4 py-5 sm:gap-6">
                <Link to={`/produto/${i.slug}`} className="h-32 w-24 shrink-0 bg-graphite sm:h-36 sm:w-28">
                  {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex justify-between gap-3">
                    <Link to={`/produto/${i.slug}`} className="font-semibold hover:underline">{i.name}</Link>
                    <p className="font-semibold">{brl(i.price * i.qty)}</p>
                  </div>
                  <p className="text-xs text-mute">{brl(i.price)} cada{i.price < i.fullPrice && <span className="ml-2 line-through">{brl(i.fullPrice)}</span>}</p>
                  <div className="flex flex-wrap gap-3">
                    <label className="text-[11px] uppercase tracking-widest text-mute">Tamanho
                      <select className="input mt-1 !py-2" value={i.size} onChange={e => changeVariant(i.key, e.target.value, i.color)}>
                        {sizes.map(s => <option key={s} value={s} disabled={!avail(s, i.color)}>{s}</option>)}
                      </select>
                    </label>
                    <label className="text-[11px] uppercase tracking-widest text-mute">Cor
                      <select className="input mt-1 !py-2" value={i.color} onChange={e => changeVariant(i.key, i.size, e.target.value)}>
                        {colors.map(c => <option key={c} value={c} disabled={!avail(i.size, c)}>{c}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-white/15">
                      <button className="p-2" aria-label="Diminuir" onClick={() => setQty(i.key, i.qty - 1)}><Minus size={14} /></button>
                      <span className="w-9 text-center text-sm">{i.qty}</span>
                      <button className="p-2" aria-label="Aumentar" onClick={() => setQty(i.key, i.qty + 1)}><Plus size={14} /></button>
                    </div>
                    <button className="flex items-center gap-1 text-xs uppercase tracking-widest text-mute hover:text-white" onClick={() => remove(i.key)}><Trash2 size={14} /> Remover</button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <aside className="card h-fit space-y-3 p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-lg uppercase">Resumo</h2>
          <div className="flex justify-between text-sm"><span className="text-mute">Subtotal</span><span>{brl(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm"><span className="text-mute">Descontos</span><span className="text-emerald-400">-{brl(discount)}</span></div>}
          <div className="flex justify-between text-sm"><span className="text-mute">Frete</span><span className="text-mute">Calculado na finalização</span></div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold"><span>Total</span><span>{brl(total)}</span></div>
          <Link to="/finalizar" className="btn-light w-full">Finalizar pelo WhatsApp</Link>
          <Link to="/loja" className="btn-outline w-full">Continuar comprando</Link>
          <button className="w-full pt-1 text-xs uppercase tracking-widest text-mute hover:text-white" onClick={clear}>Esvaziar sacola</button>
        </aside>
      </div>
    </div>
  )
}
