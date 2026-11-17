import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { brl } from '../lib/format'

export default function CartDrawer() {
  const { open, setOpen, items, remove, setQty, total, count } = useCart()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, setOpen])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Sacola">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <aside className="slide-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col rounded-l-4xl bg-paper shadow-2xl">
        <div className="flex items-center justify-between p-5">
          <h2 className="text-xl font-extrabold">Sacola <span className="text-sub">({count})</span></h2>
          <button aria-label="Fechar" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-sub">
            <ShoppingBag size={40} />
            <p>Sua sacola está vazia.</p>
            <Link to="/loja" onClick={() => setOpen(false)} className="pill-dark">Ver produtos</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5">
              {items.map(i => (
                <li key={i.key} className="surface flex gap-3 p-3">
                  <Link to={`/produto/${i.slug}`} onClick={() => setOpen(false)} className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-soft">
                    {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-bold">{i.name}</p>
                    <p className="text-xs text-sub">{i.size} · {i.color}</p>
                    <p className="mt-1 text-sm font-bold">{brl(i.price)}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full bg-soft">
                        <button className="p-2" aria-label="Diminuir" onClick={() => setQty(i.key, i.qty - 1)}><Minus size={14} /></button>
                        <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                        <button className="p-2" aria-label="Aumentar" onClick={() => setQty(i.key, i.qty + 1)}><Plus size={14} /></button>
                      </div>
                      <button aria-label="Remover" className="p-2 text-sub hover:text-txt" onClick={() => remove(i.key)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 p-5">
              <div className="flex justify-between text-sm"><span className="text-sub">Subtotal</span><span className="text-lg font-extrabold">{brl(total)}</span></div>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/sacola" onClick={() => setOpen(false)} className="pill-light">Ver sacola</Link>
                <Link to="/finalizar" onClick={() => setOpen(false)} className="pill-dark">Finalizar</Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
