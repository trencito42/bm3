/* Composite pieces shared by the refined screens (30 Overview, 31 Apps & databases).
   They sit between the primitives (ui.jsx) and the screens: a meter, a service identity,
   a metric cell, an activity line. One definition, used by both screens, so the overview
   and the inventory cannot drift apart.

   Nothing here invents a style: it arranges the primitives and the dot-matrix language. */
import * as React from 'react'
import { ArrowRight, Bot, Box, Code2, Copy, Database, Gamepad2, Globe, Server, Terminal } from 'lucide-react'
import { Button } from './ui.jsx'
import { CopyFeedback } from './feedback.jsx'
import { DotText } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'

/* the mark that says: this is a design fixture, not a live account */
export const SimulatedNote = ({ children = 'Simulated data · design fixture', className }) => (
  <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-line-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.08em] text-dim', className)}>
    <i className="size-1.5 rounded-full bg-warn" />{children}
  </span>
)

export const eyebrow = 'font-mono text-[10.5px] uppercase tracking-[.08em] text-dim'

/* ------------------------------------------------------------------ AdaptiveGreeting */
/* The dot-matrix greeting. A long name must not push the page sideways and must not
   become unreadable: the line is scaled down to the width it has, and a name that cannot
   fit at the smallest readable size is shortened instead of overflowing. */
