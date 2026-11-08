import { useState } from 'react'
import { Bell, Home, Lock, Menu, Plus, Receipt, Server, Settings, WifiOff, ShieldOff, Inbox, Cloud } from 'lucide-react'
import { Doc, Demo, Row } from './Doc.jsx'
import { Badge, Button, EmptyState, Progress, Segmented, StatusBadge } from '../components/ui.jsx'
import { InlineAlert, Skeleton } from '../components/ui2.jsx'
import { DotGauge, DotNum } from '../components/DotViz.jsx'
import { DotText, Orb } from '../builder/FxBits.jsx'
import { FileExplorer, PlanSelector, PriceBreakdown, ServerCard, TerminalPanel, Webmail } from '../components/product.jsx'
import { APPS } from '../lib/mock'
import { cn } from '../lib/utils'

/* a phone frame with status bar + safe-area bottom */
function Phone({ w = 390, h = 720, children, nav, title, action }) {
  return (
    <div className="shrink-0 rounded-[34px] border border-line-2 bg-black p-2 shadow-2xl shadow-black/60" style={{ width: w + 16 }}>
      <div className="relative overflow-hidden rounded-[26px] border border-line bg-bg" style={{ height: h }}>
        <div className="flex h-7 items-center justify-between px-6 text-[11px] font-medium"><span>9:41</span><span className="flex gap-1 text-dim"><i className="size-1 rounded-full bg-fg" /><i className="size-1 rounded-full bg-fg" /><i className="size-1 rounded-full bg-fg/40" /></span></div>
        <div className="flex h-12 items-center gap-3 border-b border-line px-4"><Menu className="size-5 text-mute" /><span className="text-[15px] font-semibold">{title}</span><span className="ml-auto">{action}</span></div>
        <div className="overflow-y-auto" style={{ height: h - 28 - 48 - (nav ? 66 : 0) }}>{children}</div>
        {nav && <nav className="absolute inset-x-0 bottom-0 grid grid-cols-4 border-t border-line bg-[#0b0b0d] pb-5 pt-1.5">{[[Home, 'Home'], [Server, 'Apps'], [Receipt, 'Billing'], [Settings, 'More']].map(([I, l], i) => <span key={l} className={cn('flex min-h-11 flex-col items-center justify-center gap-0.5 text-[10.5px]', i === nav ? 'text-fg' : 'text-dim')}><I className={cn('size-5', i === nav && 'text-[var(--brand)]')} />{l}</span>)}</nav>}
        <div className="absolute inset-x-0 bottom-1.5 mx-auto h-1 w-28 rounded-full bg-white/30" />
      </div>
    </div>
  )
}

const Mobile = () => (
  <div className="flex gap-6 overflow-x-auto pb-4">
    <Phone title="Overview" nav={0} action={<Bell className="size-5 text-mute" />}>
      <div className="space-y-4 p-4"><div><DotText text="HELLO, STEFAN" height={22} /></div><div className="grid grid-cols-2 gap-3">{[['Active', '4'], ['Due', '$47']].map(([l, v]) => <div key={l} className="rounded-xl border border-line bg-card p-3.5"><div className="font-mono text-[10px] uppercase tracking-[.08em] text-dim">{l}</div><div className="mt-2"><DotNum text={v} height={24} animate={false} /></div></div>)}</div><div className="rounded-xl border border-line bg-card p-4"><div className="mb-3 font-mono text-[10px] uppercase tracking-[.08em] text-dim">Fleet usage</div><div className="flex justify-around"><DotGauge value={38} label="CPU" size={80} n={32} /><DotGauge value={64} label="RAM" size={80} n={32} /></div></div>{APPS.slice(0, 2).map((a) => <ServerCard key={a.id} app={a} />)}</div>
    </Phone>
    <Phone title="Console" nav={1}><div className="p-3"><TerminalPanel height={440} /></div></Phone>
    <Phone title="Files" nav={1}><div className="p-3"><FileExplorer compact /></div></Phone>
    <Phone title="Webmail" nav={3}><div className="p-3"><Webmail mobile height={520} /></div></Phone>
    <Phone title="Checkout" action={<span className="text-xs text-dim">2 of 4</span>}><div className="space-y-4 p-4"><PlanSelector value="pro" onChange={() => {}} /><PriceBreakdown lines={[['Pro plan', 12], ['Backups', 2]]} total={14} /></div><div className="absolute inset-x-0 bottom-0 border-t border-line bg-[#0b0b0d] p-4 pb-7"><Button size="lg" className="h-12 w-full">Continue · $14.00</Button></div></Phone>
  </div>
)

