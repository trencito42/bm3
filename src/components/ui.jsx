import * as React from 'react'
import { cva } from 'class-variance-authority'
import * as DialogP from '@radix-ui/react-dialog'
import * as TabsP from '@radix-ui/react-tabs'
import * as SwitchP from '@radix-ui/react-switch'
import * as SliderP from '@radix-ui/react-slider'
import * as ProgressP from '@radix-ui/react-progress'
import * as AvatarP from '@radix-ui/react-avatar'
import * as SepP from '@radix-ui/react-separator'
import * as TipP from '@radix-ui/react-tooltip'
import * as MenuP from '@radix-ui/react-dropdown-menu'
import * as ToggleP from '@radix-ui/react-toggle-group'
import * as RadioP from '@radix-ui/react-radio-group'
import { X, Check } from 'lucide-react'
import { cn } from '../lib/utils'
import { DotNum } from './DotViz.jsx'

/* ------------------------------ Button ------------------------------ */
/* Press feedback is a tonal step (no scale): hover 150 ms, press is instant (duration-0 while :active) so it feels physical. */
const buttonCva = cva(
  'relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-lg text-[13px] font-medium transition-[background-color,border-color,color,opacity] duration-150 ease-[var(--ease-std)] active:duration-0 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-fg text-black hover:bg-white/85 active:bg-white/70',
        secondary: 'bg-hover text-fg hover:bg-white/10 active:bg-white/[0.14]',
        outline: 'border border-line-2 bg-transparent text-fg hover:border-white/25 hover:bg-hover active:bg-white/[0.1]',
        ghost: 'text-mute hover:bg-hover hover:text-fg active:bg-white/10',
        destructive: 'border border-bad/30 text-bad hover:border-bad/50 hover:bg-bad/10 active:bg-bad/[0.16]',
      },
      size: { sm: 'h-8 px-3', md: 'h-9 px-4', lg: 'h-11 px-5 text-sm', icon: 'size-9' },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
)
const Spinner = () => (
  <svg viewBox="0 0 24 24" className="size-4 animate-spin" style={{ animationDuration: '700ms' }} aria-hidden>
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" opacity=".22" />
    <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)
/* `loading` swaps the label for a spinner without changing the button's width, so nothing around it moves. */
export const Button = React.forwardRef(({ className, variant, size, loading, children, disabled, ...p }, ref) => (
  <button ref={ref} disabled={disabled || loading} aria-busy={loading || undefined} className={cn(buttonCva({ variant, size }), 'gap-2', loading && 'cursor-progress disabled:opacity-100', className)} {...p}>
    <span className={cn('inline-flex items-center justify-center gap-2 transition-opacity duration-150', loading && 'opacity-0')}>{children}</span>
    {loading && <span className="absolute inset-0 grid place-items-center"><Spinner /></span>}
  </button>
))

/* ------------------------------ Card ------------------------------ */
export const Card = ({ className, ...p }) => <div className={cn('min-w-0 rounded-xl border border-line bg-card', className)} {...p} />
export const CardHeader = ({ className, ...p }) => <div className={cn('flex items-start justify-between gap-4 p-5 pb-0', className)} {...p} />
export const CardTitle = ({ className, ...p }) => <h3 className={cn('font-mono text-[11px] font-normal uppercase tracking-[.08em] text-mute', className)} {...p} />
export const CardDesc = ({ className, ...p }) => <p className={cn('mt-1 text-[13px] text-dim', className)} {...p} />
export const CardBody = ({ className, ...p }) => <div className={cn('p-5', className)} {...p} />

/* ------------------------------ Badge ------------------------------ */
const badgeCva = cva('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[.06em] transition-[color,background-color,border-color] duration-200', {
  variants: {
    tone: {
      neutral: 'border-line-2 text-mute',
      ok: 'border-ok/25 bg-ok/10 text-ok',
      warn: 'border-warn/25 bg-warn/10 text-warn',
      bad: 'border-bad/25 bg-bad/10 text-bad',
      info: 'border-info/25 bg-info/10 text-info',
    },
  },
  defaultVariants: { tone: 'neutral' },
})
export const Badge = ({ className, tone, dot = true, children, ...p }) => (
  <span className={cn(badgeCva({ tone }), className)} {...p}>
    {dot && <span className="size-1.5 rounded-full bg-current" />}
    {children}
  </span>
)

