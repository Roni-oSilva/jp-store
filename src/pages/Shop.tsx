import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { fetchProducts } from '../lib/api'
import { useAsync, useSEO } from '../lib/hooks'
import { effectivePrice, hasPromo } from '../lib/format'
import { useStore } from '../context/StoreContext'
import ProductCard from '../components/ProductCard'
import { EmptyState, Notice, ProductGridSkeleton, SetupNotice, needsSetup } from '../components/ui'

type Mode = 'novidades' | 'promocoes' | undefined

export default function Shop({ mode }: { mode?: Mode }) {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const { categories, settings } = useStore()
  const [panel, setPanel] = useState(false)

  const q = params.get('q') ?? ''
  const sort = params.get('ordem') ?? 'recentes'
  const size = params.get('tamanho') ?? ''
  const color = params.get('cor') ?? ''
  const min = params.get('min') ?? ''
  const max = params.get('max') ?? ''
  const catSlug = slug ?? params.get('categoria') ?? ''

  const cat = categories.find(c => c.slug === catSlug)
  const title = mode === 'novidades' ? 'Novidades' : mode === 'promocoes' ? 'Promoções' : cat ? cat.name : q ? `Busca: ${q}` : 'Todos os produtos'
  useSEO(title, `${title} na JP STORE — moda masculina streetwear.`)

  const { data, loading, error } = useAsync(() => (needsSetup ? Promise.resolve([]) : fetchProducts()), [])

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(params)
    if (v) n.set(k, v); else n.delete(k)
    setParams(n, { replace: true })
  }

  const allSizes = useMemo(() => {
    const s = new Set<string>(settings.sizes)
    data?.forEach(p => p.product_variants.forEach(v => s.add(v.size)))
    return [...s]
  }, [data, settings.sizes])
  const allColors = useMemo(() => {
    const m = new Map<string, string | null>()
    data?.forEach(p => p.product_variants.forEach(v => m.set(v.color, v.color_hex)))
    return [...m.entries()]
  }, [data])

  const results = useMemo(() => {
    let r = [...(data ?? [])]
    if (mode === 'promocoes') r = r.filter(hasPromo)
    if (cat) r = r.filter(p => p.category_id === cat.id || categories.find(c => c.id === p.category_id)?.parent_id === cat.id)
    if (q) { const t = q.toLowerCase(); r = r.filter(p => p.name.toLowerCase().includes(t) || p.description.toLowerCase().includes(t)) }
    if (size) r = r.filter(p => p.product_variants.some(v => v.size === size && v.stock > 0))
    if (color) r = r.filter(p => p.product_variants.some(v => v.color === color && v.stock > 0))
    if (min) r = r.filter(p => effectivePrice(p) >= Number(min))
    if (max) r = r.filter(p => effectivePrice(p) <= Number(max))
    const s = mode === 'novidades' ? 'recentes' : sort
    if (s === 'menor') r.sort((a, b) => effectivePrice(a) - effectivePrice(b))
    else if (s === 'maior') r.sort((a, b) => effectivePrice(b) - effectivePrice(a))
    else r.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    return r
  }, [data, mode, cat, categories, q, size, color, min, max, sort])

  const hasFilters = Boolean(size || color || min || max || q)

  const Filters = (
    <div className="space-y-8">
      {!mode && (
        <div>
          <p className="label">Categoria</p>
          <div className="flex flex-col items-start gap-1.5">
            <Link to="/loja" className={`text-sm ${!cat ? 'font-bold text-white' : 'text-white/60 hover:text-white'}`}>Todas</Link>
            {categories.map(c => <Link key={c.id} to={`/categoria/${c.slug}`} className={`text-sm ${cat?.id === c.id ? 'font-bold text-white' : 'text-white/60 hover:text-white'}`}>{c.name}</Link>)}
          </div>
        </div>
      )}
      <div>
        <p className="label">Preço (R$)</p>
        <div className="flex items-center gap-2">
          <input className="input" inputMode="numeric" placeholder="Mín" value={min} onChange={e => set('min', e.target.value.replace(/\D/g, ''))} />
          <input className="input" inputMode="numeric" placeholder="Máx" value={max} onChange={e => set('max', e.target.value.replace(/\D/g, ''))} />
        </div>
      </div>
      <div>
        <p className="label">Tamanho</p>
        <div className="flex flex-wrap gap-2">
          {allSizes.map(s => (
            <button key={s} onClick={() => set('tamanho', size === s ? '' : s)} className={`min-w-11 border px-3 py-2 text-xs font-semibold transition-colors ${size === s ? 'border-white bg-white text-black' : 'border-white/15 hover:border-white/60'}`}>{s}</button>
          ))}
        </div>
      </div>
      {allColors.length > 0 && (
        <div>
          <p className="label">Cor</p>
          <div className="flex flex-wrap gap-2">
            {allColors.map(([name, hex]) => (
              <button key={name} onClick={() => set('cor', color === name ? '' : name)} className={`flex items-center gap-2 border px-3 py-2 text-xs transition-colors ${color === name ? 'border-white bg-white text-black' : 'border-white/15 hover:border-white/60'}`}>
                {hex && <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: hex }} />}{name}
              </button>
            ))}
          </div>
        </div>
      )}
      {hasFilters && <button className="text-xs uppercase tracking-widest text-mute underline hover:text-white" onClick={() => setParams({}, { replace: true })}>Limpar filtros</button>}
    </div>
  )

  return (
    <div className="container-x py-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h-display text-4xl md:text-6xl">{title}</h1>
          {!loading && <p className="mt-2 text-sm text-mute">{results.length} {results.length === 1 ? 'produto' : 'produtos'}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline !py-3 lg:hidden" onClick={() => setPanel(true)}><SlidersHorizontal size={14} /> Filtros</button>
          {!mode || mode === 'promocoes' ? (
            <select aria-label="Ordenar" className="input !w-auto" value={sort} onChange={e => set('ordem', e.target.value)}>
              <option value="recentes">Mais recentes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          ) : null}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{Filters}</aside>
        <div>
          {needsSetup && <SetupNotice />}
          {error && <Notice title="Erro ao carregar produtos">{error}</Notice>}
          {loading && !needsSetup && <ProductGridSkeleton />}
          {!loading && !error && !needsSetup && results.length === 0 && (
            <EmptyState title="Nenhum produto encontrado" text={hasFilters ? 'Tente remover alguns filtros.' : 'Ainda não há produtos nesta seção.'} />
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
            {results.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </div>

      {panel && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setPanel(false)} />
          <div className="absolute bottom-0 max-h-[85vh] w-full overflow-y-auto bg-ink p-6">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-lg uppercase">Filtros</h2><button aria-label="Fechar" onClick={() => setPanel(false)}><X size={22} /></button></div>
            {Filters}
            <button className="btn-light mt-8 w-full" onClick={() => setPanel(false)}>Ver {results.length} produtos</button>
          </div>
        </div>
      )}
    </div>
  )
}
