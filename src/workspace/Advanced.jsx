import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Badge, Button, Segmented } from '../components/ui.jsx'
import { Doc, Demo } from './Doc.jsx'
import { AsyncOperation, AuditInspector, BulkTable, ConfigEditor, DestructiveDialog, DiffViewer, JobTimeline, LogViewer, PermissionMatrix, ResourceAllocator, genLogs } from '../studio/patterns.jsx'

const CFG = `{
  "name": "api-gateway",
  "runtime": "node22",
  "autoscale": { "min": 1, "max": 4 },
  "healthcheck": { "path": "/health", "interval": 15 },
  "env": ["NODE_ENV", "PORT"]
}`
const BEFORE = `server {
  listen 443 ssl;
  server_name example-studio.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
  }
}`
const AFTER = `server {
  listen 443 ssl http2;
  server_name example-studio.com www.example-studio.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_read_timeout 60s;
  }
}`
const AUDIT = [
  { id: 1, actor: 'stefan', action: 'product.price.update', target: 'VPS Pro', ip: '85.12.x.x', req: 'req_8f2a91', session: 'ses_41c', when: '10:42', risk: 'medium', before: '{\n  "monthly": 11.00,\n  "yearly": 105.60\n}', after: '{\n  "monthly": 12.00,\n  "yearly": 115.20\n}' },
  { id: 2, actor: 'maria', action: 'customer.credit.adjust', target: 'cus_2041', ip: '85.12.x.x', req: 'req_7c1b04', session: 'ses_2ab', when: '10:21', risk: 'high', before: '{ "credit": 0 }', after: '{ "credit": 25 }' },
  { id: 3, actor: 'system', action: 'invoice.generated', target: 'INV-1048', ip: '-', req: 'job_93e', session: 'system', when: '10:00', risk: 'low', before: null },
  { id: 4, actor: 'jonas', action: 'node.drain', target: 'fra-2', ip: '10.0.4.x', req: 'req_55d201', session: 'ses_9d0', when: '09:12', risk: 'high', before: '{ "schedulable": true }', after: '{ "schedulable": false }' },
]
const SERVICES = Array.from({ length: 19 }, (_, i) => ({ id: 'svc' + i, name: ['api-gateway', 'web-01', 'mc-survival', 'pg-main', 'bot-worker', 'staging-app', 'redis-cache'][i % 7] + (i > 6 ? '-' + Math.floor(i / 7) : ''), type: ['App', 'VPS', 'Game', 'Database'][i % 4], status: ['running', 'running', 'stopped', 'failed'][(i * 3) % 4], region: ['fra', 'ams', 'hel'][i % 3], mrr: 4 + ((i * 7) % 26) }))
const ST = { running: 'ok', stopped: 'neutral', failed: 'bad' }
const STEPS = [
  { name: 'Order accepted', state: 'done', ms: 420 },
  { name: 'Payment captured', state: 'done', ms: 1180 },
  { name: 'Reserving capacity', state: 'done', ms: 2100, hint: 'fra-1' },
  { name: 'Creating the server', state: 'failed', ms: 8400, hint: 'attempt 2 of 3', log: ['› requesting 4 vCPU / 8 GB on fra-1', '› host fra-1-n3 answered: no free memory', 'error: capacity timeout after 8.4 s'] },
  { name: 'Installing the system image', state: 'queued' },
  { name: 'Opening the network', state: 'queued' },
]

