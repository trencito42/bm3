import { useState } from 'react'
import { toast } from 'sonner'
import { chat } from '../chat/store.js'
import { Doc, Demo, Row } from './Doc.jsx'
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Switch, Segmented } from '../components/ui.jsx'
import { CopyValue, InlineAlert, Select } from '../components/ui2.jsx'
import { DotBars } from '../components/DotViz.jsx'
import {
  AuditEvent, BillingPeriod, CreditBalance, DNSRecordTable, DatabaseCredentials, FileExplorer, FirewallRules, IPAddressDisplay, IncidentCard, InfrastructureNode, KeyValueEditor, LiveChatWidget, MailboxTable, NetworkTraffic, OSSelector,
  OrderTimeline, PaymentMethodCard, PlanSelector, PowerControls, PriceBreakdown, ProvisioningTimeline, RegionSelector, RenewalNotice, ResourceUsage, SSHKeyList, SSLStatus, ServerCard, SnapshotList, TerminalPanel, TicketThread, UploadManager, Webmail,
} from '../components/product.jsx'
import { APPS, AUDIT, INCIDENTS, NODES, STAFF } from '../lib/mock'
import { Checkbox } from '../components/ui2.jsx'
import { cn } from '../lib/utils'
import { AccessPermissions, AddonSelector, AliasManager, AttachmentPreview, BillingTimeline, CRMActivity, CodeEditor, FilePermissions, FolderTree, NewConversation, PlanComparison, PresetSelector, ServerActivity, VersionSelector } from '../components/ui3.jsx'

