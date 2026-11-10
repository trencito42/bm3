/* Instance management for an app, a game server or a database. Tabs differ by kind; the header, power controls,
   restart-needed banner and dialogs are shared. Effects are kept for the moments that earn them: a Blip when the
   server is off, when a restore finishes, when the game server lags (Glitch). */
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Archive, Check, ChevronRight, Clock, Copy, Database, FileText, GitBranch, Lock, Network, Play, Plus, RotateCcw, Save, Settings, ShieldCheck, Terminal, Trash2, Users, X } from 'lucide-react'
import { Badge, Button, Dialog, DialogContent, Segmented, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui.jsx'
import { Checkbox, Confirm, CopyValue, FormField, InlineAlert, Select, TagInput, inputCls } from '../components/ui2.jsx'
import { DatabaseCredentials, FileExplorer, FirewallRules, KeyValueEditor, NetworkTraffic, PowerControls, ResourceUsage } from '../components/product.jsx'
import { Orb } from '../builder/FxBits.jsx'
import { AsyncOperation, ConfigEditor, DestructiveDialog, DiffViewer, JobTimeline, LogViewer, PermissionMatrix, ResourceAllocator, genLogs } from './patterns.jsx'
import { Decode, Kv, Panel, SaveBar, ScreenHead, StateHero, Tile, eyebrow } from './kit.jsx'
import { cn } from '../lib/utils'

const KIND = {
  app: { name: 'api-gateway', sub: 'Node.js 22 · fra-1 · :3000', blip: 'dev', tabs: ['overview', 'console', 'files', 'git', 'startup', 'schedules', 'backups', 'databases', 'network', 'access', 'settings'] },
  game: { name: 'mc-survival', sub: 'Paper 1.21.4 · fra-1 · :25565', blip: 'game', tabs: ['overview', 'console', 'game', 'files', 'startup', 'schedules', 'backups', 'network', 'access', 'settings'] },
  db: { name: 'pg-main', sub: 'PostgreSQL 16 · fra-1 · :5432', blip: 'dev', tabs: ['overview', 'console', 'databases', 'backups', 'network', 'access', 'settings'] },
}
const LABEL = { overview: 'Overview', console: 'Console', files: 'Files', git: 'Git', startup: 'Startup', schedules: 'Schedules', backups: 'Backups', databases: 'Databases', network: 'Network', access: 'Access', game: 'Game', settings: 'Settings' }

/* ---------------------------------------------------------------- overview ---------------------------------------------------------------- */
function Overview({ status, kind }) {
  const vals = useMemo(() => Array.from({ length: 36 }, (_, i) => 50 + Math.sin(i / 3) * 30 + ((i * 17) % 23)), [])
  return (
    <div className="space-y-5">
      {status === 'stopped' && <Panel pad={false}><StateHero state="waiting" role={KIND[kind].blip} word="ASLEEP." sub="This instance is stopped. Start it and it is back in a few seconds." small /></Panel>}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Resources" className="lg:col-span-2" actions={<Badge tone="ok">Live</Badge>}><ResourceUsage cpu={status === 'running' ? 31 : 0} ram={status === 'running' ? 54 : 0} disk={22} /><div className="mt-5"><NetworkTraffic values={vals} /></div></Panel>
        <Panel title="Health"><div className="grid grid-cols-2 gap-2"><Tile label="Uptime" value="14d 6h" sub="since Oct 28" /><Tile label="Last deploy" value="3f9a1c2" sub="2 h ago" /><Tile label="Alerts" value="1" tone="warn" sub="memory 86%" /><Tile label="Region" value="fra-1" sub="12 ms" /></div><div className="mt-4"><InlineAlert tone="warn" title="Memory above 85% for 10 minutes">Resize to 8 GB, or ask Byte to find the heaviest process.</InlineAlert></div></Panel>
      </div>
      <Panel title="Activity" desc="Who did what, newest first"><ul className="divide-y divide-line text-[13.5px]">{[['Deployed 3f9a1c2 from main', 'stefan', '2 h ago'], ['Restarted', 'stefan', '1 d ago'], ['Backup created automatically', 'system', '1 d ago'], ['Environment variable LOG_LEVEL changed', 'maria', '3 d ago']].map(([a, b, c]) => <li key={a} className="flex items-center gap-3 py-3"><i className="size-1.5 shrink-0 rounded-full bg-dim" /><span className="min-w-0 flex-1 truncate">{a}</span><span className="hidden text-dim sm:inline">{b}</span><span className="font-mono text-[11px] text-dim">{c}</span></li>)}</ul></Panel>
    </div>
  )
}

/* ---------------------------------------------------------------- console ---------------------------------------------------------------- */
function Console({ status, kind }) {
  const [cmd, setCmd] = useState(''), [hist, setHist] = useState(['help']), [h, setH] = useState(-1), [extra, setExtra] = useState([])
  const logs = useMemo(() => [...genLogs(120, 5), ...extra], [extra])
  if (status === 'stopped') return <Panel pad={false}><StateHero state="waiting" role={KIND[kind].blip} word="OFFLINE." sub="The console connects when the instance is running." small /></Panel>
  const send = (e) => { e.preventDefault(); const v = cmd.trim(); if (!v) return; setHist((x) => [...x, v]); setH(-1); setExtra((x) => [...x, { id: 1000 + x.length, t: '10:58:00', level: 'info', src: 'you', text: `> ${v}` }, { id: 2000 + x.length, t: '10:58:00', level: 'info', src: 'api', text: v === 'help' ? 'commands: restart, status, gc, clear' : `ran "${v}" (simulated)` }]); setCmd('') }
  const key = (e) => { if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.min(hist.length - 1, h + 1); setH(n); setCmd(hist[hist.length - 1 - n] || '') } if (e.key === 'ArrowDown') { e.preventDefault(); const n = Math.max(-1, h - 1); setH(n); setCmd(n < 0 ? '' : hist[hist.length - 1 - n]) } }
  return (
    <div className="space-y-3"><LogViewer lines={logs} height={380} title="Console" />
      <form onSubmit={send} className="flex items-center gap-2 rounded-xl border border-line-2 bg-black px-3"><span className="font-mono text-dim">$</span><input value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={key} aria-label="Command" placeholder="Type a command, Up for history" className="h-11 flex-1 bg-transparent font-mono text-[13px] outline-none placeholder:text-dim" /><Button type="submit" size="sm" variant="ghost">Send</Button></form></div>
  )
}

