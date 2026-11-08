import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Columns3, Filter, Plus, Search, Star, Trash2, X } from 'lucide-react'
import { Doc, Demo, Row } from './Doc.jsx'
import { Badge, Button, ChipTabs, Input, Menu, MenuContent, MenuItem, MenuTrigger, StatusBadge, Card } from '../components/ui.jsx'
import { Checkbox, DataTable, FormField, InlineAlert, Pagination, Popover, PopoverContent, PopoverTrigger, Select, Stepper, inputCls } from '../components/ui2.jsx'
import { CUSTOMERS } from '../lib/mock'
import { DetailLayout, ResizablePanel, ScrollContainer } from '../components/layouts.jsx'
import { money, cn } from '../lib/utils'

const ALL_COLS = [
  { key: 'name', label: 'Customer', sortable: true, cell: (r) => <div><div className="font-medium text-fg">{r.name}</div><div className="text-xs text-dim">{r.mail}</div></div> },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'status', label: 'Status', cell: (r) => <StatusBadge status={r.status === 'past_due' ? 'overdue' : r.status === 'suspended' ? 'stopped' : 'running'} /> },
  { key: 'country', label: 'Country' },
  { key: 'services', label: 'Services', sortable: true, align: 'right' },
  { key: 'mrr', label: 'MRR', sortable: true, align: 'right', cell: (r) => <span className="tabular-nums">{money(r.mrr)}</span> },
]

function TablePattern() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState({ key: 'mrr', dir: 'desc' })
  const [sel, setSel] = useState([])
  const [cols, setCols] = useState(ALL_COLS.map((c) => c.key))
  const [view, setView] = useState('all')
  const [page, setPage] = useState(1)
  const VIEWS = { all: { label: 'All customers', status: 'all' }, risk: { label: 'At risk', status: 'past_due' }, susp: { label: 'Suspended', status: 'suspended' } }
  const rows = useMemo(() => {
    const st = view !== 'all' ? VIEWS[view].status : status
    let r = CUSTOMERS.filter((c) => (st === 'all' || c.status === st) && (c.name + c.mail).toLowerCase().includes(q.toLowerCase()))
    r = [...r].sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : -1) * (sort.dir === 'asc' ? 1 : -1))
    return r
  }, [q, status, sort, view])
  const columns = ALL_COLS.filter((c) => cols.includes(c.key))
  return (
    <Demo label="Table pattern · search, filter, sort, columns, saved views, bulk actions" pad={false} className="overflow-hidden" sim>
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
        <ChipTabs value={view} onValueChange={(v) => { setView(v); setSel([]) }} items={Object.entries(VIEWS).map(([k, v]) => [k, v.label])} />
        <div className="ml-auto flex items-center gap-2">
          <div className="relative w-52"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-dim" /><Input className="h-8 pl-8" placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" /></div>
          <Select className="!h-8 w-36" value={status} onValueChange={setStatus} options={[['all', 'Any status'], ['active', 'Active'], ['past_due', 'Past due'], ['suspended', 'Suspended']]} />
          <Popover><PopoverTrigger asChild><Button variant="outline" size="sm" className="h-8"><Columns3 />Columns</Button></PopoverTrigger><PopoverContent className="w-48 space-y-2" align="end">{ALL_COLS.map((c) => <label key={c.key} className="flex items-center gap-2.5 text-[13px]"><Checkbox checked={cols.includes(c.key)} onCheckedChange={(v) => setCols(v ? [...cols, c.key] : cols.filter((k) => k !== c.key))} />{c.label}</label>)}</PopoverContent></Popover>
        </div>
      </div>
      {sel.length > 0 && <div className="flex items-center gap-3 border-b border-line bg-white/[0.04] px-4 py-2 text-[13px]"><b className="font-medium">{sel.length} selected</b><Button size="sm" variant="ghost" onClick={() => toast('Email sent (simulated)')}>Email</Button><Button size="sm" variant="ghost" onClick={() => toast('Tagged (simulated)')}>Tag</Button><Button size="sm" variant="ghost" className="text-bad" onClick={() => { toast.error('Suspend simulated'); setSel([]) }}>Suspend</Button><button className="ml-auto text-xs text-dim hover:text-fg" onClick={() => setSel([])}>Clear</button></div>}
      <DataTable columns={columns} rows={rows} sortKey={sort.key} sortDir={sort.dir} onSort={(k) => setSort((s) => ({ key: k, dir: s.key === k && s.dir === 'desc' ? 'asc' : 'desc' }))} selectable selected={sel} onSelect={setSel} dense empty="No customers match these filters" />
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[12.5px] text-dim"><span>{rows.length} of {CUSTOMERS.length} customers</span><Pagination page={page} pages={3} onPage={setPage} /></div>
    </Demo>
  )
}

