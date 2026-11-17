import { useCallback, useEffect, useState, type DependencyList } from 'react'

export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(() => {
    setLoading(true)
    return fn()
      .then(d => { setData(d); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, deps)
  useEffect(() => { run() }, [run])
  return { data, loading, error, reload: run }
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

export function useSEO(title: string, description?: string, image?: string) {
  useEffect(() => {
    const full = title.includes('JP STORE') ? title : `${title} | JP STORE`
    document.title = full
    const desc = description || 'JP STORE: moda masculina streetwear. Seu estilo. Sua identidade.'
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', full)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', window.location.href)
    setMeta('property', 'og:image', image || `${window.location.origin}/og-image.png`)
    setMeta('name', 'twitter:card', 'summary_large_image')
  }, [title, description, image])
}
