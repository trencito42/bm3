import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Segmented, Stat, StatusBadge } from '../components/ui.jsx'
import { DataTable } from '../components/ui2.jsx'
import { DotBars, DotGauge, DotHeat } from '../components/DotViz.jsx'
import { DotText } from '../builder/FxBits.jsx'
import { useStore } from '../lib/store.jsx'
import { money } from '../lib/utils'

const series = (n) => Array.from({ length: n }, (_, i) => 46 + Math.sin(i / 2.3) * 22 + ((i * 37) % 17) + (i % 7 === 5 ? 28 : 0))

export default function Overview() {
  const { services, invoices, tickets } = useStore()
  const nav = useNavigate()
  const [range, setRange] = useState('30')
  const data = useMemo(() => series(+range), [range])
  const due = invoices.filter((i) => i.status !== 'paid').reduce((a, i) => a + i.amount, 0)
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <DotText text="HELLO, STEFAN" height={40} assemble />
          <p className="mt-3 text-[13.5px] text-mute">Here is what is happening across your infrastructure.</p>
        </div>
        <Button variant="outline" onClick={() => nav('/order')}><Plus />New service</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active services" value={services.filter((s) => s.status === 'running').length} hint={`of ${services.length} total`} delta="+1" />
        <Stat label="Outstanding" value={money(due)} hint="Unpaid invoices" delta="Overdue" tone="bad" />
        <Stat label="Open tickets" value={tickets.filter((t) => t.status === 'open').length} hint="Avg. reply 6 min" />
        <Stat label="Uptime" value="99.98%" hint="Last 90 days" delta="+0.02" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bandwidth · GB / day</CardTitle>
            <Segmented value={range} onValueChange={(v) => v && setRange(v)} options={[['14', '14D'], ['30', '30D'], ['60', '60D']]} />
          </CardHeader>
          <CardBody>
            <DotBars values={data} />
            <div className="mt-3 flex gap-5 text-xs text-dim"><span>Peak <b className="font-medium text-fg">128 GB</b></span><span>Average <b className="font-medium text-fg">74 GB</b></span><span>Hover a column</span></div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fleet usage</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-2 place-items-center gap-y-4 py-6">
            <DotGauge value={38} label="CPU" size={96} />
            <DotGauge value={64} label="RAM" size={96} />
            <DotGauge value={47} label="DISK" size={96} />
            <DotGauge value={88} label="NET" size={96} />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <Link to="/services" className="flex items-center gap-1 text-[13px] text-dim hover:text-fg">View all <ArrowRight className="size-3.5" /></Link>
          </CardHeader>
          <div className="mt-3">
            <DataTable dense onRowClick={(r) => nav('/services/' + r.id)} columns={[{ key: 'name', label: 'Name', cell: (r) => <span className="font-medium">{r.name}</span> }, { key: 'region', label: 'Region' }, { key: 'status', label: 'Status', cell: (r) => <StatusBadge status={r.status} /> }, { key: 'cpu', label: 'CPU', align: 'right', cell: (r) => <span className="tabular-nums">{Math.round(r.cpu)}%</span> }]} rows={services.slice(0, 5)} />
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent invoices</CardTitle>
            <Link to="/invoices" className="flex items-center gap-1 text-[13px] text-dim hover:text-fg">View all <ArrowRight className="size-3.5" /></Link>
          </CardHeader>
          <div className="mt-3 divide-y divide-line/60">
            {invoices.slice(0, 5).map((i) => (
              <div key={i.id} className="flex items-center justify-between px-5 py-3.5">
                <div><div className="font-mono text-[12.5px] text-fg">{i.id}</div><div className="text-[12.5px] text-dim">{i.date}</div></div>
                <div className="flex items-center gap-3"><span className="tabular-nums">{money(i.amount)}</span><StatusBadge status={i.status} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Network uptime · last 90 days</CardTitle><span className="font-mono text-[11px] text-fg">99.98%</span></CardHeader>
        <CardBody>
          <DotHeat incidents={{ 12: 'warn', 47: 'bad', 71: 'warn' }} />
          <div className="mt-3 flex gap-4 text-xs text-dim">
            <span className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-ok" />Operational</span>
            <span className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-warn" />Degraded</span>
            <span className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-bad" />Outage</span>
          </div>
        </CardBody>
      </Card>
    </>
  )
}
