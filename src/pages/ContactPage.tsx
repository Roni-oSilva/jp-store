import { Instagram, Mail, MapPin, MessageCircle } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { onlyDigits } from '../lib/format'
import { useSEO } from '../lib/hooks'

export default function ContactPage() {
  useSEO('Contato', 'Fale com a JP STORE pelo WhatsApp ou Instagram.')
  const { settings } = useStore()
  const wa = onlyDigits(settings.whatsapp_number)
  const ig = settings.instagram.replace('@', '')
  const rows = [
    wa && { icon: MessageCircle, label: 'WhatsApp', text: 'Atendimento online', href: `https://wa.me/${wa}` },
    ig && { icon: Instagram, label: 'Instagram', text: `@${ig}`, href: `https://instagram.com/${ig}` },
    settings.email && { icon: Mail, label: 'E-mail', text: settings.email, href: `mailto:${settings.email}` },
    settings.address && { icon: MapPin, label: 'Endereço', text: settings.address, href: '' },
  ].filter(Boolean) as { icon: typeof Mail; label: string; text: string; href: string }[]

  return (
    <div className="container-x max-w-3xl py-12 md:py-20">
      <h1 className="h-display text-4xl md:text-6xl">Contato</h1>
      <p className="mt-4 text-white/70">{settings.tagline} Fale com a gente — atendimento online.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {rows.map(r => {
          const I = r.icon
          const inner = (<><I size={22} /><p className="mt-4 text-xs uppercase tracking-widest text-mute">{r.label}</p><p className="mt-1 font-semibold">{r.text}</p></>)
          return r.href
            ? <a key={r.label} href={r.href} target="_blank" rel="noreferrer" className="card p-6 transition-colors hover:border-white/40">{inner}</a>
            : <div key={r.label} className="card p-6">{inner}</div>
        })}
      </div>
      {rows.length === 0 && <p className="mt-10 text-sm text-mute">Os canais de contato ainda não foram configurados.</p>}
    </div>
  )
}
