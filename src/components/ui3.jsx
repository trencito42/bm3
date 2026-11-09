/* Extra primitives & product widgets: date pickers, async combobox, unit/percent inputs, data grid,
   folder tree, code editor, permissions, plan comparison, selectors. All data is MOCK. */
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Calendar as CalIcon, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, File as FileIcon, Folder, FolderOpen, Loader2, Minus, Plus, Search, X, Lock } from 'lucide-react'
import { Button, Badge, Switch, IconTile } from './ui.jsx'
import { Popover, PopoverContent, PopoverTrigger, inputCls, Checkbox } from './ui2.jsx'
import { cn, sleep } from '../lib/utils'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const fmt = (d) => d ? `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}` : ''

/* ---------------- Calendar (single / range) ---------------- */
export function Calendar({ value, onChange, range, start, end, onRange, minDate }) {
  const [view, setView] = useState(() => { const d = (range ? start : value) || new Date(2026, 10, 8); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const first = view.getDay() === 0 ? 6 : view.getDay() - 1 /* Monday-first */
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))]
  const today = new Date(2026, 10, 8)
  const pick = (d) => {
    if (!range) return onChange(d)
    if (!start || (start && end)) return onRange(d, null)
    return d < start ? onRange(d, start) : onRange(start, d)
  }
  return (
    <div className="w-[280px] select-none">
      <div className="mb-3 flex items-center justify-between">
        <button aria-label="Previous month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="grid size-8 place-items-center rounded-md text-mute hover:bg-hover hover:text-fg"><ChevronLeft className="size-4" /></button>
        <div className="text-[13.5px] font-medium">{MONTHS[view.getMonth()]} {view.getFullYear()}</div>
        <button aria-label="Next month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="grid size-8 place-items-center rounded-md text-mute hover:bg-hover hover:text-fg"><ChevronRight className="size-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="pb-1 font-mono text-[10px] text-dim">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const sel = range ? sameDay(d, start) || sameDay(d, end) : sameDay(d, value)
          const inRange = range && start && end && d > start && d < end
          const dis = minDate && d < minDate
          return (
            <button key={i} disabled={dis} onClick={() => pick(d)} className={cn('mx-auto grid size-9 w-full place-items-center text-[13px] tabular-nums transition-colors disabled:opacity-25', sel ? 'rounded-lg bg-fg font-semibold text-black' : inRange ? 'bg-white/[0.08] text-fg' : 'rounded-lg text-mute hover:bg-hover hover:text-fg', sameDay(d, today) && !sel && 'text-fg ring-1 ring-inset ring-line-2')}>{d.getDate()}</button>
          )
        })}
      </div>
    </div>
  )
}
const Trigger = forwardRef(({ children, placeholder, icon: I = CalIcon, ...p }, ref) => (
  <button ref={ref} {...p} className={cn(inputCls(), 'justify-between gap-2 text-left', !children && 'text-dim')}><span className="flex items-center gap-2 truncate"><I className="size-4 shrink-0 text-dim" />{children || placeholder}</span><ChevronDown className="size-4 shrink-0 text-dim" /></button>
))
export function DatePicker({ value, onChange, placeholder = 'Pick a date' }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Trigger placeholder={placeholder}>{fmt(value)}</Trigger></PopoverTrigger>
      <PopoverContent align="start"><Calendar value={value} onChange={(d) => { onChange(d); setOpen(false) }} /></PopoverContent>
    </Popover>
  )
}
export function DateRangePicker({ start, end, onChange }) {
  const presets = [['Last 7 days', 7], ['Last 30 days', 30], ['Last 90 days', 90]]
  return (
    <Popover>
      <PopoverTrigger asChild><Trigger placeholder="Pick a range">{start ? `${fmt(start)}${end ? ' → ' + fmt(end) : ' → …'}` : ''}</Trigger></PopoverTrigger>
      <PopoverContent align="start" className="flex gap-4">
        <div className="hidden w-32 flex-col gap-1 border-r border-line pr-3 sm:flex">{presets.map(([l, n]) => <button key={l} onClick={() => { const e = new Date(2026, 10, 8); onChange(new Date(e.getTime() - n * 864e5), e) }} className="rounded-md px-2 py-1.5 text-left text-[12.5px] text-mute hover:bg-hover hover:text-fg">{l}</button>)}</div>
        <Calendar range start={start} end={end} onRange={onChange} />
      </PopoverContent>
    </Popover>
  )
}
export function DateTimePicker({ value, onChange }) {
  const [h, setH] = useState('02'), [m, setM] = useState('00')
  const out = value ? `${fmt(value)} · ${h}:${m}` : ''
  return (
    <Popover>
      <PopoverTrigger asChild><Trigger placeholder="Pick date & time" icon={Clock}>{out}</Trigger></PopoverTrigger>
      <PopoverContent align="start" className="space-y-3">
        <Calendar value={value} onChange={onChange} />
        <div className="flex items-center gap-2 border-t border-line pt-3"><Clock className="size-4 text-dim" /><input aria-label="Hour" value={h} onChange={(e) => setH(e.target.value.replace(/\D/g, '').slice(0, 2))} className={cn(inputCls(), 'w-14 text-center font-mono')} /><span>:</span><input aria-label="Minute" value={m} onChange={(e) => setM(e.target.value.replace(/\D/g, '').slice(0, 2))} className={cn(inputCls(), 'w-14 text-center font-mono')} /><span className="ml-auto font-mono text-[11px] text-dim">UTC</span></div>
      </PopoverContent>
    </Popover>
  )
}

