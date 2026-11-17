import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useStore } from '../context/StoreContext'
import { brl, onlyDigits } from '../lib/format'
import { useSEO } from '../lib/hooks'
import { registerOrder } from '../lib/api'
import { buildMessage, waLink, type Checkout } from '../lib/whatsapp'

const EMPTY: Checkout = { name: '', phone: '', city: '', neighborhood: '', address: '', method: 'entrega', notes: '' }

export default function CheckoutPage() {
  useSEO('Finalizar pedido')
  const { items, subtotal, discount, total, clear } = useCart()
  const { settings } = useStore()
  const [f, setF] = useState<Checkout>(EMPTY)
  const [err, setErr] = useState('')
  const [sentLink, setSentLink] = useState('')

  const number = onlyDigits(settings.whatsapp_number)
  const delivery = f.method === 'entrega'
  const freeFrom = settings.free_shipping_from
  const shipping = delivery && settings.shipping_fee > 0 && !(freeFrom != null && total >= freeFrom) ? settings.shipping_fee : 0
  const grand = total + shipping

  const up = (k: keyof Checkout) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF(s => ({ ...s, [k]: e.target.value }))

  if (items.length === 0 && !sentLink) {
    return <div className="container-x py-28 text-center"><h1 className="h-display text-3xl">Sua sacola está vazia</h1><Link to="/loja" className="btn-light mt-6">Ir para a loja</Link></div>
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    if (!number) { setErr('A loja ainda não configurou o número de WhatsApp. Tente novamente mais tarde.'); return }
    if (f.name.trim().split(/\s+/).length < 2) { setErr('Informe seu nome completo.'); return }
    if (onlyDigits(f.phone).length < 10) { setErr('Informe um telefone válido com DDD.'); return }
    if (!f.city.trim()) { setErr('Informe a cidade.'); return }
    if (delivery && (!f.neighborhood.trim() || !f.address.trim())) { setErr('Informe bairro e endereço para entrega.'); return }

    const totals = { subtotal, discount, shipping, total: grand }
    const msg = buildMessage(f, items, totals)
    const link = waLink(number, msg)

    // Registro do pedido (sem bloquear a abertura do WhatsApp)
    registerOrder({
      customer_name: f.name.trim(), phone: f.phone.trim(), city: f.city.trim(), neighborhood: f.neighborhood.trim(),
      address: f.address.trim(), delivery_method: f.method, notes: f.notes.trim(),
      items: items.map(i => ({ product: i.name, size: i.size, color: i.color, qty: i.qty, unit_price: i.price })),
      subtotal, shipping, discount, total: grand,
    }).catch(() => { /* registro é opcional */ })

    setSentLink(link)
    window.open(link, '_blank', 'noopener')
  }

  if (sentLink) {
    return (
      <div className="container-x max-w-xl py-20 text-center">
        <MessageCircle size={40} className="mx-auto mb-4" />
        <h1 className="h-display text-3xl">Abrimos o WhatsApp</h1>
        <p className="mt-4 text-sm text-white/70">
          Para concluir, <strong>envie a mensagem</strong> com o resumo do pedido na conversa que abriu. O pedido só é considerado recebido
          depois que a mensagem for enviada, e será <strong>confirmado pela loja</strong>.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <a href={sentLink} target="_blank" rel="noreferrer" className="btn-light">Abrir o WhatsApp novamente</a>
          <button className="btn-outline" onClick={() => { clear(); setSentLink('') }}>Já enviei — esvaziar sacola</button>
          <Link to="/sacola" className="text-xs uppercase tracking-widest text-mute underline" onClick={() => setSentLink('')}>Voltar à sacola</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-x py-10 md:py-14">
      <h1 className="h-display mb-8 text-4xl md:text-6xl">Finalizar pedido</h1>
      <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <p className="text-sm text-mute">Sem cadastro. Ao finalizar, abriremos o WhatsApp da loja com o resumo completo do pedido.</p>
          <div><label className="label" htmlFor="name">Nome completo</label><input id="name" className="input" required autoComplete="name" value={f.name} onChange={up('name')} /></div>
          <div><label className="label" htmlFor="phone">Telefone / WhatsApp</label><input id="phone" className="input" required inputMode="tel" autoComplete="tel" placeholder="(91) 90000-0000" value={f.phone} onChange={up('phone')} /></div>

          <fieldset>
            <legend className="label">Forma de recebimento</legend>
            <div className="grid grid-cols-2 gap-3">
              {(['entrega', 'retirada'] as const).map(m => (
                <label key={m} className={`cursor-pointer border p-4 text-center text-sm font-semibold uppercase tracking-widest transition-colors ${f.method === m ? 'border-white bg-white text-black' : 'border-white/15 hover:border-white/50'}`}>
                  <input type="radio" name="method" className="sr-only" checked={f.method === m} onChange={() => setF(s => ({ ...s, method: m }))} />
                  {m === 'entrega' ? 'Entrega' : 'Retirada'}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="label" htmlFor="city">Cidade</label><input id="city" className="input" required value={f.city} onChange={up('city')} /></div>
            {delivery && <div><label className="label" htmlFor="nb">Bairro</label><input id="nb" className="input" required value={f.neighborhood} onChange={up('neighborhood')} /></div>}
          </div>
          {delivery && <div><label className="label" htmlFor="addr">Endereço (rua, número, complemento)</label><input id="addr" className="input" required autoComplete="street-address" value={f.address} onChange={up('address')} /></div>}
          <div><label className="label" htmlFor="obs">Observações</label><textarea id="obs" rows={3} className="input" value={f.notes} onChange={up('notes')} /></div>
          {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
        </div>

        <aside className="card h-fit space-y-3 p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-lg uppercase">Resumo</h2>
          <ul className="space-y-2 border-b border-white/10 pb-3 text-sm">
            {items.map(i => (
              <li key={i.key} className="flex justify-between gap-3"><span className="text-white/80">{i.qty}× {i.name} <span className="text-mute">({i.size}/{i.color})</span></span><span>{brl(i.price * i.qty)}</span></li>
            ))}
          </ul>
          <div className="flex justify-between text-sm"><span className="text-mute">Subtotal</span><span>{brl(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm"><span className="text-mute">Desconto</span><span className="text-emerald-400">-{brl(discount)}</span></div>}
          {delivery && <div className="flex justify-between text-sm"><span className="text-mute">Frete</span><span>{shipping > 0 ? brl(shipping) : settings.shipping_fee > 0 ? 'Grátis' : 'A combinar'}</span></div>}
          <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold"><span>Total</span><span>{brl(grand)}</span></div>
          {!number && <p className="text-xs text-red-400">Número de WhatsApp da loja ainda não configurado.</p>}
          <button type="submit" className="btn-light w-full" disabled={!number}><MessageCircle size={16} /> Enviar pedido pelo WhatsApp</button>
          <p className="text-[11px] text-mute">O pedido será confirmado pela loja após o envio da mensagem. Não há pagamento online neste site.</p>
        </aside>
      </form>
    </div>
  )
}
