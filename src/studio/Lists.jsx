/* The three inventory pages of the customer app, redesigned: Apps & databases, Servers, Domains.
   What changed from the live pages, and why:
   - The title lives once, in the bar of the shell. The page opens with what you have (counts, what needs you, the monthly total), not with a second title.
   - One primary action per page, in the shell bar (a plus on phones). No second and third "Deploy".
   - A row answers "is it fine, where is it, what does it cost, what can I do" without opening it: status, address with copy, live use, price, a quick power button.
   - Red is only for what is live or broken. Addresses are quiet mono text, prices are small mono numerals, not headline dot-matrix.
   - Phones get their own row (three lines, 44 px targets, price and address included), one scrolling row of filter chips, and actions in a bottom sheet.
   `?s=empty|loading|error|one` forces a state for review. Mock data, simulated actions. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as DialogP from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { ArrowUpRight, Bot, Box, Check, ChevronRight, Code2, Copy, Database, ExternalLink, Gamepad2, Globe, KeyRound, Loader2, MoreHorizontal, Play, Plus, RotateCw, Search, Server, Settings, ShieldCheck, SlidersHorizontal, Square, Terminal, Trash2, X } from 'lucide-react'
import { Button, Menu, MenuContent, MenuItem, MenuSep, MenuTrigger, Switch } from '../components/ui.jsx'
import { CopyButton, CopyValue, InlineAlert, MatrixLoader, inputCls } from '../components/ui2.jsx'
import { StateHero, eyebrow, useSim } from './kit.jsx'
import { cn } from '../lib/utils'

const eur = (n) => '€' + n.toFixed(2)
const useQuery = () => { const { search } = useLocation(); return useMemo(() => new URLSearchParams(search), [search]) }
function usePhone() {
  const [p, setP] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(max-width: 767px)').matches)
  useEffect(() => { const m = matchMedia('(max-width: 767px)'), f = () => setP(m.matches); m.addEventListener('change', f); return () => m.removeEventListener('change', f) }, [])
  return p
}

/* ------------------------------------------------------------ shared pieces ------------------------------------------------------------ */
const TONE = { online: 'bg-ok', running: 'bg-ok', active: 'bg-ok', stopped: 'bg-dim', starting: 'bg-warn', stopping: 'bg-warn', restarting: 'bg-warn', pending: 'bg-warn', failed: 'bg-bad', expiring: 'bg-warn' }
const Status = ({ s, className }) => (
  <span className={cn('inline-flex items-center gap-1.5 text-[12.5px] capitalize', s === 'failed' ? 'text-bad' : ['stopped'].includes(s) ? 'text-dim' : 'text-mute', className)}>
    {['starting', 'stopping', 'restarting'].includes(s) ? <Loader2 className="size-3 animate-spin text-warn" /> : <i className={cn('size-1.5 rounded-full', TONE[s] || 'bg-dim')} />}{s}
  </span>
)
const Tile = ({ icon: I, s }) => (
  <span className="relative grid size-9 shrink-0 place-items-center rounded-lg border border-line-2 bg-white/[0.03] text-mute"><I className="size-4" />
    <i className={cn('absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card', TONE[s] || 'bg-dim')} /></span>
)
const Meter = ({ label, v, off }) => (
  <span className="flex items-center gap-2 font-mono text-[10.5px] text-dim" title={`${label} ${off ? 'off' : v + '%'}`}>
    <span className="w-7">{label}</span><span className="h-1 w-14 overflow-hidden rounded-full bg-white/[0.08]"><i className={cn('block h-full rounded-full transition-[width] duration-700', v > 85 ? 'bg-warn' : 'bg-fg/60')} style={{ width: off ? 0 : `${v}%` }} /></span><span className="w-7 text-right tabular-nums">{off ? '' : v + '%'}</span>
  </span>
)
/* what you have, in one line: the first thing on the page */
const Summary = ({ parts, total, note }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
    <p className="text-[14px] text-mute">{parts.map(([n, l, tone], i) => <span key={l}>{i > 0 && <span className="mx-2 text-dim">·</span>}<b className={cn('font-semibold tabular-nums', tone === 'warn' ? 'text-warn' : tone === 'bad' ? 'text-bad' : 'text-fg')}>{n}</b> {l}</span>)}</p>
    {total != null && <p className="font-mono text-[12.5px] text-dim"><span className="text-fg">{eur(total)}</span> / month{note && <span className="ml-2">{note}</span>}</p>}
  </div>
)
/* search, one row of chips, sort. On a phone the chips scroll sideways and sort moves into a sheet. */
function Toolbar({ q, setQ, chips, chip, setChip, sort, setSort, sorts, placeholder }) {
  const [sheet, setSheet] = useState(false)
  return (
    <div className="sticky top-0 z-10 -mx-4 space-y-2.5 bg-bg/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1 md:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={cn(inputCls(), 'h-10 pl-9 text-[16px] md:h-9 md:text-[13.5px] [&::-webkit-search-cancel-button]:hidden')} />{q && <button aria-label="Clear search" onClick={() => setQ('')} className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-dim hover:text-fg"><X className="size-4" /></button>}</div>
        <div className="no-bar hidden min-w-0 flex-1 items-center gap-1.5 overflow-x-auto md:flex"><Chips chips={chips} chip={chip} setChip={setChip} /></div>
        {sorts && <><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className="hidden h-9 rounded-lg border border-line-2 bg-transparent px-2.5 text-[13px] text-mute outline-none transition-colors hover:border-white/25 focus:border-white/45 md:block">{sorts.map(([v, l]) => <option key={v} value={v} className="bg-card">{l}</option>)}</select>
          <button onClick={() => setSheet(true)} aria-label="Sort and filter" className="grid size-10 shrink-0 place-items-center rounded-lg border border-line-2 text-mute outline-none transition-colors active:bg-hover md:hidden"><SlidersHorizontal className="size-4" /></button></>}
      </div>
      <div className="no-bar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 md:hidden"><Chips chips={chips} chip={chip} setChip={setChip} big /></div>
      {sorts && <Sheet open={sheet} onOpenChange={setSheet} title="Sort by">{sorts.map(([v, l]) => <SheetItem key={v} onClick={() => { setSort(v); setSheet(false) }} right={sort === v ? <Check className="size-4" /> : null}>{l}</SheetItem>)}</Sheet>}
    </div>
  )
}
const Chips = ({ chips, chip, setChip, big }) => chips.map(([id, l, n, tone]) => (
  <button key={id} aria-pressed={chip === id} onClick={() => setChip(id)} className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] outline-none transition-[border-color,background-color,color] duration-150 focus-visible:border-white/50', big ? 'h-9' : 'h-8', chip === id ? 'border-fg/70 bg-white/[0.08] text-fg' : 'border-line-2 text-mute hover:border-white/25 hover:text-fg')}>
    {tone && <i className={cn('size-1.5 rounded-full', tone)} />}{l}<span className="font-mono text-[10.5px] tabular-nums text-dim">{n}</span>
  </button>
))

