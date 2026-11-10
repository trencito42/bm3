/* Advanced shared patterns. Each is a self-contained, controlled-or-uncontrolled component that the screens compose.
   Keyboard: every control is a native button/input; the log viewer, diff and matrix keep a visible focus ring. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, ArrowDown, Check, ChevronDown, ChevronRight, Circle, Clock, Copy, Download, FileJson, Loader2, Pause, Play, RotateCcw, Search, Trash2, X } from 'lucide-react'
import * as DialogP from '@radix-ui/react-dialog'
import { Badge, Button, ChipTabs, Input, Progress, Segmented, Slider, Switch } from '../components/ui.jsx'
import { Checkbox, DataTable, InlineAlert, Pagination, Select, Skeleton, inputCls } from '../components/ui2.jsx'
import { cn } from '../lib/utils'
import { Decode, DotRail, StateHero, eyebrow, pick, rng } from './kit.jsx'

/* ============================== 1. Filterable log viewer ============================== */
const LEVEL = { info: 'text-fg/70', warn: 'text-warn', error: 'text-bad', debug: 'text-dim' }
export function genLogs(n = 160, seed = 3) {
  const r = rng(seed), src = ['api', 'worker', 'db', 'proxy', 'cron']
  const msg = { info: ['GET /v1/services 200 12ms', 'job email.send done', 'connection accepted', 'cache warmed (412 keys)', 'deploy 3f9a1c2 started'], warn: ['slow query 812ms on orders', 'retrying upstream (2/3)', 'memory 86% of limit', 'queue depth 340'], error: ['ECONNRESET talking to redis', 'unhandled rejection in cart.total', 'job dns.verify failed: timeout'], debug: ['tick 20.1ms', 'gc pause 4ms', 'pool 9/20'] }
  return Array.from({ length: n }, (_, i) => { const l = pick(r, ['info', 'info', 'info', 'info', 'warn', 'error', 'debug']); const t = 36000 + i * 7; return { id: i, t: `${String(Math.floor(t / 3600)).padStart(2, '0')}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`, level: l, src: pick(r, src), text: pick(r, msg[l]) } })
}
const hl = (s, q) => { if (!q) return s; const i = s.toLowerCase().indexOf(q.toLowerCase()); return i < 0 ? s : <>{s.slice(0, i)}<mark className="rounded bg-warn/30 px-0.5 text-fg">{s.slice(i, i + q.length)}</mark>{s.slice(i + q.length)}</> }
export function LogViewer({ lines: all, height = 340, title = 'Logs', state = 'ready' }) {
  const lines = useMemo(() => all || genLogs(), [all])
  const [level, setLevel] = useState('all'), [srcF, setSrcF] = useState('all'), [q, setQ] = useState(''), [wrap, setWrap] = useState(false), [follow, setFollow] = useState(true), [paused, setPaused] = useState(false), [live, setLive] = useState(40)
  const box = useRef(null), search = useRef(null)
  useEffect(() => { if (paused || state !== 'ready') return; const t = setInterval(() => setLive((n) => Math.min(lines.length, n + 1)), 900); return () => clearInterval(t) }, [paused, lines.length, state])
  const shown = lines.slice(0, live).filter((l) => (level === 'all' || l.level === level) && (srcF === 'all' || l.src === srcF) && (!q || (l.text + l.src).toLowerCase().includes(q.toLowerCase())))
  useEffect(() => { if (follow && box.current) box.current.scrollTop = box.current.scrollHeight }, [shown.length, follow])
  const counts = (lv) => lines.slice(0, live).filter((l) => lv === 'all' || l.level === lv).length
  const copy = async () => { try { await navigator.clipboard.writeText(shown.map((l) => `${l.t} ${l.level} ${l.src} ${l.text}`).join('\n')); toast.success('Copied') } catch { toast.error('Copy blocked') } }
  return (
    <div className="overflow-hidden rounded-xl border border-line-2 bg-black" onKeyDown={(e) => { if (e.key === '/' && document.activeElement !== search.current) { e.preventDefault(); search.current?.focus() } }}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-2">
        <span className="px-1 font-mono text-[11px] uppercase tracking-[.06em] text-dim">{title}</span>
        <ChipTabs value={level} onValueChange={setLevel} items={[['all', 'All', counts('all')], ['info', 'Info', counts('info')], ['warn', 'Warn', counts('warn')], ['error', 'Error', counts('error')]]} />
        <Select className="!h-8 w-28" value={srcF} onValueChange={setSrcF} options={[['all', 'All sources'], 'api', 'worker', 'db', 'proxy', 'cron']} />
        <div className="relative ml-auto w-44"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-dim" /><Input ref={search} className="h-8 pl-8 pr-6 text-[12.5px]" placeholder="Filter  ( / )" aria-label="Filter logs" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && (setQ(''), e.currentTarget.blur())} />{q && <button aria-label="Clear" onClick={() => setQ('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-dim hover:text-fg"><X className="size-3.5" /></button>}</div>
        <Button size="icon" variant="ghost" className="size-8" aria-label={paused ? 'Resume stream' : 'Pause stream'} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>{paused ? <Play /> : <Pause />}</Button>
        <Button size="icon" variant="ghost" className="size-8" aria-label="Copy visible lines" onClick={copy}><Copy /></Button>
        <Button size="icon" variant="ghost" className="size-8" aria-label="Download" onClick={() => toast('Download started (simulated)')}><Download /></Button>
      </div>
      <div ref={box} tabIndex={0} role="log" aria-live="off" aria-label={title} onScroll={(e) => { const el = e.currentTarget; setFollow(el.scrollHeight - el.scrollTop - el.clientHeight < 24) }} className="overflow-auto font-mono text-[12px] leading-[20px] outline-none focus-visible:ring-1 focus-visible:ring-white/30" style={{ height }}>
        {state === 'loading' && <div className="space-y-2 p-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-3.5" />)}</div>}
        {state === 'error' && <div className="grid h-full place-items-center p-6"><InlineAlert tone="bad" title="Log stream disconnected" action={<Button size="sm" variant="outline">Reconnect</Button>}>The connection closed after 3 retries. Lines stay available.</InlineAlert></div>}
        {state === 'ready' && shown.length === 0 && <div className="grid h-full place-items-center text-dim">No lines match these filters</div>}
        {state === 'ready' && shown.map((l) => <div key={l.id} className="flex gap-3 px-3 hover:bg-white/[0.04]"><span className="shrink-0 text-dim">{l.t}</span><span className={cn('w-10 shrink-0 uppercase', LEVEL[l.level])}>{l.level}</span><span className="w-14 shrink-0 text-info/80">{l.src}</span><span className={cn('min-w-0 flex-1', wrap ? 'whitespace-pre-wrap break-words' : 'truncate', l.level === 'error' ? 'text-bad' : 'text-fg/80')}>{hl(l.text, q)}</span></div>)}
      </div>
      <div className="flex items-center justify-between border-t border-line px-3 py-1.5 text-[11.5px] text-dim">
        <span>{shown.length} lines{paused ? ' · paused' : follow ? ' · following' : ''}</span>
        <div className="flex items-center gap-3"><label className="flex items-center gap-1.5"><Switch checked={wrap} onCheckedChange={setWrap} aria-label="Wrap lines" className="scale-75" />Wrap</label>{!follow && <button onClick={() => { setFollow(true); box.current && (box.current.scrollTop = box.current.scrollHeight) }} className="flex items-center gap-1 text-fg hover:underline"><ArrowDown className="size-3" />Latest</button>}</div>
      </div>
    </div>
  )
}

