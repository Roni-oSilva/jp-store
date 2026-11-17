import type { CartItem } from '../context/CartContext'
import { brl } from './format'

export interface Checkout {
  name: string; phone: string; city: string; neighborhood: string; address: string
  method: 'entrega' | 'retirada'; notes: string
}
export interface Totals { subtotal: number; discount: number; shipping: number; total: number }

export function buildMessage(c: Checkout, items: CartItem[], t: Totals): string {
  const L: string[] = []
  L.push('*JP STORE — NOVO PEDIDO*', '', `*Cliente:* ${c.name}`, `*Telefone:* ${c.phone}`, '', '*PRODUTOS:*')
  items.forEach((i, idx) => {
    L.push(
      `${idx + 1}. ${i.name}`,
      `   Tamanho: ${i.size} | Cor: ${i.color} | Qtd: ${i.qty}`,
      `   Preço unitário: ${brl(i.price)} | Subtotal: ${brl(i.price * i.qty)}`,
    )
  })
  L.push('', '*RESUMO:*', `Subtotal: ${brl(t.subtotal)}`)
  if (t.discount > 0) L.push(`Desconto (promoções): -${brl(t.discount)}`)
  if (c.method === 'entrega' && t.shipping > 0) L.push(`Frete: ${brl(t.shipping)}`)
  L.push(`*TOTAL: ${brl(t.total)}*`, '', '*ENTREGA:*')
  L.push(`Forma de recebimento: ${c.method === 'entrega' ? 'Entrega' : 'Retirada'}`, `Cidade: ${c.city}`)
  if (c.method === 'entrega') L.push(`Bairro: ${c.neighborhood}`, `Endereço: ${c.address}`)
  if (c.notes.trim()) L.push('', `*Observações:* ${c.notes.trim()}`)
  L.push('', 'Aguardo a confirmação do pedido pela loja.')
  return L.join('\n')
}

export const waLink = (number: string, text: string) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`
