import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Columns2, Crown, Instagram, LayoutGrid, MessageCircle, Shirt, Snowflake, Tag, Truck, Watch, Wind, type LucideIcon } from 'lucide-react'
import { fetchBanners, fetchProducts } from '../lib/api'
import { useAsync, useSEO } from '../lib/hooks'
import { hasPromo, inStock } from '../lib/format'
import { useStore } from '../context/StoreContext'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import type { Product } from '../lib/types'
import { ProductGridSkeleton, SetupNotice, needsSetup } from '../components/ui'

const ICONS: Record<string, LucideIcon> = {
  camisetas: Shirt, oversized: Shirt, calcas: Columns2, bermudas: Columns2,
  moletons: Snowflake, jaquetas: Wind, bones: Crown, acessorios: Watch,
}

function Section({ title, link, children }: { title: string; link?: string; children: ReactNode }) {
  return (
    <section className="container-x mt-12 md:mt-16">
      <Reveal className="mb-5 flex items-center justify-between">
        <h2 className="title text-2xl md:text-3xl">{title}</h2>
        {link && <Link to={link} className="chip group !py-2 text-xs">Ver tudo <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link>}
      </Reveal>
      {children}
    </section>
  )
}

const Grid = ({ items }: { items: Product[] }) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
    {items.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 90}><ProductCard p={p} /></Reveal>)}
  </div>
)

