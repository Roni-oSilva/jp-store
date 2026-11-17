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
    return <div className="container-x py-24 text-center"><h1 className="title text-3xl">Sua sacola está vazia</h1><Link to="/loja" className="pill-dark mt-6">Ir para a loja</Link></div>
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
      <div className="container-x max-w-xl py-16 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-charcoal text-white"><MessageCircle size={34} /></span>
        <h1 className="title mt-6 text-3xl">Abrimos o WhatsApp</h1>
        <p className="mt-4 text-sm text-txt/70">
          Para concluir, <strong>envie a mensagem</strong> com o resumo do pedido na conversa que abriu. O pedido só é considerado recebido
          depois que a mensagem for enviada, e será <strong>confirmado pela loja</strong>.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <a href={sentLink} target="_blank" rel="noreferrer" className="pill-dark">Abrir o WhatsApp novamente</a>
          <button className="pill-light" onClick={() => { clear(); setSentLink('') }}>Já enviei — esvaziar sacola</button>
          <Link to="/sacola" className="text-xs font-semibold text-sub underline" onClick={() => setSentLink('')}>Voltar à sacola</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-x py-6 md:py-10">
      <h1 className="title mb-6 text-4xl md:text-5xl">Finalizar pedido</h1>
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="surface space-y-5 p-5 sm:p-7">
          <p className="text-sm text-sub">Sem cadastro. Ao finalizar, abriremos o WhatsApp da loja com o resumo completo do pedido.</p>
          <div><label className="flabel" htmlFor="name">Nome completo</label><input id="name" className="field !bg-paper" required autoComplete="name" value={f.name} onChange={up('name')} /></div>
          <div><label className="flabel" htmlFor="phone">Telefone / WhatsApp</label><input id="phone" className="field !bg-paper" required inputMode="tel" autoComplete="tel" placeholder="(91) 90000-0000" value={f.phone} onChange={up('phone')} /></div>

          <fieldset>
            <legend className="flabel">Forma de recebimento</legend>
            <div className="grid grid-cols-2 gap-3">
              {(['entrega', 'retirada'] as const).map(m => (
                <label key={m} className={`cursor-pointer rounded-full p-3.5 text-center text-sm font-bold transition-colors ${f.method === m ? 'bg-charcoal text-white' : 'bg-paper hover:bg-soft'}`}>
                  <input type="radio" name="method" className="sr-only" checked={f.method === m} onChange={() => setF(s => ({ ...s, method: m }))} />
                  {m === 'entrega' ? 'Entrega' : 'Retirada'}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="flabel" htmlFor="city">Cidade</label><input id="city" className="field !bg-paper" required value={f.city} onChange={up('city')} /></div>
            {delivery && <div><label className="flabel" htmlFor="nb">Bairro</label><input id="nb" className="field !bg-paper" required value={f.neighborhood} onChange={up('neighborhood')} /></div>}
          </div>
          {delivery && <div><label className="flabel" htmlFor="addr">Endereço (rua, número, complemento)</label><input id="addr" className="field !bg-paper" required autoComplete="street-address" value={f.address} onChange={up('address')} /></div>}
          <div><label className="flabel" htmlFor="obs">Observações</label><textarea id="obs" rows={3} className="field !bg-paper" value={f.notes} onChange={up('notes')} /></div>
          {err && <p role="alert" className="text-sm font-semibold text-red-600">{err}</p>}
        </div>

        <aside className="surface h-fit space-y-3 p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-extrabold">Resumo</h2>
          <ul className="space-y-2 border-b border-black/5 pb-3 text-sm">
            {items.map(i => (
              <li key={i.key} className="flex justify-between gap-3"><span>{i.qty}× {i.name} <span className="text-sub">({i.size}/{i.color})</span></span><span className="font-semibold">{brl(i.price * i.qty)}</span></li>
            ))}
          </ul>
          <div className="flex justify-between text-sm"><span className="text-sub">Subtotal</span><span>{brl(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm"><span className="text-sub">Desconto</span><span className="font-semibold text-emerald-600">-{brl(discount)}</span></div>}
          {delivery && <div className="flex justify-between text-sm"><span className="text-sub">Frete</span><span>{shipping > 0 ? brl(shipping) : settings.shipping_fee > 0 ? 'Grátis' : 'A combinar'}</span></div>}
          <div className="flex justify-between border-t border-black/5 pt-3 text-lg font-extrabold"><span>Total</span><span>{brl(grand)}</span></div>
          {!number && <p className="text-xs font-semibold text-red-600">Número de WhatsApp da loja ainda não configurado.</p>}
          <button type="submit" className="pill-dark w-full !py-4" disabled={!number}><MessageCircle size={17} /> Enviar pedido pelo WhatsApp</button>
          <p className="text-[11px] text-sub">O pedido será confirmado pela loja após o envio da mensagem. Não há pagamento online neste site.</p>
          <p className="text-[11px] text-sub">Ao enviar, você concorda com o uso dos seus dados para atender o pedido, conforme a <Link to="/privacidade" className="font-semibold underline">Política de Privacidade</Link>.</p>
        </aside>
      </form>
    </div>
  )
}
