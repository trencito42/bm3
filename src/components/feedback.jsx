/* Feedback and interaction components.
   These are the pieces the refined screens share with each other and with the motion lab.
   They are not a second design system: every one of them is built from the primitives in
   ui.jsx / ui2.jsx and uses the motion tokens of src/index.css.

   The rules that hold for all of them:
   - a state is only shown when it is true. Nothing reports success before the work finished.
   - nothing moves while it works. Sizes are reserved, so the page never jumps.
   - an exit is shorter than the entrance, and every movement is transform/opacity only.
   - prefers-reduced-motion turns the movement off, never the meaning.
   - keyboard, focus and screen-reader behaviour is the behaviour of the primitive underneath. */
import * as React from 'react'
import * as DialogP from '@radix-ui/react-dialog'
import * as AlertP from '@radix-ui/react-alert-dialog'
import { AlertTriangle, Check, Copy, Loader2, MoreHorizontal, Undo2, X } from 'lucide-react'
import { Button, Menu, MenuContent, MenuItem, MenuSep, MenuTrigger } from './ui.jsx'
import { Popover, PopoverContent, PopoverTrigger } from './ui2.jsx'
import { cn } from '../lib/utils'
import '../design/motion.css'

/* a media query that survives a resize and answers immediately */
export function useMediaQuery(query) {
  const [match, setMatch] = React.useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches)
  React.useEffect(() => {
    const m = matchMedia(query)
    const f = () => setMatch(m.matches)
    m.addEventListener('change', f)
    f()
    return () => m.removeEventListener('change', f)
  }, [query])
  return match
}

/* ------------------------------------------------------------------ AsyncActionButton */
/* Idle -> pending -> success/error. The button keeps its size in every state: the three
   labels sit in one grid cell, so the widest of them sets the width from the first frame.
   The success state only arrives after the action really resolved. */
export function AsyncActionButton({
  children, onAction, pendingLabel = 'Working…', successLabel = 'Done', errorLabel = 'Failed',
  variant = 'default', size = 'md', icon: Icon, ms = 1500, simulateFailure = false,
  disabled, className, onState, ...rest
}) {
  const [state, setState] = React.useState('idle') // idle | pending | ok | error
  const timer = React.useRef(0)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  const go = (next) => { setState(next); onState?.(next) }
  const run = async () => {
    go('pending')
    clearTimeout(timer.current)
    let failed = simulateFailure
    try {
      const r = onAction?.()
      if (r && typeof r.then === 'function') await r
      else await new Promise((res) => setTimeout(res, ms))
    } catch { failed = true }
    if (failed) {
      go('error')
      timer.current = setTimeout(() => go('idle'), 2600)
    } else {
      go('ok')
      timer.current = setTimeout(() => go('idle'), 1800)
    }
  }
  const labels = { idle: children, pending: pendingLabel, ok: successLabel, error: errorLabel }
  return (
    <Button ref={undefined} {...rest} variant={variant} size={size} disabled={disabled || state === 'pending'} onClick={run} className={cn('gap-2', className)}>
      <span className="relative grid size-4 shrink-0 place-items-center">
        {Icon && <Icon className={cn('absolute size-4 transition-opacity duration-150', state !== 'idle' && 'opacity-0')} />}
        {state === 'pending' && <Loader2 className="absolute size-4 animate-spin text-mute" style={{ animationDuration: '700ms' }} />}
        {state === 'ok' && <Check className="absolute size-4 text-ok" />}
        {state === 'error' && <AlertTriangle className="absolute size-4 text-bad" />}
      </span>
      <span className="grid place-items-center">
        {Object.entries(labels).map(([k, l]) => (
          <span key={k} aria-hidden={k !== state} className={cn('col-start-1 row-start-1 whitespace-nowrap transition-opacity duration-150', k === state ? 'opacity-100' : 'pointer-events-none opacity-0', k === state && k !== 'idle' && 'fb-swap-in')}>{l}</span>
        ))}
      </span>
      <span role="status" aria-live="polite" className="sr-only">{state === 'pending' ? pendingLabel : state === 'ok' ? successLabel : state === 'error' ? errorLabel : ''}</span>
    </Button>
  )
}

