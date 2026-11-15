/* Screen 31 - Apps & databases, refined.
   The composition of the existing inventory screen is kept: a summary line, a toolbar, a
   list of rows that answers without opening anything. What changed:
   - product filters and operational filters are two different things, so they are two
     labelled groups instead of one row of chips that mixed both
   - a stopped service is not a problem. It is grouped with the other stopped services and
     labelled "stopped by you", never "needs you"
   - the primary action is on the row: Open for an application, Connect for a database,
     Join for a game server, Start for something that is off
   - a phone gets a card per service, designed as a card: what it is, whether it runs,
     how to reach it, what it costs, what can be done right now
   All fixtures come from ./fixtures.js and are simulated. */
import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Copy, Database, ExternalLink, Gamepad2, Play, Plus, RotateCw, Search, Settings, SlidersHorizontal, Square, Terminal, Trash2, X } from 'lucide-react'
import { Button } from '../components/ui.jsx'
import { MatrixLoader } from '../components/loaders.jsx'
import { InlineAlert, inputCls } from '../components/ui2.jsx'
import { ServiceIdentity, SimulatedNote, UsageMeters, eyebrow } from '../components/refine.jsx'
import { AsyncActionButton, BottomSheet, CopyFeedback, SmartMenu, StatusTransition, useMediaQuery } from '../components/feedback.jsx'
import { INVENTORY, counts, monthlyTotal } from './fixtures.js'
import { cn } from '../lib/utils'

const eur0 = (n) => '€' + Number(n).toFixed(2)
/* the product groups are types, not icons: an application is an application, whatever runs it */
const GROUP_TYPE = { app: 'Application', db: 'Database', game: 'Game server' }

/* the action a service offers right now */
function primaryFor(s) {
  if (s.status === 'failed') return { label: 'Retry', icon: RotateCw, kind: 'app' }
  if (s.status === 'provisioning') return { label: 'Preparing…', disabled: true }
  if (s.status === 'stopped') return { label: 'Start', icon: Play }
  if (s.type === 'Database') return { label: 'Connect', icon: Database }
  if (s.type === 'Game server') return { label: 'Join', icon: Gamepad2 }
  return { label: 'Open', icon: ExternalLink }
}

/* the row menu: the same list on a desktop and on a phone */
function rowActions(s, power, onOpen) {
  const off = s.status === 'stopped'
  const busy = ['starting', 'stopping', 'restarting'].includes(s.status)
  const items = [
    off ? [Play, 'Start', () => power(s.id, 'start')] : [RotateCw, 'Restart', () => power(s.id, 'restart')],
    ...(off ? [] : [[Square, 'Stop', () => power(s.id, 'stop')]]),
    [Terminal, 'Open console', () => onOpen(s, 'console')],
    '-',
    [Copy, 'Copy address', () => onCopy(s)],
    [Settings, 'Settings', () => onOpen(s, 'settings')],
    '-',
    [Trash2, 'Delete', () => onCopy(s), true],
  ]
  return items
}
const onCopy = (s) => { try { navigator.clipboard.writeText(s.host) } catch { /* blocked in this demo */ } }

/* One grid definition for the rows and for the header, so the columns line up.
   The last track is a fixed width, not `auto`: an `auto` track is sized from its
   content, so the empty header cell and the row's action buttons would claim
   different amounts of space and every column would shift sideways.
   These are written out in full because Tailwind scans the source text, not the
   interpolated value. */
const ROW_GRID = 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_104px_84px_144px] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1.35fr)_128px_96px_80px_144px] xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1.35fr)_128px_132px_96px_80px_144px]'