/* bottom sheet: what a row's menu becomes on a phone. Big targets, one job per line, closes on drag-handle tap, backdrop or Esc. */
function Sheet({ open, onOpenChange, title, sub, children }) {
  return (
    <DialogP.Root open={open} onOpenChange={onOpenChange}>
      <DialogP.Portal>
        <DialogP.Overlay className="anim-overlay fixed inset-0 z-[66] bg-black/60 backdrop-blur-[2px]" />
        <DialogP.Content className="list-sheet fixed inset-x-0 bottom-0 z-[67] max-h-[82dvh] overflow-y-auto rounded-t-2xl border-t border-line-2 bg-card outline-none md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[380px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:border" style={{ paddingBottom: 'max(.75rem, env(safe-area-inset-bottom))' }}>
          <button onClick={() => onOpenChange(false)} aria-label="Close" className="mx-auto mt-2 block h-5 w-16 md:hidden"><span className="mx-auto block h-1 w-9 rounded-full bg-white/20" /></button>
          <div className="px-5 pb-2 pt-2 md:pt-5"><DialogP.Title className="truncate text-[15px] font-semibold">{title}</DialogP.Title>{sub ? <DialogP.Description className="truncate font-mono text-[11.5px] text-dim">{sub}</DialogP.Description> : <DialogP.Description className="sr-only">{title}</DialogP.Description>}</div>
          <div className="px-2 pb-1">{children}</div>
        </DialogP.Content>
      </DialogP.Portal>
    </DialogP.Root>
  )
}
const SheetItem = ({ icon: I, children, onClick, danger, right, disabled }) => (
  <button disabled={disabled} onClick={onClick} className={cn('flex min-h-12 w-full items-center gap-3.5 rounded-xl px-3 text-left text-[15px] outline-none transition-colors active:bg-hover focus-visible:bg-hover disabled:opacity-40', danger ? 'text-bad' : 'text-fg')}>{I && <I className="size-[18px] shrink-0 text-mute" />}<span className="min-w-0 flex-1 truncate">{children}</span>{right}</button>
)
/* the same list of actions as a dropdown on desktop and as a sheet on a phone */
function Actions({ title, sub, items, open, setOpen }) {
  const phone = usePhone()
  if (phone) return (<><button aria-label={`Actions for ${title}`} onClick={(e) => { e.stopPropagation(); setOpen(true) }} className="-mr-2 grid size-11 shrink-0 place-items-center rounded-lg text-dim outline-none active:bg-hover"><MoreHorizontal className="size-5" /></button>
    <Sheet open={open} onOpenChange={setOpen} title={title} sub={sub}>{items.map((it, i) => it === '-' ? <div key={i} className="mx-3 my-1 h-px bg-line" /> : <SheetItem key={it[1]} icon={it[0]} danger={it[3]} onClick={() => { setOpen(false); it[2]?.() }}>{it[1]}</SheetItem>)}</Sheet></>)
  return (
    <Menu><MenuTrigger onClick={(e) => e.stopPropagation()} aria-label={`Actions for ${title}`} className="grid size-8 place-items-center rounded-md text-dim outline-none transition-colors hover:bg-hover hover:text-fg focus-visible:bg-hover data-[state=open]:bg-hover data-[state=open]:text-fg"><MoreHorizontal className="size-4" /></MenuTrigger>
      <MenuContent align="end">{items.map((it, i) => { if (it === '-') return <MenuSep key={i} />; const I = it[0]; return <MenuItem key={it[1]} danger={it[3]} onSelect={() => it[2]?.()}><I />{it[1]}</MenuItem> })}</MenuContent></Menu>
  )
}
const Group = ({ label, n, children }) => (<section><h3 className={cn(eyebrow, 'mb-2 flex items-center gap-2 px-1')}>{label}<span className="tabular-nums">{n}</span></h3><div className="overflow-hidden rounded-xl border border-line bg-card">{children}</div></section>)
const NoMatch = ({ q, onClear }) => <div className="rounded-xl border border-line bg-card p-10 text-center"><p className="text-[14px] text-mute">Nothing matches{q ? ` “${q}”` : ' these filters'}.</p><Button className="mt-4" variant="outline" size="sm" onClick={onClear}>Clear filters</Button></div>
const Failed = ({ what }) => <InlineAlert tone="bad" title={`Could not load your ${what}`} action={<Button size="sm" variant="outline" onClick={() => toast('Retrying (simulated)')}>Try again</Button>}>The server did not answer. Nothing is wrong with your {what}; this page just cannot show them right now.</InlineAlert>

