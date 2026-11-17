import { readDb, writeDb, type Db, type Row } from './db'

// Réplica mínima do cliente do Supabase, que guarda tudo no navegador (localStorage).
// Só implementa o que a loja e o painel usam. Nada aqui toca no banco real.

const UNIQUE: Record<string, string[][]> = {
  products: [['slug']], categories: [['slug']], product_variants: [['product_id', 'size', 'color']],
}
const REL: Record<string, Record<string, { table: string; fk: string; many: boolean }>> = {
  products: {
    categories: { table: 'categories', fk: 'category_id', many: false },
    product_images: { table: 'product_images', fk: 'product_id', many: true },
    product_variants: { table: 'product_variants', fk: 'product_id', many: true },
  },
}

function splitTop(s: string): string[] {
  const out: string[] = []
  let depth = 0, cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = '' } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

const err = (message: string, code?: string) => ({ message, code })

class Query implements PromiseLike<any> {
  private op: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select'
  private filters: [string, unknown][] = []
  private orders: { col: string; asc: boolean }[] = []
  private lim?: number
  private cols = '*'
  private payload: any
  private head = false
  private wantCount = false
  private mode: 'many' | 'single' | 'maybe' = 'many'
  private explicitSelect = false

  constructor(private table: string) {}

  select(cols = '*', opts?: { count?: 'exact'; head?: boolean }) { this.explicitSelect = true; this.cols = cols; this.wantCount = !!opts?.count; this.head = !!opts?.head; return this }
  insert(p: any) { this.op = 'insert'; this.payload = p; return this }
  update(p: any) { this.op = 'update'; this.payload = p; return this }
  upsert(p: any) { this.op = 'upsert'; this.payload = p; return this }
  delete() { this.op = 'delete'; return this }
  eq(col: string, val: unknown) { this.filters.push([col, val]); return this }
  order(col: string, o?: { ascending?: boolean }) { this.orders.push({ col, asc: o?.ascending !== false }); return this }
  limit(n: number) { this.lim = n; return this }
  maybeSingle() { this.mode = 'maybe'; return this }
  single() { this.mode = 'single'; return this }

  then<R1 = any, R2 = never>(ok?: ((v: any) => R1 | PromiseLike<R1>) | null, bad?: ((r: any) => R2 | PromiseLike<R2>) | null) {
    return Promise.resolve().then(() => this.run()).then(ok, bad)
  }

  private match(r: Row) { return this.filters.every(([c, v]) => r[c] === v) }

  private project(db: Db, rows: Row[]): any[] {
    const parts = splitTop(this.cols)
    const rels = parts.filter(p => p.includes('(')).map(p => p.slice(0, p.indexOf('(')).trim())
    const plain = parts.filter(p => !p.includes('('))
    const all = plain.includes('*') || plain.length === 0
    return rows.map(r => {
      const out: Row = all ? { ...r } : Object.fromEntries(plain.map(c => [c, r[c]]))
      for (const name of rels) {
        const rel = REL[this.table]?.[name]
        if (!rel) continue
        out[name] = rel.many
          ? (db[rel.table] ?? []).filter(x => x[rel.fk] === r.id).map(x => ({ ...x }))
          : ((db[rel.table] ?? []).find(x => x.id === r[rel.fk]) ?? null)
      }
      return out
    })
  }

  private checkUnique(rows: Row[], row: Row, ignoreId?: unknown) {
    for (const keys of UNIQUE[this.table] ?? []) {
      if (rows.some(x => x.id !== ignoreId && keys.every(k => x[k] === row[k]))) {
        return err(`duplicate key value violates unique constraint (${keys.join(',')})`, '23505')
      }
    }
    return null
  }

  private shape(rows: Row[]) {
    if (this.mode === 'many') return { data: rows, error: null }
    if (rows.length === 0) return this.mode === 'maybe' ? { data: null, error: null } : { data: null, error: err('No rows found', 'PGRST116') }
    return { data: rows[0], error: null }
  }