function FilterBuilder() {
  const [rules, setRules] = useState([{ f: 'status', op: 'is', v: 'past_due' }, { f: 'mrr', op: '>', v: '20' }])
  const set = (i, k, v) => setRules(rules.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  return (
    <Demo label="FilterBuilder · SavedViews" sim>
      <div className="space-y-2.5">
        {rules.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2"><span className="w-10 font-mono text-[10.5px] uppercase text-dim">{i ? 'and' : 'where'}</span><Select className="w-36" value={r.f} onValueChange={(v) => set(i, 'f', v)} options={['status', 'plan', 'country', 'mrr']} /><Select className="w-24" value={r.op} onValueChange={(v) => set(i, 'op', v)} options={['is', 'is not', '>', '<']} /><input value={r.v} onChange={(e) => set(i, 'v', e.target.value)} aria-label="Value" className={cn(inputCls(), 'w-40')} /><Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setRules(rules.filter((_, j) => j !== i))}><X /></Button></div>
        ))}
        <Row><Button variant="outline" size="sm" onClick={() => setRules([...rules, { f: 'plan', op: 'is', v: '' }])}><Plus />Add filter</Button><Button size="sm" onClick={() => toast.success('View saved (simulated)')}><Star />Save as view</Button></Row>
      </div>
    </Demo>
  )
}

function FormPattern() {
  const [v, setV] = useState({ name: '', domain: '', email: '' })
  const [done, setDone] = useState(false)
  const err = { name: v.name && !/^[a-z0-9-]{3,}$/.test(v.name) ? 'Use at least 3 lowercase letters, numbers or dashes' : '', domain: v.domain && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(v.domain) ? 'Enter a valid domain like example.com' : '', email: v.email && !/^\S+@\S+\.\S+$/.test(v.email) ? 'Enter a valid email address' : '' }
  const n = Object.values(err).filter(Boolean).length
  const ok = v.name && v.domain && v.email && !n
  return (
    <Demo label="Form validation pattern · validate on blur-ish, summarise on submit" sim>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <FormField label="Project name" required error={err.name}><input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className={inputCls(!!err.name)} placeholder="my-project" /></FormField>
          <FormField label="Primary domain" required error={err.domain}><input value={v.domain} onChange={(e) => setV({ ...v, domain: e.target.value })} className={inputCls(!!err.domain)} placeholder="example.com" /></FormField>
          <FormField label="Contact email" required error={err.email}><input value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} className={inputCls(!!err.email)} placeholder="you@example.com" /></FormField>
          <Button disabled={!ok} onClick={() => { setDone(true); toast.success('Saved (simulated)') }}>Create project</Button>
        </div>
        <div className="space-y-3">{n > 0 && <InlineAlert tone="bad" title={`${n} field${n > 1 ? 's' : ''} need attention`}>Fix the highlighted fields to continue.</InlineAlert>}{done && <InlineAlert tone="ok" title="Project created" />}{!n && !done && <InlineAlert tone="info" title="Live validation">Errors appear as you type; the primary button stays disabled until every required field is valid.</InlineAlert>}</div>
      </div>
    </Demo>
  )
}

function WizardPattern() {
  const [s, setS] = useState(0)
  const steps = ['Plan', 'Configure', 'Review', 'Pay']
  return (
    <Demo label="Wizard pattern · persistent summary, back/continue, no dead ends" sim>
      <div className="space-y-5"><Stepper steps={steps} current={s} onStep={setS} /><div className="grid gap-4 md:grid-cols-[1fr_260px]"><div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-line-2 text-[13px] text-dim">Step {s + 1}: {steps[s]}</div><div className="rounded-xl border border-line p-4 text-[13px]"><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Summary</div><div className="mt-2 flex justify-between"><span className="text-mute">VPS Pro</span><span>$12.00</span></div><div className="flex justify-between"><span className="text-mute">Backups</span><span>$2.00</span></div></div></div><div className="flex justify-between"><Button variant="outline" disabled={!s} onClick={() => setS(s - 1)}>Back</Button><Button onClick={() => setS(Math.min(3, s + 1))}>{s === 3 ? 'Pay $14.00' : 'Continue'}</Button></div></div>
    </Demo>
  )
}