/* ---------------------------------------------------------------- files ---------------------------------------------------------------- */
function Files() {
  const [open, setOpen] = useState(null), [perm, setPerm] = useState(false)
  const SRC = `import express from 'express'\n\nconst app = express()\napp.get('/health', (_, res) => res.send('ok'))\napp.listen(process.env.PORT || 3000)\n`
  const [text, setText] = useState(SRC)
  const dirty = text !== SRC
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2"><Button size="sm" variant={open ? 'outline' : 'default'} onClick={() => setOpen(open ? null : 'index.js')}><FileText />{open ? 'Close editor' : 'Open index.js'}</Button><Button size="sm" variant="outline" onClick={() => setPerm(true)}><Lock />Permissions</Button><Button size="sm" variant="outline" onClick={() => toast('Archive queued (simulated)')}><Archive />Compress</Button></div>
      {open ? (
        <Panel pad={false} title={undefined}>
          <div className="flex items-center gap-2 border-b border-line px-3 py-2 text-[12.5px]"><span className="font-mono">/app/{open}</span>{dirty && <Badge tone="warn" dot={false}>modified</Badge>}<div className="ml-auto flex gap-1.5"><Button size="sm" variant="ghost" disabled={!dirty} onClick={() => setText(SRC)}>Revert</Button><Button size="sm" disabled={!dirty} onClick={() => { toast.success('Saved (simulated)') }}><Save />Save</Button></div></div>
          <div className="grid lg:grid-cols-2"><textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} aria-label="index.js" className="min-h-[260px] resize-y bg-black p-3 font-mono text-[12.5px] leading-5 outline-none lg:border-r lg:border-line" />{dirty ? <div className="p-3"><DiffViewer before={SRC} after={text} name="index.js" defaultMode="unified" /></div> : <div className="grid place-items-center p-6 text-[13px] text-dim">Your changes appear here as a diff</div>}</div>
        </Panel>
      ) : <FileExplorer />}
      <Dialog open={perm} onOpenChange={setPerm}><DialogContent title="Permissions" description="/app/index.js · mode 644"><PermissionMatrix rows={['Owner', 'Group', 'Everyone']} cols={['Read', 'Write', 'Execute']} initial={{ Owner: ['Read', 'Write'], Group: ['Read'], Everyone: ['Read'] }} roles={{ private: { all: ['Read', 'Write'] }, shared: { all: ['Read'] } }} /><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setPerm(false)}>Cancel</Button><Button onClick={() => { setPerm(false); toast.success('Mode updated (simulated)') }}>Apply</Button></div></DialogContent></Dialog>
    </div>
  )
}