  private run(): any {
    const db = readDb()
    const rows = db[this.table] ?? (db[this.table] = [])
    try {
      if (this.op === 'select') {
        let r = rows.filter(x => this.match(x))
        if (this.wantCount && this.head) return { data: null, count: r.length, error: null }
        for (const o of [...this.orders].reverse()) {
          r = [...r].sort((a, b) => {
            const av = a[o.col], bv = b[o.col]
            if (av == null) return 1
            if (bv == null) return -1
            const c = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
            return o.asc ? c : -c
          })
        }
        if (this.lim != null) r = r.slice(0, this.lim)
        return { ...this.shape(this.project(db, r)), count: this.wantCount ? r.length : undefined }
      }

      if (this.op === 'insert' || this.op === 'upsert') {
        const list: Row[] = Array.isArray(this.payload) ? this.payload : [this.payload]
        const saved: Row[] = []
        for (const item of list) {
          const row: Row = { ...item }
          if (row.id === undefined && this.table !== 'store_settings') row.id = crypto.randomUUID()
          if (row.created_at === undefined) row.created_at = new Date().toISOString()
          if (this.op === 'upsert') {
            const i = rows.findIndex(x => x.id === row.id)
            if (i >= 0) { rows[i] = { ...rows[i], ...row }; saved.push(rows[i]); continue }
          }
          const dup = this.checkUnique(rows, row)
          if (dup) return { data: null, error: dup }
          rows.push(row); saved.push(row)
        }
        writeDb(db)
        if (!this.explicitSelect) return { data: null, error: null }
        return this.shape(this.project(db, saved))
      }

      if (this.op === 'update') {
        const hit = rows.filter(x => this.match(x))
        for (const row of hit) {
          const next = { ...row, ...this.payload }
          const dup = this.checkUnique(rows, next, row.id)
          if (dup) return { data: null, error: dup }
          Object.assign(row, next)
        }
        writeDb(db)
        return { data: null, error: null }
      }

      // delete (com remoção em cascata, como no banco real)
      const gone = rows.filter(x => this.match(x))
      const ids = new Set(gone.map(x => x.id))
      db[this.table] = rows.filter(x => !ids.has(x.id))
      if (this.table === 'products') {
        db.product_images = (db.product_images ?? []).filter(x => !ids.has(x.product_id))
        db.product_variants = (db.product_variants ?? []).filter(x => !ids.has(x.product_id))
      }
      if (this.table === 'categories') {
        for (const p of db.products ?? []) if (ids.has(p.category_id)) p.category_id = null
        for (const c of db.categories ?? []) if (ids.has(c.parent_id)) c.parent_id = null
      }
      writeDb(db)
      return { data: null, error: null }
    } catch (e) {
      return { data: null, error: err(e instanceof Error ? e.message : 'Erro no demo') }
    }
  }

}

// ───────── armazenamento de imagens (fica em memória até virar URL dentro do produto) ─────────
const files = new Map<string, string>()

function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Imagem inválida.'))
      img.onload = () => {
        const max = 800
        const k = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.72))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

// ───────── login falso (qualquer e-mail/senha entra no painel de demonstração) ─────────
const SESSION_KEY = 'jp.demo.session'
const demoSession = () => ({ access_token: 'demo', user: { id: 'demo-admin', email: 'demo@jpstore.com' } })
const listeners = new Set<(e: string, s: unknown) => void>()
const current = () => { try { return localStorage.getItem(SESSION_KEY) ? demoSession() : null } catch { return null } }

export const demoClient = {
  from: (table: string) => new Query(table),
  storage: {
    from: (_bucket: string) => ({
      upload: async (path: string, file: File) => {
        try { files.set(path, await compress(file)); return { data: { path }, error: null } }
        catch (e) { return { data: null, error: err(e instanceof Error ? e.message : 'Falha no upload') } }
      },
      getPublicUrl: (path: string) => ({ data: { publicUrl: files.get(path) ?? '' } }),
    }),
  },
  auth: {
    getSession: async () => ({ data: { session: current() }, error: null }),
    onAuthStateChange: (cb: (e: string, s: unknown) => void) => {
      listeners.add(cb)
      return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } }
    },
    signInWithPassword: async () => {
      try { localStorage.setItem(SESSION_KEY, '1') } catch { /* ignore */ }
      listeners.forEach(l => l('SIGNED_IN', demoSession()))
      return { data: { session: demoSession() }, error: null }
    },
    signOut: async () => {
      try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
      listeners.forEach(l => l('SIGNED_OUT', null))
      return { error: null }
    },
  },
}