/* ============================== 2. Job and provisioning timeline ============================== */
const JT = { done: [Check, 'bg-ok/15 text-ok'], running: [Loader2, 'bg-white/10 text-fg'], failed: [X, 'bg-bad/15 text-bad'], queued: [Circle, 'text-dim border border-line-2'], skipped: [Circle, 'text-dim border border-dashed border-line-2'] }
export function JobTimeline({ steps, onRetry, compact }) {
  const [open, setOpen] = useState(() => steps.findIndex((s) => s.state === 'failed'))
  const total = steps.reduce((a, s) => a + (s.ms || 0), 0)
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const [I, c] = JT[s.state]
        return (
          <li key={s.name} className="relative pb-4 pl-10 last:pb-0">
            {i < steps.length - 1 && <span aria-hidden className={cn('absolute bottom-0 left-[13px] top-7 w-px', s.state === 'done' ? 'bg-ok/30' : 'bg-line-2')} />}
            <span className={cn('absolute left-0 top-0 grid size-7 place-items-center rounded-full', c)}><I className={cn('size-3.5', s.state === 'running' && 'animate-spin')} /></span>
            <button onClick={() => s.log && setOpen(open === i ? -1 : i)} aria-expanded={s.log ? open === i : undefined} className={cn('flex w-full items-center gap-3 text-left outline-none', s.log && 'cursor-pointer')}>
              <span className={cn('min-w-0 flex-1 text-[13.5px]', s.state === 'queued' ? 'text-dim' : 'text-fg', s.state === 'failed' && 'text-bad')}>{s.name}{!compact && s.hint && <span className="ml-2 text-[12px] text-dim">{s.hint}</span>}</span>
              {s.ms != null && <span className="font-mono text-[11px] tabular-nums text-dim">{s.ms >= 1000 ? (s.ms / 1000).toFixed(1) + ' s' : s.ms + ' ms'}</span>}
              {s.log && <ChevronDown className={cn('size-3.5 text-dim transition-transform duration-200', open === i && 'rotate-180')} />}
            </button>
            {s.ms != null && total > 0 && !compact && <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]"><i className={cn('block h-full rounded-full', s.state === 'failed' ? 'bg-bad' : 'bg-fg/50')} style={{ width: `${Math.max(3, (s.ms / total) * 100)}%` }} /></div>}
            {open === i && s.log && <div className="anim-menu mt-2 rounded-lg border border-line bg-black p-3 font-mono text-[11.5px] leading-5 text-fg/70">{s.log.map((l, k) => <div key={k} className={cn(/error|fail|timeout/i.test(l) && 'text-bad')}>{l}</div>)}{s.state === 'failed' && onRetry && <Button size="sm" className="mt-3" onClick={() => onRetry(i)}><RotateCcw />Retry from this step</Button>}</div>}
          </li>
        )
      })}
    </ol>
  )
}