/* power: one optimistic transition per press, then the settled state */
function usePower(rows, setRows) {
  return (id, a) => {
    const mid = { start: 'starting', stop: 'stopping', restart: 'restarting' }[a], end = a === 'stop' ? 'stopped' : 'online'
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: mid } : x)))
    setTimeout(() => setRows((r) => r.map((x) => (x.id === id ? { ...x, status: end } : x))), 1600)
  }
}

/* ------------------------------------------------------------ apps & databases ------------------------------------------------------------ */
const KIND = { 'Node.js': Box, 'Minecraft Paper': Gamepad2, WordPress: Globe, 'Discord Bot': Bot, 'Code Server': Code2, PostgreSQL: Database }
const INSTANCES = [
  { id: 'bm3', name: 'bm3', kind: 'Node.js', type: 'app', status: 'online', ram: 1, cpu: 1, disk: 10, price: 3.74, host: 'bm3.apps.blipmade.com', u: [12, 38] },
  { id: 'e2e', name: 'e2e', kind: 'Node.js', type: 'app', status: 'online', ram: 2, cpu: 1, disk: 10, price: 5.74, host: 'e2e.apps.blipmade.com', u: [4, 22] },
  { id: 'daily81', name: 'daily81', kind: 'Node.js', type: 'app', status: 'online', ram: 2, cpu: 1, disk: 10, price: 5.74, host: 'daily81.apps.blipmade.com', u: [31, 61] },
  { id: 'mc', name: 'minecraft-paper', kind: 'Minecraft Paper', type: 'app', status: 'online', ram: 2, cpu: 1, disk: 20, price: 6.24, host: 'minecraft-paper.apps.blipmade.com', u: [44, 88] },
  { id: 'wp', name: 'WordPress', kind: 'WordPress', type: 'app', status: 'online', ram: 1, cpu: 1, disk: 10, price: 3.74, host: 'wordpress.apps.blipmade.com', u: [9, 47] },
  { id: 'bot', name: 'Discord Bot', kind: 'Discord Bot', type: 'app', status: 'stopped', ram: 1, cpu: 2, disk: 10, price: 4.49, host: 'discord-bot.apps.blipmade.com', u: [0, 0] },
  { id: 'talent', name: 'talent', kind: 'Code Server', type: 'app', status: 'online', ram: 1, cpu: 1, disk: 5, price: 0, host: 'code-server-exeuw.apps.blipmade.com', u: [3, 29] },
]
const size = (r) => `${r.ram} GB · ${r.cpu} vCPU · ${r.disk} GB`

