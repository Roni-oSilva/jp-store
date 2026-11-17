import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { supabaseConfigured } from '../lib/supabase'

export function ProductGridSkeleton({ n = 8 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
    </div>
  )
}

// Funciona em fundo claro (loja) e escuro (admin): usa a cor do texto herdada.
export function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-current/10 bg-current/5 p-8 text-center">
      <AlertTriangle className="mx-auto mb-3 opacity-60" />
      <h3 className="text-lg font-extrabold">{title}</h3>
      {children && <div className="mt-2 text-sm opacity-70">{children}</div>}
    </div>
  )
}

export function SetupNotice() {
  return (
    <Notice title="Conecte o Supabase">
      Copie <code className="font-bold">.env.example</code> para <code className="font-bold">.env</code>, preencha{' '}
      <code className="font-bold">VITE_SUPABASE_URL</code> e <code className="font-bold">VITE_SUPABASE_ANON_KEY</code>, rode o{' '}
      <code className="font-bold">supabase/schema.sql</code> e reinicie o servidor.
    </Notice>
  )
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="py-20 text-center">
      <p className="text-xl font-extrabold">{title}</p>
      {text && <p className="mt-2 text-sm text-sub">{text}</p>}
    </div>
  )
}

export const needsSetup = !supabaseConfigured