/* ---------------------------------------------------------------- git ---------------------------------------------------------------- */
const DEPLOYS = [['3f9a1c2', 'Fix cart total when empty', 'ok', '2 h ago', '38 s'], ['b71d04e', 'Add health endpoint', 'ok', '1 d ago', '41 s'], ['a02f9c1', 'Upgrade dependencies', 'bad', '2 d ago', 'failed at build'], ['9c3e7aa', 'Initial import', 'ok', '9 d ago', '52 s']]
function Git() {
  const [roll, setRoll] = useState(null), [auto, setAuto] = useState(true)
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Panel title="Deployments" actions={<Button size="sm" onClick={() => toast('Deploy started (simulated)')}><Play />Deploy now</Button>}>
          <ul className="divide-y divide-line">{DEPLOYS.map(([sha, msg, st, when, dur], i) => <li key={sha} className="flex items-center gap-3 py-3 text-[13.5px]"><i className={cn('size-2 shrink-0 rounded-full', st === 'ok' ? 'bg-ok' : 'bg-bad')} /><span className="font-mono text-[12px] text-dim">{sha}</span><span className="min-w-0 flex-1 truncate">{msg}</span>{i === 0 && <Badge tone="ok" dot={false}>live</Badge>}<span className="hidden font-mono text-[11px] text-dim sm:inline">{dur}</span><span className="text-[12px] text-dim">{when}</span>{i > 0 && st === 'ok' && <Button size="sm" variant="ghost" onClick={() => setRoll(sha)}><RotateCcw />Roll back</Button>}</li>)}</ul>
        </Panel>
        <Panel title="Failed build · a02f9c1"><LogViewer title="build" height={200} lines={[['info', 'Installing dependencies'], ['info', 'Compiling TypeScript'], ['error', 'src/orders.ts(42,18): TS2532 Object is possibly undefined'], ['error', 'Build exited with code 2']].map(([level, text], id) => ({ id, t: '09:12:0' + id, level, src: 'build', text }))} /></Panel>
      </div>
      <div className="space-y-5">
        <Panel title="Repository"><div className="flex items-center gap-3 text-[13.5px]"><GitBranch className="size-4 text-dim" /><span className="font-mono">northwind/api</span><Badge tone="ok">Connected</Badge></div><div className="mt-4 space-y-4"><FormField label="Branch"><Select value="main" onValueChange={() => {}} options={['main', 'staging']} /></FormField><label className="flex items-center justify-between text-[13.5px]">Deploy on every push<Switch checked={auto} onCheckedChange={setAuto} /></label><FormField label="Webhook secret"><CopyValue mask value="whsec_9f3a1c7d2b" /></FormField></div></Panel>
      </div>
      <Dialog open={!!roll} onOpenChange={(o) => !o && setRoll(null)}><DialogContent title={`Roll back to ${roll}?`} description="Your app restarts on the older version. Data is not touched."><JobTimeline compact steps={[{ name: 'Fetch build', state: 'queued' }, { name: 'Switch traffic', state: 'queued' }, { name: 'Health check', state: 'queued' }]} /><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setRoll(null)}>Cancel</Button><Button onClick={() => { setRoll(null); toast.success('Rolled back (simulated)') }}>Roll back</Button></div></DialogContent></Dialog>
    </div>
  )
}

