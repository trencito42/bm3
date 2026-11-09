import * as React from 'react'
import * as CheckP from '@radix-ui/react-checkbox'
import * as SelectP from '@radix-ui/react-select'
import * as PopP from '@radix-ui/react-popover'
import * as CtxP from '@radix-ui/react-context-menu'
import * as HoverP from '@radix-ui/react-hover-card'
import * as AlertP from '@radix-ui/react-alert-dialog'
import { Command } from 'cmdk'
import { toast } from 'sonner'
import { Eye, EyeOff, AlertTriangle, ArrowDown, ArrowUp, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Info, CheckCircle2, XCircle, X, Minus } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, fieldBase } from './ui.jsx'

/* ---------- FormField ---------- */
export const FormField = ({ label, hint, error, required, optional, children, className }) => (
  <div className={cn('space-y-1.5', className)}>
    <div className="flex items-baseline justify-between gap-2">
      <label className="text-[12.5px] font-medium text-fg/85">{label}{required && <span className="ml-0.5 text-bad">*</span>}</label>
      {optional && <span className="font-mono text-[10.5px] uppercase tracking-[.06em] text-dim">Optional</span>}
    </div>
    {children}
    {error ? <p className="flex items-center gap-1.5 text-[12px] text-bad"><XCircle className="size-3.5" />{error}</p> : hint && <p className="text-[12px] text-dim">{hint}</p>}
  </div>
)
export const inputCls = (err) => cn('flex h-9 items-center', fieldBase, err && 'border-bad/60 hover:border-bad/70 focus:border-bad focus:ring-bad/20')

/* ---------- Checkbox / Radio-ish ---------- */
export const Checkbox = ({ className, ...p }) => (
  <CheckP.Root className={cn('grid size-4 shrink-0 place-items-center rounded border border-line-2 bg-transparent transition-colors data-[state=checked]:border-fg data-[state=checked]:bg-fg data-[state=indeterminate]:border-fg data-[state=indeterminate]:bg-fg', className)} {...p}>
    <CheckP.Indicator className="text-black">{p.checked === 'indeterminate' ? <Minus className="size-3" /> : <Check className="size-3" />}</CheckP.Indicator>
  </CheckP.Root>
)

/* ---------- Select ---------- */
export function Select({ value, onValueChange, options, placeholder = 'Select…', className, disabled }) {
  return (
    <SelectP.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectP.Trigger className={cn(inputCls(), 'justify-between gap-2 data-[placeholder]:text-dim', className)}>
        <SelectP.Value placeholder={placeholder} /><SelectP.Icon><ChevronDown className="size-4 text-dim" /></SelectP.Icon>
      </SelectP.Trigger>
      <SelectP.Portal>
        <SelectP.Content position="popper" sideOffset={6} className="anim-menu z-50 min-w-[var(--radix-select-trigger-width)] rounded-lg border border-line-2 bg-card p-1 shadow-xl shadow-black/50">
          <SelectP.Viewport>
            {options.map((o) => {
              const [v, l] = Array.isArray(o) ? o : [o, o]
              return (
                <SelectP.Item key={v} value={v} className="relative flex h-8 cursor-pointer select-none items-center rounded-md pl-2.5 pr-8 text-[13px] text-mute outline-none data-[highlighted]:bg-hover data-[highlighted]:text-fg">
                  <SelectP.ItemText>{l}</SelectP.ItemText>
                  <SelectP.ItemIndicator className="absolute right-2.5"><Check className="size-3.5" /></SelectP.ItemIndicator>
                </SelectP.Item>
              )
            })}
          </SelectP.Viewport>
        </SelectP.Content>
      </SelectP.Portal>
    </SelectP.Root>
  )
}

