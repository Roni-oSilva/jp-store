import { Link } from 'react-router-dom'
import { Instagram, MessageCircle } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { onlyDigits } from '../lib/format'

export default function Footer() {
  const { settings, categories } = useStore()
  const wa = onlyDigits(settings.whatsapp_number)
  return (
    <footer className="mt-24 border-t border-white/10 bg-black">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-12 w-12 rounded-sm object-cover" />
            <span className="font-display text-xl">JP STORE</span>
          </div>
          <p className="mt-4 text-sm text-mute">{settings.tagline}</p>
          <div className="mt-5 flex gap-3">
            {settings.instagram && (
              <a href={`https://instagram.com/${settings.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" aria-label="Instagram" className="border border-white/15 p-2.5 transition-colors hover:bg-white hover:text-black"><Instagram size={18} /></a>
            )}
            {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="border border-white/15 p-2.5 transition-colors hover:bg-white hover:text-black"><MessageCircle size={18} /></a>}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest">Loja</h4>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li><Link className="hover:text-white" to="/loja">Todos os produtos</Link></li>
            <li><Link className="hover:text-white" to="/novidades">Novidades</Link></li>
            <li><Link className="hover:text-white" to="/promocoes">Promoções</Link></li>
            <li><Link className="hover:text-white" to="/sacola">Sacola</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest">Categorias</h4>
          <ul className="space-y-2.5 text-sm text-white/60">
            {categories.slice(0, 7).map(c => <li key={c.id}><Link className="hover:text-white" to={`/categoria/${c.slug}`}>{c.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest">Atendimento</h4>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li><Link className="hover:text-white" to="/contato">Fale conosco</Link></li>
            {settings.email && <li>{settings.email}</li>}
            {settings.address && <li>{settings.address}</li>}
            <li>Pedidos finalizados pelo WhatsApp</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[11px] uppercase tracking-widest text-mute">
        © {new Date().getFullYear()} JP STORE — Moda Masculina. Todos os direitos reservados.
      </div>
    </footer>
  )
}
