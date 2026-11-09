import { Brand } from '../components/logos.jsx'
import { useMemo, useState } from 'react'
import { NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Activity, AlertTriangle, BarChart3, Bell, BookOpen, Boxes, Cloud, CreditCard, FileText, Globe, HardDrive, LayoutDashboard, LifeBuoy, Mail, Megaphone, Package, Plus, Search, Server, Settings, Shield, ShieldAlert, Tag, Users, Workflow, ScrollText, UserCog, Cpu, Receipt, Network, X } from 'lucide-react'
import { MobileSheet, Badge, Button, Card, CardBody, CardHeader, CardTitle, ChipTabs, Dialog, DialogContent, Input, Segmented, Separator, StatusBadge, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui.jsx'
import { Checkbox, DataTable, FormField, InlineAlert, Select, inputCls } from '../components/ui2.jsx'
import { DotBars, DotNum } from '../components/DotViz.jsx'
import { DotText } from '../builder/FxBits.jsx'
import { AuditEvent, IncidentCard, InfrastructureNode, OrderTimeline, TicketThread } from '../components/product.jsx'
import { GEN, KPI, Page } from './ListPage.jsx'
import { AUDIT, CUSTOMERS, INCIDENTS, JOBS, NODES, ORDERS, QUEUE, REVENUE, STAFF } from '../lib/mock'
import { cn, money } from '../lib/utils'

const GROUPS = [
  ['Overview', [['', 'Dashboard', LayoutDashboard]]],
  ['Customers', [['customers', 'Customers', Users], ['orders', 'Orders', Receipt], ['services', 'Services', Server], ['vps', 'VPS', Cloud]]],
  ['Catalog', [['products', 'Products', Package], ['pricing', 'Pricing', Tag], ['promotions', 'Promotions', Megaphone]]],
  ['Insights', [['reports', 'Reports', BarChart3], ['crm', 'CRM', Users]]],
  ['Support', [['support', 'Console', LifeBuoy], ['automations', 'Automations', Workflow], ['kb', 'Knowledge base', BookOpen], ['abuse', 'Abuse reports', ShieldAlert]]],
  ['Platform', [['infrastructure', 'Infrastructure', Network], ['incidents', 'Incidents', AlertTriangle], ['operations', 'Operations', Cpu], ['backups', 'Backups', HardDrive], ['mail', 'Mail hosting', Mail]]],
  ['System', [['templates', 'Email templates', FileText], ['notifications', 'Notifications', Bell], ['staff', 'Staff & roles', UserCog], ['settings', 'Settings', Settings], ['audit', 'Audit log', ScrollText]]],
]
const ALL = GROUPS.flatMap(([, i]) => i)

/* ----------------------------- Dashboard ----------------------------- */
function Dashboard() {
  return (
    <Page title="Dashboard" desc="Operations at a glance. Mock data.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><KPI label="MRR" value="$18.4K" delta="+6.2%" /><KPI label="New orders · 24h" value="132" delta="+11" /><KPI label="Open tickets" value="27" delta="+4" bad /><KPI label="Capacity" value="71%" delta="fra-2 hot" bad /></div>
      <div className="grid gap-4 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHeader><CardTitle>Revenue · 12 months</CardTitle></CardHeader><CardBody><DotBars values={REVENUE} rows={10} unit="K" /></CardBody></Card><Card><CardHeader><CardTitle>Needs attention</CardTitle></CardHeader><CardBody className="space-y-2.5">{[['bad', 'ash-1 is offline', '2 h'], ['warn', 'fra-2 CPU above 85%', '35 m'], ['warn', 'dns.verify failing', '2 m'], ['info', '3 refunds awaiting review', '']].map(([t, l, w]) => <div key={l} className="flex items-center gap-3 text-[13px]"><i className={cn('size-2 rounded-full', t === 'bad' ? 'bg-bad' : t === 'warn' ? 'bg-warn' : 'bg-info')} /><span className="flex-1">{l}</span><span className="font-mono text-[11px] text-dim">{w}</span></div>)}</CardBody></Card></div>
      <div className="grid gap-4 lg:grid-cols-2"><Card><CardHeader><CardTitle>Recent orders</CardTitle></CardHeader><div className="mt-3"><DataTable dense columns={[{ key: 'id', label: 'Order', cell: (r) => <span className="font-mono text-[12.5px]">{r.id}</span> }, { key: 'customer', label: 'Customer' }, { key: 'total', label: 'Total', align: 'right', cell: (r) => money(r.total) }, { key: 'status', label: 'Status', cell: (r) => <StatusBadge status={r.status === 'completed' ? 'paid' : r.status === 'failed' ? 'overdue' : 'unpaid'} /> }]} rows={ORDERS} /></div></Card><Card><CardHeader><CardTitle>Audit</CardTitle></CardHeader><div className="mt-3">{AUDIT.slice(0, 4).map((e) => <AuditEvent key={e.id} e={e} />)}</div></Card></div>
    </Page>
  )
}

/* ----------------------------- Customers + inspector ----------------------------- */
function Customers() {
  const [q, setQ] = useState('')
  const [f, setF] = useState('all')
  const [sel, setSel] = useState(CUSTOMERS[0])
  const rows = CUSTOMERS.filter((c) => (f === 'all' || c.status === f) && (c.name + c.mail).toLowerCase().includes(q.toLowerCase()))
  const st = (s) => <StatusBadge status={s === 'active' ? 'running' : s === 'past_due' ? 'overdue' : 'stopped'} />
  return (
    <Page title="Customers" desc="Search, filter and open a customer in the inspector." actions={<Button variant="outline"><Plus />Invite</Button>}>
      <div className="grid items-start gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3"><ChipTabs value={f} onValueChange={setF} items={[['all', 'All', CUSTOMERS.length], ['active', 'Active'], ['past_due', 'Past due'], ['suspended', 'Suspended']]} /><div className="relative ml-auto w-52"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-dim" /><Input className="h-8 pl-8" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" /></div></div>
          <DataTable dense onRowClick={setSel} columns={[{ key: 'name', label: 'Customer', cell: (r) => <div className={cn(sel?.id === r.id && 'text-fg')}><div className="font-medium text-fg">{r.name}</div><div className="text-xs text-dim">{r.mail}</div></div> }, { key: 'plan', label: 'Plan' }, { key: 'status', label: 'Status', cell: (r) => st(r.status) }, { key: 'mrr', label: 'MRR', align: 'right', cell: (r) => money(r.mrr) }]} rows={rows} empty="No customers match" />
        </Card>
        {sel && (
          <Card className="sticky top-0">
            <CardBody className="space-y-4">
              <div className="flex items-start gap-3"><span className="grid size-11 place-items-center rounded-full border border-line-2 bg-white/5 text-base">{sel.name[0]}</span><div className="flex-1"><div className="text-[15px] font-semibold">{sel.name}</div><div className="text-xs text-dim">{sel.mail}</div></div>{st(sel.status)}</div>
              <div className="grid grid-cols-3 gap-2 text-center">{[['MRR', money(sel.mrr)], ['Services', sel.services], ['Since', sel.since]].map(([a, b]) => <div key={a} className="rounded-lg border border-line p-2"><div className="font-mono text-[10px] uppercase text-dim">{a}</div><div className="mt-1 text-[13px]">{b}</div></div>)}</div>
              <InlineAlert tone={sel.risk === 'high' ? 'bad' : sel.risk === 'medium' ? 'warn' : 'ok'} title={`${sel.risk[0].toUpperCase() + sel.risk.slice(1)} risk`}>{sel.country} · plan {sel.plan}</InlineAlert>
              <div><div className="mb-2 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Recent activity</div><OrderTimeline events={[['Logged in', 'Chrome · ' + sel.country, '10:41'], ['Ordered VPS Pro', 'ORD-20418', 'Yesterday', 'ok'], ['Opened ticket T-5521', '', 'Mon', 'warn']]} /></div>
              <div className="flex gap-2"><Button className="flex-1" onClick={() => toast('Impersonation simulated')}>Impersonate</Button><Button variant="outline" onClick={() => toast('Email composer (simulated)')}>Email</Button></div>
            </CardBody>
          </Card>
        )}
      </div>
    </Page>
  )
}

/* ----------------------------- Orders ----------------------------- */
function Orders() {
  const [open, setOpen] = useState(null)
  return (
    <Page title="Orders" desc="Every order with its provisioning state.">
      <Card className="overflow-hidden"><DataTable onRowClick={setOpen} columns={[{ key: 'id', label: 'Order', cell: (r) => <span className="font-mono text-[12.5px]">{r.id}</span> }, { key: 'customer', label: 'Customer' }, { key: 'item', label: 'Items' }, { key: 'total', label: 'Total', align: 'right', cell: (r) => money(r.total) }, { key: 'status', label: 'Status', cell: (r) => <StatusBadge status={r.status === 'completed' ? 'paid' : r.status === 'failed' ? 'overdue' : r.status === 'provisioning' ? 'restarting' : 'unpaid'} /> }, { key: 'when', label: 'When' }]} rows={ORDERS} /></Card>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        {open && <DialogContent side title={open.id} description={`${open.customer} · ${open.item}`}><div className="space-y-6"><StatusBadge status={open.status === 'completed' ? 'paid' : open.status === 'failed' ? 'overdue' : 'unpaid'} /><OrderTimeline events={[['Order placed', open.item, open.when, 'ok'], ['Payment captured', money(open.total), open.when, 'ok'], [open.status === 'failed' ? 'Provisioning failed' : 'Provisioning', open.status === 'failed' ? 'No capacity in fra-2' : 'fra-1', 'now', open.status === 'failed' ? 'bad' : 'warn']]} />{open.status === 'failed' && <InlineAlert tone="bad" title="Action needed" action={<Button size="sm" onClick={() => toast.success('Retry queued (simulated)')}>Retry</Button>}>Retry on another node or refund the customer.</InlineAlert>}<div className="flex gap-2"><Button variant="outline" className="flex-1">Refund</Button><Button variant="outline" className="flex-1">Open customer</Button></div></div></DialogContent>}
      </Dialog>
    </Page>
  )
}

/* ----------------------------- Products & pricing ----------------------------- */
function Products() {
  const [edit, setEdit] = useState(null)
  const P = [{ id: 'p1', name: 'VPS Nano', cat: 'VPS', price: 4, active: true }, { id: 'p2', name: 'VPS Pro', cat: 'VPS', price: 12, active: true }, { id: 'p3', name: 'Web Hosting Nano', cat: 'Web', price: 4, active: true }, { id: 'p4', name: 'Managed DB Max', cat: 'Database', price: 29, active: false }]
  if (edit) return <ProductEditor p={edit} onBack={() => setEdit(null)} />
  return <Page title="Products" desc="Catalog of everything customers can order." actions={<Button><Plus />New product</Button>}><Card className="overflow-hidden"><DataTable onRowClick={setEdit} columns={[{ key: 'name', label: 'Product', cell: (r) => <span className="font-medium">{r.name}</span> }, { key: 'cat', label: 'Category' }, { key: 'price', label: 'From', align: 'right', cell: (r) => money(r.price) }, { key: 'active', label: 'Visible', cell: (r) => <Switch checked={r.active} onClick={(e) => e.stopPropagation()} aria-label="Visible" /> }]} rows={P} /></Card></Page>
}
function ProductEditor({ p, onBack }) {
  const [dirty, setDirty] = useState(false)
  return (
    <div className="space-y-5 pb-20">
      <button onClick={onBack} className="text-[13px] text-dim hover:text-fg">← Products</button>
      <h1 className="text-xl font-semibold tracking-tight">{p.name}</h1>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]"><div className="space-y-4"><Card><CardHeader><CardTitle>General</CardTitle></CardHeader><CardBody className="space-y-4" onChange={() => setDirty(true)}><FormField label="Name"><input defaultValue={p.name} className={inputCls()} /></FormField><FormField label="Description" optional><textarea rows={3} defaultValue="NVMe virtual server with root access." className={cn(inputCls(), 'h-auto py-2')} /></FormField></CardBody></Card><Card><CardHeader><CardTitle>Pricing</CardTitle></CardHeader><CardBody className="grid gap-3 sm:grid-cols-3" onChange={() => setDirty(true)}>{[['Monthly', p.price], ['Quarterly', +(p.price * 2.76).toFixed(2)], ['Yearly', +(p.price * 9.6).toFixed(2)]].map(([l, v]) => <FormField key={l} label={l}><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-dim">$</span><input defaultValue={v} className={cn(inputCls(), 'pl-7 font-mono')} /></div></FormField>)}</CardBody></Card></div><Card className="h-fit"><CardHeader><CardTitle>Availability</CardTitle></CardHeader><CardBody className="space-y-3">{['Frankfurt', 'Amsterdam', 'Helsinki', 'Ashburn'].map((r) => <label key={r} className="flex items-center justify-between text-[13.5px]">{r}<Switch defaultChecked={r !== 'Ashburn'} onCheckedChange={() => setDirty(true)} /></label>)}</CardBody></Card></div>
      {dirty && <div className="anim-menu fixed inset-x-0 bottom-0 z-30 flex items-center justify-center pb-4"><div className="flex items-center gap-4 rounded-xl border border-line-2 bg-[#101012] px-4 py-2.5 shadow-2xl shadow-black/60"><span className="flex items-center gap-2 text-[13px]"><i className="size-1.5 rounded-full bg-warn" />Unsaved changes</span><Button variant="ghost" size="sm" onClick={() => setDirty(false)}>Discard</Button><Button size="sm" onClick={() => { setDirty(false); toast.success('Saved (simulated)') }}>Save</Button></div></div>}
    </div>
  )
}

