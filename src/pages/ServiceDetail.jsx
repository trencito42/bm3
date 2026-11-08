import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Download, Plus, Power, RefreshCw } from 'lucide-react'
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Input, PageHeader, Progress, StatusBadge, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui.jsx'
import { useStore } from '../lib/store.jsx'
import { DotGauge } from '../components/DotViz.jsx'
import { cn, money, sleep } from '../lib/utils'

const KV = ({ k, v }) => (
  <div className="flex items-center justify-between gap-4 text-[13.5px]">
    <span className="text-dim">{k}</span>
    <span className="text-right text-fg">{v}</span>
  </div>
)

function Usage({ label, value }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[13px]">
        <span className="text-mute">{label}</span>
        <span className="tabular-nums">{Math.round(value)}%</span>
      </div>
      <Progress value={value} hot={value > 85} />
    </div>
  )
}

export default function ServiceDetail() {
  const { id } = useParams()
  const { services, patchService } = useStore()
  const s = services.find((x) => x.id === id)
  const [lines, setLines] = useState([['d', 'console connected'], ['', 'Welcome to Ubuntu 24.04 LTS'], ['d', 'load: 0.34   memory: 61%   processes: 128']])
  const [cmd, setCmd] = useState('')
  const term = useRef(null)
  const busy = useRef(false)

  /* live jitter on running services */
  useEffect(() => {
    if (!s || s.status !== 'running') return
    const t = setInterval(() => {
      const j = (v) => Math.max(3, Math.min(97, v + (Math.random() * 10 - 5)))
      patchService(s.id, { cpu: j(s.cpu), ram: j(s.ram) })
    }, 2500)
    return () => clearInterval(t)
  }, [s?.id, s?.status, s?.cpu])

  useEffect(() => { term.current?.scrollTo({ top: 1e6 }) }, [lines])

  if (!s) return <div className="text-dim">Service not found. <Link to="/services" className="text-fg underline">Back</Link></div>
  const log = (t, c = '') => setLines((l) => [...l, [c, t]])

  const power = async (next, steps) => {
    if (busy.current) return
    busy.current = true
    patchService(s.id, { status: 'restarting' })
    for (let i = 0; i < steps.length; i++) { log(steps[i], i === steps.length - 1 ? 'ok' : ''); await sleep(600) }
    patchService(s.id, next === 'stopped' ? { status: next, cpu: 0, ram: 0 } : { status: next, cpu: 22, ram: 40 })
    toast.success(`${s.name} ${next === 'running' ? 'is running' : 'stopped'}`)
    busy.current = false
  }
  const run = () => {
    const v = cmd.trim(); if (!v) return
    setCmd(''); log('$ ' + v)
    if (s.status !== 'running') return log('connection refused', 'w')
    const out = { uptime: ' 23 days, 4:12, load average: 0.34', whoami: 'root', ls: 'app  backups  logs  nginx.conf', date: new Date().toString().slice(0, 24) }[v.split(' ')[0]]
    log(out || `bash: ${v.split(' ')[0]}: command not found`, out ? 'ok' : 'w')
  }

  return (
    <>
      <Link to="/services" className="inline-flex items-center gap-1.5 text-[13px] text-dim hover:text-fg"><ArrowLeft className="size-3.5" />Services</Link>
      <PageHeader title={s.name} description={`${s.type} · ${s.region} · ${s.ip}`}>
        <StatusBadge status={s.status} />
        <Button variant="outline" onClick={() => power('running', ['Stopping services', 'Syncing disks', 'Booting kernel 6.8.0', 'All services healthy'])} disabled={s.status === 'restarting'}><RefreshCw className={cn(s.status === 'restarting' && 'animate-spin')} />Restart</Button>
        {s.status === 'stopped'
          ? <Button onClick={() => power('running', ['Allocating resources', 'Booting kernel 6.8.0', 'Server is up'])}><Power />Start</Button>
          : <Button variant="destructive" disabled={s.status === 'restarting'} onClick={() => power('stopped', ['Sending shutdown signal', 'Stopping services', 'Server powered off'])}><Power />Stop</Button>}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardBody className="space-y-3.5">
            <KV k="Plan" v={s.type} /><KV k="OS" v="Ubuntu 24.04 LTS" /><KV k="Uptime" v={s.status === 'running' ? '23d 4h 12m' : '—'} />
            <KV k="Next due" v={`${s.due} · ${money(s.price)}`} />
            <KV k="Auto-renew" v={<Switch defaultChecked />} />
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Live usage</CardTitle><Badge tone="ok">Updating</Badge></CardHeader>
          <CardBody className="flex flex-wrap items-center justify-around gap-4 py-6">
            <DotGauge value={s.cpu} label="CPU" size={112} /><DotGauge value={s.ram} label="RAM" size={112} /><DotGauge value={s.disk} label="DISK" size={112} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <Tabs defaultValue="console">
          <TabsList className="px-3"><TabsTrigger value="console">Console</TabsTrigger><TabsTrigger value="network">Network</TabsTrigger><TabsTrigger value="backups">Backups</TabsTrigger><TabsTrigger value="billing">Billing</TabsTrigger></TabsList>
          <TabsContent value="console" className="p-5">
            <div ref={term} className="h-56 overflow-y-auto rounded-lg border border-line bg-black p-4 font-mono text-[12.5px] leading-6 text-mute">
              {lines.map(([c, t], i) => <div key={i} className={c === 'ok' ? 'text-ok' : c === 'w' ? 'text-warn' : c === 'd' ? 'text-dim' : ''}>{t}</div>)}
            </div>
            <div className="mt-3 flex gap-2"><Input className="font-mono" placeholder="$ try: uptime, whoami, ls" value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} aria-label="Command" /><Button variant="secondary" onClick={run}>Run</Button></div>
          </TabsContent>
          <TabsContent value="network" className="grid gap-3 p-5 sm:grid-cols-3">
            {[['Public IPv4', s.ip], ['IPv6', '2a01:4f8:c17::' + (10 + s.id.length) + '/64'], ['Private', '10.0.4.' + s.id.length * 3], ['Inbound', '312 Mbps'], ['Outbound', '148 Mbps'], ['Firewall', '4 rules active']].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-line p-4"><div className="text-xs text-dim">{k}</div><div className="mt-1.5 font-mono text-[13px]">{v}</div></div>
            ))}
          </TabsContent>
          <TabsContent value="backups" className="p-5">
            <div className="mb-3 flex items-center justify-between"><span className="text-[13.5px] text-dim">Daily snapshots, kept for 7 days.</span><Button size="sm" onClick={() => toast.success('Snapshot started')}><Plus />Snapshot now</Button></div>
            <div className="divide-y divide-line/60 rounded-lg border border-line">
              {['Today 03:00', 'Yesterday 03:00', '2 days ago 03:00'].map((t, i) => (
                <div key={t} className="flex items-center gap-3 px-4 py-3"><Download className="size-4 text-dim" /><div className="flex-1"><div className="text-[13.5px]">{t}</div><div className="text-xs text-dim">{(2.1 + i * 0.3).toFixed(1)} GB · automatic</div></div><Button variant="outline" size="sm">Restore</Button></div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="billing" className="space-y-3 p-5">
            <KV k="Recurring" v={`${money(s.price)} / month`} /><KV k="Billing cycle" v="Monthly" /><KV k="Next invoice" v={s.due} /><KV k="Payment method" v="Visa ·· 4242" />
          </TabsContent>
        </Tabs>
      </Card>
    </>
  )
}
