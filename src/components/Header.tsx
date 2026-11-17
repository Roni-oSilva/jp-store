import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useStore } from '../context/StoreContext'

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:text-white ${isActive ? 'text-white' : 'text-white/60'}`

export default function Header() {
  const { count, setOpen } = useCart()
  const { categories } = useStore()
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    nav(`/loja?q=${encodeURIComponent(q.trim())}`)
    setSearch(false); setMenu(false); setQ('')
  }

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors ${scrolled ? 'border-white/10 bg-ink/90 backdrop-blur' : 'border-transparent bg-ink'}`}>
      <div className="container-x flex h-16 items-center justify-between gap-4 md:h-20">
        <button className="p-2 -ml-2 md:hidden" aria-label="Abrir menu" onClick={() => setMenu(true)}><Menu size={22} /></button>

        <Link to="/" className="flex items-center gap-2" aria-label="JP STORE — início">
          <img src="/logo.png" alt="JP STORE" className="h-10 w-10 rounded-sm object-cover md:h-12 md:w-12" />
          <span className="font-display text-lg tracking-tight md:text-xl">JP STORE</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          <NavLink to="/" end className={linkCls}>Início</NavLink>
          <NavLink to="/loja" end className={linkCls}>Loja</NavLink>
          <div className="group relative">
            <button className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 transition-colors group-hover:text-white">
              Categorias <ChevronDown size={14} />
            </button>
            <div className="invisible absolute left-1/2 top-full w-56 -translate-x-1/2 pt-4 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="card py-2 shadow-2xl">
                {categories.length === 0 && <p className="px-4 py-2 text-xs text-mute">Sem categorias</p>}
                {categories.map(c => (
                  <Link key={c.id} to={`/categoria/${c.slug}`} className="block px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">{c.name}</Link>
                ))}
              </div>
            </div>
          </div>
          <NavLink to="/novidades" className={linkCls}>Novidades</NavLink>
          <NavLink to="/promocoes" className={linkCls}>Promoções</NavLink>
        </nav>

        <div className="flex items-center gap-1">
          <button className="p-2" aria-label="Pesquisar" onClick={() => setSearch(s => !s)}><Search size={20} /></button>
          <button className="relative p-2" aria-label={`Sacola, ${count} itens`} onClick={() => setOpen(true)}>
            <ShoppingBag size={20} />
            {count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">{count}</span>}
          </button>
        </div>
      </div>

      {search && (
        <form onSubmit={submit} className="border-t border-white/10 bg-ink">
          <div className="container-x flex items-center gap-3 py-3">
            <Search size={18} className="text-mute" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar produtos…" className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-mute" />
            <button type="button" aria-label="Fechar busca" onClick={() => setSearch(false)}><X size={18} /></button>
          </div>
        </form>
      )}

      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMenu(false)} />
          <div className="slide-in absolute left-0 top-0 h-full w-[84%] max-w-sm overflow-y-auto bg-ink p-6" style={{ animationName: 'none' }}>
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-lg">JP STORE</span>
              <button aria-label="Fechar menu" onClick={() => setMenu(false)}><X size={22} /></button>
            </div>
            <form onSubmit={submit} className="mb-6 flex items-center gap-2 border border-white/10 bg-graphite px-3">
              <Search size={16} className="text-mute" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar…" className="flex-1 bg-transparent py-3 text-sm outline-none" />
            </form>
            <nav className="flex flex-col" onClick={() => setMenu(false)}>
              {[['/', 'Início'], ['/loja', 'Loja'], ['/novidades', 'Novidades'], ['/promocoes', 'Promoções'], ['/contato', 'Contato']].map(([to, l]) => (
                <Link key={to} to={to} className="border-b border-white/5 py-4 text-sm font-semibold uppercase tracking-widest">{l}</Link>
              ))}
              <p className="pb-2 pt-6 text-[11px] uppercase tracking-widest text-mute">Categorias</p>
              {categories.map(c => <Link key={c.id} to={`/categoria/${c.slug}`} className="py-2.5 text-sm text-white/70">{c.name}</Link>)}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