export default function Advanced() {
  const [lstate, setLstate] = useState('ready')
  const [tl, setTl] = useState(STEPS)
  return (
    <Doc title="Advanced patterns" lead="The heavier building blocks the product screens are made of. Each one is interactive here and carries its loading, empty, error and disabled states. Press / inside the log viewer to focus its filter." sections={[
      { id: 'log', title: 'Log viewer', note: 'filter, search, follow, pause', node: <><Segmented value={lstate} onValueChange={(v) => v && setLstate(v)} options={[['ready', 'Streaming'], ['loading', 'Loading'], ['error', 'Disconnected']]} /><LogViewer lines={genLogs(160, 3)} state={lstate} title="api · live" /></> },
      { id: 'timeline', title: 'Job and provisioning timeline', note: 'click a step with a log; retry resumes from the failed step', node: <div className="grid gap-5 lg:grid-cols-2"><Demo label="Failed step with retry" sim><JobTimeline steps={tl} onRetry={(i) => { setTl((s) => s.map((x, k) => k < i ? x : k === i ? { ...x, state: 'running', hint: 'attempt 3 of 3', log: undefined } : { ...x, state: 'queued' })); setTimeout(() => setTl(STEPS.map((x) => ({ ...x, state: 'done', hint: x.hint, log: undefined, ms: x.ms || 1500 }))), 1800); toast('Retrying (simulated)') }} /></Demo><Demo label="Compact"><JobTimeline compact steps={STEPS.slice(0, 3).map((s, i) => ({ ...s, state: i < 2 ? 'done' : 'running', ms: i < 2 ? s.ms : undefined }))} /></Demo></div> },
      { id: 'diff', title: 'Diff viewer', note: 'unified or split, changes only', node: <DiffViewer before={BEFORE} after={AFTER} name="nginx/site.conf" /> },
      { id: 'config', title: 'Configuration editor', note: 'validates as you type, Ctrl/Cmd+S saves', node: <ConfigEditor initial={CFG} name="blipmade.json" schemaHint="autoscale.max up to 8" /> },
      { id: 'alloc', title: 'Resource allocation editor', note: 'node capacity is part of the control', node: <div className="max-w-xl"><ResourceAllocator /></div> },
      { id: 'perm', title: 'Permission matrix', note: 'roles as presets, column toggles', node: <div className="max-w-2xl"><PermissionMatrix rows={['Console', 'Files', 'Databases', 'Backups', 'Network', 'Settings']} initial={{ Console: ['Read', 'Write'], Files: ['Read'] }} /></div> },
      { id: 'audit', title: 'Audit inspector', note: 'list, detail and the change itself', node: <AuditInspector entries={AUDIT} /> },
      { id: 'destructive', title: 'Multi-step destructive action', note: 'impact, acknowledgement, typed name, progress, failure', node: <div className="flex flex-wrap gap-3"><DestructiveDialog target="mc-survival" title="Delete mc-survival?" impact={[['The server and its world', 'are removed for good.', 'bad'], ['14 backups', 'are kept for 7 days, then deleted.', 'warn'], ['The address 45.83.12.9', 'is released.', 'warn']]} acks={['I understand the world cannot be recovered after 7 days.', 'I have downloaded what I need.']} trigger={<Button variant="outline" className="text-bad"><Trash2 />Delete a server</Button>} /><DestructiveDialog fail target="pg-main" title="Delete pg-main?" confirmLabel="Delete database" impact={[['All tables', 'are dropped.', 'bad']]} acks={['I understand this cannot be undone.']} trigger={<Button variant="outline" className="text-bad"><Trash2 />Same, but it fails midway</Button>} /></div> },
      { id: 'async', title: 'Async operation states', note: 'running, long wait, failure, success', node: <div className="grid gap-4 md:grid-cols-3"><AsyncOperation label="Create snapshot" /><AsyncOperation label="Restore backup" steps={['Stopping the server', 'Copying data', 'Starting the server']} timeoutAt={1} /><AsyncOperation label="Reinstall system" failAt={1} steps={['Wiping the disk', 'Writing the image', 'First boot']} /></div> },
      { id: 'table', title: 'Advanced table and bulk actions', note: 'filters, sort, select, bulk bar, pages', node: <div className="space-y-4"><BulkTable title="services" rows={SERVICES} filters={{ items: [['all', 'All'], ['running', 'Running'], ['stopped', 'Stopped'], ['failed', 'Failed']], match: (r, f) => r.status === f }} bulk={[['Restart'], ['Snapshot'], ['Delete', null, true]]} columns={[{ key: 'name', label: 'Service', sortable: true, cell: (r) => <span className="font-medium">{r.name}</span> }, { key: 'type', label: 'Type', sortable: true }, { key: 'region', label: 'Region', className: 'hidden sm:table-cell' }, { key: 'status', label: 'Status', cell: (r) => <Badge tone={ST[r.status]}>{r.status}</Badge> }, { key: 'mrr', label: 'MRR', align: 'right', sortable: true, cell: (r) => '$' + r.mrr.toFixed(2) }]} /><div className="grid gap-4 md:grid-cols-3"><Demo label="Loading"><BulkTable state="loading" rows={[]} columns={[]} /></Demo><Demo label="Error"><BulkTable state="error" rows={[]} columns={[]} /></Demo><Demo label="Empty"><BulkTable rows={[]} columns={[{ key: 'name', label: 'Service' }]} emptyText="No services yet. Deploy your first one." /></Demo></div></div> },
    ]} />
  )
}
