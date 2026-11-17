import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Minus, Plus, Share2 } from 'lucide-react'
import { fetchProductBySlug } from '../lib/api'
import { useAsync, useSEO } from '../lib/hooks'
import { brl, effectivePrice, hasPromo, inStock, sortedImages, totalStock } from '../lib/format'
import { useCart } from '../context/CartContext'
import { Notice } from '../components/ui'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const { data: p, loading, error } = useAsync(() => fetchProductBySlug(slug), [slug])
  const { add } = useCart()
  const [img, setImg] = useState(0)
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)
  const [warn, setWarn] = useState('')
  const [copied, setCopied] = useState(false)

  useSEO(p ? p.name : 'Produto', p ? p.description.slice(0, 155) : undefined, p ? sortedImages(p)[0]?.url : undefined)
  useEffect(() => { setImg(0); setSize(''); setColor(''); setQty(1); setWarn('') }, [slug])

  const images = p ? sortedImages(p) : []
  const colors = useMemo(() => {
    const m = new Map<string, string | null>()
    p?.product_variants.forEach(v => m.set(v.color, v.color_hex))
    return [...m.entries()]
  }, [p])
  const sizes = useMemo(() => [...new Set(p?.product_variants.map(v => v.size) ?? [])], [p])

  if (loading) return <div className="container-x py-16"><div className="grid gap-10 md:grid-cols-2"><div className="skeleton aspect-[3/4]" /><div className="skeleton h-96" /></div></div>
  if (error) return <div className="container-x py-20"><Notice title="Erro ao carregar o produto">{error}</Notice></div>
  if (!p) return <div className="container-x py-20"><Notice title="Produto não encontrado"><Link to="/loja" className="underline">Voltar à loja</Link></Notice></div>

  const stockOf = (s: string, c: string) => p.product_variants.find(v => v.size === s && v.color === c)?.stock ?? 0
  const sizeAvailable = (s: string) => (color ? stockOf(s, color) > 0 : p.product_variants.some(v => v.size === s && v.stock > 0))
  const colorAvailable = (c: string) => (size ? stockOf(size, c) > 0 : p.product_variants.some(v => v.color === c && v.stock > 0))
  const selStock = size && color ? stockOf(size, color) : 0
  const ok = inStock(p)
  const promo = hasPromo(p)

  const addToCart = () => {
    if (!color || !size) { setWarn(!color && !size ? 'Selecione tamanho e cor.' : !size ? 'Selecione um tamanho.' : 'Selecione uma cor.'); return }
    if (selStock < 1) { setWarn('Combinação indisponível.'); return }
    add({
      productId: p.id, slug: p.slug, name: p.name, image: images[0]?.url,
      price: effectivePrice(p), fullPrice: p.price, size, color, qty,
      variants: p.product_variants.map(v => ({ size: v.size, color: v.color, stock: v.stock })),
    })
    setWarn('')
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: p.name, text: `${p.name} — JP STORE`, url })
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    } catch { /* cancelado */ }
  }

  return (
    <div className="container-x py-8 md:py-14">
      <nav className="mb-6 text-xs uppercase tracking-widest text-mute">
        <Link to="/" className="hover:text-white">Início</Link> / <Link to="/loja" className="hover:text-white">Loja</Link>
        {p.categories && <> / <Link to={`/categoria/${p.categories.slug}`} className="hover:text-white">{p.categories.name}</Link></>}
      </nav>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-14">
        {/* galeria */}
        <div className="flex flex-col-reverse gap-3 lg:flex-row">
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible">
              {images.map((im, i) => (
                <button key={im.id} onClick={() => setImg(i)} aria-label={`Foto ${i + 1}`} className={`h-20 w-16 shrink-0 overflow-hidden border lg:h-24 lg:w-20 ${i === img ? 'border-white' : 'border-white/10 opacity-60 hover:opacity-100'}`}>
                  <img src={im.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="aspect-[3/4] flex-1 overflow-hidden bg-graphite">
            {images[img] ? <img src={images[img].url} alt={p.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-mute">Sem foto</div>}
          </div>
        </div>

        {/* infos */}
        <div>
          {p.categories && <p className="text-xs uppercase tracking-widest text-mute">{p.categories.name}</p>}
          <h1 className="h-display mt-2 text-3xl md:text-5xl">{p.name}</h1>
          <p className="mt-4 text-2xl">
            {promo && <span className="mr-3 text-lg text-mute line-through">{brl(p.price)}</span>}
            <span className="font-bold">{brl(effectivePrice(p))}</span>
          </p>
          <p className={`mt-2 text-xs font-semibold uppercase tracking-widest ${ok ? 'text-emerald-400' : 'text-red-400'}`}>
            {ok ? (selStock > 0 && selStock <= 3 ? `Últimas ${selStock} unidades` : 'Disponível') : 'Esgotado'}
          </p>

          {colors.length > 0 && (
            <div className="mt-8">
              <p className="label">Cor {color && <span className="ml-1 text-white">— {color}</span>}</p>
              <div className="flex flex-wrap gap-2">
                {colors.map(([c, hex]) => (
                  <button key={c} disabled={!colorAvailable(c)} onClick={() => { setColor(c); setWarn('') }} aria-pressed={color === c}
                    className={`flex items-center gap-2 border px-4 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:line-through ${color === c ? 'border-white bg-white text-black' : 'border-white/15 hover:border-white/60'}`}>
                    {hex && <span className="h-3.5 w-3.5 rounded-full border border-white/30" style={{ background: hex }} />}{c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mt-6">
              <p className="label">Tamanho {size && <span className="ml-1 text-white">— {size}</span>}</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button key={s} disabled={!sizeAvailable(s)} onClick={() => { setSize(s); setWarn('') }} aria-pressed={size === s}
                    className={`min-w-12 border px-4 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:line-through ${size === s ? 'border-white bg-white text-black' : 'border-white/15 hover:border-white/60'}`}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="label">Quantidade</p>
            <div className="inline-flex items-center border border-white/15">
              <button className="p-3" aria-label="Diminuir" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={14} /></button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button className="p-3" aria-label="Aumentar" onClick={() => setQty(q => Math.min(selStock || 99, q + 1))}><Plus size={14} /></button>
            </div>
          </div>

          {warn && <p role="alert" className="mt-4 text-sm text-red-400">{warn}</p>}

          <div className="mt-6 flex gap-3">
            <button className="btn-light flex-1" disabled={!ok} onClick={addToCart}>{ok ? 'Adicionar à sacola' : 'Esgotado'}</button>
            <button className="btn-outline !px-4" aria-label="Compartilhar" onClick={share}>{copied ? <Check size={18} /> : <Share2 size={18} />}</button>
          </div>
          {copied && <p className="mt-2 text-xs text-mute">Link copiado.</p>}
          {totalStock(p) > 0 && <p className="mt-4 text-xs text-mute">Pedido finalizado pelo WhatsApp e confirmado pela loja.</p>}

          {p.description && (
            <div className="mt-10 border-t border-white/10 pt-6">
              <h2 className="label">Descrição</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-white/75">{p.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