/* ------------------------------------------------------------------ ActionConfirmation */
/* Risk-aware confirmation. A reversible action does not get a modal: it asks once, in a
   popover next to the control. Anything that costs data or money gets a dialog. A
   destructive action can ask for the name to be typed. */
const RISK_COPY = {
  low: { title: 'Do it?', confirm: 'Yes, do it', desc: 'This can be undone right after.' },
  medium: { title: 'Are you sure?', confirm: 'Confirm', desc: 'This affects your services.' },
  high: { title: 'This cannot be undone', confirm: 'Delete', desc: 'Everything it holds is removed.' },
}
export function ActionConfirmation({
  label, icon: Icon, risk = 'medium', title, description, confirmLabel, onConfirm,
  requireText, variant = 'outline', size = 'sm', className, triggerLabel
}) {
  const [open, setOpen] = React.useState(false)
  const [armed, setArmed] = React.useState(false)
  const [txt, setTxt] = React.useState('')
  const copy = RISK_COPY[risk] || RISK_COPY.medium
  const t = title || copy.title
  const d = description || copy.desc
  const c = confirmLabel || copy.confirm

  /* low risk: one extra press, in place, no modal */
  if (risk === 'low') {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant={variant} size={size} className={className} onClick={() => { setArmed(true); setOpen(true) }}>
            {Icon && <Icon />}{label}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className="w-64 p-3">
          <div className="text-[13px] font-medium">{t}</div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-mute">{d}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => { setOpen(false); setArmed(false); onConfirm?.() }}>{c}</Button>
            <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setArmed(false) }}>Cancel</Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <AlertP.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setTxt('') }}>
      <AlertP.Trigger asChild>
        <Button variant={variant} size={size} className={className}><>{Icon && <Icon />}{label}</></Button>
      </AlertP.Trigger>
      <AlertP.Portal>
        <AlertP.Overlay className="anim-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-[3px]" />
        <AlertP.Content className="anim-pop fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line-2 bg-card p-6 shadow-2xl outline-none">
          <div className={cn('mb-4 grid size-10 place-items-center rounded-full', risk === 'high' ? 'bg-bad/10 text-bad' : 'bg-white/[0.06] text-fg')}>
            <AlertTriangle className="size-5" />
          </div>
          <AlertP.Title className="text-base font-semibold">{t}</AlertP.Title>
          <AlertP.Description className="mt-1.5 text-[13px] leading-relaxed text-mute">{d}</AlertP.Description>
          {requireText && <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={`Type ${requireText} to confirm`} className="mt-4 flex h-9 w-full items-center rounded-lg border border-line-2 bg-transparent px-3 font-mono text-[13.5px] text-fg outline-none transition-[border-color,box-shadow] focus:border-white/45 focus:ring-2 focus:ring-white/10" />}
          <div className="mt-6 flex justify-end gap-2">
            <AlertP.Cancel asChild><Button variant="outline">Cancel</Button></AlertP.Cancel>
            <AlertP.Action asChild>
              <Button variant={risk === 'high' ? 'destructive' : 'default'} className={risk === 'high' ? '!bg-bad !text-black hover:!bg-bad/85' : ''} disabled={!!requireText && txt !== requireText} onClick={onConfirm}>{c}</Button>
            </AlertP.Action>
          </div>
        </AlertP.Content>
      </AlertP.Portal>
    </AlertP.Root>
  )
}

/* ------------------------------------------------------------------ InlineUndo */
/* A successful action that can be taken back gets a short, usable undo. The line under it
   is the time left, so the offer is honest about disappearing. */
