import { garment, spin, type Kind } from './images'

export type Row = Record<string, any>
export type Db = Record<string, Row[]>

const KEY = 'jp.demo.db.v1'

const COLORS = [
  { name: 'Preto', hex: '#161618' }, { name: 'Branco', hex: '#f4f4f4' }, { name: 'Cinza', hex: '#6b6b70' },
  { name: 'Verde militar', hex: '#4b5a3a' }, { name: 'Azul jeans', hex: '#3b5b82' },
]
const col = (n: string) => COLORS.find(c => c.name === n)!

interface P {
  id: string; name: string; slug: string; desc: string; price: number; promo?: number; cat: string
  featured?: boolean; sale?: boolean; kind: Kind; main: string; colors: string[]; sizes: string[]; stock: (s: string, c: string) => number; frames?: boolean; ago: number
}

const SIZES = ['P', 'M', 'G', 'GG', 'XG']
const stockAll = (s: string, c: string) => ((s.charCodeAt(0) + c.length * 3) % 7) + 2

const PRODUCTS: P[] = [
  { id: 'p1', name: 'Camiseta Básica Preta', slug: 'camiseta-basica-preta', cat: 'camisetas', kind: 'tee', main: 'Preto', colors: ['Preto', 'Branco', 'Cinza'], sizes: SIZES, price: 89.9, stock: stockAll, ago: 1, desc: 'PRODUTO DE EXEMPLO (DEMO).\nCamiseta de algodão com caimento reto e toque macio. Peça básica para qualquer look.' },
  { id: 'p2', name: 'Camiseta Oversized Streetwear', slug: 'camiseta-oversized-streetwear', cat: 'oversized', kind: 'oversized', main: 'Cinza', colors: ['Cinza', 'Preto', 'Verde militar'], sizes: SIZES, price: 119.9, promo: 99.9, sale: true, featured: true, stock: stockAll, ago: 2, desc: 'PRODUTO DE EXEMPLO (DEMO).\nModelagem oversized, ombro caído e tecido encorpado. Estilo urbano com conforto.' },
  { id: 'p3', name: 'Moletom Canguru Oversized', slug: 'moletom-canguru-oversized', cat: 'moletons', kind: 'hoodie', main: 'Cinza', colors: ['Cinza', 'Preto'], sizes: SIZES, price: 219.9, featured: true, stock: stockAll, frames: true, ago: 3, desc: 'PRODUTO DE EXEMPLO (DEMO).\nMoletom com capuz e bolso canguru. Este produto tem fotos em sequência: toque em "Ver ao redor" e arraste para girar a peça.' },
  { id: 'p4', name: 'Calça Cargo Verde Militar', slug: 'calca-cargo-verde-militar', cat: 'calcas', kind: 'pants', main: 'Verde militar', colors: ['Verde militar', 'Preto'], sizes: ['38', '40', '42', '44', '46'], price: 189.9, featured: true, stock: stockAll, ago: 4, desc: 'PRODUTO DE EXEMPLO (DEMO).\nCalça cargo com bolsos laterais e modelagem confortável.' },
  { id: 'p5', name: 'Calça Jeans Reta', slug: 'calca-jeans-reta', cat: 'calcas', kind: 'pants', main: 'Azul jeans', colors: ['Azul jeans', 'Preto'], sizes: ['38', '40', '42', '44', '46'], price: 169.9, promo: 139.9, sale: true, stock: stockAll, ago: 5, desc: 'PRODUTO DE EXEMPLO (DEMO).\nJeans de corte reto e lavagem escura.' },
  { id: 'p6', name: 'Bermuda Cargo Cinza', slug: 'bermuda-cargo-cinza', cat: 'bermudas', kind: 'shorts', main: 'Cinza', colors: ['Cinza', 'Preto'], sizes: ['38', '40', '42', '44'], price: 129.9, stock: stockAll, ago: 6, desc: 'PRODUTO DE EXEMPLO (DEMO).\nBermuda leve para o dia a dia.' },
  { id: 'p7', name: 'Jaqueta Corta-Vento', slug: 'jaqueta-corta-vento', cat: 'jaquetas', kind: 'jacket', main: 'Preto', colors: ['Preto', 'Verde militar'], sizes: SIZES, price: 249.9, featured: true, stock: stockAll, ago: 7, desc: 'PRODUTO DE EXEMPLO (DEMO).\nJaqueta leve com zíper frontal, ideal para dias de vento.' },
  { id: 'p8', name: 'Boné Aba Curva', slug: 'bone-aba-curva', cat: 'bones', kind: 'cap', main: 'Preto', colors: ['Preto', 'Branco'], sizes: ['Único'], price: 79.9, stock: () => 12, ago: 8, desc: 'PRODUTO DE EXEMPLO (DEMO).\nBoné de aba curva com regulagem traseira.' },
  { id: 'p9', name: 'Camiseta Oversized Branca', slug: 'camiseta-oversized-branca', cat: 'oversized', kind: 'oversized', main: 'Branco', colors: ['Branco'], sizes: SIZES, price: 109.9, stock: () => 0, ago: 9, desc: 'PRODUTO DE EXEMPLO (DEMO) — esgotado de propósito, para mostrar como a loja trata produto sem estoque.' },
]