/* ---------- Popover / Combobox / MultiSelect ---------- */
export const Popover = PopP.Root
export const PopoverTrigger = PopP.Trigger
export const PopoverContent = ({ className, ...p }) => (
  <PopP.Portal><PopP.Content sideOffset={6} className={cn('anim-menu z-50 rounded-xl border border-line-2 bg-card p-3 shadow-xl shadow-black/50 outline-none', className)} {...p} /></PopP.Portal>
)
export function Combobox({ value, onChange, options, placeholder = 'Search…', multi = false, className }) {
  const [open, setOpen] = React.useState(false)
  const sel = multi ? value || [] : value
  const toggle = (v) => (multi ? onChange(sel.includes(v) ? sel.filter((x) => x !== v) : [...sel, v]) : (onChange(v), setOpen(false)))
  const label = multi ? (sel.length ? `${sel.length} selected` : null) : options.find((o) => o === value || o[0] === value)?.[1] ?? value
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={cn(inputCls(), 'justify-between gap-2 text-left', !label && 'text-dim', className)}>
          <span className="truncate">{label || placeholder}</span><ChevronDown className="size-4 shrink-0 text-dim" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0" align="start">
        <Command>
          <Command.Input placeholder="Filter…" className="!h-10 !text-[13px]" />
          <Command.List className="!max-h-56">
            <Command.Empty>No match.</Command.Empty>
            {options.map((o) => {
              const [v, l] = Array.isArray(o) ? o : [o, o]
              const on = multi ? sel.includes(v) : sel === v
              return <Command.Item key={v} value={l} onSelect={() => toggle(v)}><span className="flex-1">{l}</span>{on && <Check className="size-3.5" />}</Command.Item>
            })}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/* ---------- Context menu / HoverCard / AlertDialog ---------- */
export const ContextMenu = CtxP.Root
export const ContextTrigger = CtxP.Trigger
export const ContextContent = ({ className, ...p }) => (
  <CtxP.Portal><CtxP.Content className={cn('anim-menu z-50 min-w-48 rounded-lg border border-line-2 bg-card p-1 shadow-xl shadow-black/50', className)} {...p} /></CtxP.Portal>
)
export const ContextItem = ({ className, danger, ...p }) => (
  <CtxP.Item className={cn('flex h-8 cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 text-[13px] outline-none data-[highlighted]:bg-hover [&_svg]:size-4', danger ? 'text-bad' : 'text-mute data-[highlighted]:text-fg', className)} {...p} />
)
export const ContextSep = () => <CtxP.Separator className="my-1 h-px bg-line" />
export const HoverCard = ({ trigger, children, className }) => (
  <HoverP.Root openDelay={150}>
    <HoverP.Trigger asChild>{trigger}</HoverP.Trigger>
    <HoverP.Portal><HoverP.Content sideOffset={8} className={cn('anim-menu z-50 w-72 rounded-xl border border-line-2 bg-card p-4 shadow-xl shadow-black/50', className)}>{children}</HoverP.Content></HoverP.Portal>
  </HoverP.Root>
)
export function Confirm({ trigger, title, description, confirmLabel = 'Confirm', danger, onConfirm, requireText }) {
  const [txt, setTxt] = React.useState('')
  return (
    <AlertP.Root onOpenChange={() => setTxt('')}>
      <AlertP.Trigger asChild>{trigger}</AlertP.Trigger>
      <AlertP.Portal>
        <AlertP.Overlay className="anim-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-[3px]" />
        <AlertP.Content className="anim-pop fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line-2 bg-card p-6 shadow-2xl outline-none">
          <div className={cn('mb-4 grid size-10 place-items-center rounded-full', danger ? 'bg-bad/10 text-bad' : 'bg-white/[0.06] text-fg')}><AlertTriangle className="size-5" /></div>
          <AlertP.Title className="text-base font-semibold">{title}</AlertP.Title>
          <AlertP.Description className="mt-1.5 text-[13px] leading-relaxed text-mute">{description}</AlertP.Description>
          {requireText && <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={`Type ${requireText} to confirm`} className={cn(inputCls(), 'mt-4 font-mono')} />}
          <div className="mt-6 flex justify-end gap-2">
            <AlertP.Cancel asChild><Button variant="outline">Cancel</Button></AlertP.Cancel>
            <AlertP.Action asChild><Button variant={danger ? 'destructive' : 'default'} className={danger ? '!bg-bad !text-black hover:!bg-bad/85' : ''} disabled={requireText && txt !== requireText} onClick={onConfirm}>{confirmLabel}</Button></AlertP.Action>
          </div>
        </AlertP.Content>
      </AlertP.Portal>
    </AlertP.Root>
  )
}

/* ---------- PasswordInput: the eye never steals focus, so the caret stays where it was ---------- */
export const PasswordInput = React.forwardRef(({ className, ...p }, ref) => {
  const [show, setShow] = React.useState(false)
  return (
    <div className="relative">
      <input ref={ref} type={show ? 'text' : 'password'} autoComplete="current-password" className={cn(inputCls(), 'pr-10', className)} {...p} />
      <button type="button" aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} onMouseDown={(e) => e.preventDefault()} onClick={() => setShow((s) => !s)} className="absolute right-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-dim transition-colors duration-150 hover:text-fg">
        <Eye className={cn('absolute size-4 transition-[opacity,transform] duration-150', show ? 'scale-75 opacity-0' : 'opacity-100')} />
        <EyeOff className={cn('absolute size-4 transition-[opacity,transform] duration-150', show ? 'opacity-100' : 'scale-75 opacity-0')} />
      </button>
    </div>
  )
})