function InstanceRow({ r, power, onOpen }) {
  const [menu, setMenu] = useState(false)
  const I = KIND[r.kind] || Box, off = r.status === 'stopped', busy = ['starting', 'stopping', 'restarting'].includes(r.status)
  const copy = async () => { try { await navigator.clipboard.writeText(r.host); toast.success('Address copied') } catch { toast.error('Copy is blocked here') } }
  const items = [off ? [Play, 'Start', () => power(r.id, 'start')] : [RotateCw, 'Restart', () => power(r.id, 'restart')], ...(off ? [] : [[Square, 'Stop', () => power(r.id, 'stop')]]), [Terminal, 'Open console', () => onOpen(r, 'console')], '-', [ExternalLink, 'Open address', () => toast('Opens ' + r.host)], [Copy, 'Copy address', copy], [Settings, 'Settings', () => onOpen(r, 'settings')], '-', [Trash2, 'Delete', () => toast('Opens the delete steps (simulated)'), true]]
  return (
    <div role="button" tabIndex={0} onClick={() => onOpen(r)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(r) }} className={cn('group/row flex cursor-pointer items-center gap-3 border-b border-line/60 px-3 py-3 outline-none transition-colors last:border-b-0 hover:bg-hover focus-visible:bg-hover md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto_84px_auto] md:gap-5 md:px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)_150px_auto_84px_auto]')}>
      {/* who */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Tile icon={I} s={r.status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><span className={cn('truncate text-[14.5px] font-medium', off && 'text-mute')}>{r.name}</span><Status s={r.status} className="md:hidden" /></div>
          <div className="truncate text-[12.5px] text-dim">{r.kind}<span className="md:hidden"> · {size(r)}</span></div>
          {/* phone: the third line carries the address and the price, which the old row dropped */}
          <div className="mt-1 flex items-center justify-between gap-3 md:hidden"><span className="truncate font-mono text-[11.5px] text-mute">{r.host}</span><span className="shrink-0 font-mono text-[12px] tabular-nums text-fg">{r.price ? eur(r.price) : 'Free'}</span></div>
        </div>
      </div>
      {/* where */}
      <div className="hidden min-w-0 items-center gap-1 md:flex"><span className="truncate font-mono text-[12px] text-mute">{r.host}</span><span onClick={(e) => e.stopPropagation()} className="opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100"><CopyButton value={r.host} /></span></div>
      {/* how it is doing */}
      <div className="hidden flex-col gap-1 lg:flex"><Meter label="CPU" v={r.u[0]} off={off} /><Meter label="RAM" v={r.u[1]} off={off} /></div>
      <div className="hidden min-w-[150px] flex-col md:flex"><Status s={r.status} /><span className="mt-0.5 font-mono text-[11px] text-dim">{size(r)}</span></div>
      {/* what it costs */}
      <div className="hidden text-right font-mono text-[13px] tabular-nums md:block">{r.price ? eur(r.price) : <span className="text-ok">Free</span>}<div className="text-[10.5px] text-dim">/ month</div></div>
      {/* what you can do */}
      <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <span className={cn('hidden md:block', off ? '' : 'opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100')}>
          {off ? <Button size="sm" variant="outline" disabled={busy} onClick={() => power(r.id, 'start')}><Play />Start</Button> : <button disabled={busy} onClick={() => power(r.id, 'restart')} aria-label={`Restart ${r.name}`} title="Restart" className="grid size-8 place-items-center rounded-md text-dim outline-none transition-colors hover:bg-white/10 hover:text-fg focus-visible:bg-white/10 disabled:opacity-40"><RotateCw className="size-4" /></button>}
        </span>
        <Actions title={r.name} sub={r.host} items={items} open={menu} setOpen={setMenu} />
      </div>
    </div>
  )
}

export function InstancesList() {
  const nav = useNavigate(), s = useQuery().get('s')
  const [rows, setRows] = useState(s === 'empty' ? [] : INSTANCES), [q, setQ] = useState(''), [chip, setChip] = useState('all'), [sort, setSort] = useState('new')
  const power = usePower(rows, setRows)
  const open = (r, tab) => nav('/apps/' + r.id + (tab ? '?tab=' + tab : ''))
  const n = (f) => rows.filter(f).length
  const chips = [['all', 'All', rows.length], ['app', 'Apps', n((r) => r.type === 'app')], ['db', 'Databases', n((r) => r.type === 'db')], ['online', 'Online', n((r) => r.status === 'online'), 'bg-ok'], ['stopped', 'Stopped', n((r) => r.status === 'stopped'), 'bg-dim']]
  const list = rows.filter((r) => (chip === 'all' || r.type === chip || r.status === chip) && (r.name + r.kind + r.host).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : sort === 'price' ? b.price - a.price : 0))
  const attention = list.filter((r) => r.status === 'stopped' || r.status === 'failed'), rest = list.filter((r) => !attention.includes(r))
  if (s === 'loading') return <MatrixLoader label="Loading your instances" />
  if (s === 'error') return <Failed what="instances" />
  if (!rows.length) return <div className="rounded-xl border border-line bg-card"><StateHero state="idle" role="dev" word="NOTHING RUNNING." sub="Deploy an app, a bot, a game server or a database. It is online in about a minute." small><Button onClick={() => nav('/catalog')}><Plus />Deploy something</Button><button onClick={() => toast('Opens the access-code page')} className="text-[12.5px] text-dim underline-offset-4 hover:text-fg hover:underline">I have an access code</button></StateHero></div>
  return (
    <>
      <Summary parts={[[rows.length, 'instances'], [n((r) => r.status === 'online'), 'online'], ...(n((r) => r.status === 'stopped') ? [[n((r) => r.status === 'stopped'), 'stopped', 'warn']] : [])]} total={rows.reduce((a, r) => a + r.price, 0)} />
      <Toolbar q={q} setQ={setQ} chips={chips} chip={chip} setChip={setChip} sort={sort} setSort={setSort} sorts={[['new', 'Newest first'], ['name', 'Name'], ['price', 'Price']]} placeholder="Search instances" />
      {list.length === 0 ? <NoMatch q={q} onClear={() => { setQ(''); setChip('all') }} /> : (
        <div className="space-y-5">
          {attention.length > 0 && <Group label="Needs you" n={attention.length}>{attention.map((r) => <InstanceRow key={r.id} r={r} power={power} onOpen={open} />)}</Group>}
          {rest.length > 0 && <Group label="Running" n={rest.length}>{rest.map((r) => <InstanceRow key={r.id} r={r} power={power} onOpen={open} />)}</Group>}
        </div>
      )}
      <p className="pb-2 text-center text-[12.5px] text-dim">Someone shared an instance with you? <button onClick={() => toast('Opens the access-code page')} className="text-mute underline underline-offset-4 hover:text-fg">Use an access code</button></p>
    </>
  )
}