const STATE_LIST = ['default', 'loading', 'empty', 'error', 'offline', 'readonly', 'denied', 'partial']
function StateDemo() {
  const [s, setS] = useState('default')
  const body = {
    default: <div className="grid gap-3 sm:grid-cols-2"><ServerCard app={APPS[0]} /><ServerCard app={APPS[1]} /></div>,
    loading: <div className="grid gap-3 sm:grid-cols-2">{[0, 1].map((i) => <div key={i} className="space-y-3 rounded-xl border border-line bg-card p-4"><Skeleton className="h-9 w-2/3" /><Skeleton className="h-8" /><Skeleton className="h-4 w-1/2" /></div>)}</div>,
    empty: <EmptyState icon={<Inbox />} title="No apps yet" actions={<Button><Plus />Deploy your first app</Button>}>Deploy a Node.js, Python or static site from Git in under a minute.</EmptyState>,
    error: <InlineAlert tone="bad" title="Could not load your apps" action={<Button size="sm" variant="outline">Retry</Button>}>The request timed out. Your services are unaffected. Error id 4f2a-91.</InlineAlert>,
    offline: <div className="space-y-3"><InlineAlert tone="warn" title="You are offline">Showing the last data we have from 2 minutes ago. Actions are disabled.</InlineAlert><div className="pointer-events-none opacity-60"><ServerCard app={APPS[0]} /></div></div>,
    readonly: <div className="space-y-3"><InlineAlert tone="info" title="Read-only access">Your role (Billing) can view servers but not change them.</InlineAlert><div className="flex items-center gap-2"><Button disabled>Restart</Button><Button variant="destructive" disabled>Stop</Button><Badge dot={false}>Read-only</Badge></div></div>,
    denied: <EmptyState icon={<ShieldOff />} title="You do not have access" actions={<Button variant="outline">Request access</Button>}>Ask the account owner to grant you the Infrastructure role.</EmptyState>,
    partial: <div className="space-y-3"><InlineAlert tone="warn" title="Some metrics are unavailable">CPU and memory are missing for fra-2. Disk and network are shown.</InlineAlert><div className="rounded-xl border border-line bg-card p-4"><div className="grid grid-cols-3 gap-4 text-center"><div><DotGauge value={0} label="CPU" size={84} n={32} /><div className="mt-1 text-xs text-dim">unavailable</div></div><div><DotGauge value={0} label="RAM" size={84} n={32} /><div className="mt-1 text-xs text-dim">unavailable</div></div><DotGauge value={47} label="DISK" size={84} n={32} /></div></div></div>,
  }
  return (
    <Demo label="State selector · one component, every state" sim>
      <div className="space-y-5"><div className="flex flex-wrap gap-1.5">{STATE_LIST.map((x) => <button key={x} onClick={() => setS(x)} className={cn('h-8 rounded-lg px-3 text-[12.5px] capitalize transition-colors', s === x ? 'bg-fg text-black' : 'bg-white/[0.06] text-mute hover:text-fg')}>{x}</button>)}</div><div key={s} className="anim-page min-h-48">{body[s]}</div></div>
    </Demo>
  )
}

function Breakpoints() {
  const [w, setW] = useState(390)
  return (
    <Demo label="Breakpoint preview · the same screen at each width" sim>
      <div className="space-y-4"><Segmented value={String(w)} onValueChange={(v) => v && setW(+v)} options={[['320', 'Phone S'], ['390', 'Phone L'], ['768', 'Tablet'], ['1100', 'Desktop']]} />
        <div className="overflow-x-auto rounded-xl border border-line bg-black p-4"><div className="mx-auto overflow-hidden rounded-lg border border-line bg-bg transition-[width] duration-500" style={{ width: w, maxWidth: '100%' }}><div className="flex items-center gap-3 border-b border-line px-4 py-3"><Menu className={cn('size-4 text-mute', w >= 1100 && 'hidden')} /><DotText text="BLIPMADE" height={11} /><span className="ml-auto text-xs text-dim">{w >= 768 ? 'rail sidebar' : 'drawer + bottom nav'}</span></div><div className="grid gap-3 p-4" style={{ gridTemplateColumns: `repeat(${w < 500 ? 1 : w < 900 ? 2 : 4}, minmax(0,1fr))` }}>{['Services', 'Due', 'Tickets', 'Uptime'].map((l) => <div key={l} className="rounded-lg border border-line bg-card p-3"><div className="font-mono text-[10px] uppercase text-dim">{l}</div><div className="mt-2 text-lg font-semibold">{l === 'Due' ? '$47' : l === 'Uptime' ? '99.98%' : '4'}</div></div>)}</div></div></div>
        <p className="text-xs text-dim">Cards reflow 1 → 2 → 4 columns; tables become stacked rows below 640px; the sidebar becomes a drawer and a 4-tab bottom bar appears below 768px.</p></div>
    </Demo>
  )
}

export default function States() {
  return <Doc title="States & responsive" lead="Real mobile compositions (not scaled-down desktops) and a selector that shows one component in every state." sections={[
    { id: 'mobile', title: 'Mobile compositions', note: 'overview · console · files · webmail · checkout', node: <Mobile /> },
    { id: 'states', title: 'Interaction states', node: <StateDemo /> },
    { id: 'bp', title: 'Breakpoints', node: <Breakpoints /> },
  ]} />
}