export function InlineUndo({ message = 'Done', undoLabel = 'Undo', onUndo, duration = 6000, className, action }) {
  const [left, setLeft] = React.useState(duration)
  const [gone, setGone] = React.useState(false)
  React.useEffect(() => {
    setLeft(duration); setGone(false)
    const t = setInterval(() => setLeft((l) => {
      if (l <= 120) { clearInterval(t); setGone(true); return 0 }
      return l - 120
    }), 120)
    return () => clearInterval(t)
  }, [duration, message])
  if (gone) return null
  const pct = Math.max(0, Math.min(100, (left / duration) * 100))
  return (
    <div className={cn('fb-undo-in flex items-center gap-3 rounded-xl border border-line-2 bg-[#101012] px-3 py-2 shadow-xl shadow-black/40', className)} role="status">
      <span className="min-w-0 flex-1 truncate text-[13px] text-fg">{message}</span>
      {action}
      <button onClick={() => { setGone(true); onUndo?.() }} className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-fg outline-none transition-colors hover:bg-hover focus-visible:bg-hover">
        <Undo2 className="size-3.5" />{undoLabel}
      </button>
      <span aria-hidden className="h-1 w-14 shrink-0 overflow-hidden rounded-full bg-white/10">
        <i className="block h-full rounded-full bg-white/40 transition-[width] duration-150 ease-linear" style={{ width: pct + '%' }} />
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ StatusTransition */
/* A service changes state: provisioning, running, restarting, stopped, failed. The change
   is shown as one soft pulse, then the new state simply is. */
const STATE_TONE = { running: 'bg-ok', online: 'bg-ok', active: 'bg-ok', stopped: 'bg-dim', offline: 'bg-dim', cancelled: 'bg-dim', failed: 'bg-bad', suspended: 'bg-warn', provisioning: 'bg-warn', starting: 'bg-warn', stopping: 'bg-warn', restarting: 'bg-warn', pending: 'bg-warn' }
const STATE_TEXT = { running: 'text-fg', online: 'text-fg', active: 'text-fg', stopped: 'text-dim', offline: 'text-dim', cancelled: 'text-dim', failed: 'text-bad', suspended: 'text-warn', provisioning: 'text-warn', starting: 'text-warn', stopping: 'text-warn', restarting: 'text-warn', pending: 'text-warn' }
const TRANSIENT = ['provisioning', 'starting', 'stopping', 'restarting', 'pending']
export function StatusTransition({ status = 'running', label, className, showDot = true }) {
  const text = label || status[0].toUpperCase() + status.slice(1)
  return (
    <span className={cn('inline-flex items-center gap-2 text-[12.5px]', STATE_TEXT[status] || 'text-mute', className)}>
      {showDot && (
        <span className="relative grid size-3 shrink-0 place-items-center">
          {TRANSIENT.includes(status)
            ? <Loader2 className="size-3 animate-spin text-warn" style={{ animationDuration: '900ms' }} />
            : <i key={status} className={cn('size-1.5 rounded-full fb-state-pulse', STATE_TONE[status] || 'bg-dim')} />}
        </span>
      )}
      {text}
    </span>
  )
}

/* ------------------------------------------------------------------ ProgressJourney */
/* An operation with real stages: provisioning, backup, deployment, restore. The stage that
   is running is the only one that moves. */
export function ProgressJourney({ stages = [], current = 0, state = 'run', className }) {
  const done = state === 'done' ? stages.length : current
  return (
    <ol className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-0', className)} role="list">
      {stages.map((s, i) => {
        const isDone = i < done
        const isNow = i === done && state !== 'done'
        const failed = state === 'fail' && isNow
        return (
          <li key={s.id || s.label} className="fb-stage-in flex min-w-0 flex-1 gap-3 sm:block" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex flex-col items-center sm:flex-row sm:items-center">
              <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border text-[10px]', isDone ? 'border-fg bg-fg text-black' : isNow ? 'border-fg text-fg' : 'border-line-2 text-dim', failed && 'border-bad text-bad')}>
                {isDone ? <Check className="size-3" /> : failed ? <X className="size-3" /> : isNow ? <i className="fb-state-pulse size-1.5 rounded-full bg-fg" /> : null}
              </span>
              {i < stages.length - 1 && <span aria-hidden className={cn('my-1 h-4 w-px shrink-0 sm:my-0 sm:ml-2 sm:h-px sm:w-auto sm:flex-1', isDone ? 'bg-fg/40' : 'bg-line')} />}
            </div>
            <div className="min-w-0 flex-1 pb-1 sm:mt-2.5 sm:pr-4">
              <div className={cn('truncate text-[13px]', isNow ? 'font-medium text-fg' : isDone ? 'text-mute' : 'text-dim')}>{s.label}</div>
              {s.note && <div className="mt-0.5 text-[12px] leading-snug text-dim">{s.note}</div>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/* ------------------------------------------------------------------ ContentReveal */
/* A skeleton becomes content, and the content stays content. A refetch must not replay the
   animation: once it has been seen, the reveal is never shown again. */
export function ContentReveal({ state = 'ready', skeleton, empty, error, onRetry, children, className }) {
  const revealed = React.useRef(false)
  const [show, setShow] = React.useState(false)
  React.useEffect(() => {
    if (state !== 'ready' || revealed.current) return
    revealed.current = true
    const raf = requestAnimationFrame(() => setShow(true))
    const t = setTimeout(() => setShow(false), 280)
    return () => { cancelAnimationFrame(raf); clearTimeout(t) }
  }, [state])
  if (state === 'loading') return skeleton ?? null
  if (state === 'empty') return empty ?? null
  if (state === 'error') return error ?? null
  return <div className={cn(show && 'fb-content-in', className)}>{children}</div>
}

/* ------------------------------------------------------------------ SmartMenu (SmartPopover / SmartSheet) */
/* The same list of actions: a menu on a desktop, a sheet on a phone. One item list, one
   callback, two surfaces that feel like the same product. */
export function BottomSheet({ open, onOpenChange, title, sub, children, className }) {
  return (
    <DialogP.Root open={open} onOpenChange={onOpenChange}>
      <DialogP.Portal>
        <DialogP.Overlay className="anim-overlay fixed inset-0 z-[66] bg-black/60 backdrop-blur-[2px]" />
        <DialogP.Content className={cn('fb-sheet fixed inset-x-0 bottom-0 z-[67] max-h-[82dvh] overflow-y-auto rounded-t-2xl border-t border-line-2 bg-card outline-none md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[380px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:border', className)} style={{ paddingBottom: 'max(.75rem, env(safe-area-inset-bottom))' }}>
          <button onClick={() => onOpenChange(false)} aria-label="Close" className="mx-auto mt-2 block h-5 w-16 md:hidden"><span className="mx-auto block h-1 w-9 rounded-full bg-white/20" /></button>
          <div className="px-5 pb-2 pt-2 md:pt-5">
            <DialogP.Title className="truncate text-[15px] font-semibold">{title}</DialogP.Title>
            {sub ? <DialogP.Description className="truncate font-mono text-[11.5px] text-dim">{sub}</DialogP.Description> : <DialogP.Description className="sr-only">{title}</DialogP.Description>}
          </div>
          <div className="px-2 pb-1">{children}</div>
        </DialogP.Content>
      </DialogP.Portal>
    </DialogP.Root>
  )
}
export function SheetItem({ icon: I, children, onClick, danger, right, disabled }) {
  return (
    <button disabled={disabled} onClick={onClick} className={cn('flex min-h-12 w-full items-center gap-3.5 rounded-xl px-3 text-left text-[15px] outline-none transition-colors active:bg-hover focus-visible:bg-hover disabled:opacity-40', danger ? 'text-bad' : 'text-fg')}>
      {I && <I className="size-[18px] shrink-0 text-mute" />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {right}
    </button>
  )
}
/* items: [icon, label, onSelect, danger] or '-' for a separator */
export function SmartMenu({ items = [], title, sub, label = 'Actions', align = 'end', className, trigger, onSelect }) {
  const phone = useMediaQuery('(max-width: 767px)')
  const [open, setOpen] = React.useState(false)
  const run = (it) => { setOpen(false); it[2]?.(); onSelect?.(it) }
  if (phone) {
    return (
      <>
        <button aria-label={`${label} for ${title || 'this item'}`} onClick={(e) => { e.stopPropagation(); setOpen(true) }} className={cn('-mr-2 grid size-11 shrink-0 place-items-center rounded-lg text-dim outline-none transition-colors active:bg-hover focus-visible:bg-hover', className)}>
          {trigger || <MoreHorizontal className="size-5" />}
        </button>
        <BottomSheet open={open} onOpenChange={setOpen} title={title || label} sub={sub}>
          {items.map((it, i) => it === '-' ? <div key={i} className="mx-3 my-1 h-px bg-line" /> : <SheetItem key={it[1]} icon={it[0]} danger={it[3]} onClick={() => run(it)}>{it[1]}</SheetItem>)}
        </BottomSheet>
      </>
    )
  }
  return (
    <Menu>
      <MenuTrigger onClick={(e) => e.stopPropagation()} aria-label={`${label} for ${title || 'this item'}`} className={cn('grid size-8 place-items-center rounded-md text-dim outline-none transition-colors hover:bg-hover hover:text-fg focus-visible:bg-hover data-[state=open]:bg-hover data-[state=open]:text-fg', className)}>
        {trigger || <MoreHorizontal className="size-4" />}
      </MenuTrigger>
      <MenuContent align={align}>
        {items.map((it, i) => {
          if (it === '-') return <MenuSep key={i} />
          const I = it[0]
          return <MenuItem key={it[1]} danger={it[3]} onSelect={() => run(it)}>{I ? <I /> : null}{it[1]}</MenuItem>
        })}
      </MenuContent>
    </Menu>
  )
}

/* ------------------------------------------------------------------ AnimatedValue */
/* A figure that changed. It arrives from above and the old one leaves. It does not roll
   digits: a metric is read, not watched. */
export function AnimatedValue({ value, format = (v) => String(v), className, delta = false, decimals = 0 }) {
  const prev = React.useRef(value)
  const [d, setD] = React.useState(null)
  React.useEffect(() => {
    if (prev.current === value) return
    const diff = typeof value === 'number' && typeof prev.current === 'number' ? value - prev.current : null
    prev.current = value
    if (delta && diff != null && Math.abs(diff) > 1e-9) {
      setD(diff)
      const t = setTimeout(() => setD(null), 1500)
      return () => clearTimeout(t)
    }
  }, [value, delta])
  return (
    <span className={cn('relative inline-flex items-baseline tabular-nums', className)}>
      <span key={String(value)} className="fb-value-in">{format(value)}</span>
      {d != null && (
        <span aria-hidden className="fb-value-out absolute -top-4 right-0 whitespace-nowrap font-mono text-[10.5px] text-dim">
          {d > 0 ? '+' : '−'}{Math.abs(d).toFixed(decimals)}
        </span>
      )}
    </span>
  )
}

/* ------------------------------------------------------------------ CopyFeedback */
/* A value you can copy, and a quiet answer that it was copied. The confirmation lives on
   the control, so nothing else on the page has to move. */
export function CopyFeedback({ value, display, label, className, onCopy }) {
  const [state, setState] = React.useState('idle')
  const timer = React.useRef(0)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  const copy = async () => {
    let good = false
    try { await navigator.clipboard.writeText(value); good = true } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = value; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
        const prev = document.activeElement
        document.body.appendChild(ta); ta.select(); good = document.execCommand('copy'); ta.remove(); prev?.focus?.({ preventScroll: true })
      } catch { good = false }
    }
    setState(good ? 'ok' : 'fail')
    onCopy?.(good)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), good ? 1500 : 2000)
  }
  return (
    <span className={cn('inline-flex max-w-full items-center gap-1.5', className)}>
      <button onClick={copy} className="group inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-md border border-line-2 bg-transparent px-2 py-1 text-left outline-none transition-colors duration-150 hover:border-white/25 hover:bg-hover focus-visible:border-white/45">
        {label && <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[.06em] text-dim">{label}</span>}
        <span className="truncate font-mono text-[12px] text-mute group-hover:text-fg">{display || value}</span>
        <span className="relative grid size-3.5 shrink-0 place-items-center">
          <Copy className={cn('absolute size-3.5 transition-opacity duration-150', state === 'ok' ? 'scale-50 opacity-0' : 'scale-100 opacity-100')} />
          <Check className={cn('absolute size-3.5 text-ok transition-opacity duration-150', state === 'ok' ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
        </span>
      </button>
      {state === 'ok' && <span className="fb-swap-in shrink-0 rounded-full border border-ok/25 bg-ok/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[.06em] text-ok">copied</span>}
      {state === 'fail' && <span className="fb-swap-in shrink-0 rounded-full border border-bad/25 bg-bad/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[.06em] text-bad">blocked</span>}
      <span role="status" aria-live="polite" className="sr-only">{state === 'ok' ? 'Copied' : state === 'fail' ? 'Copy failed' : ''}</span>
    </span>
  )
}

/* ------------------------------------------------------------------ MorphActionSurface */
/* A button or a compact surface opens into a panel: the source travels into its new shape
   and the panel takes its place. Reversible in the other direction when it closes. */
export function MorphActionSurface({ trigger, label, title, description, children, width = 520, height = 540, className }) {
  const anchor = React.useRef(null)
  const timer = React.useRef(0)
  const [open, setOpen] = React.useState(false)
  const [ready, setReady] = React.useState(false)
  const [rect, setRect] = React.useState(null)
  const [vp, setVp] = React.useState({ width: typeof innerWidth === 'number' ? innerWidth : 1200, height: typeof innerHeight === 'number' ? innerHeight : 800 })
  const calm = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  React.useEffect(() => {
    const resize = () => setVp({ width: innerWidth, height: innerHeight })
    addEventListener('resize', resize)
    return () => { clearTimeout(timer.current); removeEventListener('resize', resize) }
  }, [])
  const close = () => { clearTimeout(timer.current); setReady(false); timer.current = setTimeout(() => setOpen(false), calm() ? 0 : 320) }
  const change = (value) => {
    if (!value) { close(); return }
    clearTimeout(timer.current)
    const el = anchor.current
    setRect(el ? el.getBoundingClientRect().toJSON() : null)
    setOpen(true); setReady(false)
    timer.current = setTimeout(() => setReady(true), calm() ? 0 : 34)
  }
  const w = Math.min(width, vp.width - 24), h = Math.min(height, vp.height - 32)
  const to = { left: (vp.width - w) / 2, top: (vp.height - h) / 2, width: w, height: h, borderRadius: 16 }
  const from = rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, borderRadius: 8 } : to
  return (
    <DialogP.Root open={open} onOpenChange={change}>
      <DialogP.Trigger asChild>
        <span ref={anchor} className="inline-flex">{trigger}</span>
      </DialogP.Trigger>
      <DialogP.Portal>
        <DialogP.Overlay className="fixed inset-0 z-[65] bg-black/65 backdrop-blur-[5px]" style={{ opacity: ready ? 1 : 0, transition: calm() ? 'none' : 'opacity 320ms' }} />
        <DialogP.Content className={cn('bm-surface', className)} data-ready={ready} style={ready ? to : from} onEscapeKeyDown={(e) => { e.preventDefault(); close() }} onPointerDownOutside={(e) => { e.preventDefault(); close() }}>
          <div className="bm-surface-inner" style={{ width: w }}>
            <div className="p-6 sm:p-8">
              <button onClick={close} aria-label="Close" className="absolute right-3 top-3 grid size-10 place-items-center rounded-lg text-dim hover:bg-hover hover:text-fg"><X className="size-4" /></button>
              <DialogP.Title className="pr-6 text-xl font-semibold tracking-tight">{title}</DialogP.Title>
              {description && <DialogP.Description className="mt-2 text-[13px] leading-relaxed text-mute">{description}</DialogP.Description>}
              {children?.(close)}
            </div>
          </div>
          {label && <span aria-hidden className="bm-surface-label">{label}</span>}
        </DialogP.Content>
      </DialogP.Portal>
    </DialogP.Root>
  )
}