function ResponsivePattern() {
  return (
    <Demo label="Responsive table → card list (below 640px)">
      <div className="grid gap-6 md:grid-cols-2">
        <div><div className="mb-2 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Desktop · table</div><div className="rounded-lg border border-line text-[12.5px]">{CUSTOMERS.slice(0, 3).map((c) => <div key={c.id} className="grid grid-cols-[1fr_80px_60px] items-center gap-2 border-b border-line/50 px-3 py-2.5 last:border-b-0"><span className="truncate">{c.name}</span><span className="text-dim">{c.plan}</span><span className="text-right tabular-nums">{money(c.mrr)}</span></div>)}</div></div>
        <div><div className="mb-2 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Mobile · stacked rows</div><div className="mx-auto w-64 space-y-2">{CUSTOMERS.slice(0, 3).map((c) => <div key={c.id} className="rounded-xl border border-line bg-black/30 p-3"><div className="flex items-center justify-between"><span className="text-[13px] font-medium">{c.name}</span><span className="tabular-nums text-[13px]">{money(c.mrr)}</span></div><div className="mt-1 flex items-center justify-between text-xs text-dim"><span>{c.plan} · {c.country}</span><StatusBadge status={c.status === 'active' ? 'running' : 'overdue'} /></div></div>)}</div></div>
      </div>
    </Demo>
  )
}

/* ---------------- layout models ---------------- */
const LOG = Array.from({ length: 28 }, (_, i) => [`12:${String(i).padStart(2, '0')}`, ['Deployed #' + (480 + i), 'Snapshot created', 'Firewall updated', 'Backup completed', 'Domain verified'][i % 5]])