/* ---------------- AsyncCombobox (simulated latency) ---------------- */
const DOMAINS = ['blipmade.app', 'blipmade.cloud', 'blipmade.dev', 'northwind.io', 'studio-ap.ro', 'weber.dev', 'rossi.it', 'mensah.co']
export function AsyncCombobox({ placeholder = 'Search domains…' }) {
  const [q, setQ] = useState('')
  const [res, setRes] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState(null)
  const id = useRef(0)
  useEffect(() => {
    if (!open) return
    const my = ++id.current
    setLoading(true)
    sleep(450).then(() => { if (my === id.current) { setRes(DOMAINS.filter((d) => d.includes(q.toLowerCase()))); setLoading(false) } })
  }, [q, open])
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><button className={cn(inputCls(), 'justify-between gap-2 text-left', !picked && 'text-dim')}><span className="truncate">{picked || placeholder}</span><Search className="size-4 text-dim" /></button></PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-64 p-0">
        <div className="border-b border-line p-2"><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type to search (simulated 450 ms latency)" className="h-8 w-full bg-transparent px-2 text-[13px] outline-none placeholder:text-dim" /></div>
        <div className="max-h-56 overflow-y-auto p-1">
          {loading ? <div className="flex items-center gap-2 px-3 py-6 text-[13px] text-dim"><Loader2 className="size-4 animate-spin" />Searching…</div>
            : res.length === 0 ? <div className="px-3 py-6 text-center text-[13px] text-dim">No domains match “{q}”</div>
            : res.map((d) => <button key={d} onClick={() => { setPicked(d); setOpen(false) }} className="flex h-8 w-full items-center justify-between rounded-md px-2.5 text-[13px] text-mute hover:bg-hover hover:text-fg">{d}{picked === d && <Check className="size-3.5" />}</button>)}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ---------------- Unit stepper & percent ---------------- */
export function UnitStepper({ value, onChange, unit, units, min = 1, max = 1024 }) {
  return (
    <div className="inline-flex h-9 items-center rounded-lg border border-line-2">
      <button aria-label="Decrease" onClick={() => onChange({ v: Math.max(min, value.v - 1), u: value.u })} className="grid size-9 place-items-center text-mute hover:text-fg"><Minus className="size-3.5" /></button>
      <input aria-label="Amount" value={value.v} onChange={(e) => onChange({ v: Math.min(max, +e.target.value.replace(/\D/g, '') || min), u: value.u })} className="w-12 bg-transparent text-center font-mono text-[13px] tabular-nums outline-none" />
      <select aria-label="Unit" value={value.u} onChange={(e) => onChange({ v: value.v, u: e.target.value })} className="h-full border-l border-line-2 bg-transparent px-2 font-mono text-[12px] text-mute outline-none">{units.map((u) => <option key={u} className="bg-card">{u}</option>)}</select>
      <button aria-label="Increase" onClick={() => onChange({ v: Math.min(max, value.v + 1), u: value.u })} className="grid size-9 place-items-center border-l border-line-2 text-mute hover:text-fg"><Plus className="size-3.5" /></button>
    </div>
  )
}
export const PercentInput = ({ value, onChange }) => (
  <div className="relative w-32"><input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, '').slice(0, 5))} className={cn(inputCls(+value > 100), 'pr-8 text-right font-mono')} aria-label="Percent" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-dim">%</span></div>
)

