/* Data-driven admin list: KPI strip, search, filter chips, sortable table, bulk select, detail drawer. MOCK data. */
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'
import { Badge, Button, Card, ChipTabs, Dialog, DialogContent, Input, StatusBadge, Switch } from '../components/ui.jsx'
import { DataTable } from '../components/ui2.jsx'
import { DotNum } from '../components/DotViz.jsx'
import { OrderTimeline } from '../components/product.jsx'
import { CRMActivity } from '../components/ui3.jsx'
import { cn } from '../lib/utils'

export const Page = ({ title, desc, actions, children }) => (
  <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-semibold tracking-tight">{title}</h1>{desc && <p className="mt-1 text-[13.5px] text-dim">{desc}</p>}</div><div className="flex flex-wrap items-center gap-2">{actions}</div></div>
    {children}
  </div>
)
export const KPI = ({ label, value, delta, bad }) => (
  <Card className="p-4"><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{label}</div><div className="mt-3 flex items-end justify-between gap-2"><DotNum text={value} height={28} animate={false} />{delta && <span className={cn('font-mono text-[11px]', bad ? 'text-bad' : 'text-ok')}>{delta}</span>}</div></Card>
)

export function ListPage({ title, desc, action, kpis = [], cols, rows, filterKey, filters, detail, empty }) {
  const [q, setQ] = useState('')
  const [f, setF] = useState('all')
  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  const [sel, setSel] = useState([])
  const [open, setOpen] = useState(null)
  const data = useMemo(() => {
    let r = rows.map((x, i) => ({ id: x.id ?? i, ...x }))
    if (filterKey && f !== 'all') r = r.filter((x) => String(x[filterKey]).toLowerCase() === f)
    if (q) r = r.filter((x) => JSON.stringify(x).toLowerCase().includes(q.toLowerCase()))
    if (sort.key) r = [...r].sort((a, b) => (String(a[sort.key]) > String(b[sort.key]) ? 1 : -1) * (sort.dir === 'asc' ? 1 : -1))
    return r
  }, [rows, q, f, sort, filterKey])
  const columns = cols.map(([key, label, cell, sortable = true]) => ({ key, label, cell, sortable }))
  return (
    <Page title={title} desc={desc} actions={action && <Button variant="outline"><Plus />{action}</Button>}>
      {kpis.length > 0 && <div className="grid gap-3 sm:grid-cols-3">{kpis.map(([l, v, d, bad]) => <KPI key={l} label={l} value={v} delta={d} bad={bad} />)}</div>}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          {filters && <ChipTabs value={f} onValueChange={setF} items={[['all', 'All', rows.length], ...filters.map((x) => [x, x[0].toUpperCase() + x.slice(1), rows.filter((r) => String(r[filterKey]).toLowerCase() === x).length])]} />}
          <div className="relative ml-auto w-full sm:w-52"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-dim" /><Input className="h-8 pl-8" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Search ${title}`} /></div>
        </div>
        {sel.length > 0 && <div className="flex items-center gap-3 border-b border-line bg-white/[0.04] px-4 py-2 text-[13px]"><b className="font-medium">{sel.length} selected</b><Button size="sm" variant="ghost" onClick={() => toast('Export simulated')}>Export</Button><Button size="sm" variant="ghost" className="text-bad" onClick={() => { toast.error('Bulk delete simulated'); setSel([]) }}>Delete</Button><button className="ml-auto text-xs text-dim hover:text-fg" onClick={() => setSel([])}>Clear</button></div>}
        <DataTable dense selectable selected={sel} onSelect={setSel} columns={columns} rows={data} sortKey={sort.key} sortDir={sort.dir} onSort={(k) => setSort((x) => ({ key: k, dir: x.key === k && x.dir === 'asc' ? 'desc' : 'asc' }))} onRowClick={setOpen} empty={empty || `No ${title.toLowerCase()} match`} />
      </Card>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        {open && (
          <DialogContent side title={String(open[cols[0][0]])} description={`${title} · detail`}>
            <div className="space-y-6">
              <dl className="space-y-2.5 text-[13.5px]">{cols.slice(1).map(([k, l]) => <div key={k} className="flex justify-between gap-4"><dt className="text-dim">{l}</dt><dd className="text-right">{String(open[k])}</dd></div>)}</dl>
              {detail ? detail(open) : <OrderTimeline events={[['Created', '', '2 weeks ago', 'ok'], ['Last updated', 'by stefan', 'Today']]} />}
              <div className="flex gap-2"><Button className="flex-1" onClick={() => { toast.success('Saved (simulated)'); setOpen(null) }}>Save</Button><Button variant="outline" className="flex-1" onClick={() => setOpen(null)}>Close</Button></div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Page>
  )
}

const sw = (r) => <Switch defaultChecked={r.on} onClick={(e) => e.stopPropagation()} aria-label="Enabled" />
const pill = (v, map = {}) => <Badge tone={map[v] || 'neutral'}>{v}</Badge>
const mono = (k) => (r) => <span className="font-mono text-[12.5px] text-fg">{r[k]}</span>
const strong = (k) => (r) => <span className="font-medium text-fg">{r[k]}</span>

export const GEN = {
  services: <ListPage title="Services" desc="All customer services." action="Provision" filterKey="s" filters={['running', 'stopped', 'suspended']} kpis={[['Total', '2,184', '+31'], ['Running', '2,061'], ['Suspended', '14', '', true]]}
    cols={[['n', 'Service', strong('n')], ['c', 'Customer'], ['t', 'Type'], ['node', 'Node'], ['s', 'Status', (r) => <StatusBadge status={r.s === 'suspended' ? 'overdue' : r.s} />]]}
    rows={[{ n: 'blipmade-prod', c: 'Maya Chen', t: 'VPS Pro', node: 'fra-1', s: 'running' }, { n: 'pg-cluster', c: 'Maya Chen', t: 'Managed DB', node: 'fra-1', s: 'running' }, { n: 'mc-survival', c: 'Kofi Mensah', t: 'Game Server', node: 'hel-1', s: 'stopped' }, { n: 'shop-api', c: 'Elena Rossi', t: 'VPS Max', node: 'ams-1', s: 'running' }, { n: 'spam-relay', c: 'Liu Wei', t: 'VPS Nano', node: 'fra-2', s: 'suspended' }]} />,
  vps: <ListPage title="VPS management" desc="Hypervisor-level view." filterKey="s" filters={['running', 'stopped']} kpis={[['Instances', '1,402', '+18'], ['CPU steal', '0.4%'], ['Orphaned', '3', '', true]]}
    cols={[['n', 'Instance', mono('n')], ['node', 'Node'], ['ip', 'IP'], ['os', 'Image'], ['s', 'State', (r) => <StatusBadge status={r.s} />]]}
    rows={[{ n: 'vps-8841', node: 'fra-1', ip: '45.83.12.9', os: 'Ubuntu 24.04', s: 'running' }, { n: 'vps-8842', node: 'fra-2', ip: '45.83.12.44', os: 'Debian 12', s: 'running' }, { n: 'vps-8790', node: 'ams-1', ip: '45.83.30.7', os: 'Alma 9', s: 'stopped' }, { n: 'vps-8755', node: 'hel-1', ip: '45.83.20.3', os: 'Ubuntu 22.04', s: 'running' }]} />,
  promotions: <ListPage title="Promotions" desc="Codes and campaigns." action="New code" filterKey="state" filters={['active', 'ended']} kpis={[['Redemptions', '1,516', '+88'], ['Influenced', '$24.1K'], ['Avg discount', '14%']]}
    cols={[['c', 'Code', mono('c')], ['d', 'Discount'], ['u', 'Used'], ['e', 'Ends'], ['state', 'State', (r) => pill(r.state, { active: 'ok' })], ['on', 'On', sw, false]]}
    rows={[{ c: 'BLIP20', d: '20% first month', u: 312, e: 'Dec 31', state: 'active', on: true }, { c: 'WELCOME5', d: '$5 credit', u: 1204, e: 'Ongoing', state: 'active', on: true }, { c: 'BLACKFRI25', d: '25% yearly', u: 0, e: 'Nov 30', state: 'active', on: false }, { c: 'SUMMER24', d: '15%', u: 640, e: 'Aug 31', state: 'ended', on: false }]} />,
  crm: <ListPage title="CRM" desc="Leads and customer activity." action="New lead" filterKey="stage" filters={['trial', 'negotiation', 'won']} kpis={[['Pipeline', '$38.4K', '+12%'], ['Win rate', '34%'], ['Avg cycle', '19 D']]}
    cols={[['n', 'Lead', strong('n')], ['stage', 'Stage', (r) => pill(r.stage, { won: 'ok', negotiation: 'warn' })], ['v', 'Value'], ['o', 'Owner']]}
    rows={[{ n: 'Northwind GmbH', stage: 'negotiation', v: '$1,800/yr', o: 'Stefan' }, { n: 'Studio AP', stage: 'trial', v: '$96/yr', o: 'Maria' }, { n: 'Rossi Labs', stage: 'won', v: '$4,200/yr', o: 'Stefan' }, { n: 'Mensah Co', stage: 'trial', v: '$320/yr', o: 'Andrei' }]} detail={() => <CRMActivity />} />,
  automations: <ListPage title="Support automations" desc="Rules that route, tag and reply." action="New rule" kpis={[['Rules active', '12'], ['Automated', '41%', '+3%'], ['Mis-routes', '2', '', true]]}
    cols={[['n', 'Rule', strong('n')], ['t', 'Trigger'], ['a', 'Action'], ['runs', 'Runs / 7d'], ['on', 'On', sw, false]]}
    rows={[{ n: 'Escalate overdue SLA', t: 'SLA < 0', a: 'Assign L2', runs: 18, on: true }, { n: 'Auto-reply billing', t: 'Dept = Billing', a: 'Send macro', runs: 244, on: true }, { n: 'Tag abuse keywords', t: 'Body contains spam', a: 'Add tag', runs: 31, on: false }]} />,
  kb: <ListPage title="Knowledge base" desc="Public and internal articles." action="New article" filterKey="s" filters={['published', 'draft']} kpis={[['Articles', '86'], ['Deflection', '38%', '+4%'], ['Needs review', '5', '', true]]}
    cols={[['t', 'Title', strong('t')], ['c', 'Category'], ['v', 'Views'], ['s', 'State', (r) => pill(r.s, { published: 'ok' })]]}
    rows={[{ t: 'Connect via SSH', c: 'VPS', v: 4210, s: 'published' }, { t: 'Point your domain', c: 'DNS', v: 3988, s: 'published' }, { t: 'Refund policy', c: 'Billing', v: 0, s: 'draft' }, { t: 'Restore a snapshot', c: 'VPS', v: 1540, s: 'published' }]} />,
  abuse: <ListPage title="Abuse reports" desc="Reports awaiting action." filterKey="s" filters={['investigating', 'suspended', 'closed']} kpis={[['Open', '7', '', true], ['Median resolve', '3.2 H'], ['Repeat offenders', '2']]}
    cols={[['i', 'Report', mono('i')], ['t', 'Type'], ['tg', 'Target'], ['s', 'State', (r) => pill(r.s, { investigating: 'warn', suspended: 'bad', closed: 'ok' })]]}
    rows={[{ i: 'AB-77', t: 'Spam', tg: '45.83.x.x', s: 'investigating' }, { i: 'AB-76', t: 'Phishing', tg: 'shop-login.xyz', s: 'suspended' }, { i: 'AB-75', t: 'Copyright', tg: 'cdn.example.org', s: 'closed' }]} />,
  backups: <ListPage title="Backups & recovery" desc="Platform-wide snapshot jobs." action="Run now" filterKey="s" filters={['success', 'failed']} kpis={[['Last full', '03:00'], ['Retention', '30 D'], ['Failed jobs', '1', '', true]]}
    cols={[['n', 'Job', mono('n')], ['l', 'Last run'], ['sz', 'Size'], ['s', 'Result', (r) => pill(r.s, { success: 'ok', failed: 'bad' })]]}
    rows={[{ n: 'nightly-all', l: '03:00', sz: '1.8 TB', s: 'success' }, { n: 'db-hourly', l: '11:00', sz: '212 GB', s: 'success' }, { n: 'offsite-sync', l: '04:10', sz: '1.8 TB', s: 'failed' }]} />,
  mail: <ListPage title="Mail hosting" desc="Domains, mailboxes and deliverability." action="Add domain" filterKey="spf" filters={['ok', 'missing']} kpis={[['Mailboxes', '3,120', '+44'], ['Delivered', '99.2%'], ['Queued', '2']]}
    cols={[['d', 'Domain', strong('d')], ['m', 'Mailboxes'], ['spf', 'SPF/DKIM', (r) => pill(r.spf, { ok: 'ok', missing: 'warn' })], ['q', 'Queue']]}
    rows={[{ d: 'blipmade.app', m: 3, spf: 'ok', q: 0 }, { d: 'northwind.io', m: 24, spf: 'ok', q: 2 }, { d: 'studio-ap.ro', m: 2, spf: 'missing', q: 0 }]} />,
  templates: <ListPage title="Email templates" desc="Transactional emails." action="New template" kpis={[['Templates', '18'], ['Locales', '4'], ['Last edit', 'NOV 02']]}
    cols={[['n', 'Template', strong('n')], ['t', 'Trigger'], ['loc', 'Locales'], ['u', 'Updated']]}
    rows={[{ n: 'Invoice ready', t: 'invoice.created', loc: 'en, de, ro', u: 'Nov 02' }, { n: 'Welcome', t: 'user.registered', loc: 'en, de, ro', u: 'Oct 11' }, { n: 'Server ready', t: 'service.active', loc: 'en', u: 'Oct 11' }]}
    detail={() => <div className="rounded-xl border border-line bg-black/40 p-4 text-[13px] leading-relaxed"><div className="font-mono text-[11px] uppercase text-dim">Preview</div><p className="mt-2">Hi {'{{name}}'},</p><p className="mt-2 text-mute">Your invoice {'{{invoice.id}}'} for {'{{invoice.total}}'} is ready.</p></div>} />,
  notifications: <ListPage title="Notifications" desc="Staff alerting channels." action="Add channel" kpis={[['Channels', '3'], ['Sent / 24h', '218'], ['Muted', '0']]}
    cols={[['c', 'Channel', strong('c')], ['e', 'Events'], ['on', 'On', sw, false]]}
    rows={[{ c: 'Email · ops@', e: 'Incidents, node alerts', on: true }, { c: 'Slack · #billing', e: 'Failed payments', on: true }, { c: 'Webhook', e: 'All orders', on: false }]} />,
  settings: <ListPage title="Settings & integrations" desc="Gateways and providers." action="Add integration" filterKey="s" filters={['connected', 'disconnected']} kpis={[['Integrations', '7'], ['Healthy', '6'], ['Attention', '1', '', true]]}
    cols={[['n', 'Integration', strong('n')], ['s', 'Status', (r) => pill(r.s, { connected: 'ok', disconnected: 'warn' })], ['k', 'Key']]}
    rows={[{ n: 'Stripe (sandbox)', s: 'connected', k: 'sk_test_••••' }, { n: 'Cloudflare DNS', s: 'connected', k: 'cf_••••' }, { n: 'Sentry', s: 'disconnected', k: '—' }]} />,
}
