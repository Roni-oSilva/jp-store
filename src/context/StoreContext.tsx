import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchCategories, fetchSettings } from '../lib/api'
import { supabaseConfigured } from '../lib/supabase'
import { DEFAULT_SETTINGS, type Category, type StoreSettings } from '../lib/types'

interface StoreCtx {
  settings: StoreSettings
  categories: Category[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}
const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(supabaseConfigured)
  const [error, setError] = useState<string | null>(supabaseConfigured ? null : 'not-configured')

  const reload = useCallback(async () => {
    if (!supabaseConfigured) return
    try {
      const [s, c] = await Promise.all([fetchSettings(), fetchCategories()])
      setSettings(s); setCategories(c); setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar a loja')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { reload() }, [reload])

  return <Ctx.Provider value={{ settings, categories, loading, error, reload }}>{children}</Ctx.Provider>
}

export function useStore() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore fora do StoreProvider')
  return c
}
