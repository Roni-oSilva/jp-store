import { useState } from 'react'
import { Ban, Check, Copy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAsync } from '../lib/hooks'

interface DemoLink { token: string; note: string; created_at: string; redeemed_at: string | null; revoked: boolean }

const urlOf = (t: string) => `${window.location.origin}/demo/acesso/${t}`

export default function DemoLinksAdmin() {
  const { data, loading, error, reload } = useAsync(async () => {
    const { data, error } = await supabase!.from('demo_links').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as DemoLink[]
  }, [])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState('')

  const create = async () => {
    setBusy(true); setMsg('')
    const { data: token, error } = await supabase!.rpc('create_demo_link', { p_note: note.trim() })
    setBusy(false)
    if (error) return setMsg(error.message)
    setNote(''); reload()
    try { await navigator.clipboard.writeText(urlOf(token as string)); setCopied(token as string); setTimeout(() => setCopied(''), 2500) } catch { /* ignore */ }
    setMsg('Link criado e copiado. Não o abra antes de enviar: o primeiro aparelho que abrir fica com o acesso.')
  }
  const copy = async (t: string) => { try { await navigator.clipboard.writeText(urlOf(t)); setCopied(t); setTimeout(() => setCopied(''), 2000) } catch { /* ignore */ } }
  const revoke = async (t: string) => {
    if (!confirm('Cancelar este link? Quem já abriu perde o acesso.')) return
    const { error } = await supabase!.from('demo_links').update({ revoked: true }).eq('token', t)
    if (error) alert(error.message); else reload()
  }

  return (
    <div className="max-w-3xl">
      <h1 className="h-display text-3xl md:text-4xl">Links de demo</h1>
      <p className="mt-2 text-sm text-mute">
        Cada link libera a demonstração da loja (com produtos de exemplo e painel de teste) para <strong>um único aparelho</strong>: o primeiro que abrir fica com o acesso e,
        em qualquer outro aparelho, o link mostra "já utilizado". Nada do demo altera a loja real.
      </p>

      <div className="card mt-6 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-48 flex-1"><label className="label">Para quem é (opcional)</label><input className="input" placeholder="Ex.: Dono da loja" value={note} onChange={e => setNote(e.target.value)} /></div>
        <button className="btn-light" disabled={busy} onClick={create}>{busy ? 'Criando…' : 'Gerar link'}</button>
      </div>
      {msg && <p role="status" className="mt-3 text-sm text-amber-200">{msg}</p>}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {loading && <p className="mt-6 text-mute">Carregando…</p>}

      <ul className="mt-6 space-y-3">
        {data?.map(l => (
          <li key={l.token} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-semibold">{l.note || 'Sem nome'}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${l.revoked ? 'bg-red-500/20 text-red-300' : l.redeemed_at ? 'bg-amber-400/20 text-amber-200' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {l.revoked ? 'Cancelado' : l.redeemed_at ? `Usado em ${new Date(l.redeemed_at).toLocaleString('pt-BR')}` : 'Ainda não usado'}
              </span>
            </div>
            <p className="mt-2 break-all text-xs text-mute">{urlOf(l.token)}</p>
            <div className="mt-3 flex gap-2">
              <button className="btn-outline !px-4 !py-2" onClick={() => copy(l.token)}>{copied === l.token ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar link</>}</button>
              {!l.revoked && <button className="btn-outline !px-4 !py-2" onClick={() => revoke(l.token)}><Ban size={14} /> Cancelar</button>}
            </div>
          </li>
        ))}
      </ul>
      {!loading && data?.length === 0 && <p className="mt-8 text-center text-mute">Nenhum link criado ainda.</p>}
    </div>
  )
}