/* ---------- Copy ---------- */
export const CopyButton = ({ value, className }) => {
  const [st, setSt] = React.useState('idle') // idle | ok | fail
  const t = React.useRef()
  React.useEffect(() => () => clearTimeout(t.current), [])
  const copy = async () => {
    let good = false
    try { await navigator.clipboard.writeText(value); good = true } catch {
      /* insecure context / permission denied: legacy fallback through a hidden textarea */
      try {
        const ta = document.createElement('textarea')
        ta.value = value; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
        const prev = document.activeElement
        document.body.appendChild(ta); ta.select(); good = document.execCommand('copy'); ta.remove(); prev?.focus?.({ preventScroll: true })
      } catch { good = false }
    }
    setSt(good ? 'ok' : 'fail')
    clearTimeout(t.current); t.current = setTimeout(() => setSt('idle'), good ? 1400 : 2000)
  }
  const ok = st === 'ok', fail = st === 'fail'
  /* the confirmation lives on the button itself (icon crossfade + colour), so no toast competes with it;
     the status text is announced through a polite live region */
  return (
    <button aria-label="Copy" onClick={copy} className={cn('relative grid size-7 place-items-center rounded-md transition-colors duration-150 hover:bg-hover active:bg-white/10', ok ? 'text-ok' : fail ? 'text-bad' : 'text-dim hover:text-fg', className)}>
      <Copy className={cn('absolute size-3.5 transition-[opacity,transform] duration-150', ok ? 'scale-50 opacity-0' : 'scale-100 opacity-100')} />
      <Check className={cn('absolute size-3.5 transition-[opacity,transform] duration-150', ok ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
      <span role="status" aria-live="polite" className="sr-only">{ok ? 'Copied' : fail ? 'Copy failed' : ''}</span>
    </button>
  )
}
export const CopyValue = ({ value, mask, label }) => {
  const [show, setShow] = React.useState(!mask)
  return (
    <div className="flex h-9 items-center gap-1 rounded-lg border border-line-2 bg-black/30 pl-3 pr-1">
      {label && <span className="mr-2 font-mono text-[10.5px] uppercase tracking-[.06em] text-dim">{label}</span>}
      <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{show ? value : '•'.repeat(Math.min(value.length, 22))}</span>
      {mask && <button onClick={() => setShow((s) => !s)} className="px-2 text-[11px] text-dim hover:text-fg">{show ? 'Hide' : 'Show'}</button>}
      <CopyButton value={value} />
    </div>
  )
}
export const CodeBlock = ({ code, lang }) => (
  <div className="overflow-hidden rounded-lg border border-line-2 bg-black">
    <div className="flex items-center justify-between border-b border-line px-3 py-1.5"><span className="font-mono text-[10.5px] uppercase tracking-[.06em] text-dim">{lang}</span><CopyButton value={code} /></div>
    <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-6 text-fg/80">{code}</pre>
  </div>
)

/* ---------- Feedback ---------- */
export const Skeleton = ({ className }) => <div className={cn('animate-pulse rounded-md bg-white/[0.06]', className)} />
const ALERT = { info: [Info, 'border-info/25 bg-info/[0.06] text-info'], ok: [CheckCircle2, 'border-ok/25 bg-ok/[0.06] text-ok'], warn: [AlertTriangle, 'border-warn/25 bg-warn/[0.06] text-warn'], bad: [XCircle, 'border-bad/25 bg-bad/[0.06] text-bad'] }
export const InlineAlert = ({ tone = 'info', title, children, action }) => {
  const [Icon, cls] = ALERT[tone]
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border p-3.5', cls)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1 text-[13px]"><div className="font-medium text-fg">{title}</div>{children && <div className="mt-0.5 text-mute">{children}</div>}</div>
      {action}
    </div>
  )
}

/* ---------- Navigation bits ---------- */
export const Breadcrumbs = ({ items }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-dim">
    {items.map((it, i) => (<React.Fragment key={i}>{i > 0 && <ChevronRight className="size-3.5 text-white/20" />}<span className={i === items.length - 1 ? 'text-fg' : 'cursor-pointer hover:text-fg'}>{it}</span></React.Fragment>))}
  </nav>
)
export function Stepper({ steps, current, onStep }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <li>
            <button onClick={() => i <= current && onStep?.(i)} className={cn('flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[12.5px] transition-colors', i === current ? 'bg-white/[0.08] text-fg' : i < current ? 'text-fg/80 hover:bg-hover' : 'text-dim')}>
              <span className={cn('grid size-5 place-items-center rounded-full font-mono text-[10.5px]', i < current ? 'bg-fg text-black' : i === current ? 'border border-fg text-fg' : 'border border-line-2')}>{i < current ? <Check className="size-3" /> : i + 1}</span><span className={i === current ? '' : 'hidden sm:inline'}>{s}</span>
            </button>
          </li>
          {i < steps.length - 1 && <span className="h-px min-w-2 flex-1 bg-line" />}
        </React.Fragment>
      ))}
    </ol>
  )
}
export const Pagination = ({ page, pages, onPage }) => (
  <div className="flex items-center gap-1">
    <Button variant="ghost" size="icon" className="size-8" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous"><ChevronLeft /></Button>
    {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} onClick={() => onPage(n)} className={cn('size-8 rounded-md font-mono text-[12px] transition-colors', n === page ? 'bg-fg text-black' : 'text-mute hover:bg-hover')}>{n}</button>)}
    <Button variant="ghost" size="icon" className="size-8" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next"><ChevronRight /></Button>
  </div>
)