export default function Home() {
  useSEO('JP STORE — Moda Masculina Streetwear', 'Peças exclusivas com qualidade, estilo e personalidade. Camisetas, oversized, calças, bermudas e moletons. Seu estilo. Sua identidade.')
  const { categories, settings } = useStore()
  const products = useAsync(() => (needsSetup ? Promise.resolve([]) : fetchProducts()), [])
  const banners = useAsync(() => (needsSetup ? Promise.resolve([]) : fetchBanners()), [])

  const list = (products.data ?? []).filter(inStock)
  const latest = list.slice(0, 4)
  const featured = list.filter(p => p.is_featured).slice(0, 4)
  const offers = list.filter(hasPromo).slice(0, 4)
  const street = list.filter(p => ['oversized', 'camisetas'].includes(p.categories?.slug ?? '')).slice(0, 4)
  const banner = banners.data?.[0]

  return (
    <>
      {/* HERO — cartão escuro */}
      <section className="container-x pt-2 md:pt-4">
        <div className="relative isolate flex min-h-[420px] items-end overflow-hidden rounded-4xl bg-charcoal text-white md:min-h-[500px] md:items-center">
          {banner?.image_url
            ? <img src={banner.image_url} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
            : <img src="/logo.png" alt="" aria-hidden className="absolute -bottom-10 -right-10 -z-10 h-[90%] max-w-none opacity-20 floaty md:right-16" />}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal via-charcoal/55 to-charcoal/10 md:bg-gradient-to-r md:from-charcoal md:via-charcoal/70 md:to-transparent" />
          <div className="p-7 md:max-w-2xl md:p-14">
            <span className="fade-up inline-block rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold tracking-wider backdrop-blur">{settings.tagline}</span>
            <h1 className="title fade-up mt-5 text-4xl leading-[1.05] sm:text-5xl md:text-7xl" style={{ animationDelay: '.1s' }}>{banner?.title || 'Vista sua identidade.'}</h1>
            <p className="fade-up mt-4 max-w-md text-base text-white/70" style={{ animationDelay: '.2s' }}>{banner?.subtitle || 'Moda urbana para quem não segue padrões.'}</p>
            <div className="fade-up mt-7 flex flex-wrap gap-3" style={{ animationDelay: '.3s' }}>
              <Link to={banner?.link || '/loja'} className="pill shine bg-white text-txt hover:bg-soft">{banner?.button_text || 'Explorar coleção'} <ArrowRight size={16} /></Link>
              <Link to="/promocoes" className="pill-ghost">Ver promoções</Link>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {([
            [Shirt, 'Peças exclusivas', 'Qualidade e estilo', true],
            [MessageCircle, 'Pedido no WhatsApp', 'Sem cadastro', false],
            [Truck, 'Entrega ou retirada', 'Você escolhe', false],
          ] as const).map(([I, t, d, dark]) => (
            <div key={t} className={`rounded-3xl p-4 transition-transform duration-300 hover:-translate-y-1 ${dark ? 'bg-charcoal text-white' : 'bg-white'}`}>
              <I size={18} className={dark ? 'text-white/70' : 'text-sub'} />
              <p className="mt-3 text-xs font-bold leading-tight md:text-sm">{t}</p>
              <p className={`mt-0.5 text-[11px] leading-tight ${dark ? 'text-white/60' : 'text-sub'}`}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {needsSetup && <div className="container-x mt-12"><SetupNotice /></div>}

      {/* CATEGORIAS — círculos */}
      {categories.length > 0 && (
        <section className="container-x mt-10">
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 md:gap-6">
            <Link to="/loja" className="group flex shrink-0 flex-col items-center gap-2">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-charcoal text-white md:h-20 md:w-20"><LayoutGrid size={24} /></span>
              <span className="text-xs font-semibold">Todos</span>
            </Link>
            {categories.map((c, idx) => {
              const I = ICONS[c.slug] ?? Tag
              return (
                <Link key={c.id} to={`/categoria/${c.slug}`} className="group fade-up flex shrink-0 flex-col items-center gap-2" style={{ animationDelay: `${0.1 + idx * 0.06}s` }}>
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:bg-charcoal group-hover:text-white md:h-20 md:w-20"><I size={24} className="transition-transform duration-500 group-hover:rotate-[12deg]" /></span>
                  <span className="text-xs font-semibold">{c.name}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* FAIXA EM MOVIMENTO */}
      <div className="mt-10 overflow-hidden" aria-hidden>
        <div className="marquee flex w-max items-center gap-10 whitespace-nowrap text-5xl font-extrabold uppercase tracking-tight text-txt/10 md:text-7xl">
          {Array.from({ length: 12 }).map((_, i) => <span key={i} className="flex items-center gap-10">{i % 2 === 0 ? settings.tagline : 'JP STORE'}<span className="text-2xl">✦</span></span>)}
        </div>
      </div>

      {/* PRODUTOS */}
      {products.loading && !needsSetup && <Section title="Lançamentos"><ProductGridSkeleton n={4} /></Section>}
      {products.error && <div className="container-x mt-12 text-sm text-sub">Não foi possível carregar os produtos: {products.error}</div>}
      {latest.length > 0 && <Section title="Lançamentos" link="/novidades"><Grid items={latest} /></Section>}
      {featured.length > 0 && <Section title="Em destaque" link="/loja"><Grid items={featured} /></Section>}
      {street.length > 0 && <Section title="Coleção streetwear" link="/categoria/oversized"><Grid items={street} /></Section>}
      {offers.length > 0 && <Section title="Ofertas especiais" link="/promocoes"><Grid items={offers} /></Section>}
      {!products.loading && !products.error && !needsSetup && list.length === 0 && (
        <div className="container-x mt-14"><div className="surface px-6 py-14 text-center"><p className="text-lg font-extrabold">Novos produtos em breve</p><p className="mt-1 text-sm text-sub">Acompanhe a JP STORE no Instagram.</p></div></div>
      )}

      {/* INSTAGRAM */}
      <section className="container-x mt-14 md:mt-20">
        <div className="surface flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-charcoal text-white"><Instagram size={24} /></span>
          <h2 className="title text-2xl md:text-3xl">Siga a JP STORE</h2>
          <p className="max-w-md text-sm text-sub">Lançamentos, bastidores e inspirações de look no nosso Instagram.</p>
          <a className="pill-dark mt-2" target="_blank" rel="noreferrer" href={`https://instagram.com/${settings.instagram.replace('@', '')}`}>@{settings.instagram.replace('@', '')}</a>
        </div>
      </section>
    </>
  )
}