const CATS = [['Camisetas', 'camisetas'], ['Oversized', 'oversized'], ['Calças', 'calcas'], ['Bermudas', 'bermudas'], ['Moletons', 'moletons'], ['Jaquetas', 'jaquetas'], ['Bonés', 'bones'], ['Acessórios', 'acessorios']]

export function seed(): Db {
  const now = Date.now()
  const categories: Row[] = CATS.map(([name, slug], i) => ({ id: `c-${slug}`, name, slug, parent_id: null, sort_order: i + 1, created_at: new Date(now).toISOString() }))
  const products: Row[] = [], images: Row[] = [], variants: Row[] = []
  for (const p of PRODUCTS) {
    products.push({
      id: p.id, name: p.name, slug: p.slug, description: p.desc, price: p.price, promo_price: p.promo ?? null,
      category_id: `c-${p.cat}`, is_featured: !!p.featured, is_on_sale: !!p.sale, is_active: true,
      created_at: new Date(now - p.ago * 86400000).toISOString(), updated_at: new Date(now).toISOString(),
    })
    const hex = col(p.main).hex
    const urls = p.frames ? spin(p.kind, hex, 8) : [garment(p.kind, hex), garment(p.kind, hex, { back: true })]
    urls.forEach((url, i) => images.push({ id: `${p.id}-i${i}`, product_id: p.id, url, sort_order: i }))
    for (const s of p.sizes) for (const c of p.colors) {
      variants.push({ id: `${p.id}-${s}-${c}`, product_id: p.id, size: s, color: c, color_hex: col(c).hex, stock: p.stock(s, c) })
    }
  }
  return {
    categories, products, product_images: images, product_variants: variants,
    banners: [{ id: 'b1', title: 'Vista sua identidade.', subtitle: 'Moda urbana para quem não segue padrões.', button_text: 'EXPLORAR COLEÇÃO', link: '/loja', image_url: null, sort_order: 1, is_active: true }],
    store_settings: [{
      id: 1, store_name: 'JP STORE', tagline: 'SEU ESTILO. SUA IDENTIDADE.', whatsapp_number: '', instagram: 'jpstoremodamasculina',
      email: '', address: '', free_shipping_from: 300, shipping_fee: 12,
      sizes: ['P', 'M', 'G', 'GG', 'XG'], colors: COLORS, updated_at: new Date(now).toISOString(),
    }],
    orders: [],
    profiles: [{ id: 'demo-admin', email: 'demo@jpstore.com', role: 'admin', created_at: new Date(now).toISOString() }],
  }
}

export function readDb(): Db {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Db
  } catch { /* recria abaixo */ }
  const s = seed()
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* sem espaço */ }
  return s
}

export function writeDb(db: Db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)) }
  catch { throw new Error('Limite de armazenamento do demo atingido. Use "Restaurar exemplos" no botão DEMO.') }
}

export function resetDb() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  readDb()
}