/* ---------- Special inputs ---------- */
export function OTPInput({ length = 6, value, onChange }) {
  const refs = React.useRef([])
  const v = (value || '').padEnd(length, ' ').split('')
  const set = (i, ch) => { const a = v.slice(); a[i] = ch || ' '; onChange(a.join('').trimEnd()); if (ch && refs.current[i + 1]) refs.current[i + 1].focus() }
  return (
    <div className="flex gap-1.5 sm:gap-2">
      {v.map((c, i) => (
        <input key={i} ref={(el) => (refs.current[i] = el)} value={c.trim()} inputMode="numeric" maxLength={1} aria-label={`Digit ${i + 1}`}
          onChange={(e) => set(i, e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => { if (e.key === 'Backspace' && !c.trim() && refs.current[i - 1]) refs.current[i - 1].focus() }}
          className="aspect-square h-auto min-w-0 max-w-11 flex-1 rounded-lg border border-line-2 bg-transparent text-center font-mono text-lg outline-none transition-colors focus:border-fg focus:ring-2 focus:ring-white/10" />
      ))}
    </div>
  )
}
export const NumberStepper = ({ value, onChange, min = 0, max = 99, unit, step = 1 }) => (
  <div className="inline-flex h-9 items-center rounded-lg border border-line-2">
    <button aria-label="Decrease" disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))} className="grid size-9 place-items-center text-mute transition-colors hover:text-fg disabled:opacity-30"><Minus className="size-3.5" /></button>
    <span className="min-w-14 text-center font-mono text-[13px] tabular-nums">{value}{unit && <span className="ml-1 text-dim">{unit}</span>}</span>
    <button aria-label="Increase" disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))} className="grid size-9 place-items-center text-mute transition-colors hover:text-fg disabled:opacity-30"><span className="text-base leading-none">+</span></button>
  </div>
)
export function TagInput({ value, onChange, placeholder }) {
  const [t, setT] = React.useState('')
  const add = () => { const x = t.trim(); if (x && !value.includes(x)) onChange([...value, x]); setT('') }
  return (
    <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-line-2 px-2 py-1.5 focus-within:border-white/40 focus-within:ring-2 focus-within:ring-white/10">
      {value.map((x) => <span key={x} className="inline-flex h-6 items-center gap-1 rounded-md bg-white/[0.08] pl-2 pr-1 font-mono text-[11.5px]">{x}<button aria-label={`Remove ${x}`} onClick={() => onChange(value.filter((y) => y !== x))} className="grid size-4 place-items-center rounded text-dim hover:text-fg"><X className="size-3" /></button></span>)}
      <input value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } if (e.key === 'Backspace' && !t && value.length) onChange(value.slice(0, -1)) }} placeholder={value.length ? '' : placeholder} className="min-w-20 flex-1 bg-transparent px-1 text-[13px] outline-none placeholder:text-dim" />
    </div>
  )
}

