import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ContactPage from './pages/ContactPage'
import NotFound from './pages/NotFound'
import PrivacyPage from './pages/PrivacyPage'
const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<Suspense fallback={<div className="p-10 text-mute">Carregando…</div>}><AdminApp /></Suspense>} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="loja" element={<Shop />} />
        <Route path="categoria/:slug" element={<Shop />} />
        <Route path="novidades" element={<Shop mode="novidades" />} />
        <Route path="promocoes" element={<Shop mode="promocoes" />} />
        <Route path="produto/:slug" element={<ProductPage />} />
        <Route path="sacola" element={<CartPage />} />
        <Route path="finalizar" element={<CheckoutPage />} />
        <Route path="contato" element={<ContactPage />} />
        <Route path="privacidade" element={<PrivacyPage />} />        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
