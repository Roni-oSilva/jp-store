import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { fetchProducts } from '../lib/api'
import { useAsync, useSEO } from '../lib/hooks'
import { effectivePrice, hasPromo } from '../lib/format'
import { useStore } from '../context/StoreContext'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
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
    <div className="space-y-7">
      <div>
        <p className="flabel">Preço (R$)</p>
        <div className="flex items-center gap-2">
          <input className="field" inputMode="numeric" placeholder="Mín" value={min} onChange={e => set('min', e.target.value.replace(/\D/g, ''))} />
          <input className="field" inputMode="numeric" placeholder="Máx" value={max} onChange={e => set('max', e.target.value.replace(/\D/g, ''))} />
        </div>
      </div>
      <div>
        <p className="flabel">Tamanho</p>
        <div className="flex flex-wrap gap-2">
          {allSizes.map(s => (
            <button key={s} onClick={() => set('tamanho', size === s ? '' : s)} aria-pressed={size === s}
              className={`flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-bold transition-colors ${size === s ? 'bg-charcoal text-white' : 'bg-soft hover:bg-black/10'}`}>{s}</button>
          ))}
        </div>
      </div>
      {allColors.length > 0 && (
        <div>
          <p className="flabel">Cor</p>
          <div className="flex flex-wrap gap-3">
            {allColors.map(([name, hex]) => (
              <button key={name} title={name} aria-label={name} aria-pressed={color === name} onClick={() => set('cor', color === name ? '' : name)}
                className={`h-9 w-9 rounded-full border border-black/10 transition-all ${color === name ? 'ring-2 ring-charcoal ring-offset-2' : ''}`} style={{ background: hex ?? '#ccc' }} />
            ))}
          </div>
        </div>
      )}
      {hasFilters && <button className="text-sm font-semibold text-sub underline hover:text-txt" onClick={() => setParams({}, { replace: true })}>Limpar filtros</button>}
    </div>
  )

  return (
    <div className="container-x py-6 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="title text-4xl md:text-6xl">{title}</h1>
          {!loading && !needsSetup && <p className="mt-2 text-sm text-sub">{results.length} {results.length === 1 ? 'produto' : 'produtos'}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button className="pill-light !py-3 lg:hidden" onClick={() => setPanel(true)}><SlidersHorizontal size={15} /> Filtros</button>
          {(!mode || mode === 'promocoes') && (
            <select aria-label="Ordenar" className="field !w-auto !rounded-full !py-3 pr-8 font-semibold" value={sort} onChange={e => set('ordem', e.target.value)}>
              <option value="recentes">Mais recentes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          )}
        </div>
      </div>

      {!mode && categories.length > 0 && (
        <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Link to="/loja" className={`chip ${!cat ? 'chip-on' : ''}`}>Todas</Link>
          {categories.map(c => <Link key={c.id} to={`/categoria/${c.slug}`} className={`chip ${cat?.id === c.id ? 'chip-on' : ''}`}>{c.name}</Link>)}
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block"><div className="surface sticky top-24 p-6">{Filters}</div></aside>
        <div>
          {needsSetup && <SetupNotice />}
          {error && <Notice title="Erro ao carregar produtos">{error}</Notice>}
          {loading && !needsSetup && <ProductGridSkeleton />}
          {!loading && !error && !needsSetup && results.length === 0 && (
            <EmptyState title="Nenhum produto encontrado" text={hasFilters ? 'Tente remover alguns filtros.' : 'Ainda não há produtos nesta seção.'} />
          )}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
            {results.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 70}><ProductCard p={p} /></Reveal>)}
          </div>
        </div>
      </div>

      {panel && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPanel(false)} />
          <div className="slide-up absolute bottom-0 max-h-[85vh] w-full overflow-y-auto rounded-t-4xl bg-paper p-6 pb-8">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-extrabold">Filtros</h2><button aria-label="Fechar" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" onClick={() => setPanel(false)}><X size={20} /></button></div>
            {Filters}
            <button className="pill-dark mt-8 w-full" onClick={() => setPanel(false)}>Ver {results.length} {results.length === 1 ? 'produto' : 'produtos'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
