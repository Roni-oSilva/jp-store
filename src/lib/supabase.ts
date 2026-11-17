import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { demoClient } from '../demo/client'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Modo demonstração: tudo sob /demo usa um banco local (no navegador) e nunca toca na loja real.
export const isDemo = typeof window !== 'undefined' && /^\/demo(\/|$)/.test(window.location.pathname)

const configured = Boolean(url && key)
// Somente a chave pública (anon/publishable). A segurança vem das políticas RLS do banco.
export const realSupabase: SupabaseClient | null = configured ? createClient(url!, key!) : null
export const supabaseConfigured = isDemo || configured
export const supabase: SupabaseClient | null = isDemo ? (demoClient as unknown as SupabaseClient) : realSupabase