/* ============================== 3. Diff viewer ============================== */
export function lineDiff(a, b) {
  const A = a.split('\n'), B = b.split('\n'), m = A.length, n = B.length
  const L = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const out = []; let i = 0, j = 0
  while (i < m && j < n) { if (A[i] === B[j]) { out.push(['=', A[i], i + 1, j + 1]); i++; j++ } else if (L[i + 1][j] >= L[i][j + 1]) out.push(['-', A[i++], i, null]); else out.push(['+', B[j++], null, j]) }
  while (i < m) out.push(['-', A[i++], i, null]); while (j < n) out.push(['+', B[j++], null, j])
  return out
}
export function DiffViewer({ before, after, name = 'config.json', defaultMode = 'unified' }) {
  const [mode, setMode] = useState(defaultMode), [ctx, setCtx] = useState(true)
  const d = useMemo(() => lineDiff(before, after), [before, after])
  const add = d.filter((x) => x[0] === '+').length, del = d.filter((x) => x[0] === '-').length
  const rows = ctx ? d.filter((x, i) => x[0] !== '=' || d.slice(Math.max(0, i - 2), i + 3).some((y) => y[0] !== '=')) : d
  const cell = (k) => k === '+' ? 'bg-ok/10 text-ok' : k === '-' ? 'bg-bad/10 text-bad' : 'text-fg/70'
  return (
    <div className="overflow-hidden rounded-xl border border-line-2 bg-black">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-3 py-2"><FileJson className="size-4 text-dim" /><span className="font-mono text-[12px]">{name}</span><span className="font-mono text-[11.5px] text-ok">+{add}</span><span className="font-mono text-[11.5px] text-bad">−{del}</span><div className="ml-auto flex items-center gap-2"><label className="flex items-center gap-1.5 text-[12px] text-dim"><Checkbox checked={ctx} onCheckedChange={setCtx} />Changes only</label><Segmented value={mode} onValueChange={(v) => v && setMode(v)} options={[['unified', 'Unified'], ['split', 'Split']]} /></div></div>
      {add + del === 0 ? <div className="p-8 text-center text-[13px] text-dim">No differences</div> : mode === 'unified' ? (
        <div className="overflow-x-auto font-mono text-[12px] leading-[20px]">{rows.map((r, i) => <div key={i} className={cn('flex', cell(r[0]))}><span className="w-9 shrink-0 select-none px-1 text-right text-dim/70">{r[2] ?? ''}</span><span className="w-9 shrink-0 select-none px-1 text-right text-dim/70">{r[3] ?? ''}</span><span className="w-5 shrink-0 select-none text-center">{r[0] === '=' ? '' : r[0]}</span><span className="whitespace-pre pr-4">{r[1]}</span></div>)}</div>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-line overflow-x-auto font-mono text-[12px] leading-[20px]">
          {['-', '+'].map((side) => <div key={side}>{rows.filter((r) => r[0] === '=' || r[0] === side).map((r, i) => <div key={i} className={cn('flex', r[0] === side ? cell(side) : 'text-fg/60')}><span className="w-9 shrink-0 select-none px-1 text-right text-dim/70">{side === '-' ? r[2] : r[3]}</span><span className="whitespace-pre px-2">{r[1]}</span></div>)}</div>)}
        </div>
      )}
    </div>
  )
}

