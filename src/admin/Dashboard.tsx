import { Link } from 'react-router-dom'
import { countOrders, fetchProducts } from '../lib/api'
import { useAsync } from '../lib/hooks'
import { hasPromo, inStock } from '../lib/format'

export default function Dashboard() {
  const prods = useAsync(() => fetchProducts({ includeInactive: true }), [])
  const orders = useAsync(() => countOrders(), [])
  const list = prods.data ?? []
  const stats = [
    ['Total de produtos', list.length],
    ['Disponíveis', list.filter(p => p.is_active && inStock(p)).length],
    ['Sem estoque', list.filter(p => !inStock(p)).length],
    ['Em promoção', list.filter(hasPromo).length],
    ['Pedidos registrados', orders.data ?? '—'],
  ] as const

  return (
    <div>
      <h1 className="h-display text-3xl md:text-4xl">Dashboard</h1>
      {prods.error && <p className="mt-4 text-sm text-red-400">{prods.error}</p>}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map(([l, v]) => (
          <div key={l} className="card p-5"><p className="text-[11px] uppercase tracking-widest text-mute">{l}</p><p className="mt-2 font-display text-4xl">{prods.loading ? '…' : v}</p></div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/produtos/novo" className="btn-light">Cadastrar produto</Link>
        <Link to="/admin/configuracoes" className="btn-outline">Configurar WhatsApp</Link>
      </div>
      <p className="mt-6 max-w-xl text-xs text-mute">Pedidos registrados são criados quando o cliente abre o WhatsApp para enviar o pedido. A confirmação e o pagamento acontecem na conversa com o cliente.</p>
    </div>
  )
}
