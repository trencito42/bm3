import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Database, Globe, Gamepad2, Plus, Server, Search } from 'lucide-react'
import { Button, ChipTabs, EmptyState, Input, PageHeader, Progress, SectionHead, StatusBadge, Switch, IconTile } from '../components/ui.jsx'
import { useStore } from '../lib/store.jsx'
import { money } from '../lib/utils'

const ICONS = { server: Server, globe: Globe, db: Database, game: Gamepad2 }

function ServiceCard({ s }) {
  const nav = useNavigate()
  const { patchService } = useStore()
  const Icon = ICONS[s.icon] || Server
  const on = s.status === 'running' || s.status === 'restarting'
  return (
    <div onClick={() => nav('/services/' + s.id)} className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-line bg-card p-4 transition-colors hover:border-line-2">
      <div className="flex items-start gap-3">
        <IconTile><Icon /></IconTile>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold leading-tight">{s.name}</div>
          <div className="mt-0.5 text-[12.5px] text-mute">{s.type} · {s.region}</div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Switch checked={on} aria-label={on ? 'Stop' : 'Start'} onCheckedChange={(v) => { patchService(s.id, { status: v ? 'running' : 'stopped', ...(v ? { cpu: 22, ram: 40 } : { cpu: 0, ram: 0 }) }); toast(`${s.name} ${v ? 'started' : 'stopped'}`) }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={s.status} />
        <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 font-mono text-[11px] text-mute">{s.ip}</span>
        <span className="ml-auto font-mono text-[11px] text-mute">{money(s.price)}/mo</span>
      </div>
      <div className="flex items-center gap-3 text-[12px] text-dim">
        CPU <Progress value={s.cpu} hot={s.cpu > 80} className="flex-1" /> <span className="w-8 text-right tabular-nums text-mute">{Math.round(s.cpu)}%</span>
      </div>
    </div>
  )
}

export default function Services() {
  const { services } = useStore()
  const nav = useNavigate()
  const [f, setF] = useState('all')
  const [q, setQ] = useState('')
  const rows = services.filter((s) => (f === 'all' || s.status === f) && s.name.toLowerCase().includes(q.toLowerCase()))
  const regions = [...new Set(rows.map((s) => s.region))]
  const count = (st) => services.filter((s) => s.status === st).length
  return (
    <>
      <PageHeader title="Services" description="Everything you are running, grouped by region.">
        <div className="relative"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-dim" /><Input className="h-9 w-56 pl-8" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search services" /></div>
        <Button variant="outline" onClick={() => nav('/order')}><Plus />Create service</Button>
      </PageHeader>
      <ChipTabs value={f} onValueChange={setF} items={[['all', 'All', services.length], ['running', 'Running', count('running')], ['stopped', 'Stopped', count('stopped')]]} />
      {rows.length === 0 ? (
        <EmptyState icon={<Server />} title="No services here" actions={<Button onClick={() => nav('/order')}>Order a server</Button>}>Nothing matches this filter. Spin up a new server and it shows up here.</EmptyState>
      ) : (
        regions.map((r) => (
          <section key={r}>
            <SectionHead title={r} count={rows.filter((s) => s.region === r).length} />
            <div className="grid gap-3 md:grid-cols-2">{rows.filter((s) => s.region === r).map((s) => <ServiceCard key={s.id} s={s} />)}</div>
          </section>
        ))
      )}
    </>
  )
}
