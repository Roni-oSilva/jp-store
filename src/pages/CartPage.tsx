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
      <div className="container-x flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-sub"><ShoppingBag size={32} /></span>
        <h1 className="title text-3xl">Sua sacola está vazia</h1>
        <Link to="/loja" className="pill-dark mt-2">Explorar a loja</Link>
      </div>
    )
  }

  return (
    <div className="container-x py-6 md:py-10">
      <h1 className="title mb-6 text-4xl md:text-5xl">Sacola</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-3">
          {items.map(i => {
            const sizes = [...new Set(i.variants.map(v => v.size))]
            const colors = [...new Set(i.variants.map(v => v.color))]
            const avail = (s: string, c: string) => (i.variants.find(v => v.size === s && v.color === c)?.stock ?? 0) > 0
            return (
              <li key={i.key} className="surface flex gap-4 p-3 sm:p-4">
                <Link to={`/produto/${i.slug}`} className="h-32 w-24 shrink-0 overflow-hidden rounded-2xl bg-soft sm:h-36 sm:w-28">
                  {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <div className="flex justify-between gap-3">
                    <Link to={`/produto/${i.slug}`} className="font-bold hover:underline">{i.name}</Link>
                    <p className="font-extrabold">{brl(i.price * i.qty)}</p>
                  </div>
                  <p className="text-xs text-sub">{brl(i.price)} cada{i.price < i.fullPrice && <span className="ml-2 line-through">{brl(i.fullPrice)}</span>}</p>
                  <div className="flex flex-wrap gap-2">
                    <label className="text-[11px] font-semibold text-sub">Tamanho
                      <select className="field mt-1 !rounded-full !py-2" value={i.size} onChange={e => changeVariant(i.key, e.target.value, i.color)}>
                        {sizes.map(s => <option key={s} value={s} disabled={!avail(s, i.color)}>{s}</option>)}
                      </select>
                    </label>
                    <label className="text-[11px] font-semibold text-sub">Cor
                      <select className="field mt-1 !rounded-full !py-2" value={i.color} onChange={e => changeVariant(i.key, i.size, e.target.value)}>
                        {colors.map(c => <option key={c} value={c} disabled={!avail(i.size, c)}>{c}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-full bg-soft">
                      <button className="p-2.5" aria-label="Diminuir" onClick={() => setQty(i.key, i.qty - 1)}><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-bold">{i.qty}</span>
                      <button className="p-2.5" aria-label="Aumentar" onClick={() => setQty(i.key, i.qty + 1)}><Plus size={14} /></button>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-semibold text-sub hover:text-txt" onClick={() => remove(i.key)}><Trash2 size={14} /> Remover</button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <aside className="surface h-fit space-y-3 p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-extrabold">Resumo</h2>
          <div className="flex justify-between text-sm"><span className="text-sub">Subtotal</span><span>{brl(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm"><span className="text-sub">Descontos</span><span className="font-semibold text-emerald-600">-{brl(discount)}</span></div>}
          <div className="flex justify-between text-sm"><span className="text-sub">Frete</span><span className="text-sub">Calculado na finalização</span></div>
          <div className="flex justify-between border-t border-black/5 pt-3 text-lg font-extrabold"><span>Total</span><span>{brl(total)}</span></div>
          <Link to="/finalizar" className="pill-dark w-full !py-4">Finalizar pelo WhatsApp</Link>
          <Link to="/loja" className="pill-light w-full">Continuar comprando</Link>
          <button className="w-full pt-1 text-xs font-semibold text-sub hover:text-txt" onClick={clear}>Esvaziar sacola</button>
        </aside>
      </div>
    </div>
  )
}
