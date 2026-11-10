/* Small shared pieces for the product compositions (Deploy Studio, Instance, VPS, Mail, Billing, Admin).
   Nothing here restyles a primitive: it only arranges them. Everything is deterministic mock data. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, Monitor, Smartphone } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, CardTitle, Segmented } from '../components/ui.jsx'
import { DotText, Orb } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'

export const rng = (seed) => { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 } }
export const pick = (r, a) => a[Math.floor(r() * a.length) % a.length]
export const eyebrow = 'font-mono text-[10.5px] uppercase tracking-[.08em] text-dim'
export const sim = (m) => `${m} (simulated)`

/* a titled panel: the one wrapper for every block on a screen */
export function Panel({ title, desc, actions, children, className, pad = true, id }) {
  return (
    <Card className={cn('overflow-hidden', className)} id={id}>
      {(title || actions) && <CardHeader className="items-center pb-0"><div className="min-w-0"><CardTitle>{title}</CardTitle>{desc && <p className="mt-1 text-[13px] text-dim">{desc}</p>}</div>{actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}</CardHeader>}
      <div className={cn(title || actions ? 'mt-4' : '', pad && 'px-5 pb-5', !pad && 'pb-0')}>{children}</div>
    </Card>
  )
}

export const Tile = ({ label, value, sub, tone, className }) => (
  <div className={cn('rounded-lg border border-line p-3', className)}>
    <div className={eyebrow}>{label}</div>
    <div className={cn('mt-1.5 font-mono text-[15px] tabular-nums', tone === 'bad' && 'text-bad', tone === 'warn' && 'text-warn', tone === 'ok' && 'text-ok')}>{value}</div>
    {sub && <div className="mt-0.5 text-[11.5px] text-dim">{sub}</div>}
  </div>
)

export const Kv = ({ rows, className }) => (
  <dl className={cn('divide-y divide-line text-[13.5px]', className)}>
    {rows.map(([k, v, tone]) => <div key={k} className="flex items-center justify-between gap-4 py-2.5"><dt className="text-dim">{k}</dt><dd className={cn('min-w-0 truncate text-right font-mono text-[12.5px]', tone === 'ok' && 'text-ok', tone === 'warn' && 'text-warn', tone === 'bad' && 'text-bad')}>{v}</dd></div>)}
  </dl>
)

/* page head used inside every composition */
export const ScreenHead = ({ title, sub, badge, actions, back }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="min-w-0">
      {back}
      <div className="flex flex-wrap items-center gap-2.5"><h1 className="text-xl font-semibold tracking-tight">{title}</h1>{badge}</div>
      {sub && <p className="mt-1 text-[13.5px] text-mute">{sub}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
)

/* sticky "unsaved changes" bar: the same one the admin editors use */
export function SaveBar({ dirty, onDiscard, onSave, label = 'Unsaved changes', saving }) {
  if (!dirty) return null
  return (
    <div className="anim-menu sticky bottom-3 z-20 flex justify-center">
      <div className="flex items-center gap-4 rounded-xl border border-line-2 bg-[#101012] px-4 py-2.5 shadow-2xl shadow-black/60">
        <span className="flex items-center gap-2 text-[13px]"><i className="size-1.5 rounded-full bg-warn" />{label}</span>
        <Button variant="ghost" size="sm" onClick={onDiscard}>Discard</Button>
        <Button size="sm" loading={saving} onClick={onSave}>Save</Button>
      </div>
    </div>
  )
}

/* a screen inside a bordered window, with a real mobile preview (an iframe at 390 px, so media queries behave) */
export function ScreenFrame({ id, children, height = 720, mobile = true, label }) {
  const [view, setView] = useState('desktop')
  const [run, setRun] = useState(0)
  const src = `${location.pathname}#/frame/${id}`
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className={eyebrow}>{label || id}</div>
        <div className="flex items-center gap-2">
          {mobile && <Segmented value={view} onValueChange={(v) => v && (setView(v), setRun((n) => n + 1))} options={[['desktop', <span key="d" className="flex items-center gap-1.5"><Monitor className="size-3.5" />Desktop</span>], ['mobile', <span key="m" className="flex items-center gap-1.5"><Smartphone className="size-3.5" />Mobile</span>]]} />}
          <Button size="sm" variant="ghost" onClick={() => window.open(src, '_blank', 'noopener')}><ExternalLink />Open</Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-bg">
        {view === 'desktop'
          ? <div className="overflow-auto" style={{ height }}><div className="min-h-full p-4 sm:p-6">{children}</div></div>
          : <div className="grid place-items-center bg-[#050506] p-4"><iframe key={run} title={`${label || id} on a phone`} src={src} className="block rounded-xl border border-line-2 bg-bg" style={{ width: 390, maxWidth: '100%', height: Math.min(height, 780) }} /></div>}
      </div>
    </div>
  )
}

