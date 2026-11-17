import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { fetchProducts } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAsync } from '../lib/hooks'
import { brl, effectivePrice, hasPromo, mainImage, totalStock } from '../lib/format'

export default function ProductsAdmin() {
  const { data, loading, error, reload } = useAsync(() => fetchProducts({ includeInactive: true }), [])

  const del = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}" permanentemente? Esta ação não pode ser desfeita.`)) return
    const { error } = await supabase!.from('products').delete().eq('id', id)
    if (error) alert(error.message); else reload()
  }
  const toggle = async (id: string, field: 'is_featured' | 'is_active', value: boolean) => {
    const { error } = await supabase!.from('products').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) alert(error.message); else reload()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="h-display text-3xl md:text-4xl">Produtos</h1>
        <Link to="/admin/produtos/novo" className="btn-light">Novo produto</Link>
      </div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {loading && <p className="mt-6 text-mute">Carregando…</p>}
      {!loading && data?.length === 0 && <p className="mt-10 text-center text-mute">Nenhum produto cadastrado ainda.</p>}
      <div className="mt-6 overflow-x-auto">
        {data && data.length > 0 && (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-widest text-mute">
              <tr><th className="p-3">Produto</th><th className="p-3">Categoria</th><th className="p-3">Preço</th><th className="p-3">Estoque</th><th className="p-3">Destaque</th><th className="p-3">Ativo</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map(p => (
                <tr key={p.id} className="hover:bg-white/[.03]">
                  <td className="p-3"><div className="flex items-center gap-3"><div className="h-14 w-11 shrink-0 bg-graphite">{mainImage(p) && <img src={mainImage(p)} alt="" className="h-full w-full object-cover" />}</div><span className="font-semibold">{p.name}</span></div></td>
                  <td className="p-3 text-white/70">{p.categories?.name ?? '—'}</td>
                  <td className="p-3">{hasPromo(p) && <span className="mr-1 text-mute line-through">{brl(p.price)}</span>}{brl(effectivePrice(p))}</td>
                  <td className={`p-3 ${totalStock(p) === 0 ? 'text-red-400' : ''}`}>{totalStock(p)}</td>
                  <td className="p-3"><input type="checkbox" aria-label="Destaque" checked={p.is_featured} onChange={e => toggle(p.id, 'is_featured', e.target.checked)} /></td>
                  <td className="p-3"><input type="checkbox" aria-label="Ativo" checked={p.is_active} onChange={e => toggle(p.id, 'is_active', e.target.checked)} /></td>
                  <td className="p-3 text-right"><div className="flex justify-end gap-1">
                    <Link to={`/admin/produtos/${p.id}`} aria-label="Editar" className="p-2 hover:bg-white/10"><Pencil size={16} /></Link>
                    <button aria-label="Excluir" className="p-2 hover:bg-white/10" onClick={() => del(p.id, p.name)}><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
