import { useState, type FormEvent } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { Boxes, ExternalLink, Image as ImageIcon, LayoutDashboard, LogOut, Receipt, Settings, Tags } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabaseConfigured } from '../lib/supabase'
import { useSEO } from '../lib/hooks'
import { SetupNotice } from '../components/ui'
import Dashboard from './Dashboard'
import ProductsAdmin from './ProductsAdmin'
import ProductForm from './ProductForm'
import CategoriesAdmin from './CategoriesAdmin'
import BannersAdmin from './BannersAdmin'
import SettingsAdmin from './SettingsAdmin'
import OrdersAdmin from './OrdersAdmin'

function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('')
    const r = await signIn(email, pw)
    if (r) setErr(r)
    setBusy(false)
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-8">
        <img src="/logo.png" alt="JP STORE" className="mx-auto h-16 w-16 rounded-sm" />
        <h1 className="text-center font-display text-xl uppercase">Painel administrativo</h1>
        <div><label className="label" htmlFor="em">E-mail</label><input id="em" type="email" required className="input" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="pw">Senha</label><input id="pw" type="password" required className="input" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} /></div>
        {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
        <button className="btn-light w-full" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        <Link to="/" className="block text-center text-xs uppercase tracking-widest text-mute hover:text-white">← Voltar à loja</Link>
      </form>
    </div>
  )
}

const nav = [
  ['/admin', 'Dashboard', LayoutDashboard, true],
  ['/admin/produtos', 'Produtos', Boxes, false],
  ['/admin/categorias', 'Categorias', Tags, false],
  ['/admin/banners', 'Banners', ImageIcon, false],
  ['/admin/pedidos', 'Pedidos', Receipt, false],
  ['/admin/configuracoes', 'Configurações', Settings, false],
] as const

export default function AdminApp() {
  useSEO('Painel administrativo')
  const { session, isAdmin, loading, signOut } = useAuth()

  if (!supabaseConfigured) return <div className="p-6"><SetupNotice /></div>
  if (loading) return <div className="p-10 text-mute">Carregando…</div>
  if (!session) return <Login />
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-display text-2xl uppercase">Acesso negado</h1>
        <p className="max-w-md text-sm text-mute">Esta conta não tem permissão de administrador. Peça para promover o seu usuário (profiles.role = 'admin').</p>
        <button className="btn-outline" onClick={signOut}>Sair</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink md:flex">
      <aside className="border-b border-white/10 bg-black md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 p-4 md:p-5">
          <img src="/logo.png" alt="" className="h-9 w-9 rounded-sm" />
          <div><p className="font-display text-sm leading-none">JP STORE</p><p className="text-[10px] uppercase tracking-widest text-mute">Admin</p></div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0">
          {nav.map(([to, label, Icon, end]) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-white text-black' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden space-y-1 p-3 md:absolute md:bottom-0 md:block md:w-full">
          <Link to="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white"><ExternalLink size={16} /> Ver loja</Link>
          <button onClick={signOut} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white"><LogOut size={16} /> Sair</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mb-4 flex justify-end gap-3 md:hidden">
          <Link to="/" className="text-xs uppercase tracking-widest text-mute">Ver loja</Link>
          <button onClick={signOut} className="text-xs uppercase tracking-widest text-mute">Sair</button>
        </div>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="produtos" element={<ProductsAdmin />} />
          <Route path="produtos/novo" element={<ProductForm />} />
          <Route path="produtos/:id" element={<ProductForm />} />
          <Route path="categorias" element={<CategoriesAdmin />} />
          <Route path="banners" element={<BannersAdmin />} />
          <Route path="pedidos" element={<OrdersAdmin />} />
          <Route path="configuracoes" element={<SettingsAdmin />} />
        </Routes>
      </main>
    </div>
  )
}