/* ---- the signature effects, shared by every screen so they all feel like the deploying page ---- */
const calm = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const LOW = 'abcdefghijklmnopqrstuvwxyz', UP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', NUM = '0123456789'
/* a stand-in for one character that is not decoded yet: a letter for a letter, a digit for a digit, punctuation stays itself,
   so the noise is about as wide as the real text (never a wide block glyph) */
const scramble = (c, k) => (/[a-z]/.test(c) ? LOW[k % 26] : /[A-Z]/.test(c) ? UP[k % 26] : /[0-9]/.test(c) ? NUM[k % 10] : c)
/* Text that decodes out of noise, one character after another, whenever `text` changes.
   The real text is always laid out (hidden while it decodes) and the noise is drawn on top of it in the same grid cell and clipped,
   so the box has the final size from the first frame: it cannot grow, shrink, wrap differently or push anything around. */
export function Decode({ text, className, tone = 'fg', delay = 0, per = 28 }) {
  const [noise, setNoise] = useState(null)
  useEffect(() => {
    if (calm()) { setNoise(null); return }
    let raf = 0, t0 = 0
    const run = (now) => {
      if (!t0) t0 = now
      const e = now - t0 - delay
      if (e > per * text.length + 260) { setNoise(null); return }
      setNoise([...text].map((c, i) => (e > per * i + 220 || c === ' ' ? c : e > 0 ? scramble(c, Math.floor(now / 55) + i * 7) : ' ')).join(''))
      raf = requestAnimationFrame(run)
    }
    raf = requestAnimationFrame(run)
    return () => { cancelAnimationFrame(raf); setNoise(null) }
  }, [text, delay, per])
  return (
    <span className={cn('dc', tone === 'bad' && 'text-bad', tone === 'ok' && 'text-ok', className)}>
      <span className={noise ? 'dc-ghost' : undefined}>{text}</span>
      {noise && <span aria-hidden className="dc-noise">{noise}</span>}
    </span>
  )
}

/* a row of dots that fills with progress; a light travels along it while it runs, it stops red on failure and fills green on success */
export function DotRail({ value = 0, state = 'run', n = 28, className }) {
  const lit = Math.round(value * n)
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} className={cn('flex items-center gap-[5px]', className)}>
      {Array.from({ length: n }, (_, i) => {
        const on = i < lit
        return <i key={i} className={cn('size-[5px] shrink-0 rounded-full transition-colors duration-300', state === 'fail' && i === lit ? 'bg-bad' : on ? (state === 'ok' ? 'bg-ok' : 'bg-fg') : 'bg-white/15', state === 'run' && i >= lit - 3 && i <= lit + 1 && 'rail-wave')} style={{ animationDelay: `${(i % 8) * 90}ms` }} />
      })}
    </div>
  )
}

/* the empty-state / result moment: a Blip reacting, a dot-matrix headline assembling, one line under it */
export function StateHero({ state = 'idle', role = 'chat', word, sub, children, size = 72, tone, small }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <Orb size={size} state={state} role={role} />
      {word && <div className={cn(tone === 'bad' && '[&_circle]:!fill-[var(--color-bad)]')}><DotText text={word} height={small ? 26 : 34} assemble /></div>}
      {sub && <p className="max-w-sm text-[14px] leading-relaxed text-mute"><Decode text={sub} per={14} /></p>}
      {children}
    </div>
  )
}

/* simulated async: run(fn) shows running, then ok or failed, deterministic in time */
export function useSim(ms = 1400) {
  const [st, setSt] = useState('idle')
  const t = useRef(0)
  useEffect(() => () => clearTimeout(t.current), [])
  const run = (fail = false, then) => { setSt('running'); clearTimeout(t.current); t.current = setTimeout(() => { setSt(fail ? 'failed' : 'ok'); then?.(!fail) }, ms) }
  return [st, run, () => { clearTimeout(t.current); setSt('idle') }]
}

export const useMemoRng = (seed, f) => useMemo(() => f(rng(seed)), [seed])  // eslint-disable-line react-hooks/exhaustive-deps
