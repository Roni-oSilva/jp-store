import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { onlyDigits } from '../lib/format'
import { useStore } from '../context/StoreContext'
import type { ColorOpt, StoreSettings } from '../lib/types'

export default function SettingsAdmin() {
  const { settings, reload } = useStore()
  const [s, setS] = useState<StoreSettings>(settings)
  const [newSize, setNewSize] = useState('')
  const [newColor, setNewColor] = useState<ColorOpt>({ name: '', hex: '#111111' })
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => setS(settings), [settings])
  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => setS(x => ({ ...x, [k]: v }))

  const save = async (e: FormEvent) => {
    e.preventDefault(); setMsg('')
    const wa = onlyDigits(s.whatsapp_number)
    if (wa && (wa.length < 12 || wa.length > 13 || !wa.startsWith('55'))) { setMsg('Número inválido. Use o formato 55 + DDD + número (ex.: 55DDNNNNNNNNN).'); return }
    setSaving(true)
    const { error } = await supabase!.from('store_settings').upsert({
      id: 1, store_name: s.store_name, tagline: s.tagline, whatsapp_number: wa, instagram: s.instagram.replace('@', ''),
      email: s.email, address: s.address, free_shipping_from: s.free_shipping_from, shipping_fee: s.shipping_fee,
      sizes: s.sizes, colors: s.colors, updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) return setMsg(error.message)
    await reload(); setMsg('Configurações salvas.')
  }

  const num = (v: string) => (v === '' ? null : Number(v.replace(',', '.')))

  return (
    <form onSubmit={save} className="max-w-3xl space-y-8">
      <h1 className="h-display text-3xl md:text-4xl">Configurações</h1>

      <section className="card space-y-4 p-5">
        <h2 className="font-display uppercase">WhatsApp dos pedidos</h2>
        <div><label className="label">Número com DDI e DDD (somente números)</label>
          <input className="input" inputMode="numeric" placeholder="55DDNNNNNNNNN" value={s.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} />
          <p className="mt-1 text-xs text-mute">Os pedidos serão enviados para wa.me/{onlyDigits(s.whatsapp_number) || '55…'}. Sem número configurado, a finalização fica desativada.</p></div>
      </section>

      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-display uppercase sm:col-span-2">Informações da loja</h2>
        <div><label className="label">Nome</label><input className="input" value={s.store_name} onChange={e => set('store_name', e.target.value)} /></div>
        <div><label className="label">Slogan</label><input className="input" value={s.tagline} onChange={e => set('tagline', e.target.value)} /></div>
        <div><label className="label">Instagram</label><input className="input" value={s.instagram} onChange={e => set('instagram', e.target.value)} /></div>
        <div><label className="label">E-mail</label><input type="email" className="input" value={s.email} onChange={e => set('email', e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">Endereço / retirada</label><input className="input" value={s.address} onChange={e => set('address', e.target.value)} /></div>
      </section>

      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-display uppercase sm:col-span-2">Frete</h2>
        <div><label className="label">Taxa de entrega (R$) — 0 = a combinar</label><input className="input" inputMode="decimal" value={s.shipping_fee} onChange={e => set('shipping_fee', Number(e.target.value.replace(',', '.')) || 0)} /></div>
        <div><label className="label">Frete grátis a partir de (R$)</label><input className="input" inputMode="decimal" value={s.free_shipping_from ?? ''} onChange={e => set('free_shipping_from', num(e.target.value))} /></div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-display uppercase">Tamanhos</h2>
        <div className="flex flex-wrap gap-2">{s.sizes.map(z => (
          <span key={z} className="flex items-center gap-1 border border-white/15 px-3 py-1.5 text-sm">{z}<button type="button" aria-label={`Remover ${z}`} onClick={() => set('sizes', s.sizes.filter(x => x !== z))}><X size={13} /></button></span>
        ))}</div>
        <div className="flex gap-2">
          <input className="input !w-32" placeholder="Ex.: XXG" value={newSize} onChange={e => setNewSize(e.target.value.toUpperCase())} />
          <button type="button" className="btn-outline !py-2" onClick={() => { const v = newSize.trim(); if (v && !s.sizes.includes(v)) set('sizes', [...s.sizes, v]); setNewSize('') }}>Adicionar</button>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-display uppercase">Cores</h2>
        <div className="flex flex-wrap gap-2">{s.colors.map(c => (
          <span key={c.name} className="flex items-center gap-2 border border-white/15 px-3 py-1.5 text-sm"><span className="h-3.5 w-3.5 rounded-full border border-white/30" style={{ background: c.hex }} />{c.name}
            <button type="button" aria-label={`Remover ${c.name}`} onClick={() => set('colors', s.colors.filter(x => x.name !== c.name))}><X size={13} /></button></span>
        ))}</div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="color" aria-label="Cor" className="h-11 w-14 cursor-pointer border border-white/10 bg-graphite p-1" value={newColor.hex} onChange={e => setNewColor(c => ({ ...c, hex: e.target.value }))} />
          <input className="input !w-44" placeholder="Nome da cor" value={newColor.name} onChange={e => setNewColor(c => ({ ...c, name: e.target.value }))} />
          <button type="button" className="btn-outline !py-2" onClick={() => { const n = newColor.name.trim(); if (n && !s.colors.some(c => c.name === n)) set('colors', [...s.colors, { name: n, hex: newColor.hex }]); setNewColor({ name: '', hex: '#111111' }) }}>Adicionar</button>
        </div>
      </section>

      {msg && <p role="status" className={`text-sm ${msg.endsWith('salvas.') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>}
      <button className="btn-light" disabled={saving}>{saving ? 'Salvando…' : 'Salvar configurações'}</button>
    </form>
  )
}
