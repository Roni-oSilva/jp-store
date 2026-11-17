import { fetchOrders } from '../lib/api'
import { useAsync } from '../lib/hooks'
import { brl } from '../lib/format'

export default function OrdersAdmin() {
  const { data, loading, error } = useAsync(fetchOrders, [])
  return (
    <div className="max-w-4xl">
      <h1 className="h-display text-3xl md:text-4xl">Pedidos</h1>
      <p className="mt-2 text-sm text-mute">Registros criados quando o cliente abre o WhatsApp para enviar o pedido. A confirmação acontece na conversa.</p>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {loading && <p className="mt-6 text-mute">Carregando…</p>}
      {!loading && data?.length === 0 && <p className="mt-10 text-center text-mute">Nenhum pedido registrado.</p>}
      <div className="mt-6 space-y-3">
        {data?.map(o => (
          <details key={o.id} className="card p-4">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-semibold">{o.customer_name}</span>
              <span className="text-mute">{new Date(o.created_at).toLocaleString('pt-BR')}</span>
              <span className="font-bold">{brl(o.total)}</span>
            </summary>
            <div className="mt-4 space-y-1 text-sm text-white/70">
              <p>Tel.: {o.phone} · {o.delivery_method === 'entrega' ? 'Entrega' : 'Retirada'}</p>
              <p>{o.city}{o.neighborhood && ` — ${o.neighborhood}`}{o.address && `, ${o.address}`}</p>
              {o.notes && <p>Obs.: {o.notes}</p>}
              <ul className="mt-2 list-disc pl-5">
                {(o.items as { product: string; size: string; color: string; qty: number; unit_price: number }[]).map((i, k) => (
                  <li key={k}>{i.qty}× {i.product} ({i.size}/{i.color}) — {brl(i.unit_price)}</li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