/* ============================== 4. Configuration / JSON editor ============================== */
export function ConfigEditor({ initial, schemaHint, name = 'settings.json', onSaved }) {
  const [text, setText] = useState(initial), [saved, setSaved] = useState(initial), [view, setView] = useState('edit'), [busy, setBusy] = useState(false)
  const err = useMemo(() => { try { JSON.parse(text); return null } catch (e) { const m = /position (\d+)/.exec(e.message), p = m ? +m[1] : 0; return { msg: e.message.replace(/ in JSON at position.*/, '').replace(/^JSON\.parse: /, ''), line: text.slice(0, p).split('\n').length } } }, [text])
  const dirty = text !== saved, lines = text.split('\n').length
  const fmt = () => { try { setText(JSON.stringify(JSON.parse(text), null, 2)) } catch { toast.error('Fix the syntax first') } }
  const save = () => { setBusy(true); setTimeout(() => { setBusy(false); setSaved(text); onSaved?.(); toast.success('Saved (simulated)') }, 900) }
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-line-2 bg-black">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2"><FileJson className="size-4 text-dim" /><span className="font-mono text-[12px]">{name}</span>{dirty && <Badge tone="warn" dot={false}>modified</Badge>}<div className="ml-auto flex items-center gap-1.5"><Segmented value={view} onValueChange={(v) => v && setView(v)} options={[['edit', 'Edit'], ['diff', 'Changes']]} /><Button size="sm" variant="ghost" onClick={fmt}>Format</Button><Button size="sm" variant="ghost" disabled={!dirty} onClick={() => setText(saved)}>Revert</Button></div></div>
        {view === 'edit' ? (
          <div className="flex font-mono text-[12.5px] leading-[20px]"><div aria-hidden className="select-none border-r border-line px-2 py-3 text-right text-dim/70">{Array.from({ length: lines }, (_, i) => <div key={i} className={err?.line === i + 1 ? 'text-bad' : ''}>{i + 1}</div>)}</div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} aria-label={name} aria-invalid={!!err} aria-describedby="cfg-err" onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); !err && dirty && save() } }} className="min-h-[220px] flex-1 resize-y bg-transparent p-3 text-fg/90 outline-none" style={{ height: lines * 20 + 24 }} /></div>
        ) : <DiffViewer before={saved} after={text} name={name} />}
        <div id="cfg-err" className="flex items-center justify-between gap-3 border-t border-line px-3 py-2 text-[12px]">{err ? <span className="flex items-center gap-1.5 text-bad"><AlertTriangle className="size-3.5" />Line {err.line}: {err.msg}</span> : <span className="flex items-center gap-1.5 text-ok"><Check className="size-3.5" />Valid JSON</span>}<span className="text-dim">{schemaHint}</span></div>
      </div>
      <div className="flex justify-end gap-2"><Button disabled={!!err || !dirty} loading={busy} onClick={save}>Save changes</Button></div>
    </div>
  )
}

