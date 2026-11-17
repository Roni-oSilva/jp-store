import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUp, Trash2, Upload, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/api'
import { slugify } from '../lib/format'
import { useStore } from '../context/StoreContext'
import type { Product } from '../lib/types'

interface VarRow { size: string; color: string; color_hex: string | null; stock: number }

export default function ProductForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const { categories, settings } = useStore()
  const editing = Boolean(id)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [promo, setPromo] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [onSale, setOnSale] = useState(false)
  const [featured, setFeatured] = useState(false)
  const [active, setActive] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [variants, setVariants] = useState<VarRow[]>([])
  const [pickSizes, setPickSizes] = useState<string[]>([])
  const [pickColors, setPickColors] = useState<string[]>([])
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!id || !supabase) return
    supabase.from('products').select('*, product_images(*), product_variants(*)').eq('id', id).maybeSingle().then(({ data, error }) => {
      if (error || !data) { setErr(error?.message ?? 'Produto não encontrado'); setLoading(false); return }
      const p = data as Product
      setName(p.name); setSlug(p.slug); setSlugTouched(true); setDescription(p.description)
      setPrice(String(p.price)); setPromo(p.promo_price != null ? String(p.promo_price) : '')
      setCategoryId(p.category_id ?? ''); setOnSale(p.is_on_sale); setFeatured(p.is_featured); setActive(p.is_active)
      setImages([...p.product_images].sort((a, b) => a.sort_order - b.sort_order).map(i => i.url))
      setVariants(p.product_variants.map(v => ({ size: v.size, color: v.color, color_hex: v.color_hex, stock: v.stock })))
      setLoading(false)
    })
  }, [id])

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true); setErr('')
    try {
      const urls: string[] = []
      for (const f of Array.from(files)) {
        if (!f.type.startsWith('image/')) throw new Error('Envie apenas imagens.')
        if (f.size > 8 * 1024 * 1024) throw new Error(`"${f.name}" passa de 8 MB.`)
        urls.push(await uploadImage(f))
      }
      setImages(i => [...i, ...urls])
    } catch (e) { setErr(e instanceof Error ? e.message : 'Falha no upload') }
    setUploading(false)
  }

  const generate = () => {
    const next = [...variants]
    for (const s of pickSizes) for (const cName of pickColors) {
      if (!next.some(v => v.size === s && v.color === cName)) {
        next.push({ size: s, color: cName, color_hex: settings.colors.find(c => c.name === cName)?.hex ?? null, stock: 0 })
      }
    }
    setVariants(next)
  }
  const toggle = (arr: string[], v: string, set: (a: string[]) => void) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v])

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    const priceN = Number(price.replace(',', '.'))
    const promoN = promo.trim() ? Number(promo.replace(',', '.')) : null
    if (!name.trim()) return setErr('Informe o nome.')
    if (!(priceN >= 0) || price === '') return setErr('Preço inválido.')
    if (promoN != null && (isNaN(promoN) || promoN >= priceN)) return setErr('O preço promocional deve ser menor que o preço normal.')
    if (onSale && promoN == null) return setErr('Informe o preço promocional ou desmarque "Em promoção".')
    if (variants.length === 0) return setErr('Adicione ao menos uma variação (tamanho/cor) com estoque.')
    const finalSlug = slugify(slug || name)
    if (!finalSlug) return setErr('URL inválida.')

    setSaving(true)
    try {
      const row = {
        name: name.trim(), slug: finalSlug, description, price: priceN, promo_price: promoN,
        category_id: categoryId || null, is_on_sale: onSale, is_featured: featured, is_active: active,
        updated_at: new Date().toISOString(),
      }
      let pid = id
      if (editing) {
        const { error } = await supabase!.from('products').update(row).eq('id', id!)
        if (error) throw error
      } else {
        const { data, error } = await supabase!.from('products').insert(row).select('id').single()
        if (error) throw error
        pid = data.id
      }
      await supabase!.from('product_images').delete().eq('product_id', pid!)
      if (images.length) {
        const { error } = await supabase!.from('product_images').insert(images.map((url, i) => ({ product_id: pid, url, sort_order: i })))
        if (error) throw error
      }
      await supabase!.from('product_variants').delete().eq('product_id', pid!)
      const { error: ve } = await supabase!.from('product_variants').insert(variants.map(v => ({ ...v, product_id: pid })))
      if (ve) throw ve
      nav('/admin/produtos')
    } catch (e) {
      const m = e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'Erro ao salvar'
      setErr(m.includes('duplicate') ? 'Já existe um produto com essa URL (slug).' : m)
    }
    setSaving(false)
  }

  if (loading) return <p className="text-mute">Carregando…</p>

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-8">
      <div className="flex items-center gap-3">
        <Link to="/admin/produtos" aria-label="Voltar" className="p-2 hover:bg-white/10"><ArrowLeft size={18} /></Link>
        <h1 className="h-display text-3xl">{editing ? 'Editar produto' : 'Novo produto'}</h1>
      </div>

      <section className="card grid gap-5 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label">Nome</label>
          <input className="input" value={name} onChange={e => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)) }} /></div>
        <div className="sm:col-span-2"><label className="label">URL amigável (slug)</label>
          <input className="input" value={slug} onChange={e => { setSlug(slugify(e.target.value)); setSlugTouched(true) }} /></div>
        <div className="sm:col-span-2"><label className="label">Descrição</label>
          <textarea rows={5} className="input" value={description} onChange={e => setDescription(e.target.value)} /></div>
        <div><label className="label">Categoria</label>
          <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Sem categoria</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Preço (R$)</label><input className="input" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} /></div>
          <div><label className="label">Promocional</label><input className="input" inputMode="decimal" value={promo} onChange={e => setPromo(e.target.value)} /></div>
        </div>
        <div className="flex flex-wrap gap-6 sm:col-span-2">
          {([['Em promoção', onSale, setOnSale], ['Produto em destaque', featured, setFeatured], ['Visível na loja', active, setActive]] as const).map(([l, v, s]) => (
            <label key={l} className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={v} onChange={e => s(e.target.checked)} /> {l}</label>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="label">Fotos (a primeira é a principal)</h2>
        <p className="mt-1 text-xs text-mute">Dica 360°: com 3 ou mais fotos tiradas em sequência ao redor da peça (frente, lado, costas, outro lado…), a loja libera o botão &quot;Ver ao redor&quot;, em que o cliente arrasta para girar. Quanto mais fotos, mais suave.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((u, i) => (
            <div key={u} className="group relative h-28 w-24 bg-graphite">
              <img src={u} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute bottom-0 left-0 bg-white px-1.5 text-[9px] font-bold uppercase text-black">Principal</span>}
              <div className="absolute right-1 top-1 flex gap-1">
                {i > 0 && <button type="button" aria-label="Tornar principal" className="bg-black/80 p-1" onClick={() => setImages(a => [a[i], ...a.filter((_, j) => j !== i)])}><ArrowUp size={12} /></button>}
                <button type="button" aria-label="Remover foto" className="bg-black/80 p-1" onClick={() => setImages(a => a.filter((_, j) => j !== i))}><X size={12} /></button>
              </div>
            </div>
          ))}
          <label className="flex h-28 w-24 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-white/25 text-xs text-mute hover:border-white hover:text-white">
            <Upload size={18} />{uploading ? 'Enviando…' : 'Adicionar'}
            <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={e => { onFiles(e.target.files); e.target.value = '' }} />
          </label>
        </div>
      </section>

      <section className="card space-y-5 p-5">
        <h2 className="label">Variações e estoque</h2>
        <div>
          <p className="mb-2 text-xs text-mute">Tamanhos</p>
          <div className="flex flex-wrap gap-2">{settings.sizes.map(s => (
            <button type="button" key={s} onClick={() => toggle(pickSizes, s, setPickSizes)} className={`min-w-11 border px-3 py-2 text-xs font-semibold ${pickSizes.includes(s) ? 'border-white bg-white text-black' : 'border-white/15'}`}>{s}</button>
          ))}</div>
        </div>
        <div>
          <p className="mb-2 text-xs text-mute">Cores {settings.colors.length === 0 && <span className="text-red-400">— cadastre cores em Configurações</span>}</p>
          <div className="flex flex-wrap gap-2">{settings.colors.map(c => (
            <button type="button" key={c.name} onClick={() => toggle(pickColors, c.name, setPickColors)} className={`flex items-center gap-2 border px-3 py-2 text-xs font-semibold ${pickColors.includes(c.name) ? 'border-white bg-white text-black' : 'border-white/15'}`}>
              <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: c.hex }} />{c.name}
            </button>
          ))}</div>
        </div>
        <button type="button" className="btn-outline !py-2.5" disabled={!pickSizes.length || !pickColors.length} onClick={generate}>Gerar combinações</button>

        {variants.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-widest text-mute"><tr><th className="py-2">Tamanho</th><th>Cor</th><th>Estoque</th><th /></tr></thead>
            <tbody className="divide-y divide-white/5">
              {variants.map((v, i) => (
                <tr key={`${v.size}-${v.color}`}>
                  <td className="py-2">{v.size}</td>
                  <td><span className="mr-2 inline-block h-3 w-3 rounded-full border border-white/30 align-middle" style={{ background: v.color_hex ?? 'transparent' }} />{v.color}</td>
                  <td><input type="number" min={0} className="input !w-24 !py-1.5" value={v.stock} onChange={e => setVariants(a => a.map((x, j) => (j === i ? { ...x, stock: Math.max(0, parseInt(e.target.value || '0', 10)) } : x)))} /></td>
                  <td className="text-right"><button type="button" aria-label="Remover variação" className="p-2" onClick={() => setVariants(a => a.filter((_, j) => j !== i))}><Trash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
      <div className="flex gap-3">
        <button className="btn-light" disabled={saving || uploading}>{saving ? 'Salvando…' : 'Salvar produto'}</button>
        <Link to="/admin/produtos" className="btn-outline">Cancelar</Link>
      </div>
    </form>
  )
}
