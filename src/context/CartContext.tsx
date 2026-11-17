import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface CartVariant { size: string; color: string; stock: number }
export interface CartItem {
  key: string
  productId: string
  slug: string
  name: string
  image?: string
  price: number        // preço efetivo (promocional, se houver)
  fullPrice: number    // preço cheio
  size: string
  color: string
  qty: number
  variants: CartVariant[] // snapshot para trocar tamanho/cor no carrinho
}

interface CartCtx {
  items: CartItem[]
  count: number
  open: boolean
  setOpen: (v: boolean) => void
  add: (i: Omit<CartItem, 'key'>) => void
  remove: (key: string) => void
  setQty: (key: string, qty: number) => void
  changeVariant: (key: string, size: string, color: string) => void
  clear: () => void
  subtotal: number   // a preço cheio
  discount: number   // economia por promoções
  total: number      // subtotal - desconto (sem frete)
}

const Ctx = createContext<CartCtx | null>(null)
const STORAGE_KEY = 'jpstore.cart.v1'
const keyOf = (productId: string, size: string, color: string) => `${productId}|${size}|${color}`
const stockFor = (vs: CartVariant[], size: string, color: string) => vs.find(v => v.size === size && v.color === color)?.stock ?? 0

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* ignore */ }
  }, [items])

  const add = useCallback((i: Omit<CartItem, 'key'>) => {
    const key = keyOf(i.productId, i.size, i.color)
    setItems(prev => {
      const max = stockFor(i.variants, i.size, i.color)
      const found = prev.find(p => p.key === key)
      if (found) return prev.map(p => (p.key === key ? { ...p, qty: Math.min(max, p.qty + i.qty), price: i.price, fullPrice: i.fullPrice, variants: i.variants } : p))
      return [...prev, { ...i, key, qty: Math.min(max, i.qty) }]
    })
    setOpen(true)
  }, [])

  const remove = useCallback((key: string) => setItems(p => p.filter(i => i.key !== key)), [])

  const setQty = useCallback((key: string, qty: number) => {
    setItems(prev => prev.map(i => {
      if (i.key !== key) return i
      const max = stockFor(i.variants, i.size, i.color)
      return { ...i, qty: Math.max(1, Math.min(max || 1, qty)) }
    }))
  }, [])

  const changeVariant = useCallback((key: string, size: string, color: string) => {
    setItems(prev => {
      const cur = prev.find(i => i.key === key)
      if (!cur) return prev
      const newKey = keyOf(cur.productId, size, color)
      const max = stockFor(cur.variants, size, color)
      if (max < 1) return prev
      const other = prev.find(i => i.key === newKey && i.key !== key)
      if (other) {
        return prev.filter(i => i.key !== key).map(i => (i.key === newKey ? { ...i, qty: Math.min(max, i.qty + cur.qty) } : i))
      }
      return prev.map(i => (i.key === key ? { ...i, key: newKey, size, color, qty: Math.min(max, i.qty) } : i))
    })
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartCtx>(() => {
    const subtotal = items.reduce((a, i) => a + i.fullPrice * i.qty, 0)
    const total = items.reduce((a, i) => a + i.price * i.qty, 0)
    return {
      items, open, setOpen, add, remove, setQty, changeVariant, clear,
      count: items.reduce((a, i) => a + i.qty, 0),
      subtotal, total, discount: subtotal - total,
    }
  }, [items, open, add, remove, setQty, changeVariant, clear])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart fora do CartProvider')
  return c
}