/* ----------------------------- Support console ----------------------------- */
function SupportConsole() {
  const [sel, setSel] = useState(QUEUE[0])
  return (
    <Page title="Support console" desc="Queue, conversation and customer context in one view.">
      <div className="grid h-[calc(100dvh-210px)] min-h-[480px] gap-4 xl:grid-cols-[300px_1fr_280px]">
        <Card className="overflow-y-auto">{QUEUE.map((t) => <button key={t.id} onClick={() => setSel(t)} className={cn('w-full border-b border-line/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-hover', sel.id === t.id && 'bg-white/[0.06]')}><div className="flex items-center justify-between"><span className="font-mono text-[11px] text-dim">{t.id}</span><Badge tone={t.pri === 'urgent' ? 'bad' : t.pri === 'high' ? 'warn' : 'neutral'} dot={false}>{t.pri}</Badge></div><div className="mt-1 text-[13.5px] font-medium leading-snug">{t.subj}</div><div className="mt-1 flex justify-between text-xs text-dim"><span>{t.cust}</span><span className={t.sla === 'Overdue' ? 'text-bad' : ''}>SLA {t.sla}</span></div></button>)}</Card>
        <Card className="flex min-h-0 flex-col"><div className="flex items-center justify-between border-b border-line px-4 py-3"><div><div className="text-[14px] font-medium">{sel.subj}</div><div className="text-xs text-dim">{sel.cust} · assigned {sel.agent}</div></div><div className="flex gap-2"><Select className="!h-8 w-28" value="open" onValueChange={() => {}} options={['open', 'pending', 'solved']} /><Button size="sm" variant="outline">Assign</Button></div></div><div className="min-h-0 flex-1" key={sel.id}><TicketThread initial={[['bot', sel.subj, '09:10'], ['me', 'Thanks for looking into this.', '09:12']].map(([w, m, t]) => [w === 'bot' ? 'me' : 'bot', m, t])} agent="Customer" /></div></Card>
        <Card className="overflow-y-auto"><CardBody className="space-y-4 text-[13px]"><div><div className="font-medium">{sel.cust}</div><div className="text-xs text-dim">Business · 7 services</div></div><Separator /><div className="space-y-2">{[['MRR', '$142.00'], ['Open tickets', '2'], ['Last login', '10:41']].map(([a, b]) => <div key={a} className="flex justify-between"><span className="text-dim">{a}</span><span>{b}</span></div>)}</div><Separator /><div className="space-y-2"><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Macros</div>{['Reset firewall', 'Request more info', 'Close as solved'].map((m) => <Button key={m} variant="outline" size="sm" className="w-full justify-start" onClick={() => toast(`${m} (simulated)`)}>{m}</Button>)}</div></CardBody></Card>
      </div>
    </Page>
  )
}

