import type { Product } from './types'

export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const effectivePrice = (p: Pick<Product, 'price' | 'promo_price' | 'is_on_sale'>) =>
  p.is_on_sale && p.promo_price != null && p.promo_price < p.price ? p.promo_price : p.price

export const hasPromo = (p: Pick<Product, 'price' | 'promo_price' | 'is_on_sale'>) => effectivePrice(p) < p.price

export const totalStock = (p: Product) => p.product_variants.reduce((a, v) => a + v.stock, 0)
export const inStock = (p: Product) => totalStock(p) > 0

export const sortedImages = (p: Product) => [...p.product_images].sort((a, b) => a.sort_order - b.sort_order)
export const mainImage = (p: Product) => sortedImages(p)[0]?.url

export const onlyDigits = (s: string) => s.replace(/\D/g, '')
