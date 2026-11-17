import { Link } from 'react-router-dom'
import { useSEO } from '../lib/hooks'

export default function NotFound() {
  useSEO('Página não encontrada')
  return (
    <div className="container-x py-28 text-center">
      <p className="title text-8xl">404</p>
      <p className="mt-4 text-sub">Página não encontrada.</p>
      <Link to="/" className="pill-dark mt-8">Voltar ao início</Link>
    </div>
  )
}
