import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Bell, Check, Database, GitBranch, Globe, Lock, Mail, Plus, Server, ShieldCheck, Smartphone, Terminal, User, KeyRound, Camera } from 'lucide-react'
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, ChipTabs, Dialog, DialogContent, EmptyState, IconTile, Input, PageHeader, Progress, RadioCard, RadioGroup, SectionHead, Segmented, Separator, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui.jsx'
import { Breadcrumbs, FormField, InlineAlert, OTPInput, PasswordInput, Select, Stepper, inputCls, CopyValue, CodeBlock } from '../../components/ui2.jsx'
import { DotNum } from '../../components/DotViz.jsx'
import { DotText } from '../../builder/FxBits.jsx'
import {
  BillingPeriod, CreditBalance, DNSRecordTable, DatabaseCredentials, FileExplorer, FirewallRules, IPAddressDisplay, KeyValueEditor, MailboxTable, NetworkTraffic, OSSelector, PaymentMethodCard, PlanSelector, PowerControls, PriceBreakdown, ProvisioningTimeline,
  RegionSelector, RenewalNotice, ResourceUsage, SSHKeyList, ServerCard, SnapshotList, TerminalPanel, Webmail, PLAN_DATA,
} from '../../components/product.jsx'
import { useStore } from '../../lib/store.jsx'
import { APPS, CATALOG, NOTIFS, SUBS } from '../../lib/mock'
import Invoices from '../Invoices.jsx'
import { cn, money, sleep } from '../../lib/utils'