/* ------------------------------ Inputs ------------------------------ */
/* One field language: rest -> hover (border lifts) -> focus (border + soft ring, placeholder recedes) -> invalid -> disabled. */
export const fieldBase = 'w-full rounded-lg border border-line-2 bg-transparent px-3 text-[13.5px] text-fg outline-none transition-[border-color,box-shadow,background-color] duration-150 ease-[var(--ease-std)] placeholder:text-dim placeholder:transition-opacity placeholder:duration-150 hover:border-white/25 focus:border-white/45 focus:ring-2 focus:ring-white/10 focus:placeholder:opacity-50 aria-[invalid=true]:border-bad/60 aria-[invalid=true]:focus:ring-bad/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line-2 read-only:bg-white/[0.03]'
export const Input = React.forwardRef(({ className, ...p }, ref) => (
  <input ref={ref} className={cn('flex h-9', fieldBase, className)} {...p} />
))
export const Textarea = React.forwardRef(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn('flex resize-none py-2', fieldBase, className)} {...p} />
))
export const Label = ({ className, ...p }) => <label className={cn('text-[12.5px] font-medium text-mute', className)} {...p} />

/* ------------------------------ Dialog / Sheet ------------------------------ */
export const Dialog = DialogP.Root
export const DialogTrigger = DialogP.Trigger
export const DialogClose = DialogP.Close
export function DialogContent({ className, children, title, description, side, ...p }) {
  return (
    <DialogP.Portal>
      <DialogP.Overlay className="anim-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-[3px]" />
      <DialogP.Content
        className={cn(
          'fixed z-50 border border-line-2 bg-card shadow-2xl shadow-black/60 outline-none',
          side
            ? 'anim-slide right-0 top-0 h-full w-full max-w-md overflow-y-auto border-y-0 border-r-0 p-6'
            : 'anim-pop left-1/2 top-1/2 max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6',
          className
        )}
        {...p}
      >
        <div className="mb-5 pr-8">
          <DialogP.Title className="text-base font-semibold tracking-tight">{title}</DialogP.Title>
          {description ? <DialogP.Description className="mt-1 text-[13px] text-dim">{description}</DialogP.Description> : <DialogP.Description className="sr-only">{title}</DialogP.Description>}
        </div>
        {children}
        <DialogP.Close className="absolute right-4 top-4 grid size-8 place-items-center rounded-md text-dim transition-colors hover:bg-hover hover:text-fg" aria-label="Close">
          <X className="size-4" />
        </DialogP.Close>
      </DialogP.Content>
    </DialogP.Portal>
  )
}

/* ------------------------------ Tabs ------------------------------ */
/* Shared by tabs, segmented controls and DetailLayout: one indicator element that glides to whichever
   child is active (data-state=active|on, or aria-selected=true). Re-measures on resize and on any state change,
   and brings an off-screen active tab into view when the list scrolls (phones). */
export const ACTIVE = '[data-state=active],[data-state=on],[aria-selected=true]'
export function useSlideIndicator(ref, { scroll = false } = {}) {
  const [box, setBox] = React.useState(null)
  const first = React.useRef(true)
  const measure = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const a = el.querySelector(ACTIVE)
    if (!a) { setBox(null); return }
    setBox({ left: a.offsetLeft, top: a.offsetTop, width: a.offsetWidth, height: a.offsetHeight })
    if (scroll && el.scrollWidth > el.clientWidth + 1) {
      const target = a.offsetLeft - (el.clientWidth - a.offsetWidth) / 2
      el.scrollTo({ left: Math.max(0, target), behavior: first.current ? 'auto' : 'smooth' })
    }
    first.current = false
  }, [ref, scroll])
  React.useLayoutEffect(() => {
    const el = ref.current
    measure()
    const mo = new MutationObserver(measure)
    mo.observe(el, { attributes: true, subtree: true, attributeFilter: ['data-state', 'aria-selected'] })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    document.fonts?.ready.then(measure)
    return () => { mo.disconnect(); ro.disconnect() }
  }, [ref, measure])
  return box
}
const mergeRefs = (...refs) => (node) => refs.forEach((r) => { if (typeof r === 'function') r(node); else if (r) r.current = node })