/* ---------- Generic sortable DataTable ---------- */
export function DataTable({ columns, rows, sortKey, sortDir, onSort, selectable, selected = [], onSelect, onRowClick, dense, empty }) {
  const all = rows.length > 0 && rows.every((r) => selected.includes(r.id))
  const some = rows.some((r) => selected.includes(r.id))
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13.5px]">
        <thead>
          <tr>
            {selectable && <th className="w-10 border-b border-line px-4"><Checkbox checked={all ? true : some ? 'indeterminate' : false} onCheckedChange={(v) => onSelect(v ? rows.map((r) => r.id) : [])} aria-label="Select all" /></th>}
            {columns.map((c) => (
              <th key={c.key} aria-sort={sortKey === c.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined} className={cn('h-10 whitespace-nowrap border-b border-line px-4 text-left font-mono text-[10.5px] font-normal uppercase tracking-[.08em] text-dim', c.align === 'right' && 'text-right', c.className)}>
                {c.sortable ? <button onClick={() => onSort?.(c.key)} className={cn('group inline-flex items-center gap-1 uppercase transition-colors hover:text-fg', sortKey === c.key && 'text-fg', c.align === 'right' && 'flex-row-reverse')}>{c.label}<span className="grid size-3 place-items-center">{sortKey === c.key ? (sortDir === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowDown className="size-3 opacity-0 transition-opacity duration-150 group-hover:opacity-40" />}</span></button> : c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length + 1} className="py-12 text-center text-dim">{empty || 'No results'}</td></tr>}
          {rows.map((r) => (
            <tr key={r.id} onClick={() => onRowClick?.(r)} className={cn('transition-colors duration-100 hover:bg-hover active:bg-white/[0.09] [&:last-child_td]:border-b-0', onRowClick && 'cursor-pointer', selected.includes(r.id) && 'bg-white/[0.05] [&>td:first-child]:shadow-[inset_2px_0_0_var(--color-fg)]')}>
              {selectable && <td className="border-b border-line/60 px-4" onClick={(e) => e.stopPropagation()}><Checkbox checked={selected.includes(r.id)} onCheckedChange={(v) => onSelect(v ? [...selected, r.id] : selected.filter((x) => x !== r.id))} aria-label="Select row" /></td>}
              {columns.map((c) => <td key={c.key} className={cn('whitespace-nowrap border-b border-line/60 px-4 text-mute', dense ? 'py-2' : 'py-3.5', c.align === 'right' && 'text-right', c.cell && 'text-fg', c.className)}>{c.cell ? c.cell(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