/* ------------------------------------------------------------ servers ------------------------------------------------------------ */
const SERVERS = [
  { id: 'test-vps', name: 'test-vps', plan: 'VPS Start', status: 'online', ram: 1, cpu: 1, disk: 20, price: 3.99, ip: '45.83.12.9', port: 22101, os: 'Debian 12', region: 'Germany', up: '14 days', u: [8, 41, 22] },
  { id: 'staging', name: 'staging', plan: 'VPS Pro', status: 'stopped', ram: 8, cpu: 4, disk: 100, price: 12, ip: '45.83.12.17', port: 22, os: 'Ubuntu 24.04', region: 'Germany', up: '', u: [0, 0, 35] },
]
function ServerCard({ r, power, onOpen }) {
  const [menu, setMenu] = useState(false)
  const off = r.status === 'stopped', busy = ['starting', 'stopping', 'restarting'].includes(r.status)
  const ssh = `ssh root@${r.ip}${r.port !== 22 ? ' -p ' + r.port : ''}`
  const items = [off ? [Play, 'Start', () => power(r.id, 'start')] : [RotateCw, 'Restart', () => power(r.id, 'restart')], ...(off ? [] : [[Square, 'Shut down', () => power(r.id, 'stop')]]), [Terminal, 'Open console', () => onOpen(r)], '-', [KeyRound, 'SSH keys', () => onOpen(r)], [ShieldCheck, 'Firewall', () => onOpen(r)], [Settings, 'Settings', () => onOpen(r)], '-', [Trash2, 'Delete', () => toast('Opens the delete steps (simulated)'), true]]
  return (
    <article className="rounded-xl border border-line bg-card transition-colors hover:border-line-2">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => onOpen(r)} className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none"><Tile icon={Server} s={r.status} />
          <span className="min-w-0"><span className={cn('block truncate text-[15px] font-medium', off && 'text-mute')}>{r.name}</span><span className="block truncate text-[12.5px] text-dim">{r.plan} · {r.os} · {r.region}</span></span></button>
        <Status s={r.status} className="hidden sm:inline-flex" />
        <div className="hidden items-center gap-1.5 md:flex">{off ? <Button size="sm" disabled={busy} onClick={() => power(r.id, 'start')}><Play />Start</Button> : <><Button size="sm" variant="outline" onClick={() => onOpen(r)}><Terminal />Console</Button><Button size="sm" variant="outline" disabled={busy} onClick={() => power(r.id, 'restart')}><RotateCw />Restart</Button></>}</div>
        <Actions title={r.name} sub={r.ip} items={items} open={menu} setOpen={setMenu} />
      </div>
      <div className="grid gap-4 border-t border-line/60 p-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-8">
        <div className="min-w-0"><div className={cn(eyebrow, 'mb-1.5')}>Connect</div><CopyValue value={ssh} /></div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 md:flex-col md:gap-1"><Meter label="CPU" v={r.u[0]} off={off} /><Meter label="RAM" v={r.u[1]} off={off} /><Meter label="Disk" v={r.u[2]} /></div>
        <div className="flex items-end justify-between gap-6 md:block md:text-right"><div className="font-mono text-[11px] text-dim">{size(r)}{r.up && <span className="hidden md:block">up {r.up}</span>}</div><div className="font-mono text-[14px] tabular-nums">{eur(r.price)}<span className="text-[10.5px] text-dim"> / month</span></div></div>
      </div>
      {/* phone: the two things you came for, as full-width buttons under your thumb */}
      <div className="grid grid-cols-2 gap-2 border-t border-line/60 p-3 md:hidden"><Status s={r.status} className="col-span-2 px-1 sm:hidden" />{off ? <Button className="col-span-2 h-11" disabled={busy} onClick={() => power(r.id, 'start')}><Play />Start</Button> : <><Button className="h-11" variant="outline" onClick={() => onOpen(r)}><Terminal />Console</Button><Button className="h-11" variant="outline" disabled={busy} onClick={() => power(r.id, 'restart')}><RotateCw />Restart</Button></>}</div>
    </article>
  )
}
export function ServersList() {
  const nav = useNavigate(), s = useQuery().get('s')
  const [rows, setRows] = useState(s === 'empty' ? [] : s === 'one' ? SERVERS.slice(0, 1) : SERVERS)
  const power = usePower(rows, setRows)
  if (s === 'loading') return <MatrixLoader label="Loading your servers" />
  if (s === 'error') return <Failed what="servers" />
  if (!rows.length) return <div className="rounded-xl border border-line bg-card"><StateHero state="idle" role="dev" word="NO SERVERS." sub="A virtual server with root access, online in under a minute." small><Button onClick={() => toast('Opens the new server flow')}><Plus />Create a server</Button></StateHero></div>
  return (
    <>
      <Summary parts={[[rows.length, rows.length === 1 ? 'server' : 'servers'], [rows.filter((r) => r.status === 'online').length, 'running']]} total={rows.reduce((a, r) => a + r.price, 0)} />
      <div className="space-y-3">{rows.map((r) => <ServerCard key={r.id} r={r} power={power} onOpen={(x) => nav('/vps/' + x.id)} />)}</div>
      <button onClick={() => toast('Opens the new server flow')} className="group flex w-full items-center justify-between gap-4 rounded-xl border border-dashed border-line-2 p-4 text-left outline-none transition-colors hover:border-white/30 focus-visible:border-white/50"><span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg border border-line-2 text-mute"><Plus className="size-4" /></span><span><span className="block text-[14px] font-medium">Add a server</span><span className="block text-[12.5px] text-dim">From {eur(3.99)} a month. Root access, your choice of system.</span></span></span><ChevronRight className="size-4 text-dim transition-transform group-hover:translate-x-0.5" /></button>
    </>
  )
}

