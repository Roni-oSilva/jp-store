import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { StoreProvider } from './context/StoreContext'
import DemoShell from './demo/DemoShell'
import { isDemo } from './lib/supabase'
import './index.css'

const tree = (
  <StoreProvider>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StoreProvider>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Em /demo, todas as rotas ficam sob /demo e só abrem com o link de uso único */}
    <BrowserRouter basename={isDemo ? '/demo' : undefined}>
      {isDemo ? <DemoShell>{tree}</DemoShell> : tree}
    </BrowserRouter>
  </React.StrictMode>,
)