function ResizableModel() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Demo label="ResizablePanel · horizontal (drag the handle, or focus it and use arrows · double-click resets)" sim>
        <ResizablePanel className="h-64" initial={38} min={22} max={70}
          first={<div className="divide-y divide-line/60 text-[13px]">{['server.js', 'package.json', '.env', 'README.md', 'logs/'].map((f, i) => <div key={f} className={cn('px-4 py-2.5 text-mute', i === 0 && 'bg-white/[0.05] text-fg')}>{f}</div>)}</div>}
          second={<pre className="p-4 font-mono text-[12px] leading-6 text-fg/75">{"import http from 'http'\nconst port = 3000\nhttp.createServer((q, r) => {\n  r.end('ok')\n}).listen(port)"}</pre>} />
      </Demo>
      <Demo label="ResizablePanel · vertical (editor over console)" sim>
        <ResizablePanel direction="vertical" className="h-64" initial={55} min={25} max={80}
          first={<pre className="p-4 font-mono text-[12px] leading-6 text-fg/75">{"const total = items.reduce((a, b) => a + b.price, 0)\nconsole.log(total)"}</pre>}
          second={<div className="bg-black p-3 font-mono text-[12px] leading-6 text-ok">$ node build.js<br />✓ built in 412 ms</div>} />
      </Demo>
    </div>
  )
}
function ScrollModel() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Demo label="ScrollContainer · with sticky header (hairline appears when scrolled)" pad={false}>
        <ScrollContainer height={260} header={<span className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Activity · last 28 events</span>}>
          <ul className="space-y-2.5 text-[13px]">{LOG.map(([t, m], i) => <li key={i} className="flex gap-3"><span className="font-mono text-dim">{t}</span><span className="text-mute">{m}</span></li>)}</ul>
        </ScrollContainer>
      </Demo>
      <Demo label="ScrollContainer · rules" >
        <ul className="space-y-2.5 text-[13px] text-mute">{['Edge hairlines show that content continues above or below, with no gradients.', 'A 1px progress line tracks position without taking space.', '“Scroll for more” disappears at the bottom.', 'Back-to-top appears after 160px.', 'Focusable, so keyboard users can scroll with arrows.', 'overscroll-contain keeps the page from scrolling behind it.'].map((x) => <li key={x} className="flex gap-2.5"><i className="mt-2 size-1 shrink-0 rounded-full bg-dim" />{x}</li>)}</ul>
      </Demo>
    </div>
  )
}
function DetailModel() {
  const [dirty, setDirty] = useState(true)
  return (
    <Demo label="DetailLayout · header, tabs, main column, sticky inspector, action footer (resize the window: the inspector drops below)" sim className="p-4 sm:p-6">
      <DetailLayout
        crumbs={['Servers', 'blipmade-prod']}
        title="blipmade-prod"
        subtitle="VPS Pro · Frankfurt · 45.83.12.9"
        status={<StatusBadge status="running" />}
        actions={<><Button variant="outline">Console</Button><Button variant="outline">Restart</Button></>}
        tabs={[
          { id: 'o', label: 'Overview', content: <><Card className="p-5"><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Live usage</div><div className="mt-4 grid grid-cols-3 gap-3 text-center">{[['CPU', '34%'], ['RAM', '61%'], ['DISK', '48%']].map(([a, b]) => <div key={a} className="rounded-lg border border-line p-3"><div className="font-mono text-[10px] text-dim">{a}</div><div className="mt-1 text-lg font-semibold">{b}</div></div>)}</div></Card><Card className="p-5 text-[13px] text-mute">Content for the selected tab lives here. The tab bar scrolls sideways on small screens.</Card></> },
          { id: 'b', label: 'Backups', badge: 3, content: <Card className="p-5 text-[13px] text-mute">3 snapshots, latest today 03:00.</Card> },
          { id: 'n', label: 'Network', content: <Card className="p-5 text-[13px] text-mute">IPv4, IPv6 and 4 firewall rules.</Card> },
          { id: 's', label: 'Settings', content: <Card className="p-5 text-[13px] text-mute" onChange={() => setDirty(true)}>Startup command, environment variables, danger zone.</Card> },
        ]}
        aside={<><Card className="p-4 text-[13px]"><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Details</div><dl className="mt-3 space-y-2">{[['Plan', 'VPS Pro'], ['Uptime', '23d 4h'], ['Next due', 'Dec 02 · $12.00']].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-dim">{k}</dt><dd>{v}</dd></div>)}</dl></Card><Card className="p-4 text-[13px]"><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Tags</div><div className="mt-3 flex flex-wrap gap-1.5">{['prod', 'eu', 'api'].map((t) => <Badge key={t} dot={false}>{t}</Badge>)}</div></Card></>}
        footer={dirty ? <><span className="flex items-center gap-2 text-[13px]"><i className="size-1.5 rounded-full bg-warn" />Unsaved changes</span><span className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => setDirty(false)}>Discard</Button><Button size="sm" onClick={() => setDirty(false)}>Save changes</Button></span></> : null}
      />
    </Demo>
  )
}

export default function Patterns() {
  return <Doc title="Patterns" lead="How the components combine: dense data tables with saved views, forms that validate as you type, confirmations scaled to risk, and the rules for collapsing desktop layouts into mobile ones." sections={[
    { id: 'tables', title: 'Tables & filtering', node: <><TablePattern /><FilterBuilder /></> },
    { id: 'forms', title: 'Forms & validation', node: <FormPattern /> },
    { id: 'wizard', title: 'Wizards & checkout', node: <WizardPattern /> },
    { id: 'confirm', title: 'Confirmation scale', note: 'match friction to risk', node: <Demo><div className="grid gap-3 text-[13px] sm:grid-cols-3">{[['Reversible', 'No dialog. Show a toast with Undo.', 'Rename, toggle, tag'], ['Disruptive', 'Confirm dialog with consequence copy.', 'Restart, stop, restore'], ['Destructive', 'Type the resource name to confirm.', 'Delete server, close account']].map(([a, b, c]) => <div key={a} className="rounded-lg border border-line p-4"><div className="font-medium">{a}</div><div className="mt-1 text-mute">{b}</div><div className="mt-2 font-mono text-[11px] text-dim">{c}</div></div>)}</div></Demo> },
    { id: 'resizable', title: 'Layout · ResizablePanel', node: <ResizableModel /> },
    { id: 'scroll', title: 'Layout · ScrollContainer', node: <ScrollModel /> },
    { id: 'detail', title: 'Layout · DetailLayout', node: <DetailModel /> },
    { id: 'responsive', title: 'Responsive behaviour', node: <ResponsivePattern /> },
  ]} />
}