/* ============================== 5. Resource allocation editor ============================== */
export function ResourceAllocator({ node = { name: 'fra-2', cpu: 64, ram: 256, disk: 4000 }, used = { cpu: 41, ram: 188, disk: 2300 }, initial = { cpu: 2, ram: 4, disk: 80 }, price = { cpu: 2.5, ram: 1.25, disk: 0.03 }, onApply, onChange, hideApply }) {
  const [v, setV] = useState(initial)
  useEffect(() => { onChange?.(v) }, [v])  // eslint-disable-line react-hooks/exhaustive-deps
  const rows = [['cpu', 'vCPU', 1, 16, 1, ''], ['ram', 'Memory', 1, 64, 1, ' GB'], ['disk', 'NVMe storage', 20, 1000, 10, ' GB']]
  const cost = (x) => x.cpu * price.cpu + x.ram * price.ram + x.disk * price.disk
  const left = (k) => node[k] - used[k]
  const over = rows.filter(([k]) => v[k] - initial[k] > left(k))
  const delta = cost(v) - cost(initial)
  return (
    <div className="space-y-5">
      {rows.map(([k, l, min, max, step, u]) => (
        <div key={k} className="space-y-2">
          <div className="flex items-baseline justify-between"><label className="text-[13px] font-medium" htmlFor={'ra-' + k}>{l}</label><span className="font-mono text-[13px] tabular-nums">{v[k]}{u}{v[k] !== initial[k] && <span className="ml-2 text-[11px] text-dim">was {initial[k]}</span>}</span></div>
          <Slider id={'ra-' + k} min={min} max={max} step={step} value={[v[k]]} onValueChange={([x]) => setV((o) => ({ ...o, [k]: x }))} aria-label={l} />
          <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.06]" title={`${node.name}: ${used[k]} of ${node[k]} used`}><i className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${(used[k] / node[k]) * 100}%` }} /><i className={cn('absolute inset-y-0', v[k] - initial[k] > left(k) ? 'bg-bad' : 'bg-fg')} style={{ left: `${(used[k] / node[k]) * 100}%`, width: `${Math.max(0, ((v[k] - initial[k]) / node[k]) * 100)}%` }} /></div>
          <div className="flex justify-between text-[11.5px] text-dim"><span>{node.name} · {left(k)} free of {node[k]}</span><span>{k === 'cpu' ? 'Applied after restart' : 'Applied live'}</span></div>
        </div>
      ))}
      {over.length > 0 && <InlineAlert tone="bad" title={`Not enough free ${over.map((o) => o[1].toLowerCase()).join(' and ')} on ${node.name}`}>This size needs a migration to another node and a short restart.</InlineAlert>}
      <div className="flex items-center justify-between rounded-lg border border-line p-3 text-[13px]"><span className="text-dim">Price per month</span><span className="font-mono">${cost(v).toFixed(2)} <span className={cn('ml-1 text-[12px]', delta > 0 ? 'text-warn' : delta < 0 ? 'text-ok' : 'text-dim')}>{delta === 0 ? 'no change' : `${delta > 0 ? '+' : '−'}$${Math.abs(delta).toFixed(2)}`}</span></span></div>
      {!hideApply && <div className="flex justify-end gap-2"><Button variant="ghost" disabled={JSON.stringify(v) === JSON.stringify(initial)} onClick={() => setV(initial)}>Reset</Button><Button disabled={JSON.stringify(v) === JSON.stringify(initial)} onClick={() => { toast.success('Resources updated (simulated)'); onApply?.(v) }}>{over.length ? 'Migrate and apply' : 'Apply'}</Button></div>}
    </div>
  )
}

/* ============================== 6. Permission matrix ============================== */
export function PermissionMatrix({ rows, cols = ['Read', 'Write', 'Delete', 'Admin'], roles, initial = {}, onChange }) {
  const [m, setM] = useState(() => Object.fromEntries(rows.map((r) => [r, new Set(initial[r] || [])])))
  const [role, setRole] = useState('custom')
  const roleSets = roles || { viewer: { all: ['Read'] }, editor: { all: ['Read', 'Write'] }, owner: { all: cols } }
  const apply = (name) => { setRole(name); if (name === 'custom') return; setM(Object.fromEntries(rows.map((r) => [r, new Set(roleSets[name].all)]))) }
  const toggle = (r, c) => { setRole('custom'); setM((o) => { const s = new Set(o[r]); if (s.has(c)) { s.delete(c); if (c === 'Read') s.clear() } else { s.add(c); if (c !== 'Read') s.add('Read') } const n = { ...o, [r]: s }; onChange?.(n); return n }) }
  const col = (c) => { setRole('custom'); const on = rows.every((r) => m[r].has(c)); setM((o) => Object.fromEntries(rows.map((r) => { const s = new Set(o[r]); if (on) s.delete(c); else { s.add(c); if (c !== 'Read') s.add('Read') } return [r, s] }))) }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2"><span className={eyebrow}>Start from</span><Segmented value={role} onValueChange={(v) => v && apply(v)} options={[...Object.keys(roleSets).map((k) => [k, k[0].toUpperCase() + k.slice(1)]), ['custom', 'Custom']]} /></div>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[420px] text-[13px]" role="grid"><thead><tr className="border-b border-line"><th className="h-10 px-4 text-left font-mono text-[10.5px] font-normal uppercase tracking-[.08em] text-dim">Area</th>{cols.map((c) => <th key={c} className="px-2 text-center"><button onClick={() => col(c)} className="rounded px-2 py-1 font-mono text-[10.5px] font-normal uppercase tracking-[.08em] text-dim transition-colors hover:text-fg" title={`Toggle ${c} for every area`}>{c}</button></th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r} className="border-b border-line/50 last:border-b-0 hover:bg-hover"><td className="px-4 py-2.5">{r}</td>{cols.map((c) => <td key={c} className="px-2 text-center"><Checkbox checked={m[r].has(c)} onCheckedChange={() => toggle(r, c)} aria-label={`${r}: ${c}`} className="mx-auto" /></td>)}</tr>)}</tbody></table>
      </div>
      <p className="text-[12px] text-dim">Granting write, delete or admin also grants read. Removing read removes the rest for that area.</p>
    </div>
  )
}

