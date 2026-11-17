import { useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { slugify } from '../lib/format'
import { useStore } from '../context/StoreContext'

export default function CategoriesAdmin() {
  const { categories, reload } = useStore()
  const [name, setName] = useState('')
  const [parent, setParent] = useState('')
  const [err, setErr] = useState('')

  const add = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    const slug = slugify(name)
    if (!slug) return setErr('Informe um nome.')
    const { error } = await supabase!.from('categories').insert({ name: name.trim(), slug, parent_id: parent || null, sort_order: categories.length + 1 })
    if (error) return setErr(error.message.includes('duplicate') ? 'Categoria já existe.' : error.message)
    setName(''); setParent(''); reload()
  }
  const rename = async (id: string, value: string) => {
    if (!value.trim()) return
    const { error } = await supabase!.from('categories').update({ name: value.trim(), slug: slugify(value) }).eq('id', id)
    if (error) alert(error.message); else reload()
  }
  const del = async (id: string, n: string) => {
    if (!confirm(`Excluir a categoria "${n}"? Os produtos ficarão sem categoria.`)) return
    const { error } = await supabase!.from('categories').delete().eq('id', id)
    if (error) alert(error.message); else reload()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="h-display text-3xl md:text-4xl">Categorias</h1>
      <form onSubmit={add} className="card mt-6 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-48 flex-1"><label className="label">Nova categoria</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Calças cargo" /></div>
        <div><label className="label">Dentro de</label>
          <select className="input" value={parent} onChange={e => setParent(e.target.value)}><option value="">— Principal —</option>{categories.filter(c => !c.parent_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <button className="btn-light">Adicionar</button>
      </form>
      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
      <ul className="mt-6 divide-y divide-white/5 border-y border-white/10">
        {categories.map(c => (
          <li key={c.id} className="flex items-center gap-3 py-3">
            {c.parent_id && <span className="text-mute">↳</span>}
            <input className="input !border-transparent !bg-transparent" defaultValue={c.name} onBlur={e => e.target.value !== c.name && rename(c.id, e.target.value)} aria-label={`Nome da categoria ${c.name}`} />
            <span className="hidden text-xs text-mute sm:block">/{c.slug}</span>
            <button aria-label="Excluir" className="p-2 hover:bg-white/10" onClick={() => del(c.id, c.name)}><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
    </div>
  )
}