/* ---------------------------------------------------------------- startup + env ---------------------------------------------------------------- */
function Startup({ onNeedsRestart, kind }) {
  const BEFORE = 'NODE_ENV=production\nPORT=3000\nLOG_LEVEL=info'
  const [env, setEnv] = useState(BEFORE), [cmd, setCmd] = useState(kind === 'game' ? 'java -Xmx{{MEM}}M -jar server.jar nogui' : 'node dist/index.js')
  const dirty = env !== BEFORE
  return (
    <div className="space-y-5">
      <Panel title="Startup command" desc="Runs every time the instance starts"><div className="space-y-3"><input value={cmd} onChange={(e) => { setCmd(e.target.value); onNeedsRestart() }} aria-label="Startup command" className={cn(inputCls(), 'font-mono')} />{kind === 'game' && <p className="text-[12px] text-dim"><code className="font-mono">{'{{MEM}}'}</code> is replaced with the memory of your plan.</p>}</div></Panel>
      <Panel title="Environment variables" desc="Encrypted at rest. Changes apply after a restart."><div className="grid gap-4 lg:grid-cols-2"><KeyValueEditor rows={[['NODE_ENV', 'production'], ['PORT', '3000'], ['LOG_LEVEL', 'info']]} secret /><div className="space-y-3"><div className={eyebrow}>.env file</div><textarea value={env} onChange={(e) => { setEnv(e.target.value); onNeedsRestart() }} aria-label=".env" rows={6} spellCheck={false} className={cn(inputCls(), 'h-auto py-2 font-mono text-[12.5px]')} />{dirty && <DiffViewer before={BEFORE} after={env} name=".env" />}</div></div></Panel>
    </div>
  )
}