/* ------------------------------------------------------------------ desktop row */
function Row({ s, power, onOpen }) {
  const primary = primaryFor(s)
  return (
    <div className={cn('group/row', ROW_GRID, 'gap-y-2 border-b border-line/60 px-4 py-3 transition-colors last:border-b-0 hover:bg-hover')}>
      {/* what it is */}
      <div className="min-w-0">
        <ServiceIdentity kind={s.kind} name={s.name} sub={s.product} status={s.status} />
      </div>
      {/* where it is */}
      <div className="col-span-2 min-w-0 md:col-span-1">
        <CopyFeedback value={s.host} display={s.host} className="max-w-full" />
      </div>
      {/* how it is doing */}
      <div className="hidden min-w-0 lg:block"><UsageMeters cpu={s.cpu} ram={s.ram} /></div>
      {/* what it is made of */}
      <div className="hidden min-w-0 xl:block">
        <span className="block truncate font-mono text-[11.5px] text-mute">{s.spec}</span>
        <span className="mt-0.5 block font-mono text-[10.5px] text-dim">{s.plan}</span>
      </div>
      {/* whether it runs */}
      <div className="hidden md:block">
        <StatusTransition status={s.status} label={s.status === 'stopped' && s.stoppedByUser ? 'Stopped by you' : undefined} />
      </div>
      {/* what it costs */}
      <div className="hidden text-right md:block">
        <span className="font-mono text-[12.5px] tabular-nums text-fg">{s.price ? eur0(s.price) : <span className="text-ok">Free</span>}</span>
      </div>
      {/* what can be done */}
      <div className="flex shrink-0 items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
        {primary.kind === 'app' ? (
          <AsyncActionButton size="sm" variant="default" icon={RotateCw} pendingLabel="Retrying…" successLabel="Retrying" onAction={() => power(s.id, 'restart')}>{primary.label}</AsyncActionButton>
        ) : (
          <Button size="sm" variant="outline" disabled={primary.disabled} onClick={() => (primary.disabled ? null : power(s.id, s.status === 'stopped' ? 'start' : 'restart'))}>
            {primary.icon && <primary.icon className="size-3.5" />}{primary.label}
          </Button>
        )}
        <SmartMenu items={rowActions(s, power, onOpen)} title={s.name} sub={s.host} label="Actions" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ phone card */
function Card_({ s, power, onOpen }) {
  const [open, setOpen] = React.useState(false)
  const primary = primaryFor(s)
  return (
    <article className="rounded-xl border border-line bg-card p-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1"><ServiceIdentity kind={s.kind} name={s.name} sub={s.product} status={s.status} /></div>
        <StatusTransition status={s.status} label={s.status === 'stopped' && s.stoppedByUser ? 'Stopped by you' : undefined} className="shrink-0" />
      </div>

      <div className="mt-2.5 min-w-0">
        <CopyFeedback value={s.host} display={s.host} label={s.type === 'Database' ? 'dsn' : 'host'} className="max-w-full" />
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-3">
        <UsageMeters cpu={s.cpu} ram={s.ram} className="min-w-0 flex-1" />
        <span className="shrink-0 text-right">
          <span className="block font-mono text-[13px] tabular-nums text-fg">{s.price ? eur0(s.price) : <span className="text-ok">Free</span>}</span>
          <span className="block font-mono text-[10.5px] text-dim">/ month</span>
        </span>
      </div>

      {open && (
        <dl className="mt-3 space-y-1.5 rounded-lg border border-line bg-black/30 p-3 text-[12.5px]">
          <div className="flex justify-between gap-3"><dt className="text-dim">Plan</dt><dd className="font-mono text-mute">{s.plan} · {s.spec}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-dim">Endpoint</dt><dd className="min-w-0 truncate font-mono text-mute">{s.endpoint}</dd></div>
          {s.type === 'Database' && <div className="flex justify-between gap-3"><dt className="text-dim">Connect</dt><dd className="min-w-0 truncate font-mono text-mute">psql -h {s.host} -U blipmade</dd></div>}
          {s.type === 'Game server' && <div className="flex justify-between gap-3"><dt className="text-dim">Join</dt><dd className="min-w-0 truncate font-mono text-mute">{s.host.replace('.games.', '.')}</dd></div>}
          {s.failure && <div className="flex justify-between gap-3"><dt className="text-bad">Failed</dt><dd className="min-w-0 text-right text-bad">{s.failure}</dd></div>}
        </dl>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={primary.disabled} onClick={() => power(s.id, s.status === 'stopped' ? 'start' : 'restart')} className="h-11 flex-1">
          {primary.icon && <primary.icon className="size-4" />}{primary.label}
        </Button>
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex h-11 items-center gap-1.5 rounded-lg border border-line-2 px-3 text-[13px] text-mute outline-none transition-colors hover:bg-hover focus-visible:border-white/40">
          Details<ChevronDown className={cn('size-3.5 transition-transform duration-200', open && 'rotate-180')} />
        </button>
        <SmartMenu items={rowActions(s, power, onOpen)} title={s.name} sub={s.host} label="Actions" />
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ toolbar */
/* Product and state are two different questions, so they are two labelled groups on a
   desktop. On a phone the product chips scroll sideways and everything else lives in one
   sheet: state filters first, then the sort order. */
function Toolbar({ q, setQ, group, setGroup, status, setStatus, sort, setSort, sorts }) {
  const phone = useMediaQuery('(max-width: 767px)')
  const [sheet, setSheet] = React.useState(false)
  const groups = [['all', 'All', counts.all], ['app', 'Applications', counts.apps], ['db', 'Databases', counts.dbs], ['game', 'Game servers', counts.games]]
  const states = [['running', 'Running', counts.running], ['stopped', 'Stopped', counts.stopped], ['failed', 'Failed', counts.failed], ['provisioning', 'Preparing', counts.provisioning]]
  const Chip = ({ id, l, n, tone, active, onClick, big }) => (
    <button aria-pressed={active} onClick={onClick} className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] outline-none transition-[border-color,background-color,color] duration-150 focus-visible:border-white/50', big ? 'h-11' : 'h-8', active ? 'border-fg/70 bg-white/[0.08] text-fg' : 'border-line-2 text-mute hover:border-white/25 hover:text-fg')}>
      {tone && <i className={cn('size-1.5 rounded-full', tone)} />}{l}<span className="font-mono text-[10.5px] tabular-nums text-dim">{n}</span>
    </button>
  )
  return (
    <div className="sticky top-0 z-10 -mx-4 space-y-2.5 bg-bg/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1 md:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or address" aria-label="Search by name or address" className={cn(inputCls(), 'h-10 pl-9 text-[16px] md:h-9 md:text-[13.5px] [&::-webkit-search-cancel-button]:hidden')} />
          {q && <button aria-label="Clear search" onClick={() => setQ('')} className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-dim hover:text-fg"><X className="size-4" /></button>}
        </div>
        <SimulatedNote className="hidden md:inline-flex" />
        {phone ? (
          <button onClick={() => setSheet(true)} aria-label="Filter and sort" className="grid size-10 shrink-0 place-items-center rounded-lg border border-line-2 text-mute outline-none transition-colors hover:border-white/25 focus-visible:border-white/45 active:bg-hover">
            <SlidersHorizontal className="size-4" />
          </button>
        ) : (
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by" className="h-9 rounded-lg border border-line-2 bg-transparent px-2.5 text-[13px] text-mute outline-none transition-colors hover:border-white/25 focus:border-white/45">
            {sorts.map(([v, l]) => <option key={v} value={v} className="bg-card">{l}</option>)}
          </select>
        )}
      </div>

      <div className="no-bar -mx-4 flex items-center gap-3 overflow-x-auto px-4 md:mx-0 md:px-0">
        <span className={cn(eyebrow, 'shrink-0')}>Product</span>
        <div className="flex shrink-0 gap-1.5">{groups.map(([id, l, n]) => <Chip key={id} id={id} l={l} n={n} active={group === id} onClick={() => setGroup(id)} />)}</div>
        {!phone && (
          <>
            <span aria-hidden className="h-4 w-px shrink-0 bg-line" />
            <span className={cn(eyebrow, 'shrink-0')}>State</span>
            <div className="flex shrink-0 gap-1.5">{states.map(([id, l, n]) => <Chip key={id} id={id} l={l} n={n} tone={id === 'failed' ? 'bg-bad' : id === 'running' ? 'bg-ok' : undefined} active={status === id} onClick={() => setStatus(id)} />)}</div>
          </>
        )}
      </div>

      {phone && (
        <BottomSheet open={sheet} onOpenChange={setSheet} title="Filter and sort" sub={`${counts.all} services`}>
          <div className="px-3 pb-1">
            <div className={cn(eyebrow, 'mb-2')}>State</div>
            <div className="flex flex-wrap gap-1.5">
              <Chip id="all" l="Any state" n={counts.all} active={status === 'all'} onClick={() => setStatus('all')} big />
              {states.map(([id, l, n]) => <Chip key={id} id={id} l={l} n={n} tone={id === 'failed' ? 'bg-bad' : id === 'running' ? 'bg-ok' : undefined} active={status === id} onClick={() => setStatus(id)} big />)}
            </div>
            <div className={cn(eyebrow, 'mb-2 mt-4')}>Sort by</div>
            <div className="flex flex-wrap gap-1.5">
              {sorts.map(([v, l]) => <Chip key={v} id={v} l={l} active={sort === v} onClick={() => setSort(v)} big />)}
            </div>
            <Button className="mt-4 w-full" size="sm" onClick={() => setSheet(false)}>Show {counts.all} services</Button>
          </div>
        </BottomSheet>
      )}
    </div>
  )
}

function Summary() {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <p className="text-[14px] text-mute">
        <b className="font-semibold tabular-nums text-fg">{counts.all}</b> services
        <span className="mx-2 text-dim">·</span>
        <b className="font-semibold tabular-nums text-fg">{counts.apps}</b> applications
        <span className="mx-2 text-dim">·</span>
        <b className="font-semibold tabular-nums text-fg">{counts.dbs}</b> databases
        <span className="mx-2 text-dim">·</span>
        <b className="font-semibold tabular-nums text-fg">{counts.games}</b> game servers
      </p>
      <p className="font-mono text-[12.5px] text-dim"><span className="tabular-nums text-fg">{eur0(monthlyTotal)}</span> / month</p>
    </div>
  )
}

/* the column names, once, above the groups */
const RowHead = () => (
  <div className={cn(ROW_GRID, 'hidden gap-y-0 border-b border-line bg-card px-4 py-2 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim md:grid')}>
    <span className="truncate">Service</span>
    <span className="truncate">Endpoint</span>
    <span className="hidden lg:block">Usage</span>
    <span className="hidden xl:block">Plan</span>
    <span>State</span>
    <span className="text-right">Price</span>
    <span />
  </div>
)

/* ------------------------------------------------------------------ groups */
function Groups({ rows, power, onOpen }) {
  const groups = [
    { id: 'needs', label: 'Needs you', tone: 'bad', rows: rows.filter((s) => s.status === 'failed'), note: 'Something failed and only you can decide what happens next.' },
    { id: 'running', label: 'Running', rows: rows.filter((s) => s.status === 'running') },
    { id: 'preparing', label: 'Preparing', rows: rows.filter((s) => s.status === 'provisioning'), note: 'Still being set up. This takes about a minute.' },
    { id: 'stopped', label: 'Stopped by you', rows: rows.filter((s) => s.status === 'stopped'), note: 'Stopped on purpose. They keep their disk and their address, and they are not billed for CPU.' },
  ].filter((g) => g.rows.length)
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      <RowHead />
      {groups.map((g) => (
        <React.Fragment key={g.id}>
          <div className="flex flex-wrap items-baseline gap-2 border-b border-line bg-white/[0.02] px-4 py-2">
            <h3 className={cn(eyebrow, g.tone === 'bad' && 'text-bad')}>{g.label}</h3>
            <span className="font-mono text-[11px] tabular-nums text-dim">{g.rows.length}</span>
            {g.note && <span className="text-[12.5px] text-dim">{g.note}</span>}
          </div>
          {g.rows.map((s) => <Row key={s.id} s={s} power={power} onOpen={onOpen} />)}
        </React.Fragment>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ screen */
export default function AppsPolish({ state = 'ready', variant = 'auto' }) {
  const nav = useNavigate()
  const phone = useMediaQuery('(max-width: 767px)')
  const [rows, setRows] = React.useState(INVENTORY)
  const [q, setQ] = React.useState('')
  const [group, setGroup] = React.useState('all')
  const [status, setStatus] = React.useState('all')
  const [sort, setSort] = React.useState('name')

  /* one optimistic transition per press, then the settled state */
  const power = (id, action) => {
    const mid = { start: 'starting', stop: 'stopping', restart: 'restarting' }[action]
    const end = action === 'stop' ? 'stopped' : 'running'
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: mid } : x)))
    setTimeout(() => setRows((r) => r.map((x) => (x.id === id ? { ...x, status: end } : x))), 1600)
  }
  const onOpen = (s, tab) => nav('/apps/' + s.id + (tab ? '?tab=' + tab : ''))

  const list = rows
    .filter((s) => (group === 'all' || s.type === GROUP_TYPE[group]))
    .filter((s) => (status === 'all' || s.status === status))
    .filter((s) => (s.name + s.product + s.host + s.type).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === 'price' ? b.price - a.price : sort === 'usage' ? b.cpu + b.ram - a.cpu - a.ram : sort === 'status' ? a.status.localeCompare(b.status) : a.name.localeCompare(b.name)))

  if (state === 'loading') return <MatrixLoader label="Loading your services" />
  if (state === 'error') return <InlineAlert tone="bad" title="Could not load your services" action={<Button size="sm" variant="outline">Try again</Button>}>The server did not answer. Nothing is wrong with your services; this page just cannot show them right now.</InlineAlert>

  const isPhone = variant === 'mobile' || (variant === 'auto' && phone)

  if (state === 'empty') {
    return (
      <div className="rounded-xl border border-line bg-card">
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-xl border border-line-2 bg-white/[0.04] text-mute"><Database className="size-5" /></span>
          <div className="text-[15px] font-semibold">No services yet</div>
          <p className="max-w-sm text-[13px] leading-relaxed text-mute">An application, a managed database or a game server is ready in about a minute. Every one of them shows up here with its address, its usage and its price.</p>
          <Button className="mt-1"><Plus />Deploy your first service</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Summary />
      <div className="mt-3">
        <Toolbar q={q} setQ={setQ} group={group} setGroup={setGroup} status={status} setStatus={setStatus} sort={sort} setSort={setSort} sorts={[['name', 'Name'], ['usage', 'Usage'], ['price', 'Price'], ['status', 'State']]} />
      </div>

      {list.length === 0 ? (
        <div className="mt-4 rounded-xl border border-line bg-card p-10 text-center">
          <p className="text-[14px] text-mute">Nothing matches{q ? ` “${q}”` : ' these filters'}.</p>
          <Button className="mt-4" variant="outline" size="sm" onClick={() => { setQ(''); setGroup('all'); setStatus('all') }}>Clear filters</Button>
        </div>
      ) : isPhone ? (
        <div className="mt-4 space-y-2.5">
          {list.map((s) => <Card_ key={s.id} s={s} power={power} onOpen={onOpen} />)}
        </div>
      ) : (
        <div className="mt-4">
          <Groups rows={list} power={power} onOpen={onOpen} />
        </div>
      )}

      <p className="mt-6 pb-2 text-center text-[12.5px] text-dim">Someone shared a service with you? <button className="text-mute underline underline-offset-4 hover:text-fg">Use an access code</button></p>
    </>
  )
}