/* ------------------------------------------------------------ domains ------------------------------------------------------------ */
const DOMAINS = [
  { id: 'd1', name: 'example-studio.com', to: 'WordPress', dns: 'active', ssl: 'active', renew: 'Renews Mar 04, 2027', auto: true, ours: true },
  { id: 'd2', name: 'api.example-studio.com', to: 'bm3', dns: 'active', ssl: 'active', renew: '', ours: false },
  { id: 'd3', name: 'play.northwind.gg', to: 'minecraft-paper', dns: 'pending', ssl: 'pending', renew: '', ours: false, record: ['CNAME', 'play', 'minecraft-paper.apps.blipmade.com'] },
  { id: 'd4', name: 'mara.blog', to: 'Not connected', dns: 'active', ssl: 'expiring', renew: 'Expires in 12 days', auto: false, ours: true },
]
function DomainRow({ r, onChange }) {
  const [menu, setMenu] = useState(false), [open, setOpen] = useState(r.dns === 'pending'), [chk, run] = useSim(1400)
  const pending = r.dns === 'pending', warn = r.ssl === 'expiring'
  const items = [[SlidersHorizontal, 'DNS records', () => toast('Opens DNS records')], [ArrowUpRight, 'Point to another service', () => toast('Opens the change page')], ...(r.ours ? [[RotateCw, 'Renew now', () => toast('Opens renewal')]] : []), '-', [Trash2, 'Remove domain', () => toast('Opens the remove steps (simulated)'), true]]
  return (
    <div className="border-b border-line/60 last:border-b-0">
      <div className="flex items-center gap-3 px-3 py-3 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_110px_minmax(0,1fr)_auto] md:gap-5 md:px-4">
        <button onClick={() => (pending ? setOpen((o) => !o) : toast('Opens the domain'))} aria-expanded={pending ? open : undefined} className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none">
          <Tile icon={Globe} s={pending ? 'pending' : warn ? 'expiring' : 'active'} />
          <span className="min-w-0 flex-1"><span className="block truncate font-mono text-[13.5px]">{r.name}</span>
            <span className="block truncate text-[12.5px] text-dim md:hidden">{pending ? 'Waiting for DNS' : warn ? r.renew : `Points to ${r.to}`}</span></span>
        </button>
        <div className="hidden min-w-0 truncate text-[13px] text-mute md:block">{r.to === 'Not connected' ? <span className="text-dim">Not connected</span> : <>→ {r.to}</>}</div>
        <div className="hidden md:block"><Status s={pending ? 'pending' : 'active'} /><div className="mt-0.5 font-mono text-[10.5px] text-dim">{r.ssl === 'active' ? 'HTTPS on' : r.ssl === 'pending' ? 'HTTPS waits' : 'HTTPS on'}</div></div>
        <div className={cn('hidden min-w-0 items-center gap-3 text-[12.5px] md:flex', warn ? 'text-warn' : 'text-dim')}>{r.ours ? <><span className="truncate">{r.renew}</span><label className="flex shrink-0 items-center gap-1.5 text-dim"><Switch checked={!!r.auto} onCheckedChange={(v) => onChange(r.id, { auto: v, ...(v ? { ssl: 'active', renew: 'Renews automatically' } : {}) })} aria-label={`Auto-renew ${r.name}`} className="scale-90" />Auto</label></> : <span>Registered elsewhere</span>}</div>
        <Actions title={r.name} sub={`Points to ${r.to}`} items={items} open={menu} setOpen={setMenu} />
      </div>
      {/* phone: renewal needs a line of its own when it is a problem */}
      {warn && <div className="flex items-center justify-between gap-3 px-3 pb-3 md:hidden"><span className="text-[12.5px] text-warn">{r.renew}</span><Button size="sm" variant="outline" onClick={() => onChange(r.id, { auto: true, ssl: 'active', renew: 'Renews automatically' })}>Turn on auto-renew</Button></div>}
      {pending && open && (
        <div className="step-in space-y-3 border-t border-line/60 bg-black/20 p-4">
          <p className="text-[13.5px] text-mute">Add this record where you bought the domain. We check every few minutes and switch HTTPS on by ourselves.</p>
          <div className="grid gap-2 md:grid-cols-[150px_1fr_2fr]"><CopyValue label="Type" value={r.record[0]} /><CopyValue label="Name" value={r.record[1]} /><CopyValue label="Value" value={r.record[2]} /></div>
          <div className="flex flex-wrap items-center gap-3"><Button size="sm" loading={chk === 'running'} onClick={() => run(false, () => onChange(r.id, { dns: 'active', ssl: 'active' }))}>Check now</Button><span className="text-[12px] text-dim">It can take up to an hour to show everywhere.</span></div>
        </div>
      )}
    </div>
  )
}
export function DomainsList() {
  const s = useQuery().get('s')
  const [rows, setRows] = useState(s === 'empty' ? [] : DOMAINS), [q, setQ] = useState(''), [chip, setChip] = useState('all'), [add, setAdd] = useState(''), [busy, run] = useSim(1100)
  const field = useRef(null)
  const change = (id, p) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...p } : x)))
  const valid = /^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(add.trim())
  const connect = (e) => { e.preventDefault(); if (!valid) return; const name = add.trim().toLowerCase(); run(false, () => { setRows((r) => [{ id: 'n' + r.length, name, to: 'Not connected', dns: 'pending', ssl: 'pending', renew: '', ours: false, record: ['CNAME', name.split('.')[0], 'edge.blipmade.com'] }, ...r]); setAdd('') }) }
  const need = rows.filter((r) => r.dns === 'pending' || r.ssl === 'expiring')
  const chips = [['all', 'All', rows.length], ['need', 'Needs you', need.length, 'bg-warn'], ['ours', 'Registered here', rows.filter((r) => r.ours).length], ['ext', 'External', rows.filter((r) => !r.ours).length]]
  const list = rows.filter((r) => (chip === 'all' || (chip === 'need' ? need.includes(r) : chip === 'ours' ? r.ours : !r.ours)) && (r.name + r.to).toLowerCase().includes(q.toLowerCase()))
  if (s === 'loading') return <MatrixLoader label="Loading your domains" />
  if (s === 'error') return <Failed what="domains" />
  const Add = (
    <form onSubmit={connect} className="rounded-xl border border-line bg-card p-3 sm:p-4">
      <label htmlFor="dom-add" className={cn(eyebrow, 'mb-2 block')}>Connect a domain</label>
      <div className="flex gap-2"><div className="relative min-w-0 flex-1"><Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" /><input id="dom-add" ref={field} value={add} onChange={(e) => setAdd(e.target.value)} placeholder="example.com" autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="url" className={cn(inputCls(), 'h-11 pl-9 font-mono text-[16px] md:h-10 md:text-[13.5px]')} /></div><Button type="submit" className="h-11 md:h-10" disabled={!valid} loading={busy === 'running'}>Connect</Button></div>
      <p className="mt-2 text-[12.5px] text-dim">Already own it? Connect it here. Need a new one? <button type="button" onClick={() => toast('Opens domain search')} className="text-mute underline underline-offset-4 hover:text-fg">Search and register</button></p>
    </form>
  )
  if (!rows.length) return <>{Add}<div className="rounded-xl border border-line bg-card"><StateHero state="idle" role="chat" word="NO DOMAINS." sub="Your services already have a free address. Connect your own name whenever you like." small /></div></>
  return (
    <>
      <Summary parts={[[rows.length, 'domains'], ...(need.length ? [[need.length, need.length === 1 ? 'needs you' : 'need you', 'warn']] : [[rows.length, 'healthy']])]} />
      {Add}
      <Toolbar q={q} setQ={setQ} chips={chips} chip={chip} setChip={setChip} placeholder="Search domains" />
      {list.length === 0 ? <NoMatch q={q} onClear={() => { setQ(''); setChip('all') }} /> : <div className="overflow-hidden rounded-xl border border-line bg-card">{list.map((r) => <DomainRow key={r.id} r={r} onChange={change} />)}</div>}
    </>
  )
}