/* ---------------------------------------------------------------- schedules ---------------------------------------------------------------- */
const CRON = [['Every hour', '0 * * * *'], ['Every day at 03:00', '0 3 * * *'], ['Every Monday at 04:00', '0 4 * * 1'], ['Custom', '']]
const human = (e) => (CRON.find((c) => c[1] === e)?.[0] || (e.trim().split(/\s+/).length === 5 ? 'Custom schedule' : 'Not a valid cron expression'))
function Schedules() {
  const [edit, setEdit] = useState(null), [rows, setRows] = useState([{ id: 1, name: 'Nightly restart', cron: '0 3 * * *', tasks: ['Restart'], on: true, next: 'Tomorrow 03:00' }, { id: 2, name: 'Hourly backup', cron: '0 * * * *', tasks: ['Backup'], on: true, next: 'In 14 min' }, { id: 3, name: 'Clear logs', cron: '0 4 * * 1', tasks: ['Command: rm logs/*'], on: false, next: 'Paused' }])
  return (
    <Panel title="Schedules" actions={<Button size="sm" onClick={() => setEdit({ id: 0, name: '', cron: '0 3 * * *', tasks: [], on: true })}><Plus />New schedule</Button>}>
      <ul className="divide-y divide-line">{rows.map((r) => <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5"><Clock className="size-4 text-dim" /><button className="min-w-0 flex-1 text-left outline-none" onClick={() => setEdit(r)}><div className="text-[14px] font-medium">{r.name}</div><div className="font-mono text-[11.5px] text-dim">{r.cron} · {human(r.cron)} · {r.tasks.join(' then ')}</div></button><span className="font-mono text-[11px] text-dim">{r.next}</span><Switch checked={r.on} onCheckedChange={(v) => setRows((x) => x.map((y) => (y.id === r.id ? { ...y, on: v } : y)))} aria-label={`${r.name} enabled`} /></li>)}</ul>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>{edit && <DialogContent title={edit.id ? 'Edit schedule' : 'New schedule'} description="Times are in UTC."><div className="space-y-4"><FormField label="Name"><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={inputCls()} /></FormField><FormField label="When" hint={human(edit.cron)} error={human(edit.cron).startsWith('Not') ? 'Use five fields, for example 0 3 * * *' : undefined}><div className="space-y-2"><Select value={CRON.find((c) => c[1] === edit.cron)?.[0] || 'Custom'} onValueChange={(v) => setEdit({ ...edit, cron: CRON.find((c) => c[0] === v)[1] || edit.cron })} options={CRON.map((c) => c[0])} /><input value={edit.cron} onChange={(e) => setEdit({ ...edit, cron: e.target.value })} aria-label="Cron expression" className={cn(inputCls(human(edit.cron).startsWith('Not')), 'font-mono')} /></div></FormField><FormField label="Then do"><TagInput value={edit.tasks} onChange={(t) => setEdit({ ...edit, tasks: t })} placeholder="Restart, Backup, Command…" /></FormField></div><div className="mt-6 flex justify-between gap-2">{edit.id ? <Confirm danger title="Delete this schedule?" description="It stops running immediately." confirmLabel="Delete" onConfirm={() => { setRows((x) => x.filter((y) => y.id !== edit.id)); setEdit(null) }} trigger={<Button variant="ghost" className="text-bad"><Trash2 />Delete</Button>} /> : <span />}<div className="flex gap-2"><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button disabled={!edit.name || human(edit.cron).startsWith('Not')} onClick={() => { setRows((x) => (edit.id ? x.map((y) => (y.id === edit.id ? edit : y)) : [...x, { ...edit, id: Date.now(), next: 'Scheduled' }])); setEdit(null); toast.success('Saved (simulated)') }}>Save</Button></div></div></DialogContent>}</Dialog>
    </Panel>
  )
}

/* ---------------------------------------------------------------- backups ---------------------------------------------------------------- */
function Backups({ kind }) {
  const [rows, setRows] = useState([['Nightly · Nov 10', '412 MB', 'auto', true], ['Before upgrade', '408 MB', 'manual', true], ['Nightly · Nov 09', '405 MB', 'auto', false], ['Nightly · Nov 08', '399 MB', 'auto', false]])
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel title="Backups" className="lg:col-span-2" actions={<span className="font-mono text-[11.5px] text-dim">1.6 GB of 10 GB</span>}>
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><i className="block h-full w-[16%] rounded-full bg-fg/60" /></div>
        <ul className="divide-y divide-line">{rows.map(([n, s, t, lock], i) => <li key={n} className="flex flex-wrap items-center gap-3 py-3 text-[13.5px]"><Archive className="size-4 text-dim" /><span className="min-w-0 flex-1"><span className="block truncate font-medium">{n}</span><span className="font-mono text-[11px] text-dim">{s} · {t}</span></span><button aria-label={lock ? 'Unlock' : 'Lock'} aria-pressed={lock} onClick={() => setRows((x) => x.map((y, k) => (k === i ? [y[0], y[1], y[2], !y[3]] : y)))} className={cn('grid size-8 place-items-center rounded-md transition-colors hover:bg-hover', lock ? 'text-fg' : 'text-dim')}><Lock className="size-3.5" /></button><DestructiveDialog confirmLabel="Restore" target="restore" title={`Restore “${n}”?`} steps={['Stopping the instance', 'Restoring files', 'Starting the instance']} impact={[['Current files', 'are replaced by this backup.', 'bad'], ['Changes since this backup', 'are lost unless you back up first.', 'warn']]} acks={['I know the current state will be overwritten.']} trigger={<Button size="sm" variant="outline">Restore</Button>} /></li>)}</ul>
      </Panel>
      <div className="space-y-5"><Panel title="Back up now"><AsyncOperation label="Create backup" steps={['Pausing writes', 'Copying data', 'Verifying']} /></Panel><Panel title="Automatic"><div className="space-y-4 text-[13.5px]"><FormField label="How often"><Select value="d" onValueChange={() => {}} options={[['h', 'Every hour'], ['d', 'Every day'], ['w', 'Every week']]} /></FormField><FormField label="Keep"><Select value="7" onValueChange={() => {}} options={[['3', 'Last 3'], ['7', 'Last 7'], ['14', 'Last 14']]} /></FormField>{kind === 'game' && <p className="text-[12px] text-dim">World saves are flushed before each backup.</p>}</div></Panel></div>
    </div>
  )
}

/* ---------------------------------------------------------------- databases / network / access ---------------------------------------------------------------- */
function Databases() {
  const [ips, setIps] = useState(['85.12.0.0/16']), [ssl, setSsl] = useState(true)
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Connection" desc="Password shown once at creation"><DatabaseCredentials /><div className="mt-4 flex gap-2"><Confirm title="Rotate the password?" description="Apps using the old password stop connecting until you update them." confirmLabel="Rotate" onConfirm={() => toast.success('New password created (simulated)')} trigger={<Button size="sm" variant="outline"><RotateCcw />Rotate password</Button>} /><Button size="sm" variant="ghost" onClick={() => toast('Connection string copied (simulated)')}><Copy />Copy URL</Button></div></Panel>
      <Panel title="Security"><div className="space-y-5"><label className="flex items-center justify-between text-[13.5px]"><span>Require TLS<span className="block text-[12px] text-dim">Connections without encryption are refused</span></span><Switch checked={ssl} onCheckedChange={setSsl} /></label>{!ssl && <InlineAlert tone="warn" title="Unencrypted connections allowed">Anyone on the path can read queries.</InlineAlert>}<FormField label="Allowed addresses" hint="Empty means private network only"><TagInput value={ips} onChange={setIps} placeholder="Add an IP or range" /></FormField></div></Panel>
      <Panel title="Databases" className="lg:col-span-2" actions={<Button size="sm" variant="outline"><Plus />New database</Button>}><ul className="divide-y divide-line text-[13.5px]">{[['app_prod', '412 MB', '18 connections'], ['app_staging', '38 MB', '2 connections'], ['analytics', '1.2 GB', 'idle']].map(([n, s, c]) => <li key={n} className="flex items-center gap-4 py-3"><Database className="size-4 text-dim" /><span className="flex-1 font-mono">{n}</span><span className="text-dim">{s}</span><span className="hidden text-dim sm:inline">{c}</span></li>)}</ul></Panel>
    </div>
  )
}
function Net() {
  const [rows, setRows] = useState([[25565, 'Game', true], [25575, 'Query', false], [8123, 'Dynmap', false]])
  return <div className="grid gap-5 lg:grid-cols-2"><Panel title="Addresses and ports" actions={<Button size="sm" variant="outline" onClick={() => setRows((r) => [...r, [25580 + r.length, 'New', false]])}><Plus />Add port</Button>}><ul className="divide-y divide-line text-[13.5px]">{rows.map(([p, n, pr]) => <li key={p} className="flex items-center gap-3 py-3"><span className="font-mono">45.83.12.9:{p}</span><span className="flex-1 text-dim">{n}</span>{pr ? <Badge tone="info" dot={false}>primary</Badge> : <Button size="sm" variant="ghost" onClick={() => setRows((r) => r.filter((x) => x[0] !== p))}>Remove</Button>}</li>)}</ul></Panel><Panel title="Firewall" pad={false}><FirewallRules /></Panel></div>
}
const MEMBERS = [['stefan', 'Owner', 'you'], ['maria', 'Developer', 'accepted'], ['andrei', 'Viewer', 'invited']]
function Access() {
  const [sel, setSel] = useState('maria'), [invite, setInvite] = useState(false)
  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <Panel title="People" actions={<Button size="sm" onClick={() => setInvite(true)}><Plus />Invite</Button>} pad={false}><ul className="divide-y divide-line">{MEMBERS.map(([n, r, s]) => <li key={n}><button onClick={() => setSel(n)} aria-current={sel === n} className={cn('flex w-full items-center gap-3 px-5 py-3 text-left outline-none transition-colors hover:bg-hover focus-visible:bg-hover', sel === n && 'bg-white/[0.06]')}><span className="grid size-8 place-items-center rounded-full border border-line-2 bg-white/5 text-[12px]">{n[0].toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block text-[13.5px] font-medium">{n}</span><span className="text-[12px] text-dim">{r} · {s}</span></span><ChevronRight className="size-4 text-dim" /></button></li>)}</ul></Panel>
      <Panel title={`What ${sel} can do`} key={sel}><PermissionMatrix rows={['Console', 'Files', 'Databases', 'Backups', 'Network', 'Settings']} initial={sel === 'maria' ? { Console: ['Read', 'Write'], Files: ['Read', 'Write'], Databases: ['Read'] } : sel === 'stefan' ? Object.fromEntries(['Console', 'Files', 'Databases', 'Backups', 'Network', 'Settings'].map((r) => [r, ['Read', 'Write', 'Delete', 'Admin']])) : { Console: ['Read'] }} />{sel !== 'stefan' && <div className="mt-5 flex justify-between"><Confirm danger title={`Remove ${sel}?`} description="They lose access immediately." confirmLabel="Remove" onConfirm={() => toast.success('Access removed (simulated)')} trigger={<Button variant="ghost" className="text-bad">Remove access</Button>} /><Button onClick={() => toast.success('Permissions saved (simulated)')}>Save</Button></div>}</Panel>
      <Dialog open={invite} onOpenChange={setInvite}><DialogContent title="Invite someone" description="They get an email with a link that works for 7 days."><div className="space-y-4"><FormField label="Email"><input type="email" placeholder="name@example.com" className={inputCls()} /></FormField><FormField label="Role"><Select value="dev" onValueChange={() => {}} options={[['view', 'Viewer: read only'], ['dev', 'Developer: console and files'], ['adm', 'Admin: everything except billing']]} /></FormField></div><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setInvite(false)}>Cancel</Button><Button onClick={() => { setInvite(false); toast.success('Invitation sent (simulated)') }}>Send invitation</Button></div></DialogContent></Dialog>
    </div>
  )
}

/* ---------------------------------------------------------------- game ---------------------------------------------------------------- */
function Game({ status }) {
  const [players, setPlayers] = useState(['Mara', 'Tudor', 'Ilinca', 'Radu'])
  const [wl, setWl] = useState(['Mara', 'Tudor', 'Ilinca', 'Radu', 'Sorin'])
  const PROPS = '{\n  "motd": "Survival SMP",\n  "max-players": 40,\n  "difficulty": "normal",\n  "view-distance": 10,\n  "white-list": true\n}'
  return (
    <div className="space-y-5">
      <Panel pad={false}><div className="flex flex-wrap items-center gap-5 p-5"><Orb size={56} role="game" state="thinking" /><div className="min-w-0 flex-1"><div className="text-[15px] font-semibold"><Decode text="Glitch noticed lag at 21:00" per={20} /></div><p className="mt-1 text-[13.5px] text-mute">DynmapRenderer used 41% of tick time and kept growing for six hours. Lowering its render threads fixes it without a restart.</p></div><div className="flex gap-2"><Button size="sm" onClick={() => toast.success('Applied (simulated)')}>Apply the fix</Button><Button size="sm" variant="outline">Show the profile</Button></div></div></Panel>
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Server" className="lg:col-span-1"><div className="grid grid-cols-2 gap-2"><Tile label="TPS" value="19.2" sub="of 20" tone="ok" /><Tile label="Players" value={`${players.length} / 40`} /><Tile label="Memory" value="3.4 GB" sub="of 4 GB" tone="warn" /><Tile label="World" value="2.1 GB" /></div></Panel>
        <Panel title="Players online" className="lg:col-span-2"><ul className="divide-y divide-line text-[13.5px]">{players.length === 0 && <li className="py-8 text-center text-dim">Nobody online</li>}{players.map((p) => <li key={p} className="flex items-center gap-3 py-2.5"><span className="size-1.5 rounded-full bg-ok" /><span className="flex-1">{p}</span><Button size="sm" variant="ghost" onClick={() => toast(`${p} is now an operator (simulated)`)}>Op</Button><Button size="sm" variant="ghost" className="text-bad" onClick={() => { setPlayers((x) => x.filter((y) => y !== p)); toast(`${p} was kicked (simulated)`) }}>Kick</Button></li>)}</ul></Panel>
      </div>
      <div className="grid gap-5 lg:grid-cols-2"><Panel title="Whitelist"><TagInput value={wl} onChange={setWl} placeholder="Add a player" /></Panel><Panel title="server.properties"><ConfigEditor initial={PROPS} name="server.properties" schemaHint="restart to apply" /></Panel></div>
    </div>
  )
}

/* ---------------------------------------------------------------- settings ---------------------------------------------------------------- */
function SettingsTab({ kind }) {
  const n = KIND[kind].name
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="General"><div className="space-y-4"><FormField label="Name"><input defaultValue={n} className={inputCls()} /></FormField><FormField label="Description" optional><textarea rows={2} className={cn(inputCls(), 'h-auto py-2')} /></FormField><Button onClick={() => toast.success('Saved (simulated)')}>Save</Button></div></Panel>
      <Panel title="SFTP" desc="Upload with any SFTP client"><div className="space-y-2"><CopyValue label="Host" value="sftp.blipmade.app" /><CopyValue label="Port" value="2022" /><CopyValue label="User" value={`stefan.${n}`} /><p className="pt-1 text-[12px] text-dim">Sign in with your account password, or an SSH key from Settings.</p></div></Panel>
      <Panel title="Resources" className="lg:col-span-2"><div className="max-w-xl"><ResourceAllocator /></div></Panel>
      <Panel title="Danger zone" className="lg:col-span-2"><div className="divide-y divide-line">{[['Reinstall', 'Wipe the files and install the system again. Backups stay.', 'reinstall', 'Reinstall'], ['Transfer', 'Move this instance to another account.', null, 'Transfer'], ['Delete', 'Remove the instance, its data and its address.', n, 'Delete']].map(([t, d, tg, l]) => <div key={t} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><div className="text-[14px] font-medium">{t}</div><div className="text-[12.5px] text-dim">{d}</div></div>{tg ? <DestructiveDialog target={tg} title={`${t} ${n}?`} confirmLabel={l} steps={t === 'Delete' ? ['Stopping', 'Detaching storage', 'Removing data'] : ['Stopping', 'Wiping files', 'Installing']} impact={[[t === 'Delete' ? 'Everything on this instance' : 'All current files', 'is removed.', 'bad'], ['Backups', t === 'Delete' ? 'are kept for 7 days.' : 'are kept.', 'warn']]} acks={['I know this cannot be undone.']} trigger={<Button variant="outline" className="text-bad">{l}</Button>} /> : <Button variant="outline" onClick={() => toast('Transfer started (simulated)')}>{l}</Button>}</div>)}</div></Panel>
    </div>
  )
}

