import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Home, LayoutGrid, Menu as MenuIcon, Search, ShoppingBag, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useStore } from '../context/StoreContext'

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-charcoal text-white' : 'text-txt/70 hover:bg-white hover:text-txt'}`

export default function Header() {
  const { count, setOpen } = useCart()
  const { categories } = useStore()
  const { pathname } = useLocation()
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const [q, setQ] = useState('')
  const nav = useNavigate()

  useEffect(() => { setMenu(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menu])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    nav(`/loja?q=${encodeURIComponent(q.trim())}`)
    setSearch(false); setMenu(false); setQ('')
  }

  const SearchBox = ({ className = '' }: { className?: string }) => (
    <form onSubmit={submit} className={`flex items-center gap-2 rounded-full bg-white px-4 ${className}`}>
      <Search size={17} className="shrink-0 text-sub" />
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar peças…" aria-label="Buscar produtos" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-sub" />
    </form>
  )

  return (
    <>
      <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between gap-4 md:h-20">
          <Link to="/" className="flex items-center gap-2.5" aria-label="JP STORE — início">
            <img src="/logo.png" alt="JP STORE" className="h-10 w-auto md:h-11" />
            <span className="whitespace-nowrap text-lg font-extrabold tracking-tight md:text-xl">JP STORE</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            <NavLink to="/" end className={linkCls}>Início</NavLink>
            <NavLink to="/loja" end className={linkCls}>Loja</NavLink>
            <div className="group relative">
              <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-txt/70 transition-colors group-hover:bg-white group-hover:text-txt">
                Categorias <ChevronDown size={14} />
              </button>
              <div className="invisible absolute left-1/2 top-full w-56 -translate-x-1/2 pt-2 opacity-0 transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="rounded-3xl bg-white p-2 shadow-2xl ring-1 ring-black/5">
                  {categories.length === 0 && <p className="px-4 py-2 text-xs text-sub">Sem categorias</p>}
                  {categories.map(c => (
                    <Link key={c.id} to={`/categoria/${c.slug}`} className="block rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-soft">{c.name}</Link>
                  ))}
                </div>
              </div>
            </div>
            <NavLink to="/novidades" className={linkCls}>Novidades</NavLink>
            <NavLink to="/promocoes" className={linkCls}>Promoções</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <SearchBox className="hidden w-60 md:flex" />
            <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white md:hidden" aria-label="Pesquisar" onClick={() => setSearch(s => !s)}><Search size={19} /></button>
            <button className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white transition-colors hover:bg-soft" aria-label={`Sacola, ${count} itens`} onClick={() => setOpen(true)}>
              <ShoppingBag size={19} />
              {count > 0 && <span key={count} className="pop absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-charcoal px-1 text-[10px] font-bold text-white">{count}</span>}
            </button>
          </div>
        </div>
        {search && <div className="container-x pb-3 md:hidden"><SearchBox /></div>}
      </header>

      {/* Barra de navegação flutuante (celular) */}
      <nav aria-label="Navegação rápida" className="fixed bottom-4 left-1/2 z-40 flex w-[min(92%,360px)] -translate-x-1/2 items-center justify-around rounded-full bg-white p-2 shadow-[0_10px_40px_rgba(0,0,0,.18)] ring-1 ring-black/5 md:hidden">
        {([
          { to: '/', icon: Home, label: 'Início', on: pathname === '/' },
          { to: '/loja', icon: LayoutGrid, label: 'Loja', on: pathname.startsWith('/loja') || pathname.startsWith('/categoria') || pathname.startsWith('/produto') },
        ] as const).map(({ to, icon: I, label, on }) => (
          <Link key={to} to={to} aria-label={label} className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${on ? 'bg-charcoal text-white' : 'text-txt/60'}`}><I size={20} /></Link>
        ))}
        <button aria-label="Sacola" onClick={() => setOpen(true)} className={`relative flex h-12 w-12 items-center justify-center rounded-full ${pathname === '/sacola' ? 'bg-charcoal text-white' : 'text-txt/60'}`}>
          <ShoppingBag size={20} />
          {count > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-charcoal px-1 text-[9px] font-bold text-white ring-2 ring-white">{count}</span>}
        </button>
        <button aria-label="Menu" onClick={() => setMenu(true)} className="flex h-12 w-12 items-center justify-center rounded-full text-txt/60"><MenuIcon size={20} /></button>
      </nav>

      {menu && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenu(false)} />
          <div className="slide-up absolute bottom-0 max-h-[85vh] w-full overflow-y-auto rounded-t-4xl bg-paper p-6 pb-10">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-extrabold">Menu</span>
              <button aria-label="Fechar menu" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" onClick={() => setMenu(false)}><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['/novidades', 'Novidades'], ['/promocoes', 'Promoções'], ['/loja', 'Todos os produtos'], ['/contato', 'Contato']].map(([to, l]) => (
                <Link key={to} to={to} className="surface px-4 py-4 text-sm font-bold">{l}</Link>
              ))}
            </div>
            <p className="mb-3 mt-8 text-xs font-semibold text-sub">Categorias</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => <Link key={c.id} to={`/categoria/${c.slug}`} className="chip">{c.name}</Link>)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