/* ============================== 7. Audit inspector ============================== */
export function AuditInspector({ entries }) {
  const [sel, setSel] = useState(entries[0]?.id), [q, setQ] = useState('')
  const list = entries.filter((e) => (e.actor + e.action + e.target).toLowerCase().includes(q.toLowerCase()))
  const cur = entries.find((e) => e.id === sel) || list[0]
  return (
    <div className="grid overflow-hidden rounded-xl border border-line lg:grid-cols-[320px_1fr]">
      <div className="max-h-[420px] overflow-y-auto border-b border-line lg:border-b-0 lg:border-r">
        <div className="sticky top-0 border-b border-line bg-card p-2"><Input className="h-8" placeholder="Filter by actor, action, target" aria-label="Filter audit entries" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {list.length === 0 && <div className="p-6 text-center text-[13px] text-dim">No entries</div>}
        {list.map((e) => <button key={e.id} onClick={() => setSel(e.id)} aria-current={cur?.id === e.id} className={cn('block w-full border-b border-line/60 px-4 py-3 text-left outline-none transition-colors last:border-b-0 hover:bg-hover focus-visible:bg-hover', cur?.id === e.id && 'bg-white/[0.06]')}><div className="flex items-center justify-between"><span className="font-mono text-[12px]">{e.action}</span><span className="font-mono text-[10.5px] text-dim">{e.when}</span></div><div className="mt-0.5 text-[12.5px] text-mute">{e.actor} → {e.target}</div></button>)}
      </div>
      {cur && <div className="min-w-0 space-y-4 p-5"><div className="flex flex-wrap items-center gap-2"><Badge tone={cur.risk === 'high' ? 'bad' : cur.risk === 'medium' ? 'warn' : 'neutral'} dot={false}>{cur.risk} impact</Badge><span className="font-mono text-[13px]">{cur.action}</span></div>
        <dl className="grid gap-x-6 gap-y-3 text-[13px] sm:grid-cols-2">{[['Actor', cur.actor], ['Target', cur.target], ['IP address', cur.ip], ['Request', cur.req], ['Session', cur.session], ['Time', cur.when + ' UTC']].map(([k, v]) => <div key={k}><dt className={eyebrow}>{k}</dt><dd className="mt-1 truncate font-mono text-[12.5px]">{v}</dd></div>)}</dl>
        {cur.before != null && <DiffViewer before={cur.before} after={cur.after} name={cur.target} />}</div>}
    </div>
  )
}