/* ---------------- DataGrid (editable cells, keyboard nav) ---------------- */
export function DataGrid({ initial }) {
  const [rows, setRows] = useState(initial)
  const [cell, setCell] = useState([0, 0])
  const [edit, setEdit] = useState(false)
  const cols = ['Product', 'Region', 'Monthly', 'Stock']
  const keys = ['p', 'r', 'm', 's']
  const move = (e) => {
    if (edit) return
    const [r, c] = cell
    const k = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key]
    if (k) { e.preventDefault(); setCell([Math.min(rows.length - 1, Math.max(0, r + k[0])), Math.min(3, Math.max(0, c + k[1]))]) }
    if (e.key === 'Enter') { e.preventDefault(); setEdit(true) }
  }
  return (
    <div tabIndex={0} onKeyDown={move} className="overflow-x-auto rounded-xl border border-line-2 outline-none focus:ring-2 focus:ring-white/10">
      <table className="w-full min-w-[480px] border-collapse font-mono text-[12.5px]">
        <thead><tr><th className="w-10 border-b border-r border-line bg-white/[0.03] px-2 py-2 text-dim" />{cols.map((c, i) => <th key={c} className="border-b border-r border-line bg-white/[0.03] px-3 py-2 text-left font-normal uppercase tracking-[.06em] text-dim last:border-r-0">{String.fromCharCode(65 + i)} · {c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              <td className="border-b border-r border-line bg-white/[0.03] px-2 py-2 text-center text-dim">{ri + 1}</td>
              {keys.map((k, ci) => {
                const on = cell[0] === ri && cell[1] === ci
                return (
                  <td key={k} onClick={() => setCell([ri, ci])} onDoubleClick={() => { setCell([ri, ci]); setEdit(true) }} className={cn('relative border-b border-r border-line px-3 py-2 last:border-r-0', on && 'outline outline-2 -outline-offset-2 outline-fg')}>
                    {on && edit ? <input autoFocus defaultValue={r[k]} onBlur={(e) => { setRows(rows.map((x, i) => (i === ri ? { ...x, [k]: e.target.value } : x))); setEdit(false) }} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEdit(false); e.stopPropagation() }} className="absolute inset-0 bg-card px-3 outline-none" /> : r[k]}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-line bg-white/[0.03] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[.06em] text-dim">Arrows move · Enter or double-click edits · Esc cancels</div>
    </div>
  )
}

/* ---------------- FolderTree ---------------- */
const TREE = [{ n: 'src', c: [{ n: 'routes', c: [{ n: 'index.js' }, { n: 'orders.js' }] }, { n: 'lib', c: [{ n: 'db.js' }, { n: 'mail.js' }] }, { n: 'server.js' }] }, { n: 'public', c: [{ n: 'logo.svg' }, { n: 'robots.txt' }] }, { n: 'package.json' }, { n: '.env' }]
function Node({ node, depth, sel, onSel, path }) {
  const [open, setOpen] = useState(depth === 0)
  const p = path + '/' + node.n
  const dir = !!node.c
  return (
    <div>
      <button onClick={() => { dir ? setOpen(!open) : onSel(p) }} className={cn('flex h-7 w-full items-center gap-1.5 rounded-md pr-2 text-left text-[12.5px] transition-colors hover:bg-hover', sel === p ? 'bg-white/[0.08] text-fg' : 'text-mute')} style={{ paddingLeft: 6 + depth * 14 }}>
        {dir ? <ChevronRight className={cn('size-3 shrink-0 transition-transform', open && 'rotate-90')} /> : <span className="w-3" />}
        {dir ? (open ? <FolderOpen className="size-3.5 shrink-0 text-info" /> : <Folder className="size-3.5 shrink-0 text-info" />) : <FileIcon className="size-3.5 shrink-0 text-dim" />}
        <span className="truncate">{node.n}</span>
      </button>
      {dir && open && node.c.map((c) => <Node key={c.n} node={c} depth={depth + 1} sel={sel} onSel={onSel} path={p} />)}
    </div>
  )
}
export function FolderTree({ onSelect }) {
  const [sel, setSel] = useState('/src/server.js')
  return <div className="rounded-xl border border-line bg-card p-2">{TREE.map((n) => <Node key={n.n} node={n} depth={0} sel={sel} onSel={(p) => { setSel(p); onSelect?.(p) }} path="" />)}</div>
}

/* ---------------- CodeEditor (editable, line numbers, light highlight, dirty state) ---------------- */
const KW = /\b(import|from|const|let|return|async|await|function|export|default|if|else|new)\b/g
export function CodeEditor({ initial, file = 'server.js' }) {
  const [code, setCode] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const ta = useRef(null), pre = useRef(null)
  const dirty = code !== saved
  const html = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/('[^']*'|"[^"]*")/g, '<i style="color:#4ade80;font-style:normal">$1</i>').replace(KW, '<i style="color:#ff9a4a;font-style:normal">$1</i>').replace(/(\/\/.*)/g, '<i style="color:#6b6b72;font-style:normal">$1</i>')
  const lines = code.split('\n').length
  return (
    <div className="overflow-hidden rounded-xl border border-line-2 bg-black">
      <div className="flex items-center justify-between border-b border-line px-3 py-2"><span className="flex items-center gap-2 font-mono text-[12px]"><FileIcon className="size-3.5 text-dim" />{file}{dirty && <i className="size-1.5 rounded-full bg-warn" title="Unsaved" />}</span><div className="flex gap-1"><Button size="sm" variant="ghost" className="h-7" disabled={!dirty} onClick={() => setCode(saved)}>Revert</Button><Button size="sm" className="h-7" disabled={!dirty} onClick={() => { setSaved(code); toast.success('Saved (simulated)') }}>Save</Button></div></div>
      <div className="relative flex h-64 font-mono text-[12.5px] leading-6">
        <div className="select-none overflow-hidden border-r border-line px-3 py-3 text-right text-dim">{Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}</div>
        <div className="relative min-w-0 flex-1">
          <pre ref={pre} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre p-3 text-fg/85" dangerouslySetInnerHTML={{ __html: html + '\n' }} />
          <textarea ref={ta} value={code} onChange={(e) => setCode(e.target.value)} onScroll={(e) => { pre.current.scrollTop = e.target.scrollTop; pre.current.scrollLeft = e.target.scrollLeft }} spellCheck={false} aria-label="Code editor" className="absolute inset-0 h-full w-full resize-none whitespace-pre bg-transparent p-3 text-transparent caret-white outline-none selection:bg-white/20" wrap="off" />
        </div>
      </div>
    </div>
  )
}

/* ---------------- Access permissions & selectors ---------------- */
export function AccessPermissions() {
  const [users, setUsers] = useState([{ n: 'Maria Ionescu', r: 'Operator', p: { console: true, files: true, backups: false, delete: false } }, { n: 'Andrei Pop', r: 'Viewer', p: { console: false, files: true, backups: false, delete: false } }])
  const P = ['console', 'files', 'backups', 'delete']
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <div className="min-w-[520px]">
        <div className="grid grid-cols-[minmax(0,1fr)_repeat(4,48px)] sm:grid-cols-[1fr_repeat(4,72px)] border-b border-line px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><span>Collaborator</span>{P.map((p) => <span key={p} className="text-center">{p}</span>)}</div>
        {users.map((u, i) => <div key={u.n} className="grid grid-cols-[minmax(0,1fr)_repeat(4,48px)] sm:grid-cols-[1fr_repeat(4,72px)] items-center border-b border-line/50 px-4 py-3 text-[13px] last:border-b-0"><div><div className="font-medium">{u.n}</div><div className="text-xs text-dim">{u.r}</div></div>{P.map((p) => <div key={p} className="grid place-items-center"><Switch checked={u.p[p]} onCheckedChange={(v) => setUsers(users.map((x, j) => (j === i ? { ...x, p: { ...x.p, [p]: v } } : x)))} aria-label={`${u.n} ${p}`} /></div>)}</div>)}
      </div>
    </div>
  )
}
export function FilePermissions() {
  const [m, setM] = useState({ ur: true, uw: true, ux: false, gr: true, gw: false, gx: false, or: true, ow: false, ox: false })
  const mode = ['u', 'g', 'o'].map((g) => ['r', 'w', 'x'].reduce((a, b, i) => a + (m[g + b] ? [4, 2, 1][i] : 0), 0)).join('')
  return (
    <div className="space-y-3 text-[13px]">
      <div className="grid grid-cols-[80px_repeat(3,1fr)] items-center gap-y-2 text-center"><span />{['Read', 'Write', 'Execute'].map((x) => <span key={x} className="font-mono text-[10.5px] uppercase text-dim">{x}</span>)}
        {[['u', 'Owner'], ['g', 'Group'], ['o', 'Others']].map(([g, l]) => [<span key={g} className="text-left text-mute">{l}</span>, ...['r', 'w', 'x'].map((b) => <div key={g + b} className="grid place-items-center"><Checkbox checked={m[g + b]} onCheckedChange={(v) => setM({ ...m, [g + b]: !!v })} aria-label={`${l} ${b}`} /></div>)])}
      </div>
      <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2"><span className="text-dim">Octal</span><span className="font-mono">{mode}</span></div>
    </div>
  )
}
export function VersionSelector({ label = 'Node.js', versions = ['22 LTS', '20 LTS', '18 (EOL)'] }) {
  const [v, setV] = useState(versions[0])
  return <div className="space-y-2"><div className="text-[12.5px] text-mute">{label}</div><div className="flex flex-wrap gap-2">{versions.map((x) => <button key={x} onClick={() => setV(x)} className={cn('h-8 rounded-lg border px-3 font-mono text-[12px] transition-colors', v === x ? 'border-fg bg-fg text-black' : 'border-line-2 text-mute hover:text-fg', /EOL/.test(x) && 'opacity-60')}>{x}</button>)}</div>{/EOL/.test(v) && <p className="text-xs text-warn">This version no longer receives security updates.</p>}</div>
}
export function PresetSelector() {
  const [p, setP] = useState('balanced')
  const P = [['dev', 'Development', '1 vCPU · 1 GB', 'Cheap, burstable'], ['balanced', 'Balanced', '2 vCPU · 4 GB', 'Most apps'], ['perf', 'Performance', '6 vCPU · 16 GB', 'Dedicated cores']]
  return <div className="grid gap-2 sm:grid-cols-3">{P.map(([id, n, s, d]) => <button key={id} onClick={() => setP(id)} className={cn('rounded-xl border p-3.5 text-left transition-colors', p === id ? 'border-fg bg-white/[0.05]' : 'border-line hover:border-line-2')}><div className="flex items-center justify-between text-[13.5px] font-medium">{n}{p === id && <Check className="size-4" />}</div><div className="mt-1 font-mono text-[11.5px] text-mute">{s}</div><div className="text-xs text-dim">{d}</div></button>)}</div>
}
export function AddonSelector() {
  const [on, setOn] = useState({ backups: true, ddos: false, ip: false, monitor: false })
  const A = [['backups', 'Daily backups', 'Kept for 7 days', 2], ['ddos', 'DDoS protection', 'Always-on L3/L4', 3], ['ip', 'Dedicated IPv4', 'Static address', 1.5], ['monitor', 'Uptime monitoring', 'Alerts by email', 1]]
  const total = A.reduce((s, a) => s + (on[a[0]] ? a[3] : 0), 0)
  return (
    <div className="space-y-2">
      {A.map(([k, n, d, p]) => <label key={k} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors', on[k] ? 'border-white/40 bg-white/[0.04]' : 'border-line hover:border-line-2')}><Checkbox checked={on[k]} onCheckedChange={(v) => setOn({ ...on, [k]: !!v })} /><div className="flex-1"><div className="text-[13.5px] font-medium">{n}</div><div className="text-xs text-dim">{d}</div></div><span className="font-mono text-[12px] text-mute">+${p.toFixed(2)}</span></label>)}
      <div className="flex justify-between px-1 pt-1 text-[13px]"><span className="text-dim">Add-ons / month</span><span className="font-mono">${total.toFixed(2)}</span></div>
    </div>
  )
}
export function PlanComparison() {
  const rows = [['vCPU', '1', '2', '6'], ['Memory', '1 GB', '4 GB', '16 GB'], ['NVMe', '25 GB', '80 GB', '240 GB'], ['Traffic', '1 TB', '4 TB', '10 TB'], ['Backups', '—', 'Daily', 'Daily + hourly'], ['Support', 'Community', 'Priority', '24/7 engineer']]
  const [hi, setHi] = useState(1)
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full min-w-[460px] text-[13px]">
        <thead><tr className="border-b border-line"><th className="px-4 py-3 text-left font-mono text-[10.5px] font-normal uppercase tracking-[.08em] text-dim">Compare</th>{['Nano', 'Pro', 'Max'].map((p, i) => <th key={p} onMouseEnter={() => setHi(i)} className={cn('cursor-default px-4 py-3 text-left font-semibold transition-colors', hi === i && 'bg-white/[0.05]')}>{p}{i === 1 && <Badge tone="info" dot={false} className="ml-2">Popular</Badge>}</th>)}</tr></thead>
        <tbody>{rows.map(([l, ...v]) => <tr key={l} className="border-b border-line/50 last:border-b-0"><td className="px-4 py-2.5 text-mute">{l}</td>{v.map((x, i) => <td key={i} onMouseEnter={() => setHi(i)} className={cn('px-4 py-2.5 font-mono text-[12.5px] transition-colors', hi === i && 'bg-white/[0.05] text-fg')}>{x}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}
export const BillingTimeline = () => (
  <ol className="relative space-y-4 border-l border-line-2 pl-5">{[['Invoice INV-1048 generated', '$38.00 · due Nov 16', 'Nov 02', 'warn'], ['Payment received', 'Visa •••• 4242 · $41.00', 'Oct 02', 'ok'], ['Credit applied', '+$3.00 promo BLIP20', 'Oct 02', 'ok'], ['Subscription renewed', 'VPS Pro · monthly', 'Oct 02', '']].map(([t, d, w, tone], i) => <li key={i} className="relative"><i className={cn('absolute -left-[25px] top-1.5 size-2 rounded-full ring-4 ring-card', tone === 'ok' ? 'bg-ok' : tone === 'warn' ? 'bg-warn' : 'bg-fg')} /><div className="flex justify-between gap-3"><span className="text-[13.5px] font-medium">{t}</span><span className="font-mono text-[11px] text-dim">{w}</span></div><div className="text-[12.5px] text-dim">{d}</div></li>)}</ol>
)
export const ServerActivity = () => (
  <div className="divide-y divide-line/60 rounded-xl border border-line bg-card">{[['stefan', 'restarted the server', '2 h ago'], ['ci-deploy', 'deployed #482 from main', '5 h ago'], ['maria', 'opened the console', 'Yesterday'], ['system', 'took snapshot nightly-2026-11-07', 'Yesterday'], ['stefan', 'changed startup command', 'Nov 05']].map(([a, b, w], i) => <div key={i} className="flex items-center gap-3 px-4 py-3 text-[13px]"><span className="grid size-6 place-items-center rounded-full border border-line-2 bg-white/5 text-[10px]">{a[0].toUpperCase()}</span><span className="flex-1"><b className="font-medium">{a}</b> <span className="text-mute">{b}</span></span><span className="text-xs text-dim">{w}</span></div>)}</div>
)
export const CRMActivity = () => (
  <ol className="space-y-3">{[['Call', 'Discussed migration of 40 services', 'Maya Chen', 'Today'], ['Email', 'Sent proposal v2', 'Stefan', 'Yesterday'], ['Note', 'Prefers Frankfurt, needs invoices in EUR', 'Maria', 'Mon']].map(([k, t, who, w]) => <li key={t} className="flex gap-3 rounded-xl border border-line bg-card p-3.5"><Badge dot={false}>{k}</Badge><div className="flex-1 text-[13px]"><div>{t}</div><div className="text-xs text-dim">{who} · {w}</div></div></li>)}</ol>
)
export const AttachmentPreview = () => (
  <div className="grid gap-2 sm:grid-cols-3">{[['screenshot.png', '412 KB', 'img'], ['firewall-rules.txt', '2 KB', 'txt'], ['report.pdf', '1.1 MB', 'pdf']].map(([n, s, t]) => <div key={n} className="overflow-hidden rounded-xl border border-line bg-card"><div className="grid h-20 place-items-center bg-white/[0.03] font-mono text-[11px] uppercase text-dim">{t === 'img' ? <div className="size-full bg-[radial-gradient(circle,#ffffff14_1px,transparent_1px)] [background-size:8px_8px]" /> : t}</div><div className="p-2.5 text-[12px]"><div className="truncate font-medium">{n}</div><div className="text-dim">{s}</div></div></div>)}</div>
)
export const AliasManager = () => {
  const [a, setA] = useState(['info@blipmade.app', 'hello@blipmade.app'])
  const [n, setN] = useState('')
  return <div className="space-y-2"><div className="rounded-xl border border-line bg-card">{a.map((x) => <div key={x} className="flex items-center justify-between border-b border-line/50 px-4 py-2.5 text-[13px] last:border-b-0"><span className="font-mono">{x}</span><button aria-label={`Remove ${x}`} onClick={() => setA(a.filter((y) => y !== x))} className="text-dim hover:text-bad"><X className="size-4" /></button></div>)}{a.length === 0 && <div className="px-4 py-5 text-center text-sm text-dim">No aliases</div>}</div><form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (/^[\w.-]+$/.test(n)) { setA([...a, n + '@blipmade.app']); setN('') } }}><input value={n} onChange={(e) => setN(e.target.value)} placeholder="new-alias" className={cn(inputCls(), 'font-mono')} aria-label="Alias" /><Button variant="outline">Add alias</Button></form></div>
}
export const NewConversation = () => (
  <div className="space-y-3 rounded-xl border border-line bg-card p-4"><div className="text-[14px] font-semibold">Start a conversation</div><input placeholder="What do you need help with?" className={inputCls()} aria-label="Subject" /><div className="flex flex-wrap gap-2">{['Technical', 'Billing', 'Sales', 'Abuse'].map((d, i) => <button key={d} className={cn('h-8 rounded-lg border px-3 text-[12.5px]', i === 0 ? 'border-fg bg-fg text-black' : 'border-line-2 text-mute hover:text-fg')}>{d}</button>)}</div><Button className="w-full">Start chat</Button></div>
)
