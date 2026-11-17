export interface Category { id: string; name: string; slug: string; parent_id: string | null; sort_order: number }
export interface ProductImage { id: string; product_id: string; url: string; sort_order: number }
export interface Variant { id: string; product_id: string; size: string; color: string; color_hex: string | null; stock: number }
export interface Product {
  id: string; name: string; slug: string; description: string
  price: number; promo_price: number | null
  category_id: string | null
  is_featured: boolean; is_on_sale: boolean; is_active: boolean
  created_at: string
  categories?: Category | null
  product_images: ProductImage[]
  product_variants: Variant[]
}
export interface Banner { id: string; title: string; subtitle: string; button_text: string; link: string; image_url: string | null; sort_order: number; is_active: boolean }
export interface ColorOpt { name: string; hex: string }
export interface StoreSettings {
  store_name: string; tagline: string; whatsapp_number: string; instagram: string
  email: string; address: string; free_shipping_from: number | null; shipping_fee: number
  sizes: string[]; colors: ColorOpt[]
}
export interface Order {
  id: string; customer_name: string; phone: string; city: string; neighborhood: string; address: string
  delivery_method: 'entrega' | 'retirada'; notes: string; items: unknown[]
  subtotal: number; shipping: number; discount: number; total: number; status: string; created_at: string
}
export const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'JP STORE', tagline: 'SEU ESTILO. SUA IDENTIDADE.', whatsapp_number: '', instagram: 'jpstoremodamasculina',
  email: '', address: '', free_shipping_from: null, shipping_fee: 0,
  sizes: ['P', 'M', 'G', 'GG', 'XG'], colors: [],
}