/* ----------------------------- Infrastructure / incidents / operations ----------------------------- */
const Infra = () => <Page title="Infrastructure" desc="Nodes, capacity and health." actions={<Button variant="outline">Add node</Button>}><div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">{NODES.map((n) => <InfrastructureNode key={n.id} n={n} />)}</div></Page>
const Incidents = () => <Page title="Incidents" desc="Active and recent incidents." actions={<Button><Plus />Declare incident</Button>}><div className="grid gap-3 lg:grid-cols-2">{INCIDENTS.map((i) => <IncidentCard key={i.id} i={i} />)}</div></Page>
const Operations = () => <Page title="Operations" desc="Job queues and workers."><Card className="overflow-hidden"><DataTable columns={[{ key: 'name', label: 'Queue', cell: (r) => <span className="font-mono text-[12.5px]">{r.name}</span> }, { key: 'state', label: 'State', cell: (r) => <Badge tone={r.state === 'running' ? 'ok' : r.state === 'failed' ? 'bad' : 'neutral'}>{r.state}</Badge> }, { key: 'rate', label: 'Throughput' }, { key: 'last', label: 'Last run' }, { key: 'fail', label: 'Failed', align: 'right', cell: (r) => <span className={r.fail ? 'text-bad' : ''}>{r.fail}</span> }, { key: 'a', label: '', cell: (r) => <Button size="sm" variant="ghost" onClick={() => toast(`Retry ${r.name} (simulated)`)}>Retry</Button> }]} rows={JOBS} /></Card></Page>
const Staff = () => (
  <Page title="Staff & roles" desc="Who can do what." actions={<Button><Plus />Invite staff</Button>}><Card className="overflow-hidden"><div className="grid grid-cols-[1fr_repeat(5,80px)] border-b border-line px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><span>Member</span>{['Customers', 'Billing', 'Infra', 'Support', 'Settings'].map((c) => <span key={c} className="text-center">{c}</span>)}</div>{STAFF.map((s) => <div key={s.id} className="grid grid-cols-[1fr_repeat(5,80px)] items-center border-b border-line/50 px-4 py-3 text-[13px] last:border-b-0"><div><div className="font-medium">{s.name}</div><div className="text-xs text-dim">{s.role} · {s.mail}</div></div>{Object.values(s.perms).map((p, i) => <div key={i} className="text-center"><Select className="!h-7 !w-16 !px-2 !text-[11px] mx-auto" value={p || 'none'} onValueChange={() => toast('Permission change (simulated)')} options={[['none', '—'], ['r', 'Read'], ['rw', 'Write']]} /></div>)}</div>)}</Card></Page>
)
const Audit = () => { const [q, setQ] = useState(''); return <Page title="Audit log" desc="Immutable record of staff and system actions." actions={<Input className="h-8 w-56" placeholder="Filter by actor or action" value={q} onChange={(e) => setQ(e.target.value)} />}><Card>{AUDIT.filter((e) => (e.actor + e.act + e.target).toLowerCase().includes(q.toLowerCase())).map((e) => <AuditEvent key={e.id} e={e} />)}</Card></Page> }
const Reports = () => <Page title="Reports" desc="Sales analytics." actions={<Segmented value="12m" onValueChange={() => {}} options={[['3m', '3M'], ['12m', '12M'], ['all', 'All']]} />}><div className="grid gap-4 sm:grid-cols-3"><KPI label="Revenue" value="$412K" delta="+18%" /><KPI label="Churn" value="2.1%" delta="−0.4" /><KPI label="ARPU" value="$38" delta="+$2" /></div><Card><CardHeader><CardTitle>Monthly revenue</CardTitle></CardHeader><CardBody><DotBars values={REVENUE} rows={12} unit="K" /></CardBody></Card></Page>
const Pricing = () => <Page title="Pricing" desc="Price books and regional overrides."><Card className="overflow-hidden"><DataTable columns={[{ key: 'p', label: 'Product' }, { key: 'm', label: 'Monthly', align: 'right' }, { key: 'q', label: 'Quarterly', align: 'right' }, { key: 'y', label: 'Yearly', align: 'right' }, { key: 'e', label: 'EU VAT', align: 'right' }]} rows={[{ id: 1, p: 'VPS Nano', m: '$4.00', q: '$11.04', y: '$38.40', e: '19%' }, { id: 2, p: 'VPS Pro', m: '$12.00', q: '$33.12', y: '$115.20', e: '19%' }, { id: 3, p: 'VPS Max', m: '$29.00', q: '$80.04', y: '$278.40', e: '19%' }]} /></Card></Page>

