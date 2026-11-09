import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { DotText } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'

/* dot-matrix numeral, e.g. <DotNum text="$42.50" height={28} /> */
export const DotNum = ({ text, height = 30, animate = false, className }) => (
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
/* Price made of dot glyphs.
   While the value is changing (dragging a slider) digits swap instantly, so the number is always readable and
   never flickers. When it has been still for 220 ms, the digits that changed pop once (red, ~0.4 s) and a net
   delta floats up. Positions are stable, so width only changes when the digit count does. */
function Glyph({ ch, height, pulse }) {
  const host = React.useRef(null)
  useEffect(() => {
    if (!pulse) return
    const svg = host.current?.querySelector('svg')
    if (!svg) return
    svg.classList.remove('dm-quick')
    void svg.getBoundingClientRect() /* restart the animation */
    svg.classList.add('dm-quick')
    const t = setTimeout(() => svg.classList.remove('dm-quick'), 700)
    return () => clearTimeout(t)
  }, [pulse])
  return <span ref={host} className="inline-flex"><DotText text={ch} height={height} quick /></span>
}
export function AnimatedPrice({ value, height = 34, prefix = '$', decimals = 2, showDelta = true, className }) {
  const text = prefix + Number(value).toFixed(decimals)
  const [pulse, setPulse] = useState({ tick: 0, idx: [] })
  const [delta, setDelta] = useState(null)
  const settled = useRef({ text, value: Number(value) })
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    const timer = setTimeout(() => {
      const prev = settled.current
      const idx = []
      for (let i = 0; i < text.length; i++) if (prev.text.length !== text.length || prev.text[i] !== text[i]) idx.push(i)
      const d = Number(value) - prev.value
      settled.current = { text, value: Number(value) }
      if (idx.length) setPulse((p) => ({ tick: p.tick + 1, idx }))
      if (showDelta && Math.abs(d) >= 0.005) setDelta({ d, id: Date.now() })
    }, 220)
    return () => clearTimeout(timer)
  }, [text])
  useEffect(() => {
    if (!delta) return
    const t = setTimeout(() => setDelta(null), 1000)
    return () => clearTimeout(t)
  }, [delta])
  const gap = Math.max(2, height / 7)
  return (
    <span className={cn('relative inline-flex items-center', className)} style={{ gap }} aria-label={text} role="img">
      {[...text].map((ch, i) => <Glyph key={i} ch={ch} height={height} pulse={pulse.idx.includes(i) ? pulse.tick : 0} />)}
      {delta && (
        <span key={delta.id} aria-hidden className={cn('pointer-events-none absolute -top-5 right-0 whitespace-nowrap font-mono text-[11px] tabular-nums', delta.d > 0 ? 'text-bad' : 'text-ok')} style={{ animation: 'float-delta 1s var(--ease-out) forwards' }}>
          {delta.d > 0 ? '+' : '\u2212'}{prefix}{Math.abs(delta.d).toFixed(decimals)}
        </span>
      )}
    </span>
  )
}