export function AdaptiveGreeting({ name = 'Stefan', height = 40, minHeight = 18, className }) {
  const host = React.useRef(null)
  const box = React.useRef(null)
  const [text, setText] = React.useState(() => `HELLO, ${name.toUpperCase()}`)
  const [h, setH] = React.useState(height)
  const applied = React.useRef('')

  const fit = React.useCallback(() => {
    const el = host.current, wrap = box.current
    if (!el || !wrap) return
    const svg = el.querySelector('svg')
    if (!svg) return
    const vb = (svg.getAttribute('viewBox') || '').trim().split(/\s+/).map(Number)
    const ratio = vb[2] && vb[3] ? vb[2] / vb[3] : 6
    const avail = wrap.clientWidth
    if (!avail) return
    const L = Math.max(1, text.length)
    const natural = h * ratio
    if (natural <= avail) return
    const exact = avail / ratio
    if (exact >= minHeight) { setH(exact); return }
    /* even the smallest readable size does not fit: shorten the name */
    const perChar = (minHeight * ratio) / L
    const room = Math.max(3, Math.floor(avail / perChar) - 'HELLO, '.length - 1)
    const cut = name.toUpperCase().slice(0, room)
    setText(`HELLO, ${cut}…`)
    setH(minHeight)
  }, [text, h, minHeight, name])

  React.useLayoutEffect(() => {
    const sig = text + '|' + h
    if (applied.current === sig) return
    applied.current = sig
    fit()
  }, [text, h, fit])

  React.useEffect(() => {
    const ro = new ResizeObserver(() => fit())
    if (box.current) ro.observe(box.current)
    return () => ro.disconnect()
  }, [fit])

  return (
    <div ref={box} className={cn('min-w-0', className)}>
      <div ref={host} className="min-w-0">
        <DotText text={text} height={h} assemble />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ MetricCell */
/* One number with its name. Used in the mobile grid and in the desktop infrastructure
   strip: label above, value, and a note that says what the number is *not* (a total, a
   single service, a platform figure). */
export function MetricCell({ label, value, note, tone, className, mono = true }) {
  return (
    <div className={cn('min-w-0 rounded-lg border border-line bg-card px-3 py-2.5', className)}>
      <div className={cn(eyebrow, 'truncate')}>{label}</div>
      <div className={cn('mt-1 flex items-baseline gap-1 text-[19px] font-semibold leading-none tracking-tight', mono && 'tabular-nums', tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'ok' ? 'text-ok' : 'text-fg')}>
        {value}
      </div>
      {note && <div className="mt-1.5 text-[11.5px] leading-snug text-dim">{note}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ StatusStrip */
/* Every service as one dot: this is the whole inventory in a single row, and the legend
   says what each colour means. Thirteen services are thirteen dots, not thirteen rows. */
export function StatusStrip({ services, className }) {
  const tone = (s) => s.status === 'running' ? 'bg-fg' : s.status === 'failed' ? 'bg-bad' : s.status === 'provisioning' ? 'bg-warn' : s.stoppedByUser ? 'bg-white/25' : 'bg-dim'
  const legend = [
    ['running', 'Running', 'bg-fg'],
    ['stopped', 'Stopped by you', 'bg-white/25'],
    ['failed', 'Failed', 'bg-bad'],
    ['provisioning', 'Preparing', 'bg-warn'],
  ]
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1.5">
        {services.map((s) => (
          <i key={s.id} title={`${s.name} · ${s.status === 'stopped' && s.stoppedByUser ? 'stopped by you' : s.status}`} className={cn('size-2 rounded-full', tone(s))} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-dim">
        {legend.map(([id, l, c]) => {
          const n = services.filter((s) => (id === 'stopped' ? s.status === 'stopped' : s.status === id)).length
          if (!n) return null
          return <span key={id} className="flex items-center gap-1.5"><i className={cn('size-1.5 rounded-full', c)} />{n} {l}</span>
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ ResourceMeter */
/* A usage meter made of dots, so the fleet panel keeps the dot-matrix identity without
   the weight of four ring gauges. */
export function ResourceMeter({ label, value, n = 14, showValue = true, className, tone, dense }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  const lit = Math.round((v / 100) * n)
  const color = tone || (v >= 90 ? 'bg-bad' : v >= 80 ? 'bg-warn' : 'bg-fg')
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label && <span className={cn('shrink-0 font-mono uppercase tracking-[.06em] text-dim', dense ? 'w-6 text-[10px]' : 'w-8 text-[10.5px]')}>{label}</span>}
      <span aria-hidden className="grid min-w-0 flex-1 justify-items-center gap-[3px]" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
        {Array.from({ length: n }, (_, i) => (
          <i key={i} className={cn('size-[4px] rounded-full transition-colors duration-300', i < lit ? color : 'bg-white/10')} style={{ transitionDelay: `${i * 12}ms` }} />
        ))}
      </span>
      {showValue && <span className={cn('shrink-0 text-right font-mono tabular-nums text-mute', dense ? 'w-8 text-[10.5px]' : 'w-9 text-[11px]')}>{Math.round(v)}%</span>}
    </div>
  )
}

/* two meters, for a table row */
export const UsageMeters = ({ cpu, ram, className }) => (
  <div className={cn('flex min-w-0 flex-col gap-1', className)}>
    <ResourceMeter label="CPU" value={cpu} n={8} dense />
    <ResourceMeter label="RAM" value={ram} n={8} dense />
  </div>
)

/* ------------------------------------------------------------------ Service identity */
export const KIND_ICON = { app: Box, game: Gamepad2, db: Database, bot: Bot, code: Code2, site: Globe, vps: Server, web: Globe }
export function ServiceIdentity({ kind, icon: Icon, name, sub, status, tone }) {
  const I = Icon || KIND_ICON[kind] || Box
  const dot = tone || (status === 'running' || status === 'online' ? 'bg-ok' : status === 'failed' ? 'bg-bad' : status === 'provisioning' ? 'bg-warn' : 'bg-dim')
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="relative grid size-8 shrink-0 place-items-center rounded-lg border border-line-2 bg-white/[0.03] text-mute">
        <I className="size-4" />
        <i className={cn('absolute -bottom-0.5 -right-0.5 size-2 rounded-full border-2 border-card', dot)} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-medium leading-tight">{name}</span>
        {sub && <span className="mt-0.5 block truncate text-[12px] text-dim">{sub}</span>}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ Endpoint */
/* The address, quiet and monospaced, with a copy that answers on the control itself. */
export function Endpoint({ value, label, className, maxWidth = 'max-w-[220px]' }) {
  return <CopyFeedback value={value} display={value} label={label} className={cn('min-w-0', className)} />
}

/* ------------------------------------------------------------------ Activity line */
export function ActivityRow({ icon: Icon, title, note, when, tone = 'mute', className }) {
  return (
    <div className={cn('flex items-start gap-3 px-1 py-2.5', className)}>
      {Icon && (
        <span className={cn('mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-line-2 bg-white/[0.03]', tone === 'bad' ? 'text-bad' : tone === 'ok' ? 'text-ok' : 'text-mute')}>
          <Icon className="size-[15px]" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] leading-snug text-fg [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">{title}</span>
        {note && <span className="mt-0.5 block text-[12.5px] leading-snug text-dim">{note}</span>}
      </span>
      {when && <span className="shrink-0 pt-0.5 font-mono text-[11px] text-dim">{when}</span>}
    </div>
  )
}

/* ------------------------------------------------------------------ Attention */
/* Only rendered when something is actually wrong. A deliberately stopped service is not
   an emergency and never appears here. */
export function AttentionCard({ items = [], onAction, className }) {
  if (!items.length) return null
  return (
    <section className={cn('overflow-hidden rounded-xl border border-warn/25 bg-warn/[0.04]', className)} aria-label="Needs your attention">
      <div className="flex items-center justify-between gap-3 border-b border-warn/15 px-4 py-2.5">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[.08em] text-warn">Needs you</h2>
        <span className="font-mono text-[11px] tabular-nums text-warn/80">{items.length} item{items.length > 1 ? 's' : ''}</span>
      </div>
      <ul className="divide-y divide-warn/10">
        {items.map((it) => (
          <li key={it.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-medium text-fg">{it.title}</span>
              {it.note && <span className="mt-0.5 block text-[12.5px] leading-snug text-mute">{it.note}</span>}
            </span>
            {it.action && (
              <Button size="sm" variant="outline" onClick={() => onAction?.(it)} className="shrink-0">
                {it.action}<ArrowRight className="size-3.5" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* a quiet note under a title: what a number is, in one line */
export const Caption = ({ children, className }) => (
  <p className={cn('text-[12.5px] leading-relaxed text-dim', className)}>{children}</p>
)