/* ================= Deploy catalog -> configurator -> checkout ================= */
export function Catalog() {
  const nav = useNavigate()
  const { addService, services } = useStore()
  const [step, setStep] = useState(0)
  const [cat, setCat] = useState('vps')
  const [plan, setPlan] = useState('pro')
  const [per, setPer] = useState('m')
  const [region, setRegion] = useState('Frankfurt')
  const [os, setOs] = useState('Ubuntu 24.04')
  const [backups, setBackups] = useState(true)
  const [phase, setPhase] = useState(null)
  const [prov, setProv] = useState(0)
  const base = PLAN_DATA.find((p) => p.id === plan).price
  const disc = per === 'y' ? 0.2 : per === 'q' ? 0.08 : 0
  const lines = [[`${PLAN_DATA.find((p) => p.id === plan).name} plan`, base], ...(backups ? [['Daily backups', 2]] : []), ...(disc ? [[`Billing discount ${Math.round(disc * 100)}%`, -(base + (backups ? 2 : 0)) * disc]] : [])]
  const total = lines.reduce((a, [, p]) => a + p, 0)
  const pay = async () => {
    setPhase('prov'); for (let i = 0; i <= 5; i++) { setProv(i); await sleep(700) }
    const id = 'vps-' + (20 + services.length)
    addService({ id, name: `new-${plan}-${services.length + 1}`, type: `VPS ${plan[0].toUpperCase() + plan.slice(1)}`, icon: 'server', ip: `45.83.${40 + services.length}.9`, region, status: 'running', cpu: 4, ram: 12, disk: 6, price: +total.toFixed(2), due: 'Dec 08' })
    setPhase('done'); toast.success('Server provisioned (simulated)')
  }
  return (
    <>
      <PageHeader title="Deploy" description="Pick a product, configure it, review and pay." />
      <Stepper steps={['Catalog', 'Configure', 'Review', 'Pay']} current={step} onStep={setStep} />
      {step === 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{CATALOG.map((c) => (
        <button key={c.id} onClick={() => { setCat(c.id); setStep(1) }} className={cn('group flex flex-col gap-3 rounded-xl border bg-card p-5 text-left transition-colors hover:border-line-2', cat === c.id ? 'border-white/40' : 'border-line')}>
          <div className="flex items-center justify-between"><IconTile><Server /></IconTile>{c.tag && <Badge tone="info" dot={false}>{c.tag}</Badge>}</div>
          <div><div className="text-[15px] font-semibold">{c.name}</div><p className="mt-1 text-[13px] leading-relaxed text-mute">{c.blurb}</p></div>
          <div className="mt-auto font-mono text-[11px] uppercase text-dim">From {money(c.from)} / mo</div>
        </button>))}</div>}
      {step >= 1 && (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <div key={step} className="anim-page space-y-6">
            {step === 1 && <><Card><CardHeader><CardTitle>Billing period</CardTitle></CardHeader><CardBody><BillingPeriod value={per} onChange={setPer} /></CardBody></Card><Card><CardHeader><CardTitle>Plan</CardTitle></CardHeader><CardBody><PlanSelector value={plan} onChange={setPlan} yearly={per === 'y'} /></CardBody></Card><Card><CardHeader><CardTitle>Region & system</CardTitle></CardHeader><CardBody className="space-y-5"><RegionSelector value={region} onChange={setRegion} /><OSSelector value={os} onChange={setOs} /><div className="flex items-center justify-between"><div><div className="text-[13.5px]">Daily backups</div><div className="text-xs text-dim">+$2.00 / month</div></div><Switch checked={backups} onCheckedChange={setBackups} aria-label="Backups" /></div></CardBody></Card></>}
            {step === 2 && <Card><CardHeader><CardTitle>Order review</CardTitle></CardHeader><CardBody className="space-y-3 text-[13.5px]">{[['Product', 'VPS · ' + plan], ['Region', region], ['Image', os], ['Billing', per === 'm' ? 'Monthly' : per === 'q' ? 'Quarterly' : 'Yearly'], ['Backups', backups ? 'Enabled' : 'Off']].map(([a, b]) => <div key={a} className="flex justify-between"><span className="text-dim">{a}</span><span className="capitalize">{b}</span></div>)}<Separator /><InlineAlert tone="info" title="Provisioning takes about 40 seconds">You can leave this page; we will notify you when it is ready.</InlineAlert></CardBody></Card>}
            {step === 3 && <Card><CardHeader><CardTitle>Payment</CardTitle></CardHeader><CardBody className="space-y-3"><PaymentMethodCard def /><PaymentMethodCard brand="MC" last="9931" exp="02/27" /><p className="text-xs text-dim">Simulated checkout: no payment is taken.</p></CardBody></Card>}
          </div>
          <Card className="lg:sticky lg:top-0"><CardHeader><CardTitle>Summary</CardTitle></CardHeader><CardBody className="space-y-4"><PriceBreakdown lines={lines} total={total} /><div className="flex gap-2"><Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button><Button className="flex-1" onClick={() => (step === 3 ? pay() : setStep(step + 1))}>{step === 3 ? `Pay ${money(total)}` : 'Continue'}</Button></div></CardBody></Card>
        </div>
      )}
      <Dialog open={!!phase} onOpenChange={(o) => phase === 'done' && !o && setPhase(null)}>
        <DialogContent title={phase === 'done' ? 'Your server is live' : 'Provisioning…'} description={`${region} · ${os}`}>
          <ProvisioningTimeline step={prov} />
          {phase === 'done' && <Button size="lg" className="mt-6 w-full" onClick={() => { setPhase(null); nav('/vps') }}>View VPS</Button>}
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ================= Apps & databases ================= */
export function Apps() {
  const nav = useNavigate()
  const [f, setF] = useState('all')
  const rows = APPS.filter((a) => f === 'all' || (f === 'db' ? a.kind === 'PostgreSQL' : a.kind !== 'PostgreSQL'))
  return (
    <>
      <PageHeader title="Apps & databases" description="Applications and managed databases across regions."><Button onClick={() => nav('/catalog')}><Plus />Deploy</Button></PageHeader>
      <ChipTabs value={f} onValueChange={setF} items={[['all', 'All', APPS.length], ['app', 'Apps', 3], ['db', 'Databases', 1]]} />
      <div className="grid gap-4 md:grid-cols-2">{rows.map((a) => <ServerCard key={a.id} app={a} onOpen={() => nav('/apps/' + a.id)} />)}</div>
    </>
  )
}
export function AppDetail() {
  const { id } = useParams()
  const a = APPS.find((x) => x.id === id) || APPS[0]
  const [status, setStatus] = useState(a.status)
  const act = (x) => { if (x === 'restart') { setStatus('restarting'); setTimeout(() => setStatus('running'), 1800) } else setStatus(x === 'stop' ? 'stopped' : 'running') }
  return (
    <>
      <Breadcrumbs items={['Apps', a.name]} />
      <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><IconTile className="size-11"><Server /></IconTile><div><h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">{a.name}<Badge tone={status === 'running' ? 'ok' : status === 'restarting' ? 'warn' : 'neutral'}>{status}</Badge></h1><p className="font-mono text-xs text-dim">{a.kind} {a.ver} · {a.region} · :{a.port}</p></div></div><PowerControls status={status} onAction={act} /></div>
      <Tabs defaultValue="overview">
        <TabsList className="overflow-x-auto">{['overview', 'console', 'files', 'databases', 'backups', 'startup', 'network', 'git'].map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}</TabsList>
        <div className="pt-6">
          <TabsContent value="overview" className="space-y-4"><div className="grid gap-4 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHeader><CardTitle>Live usage</CardTitle></CardHeader><CardBody><ResourceUsage cpu={status === 'running' ? a.cpu : 0} ram={status === 'running' ? a.ram : 0} disk={a.disk} /></CardBody></Card><Card><CardHeader><CardTitle>Details</CardTitle></CardHeader><CardBody className="space-y-3 text-[13.5px]">{[['Runtime', `${a.kind} ${a.ver}`], ['Region', a.region], ['Deploy', a.git], ['Uptime', status === 'running' ? '6d 2h' : '—']].map(([k, v]) => <div key={k} className="flex justify-between"><span className="text-dim">{k}</span><span className="font-mono text-[12.5px]">{v}</span></div>)}</CardBody></Card></div><Card><CardBody><NetworkTraffic values={Array.from({ length: 32 }, (_, i) => 50 + Math.sin(i / 3) * 30 + ((i * 17) % 21))} /></CardBody></Card></TabsContent>
          <TabsContent value="console"><TerminalPanel status={status} height={320} /></TabsContent>
          <TabsContent value="files"><FileExplorer /></TabsContent>
          <TabsContent value="databases" className="grid gap-4 lg:grid-cols-2"><Card><CardHeader><CardTitle>Connection</CardTitle></CardHeader><CardBody><DatabaseCredentials /></CardBody></Card><Card><CardHeader><CardTitle>Databases</CardTitle><Button size="sm" variant="outline"><Plus />New</Button></CardHeader><CardBody className="space-y-2">{['app', 'analytics', 'sessions'].map((d, i) => <div key={d} className="flex items-center gap-3 rounded-lg border border-line p-3"><Database className="size-4 text-dim" /><span className="flex-1 font-mono text-[13px]">{d}</span><span className="text-xs text-dim">{[1.2, 4.8, 0.2][i]} GB</span></div>)}</CardBody></Card></TabsContent>
          <TabsContent value="backups"><SnapshotList /></TabsContent>
          <TabsContent value="startup" className="grid gap-4 lg:grid-cols-2"><Card><CardHeader><CardTitle>Startup command</CardTitle></CardHeader><CardBody className="space-y-4"><FormField label="Command"><input defaultValue="node server.js" className={cn(inputCls(), 'font-mono')} /></FormField><FormField label="Runtime version"><Select value="22" onValueChange={() => {}} options={[['22', 'Node.js 22 LTS'], ['20', 'Node.js 20 LTS']]} /></FormField><Button>Save changes</Button></CardBody></Card><Card><CardHeader><CardTitle>Environment variables</CardTitle></CardHeader><CardBody><KeyValueEditor rows={[['NODE_ENV', 'production'], ['PORT', String(a.port)], ['DATABASE_URL', 'postgres://…']]} secret /></CardBody></Card></TabsContent>
          <TabsContent value="network" className="space-y-4"><IPAddressDisplay /><FirewallRules /></TabsContent>
          <TabsContent value="git" className="grid gap-4 lg:grid-cols-2"><Card><CardHeader><CardTitle>Repository</CardTitle><Badge tone="ok">Connected</Badge></CardHeader><CardBody className="space-y-4"><div className="flex items-center gap-3 rounded-lg border border-line p-3"><GitBranch className="size-4 text-dim" /><div className="flex-1"><div className="font-mono text-[13px]">stefan/blipmade-api</div><div className="text-xs text-dim">Branch main · auto-deploy on push</div></div><Switch defaultChecked aria-label="Auto deploy" /></div><Button variant="outline">Deploy latest</Button></CardBody></Card><Card><CardHeader><CardTitle>Deployments</CardTitle></CardHeader><CardBody className="space-y-2">{[['#482', 'success', '41s', 'fix: retry payments'], ['#481', 'success', '38s', 'feat: cart totals'], ['#480', 'failed', '12s', 'chore: bump deps']].map(([n, s, t, m]) => <div key={n} className="flex items-center gap-3 text-[13px]"><span className="font-mono text-dim">{n}</span><Badge tone={s === 'success' ? 'ok' : 'bad'}>{s}</Badge><span className="flex-1 truncate">{m}</span><span className="font-mono text-xs text-dim">{t}</span></div>)}</CardBody></Card></TabsContent>
        </div>
      </Tabs>
    </>
  )
}

/* ================= VPS ================= */
export function VpsList() {
  const nav = useNavigate()
  const { services } = useStore()
  const vps = services.filter((s) => /VPS/.test(s.type))
  return (<><PageHeader title="VPS" description="Virtual servers with full root access."><Button onClick={() => nav('/catalog')}><Plus />New VPS</Button></PageHeader><div className="grid gap-4 md:grid-cols-2">{vps.map((s) => <button key={s.id} onClick={() => nav('/vps/' + s.id)} className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4 text-left transition-colors hover:border-line-2"><div className="flex items-center gap-3"><IconTile><Server /></IconTile><div className="flex-1"><div className="text-[14px] font-semibold">{s.name}</div><div className="font-mono text-[11.5px] text-dim">{s.ip} · {s.region}</div></div><Badge tone={s.status === 'running' ? 'ok' : 'neutral'}>{s.status}</Badge></div><div className="grid grid-cols-3 gap-3 text-[12px] text-dim">{[['CPU', s.cpu], ['RAM', s.ram], ['DISK', s.disk]].map(([l, v]) => <div key={l} className="space-y-1.5"><div className="flex justify-between"><span>{l}</span><span className="text-mute">{Math.round(v)}%</span></div><Progress value={v} /></div>)}</div></button>)}</div></>)
}
export function VpsDetail() {
  const { id } = useParams()
  const { services, patchService } = useStore()
  const s = services.find((x) => x.id === id) || services[0]
  const act = (x) => { if (x === 'restart') { patchService(s.id, { status: 'restarting' }); setTimeout(() => patchService(s.id, { status: 'running' }), 1800) } else patchService(s.id, { status: x === 'stop' ? 'stopped' : 'running' }) }
  return (
    <>
      <Breadcrumbs items={['VPS', s.name]} />
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">{s.name}<Badge tone={s.status === 'running' ? 'ok' : 'neutral'}>{s.status}</Badge></h1><p className="font-mono text-xs text-dim">{s.type} · {s.region} · {s.ip}</p></div><PowerControls status={s.status} onAction={act} /></div>
      <Tabs defaultValue="overview"><TabsList>{['overview', 'console', 'snapshots', 'ssh', 'network'].map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t === 'ssh' ? 'SSH keys' : t}</TabsTrigger>)}</TabsList><div className="pt-6"><TabsContent value="overview" className="space-y-4"><Card><CardBody><ResourceUsage cpu={s.cpu} ram={s.ram} disk={s.disk} /></CardBody></Card><IPAddressDisplay /></TabsContent><TabsContent value="console"><TerminalPanel status={s.status} height={320} /></TabsContent><TabsContent value="snapshots"><SnapshotList /></TabsContent><TabsContent value="ssh" className="space-y-4"><SSHKeyList /><Button variant="outline"><Plus />Add SSH key</Button></TabsContent><TabsContent value="network" className="space-y-4"><IPAddressDisplay /><FirewallRules /></TabsContent></div></Tabs>
    </>
  )
}

/* ================= Email ================= */
export function EmailPage() {
  return (
    <>
      <PageHeader title="Email hosting" description="Mailboxes, aliases and webmail for blipmade.app."><Button><Plus />New mailbox</Button></PageHeader>
      <Tabs defaultValue="mailboxes"><TabsList>{['mailboxes', 'webmail', 'dns'].map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}</TabsList><div className="pt-6"><TabsContent value="mailboxes" className="space-y-4"><MailboxTable /><Card><CardHeader><CardTitle>SMTP / IMAP</CardTitle></CardHeader><CardBody className="grid gap-2.5 sm:grid-cols-2"><CopyValue label="SMTP" value="smtp.blipmade.mail:465" /><CopyValue label="IMAP" value="imap.blipmade.mail:993" /></CardBody></Card></TabsContent><TabsContent value="webmail"><Webmail /></TabsContent><TabsContent value="dns"><DNSRecordTable /></TabsContent></div></Tabs>
    </>
  )
}

/* ================= Billing hub ================= */
export function BillingPage() {
  const { balance } = useStore()
  return (
    <>
      <PageHeader title="Billing" description="Credit, subscriptions, payment methods and invoices." />
      <RenewalNotice />
      <Tabs defaultValue="overview"><TabsList>{['overview', 'invoices', 'subscriptions', 'payment'].map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t === 'payment' ? 'Payment methods' : t}</TabsTrigger>)}</TabsList><div className="space-y-6 pt-6">
        <TabsContent value="overview" className="grid gap-4 lg:grid-cols-2"><CreditBalance amount={balance} onAdd={() => toast('Use “Credit · add funds” in the sidebar')} /><Card><CardHeader><CardTitle>This month</CardTitle></CardHeader><CardBody><PriceBreakdown lines={[['VPS Pro', 12], ['Managed DB', 29], ['Domain (prorated)', 1.17]]} total={42.17} /></CardBody></Card></TabsContent>
        <TabsContent value="invoices" className="space-y-6"><Invoices /></TabsContent>
        <TabsContent value="subscriptions" className="space-y-3">{SUBS.map((s) => <div key={s.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-card p-4"><div className="min-w-48 flex-1"><div className="text-[14px] font-medium">{s.name}</div><div className="text-xs text-dim">{money(s.price)} · {s.cycle}</div></div><div className="text-right text-xs text-dim">{s.status === 'active' ? `Renews ${s.next}` : 'Cancelled'}</div><Badge tone={s.status === 'active' ? 'ok' : 'neutral'}>{s.status}</Badge><Button variant="outline" size="sm">Manage</Button></div>)}</TabsContent>
        <TabsContent value="payment" className="grid gap-3 lg:grid-cols-2"><PaymentMethodCard def /><PaymentMethodCard brand="MC" last="9931" exp="02/27" /><Button variant="outline" className="lg:col-span-2"><Plus />Add payment method</Button></TabsContent>
      </div></Tabs>
    </>
  )
}

/* ================= Notifications ================= */
export function NotificationsPage() {
  const [items, setItems] = useState(NOTIFS)
  const [f, setF] = useState('all')
  const rows = items.filter((n) => f === 'all' || n.unread)
  return (
    <>
      <PageHeader title="Notifications" description="Alerts about your services and billing."><Button variant="outline" onClick={() => setItems(items.map((n) => ({ ...n, unread: false })))}>Mark all read</Button></PageHeader>
      <ChipTabs value={f} onValueChange={setF} items={[['all', 'All', items.length], ['unread', 'Unread', items.filter((n) => n.unread).length]]} />
      {rows.length === 0 ? <EmptyState icon={<Bell />} title="You are all caught up">New alerts appear here.</EmptyState> : <div className="divide-y divide-line/60 rounded-xl border border-line bg-card">{rows.map((n) => <div key={n.id} className="flex items-start gap-3 px-4 py-3.5"><i className={cn('mt-1.5 size-2 rounded-full', n.kind === 'bad' ? 'bg-bad' : n.kind === 'ok' ? 'bg-ok' : n.kind === 'warn' ? 'bg-warn' : 'bg-info')} /><div className="flex-1"><div className={cn('text-[13.5px]', n.unread && 'font-semibold')}>{n.t}</div><div className="text-xs text-dim">{n.d}</div></div><span className="text-xs text-dim">{n.when}</span></div>)}</div>}
      <Card><CardHeader><CardTitle>Preferences</CardTitle></CardHeader><CardBody className="space-y-4">{[['Billing & invoices', true], ['Service alerts', true], ['Maintenance windows', true], ['Product news', false]].map(([l, v]) => <div key={l} className="flex items-center justify-between"><span className="text-[13.5px]">{l}</span><Switch defaultChecked={v} aria-label={l} /></div>)}</CardBody></Card>
    </>
  )
}

/* ================= Account & security ================= */
export function AccountPage() {
  const [otp, setOtp] = useState('')
  return (
    <>
      <PageHeader title="Account & security" description="Profile, password and two-factor authentication." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Profile</CardTitle></CardHeader><CardBody className="space-y-4"><FormField label="Name"><input defaultValue="Stefan" className={inputCls()} /></FormField><FormField label="Email" hint="Verified"><input defaultValue="stefan10xdd@gmail.com" className={inputCls()} /></FormField><Button>Save changes</Button></CardBody></Card>
        <Card><CardHeader><CardTitle>Password</CardTitle></CardHeader><CardBody className="space-y-4"><FormField label="Current password"><PasswordInput /></FormField><FormField label="New password" hint="At least 12 characters"><PasswordInput autoComplete="new-password" /></FormField><Button variant="outline">Update password</Button></CardBody></Card>
        <Card><CardHeader><CardTitle>Two-factor authentication</CardTitle><Badge tone="warn">Off</Badge></CardHeader><CardBody className="space-y-4"><p className="text-[13px] text-mute">Enter the 6-digit code from your authenticator app to enable.</p><OTPInput value={otp} onChange={setOtp} /><Button disabled={otp.length < 6} onClick={() => toast.success('2FA enabled (simulated)')}>Enable 2FA</Button></CardBody></Card>
        <Card><CardHeader><CardTitle>API keys & sessions</CardTitle></CardHeader><CardBody className="space-y-3"><CopyValue label="Key" value="blip_live_9f3a21c7d84e" mask /><Separator />{[['Chrome · Windows', 'Current session'], ['Safari · iPhone', '2 days ago']].map(([a, b]) => <div key={a} className="flex items-center justify-between text-[13px]"><span>{a}</span><span className="text-xs text-dim">{b}</span></div>)}</CardBody></Card>
      </div>
      <Card className="border-bad/30"><CardHeader><CardTitle className="text-bad">Danger zone</CardTitle></CardHeader><CardBody className="flex items-center justify-between gap-4"><p className="text-[13px] text-mute">Permanently delete your account and all services.</p><Button variant="destructive">Delete account</Button></CardBody></Card>
    </>
  )
}