const SECTIONS = { '': <Dashboard />, customers: <Customers />, orders: <Orders />, products: <Products />, pricing: <Pricing />, reports: <Reports />, support: <SupportConsole />, infrastructure: <Infra />, incidents: <Incidents />, operations: <Operations />, staff: <Staff />, audit: <Audit />, ...GEN }

export default function AdminApp() {
  const { pathname } = useLocation()
  const seg = pathname.replace(/^\/admin\/?/, '').split('/')[0]
  const cur = ALL.find((a) => a[0] === seg) || ALL[0]
  const CurIcon = cur[2]
  const [mob, setMob] = useState(false)
  const Side = () => (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-5"><Brand height={12} /><Badge tone="bad" dot={false}>Admin</Badge></div>
      <div className="flex-1 space-y-4 overflow-y-auto p-3">{GROUPS.map(([g, items]) => <div key={g}><div className="px-2.5 pb-1 font-mono text-[10px] uppercase tracking-[.08em] text-dim">{g}</div>{items.map(([to, l, I]) => <NavLink key={to} end to={'/admin' + (to ? '/' + to : '')} onClick={() => setMob(false)} className={({ isActive }) => cn('flex h-8 items-center gap-3 rounded-[10px] px-2.5 text-[13px] font-medium transition-colors', isActive ? 'bg-white/[0.08] text-fg' : 'text-fg/70 hover:bg-hover hover:text-fg')}>{({ isActive }) => (<><I className={cn('size-4', isActive && 'text-[var(--brand)]')} />{l}</>)}</NavLink>)}</div>)}</div>
    </>
  )
  return (
    <div className="flex h-full">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-[#0b0b0d] md:flex">{Side()}</aside>
      <MobileSheet open={mob} onClose={() => setMob(false)}>{Side()}</MobileSheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5"><button className="grid size-9 place-items-center rounded-lg text-mute md:hidden" onClick={() => setMob(true)} aria-label="Menu"><Boxes className="size-4" /></button><span className="grid size-8 place-items-center rounded-lg border border-line-2 bg-white/[0.04] text-mute"><CurIcon className="size-4" /></span><h2 className="text-[15px] font-semibold tracking-tight">{cur[1]}</h2><div className="flex-1" /><div className="hidden items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-[12.5px] text-dim sm:flex"><Search className="size-3.5" />Search everything<kbd className="ml-6 font-mono text-[10px]">⌘K</kbd></div></header>
        <main className="min-h-0 flex-1 overflow-y-auto"><div className="anim-page mx-auto max-w-6xl p-6 md:p-8" key={pathname}>{SECTIONS[seg] ?? SECTIONS['']}</div></main>
      </div>
    </div>
  )
}
