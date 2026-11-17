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
      <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
      <aside className="slide-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ink shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="font-display text-lg uppercase">Sacola ({count})</h2>
          <button aria-label="Fechar" onClick={() => setOpen(false)}><X size={22} /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-mute">
            <ShoppingBag size={40} />
            <p>Sua sacola está vazia.</p>
            <Link to="/loja" onClick={() => setOpen(false)} className="btn-light">Ver produtos</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-white/5 overflow-y-auto px-5">
              {items.map(i => (
                <li key={i.key} className="flex gap-4 py-4">
                  <Link to={`/produto/${i.slug}`} onClick={() => setOpen(false)} className="h-24 w-20 shrink-0 bg-graphite">
                    {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-semibold">{i.name}</p>
                    <p className="text-xs text-mute">{i.size} · {i.color}</p>
                    <p className="mt-1 text-sm">{brl(i.price)}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-white/15">
                        <button className="p-1.5" aria-label="Diminuir" onClick={() => setQty(i.key, i.qty - 1)}><Minus size={14} /></button>
                        <span className="w-7 text-center text-sm">{i.qty}</span>
                        <button className="p-1.5" aria-label="Aumentar" onClick={() => setQty(i.key, i.qty + 1)}><Plus size={14} /></button>
                      </div>
                      <button aria-label="Remover" className="p-1.5 text-mute hover:text-white" onClick={() => remove(i.key)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-white/10 p-5">
              <div className="flex justify-between text-sm"><span className="text-mute">Subtotal</span><span className="font-semibold">{brl(total)}</span></div>
              <Link to="/sacola" onClick={() => setOpen(false)} className="btn-outline w-full">Ver sacola</Link>
              <Link to="/finalizar" onClick={() => setOpen(false)} className="btn-light w-full">Finalizar pelo WhatsApp</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