/* ============================== 8. Multi-step destructive action dialog ============================== */
export function DestructiveDialog({ trigger, title, target, impact = [], acks = [], confirmLabel = 'Delete', steps = ['Stopping services', 'Detaching storage', 'Removing data'], fail = false }) {
  const [open, setOpen] = useState(false), [step, setStep] = useState(0), [checked, setChecked] = useState([]), [txt, setTxt] = useState(''), [prog, setProg] = useState(-1), [res, setRes] = useState('idle')
  const reset = () => { setStep(0); setChecked([]); setTxt(''); setProg(-1); setRes('idle') }
  const run = () => { setStep(3); setProg(0); setRes('running') }
  useEffect(() => { if (res !== 'running') return; const t = setTimeout(() => { if (fail && prog === steps.length - 1) { setRes('failed'); return } if (prog >= steps.length - 1) { setRes('done'); return } setProg((p) => p + 1) }, 850); return () => clearTimeout(t) }, [res, prog, steps.length, fail])
  const ready = checked.length === acks.length && txt === target
  return (
    <DialogP.Root open={open} onOpenChange={(o) => { if (res === 'running') return; setOpen(o); if (!o) reset() }}>
      <DialogP.Trigger asChild>{trigger}</DialogP.Trigger>
      <DialogP.Portal>
        <DialogP.Overlay className="anim-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-[3px]" />
        <DialogP.Content className="anim-pop fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-line-2 bg-card p-6 shadow-2xl outline-none">
          <div className="mb-4 flex items-center justify-between"><div className={cn('grid size-10 place-items-center rounded-full', res === 'done' ? 'bg-ok/10 text-ok' : 'bg-bad/10 text-bad')}>{res === 'done' ? <Check className="size-5" /> : <AlertTriangle className="size-5" />}</div><div className="font-mono text-[11px] text-dim">{step < 3 ? `Step ${step + 1} of 3` : res === 'running' ? 'Working' : res === 'done' ? 'Done' : 'Stopped'}</div></div>
          <DialogP.Title className="text-base font-semibold">{res === 'done' ? `${target} was removed` : title}</DialogP.Title>
          <DialogP.Description className="mt-1.5 text-[13px] leading-relaxed text-mute">{step === 0 ? 'Read what this removes before you go on.' : step === 1 ? 'Confirm you understand each point.' : step === 2 ? 'One last check.' : ''}</DialogP.Description>
          <div className="mt-5">
            {step === 0 && <ul className="space-y-2">{impact.map(([a, b, t]) => <li key={a} className="flex items-start gap-3 rounded-lg border border-line p-3 text-[13px]"><i className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', t === 'bad' ? 'bg-bad' : 'bg-warn')} /><span><b className="font-medium">{a}</b><span className="text-mute"> {b}</span></span></li>)}</ul>}
            {step === 1 && <div className="space-y-3">{acks.map((a, i) => <label key={a} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 text-[13px] transition-colors hover:bg-hover"><Checkbox className="mt-0.5" checked={checked.includes(i)} onCheckedChange={(v) => setChecked((c) => (v ? [...c, i] : c.filter((x) => x !== i)))} />{a}</label>)}</div>}
            {step === 2 && <div className="space-y-2"><label htmlFor="dd-t" className="text-[13px] text-mute">Type <b className="font-mono text-fg">{target}</b> to confirm</label><input id="dd-t" autoFocus value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ready && run()} className={cn(inputCls(), 'font-mono')} autoComplete="off" /></div>}
            {step === 3 && <div className="space-y-3"><JobTimeline compact steps={steps.map((n, i) => ({ name: n, state: res === 'failed' && i === prog ? 'failed' : i < prog || res === 'done' ? 'done' : i === prog ? 'running' : 'queued', log: res === 'failed' && i === prog ? ['error: volume is busy, retry in 30 s'] : null }))} onRetry={() => { setRes('running') }} />{res === 'done' && <StateHero state="happy" word="GONE." sub="Everything was removed. A final backup stays available for 7 days." small size={56} />}{res === 'failed' && <StateHero state="waiting" tone="bad" word="STUCK." sub="The volume is busy. Nothing was lost; try again in a moment." small size={56} />}</div>}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            {step < 3 && <Button variant="outline" onClick={() => (step === 0 ? setOpen(false) : setStep(step - 1))}>{step === 0 ? 'Cancel' : 'Back'}</Button>}
            {step === 0 && <Button onClick={() => setStep(1)}>I understand</Button>}
            {step === 1 && <Button disabled={checked.length !== acks.length} onClick={() => setStep(2)}>Continue</Button>}
            {step === 2 && <Button className="!bg-bad !text-black hover:!bg-bad/85" disabled={!ready} onClick={run}><Trash2 />{confirmLabel}</Button>}
            {step === 3 && (res === 'done' || res === 'failed') && <Button variant="outline" onClick={() => { setOpen(false); reset() }}>Close</Button>}
          </div>
        </DialogP.Content>
      </DialogP.Portal>
    </DialogP.Root>
  )
}

/* ============================== 9. Realistic async operation ============================== */
export function AsyncOperation({ label = 'Create snapshot', steps = ['Quiescing disk', 'Copying blocks', 'Verifying checksum'], failAt = -1, timeoutAt = -1 }) {
  const [st, setSt] = useState('idle'), [i, setI] = useState(0), [att, setAtt] = useState(1)
  useEffect(() => { if (st !== 'running') return; const t = setTimeout(() => { if (i === timeoutAt && att === 1) { setSt('timeout'); return } if (i === failAt) { setSt('failed'); return } if (i >= steps.length - 1) { setSt('done'); return } setI((n) => n + 1) }, 900); return () => clearTimeout(t) }, [st, i, att, failAt, timeoutAt, steps.length])
  const start = () => { setI(0); setAtt(1); setSt('running') }
  const pct = st === 'done' ? 100 : Math.round(((i + (st === 'running' ? 0.5 : 0)) / steps.length) * 100)
  const tone = { idle: 'neutral', running: 'info', done: 'ok', failed: 'bad', timeout: 'warn' }[st]
  return (
    <div className="space-y-3 rounded-xl border border-line p-4" aria-live="polite">
      <div className="flex items-center justify-between gap-3"><div className="text-[13.5px] font-medium">{label}</div><Badge tone={tone}>{st === 'timeout' ? 'taking long' : st}</Badge></div>
      {st !== 'idle' && <><DotRail n={32} value={pct / 100} state={st === 'failed' ? 'fail' : st === 'done' ? 'ok' : st === 'timeout' ? 'fail' : 'run'} /><div className="flex items-center justify-between gap-3 text-[12px] text-dim"><span className="min-w-0 truncate font-mono"><Decode tone={st === 'failed' ? 'bad' : st === 'done' ? 'ok' : 'fg'} text={st === 'done' ? 'Finished' : st === 'failed' ? `Failed at “${steps[i]}”` : st === 'timeout' ? `No answer after 30 s (attempt ${att})` : `${steps[i]}…`} /></span><span className="font-mono">{pct}%</span></div></>}
      <div className="flex flex-wrap gap-2">
        {st === 'idle' && <Button size="sm" onClick={start}>{label}</Button>}
        {st === 'running' && <Button size="sm" variant="outline" onClick={() => setSt('idle')}>Cancel</Button>}
        {st === 'timeout' && <><Button size="sm" onClick={() => { setAtt(2); setSt('running') }}>Keep waiting</Button><Button size="sm" variant="outline" onClick={() => setSt('idle')}>Cancel</Button></>}
        {st === 'failed' && <><Button size="sm" onClick={start}><RotateCcw />Retry</Button><Button size="sm" variant="ghost" onClick={() => toast('Opened support ticket (simulated)')}>Contact support</Button></>}
        {st === 'done' && <Button size="sm" variant="outline" onClick={() => setSt('idle')}>Done</Button>}
      </div>
    </div>
  )
}

/* ============================== 10. Advanced table with bulk actions ============================== */
export function BulkTable({ rows: all, columns, filters, bulk = [], searchKeys = ['name'], pageSize = 6, state = 'ready', emptyText = 'Nothing matches', title }) {
  const [q, setQ] = useState(''), [f, setF] = useState('all'), [sel, setSel] = useState([]), [page, setPage] = useState(1), [sort, setSort] = useState({ k: null, d: 'asc' }), [dense, setDense] = useState(false)
  const filtered = all.filter((r) => (f === 'all' || filters?.match(r, f)) && searchKeys.some((k) => String(r[k]).toLowerCase().includes(q.toLowerCase())))
  const sorted = sort.k ? [...filtered].sort((a, b) => (a[sort.k] > b[sort.k] ? 1 : -1) * (sort.d === 'asc' ? 1 : -1)) : filtered
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize)), cur = Math.min(page, pages), view = sorted.slice((cur - 1) * pageSize, cur * pageSize)
  useEffect(() => { setPage(1) }, [q, f])
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
        {filters && <ChipTabs value={f} onValueChange={(v) => { setF(v); setSel([]) }} items={filters.items.map(([id, l]) => [id, l, id === 'all' ? all.length : all.filter((r) => filters.match(r, id)).length])} />}
        <div className="relative ml-auto w-48"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-dim" /><Input className="h-8 pl-8" placeholder="Search" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <label className="hidden items-center gap-1.5 text-[12px] text-dim sm:flex"><Switch checked={dense} onCheckedChange={setDense} className="scale-75" aria-label="Compact rows" />Compact</label>
      </div>
      <div className="relative">
        {sel.length > 0 && <div className="anim-menu absolute inset-x-0 top-0 z-10 flex h-10 items-center gap-2 border-b border-line-2 bg-[#17171a] px-4 text-[13px]"><span className="font-medium">{sel.length} selected</span>{bulk.map(([l, fn, danger]) => <Button key={l} size="sm" variant="ghost" className={danger ? 'text-bad hover:text-bad' : ''} onClick={() => { fn?.(sel); toast(`${l}: ${sel.length} items (simulated)`); setSel([]) }}>{l}</Button>)}<button onClick={() => setSel([])} className="ml-auto text-dim hover:text-fg">Clear</button></div>}
        {state === 'loading' ? <div className="space-y-3 p-4">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-8" />)}</div>
          : state === 'error' ? <div className="p-6"><InlineAlert tone="bad" title="Could not load this list" action={<Button size="sm" variant="outline">Retry</Button>}>The server did not answer. Your filters are kept.</InlineAlert></div>
          : <DataTable dense={dense} selectable selected={sel} onSelect={setSel} sortKey={sort.k} sortDir={sort.d} onSort={(k) => setSort((s) => ({ k, d: s.k === k && s.d === 'asc' ? 'desc' : 'asc' }))} columns={columns} rows={view} empty={emptyText} />}
      </div>
      {state === 'ready' && <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[12px] text-dim"><span>{sorted.length} {title || 'items'}</span><Pagination page={cur} pages={pages} onPage={setPage} /></div>}
    </div>
  )
}
