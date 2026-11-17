import { MessageCircle } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { onlyDigits } from '../lib/format'

export default function WhatsAppFab() {
  const { settings } = useStore()
  const n = onlyDigits(settings.whatsapp_number)
  if (!n) return null // sem número configurado no painel, o botão não aparece
  return (
    <a
      href={`https://wa.me/${n}?text=${encodeURIComponent('Olá! Vim pelo site da JP STORE.')}`}
      target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp"
      className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-110 md:bottom-6 md:right-6"
    >
      <MessageCircle size={26} />
    </a>
  )
}
