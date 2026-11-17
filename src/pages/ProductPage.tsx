import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Image as ImageIcon, Minus, Plus, Rotate3d, Share2 } from 'lucide-react'
import Viewer360 from '../components/Viewer360'
import { fetchProductBySlug } from '../lib/api'
import { useAsync, useSEO } from '../lib/hooks'
import { brl, effectivePrice, hasPromo, inStock, sortedImages } from '../lib/format'
import { useCart } from '../context/CartContext'
import { Notice } from '../components/ui'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const nav = useNavigate()
  const { data: p, loading, error } = useAsync(() => fetchProductBySlug(slug), [slug])
  const { add, setOpen } = useCart()
  const [img, setImg] = useState(0)
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)
  const [warn, setWarn] = useState('')
  const [copied, setCopied] = useState(false)
  const [view360, setView360] = useState(false)
  const [added, setAdded] = useState(false)

  useSEO(p ? p.name : 'Produto', p ? p.description.slice(0, 155) : undefined, p ? sortedImages(p)[0]?.url : undefined)
  useEffect(() => { setImg(0); setSize(''); setColor(''); setQty(1); setWarn(''); setView360(false); setAdded(false) }, [slug])

  const images = p ? sortedImages(p) : []
  const colors = useMemo(() => {
    const m = new Map<string, string | null>()
    p?.product_variants.forEach(v => m.set(v.color, v.color_hex))
    return [...m.entries()]
  }, [p])
  const sizes = useMemo(() => [...new Set(p?.product_variants.map(v => v.size) ?? [])], [p])

  if (loading) return <div className="container-x py-8"><div className="grid gap-8 md:grid-cols-2"><div className="skeleton aspect-[4/5]" /><div className="skeleton h-96" /></div></div>
  if (error) return <div className="container-x py-20"><Notice title="Erro ao carregar o produto">{error}</Notice></div>
  if (!p) return <div className="container-x py-20"><Notice title="Produto não encontrado"><Link to="/loja" className="underline">Voltar à loja</Link></Notice></div>

  const stockOf = (s: string, c: string) => p.product_variants.find(v => v.size === s && v.color === c)?.stock ?? 0
  const sizeAvailable = (s: string) => (color ? stockOf(s, color) > 0 : p.product_variants.some(v => v.size === s && v.stock > 0))
  const colorAvailable = (c: string) => (size ? stockOf(size, c) > 0 : p.product_variants.some(v => v.color === c && v.stock > 0))
  const selStock = size && color ? stockOf(size, color) : 0
  const ok = inStock(p)
  const promo = hasPromo(p)

  const addToCart = (goCheckout = false) => {
    if (!color || !size) { setWarn(!color && !size ? 'Selecione tamanho e cor.' : !size ? 'Selecione um tamanho.' : 'Selecione uma cor.'); return }
    if (selStock < 1) { setWarn('Combinação indisponível.'); return }
    add({
      productId: p.id, slug: p.slug, name: p.name, image: images[0]?.url,
      price: effectivePrice(p), fullPrice: p.price, size, color, qty,
      variants: p.product_variants.map(v => ({ size: v.size, color: v.color, stock: v.stock })),
    })
    setWarn('')
    if (goCheckout) { setOpen(false); nav('/finalizar') } else { setAdded(true); setTimeout(() => setAdded(false), 1800) }
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: p.name, text: `${p.name} — JP STORE`, url })
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    } catch { /* cancelado */ }
  }

  return (
    <div className="container-x py-4 md:py-8">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => nav(-1)} className="flex items-center gap-1.5 text-sm font-semibold text-sub hover:text-txt"><ArrowLeft size={16} /> Voltar</button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white" aria-label="Compartilhar" onClick={share}>{copied ? <Check size={17} /> : <Share2 size={17} />}</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
        {/* galeria */}
        <div>
          <div className="group relative aspect-[4/5] overflow-hidden rounded-4xl bg-white">
            {view360 && images.length >= 3
              ? <Viewer360 images={images.map(i => i.url)} alt={p.name} />
              : images[img]
                ? <img key={img} src={images[img].url} alt={p.name} className="fade-in h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110" />
                : <div className="flex h-full items-center justify-center text-sm text-sub">Sem foto</div>}
            {promo && <span className="absolute left-4 top-4 rounded-full bg-charcoal px-3 py-1.5 text-xs font-bold text-white">-{Math.round((1 - effectivePrice(p) / p.price) * 100)}%</span>}
            {images.length >= 3 && (
              <button onClick={() => setView360(v => !v)} aria-pressed={view360}
                className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-xs font-bold shadow backdrop-blur transition-colors hover:bg-white">
                {view360 ? <><ImageIcon size={14} /> Fotos</> : <><Rotate3d size={14} /> Ver ao redor</>}
              </button>
            )}
            {!view360 && images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === img ? 'w-5 bg-charcoal' : 'w-1.5 bg-charcoal/30'}`} />)}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
              {images.map((im, i) => (
                <button key={im.id} onClick={() => { setImg(i); setView360(false) }} aria-label={`Foto ${i + 1}`}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 ${i === img && !view360 ? 'bg-charcoal p-1' : 'bg-white p-1 opacity-70 hover:opacity-100'}`}>
                  <img src={im.url} alt="" className="h-full w-full rounded-xl object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* infos */}
        <div className="md:py-2">
          {p.categories && <Link to={`/categoria/${p.categories.slug}`} className="text-sm font-semibold text-sub hover:text-txt">{p.categories.name}</Link>}
          <h1 className="title mt-1 text-4xl leading-tight md:text-5xl">{p.name}</h1>
          <p className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{brl(effectivePrice(p))}</span>
            {promo && <span className="text-lg text-sub line-through">{brl(p.price)}</span>}
          </p>
          <p className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {ok ? (selStock > 0 && selStock <= 3 ? `Últimas ${selStock} unidades` : 'Disponível') : 'Esgotado'}
          </p>

          {p.description && <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-txt/70">{p.description}</p>}

          <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_auto]">
            {sizes.length > 0 && (
              <div>
                <p className="flabel">Tamanho {size && <span className="text-txt">· {size}</span>}</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(s => (
                    <button key={s} disabled={!sizeAvailable(s)} onClick={() => { setSize(s); setWarn('') }} aria-pressed={size === s}
                      className={`flex h-12 min-w-12 items-center justify-center rounded-full px-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:line-through ${size === s ? 'bg-charcoal text-white' : 'bg-white hover:bg-soft'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {colors.length > 0 && (
              <div>
                <p className="flabel">Cor {color && <span className="text-txt">· {color}</span>}</p>
                <div className="flex flex-wrap gap-3">
                  {colors.map(([c, hex]) => (
                    <button key={c} title={c} aria-label={c} disabled={!colorAvailable(c)} onClick={() => { setColor(c); setWarn('') }} aria-pressed={color === c}
                      className={`h-10 w-10 rounded-full border border-black/10 transition-all disabled:cursor-not-allowed disabled:opacity-30 ${color === c ? 'ring-2 ring-charcoal ring-offset-2 ring-offset-paper' : ''}`} style={{ background: hex ?? '#ccc' }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="flabel">Quantidade</p>
            <div className="inline-flex items-center rounded-full bg-white">
              <button className="p-3.5" aria-label="Diminuir" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={15} /></button>
              <span className="w-10 text-center text-sm font-bold">{qty}</span>
              <button className="p-3.5" aria-label="Aumentar" onClick={() => setQty(q => Math.min(selStock || 99, q + 1))}><Plus size={15} /></button>
            </div>
          </div>

          {warn && <p role="alert" className="mt-4 text-sm font-semibold text-red-600">{warn}</p>}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className={`pill-light !py-4 ${added ? '!bg-emerald-100 !text-emerald-700' : ''}`} disabled={!ok} onClick={() => addToCart(false)}>
              {added ? <><Check size={16} className="pop" /> Adicionado</> : 'Adicionar à sacola'}
            </button>
            <button className="pill-dark shine !py-4" disabled={!ok} onClick={() => addToCart(true)}>{ok ? 'Comprar agora' : 'Esgotado'}</button>
          </div>
          {copied && <p className="mt-2 text-xs text-sub">Link copiado.</p>}
          <p className="mt-4 text-xs text-sub">Pedido finalizado pelo WhatsApp e confirmado pela loja.</p>
        </div>
      </div>
    </div>
  )
}
