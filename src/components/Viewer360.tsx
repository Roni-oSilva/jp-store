import { useEffect, useRef, useState } from 'react'
import { MoveHorizontal } from 'lucide-react'

// Visualizador "ver ao redor": usa as fotos do produto como quadros de uma volta completa.
// Arraste (ou use as setas do teclado) para girar. Funciona com 3 ou mais fotos em sequência.
export default function Viewer360({ images, alt }: { images: string[]; alt: string }) {
  const n = images.length
  const [idx, setIdx] = useState(0)
  const [touched, setTouched] = useState(false)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ x: number; start: number } | null>(null)

  // giro automático até a pessoa interagir
  useEffect(() => {
    if (touched || n < 2) return
    const t = setInterval(() => setIdx(i => (i + 1) % n), 700)
    return () => clearInterval(t)
  }, [touched, n])

  const wrap = (v: number) => ((v % n) + n) % n
  const PX = 34 // pixels de arrasto por quadro

  const down = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, start: idx }
    setTouched(true); setDragging(true)
  }
  const move = (e: React.PointerEvent) => {
    if (!drag.current) return
    setIdx(wrap(drag.current.start - Math.round((e.clientX - drag.current.x) / PX)))
  }
  const up = () => { drag.current = null; setDragging(false) }

  // ponto que percorre a órbita conforme o quadro atual
  const ang = (idx / n) * Math.PI * 2 - Math.PI / 2
  const dot = { x: 150 + 130 * Math.cos(ang), y: 22 + 14 * Math.sin(ang) }

  return (
    <div
      className={`relative h-full w-full select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ touchAction: 'pan-y' }}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      tabIndex={0} role="img" aria-label={`${alt} — visão 360°, arraste para girar`}
      onKeyDown={e => { if (e.key === 'ArrowLeft') { setTouched(true); setIdx(i => wrap(i - 1)) } if (e.key === 'ArrowRight') { setTouched(true); setIdx(i => wrap(i + 1)) } }}
    >
      {/* todas as fotos ficam carregadas; só a atual aparece (troca instantânea) */}
      {images.map((u, i) => (
        <img key={u} src={u} alt="" draggable={false} className={`absolute inset-0 h-full w-full object-cover ${i === idx ? 'opacity-100' : 'opacity-0'}`} />
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-1">
        <svg viewBox="0 0 300 44" className="w-[78%] max-w-sm" aria-hidden>
          <ellipse cx="150" cy="22" rx="130" ry="14" fill="none" stroke="#17171a" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="3 5" />
          <circle cx={dot.x} cy={dot.y} r="6" fill="#313135" stroke="#fff" strokeWidth="2" />
        </svg>
        <span className={`flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold backdrop-blur transition-opacity ${touched ? 'opacity-0' : 'opacity-100'}`}>
          <MoveHorizontal size={13} className="hint" /> Arraste para girar
        </span>
      </div>
    </div>
  )
}
