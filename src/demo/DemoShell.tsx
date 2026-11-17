import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FlaskConical, LockKeyhole, RotateCcw, LogOut } from 'lucide-react'
import { realSupabase } from '../lib/supabase'
import { readDb, resetDb, writeDb } from './db'

const TOKEN_KEY = 'jp.demo.token'
const DEVICE_KEY = 'jp.demo.device'
const WA_SEEDED = 'jp.demo.waSeeded'

type State = 'checking' | 'ok' | 'invalid' | 'used' | 'revoked' | 'none' | 'error'

function deviceId() {
  try {
    let d = localStorage.getItem(DEVICE_KEY)
    if (!d) { d = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, d) }
    return d
  } catch { return 'no-storage-' + Math.random().toString(36).slice(2) }
}

async function redeem(token: string): Promise<State> {
  if (!realSupabase) return 'error'
  const { data, error } = await realSupabase.rpc('redeem_demo_link', { p_token: token, p_device: deviceId() })
  if (error) return 'error'
  return (['ok', 'used', 'revoked', 'invalid'].includes(data) ? data : 'invalid') as State
}

// Usa o número de WhatsApp real da loja (se já configurado) no demo, para o pedido de teste abrir uma conversa de verdade.
async function seedWhatsapp() {
  try {
    if (!realSupabase) return
    const db = readDb()
    const cfg = db.store_settings[0]
    // só copia se o demo ainda não tem número e o dono não o apagou/alterou de propósito
    if (!cfg || cfg.whatsapp_number || localStorage.getItem(WA_SEEDED)) return
    const { data } = await realSupabase.from('store_settings').select('whatsapp_number').eq('id', 1).maybeSingle()
    if (data?.whatsapp_number) {
      cfg.whatsapp_number = data.whatsapp_number
      writeDb(db)
      localStorage.setItem(WA_SEEDED, '1')
    }
  } catch { /* opcional */ }
}

const MESSAGES: Record<Exclude<State, 'checking' | 'ok'>, { title: string; text: string }> = {
  invalid: { title: 'Link inválido', text: 'Confira se o link foi copiado por inteiro ou peça um novo à equipe da JP STORE.' },
  used: { title: 'Este link já foi utilizado', text: 'Cada link de demonstração libera o acesso para um único aparelho, e este já foi liberado em outro lugar. Peça um novo link à equipe da JP STORE.' },
  revoked: { title: 'Link cancelado', text: 'Este link de demonstração foi cancelado. Peça um novo à equipe da JP STORE.' },
  none: { title: 'Acesso restrito', text: 'Esta é uma demonstração privada. Abra pelo link de acesso que você recebeu.' },
  error: { title: 'Não foi possível verificar o acesso', text: 'Verifique sua conexão e tente novamente.' },
}

export default function DemoShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const nav = useNavigate()
  const gate = pathname.match(/^\/acesso\/([A-Za-z0-9]{16,64})\/?$/)
  const gateToken = gate?.[1]
  const [state, setState] = useState<State>('checking')
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    document.title = 'JP STORE — Demonstração'
    let m = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m) }
    m.content = 'noindex, nofollow'
  }, [])

  useEffect(() => {
    let cancel = false
    let token = gateToken
    if (!token) { try { token = localStorage.getItem(TOKEN_KEY) ?? undefined } catch { /* ignore */ } }
    if (!token) { setState('none'); return }
    redeem(token).then(async r => {
      if (cancel) return
      if (r === 'ok') {
        try { localStorage.setItem(TOKEN_KEY, token!) } catch { /* ignore */ }
        await seedWhatsapp()
        if (cancel) return
        setState('ok')
        if (gateToken) nav('/', { replace: true })
      } else setState(r)
    })
    return () => { cancel = true }
  }, [gateToken, nav])

  if (state !== 'ok') {
    if (state === 'checking') return <div className="flex min-h-screen items-center justify-center text-sm text-sub">Verificando acesso…</div>
    const m = MESSAGES[state]
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="surface max-w-md p-8 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-charcoal text-white"><LockKeyhole size={26} /></span>
          <img src="/logo.png" alt="JP STORE" className="mx-auto mt-5 h-12 w-auto" />
          <h1 className="title mt-4 text-2xl">{m.title}</h1>
          <p className="mt-3 text-sm text-txt/70">{m.text}</p>
          {state === 'error' && <button className="pill-dark mt-6" onClick={() => location.reload()}>Tentar de novo</button>}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-amber-300 px-4 py-1.5 text-center text-xs font-bold text-black">
        VERSÃO DE DEMONSTRAÇÃO — produtos e pedidos são de exemplo e ficam só neste aparelho. Nada aqui altera a loja real.
      </div>
      {children}
      <div className="fixed bottom-24 left-3 z-50 md:bottom-4">
        {menu && (
          <div className="mb-2 w-60 rounded-3xl bg-white p-2 shadow-2xl ring-1 ring-black/5">
            <button className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm font-semibold hover:bg-soft"
              onClick={() => { if (confirm('Voltar aos produtos de exemplo? O que você cadastrou neste demo será apagado.')) { resetDb(); location.assign('/demo') } }}>
              <RotateCcw size={16} /> Restaurar exemplos
            </button>
            <button className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm font-semibold hover:bg-soft" onClick={() => location.assign('/demo/admin')}>
              <FlaskConical size={16} /> Painel de teste (admin)
            </button>
            <button className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm font-semibold hover:bg-soft" onClick={() => location.assign('/')}>
              <LogOut size={16} /> Sair do demo
            </button>
          </div>
        )}
        <button onClick={() => setMenu(m => !m)} aria-label="Menu do demo" className="flex items-center gap-1.5 rounded-full bg-amber-300 px-4 py-2.5 text-xs font-extrabold text-black shadow-lg">
          <FlaskConical size={15} /> DEMO
        </button>
      </div>
    </>
  )
}
