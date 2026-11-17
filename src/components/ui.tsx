import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { supabaseConfigured } from '../lib/supabase'

export function ProductGridSkeleton({ n = 8 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i}><div className="skeleton aspect-[3/4]" /><div className="skeleton mt-3 h-3 w-2/3" /><div className="skeleton mt-2 h-3 w-1/3" /></div>
      ))}
    </div>
  )
}

export function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card mx-auto max-w-xl p-8 text-center">
      <AlertTriangle className="mx-auto mb-3 text-mute" />
      <h3 className="font-display text-lg uppercase">{title}</h3>
      {children && <div className="mt-2 text-sm text-mute">{children}</div>}
    </div>
  )
}

export function SetupNotice() {
  return (
    <Notice title="Conecte o Supabase">
      Copie <code className="text-white">.env.example</code> para <code className="text-white">.env</code>, preencha{' '}
      <code className="text-white">VITE_SUPABASE_URL</code> e <code className="text-white">VITE_SUPABASE_ANON_KEY</code>, rode o{' '}
      <code className="text-white">supabase/schema.sql</code> e reinicie o servidor.
    </Notice>
  )
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-xl uppercase">{title}</p>
      {text && <p className="mt-2 text-sm text-mute">{text}</p>}
    </div>
  )
}

export const needsSetup = !supabaseConfigured
