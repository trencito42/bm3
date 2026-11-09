/* Charts in the same language as the dot-matrix pieces: hairline grid, flat strokes, no gradients.
   LineChart: crosshair + tooltip, arrow-key navigation, draws in once.  Sparkline: inline trend.  DotDonut: a ring of dots. */
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../lib/utils'
import { DotNum } from './DotViz.jsx'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
/* white at decreasing strength, so any number of series stays inside the palette */
const SHADES = ['#ffffff', 'rgba(255,255,255,.55)', 'rgba(255,255,255,.32)', 'rgba(255,255,255,.18)']

function useWidth(ref, fallback = 480) {
  const [w, setW] = useState(fallback)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const f = () => setW(Math.max(160, Math.round(el.clientWidth)))
    f()
    const ro = new ResizeObserver(f)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return w
}

/* "nice" round axis maximum and step */
function niceScale(max, ticks = 4) {
  const raw = max / ticks, mag = Math.pow(10, Math.floor(Math.log10(raw || 1)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || mag * 10
  return { step, top: step * Math.ceil(max / step) }
}

/* series: [{ id, label, values: number[] }]; labels: x label per index (optional) */
export function LineChart({ series, labels, height = 220, format = (v) => String(Math.round(v)), area = true, className, ariaLabel }) {
  const box = useRef(null)
  const w = useWidth(box)
  const uid = useId().replace(/[^a-z0-9]/gi, '')
  const [hover, setHover] = useState(null)   // index under the pointer / focus
  const [drawn, setDrawn] = useState(reduced())
  /* a timeout rather than rAF: animation frames do not run in a background tab, and the line must still appear */
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 40); return () => clearTimeout(t) }, [])
  const n = series[0]?.values.length || 0
  const padL = 40, padR = 14, padT = 14, padB = labels ? 26 : 12
  const iw = Math.max(10, w - padL - padR), ih = height - padT - padB
  const { top, step } = useMemo(() => niceScale(Math.max(1, ...series.flatMap((s) => s.values))), [series])
  const x = (i) => padL + (n < 2 ? iw / 2 : (i / (n - 1)) * iw)
  const y = (v) => padT + ih - (v / top) * ih
  const path = (vals) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('')
  const ticks = []; for (let t = 0; t <= top + 1e-9; t += step) ticks.push(t)
  const xl = labels ? labels.map((l, i) => [l, i]).filter(([, i]) => i % Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 70)))) === 0 || i === n - 1) : []
  const at = (clientX) => { const r = box.current.getBoundingClientRect(); const px = clientX - r.left; return Math.max(0, Math.min(n - 1, Math.round(((px - padL) / iw) * (n - 1)))) }
  const key = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setHover((h) => Math.min(n - 1, (h ?? -1) + 1)) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setHover((h) => Math.max(0, (h ?? n) - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setHover(0) } else if (e.key === 'End') { e.preventDefault(); setHover(n - 1) } else if (e.key === 'Escape') setHover(null)
  }
  const summary = ariaLabel || `${series.map((s) => s.label).join(', ')} over ${n} points`
  return (
    <div ref={box} className={cn('relative select-none', className)} style={{ height }}>
      <svg width={w} height={height} role="img" aria-label={summary} tabIndex={0} onKeyDown={key} onBlur={() => setHover(null)}
        onPointerMove={(e) => { if (e.pointerType !== 'touch' || e.buttons) setHover(at(e.clientX)) }} onPointerDown={(e) => setHover(at(e.clientX))} onPointerLeave={(e) => e.pointerType !== 'touch' && setHover(null)}
        className="block touch-pan-y outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-white/25">
        <defs><clipPath id={uid}><rect x={padL - 1} y={0} width={drawn ? iw + 2 : 0} height={height} style={{ transition: reduced() ? 'none' : 'width 900ms var(--ease-out)' }} /></clipPath></defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth="1" strokeDasharray={t === 0 ? undefined : '1 4'} strokeLinecap="round" />
            <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" className="fill-[var(--color-dim)] font-mono" fontSize="10">{format(t)}</text>
          </g>
        ))}
        {xl.map(([l, i]) => <text key={i} x={x(i)} y={height - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="fill-[var(--color-dim)] font-mono" fontSize="10">{l}</text>)}
        <g clipPath={`url(#${uid})`}>
          {area && series[0] && <path d={`${path(series[0].values)}L${x(n - 1)} ${y(0)}L${x(0)} ${y(0)}Z`} fill="rgba(255,255,255,.055)" />}
          {series.map((s, si) => <path key={s.id} d={path(s.values)} fill="none" stroke={SHADES[Math.min(si, SHADES.length - 1)]} strokeWidth={si === 0 ? 1.75 : 1.25} strokeLinejoin="round" strokeLinecap="round" />)}
        </g>
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={y(0)} stroke="rgba(255,255,255,.35)" strokeWidth="1" />
            {series.map((s, si) => <circle key={s.id} cx={x(hover)} cy={y(s.values[hover])} r="4" fill="var(--color-bg)" stroke={si === 0 ? 'var(--brand)' : SHADES[Math.min(si, SHADES.length - 1)]} strokeWidth="2" />)}
          </g>
        )}
      </svg>
      {hover != null && (
        <div className="pointer-events-none absolute top-1 z-10 whitespace-nowrap rounded-md border border-line-2 bg-card px-2.5 py-1.5 font-mono text-[11px] tabular-nums shadow-lg shadow-black/40" style={{ left: Math.min(Math.max(x(hover), 60), w - 60), transform: 'translateX(-50%)', transition: 'left 90ms var(--ease-out)' }}>
          {labels && <div className="mb-0.5 text-dim">{labels[hover]}</div>}
          {series.map((s, si) => <div key={s.id} className="flex items-center gap-2"><i className="size-1.5 rounded-full" style={{ background: SHADES[Math.min(si, SHADES.length - 1)] }} /><span className="text-mute">{s.label}</span><span className="ml-auto pl-3 text-fg">{format(s.values[hover])}</span></div>)}
        </div>
      )}
    </div>
  )
}