export const Tabs = TabsP.Root
export const TabsList = React.forwardRef(({ className, children, ...p }, fwd) => {
  const ref = React.useRef(null)
  const box = useSlideIndicator(ref, { scroll: true })
  return (
    <TabsP.List ref={mergeRefs(ref, fwd)} className={cn('relative flex max-w-full gap-1 overflow-x-auto whitespace-nowrap border-b border-line [scrollbar-width:none]', className)} {...p}>
      {children}
      <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-px bg-fg" style={box ? { width: Math.max(0, box.width - 24), transform: `translateX(${box.left + 12}px)`, opacity: 1, transition: 'transform 220ms var(--ease-out), width 220ms var(--ease-out), opacity 120ms' } : { opacity: 0 }} />
    </TabsP.List>
  )
})
export const TabsTrigger = ({ className, ...p }) => (
  <TabsP.Trigger className={cn('relative h-10 shrink-0 px-3 text-[13px] text-dim transition-colors duration-150 hover:text-fg data-[state=active]:text-fg', className)} {...p} />
)
export const TabsContent = ({ className, ...p }) => <TabsP.Content className={cn('outline-none', className)} {...p} />

/* ------------------------------ Switch / Slider / Progress ------------------------------ */
export const Switch = ({ className, ...p }) => (
  <SwitchP.Root className={cn('group relative h-5 w-9 shrink-0 rounded-full border border-line-2 bg-transparent transition-[background-color,border-color] duration-[180ms] ease-[var(--ease-std)] hover:border-white/30 data-[state=checked]:border-fg data-[state=checked]:bg-fg disabled:cursor-not-allowed disabled:opacity-40', className)} {...p}>
    {/* thumb stretches slightly while pressed, then settles: tells you the control is grabbed */}
    <SwitchP.Thumb className="block h-3.5 w-3.5 translate-x-[3px] rounded-full bg-mute transition-[transform,width,background-color] duration-[200ms] ease-[var(--ease-out)] group-active:w-[17px] data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-black group-active:data-[state=checked]:translate-x-[15px]" />
  </SwitchP.Root>
)
export const Slider = ({ className, ...p }) => (
  <SliderP.Root className={cn('relative flex h-5 w-full touch-none select-none items-center', className)} {...p}>
    <SliderP.Track className="relative h-1 grow rounded-full bg-white/10">
      <SliderP.Range className="absolute h-full rounded-full bg-fg" />
    </SliderP.Track>
    <SliderP.Thumb className="block size-4 cursor-grab rounded-full bg-fg shadow outline-none ring-4 ring-bg transition-[box-shadow] duration-150 hover:ring-white/15 focus-visible:ring-white/40 active:cursor-grabbing active:ring-white/25" />
  </SliderP.Root>
)
export const Progress = ({ value, className, hot }) => (
  <ProgressP.Root value={value} className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-white/8', className)}>
    <ProgressP.Indicator className={cn('h-full rounded-full transition-[width,background-color] duration-500 ease-[var(--ease-out)]', hot ? 'bg-bad' : 'bg-fg')} style={{ width: `${value}%` }} />
  </ProgressP.Root>
)

/* ------------------------------ Avatar / Separator / Tooltip ------------------------------ */
export const Avatar = ({ name = 'S', className }) => (
  <AvatarP.Root className={cn('inline-grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-line-2 bg-white/5', className)}>
    <AvatarP.Fallback className="text-xs font-medium text-fg">{name[0]}</AvatarP.Fallback>
  </AvatarP.Root>
)
export const Separator = ({ className, ...p }) => <SepP.Root className={cn('h-px w-full bg-line', className)} {...p} />
export const Tooltip = ({ content, children }) => (
  <TipP.Root>
    <TipP.Trigger asChild>{children}</TipP.Trigger>
    <TipP.Portal>
      <TipP.Content sideOffset={6} className="anim-menu z-50 rounded-md border border-line-2 bg-card px-2.5 py-1.5 text-xs text-fg shadow-lg">
        {content}
      </TipP.Content>
    </TipP.Portal>
  </TipP.Root>
)

/* ------------------------------ Dropdown ------------------------------ */
export const Menu = MenuP.Root
export const MenuTrigger = MenuP.Trigger
export const MenuContent = ({ className, ...p }) => (
  <MenuP.Portal>
    <MenuP.Content align="end" sideOffset={6} className={cn('anim-menu z-50 min-w-44 rounded-lg border border-line-2 bg-card p-1 shadow-xl shadow-black/50', className)} {...p} />
  </MenuP.Portal>
)
export const MenuItem = ({ className, danger, ...p }) => (
  <MenuP.Item className={cn('flex h-8 cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 text-[13px] outline-none data-[highlighted]:bg-hover [&_svg]:size-4', danger ? 'text-bad' : 'text-mute data-[highlighted]:text-fg', className)} {...p} />
)
export const MenuLabel = (p) => <MenuP.Label className="px-2.5 py-1.5 text-[11px] uppercase tracking-wider text-dim" {...p} />
export const MenuSep = () => <MenuP.Separator className="my-1 h-px bg-line" />

