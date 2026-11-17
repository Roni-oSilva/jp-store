import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import WhatsAppFab from './WhatsAppFab'

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0 }) }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main key={pathname} className="page-in flex-1 pb-6"><Outlet /></main>
      <Footer />
      <CartDrawer />
      <WhatsAppFab />
    </div>
  )
}