function Servers() {
  const [status, setStatus] = useState('running')
  const act = async (a) => { if (a === 'restart') { setStatus('restarting'); setTimeout(() => setStatus('running'), 1800) } else setStatus(a === 'stop' ? 'stopped' : 'running') }
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">{APPS.map((a) => <ServerCard key={a.id} app={a} onOpen={() => toast('Open instance (simulated)')} />)}</div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Demo label="ServerHeader · PowerControls · ResourceUsage" sim><div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-lg font-semibold">api-gateway<Badge tone={status === 'running' ? 'ok' : status === 'restarting' ? 'warn' : 'neutral'}>{status}</Badge></div><div className="font-mono text-xs text-dim">Node.js 22 · fra-1 · :3000</div></div><PowerControls status={status} onAction={act} /></div><ResourceUsage cpu={status === 'running' ? 31 : 0} ram={status === 'running' ? 54 : 0} disk={22} /></div></Demo>
        <Demo label="NetworkTraffic · UptimeChart"><NetworkTraffic values={Array.from({ length: 36 }, (_, i) => 60 + Math.sin(i / 3) * 40 + ((i * 17) % 23))} /></Demo>
        <Demo label="StartupVariables · EnvironmentVariables"><KeyValueEditor rows={[['NODE_ENV', 'production'], ['PORT', '3000'], ['LOG_LEVEL', 'info']]} /></Demo>
        <Demo label="DatabaseCredentials · ResourceLimits"><div className="space-y-4"><DatabaseCredentials /><div className="grid grid-cols-3 gap-2 text-center text-[12px]">{[['CPU', '200%'], ['Memory', '4 GB'], ['Disk', '80 GB']].map(([a, b]) => <div key={a} className="rounded-lg border border-line p-2.5"><div className="font-mono text-[10px] uppercase text-dim">{a}</div><div className="mt-1 font-mono text-[13px]">{b}</div></div>)}</div></div></Demo>
      </div>
    </>
  )
}
const Console = () => <div className="grid gap-5 lg:grid-cols-2"><Demo label="TerminalPanel · ConsoleToolbar · CommandInput" sim pad={false} className="border-0 bg-transparent"><TerminalPanel /></Demo><div className="space-y-5"><Demo label="ConsoleEmptyState · offline" pad={false} className="border-0 bg-transparent"><TerminalPanel status="stopped" height={140} /></Demo><InlineAlert tone="bad" title="Connection lost">The websocket closed unexpectedly. Reconnecting in 5 s…</InlineAlert></div></div>
const Files = () => <><Demo label="FileExplorer · FileToolbar · FileContextMenu · FilePreview (right-click a row, Ctrl-click to multi-select)" sim pad={false} className="border-0 bg-transparent"><FileExplorer /></Demo><div className="grid gap-5 lg:grid-cols-2"><Demo label="UploadManager" sim><UploadManager /></Demo><Demo label="CompressionProgress · ArchiveDownload"><div className="space-y-3 text-[13px]"><div className="flex items-center justify-between"><span>Compressing 3 items…</span><span className="font-mono text-xs text-dim">72%</span></div><div className="h-1.5 rounded-full bg-white/10"><i className="block h-full w-[72%] rounded-full bg-fg" /></div><Button variant="outline" size="sm">Download archive.tar.gz (48 MB)</Button></div></Demo></div></>
const VPS = () => (
  <div className="grid gap-5 lg:grid-cols-2">
    <Demo label="VPSDetails · IPAddressDisplay"><div className="space-y-4"><div className="grid grid-cols-3 gap-2 text-center text-[12px]">{[['vCPU', '2'], ['RAM', '4 GB'], ['NVMe', '80 GB']].map(([a, b]) => <div key={a} className="rounded-lg border border-line p-2.5"><div className="font-mono text-[10px] uppercase text-dim">{a}</div><div className="mt-1 font-mono text-[13px]">{b}</div></div>)}</div><IPAddressDisplay /></div></Demo>
    <Demo label="SnapshotList · RestoreConfirmation (type “restore”)" pad={false} className="border-0 bg-transparent"><SnapshotList /></Demo>
    <Demo label="SSHKeyList" pad={false} className="border-0 bg-transparent"><SSHKeyList /></Demo>
    <Demo label="FirewallRules" pad={false} className="border-0 bg-transparent"><FirewallRules /></Demo>
  </div>
)
function Commerce() {
  const [plan, setPlan] = useState('pro'); const [per, setPer] = useState('m'); const [region, setRegion] = useState('Frankfurt'); const [os, setOs] = useState('Ubuntu 24.04')
  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Demo label="PlanSelector · BillingPeriodSelector · RegionSelector · OperatingSystemSelector" sim><div className="space-y-5"><BillingPeriod value={per} onChange={setPer} /><PlanSelector value={plan} onChange={setPlan} yearly={per === 'y'} /><RegionSelector value={region} onChange={setRegion} /><OSSelector value={os} onChange={setOs} /></div></Demo>
        <Demo label="PriceBreakdown · OrderReview"><div className="space-y-4"><PriceBreakdown lines={[[`${plan[0].toUpperCase() + plan.slice(1)} plan`, plan === 'nano' ? 4 : plan === 'pro' ? 12 : 29], ['Daily backups', 2], ['Yearly discount', per === 'y' ? -3 : 0]].filter((l) => l[1] !== 0)} total={(plan === 'nano' ? 4 : plan === 'pro' ? 12 : 29) + 2 - (per === 'y' ? 3 : 0)} /><Button className="w-full" size="lg">Continue to payment</Button></div></Demo>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Demo label="ProvisioningTimeline · in progress"><ProvisioningTimeline step={3} /></Demo>
        <Demo label="DeploymentSuccess"><div className="grid place-items-center gap-2 py-4 text-center"><div className="grid size-11 place-items-center rounded-full bg-ok/10 text-ok">✓</div><div className="text-[15px] font-semibold">Server is live</div><CopyValue value="ssh root@45.83.12.9" /></div></Demo>
        <Demo label="DeploymentFailure"><div className="space-y-3"><ProvisioningTimeline step={2} failed /><div className="flex gap-2"><Button size="sm">Retry</Button><Button size="sm" variant="outline">Choose another region</Button></div></div></Demo>
      </div>
    </>
  )
}
const Domains = () => <div className="grid gap-5 lg:grid-cols-2"><Demo label="DNSRecordTable · DNSRecordEditor (add a record with an invalid A value)" sim className="lg:col-span-2"><DNSRecordTable /></Demo><Demo label="SSLStatus · states"><div className="space-y-2.5">{['valid', 'expiring', 'pending', 'error'].map((s) => <SSLStatus key={s} state={s} />)}</div></Demo><Demo label="DNSHealth · DNSVerificationStatus"><div className="space-y-2.5 text-[13.5px]">{[['A record', true], ['MX records', true], ['SPF', true], ['DKIM', true], ['DMARC', false]].map(([l, ok]) => <div key={l} className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5">{l}<Badge tone={ok ? 'ok' : 'warn'}>{ok ? 'Verified' : 'Missing'}</Badge></div>)}</div></Demo></div>
const Mail = () => <><Demo label="MailboxTable" pad={false} className="border-0 bg-transparent"><MailboxTable /></Demo><div className="grid gap-5"><Demo label="WebmailInbox · MessageList · MessageReader · ComposeWindow (open, reply, compose, delete)" sim pad={false} className="border-0 bg-transparent"><Webmail /></Demo><Demo label="SMTPConfiguration"><div className="space-y-2.5"><CopyValue label="Host" value="smtp.blipmade.mail" /><CopyValue label="Port" value="465 · SSL" /><CopyValue label="User" value="stefan@blipmade.app" /><CopyValue label="Pass" value="app-password-demo" mask /></div></Demo></div></>
const Billing = () => <div className="grid gap-5 lg:grid-cols-2"><CreditBalance amount={42.5} onAdd={() => toast('Add funds (simulated)')} /><RenewalNotice /><Demo label="PaymentMethodCard"><div className="space-y-2.5"><PaymentMethodCard def /><PaymentMethodCard brand="MC" last="9931" exp="02/27" /></div></Demo><Demo label="SubscriptionCard · PaymentStatus · RefundReview"><div className="space-y-3"><div className="flex items-center justify-between rounded-lg border border-line p-3.5"><div><div className="text-[13.5px] font-medium">VPS Pro · blipmade-prod</div><div className="text-xs text-dim">$12.00 monthly · renews Dec 02</div></div><Badge tone="ok">Active</Badge></div><InlineAlert tone="warn" title="Refund request under review" action={<Button size="sm" variant="outline">Open</Button>}>$9.00 · INV-1031 · submitted yesterday</InlineAlert></div></Demo></div>
const ChatDemo = () => (
  <Demo label="Chat · the launcher morphs into the conversation" sim>
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => chat.open()}>Open the chat</Button>
      <Button variant="outline" onClick={() => { chat.open(); setTimeout(() => chat.send('My Minecraft server lags every night'), 700) }}>Try a hand-off to Glitch</Button>
      <Button variant="ghost" onClick={() => { chat.restart(); chat.open(); setTimeout(() => chat.requestOperator(), 500) }}>Talk to a person</Button>
    </div>
    <p className="mt-3 text-xs text-dim">The round button at the bottom right is the real widget. Press it (or these buttons): it grows into the chat, a Blip hands over to another Blip when the topic changes, a person joins from a queue, and ending the chat asks for a rating. On phones it becomes a full-screen sheet that follows the keyboard.</p>
  </Demo>
)
const Support = () => <div className="space-y-5"><ChatDemo /><div className="grid gap-5 lg:grid-cols-2"><Demo label="TicketConversation · MessageComposer" sim pad={false}><div className="h-80"><TicketThread initial={[['me', 'I cannot SSH into blipmade-prod.', '09:12'], ['bot', 'Thanks. I restored the firewall rule for port 22.', '09:14']]} /></div></Demo><Demo label="LiveChatWidget · AgentPresence" sim><div className="grid place-items-center"><LiveChatWidget /></div></Demo><Demo label="SupportRating · ConversationClosed" className="lg:col-span-2"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="text-[14px] font-medium">Conversation closed</div><div className="text-xs text-dim">How was your experience with Maria?</div></div><div className="flex gap-2">{['😞', '😐', '🙂', '😀'].map((e) => <button key={e} className="grid size-10 place-items-center rounded-lg border border-line-2 text-lg transition-colors hover:bg-hover">{e}</button>)}</div></div></Demo></div></div>
const Admin = () => (
  <>
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">{NODES.map((n) => <InfrastructureNode key={n.id} n={n} />)}</div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Demo label="IncidentStatus" className="border-0 bg-transparent p-0"><div className="space-y-3">{INCIDENTS.map((i) => <IncidentCard key={i.id} i={i} />)}</div></Demo>
      <Demo label="OrderTimeline · ProvisioningStatus"><OrderTimeline events={[['Order placed', 'ORD-20418 · VPS Pro × 2', '10:02', 'ok'], ['Payment captured', 'Visa •••• 4242', '10:02', 'ok'], ['Fraud check passed', 'score 12 / 100', '10:03', 'ok'], ['Provisioning', 'fra-1 · instance 1 of 2', '10:04', 'warn']]} /></Demo>
      <Demo label="AuditEvent · ActivityTimeline" pad={false}>{AUDIT.map((e) => <AuditEvent key={e.id} e={e} />)}</Demo>
      <Demo label="StaffPermissions · PricingEditor"><div className="space-y-4"><div className="overflow-hidden rounded-lg border border-line text-[12.5px]"><div className="grid grid-cols-[minmax(0,1fr)_repeat(5,38px)] sm:grid-cols-[1fr_repeat(5,48px)] border-b border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[.06em] text-dim"><span>Staff</span>{['Cust', 'Bill', 'Infra', 'Supp', 'Set'].map((c) => <span key={c} className="text-center">{c}</span>)}</div>{STAFF.map((s) => <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_repeat(5,38px)] sm:grid-cols-[1fr_repeat(5,48px)] items-center border-b border-line/50 px-3 py-2 last:border-b-0"><span>{s.name}<span className="ml-2 text-dim">{s.role}</span></span>{Object.values(s.perms).map((p, i) => <span key={i} className="text-center font-mono text-[11px]">{p || '—'}</span>)}</div>)}</div><div className="grid grid-cols-3 gap-2">{[['Monthly', '12.00'], ['Quarterly', '33.12'], ['Yearly', '115.20']].map(([a, b]) => <div key={a} className="rounded-lg border border-line p-2.5"><div className="font-mono text-[10px] uppercase text-dim">{a}</div><div className="mt-1 font-mono text-[13px]">${b}</div></div>)}</div></div></Demo>
    </div>
  </>
)


const More = () => (
  <div className="grid gap-5 lg:grid-cols-2">
    <Demo label="FolderTree · CodeEditor (type, then Save / Revert)" sim className="lg:col-span-2"><div className="grid gap-4 md:grid-cols-[220px_1fr]"><FolderTree /><CodeEditor initial={`import http from 'http'

const port = 3000 // listen port

http.createServer((req, res) => {
  res.end('ok')
}).listen(port)`} /></div></Demo>
    <Demo label="FilePermissions"><FilePermissions /></Demo>
    <Demo label="AccessPermissions · collaborators" pad={false}><AccessPermissions /></Demo>
    <Demo label="ServerActivity" pad={false}><ServerActivity /></Demo>
    <Demo label="SoftwareVersionSelector · PresetSelector"><div className="space-y-5"><VersionSelector /><PresetSelector /></div></Demo>
    <Demo label="AddonSelector" sim><AddonSelector /></Demo>
    <Demo label="PlanComparison (hover a column)" pad={false}><PlanComparison /></Demo>
    <Demo label="AliasManager (validates the local part)" sim><AliasManager /></Demo>
    <Demo label="BillingTimeline"><BillingTimeline /></Demo>
    <Demo label="CRMActivity"><CRMActivity /></Demo>
    <Demo label="NewConversation · AttachmentPreview"><div className="space-y-4"><NewConversation /><AttachmentPreview /></div></Demo>
  </div>
)

export default function Product() {
  return <Doc title="Product components" lead="Hosting-native pieces assembled from the shared primitives: servers, console, files, VPS, deployment, domains, mail, billing, support and admin. Interactive pieces are simulated with local mock data." sections={[
    { id: 'servers', title: 'Servers & apps', node: <Servers /> },
    { id: 'console', title: 'Console', node: <Console /> },
    { id: 'files', title: 'File manager', node: <Files /> },
    { id: 'vps', title: 'VPS', node: <VPS /> },
    { id: 'commerce', title: 'Deployment & commerce', node: <Commerce /> },
    { id: 'domains', title: 'Domains & DNS', node: <Domains /> },
    { id: 'mail', title: 'Email & webmail', node: <Mail /> },
    { id: 'billing', title: 'Billing', node: <Billing /> },
    { id: 'support', title: 'Support', node: <Support /> },
    { id: 'admin', title: 'Administration', node: <Admin /> },
    { id: 'more', title: 'More product components', node: <More /> },
  ]} />
}