/* ------------------------------ Toggle group (segmented) ------------------------------ */
/* The selected pill is one element that slides between options (items keep their own width). */
export const Segmented = ({ className, options, ...p }) => {
  const ref = React.useRef(null)
  const box = useSlideIndicator(ref)
  return (
    <ToggleP.Root ref={ref} type="single" className={cn('relative inline-flex rounded-lg border border-line p-0.5', className)} {...p}>
      <span aria-hidden className="pointer-events-none absolute left-0 top-0 rounded-md bg-white/[0.11]" style={box ? { width: box.width, height: box.height, transform: `translate(${box.left}px, ${box.top}px)`, opacity: 1, transition: 'transform 200ms var(--ease-out), width 200ms var(--ease-out), opacity 120ms' } : { opacity: 0 }} />
      {options.map(([v, l]) => (
        <ToggleP.Item key={v} value={v} className="relative z-10 h-7 rounded-md px-3 text-[12.5px] text-dim transition-colors duration-150 hover:text-fg data-[state=on]:text-fg">
          {l}
        </ToggleP.Item>
      ))}
    </ToggleP.Root>
  )
}

/* ------------------------------ Radio cards ------------------------------ */
export const RadioGroup = RadioP.Root
export const RadioCard = ({ className, children, ...p }) => (
  <RadioP.Item className={cn('relative rounded-xl border border-line bg-card p-5 text-left transition-[border-color,background-color,box-shadow] duration-[180ms] ease-[var(--ease-std)] hover:border-line-2 active:bg-white/[0.02] data-[state=checked]:border-fg/70 data-[state=checked]:bg-white/[0.03] data-[state=checked]:ring-1 data-[state=checked]:ring-white/30', className)} {...p}>
    {children}
    <RadioP.Indicator className="absolute right-4 top-4 grid size-5 place-items-center rounded-full bg-fg text-black data-[state=checked]:animate-[badge-pop_180ms_var(--ease-out)]"><Check className="size-3" /></RadioP.Indicator>
  </RadioP.Item>
)

/* ------------------------------ Table ------------------------------ */
export const Table = ({ className, ...p }) => <div className="overflow-x-auto"><table className={cn('w-full text-[13.5px]', className)} {...p} /></div>
export const Th = ({ className, ...p }) => <th className={cn('h-10 whitespace-nowrap border-b border-line px-5 text-left font-mono text-[10.5px] font-normal uppercase tracking-[.08em] text-dim', className)} {...p} />
export const Td = ({ className, ...p }) => <td className={cn('whitespace-nowrap border-b border-line/60 px-5 py-3.5 text-mute', className)} {...p} />
export const Tr = ({ className, ...p }) => <tr className={cn('transition-colors hover:bg-hover [&:last-child_td]:border-b-0', p.onClick && 'cursor-pointer', className)} {...p} />

/* ------------------------------ Mobile sheet (left drawer) ------------------------------ */
/* Stays mounted for the exit animation, closes on Escape, locks body scroll, respects the safe area. */
export function MobileSheet({ open, onClose, children, className }) {
  const [mounted, setMounted] = React.useState(open)
  React.useEffect(() => {
    if (open) { setMounted(true); return }
    const t = setTimeout(() => setMounted(false), 200)
    return () => clearTimeout(t)
  }, [open])
  const panel = React.useRef(null)
  const onCloseRef = React.useRef(onClose)
  onCloseRef.current = onClose
  /* focus management: remember the opener, move focus into the panel, keep Tab inside, hand focus back on close */
  React.useEffect(() => {
    if (!open || !mounted) return  // the panel only exists once `mounted` flips, one render after `open`
    const opener = document.activeElement
    const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'
    const raf = requestAnimationFrame(() => {
      const el = panel.current
      if (el && !el.contains(document.activeElement)) ([...el.querySelectorAll('[aria-current="page"]')].pop() || el.querySelector(FOCUSABLE) || el).focus({ preventScroll: true })
    })
    const k = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current(); return }
      if (e.key !== 'Tab' || !panel.current) return
      const f = [...panel.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null)
      if (!f.length) { e.preventDefault(); panel.current.focus(); return }
      const first = f[0], last = f[f.length - 1], a = document.activeElement
      if (e.shiftKey && (a === first || !panel.current.contains(a))) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && (a === last || !panel.current.contains(a))) { e.preventDefault(); first.focus() }
    }
    addEventListener('keydown', k)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(raf); removeEventListener('keydown', k); document.body.style.overflow = prev
      if (opener && opener.isConnected && opener !== document.body) opener.focus({ preventScroll: true })
    }
  }, [open, mounted])
  if (!mounted) return null
  const state = open ? 'open' : 'closed'
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div data-state={state} className="anim-overlay absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <aside ref={panel} tabIndex={-1} data-state={state} role="dialog" aria-modal="true" aria-label="Navigation" className={cn('anim-slide-left absolute inset-y-0 left-0 flex outline-none w-[min(300px,85vw)] flex-col border-r border-line bg-[#0b0b0d]', className)} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>{children}</aside>
    </div>
  )
}

