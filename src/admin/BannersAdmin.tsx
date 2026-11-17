import { useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { fetchBanners, uploadImage } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAsync } from '../lib/hooks'
import type { Banner } from '../lib/types'

export default function BannersAdmin() {
  const { data, loading, error, reload } = useAsync(() => fetchBanners(true), [])
  const [busy, setBusy] = useState(false)

  const create = async () => {
    setBusy(true)
    const { error } = await supabase!.from('banners').insert({ title: 'Vista sua identidade.', subtitle: 'Moda urbana para quem não segue padrões.', sort_order: (data?.length ?? 0) + 1 })
    if (error) alert(error.message)
    setBusy(false); reload()
  }
  const save = async (b: Banner, patch: Partial<Banner>) => {
    const { error } = await supabase!.from('banners').update(patch).eq('id', b.id)
    if (error) alert(error.message); else reload()
  }
  const upload = async (b: Banner, f?: File | null) => {
    if (!f) return
    try { await save(b, { image_url: await uploadImage(f) }) } catch (e) { alert(e instanceof Error ? e.message : 'Falha no upload') }
  }
  const del = async (b: Banner) => {
    if (!confirm('Excluir este banner?')) return
    const { error } = await supabase!.from('banners').delete().eq('id', b.id)
    if (error) alert(error.message); else reload()
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between"><h1 className="h-display text-3xl md:text-4xl">Banners</h1><button className="btn-light" disabled={busy} onClick={create}>Novo banner</button></div>
      <p className="mt-2 text-sm text-mute">O primeiro banner ativo aparece no topo da página inicial. Use uma foto editorial horizontal (ex.: 1920×1080).</p>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {loading && <p className="mt-6 text-mute">Carregando…</p>}
      <div className="mt-6 space-y-5">
        {data?.map(b => (
          <div key={b.id} className="card grid gap-4 p-4 sm:grid-cols-[200px_1fr]">
            <label className="group relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden bg-black text-xs text-mute">
              {b.image_url ? <img src={b.image_url} alt="" className="h-full w-full object-cover" /> : <span className="flex items-center gap-1"><Upload size={14} /> Enviar foto</span>}
              <input type="file" accept="image/*" className="sr-only" onChange={e => upload(b, e.target.files?.[0])} />
            </label>
            <div className="space-y-3">
              {(['title', 'subtitle', 'button_text', 'link'] as const).map(k => (
                <div key={k}><label className="label">{{ title: 'Título', subtitle: 'Subtítulo', button_text: 'Texto do botão', link: 'Link do botão' }[k]}</label>
                  <input className="input" defaultValue={b[k]} onBlur={e => e.target.value !== b[k] && save(b, { [k]: e.target.value })} /></div>
              ))}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={b.is_active} onChange={e => save(b, { is_active: e.target.checked })} /> Ativo</label>
                <button aria-label="Excluir banner" className="p-2 hover:bg-white/10" onClick={() => del(b)}><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
