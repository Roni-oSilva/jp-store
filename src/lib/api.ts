import { supabase } from './supabase'
import type { Banner, Category, Order, Product, StoreSettings } from './types'
import { DEFAULT_SETTINGS } from './types'

const db = () => {
  if (!supabase) throw new Error('Supabase não configurado. Preencha o arquivo .env.')
  return supabase
}
const PRODUCT_SELECT = '*, categories(*), product_images(*), product_variants(*)'

export async function fetchProducts(opts: { includeInactive?: boolean } = {}): Promise<Product[]> {
  let q = db().from('products').select(PRODUCT_SELECT).order('created_at', { ascending: false })
  if (!opts.includeInactive) q = q.eq('is_active', true)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Product[]
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await db().from('products').select(PRODUCT_SELECT).eq('slug', slug).eq('is_active', true).maybeSingle()
  if (error) throw error
  return (data as Product) ?? null
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await db().from('categories').select('*').order('sort_order').order('name')
  if (error) throw error
  return (data ?? []) as Category[]
}

export async function fetchBanners(all = false): Promise<Banner[]> {
  let q = db().from('banners').select('*').order('sort_order')
  if (!all) q = q.eq('is_active', true)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Banner[]
}

export async function fetchSettings(): Promise<StoreSettings> {
  const { data, error } = await db().from('store_settings').select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) } as StoreSettings
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await db().from('orders').select('*').order('created_at', { ascending: false }).limit(200)
  if (error) throw error
  return (data ?? []) as Order[]
}

export async function countOrders(): Promise<number> {
  const { count, error } = await db().from('orders').select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

export async function registerOrder(o: Omit<Order, 'id' | 'created_at' | 'status'>) {
  // Registro best-effort: o pedido só vale quando o cliente enviar a mensagem no WhatsApp.
  if (!supabase) return
  await supabase.from('orders').insert({ ...o, status: 'enviado_whatsapp' })
}

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await db().storage.from('product-images').upload(path, file, { cacheControl: '31536000', upsert: false })
  if (error) throw error
  return db().storage.from('product-images').getPublicUrl(path).data.publicUrl
}