/* ------------------------------ Page header ------------------------------ */
export const PageHeader = ({ title, description, children }) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-[13.5px] text-dim">{description}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </div>
)

export const Stat = ({ label, value, hint, delta, tone }) => (
  <Card className="flex flex-col gap-4 p-5 transition-colors hover:border-line-2">
    <div className="font-mono text-[11px] uppercase tracking-[.08em] text-dim">{label}</div>
    <div className="flex h-[34px] items-center"><DotNum text={value} height={34} /></div>
    <div className="flex items-center justify-between text-[12.5px] text-mute">
      <span>{hint}</span>
      {delta && <span className={cn('rounded-full border px-2 py-0.5 font-mono text-[10.5px]', tone === 'bad' ? 'border-bad/30 text-bad' : 'border-ok/30 text-ok')}>{delta}</span>}
    </div>
  </Card>
)

/* Library-style chip tabs with counts: [value, label, count] */
export const ChipTabs = ({ value, onValueChange, items }) => (
  <ToggleP.Root type="single" value={value} onValueChange={(v) => v && onValueChange(v)} className="flex flex-wrap gap-2">
    {items.map(([v, l, n]) => (
      <ToggleP.Item key={v} value={v} className="flex h-8 items-center gap-2 rounded-lg bg-white/[0.06] px-3 text-[13px] font-medium text-fg/75 transition-colors hover:bg-white/10 data-[state=on]:bg-fg data-[state=on]:text-black">
        {l}
        {n != null && <span className="font-mono text-[11px] opacity-60">{n}</span>}
      </ToggleP.Item>
    ))}
  </ToggleP.Root>
)

/* Extensions-style big heading tabs: Plugins | Connectors | Skills */
export const BigTabs = ({ value, onValueChange, items }) => (
  <div className="flex gap-6">
    {items.map(([v, l]) => (
      <button key={v} onClick={() => onValueChange(v)} className={cn('text-[28px] font-semibold tracking-tight transition-colors', value === v ? 'text-fg' : 'text-white/30 hover:text-white/55')}>{l}</button>
    ))}
  </div>
)

export const IconTile = ({ children, className }) => (
  <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg border border-line-2 bg-white/[0.04] text-fg/80 [&_svg]:size-[17px]', className)}>{children}</span>
)

export const EmptyState = ({ icon, title, children, actions }) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-2 bg-black px-6 py-14 text-center">
    <IconTile className="size-11">{icon}</IconTile>
    <div className="text-[14px] font-semibold">{title}</div>
    <p className="max-w-sm text-[13px] leading-relaxed text-mute">{children}</p>
    {actions && <div className="mt-1 flex gap-2">{actions}</div>}
  </div>
)

export const SectionHead = ({ title, count }) => (
  <h2 className="mb-3 flex items-baseline gap-2 text-[15px] font-semibold tracking-tight">{title}{count != null && <span className="font-mono text-[11px] font-normal text-dim">{count}</span>}</h2>
)

export const statusTone = { running: 'ok', stopped: 'neutral', restarting: 'warn', paid: 'ok', unpaid: 'warn', overdue: 'bad', open: 'info', answered: 'ok', closed: 'neutral', available: 'ok', taken: 'neutral', active: 'ok' }
export const StatusBadge = ({ status }) => <Badge tone={statusTone[status] || 'neutral'}>{status[0].toUpperCase() + status.slice(1)}</Badge>
