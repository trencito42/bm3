import { useEffect, useRef, useState } from 'react'
import { DotText } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'

/* dot-matrix numeral, e.g. <DotNum text="$42.50" height={28} /> */
export const DotNum = ({ text, height = 30, animate = true, className }) => (
  <DotText text={String(text)} height={height} animate={animate} className={className} />
)

/* ring gauge made of dots */
export function DotGauge({ value, size = 104, label, n = 44 }) {
  const [on, setOn] = useState(false)
  useEffect(() => { const t = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true))); return () => cancelAnimationFrame(t) }, [])
  const lit = on ? Math.round((Math.max(0, Math.min(100, value)) / 100) * n) : 0
  const hot = value >= 85
  const r = Math.min(2.4, 264 / n / 3)
  return (
    <div className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full">
        {Array.from({ length: n }, (_, i) => {
          const a = ((-90 + (i * 360) / n) * Math.PI) / 180
          const isLit = i < lit
          return <circle key={i} cx={50 + 42 * Math.cos(a)} cy={50 + 42 * Math.sin(a)} r={r} style={{ fill: hot && isLit && i >= lit - 4 ? 'var(--brand)' : '#fff', opacity: isLit ? 0.95 : 0.12, transition: 'opacity .25s', transitionDelay: `${i * 16}ms` }} />
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <DotText text={`${Math.round(value)}%`} height={Math.max(9, Math.round(size * 0.14))} />
          {label && <div className={cn('font-mono uppercase tracking-[.08em] text-dim', size < 80 ? 'mt-0.5 text-[7.5px]' : 'mt-1.5 text-[9.5px]')}>{label}</div>}
        </div>
      </div>
    </div>
  )
}

/* column chart made of dots */
export function DotBars({ values, rows = 11, unit = 'GB' }) {
  const [on, setOn] = useState(false)
  const [tip, setTip] = useState(null)
  useEffect(() => { setOn(false); const t = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true))); return () => cancelAnimationFrame(t) }, [values])
  const P = 5
  const max = Math.max(...values) * 1.05
  return (
    <div className="relative" onPointerLeave={() => setTip(null)}>
      <svg viewBox={`0 0 ${values.length * P} ${rows * P}`} className="block h-auto w-full">
        {values.map((v, c) => {
          const n = Math.max(1, Math.round((v / max) * rows))
          return (
            <g key={c} className="group" onPointerMove={(e) => setTip({ x: e.clientX, y: e.clientY, t: `Day ${c + 1} · ${Math.round(v)} ${unit}` })}>
              {Array.from({ length: rows }, (_, r) => {
                const lit = on && r < n
                return <circle key={r} cx={c * P + P / 2} cy={(rows - 1 - r) * P + P / 2} r={1.55} className={cn('transition-[opacity,fill] duration-300 group-hover:[fill:var(--brand)]', lit ? 'fill-white' : 'fill-white')} style={{ opacity: lit ? (r === n - 1 ? 1 : 0.8) : 0.1, transitionDelay: `${c * 14 + r * 10}ms` }} />
              })}
            </g>
          )
        })}
      </svg>
      {tip && <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded-md border border-line-2 bg-card px-2.5 py-1.5 font-mono text-[11px]" style={{ left: tip.x, top: tip.y }}>{tip.t}</div>}
    </div>
  )
}

/* uptime dots */
export function DotHeat({ n = 90, incidents = {} }) {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.ceil(n / 2)}, minmax(0,1fr))` }}>
      {Array.from({ length: n }, (_, i) => (
        <i key={i} title={`Day ${i + 1}`} className={cn('aspect-square rounded-full opacity-80 transition-transform hover:scale-150', incidents[i] === 'bad' ? 'bg-bad opacity-100' : incidents[i] === 'warn' ? 'bg-warn' : 'bg-ok')} />
      ))}
    </div>
  )
}

/* Animated price: each character is its own dot glyph. Only characters that change are
   re-mounted, so they re-assemble (red flash -> white, staggered across the glyph),
   while unchanged digits stay still. A delta chip floats up and fades. */
/* animate flag is captured at mount, so unchanged glyphs never replay */
function Glyph({ ch, height, animate }) {
  const [a] = useState(animate)
  return <DotText text={ch} height={height} animate={a} quick />
}
export function AnimatedPrice({ value, height = 34, prefix = '$', decimals = 2, showDelta = true, className }) {
  const text = prefix + Number(value).toFixed(decimals)
  const prev = useRef(null)
  const [delta, setDelta] = useState(null)
  const [tick, setTick] = useState(0)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; prev.current = Number(value); return }
    const d = Number(value) - prev.current
    prev.current = Number(value)
    if (Math.abs(d) < 0.005) return
    setDelta(d); setTick((t) => t + 1)
    const t = setTimeout(() => setDelta(null), 1100)
    return () => clearTimeout(t)
  }, [value])
  const gap = Math.max(2, height / 7)
  const ready = useRef(false)
  useEffect(() => { ready.current = true }, [])
  return (
    <span className={cn('relative inline-flex items-center', className)} style={{ gap }}>
      {[...text].map((ch, i) => (
        <Glyph key={`${i}-${ch}`} ch={ch} height={height} animate={ready.current} />
      ))}
      {showDelta && delta !== null && (
        <span key={tick} className={cn('pointer-events-none absolute -top-5 right-0 whitespace-nowrap font-mono text-[11px]', delta > 0 ? 'text-bad' : 'text-ok')} style={{ animation: 'float-delta 1.1s var(--ease-spring) forwards' }}>
          {delta > 0 ? '+' : '−'}{prefix}{Math.abs(delta).toFixed(decimals)}
        </span>
      )}
    </span>
  )
}
