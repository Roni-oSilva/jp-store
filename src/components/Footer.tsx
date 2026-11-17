import { Link } from 'react-router-dom'
import { Instagram, MessageCircle } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { onlyDigits } from '../lib/format'

export default function Footer() {
  const { settings, categories } = useStore()
  const wa = onlyDigits(settings.whatsapp_number)
  return (
    <footer className="container-x mt-16 pb-28 md:pb-8">
      <div className="rounded-4xl bg-charcoal p-8 text-white md:p-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="" className="h-12 w-auto" />
              <span className="text-xl font-extrabold tracking-tight">JP STORE</span>
            </div>
            <p className="mt-4 text-sm text-white/60">{settings.tagline}</p>
            <div className="mt-5 flex gap-2">
              {settings.instagram && (
                <a href={`https://instagram.com/${settings.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white hover:text-txt"><Instagram size={18} /></a>
              )}
              {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white hover:text-txt"><MessageCircle size={18} /></a>}
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold">Loja</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link className="hover:text-white" to="/loja">Todos os produtos</Link></li>
              <li><Link className="hover:text-white" to="/novidades">Novidades</Link></li>
              <li><Link className="hover:text-white" to="/promocoes">Promoções</Link></li>
              <li><Link className="hover:text-white" to="/sacola">Sacola</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold">Categorias</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {categories.slice(0, 7).map(c => <li key={c.id}><Link className="hover:text-white" to={`/categoria/${c.slug}`}>{c.name}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold">Atendimento</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link className="hover:text-white" to="/contato">Fale conosco</Link></li>
              <li><Link className="hover:text-white" to="/privacidade">Política de Privacidade</Link></li>
              {settings.email && <li>{settings.email}</li>}
              {settings.address && <li>{settings.address}</li>}
              <li>Pedidos finalizados pelo WhatsApp</li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">© {new Date().getFullYear()} JP STORE — Moda Masculina. Todos os direitos reservados. · <Link to="/privacidade" className="underline hover:text-white">Privacidade</Link></p>
      </div>
    </footer>
  )
}