/* tiny inline trend: no axes, last point marked */
export function Sparkline({ values, width = 96, height = 28, up, className }) {
  const max = Math.max(...values), min = Math.min(...values), span = max - min || 1
  const x = (i) => 2 + (i / (values.length - 1)) * (width - 4)
  const y = (v) => 3 + (1 - (v - min) / span) * (height - 6)
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('')
  const rising = up ?? values[values.length - 1] >= values[0]
  const last = values.length - 1
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Trend: ${rising ? 'up' : 'down'}, from ${values[0]} to ${values[last]}`} className={cn('overflow-visible', className)}>
      <path d={d} fill="none" stroke={rising ? '#fff' : 'rgba(255,255,255,.5)'} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last)} cy={y(values[last])} r="2.4" fill={rising ? 'var(--color-bg)' : 'var(--color-bg)'} stroke={rising ? 'var(--color-ok)' : 'var(--color-bad)'} strokeWidth="1.5" />
    </svg>
  )
}

/* ring of dots, split between segments; hover/focus a legend row (or a dot) to isolate its segment */
export function DotDonut({ segments, size = 168, n = 64, totalLabel = 'total', format = (v) => String(v), className }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1
  const [on, setOn] = useState(null)
  const owner = useMemo(() => {
    const out = []; let acc = 0
    segments.forEach((s, si) => { const count = Math.round((s.value / total) * n); for (let i = 0; i < count && out.length < n; i++) out.push(si); acc += count })
    while (out.length < n) out.push(segments.length - 1)
    return out
  }, [segments, total, n])
  const r = size / 2 - 7
  return (
    <div className={cn('flex flex-wrap items-center gap-x-8 gap-y-5', className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Breakdown: ${segments.map((s) => `${s.label} ${format(s.value)}`).join(', ')}`}>
          {owner.map((si, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2
            const dim = on != null && on !== si
            return <circle key={i} cx={size / 2 + r * Math.cos(a)} cy={size / 2 + r * Math.sin(a)} r={on === si ? 2.9 : 2.3} onPointerEnter={() => setOn(si)} onPointerLeave={() => setOn(null)}
              style={{ fill: segments[si].hot ? 'var(--brand)' : SHADES[Math.min(si, SHADES.length - 1)], opacity: dim ? 0.16 : 1, transition: 'opacity 160ms, r 160ms' }} />
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="flex justify-center"><DotNum text={format(on != null ? segments[on].value : total)} height={22} animate={false} /></div>
            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[.08em] text-dim">{on != null ? segments[on].label : totalLabel}</div>
          </div>
        </div>
      </div>
      <ul className="min-w-[10rem] flex-1 space-y-1.5 text-[13px]">
        {segments.map((s, si) => (
          <li key={s.label}>
            <button type="button" onPointerEnter={() => setOn(si)} onPointerLeave={() => setOn(null)} onFocus={() => setOn(si)} onBlur={() => setOn(null)} className={cn('flex w-full items-center gap-2.5 rounded-md px-2 py-1 text-left outline-none transition-colors duration-150 hover:bg-hover focus-visible:bg-hover', on != null && on !== si && 'opacity-50')}>
              <i className="size-2 shrink-0 rounded-full" style={{ background: s.hot ? 'var(--brand)' : SHADES[Math.min(si, SHADES.length - 1)] }} />
              <span className="text-mute">{s.label}</span>
              <span className="ml-auto font-mono tabular-nums text-fg">{format(s.value)}</span>
              <span className="w-10 text-right font-mono text-[11px] tabular-nums text-dim">{Math.round((s.value / total) * 100)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
