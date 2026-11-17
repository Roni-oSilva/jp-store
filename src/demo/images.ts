// Imagens de exemplo geradas em SVG (nada é baixado de fora e nenhuma foto real é usada).
export type Kind = 'tee' | 'oversized' | 'hoodie' | 'pants' | 'shorts' | 'cap' | 'jacket'

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
function hexToRgb(h: string): [number, number, number] {
  const v = h.replace('#', '')
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}
const toHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => clamp(x).toString(16).padStart(2, '0')).join('')
// amt > 0 clareia, amt < 0 escurece (em %)
function shade(hex: string, amt: number) {
  const [r, g, b] = hexToRgb(hex)
  const t = amt < 0 ? 0 : 255
  const p = Math.abs(amt) / 100
  return toHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p)
}
const isDark = (hex: string) => { const [r, g, b] = hexToRgb(hex); return 0.299 * r + 0.587 * g + 0.114 * b < 130 }

const BODY: Record<Kind, string> = {
  tee: 'M105 70 L60 95 L75 140 L100 128 L100 300 L200 300 L200 128 L225 140 L240 95 L195 70 Q150 102 105 70 Z',
  oversized: 'M92 70 L38 102 L52 164 L90 144 L90 306 L210 306 L210 144 L248 164 L262 102 L208 70 Q150 108 92 70 Z',
  hoodie: 'M98 88 L42 120 L56 196 L96 176 L96 310 L204 310 L204 176 L244 196 L258 120 L202 88 Q150 124 98 88 Z',
  jacket: 'M100 72 H200 L262 126 L246 208 L202 188 V312 H98 V188 L54 208 L38 126 Z',
  pants: 'M104 58 H196 L214 312 H160 L150 152 L140 312 H86 Z',
  shorts: 'M104 84 H196 L214 238 H160 L150 164 L140 238 H86 Z',
  cap: 'M68 196 Q68 112 150 112 Q232 112 232 196 Z',
}

function details(kind: Kind, c: string, ink: string, back: boolean): string {
  const line = shade(c, isDark(c) ? 22 : -22)
  switch (kind) {
    case 'hoodie': return [
      `<path d="M100 64 Q150 16 200 64 L206 92 Q150 128 94 92 Z" fill="${shade(c, -8)}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>`,
      back ? '' : `<path d="M112 98 Q150 128 188 98 Q150 112 112 98 Z" fill="${shade(c, -35)}" opacity=".55"/><line x1="135" y1="112" x2="133" y2="150" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/><line x1="165" y1="112" x2="167" y2="150" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>`,
      back ? '' : `<path d="M110 232 H190 L198 276 H102 Z" fill="none" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<rect x="96" y="296" width="108" height="14" rx="3" fill="${shade(c, -10)}" stroke="${line}" stroke-width="2"/>`,
    ].join('')
    case 'jacket': return `<path d="M100 72 Q150 112 200 72 L196 88 Q150 124 104 88 Z" fill="${shade(c, -12)}"/>${back ? '' : `<line x1="150" y1="104" x2="150" y2="312" stroke="${line}" stroke-width="3"/>`}`
    case 'pants': return `<line x1="104" y1="78" x2="196" y2="78" stroke="${line}" stroke-width="3"/><line x1="150" y1="78" x2="150" y2="152" stroke="${line}" stroke-width="2.5"/>${back ? '' : `<rect x="110" y="190" width="26" height="34" rx="4" fill="none" stroke="${line}" stroke-width="2.5"/><rect x="164" y="190" width="26" height="34" rx="4" fill="none" stroke="${line}" stroke-width="2.5"/>`}`
    case 'shorts': return `<line x1="104" y1="100" x2="196" y2="100" stroke="${line}" stroke-width="3"/><line x1="150" y1="100" x2="150" y2="164" stroke="${line}" stroke-width="2.5"/>`
    case 'cap': return `<path d="M200 190 Q286 188 282 210 Q248 222 206 204 Z" fill="${shade(c, -14)}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="150" cy="114" r="5" fill="${shade(c, -18)}"/>`
    default: return ''
  }
}

function print(kind: Kind, ink: string, back: boolean): string {
  if (back || kind === 'cap' || kind === 'pants' || kind === 'shorts') return ''
  const y = kind === 'hoodie' ? 214 : kind === 'jacket' ? 160 : 170
  return `<text x="150" y="${y}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="30" fill="${ink}" opacity=".9">JP</text>`
}

export function garment(kind: Kind, color: string, opts: { back?: boolean; sx?: number } = {}): string {
  const { back = false } = opts
  const sx = opts.sx ?? 1
  const c = shade(color, sx < 1 ? -(1 - Math.abs(sx)) * 28 : 0)
  const ink = isDark(color) ? '#f5f5f5' : '#17171a'
  const stroke = shade(c, isDark(c) ? 25 : -28)
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 375" width="300" height="375">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f1f4"/><stop offset="1" stop-color="#d8d8de"/></linearGradient></defs>` +
    `<rect width="300" height="375" fill="url(#g)"/>` +
    `<ellipse cx="150" cy="335" rx="${Math.max(40, 86 * Math.abs(sx))}" ry="9" fill="#000" opacity=".09"/>` +
    `<g transform="translate(150 0) scale(${sx} 1) translate(-150 0)">` +
    `<path d="${BODY[kind]}" fill="${c}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
    details(kind, c, ink, back) + print(kind, ink, back) + `</g>` +
    `<text x="150" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="4" fill="#17171a" opacity=".38">DEMO</text>` +
    `</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// 8 quadros de uma volta completa (frente → lado → costas → lado) para o "Ver ao redor".
export function spin(kind: Kind, color: string, frames = 8): string[] {
  return Array.from({ length: frames }, (_, i) => {
    const th = (i / frames) * Math.PI * 2
    const cos = Math.cos(th)
    return garment(kind, color, { back: cos < 0, sx: Math.max(0.42, Math.abs(cos)) })
  })
}