/* ---------------------------------------------------------------- the screen ---------------------------------------------------------------- */
export default function Instance({ kind: k0 = 'app', hideSwitch }) {
  const [kind, setKind] = useState(k0), [tab, setTab] = useState('overview'), [status, setStatus] = useState('running'), [restart, setRestart] = useState(false)
  const K = KIND[kind]
  useEffect(() => { if (!K.tabs.includes(tab)) setTab('overview') }, [kind])  // eslint-disable-line react-hooks/exhaustive-deps
  const act = (a) => { if (a === 'restart') { setStatus('restarting'); setRestart(false); setTimeout(() => setStatus('running'), 1800) } else setStatus(a === 'stop' ? 'stopped' : 'running') }
  const body = { overview: <Overview status={status} kind={kind} />, console: <Console status={status} kind={kind} />, files: <Files />, git: <Git />, startup: <Startup kind={kind} onNeedsRestart={() => setRestart(true)} />, schedules: <Schedules />, backups: <Backups kind={kind} />, databases: <Databases />, network: <Net />, access: <Access />, game: <Game status={status} />, settings: <SettingsTab kind={kind} /> }
  return (
    <div className="space-y-5">
      {!hideSwitch && <div className="flex items-center gap-2"><span className={eyebrow}>Instance</span><Segmented value={kind} onValueChange={(v) => v && setKind(v)} options={[['app', 'App'], ['game', 'Game server'], ['db', 'Database']]} /></div>}
      <ScreenHead title={K.name} sub={K.sub} badge={<Badge tone={status === 'running' ? 'ok' : status === 'restarting' ? 'warn' : 'neutral'}>{status}</Badge>} actions={<PowerControls status={status} onAction={act} />} />
      {restart && status === 'running' && <InlineAlert tone="warn" title="Restart to apply your changes" action={<Button size="sm" onClick={() => act('restart')}>Restart now</Button>}>Startup and environment changes load on the next start.</InlineAlert>}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>{K.tabs.map((t) => <TabsTrigger key={t} value={t}>{LABEL[t]}</TabsTrigger>)}</TabsList>
        <div key={tab + kind} className="step-in pt-5">{body[tab]}</div>
      </Tabs>
    </div>
  )
}
