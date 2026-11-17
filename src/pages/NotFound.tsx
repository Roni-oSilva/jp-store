import { Link } from 'react-router-dom'
import { useSEO } from '../lib/hooks'

export default function NotFound() {
  useSEO('Página não encontrada')
  return (
    <div className="container-x py-28 text-center">
      <p className="h-display text-7xl">404</p>
      <p className="mt-4 text-mute">Página não encontrada.</p>
      <Link to="/" className="btn-light mt-8">Voltar ao início</Link>
    </div>
  )
}
