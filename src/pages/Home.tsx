import { Link } from 'react-router-dom'
import { ArrowRight, Instagram, MessageCircle, ShieldCheck, Truck, Shirt } from 'lucide-react'
import { fetchBanners, fetchProducts } from '../lib/api'
import { useAsync, useSEO } from '../lib/hooks'
import { hasPromo, inStock } from '../lib/format'
import { useStore } from '../context/StoreContext'
import ProductCard from '../components/ProductCard'
import { ProductGridSkeleton, SetupNotice, needsSetup } from '../components/ui'

function Section({ title, link, children }: { title: string; link?: string; children: React.ReactNode }) {
  return (
    <section className="container-x mt-20">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="h-display text-2xl md:text-4xl">{title}</h2>
        {link && <Link to={link} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-white/60 hover:text-white">Ver tudo <ArrowRight size={14} /></Link>}
      </div>
      {children}
    </section>
  )
}

export default function Home() {
  useSEO('JP STORE — Moda Masculina Streetwear', 'Peças exclusivas com qualidade, estilo e personalidade. Camisetas, oversized, calças, bermudas e moletons. Seu estilo. Sua identidade.')
  const { categories, settings } = useStore()
  const products = useAsync(() => (needsSetup ? Promise.resolve([]) : fetchProducts()), [])
  const banners = useAsync(() => (needsSetup ? Promise.resolve([]) : fetchBanners()), [])

  const list = (products.data ?? []).filter(inStock)
  const latest = list.slice(0, 8)
  const featured = list.filter(p => p.is_featured).slice(0, 4)
  const offers = list.filter(hasPromo).slice(0, 4)
  const street = list.filter(p => ['oversized', 'camisetas'].includes(p.categories?.slug ?? '')).slice(0, 4)
  const banner = banners.data?.[0]

  return (
    <>
      {/* HERO */}
      <section className="relative isolate flex min-h-[78vh] items-end overflow-hidden bg-black md:items-center">
        {banner?.image_url
          ? <img src={banner.image_url} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70" />
          : <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_30%,#2a2a2d_0%,#0a0a0a_65%)]" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-transparent to-black/40" />
        <div className="container-x pb-16 md:pb-0">
          <p className="fade-up text-xs font-semibold uppercase tracking-[0.35em] text-white/70">{settings.tagline}</p>
          <h1 className="h-display fade-up mt-4 max-w-3xl text-5xl sm:text-6xl md:text-8xl" style={{ animationDelay: '.1s' }}>
            {banner?.title || 'Vista sua identidade.'}
          </h1>
          <p className="fade-up mt-5 max-w-md text-base text-white/70 md:text-lg" style={{ animationDelay: '.2s' }}>
            {banner?.subtitle || 'Moda urbana para quem não segue padrões.'}
          </p>
          <Link to={banner?.link || '/loja'} className="btn-light fade-up mt-8" style={{ animationDelay: '.3s' }}>
            {banner?.button_text || 'Explorar coleção'} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {needsSetup && <div className="container-x mt-12"><SetupNotice /></div>}

      {/* CATEGORIAS */}
      {categories.length > 0 && (
        <Section title="Categorias">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.slice(0, 8).map(c => (
              <Link key={c.id} to={`/categoria/${c.slug}`} className="group relative flex aspect-[4/3] items-end overflow-hidden border border-white/10 bg-graphite p-4 transition-colors hover:border-white/50">
                <span className="absolute right-3 top-3 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-white"><ArrowRight size={18} /></span>
                <span className="font-display text-base uppercase md:text-lg">{c.name}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* PRODUTOS */}
      {products.loading && !needsSetup && <Section title="Lançamentos"><ProductGridSkeleton n={4} /></Section>}
      {products.error && <div className="container-x mt-12 text-sm text-mute">Não foi possível carregar os produtos: {products.error}</div>}
      {latest.length > 0 && (
        <Section title="Lançamentos" link="/novidades">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">{latest.slice(0, 4).map(p => <ProductCard key={p.id} p={p} />)}</div>
        </Section>
      )}
      {featured.length > 0 && (
        <Section title="Em destaque" link="/loja">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">{featured.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </Section>
      )}
      {street.length > 0 && (
        <Section title="Coleção streetwear" link="/categoria/oversized">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">{street.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </Section>
      )}
      {offers.length > 0 && (
        <Section title="Ofertas especiais" link="/promocoes">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">{offers.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </Section>
      )}
      {!products.loading && !products.error && !needsSetup && list.length === 0 && (
        <div className="container-x mt-16 text-center text-sm text-mute">Novos produtos em breve.</div>
      )}

      {/* BENEFÍCIOS */}
      <section className="container-x mt-24">
        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">
          {[
            [Shirt, 'Peças exclusivas', 'Qualidade, estilo e personalidade.'],
            [MessageCircle, 'Atendimento online', 'Pedido finalizado direto no WhatsApp.'],
            [Truck, 'Entrega ou retirada', 'Você escolhe como receber.'],
            [ShieldCheck, 'Confirmação da loja', 'Todo pedido é confirmado por nós.'],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Shirt
            return (
              <div key={t as string} className="bg-ink p-6">
                <I size={22} className="mb-3" />
                <p className="text-sm font-bold uppercase tracking-wider">{t as string}</p>
                <p className="mt-1 text-sm text-mute">{d as string}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="container-x mt-24">
        <div className="card flex flex-col items-center gap-4 px-6 py-14 text-center">
          <Instagram size={30} />
          <h2 className="h-display text-2xl md:text-4xl">Siga a JP STORE</h2>
          <p className="max-w-md text-sm text-mute">Lançamentos, bastidores e inspirações de look no nosso Instagram.</p>
          <a className="btn-outline" target="_blank" rel="noreferrer" href={`https://instagram.com/${settings.instagram.replace('@', '')}`}>@{settings.instagram.replace('@', '')}</a>
        </div>
      </section>
    </>
  )
}
