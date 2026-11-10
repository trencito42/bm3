/* VPS management: the list, then one server with its tabs. The remote console is the moment that earns an effect:
   a power cycle replays the boot text decoding out of noise, and a rescue boot has its own calm banner. */
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ArrowRight, Cpu, Disc3, Key, Network, Plus, Power, RotateCcw, Server, Shield, Terminal } from 'lucide-react'
import { Badge, Button, Dialog, DialogContent, Segmented, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui.jsx'
import { Confirm, CopyValue, FormField, InlineAlert, Select, inputCls } from '../components/ui2.jsx'
import { FirewallRules, IPAddressDisplay, NetworkTraffic, OSSelector, PowerControls, ResourceUsage, SSHKeyList, SnapshotList } from '../components/product.jsx'
import { AsyncOperation, BulkTable, DestructiveDialog, ResourceAllocator } from './patterns.jsx'
import { Decode, Kv, Panel, ScreenHead, StateHero, Tile, eyebrow } from './kit.jsx'
import { cn, money } from '../lib/utils'

const SERVERS = [
  { id: 'web-01', name: 'web-01', plan: 'Pro', region: 'Frankfurt', ip: '45.83.12.9', os: 'Ubuntu 24.04', status: 'running', cpu: 31, price: 12 },
  { id: 'db-01', name: 'db-01', plan: 'Max', region: 'Frankfurt', ip: '45.83.12.17', os: 'Debian 12', status: 'running', cpu: 58, price: 29 },
  { id: 'lab', name: 'lab', plan: 'Nano', region: 'Helsinki', ip: '95.216.4.31', os: 'Arch', status: 'stopped', cpu: 0, price: 4 },
  { id: 'ci-runner', name: 'ci-runner', plan: 'Pro', region: 'Amsterdam', ip: '31.14.8.202', os: 'Ubuntu 24.04', status: 'provisioning', cpu: 0, price: 12 },
]
const ST = { running: 'ok', stopped: 'neutral', provisioning: 'warn' }

/* the remote console: a screen, a keyboard row and the boot sequence */
const BOOT = ['BIOS v2.4 · 4 vCPU · 8192 MB', 'Booting from disk 0…', 'Linux 6.8.0-45-generic', 'systemd[1]: Reached target Multi-User System.', 'web-01 login:']
function RemoteConsole({ status, rescue, onPower }) {
  const [run, setRun] = useState(0), [lines, setLines] = useState(BOOT), [cmd, setCmd] = useState('')
  useEffect(() => { if (!run) return; setLines([]); BOOT.forEach((l, i) => setTimeout(() => setLines((x) => [...x, l]), 350 + i * 450)) }, [run])
  if (status !== 'running') return <Panel pad={false}><StateHero state="waiting" role="dev" word="POWERED OFF." sub="Turn it on to see its screen." small><Button onClick={() => onPower('start')}><Power />Power on</Button></StateHero></Panel>
  return (
    <div className="space-y-3">
      {rescue && <InlineAlert tone="info" title="Rescue mode">You are in a temporary system. Your disk is attached at /mnt. Reboot normally when you are done.</InlineAlert>}
      <div className="overflow-hidden rounded-xl border border-line-2 bg-black">
        <div className="flex items-center justify-between border-b border-line px-3 py-1.5 text-[11.5px] text-dim"><span className="flex items-center gap-2"><i className="size-1.5 rounded-full bg-ok" />Connected · 1024×768</span><span>Click inside to type</span></div>
        <div tabIndex={0} aria-label="Server screen" className="h-[300px] overflow-auto p-4 font-mono text-[12.5px] leading-5 text-ok/90 outline-none focus-visible:ring-1 focus-visible:ring-white/30" onKeyDown={(e) => { if (e.key.length === 1) setCmd((c) => c + e.key); if (e.key === 'Backspace') setCmd((c) => c.slice(0, -1)); if (e.key === 'Enter') { setLines((l) => [...l, `$ ${cmd}`, cmd ? `${cmd}: ok (simulated)` : '']); setCmd('') } }}>{lines.map((l, i) => <div key={i}>{i === lines.length - 1 && run ? <Decode text={l} per={16} /> : l}</div>)}<div>$ {cmd}<span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-ok/80 align-middle" /></div></div>
      </div>
      <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => toast('Sent Ctrl+Alt+Del (simulated)')}>Ctrl+Alt+Del</Button><Button size="sm" variant="outline" onClick={() => setRun((n) => n + 1)}>Replay boot</Button><Button size="sm" variant="ghost" onClick={() => toast('Pasted (simulated)')}>Paste text</Button></div>
    </div>
  )
}

function Detail({ s, onBack }) {
  const [status, setStatus] = useState(s.status === 'provisioning' ? 'running' : s.status), [tab, setTab] = useState('overview'), [rescue, setRescue] = useState(false), [iso, setIso] = useState('none'), [os, setOs] = useState(s.os), [rdns, setRdns] = useState('web-01.example-studio.com')
  const act = (a) => { if (a === 'restart') { setStatus('restarting'); setTimeout(() => setStatus('running'), 1800) } else setStatus(a === 'stop' ? 'stopped' : 'running') }
  const T = [['overview', 'Overview'], ['console', 'Console'], ['network', 'Networking'], ['firewall', 'Firewall'], ['keys', 'SSH keys'], ['snapshots', 'Snapshots'], ['media', 'ISO and rescue'], ['reinstall', 'Reinstall'], ['resources', 'Resources'], ['billing', 'Billing']]
  const body = {
    overview: <div className="grid gap-5 lg:grid-cols-3"><Panel title="Usage" className="lg:col-span-2"><ResourceUsage cpu={status === 'running' ? s.cpu || 31 : 0} ram={status === 'running' ? 54 : 0} disk={22} /><div className="mt-5"><NetworkTraffic values={Array.from({ length: 36 }, (_, i) => 40 + Math.sin(i / 4) * 30 + ((i * 13) % 17))} /></div></Panel><Panel title="Server"><div className="space-y-4"><div className="grid grid-cols-3 gap-2"><Tile label="vCPU" value="4" /><Tile label="RAM" value="8 GB" /><Tile label="NVMe" value="100 GB" /></div><IPAddressDisplay /></div></Panel></div>,
    console: <RemoteConsole status={status} rescue={rescue} onPower={act} />,
    network: <div className="grid gap-5 lg:grid-cols-2"><Panel title="Addresses"><IPAddressDisplay /><div className="mt-4 space-y-3"><FormField label="Reverse DNS (IPv4)" hint="Must resolve back to this address"><div className="flex gap-2"><input value={rdns} onChange={(e) => setRdns(e.target.value)} className={cn(inputCls(), 'font-mono')} /><Button variant="outline" onClick={() => toast.success('Reverse DNS saved (simulated)')}>Save</Button></div></FormField></div></Panel><Panel title="Private network" actions={<Switch defaultChecked aria-label="Private network" />}><Kv rows={[['Network', 'default · 10.0.4.0/24'], ['This server', '10.0.4.12'], ['Other servers', '2 connected']]} /></Panel></div>,
    firewall: <Panel title="Firewall" desc="Applied before traffic reaches your server" pad={false}><FirewallRules /></Panel>,
    keys: <Panel title="SSH keys" pad={false}><SSHKeyList /></Panel>,
    snapshots: <div className="grid gap-5 lg:grid-cols-3"><Panel title="Snapshots" className="lg:col-span-2" pad={false}><SnapshotList /></Panel><Panel title="Take one"><AsyncOperation label="Create snapshot" /></Panel></div>,
    media: <div className="grid gap-5 lg:grid-cols-2"><Panel title="Boot from an image" desc="Install another system or run a tool"><div className="space-y-4"><FormField label="Image"><Select value={iso} onValueChange={setIso} options={[['none', 'None, boot from disk'], ['debian', 'Debian 12 installer'], ['gparted', 'GParted Live'], ['memtest', 'Memtest86+']]} /></FormField>{iso !== 'none' && <InlineAlert tone="info" title="The server restarts into the image">Unmount it afterwards to boot from the disk again.</InlineAlert>}<Button disabled={iso === 'none'} onClick={() => toast.success('Image mounted, restarting (simulated)')}>Mount and restart</Button></div></Panel><Panel title="Rescue mode" desc="A temporary system with your disk attached"><div className="space-y-4"><p className="text-[13.5px] text-mute">Use it to fix a broken boot, reset a password or copy files off a server that will not start.</p><label className="flex items-center justify-between text-[13.5px]">Boot into rescue mode<Switch checked={rescue} onCheckedChange={(v) => { setRescue(v); toast(v ? 'Rebooting into rescue (simulated)' : 'Rebooting normally (simulated)') }} /></label></div></Panel></div>,
    reinstall: <Panel title="Reinstall" desc="Wipes the disk and installs a fresh system"><div className="max-w-xl space-y-5"><OSSelector value={os} onChange={setOs} /><InlineAlert tone="warn" title="Everything on the disk is erased">Take a snapshot first if you may need anything back. The IP address stays.</InlineAlert><DestructiveDialog target={s.name} confirmLabel="Reinstall" title={`Reinstall ${s.name} with ${os}?`} steps={['Powering off', 'Wiping the disk', `Installing ${os}`, 'First boot']} impact={[['The whole disk', 'is erased.', 'bad'], ['Snapshots', 'are kept.', 'warn']]} acks={['I took a snapshot or do not need the data.']} trigger={<Button variant="outline" className="text-bad"><RotateCcw />Reinstall</Button>} /></div></Panel>,
    resources: <Panel title="Resources"><div className="max-w-xl"><ResourceAllocator initial={{ cpu: 4, ram: 8, disk: 100 }} /></div></Panel>,
    billing: <div className="grid gap-5 lg:grid-cols-2"><Panel title="Subscription"><Kv rows={[['Plan', `${s.plan} · ${money(s.price)} / mo`], ['Billing', 'Monthly, hourly metering'], ['Next charge', 'Dec 02 · ' + money(s.price)], ['Payment method', 'Visa ending 6411']]} /><div className="mt-4 flex gap-2"><Button size="sm" variant="outline">Switch to yearly</Button><Confirm danger title={`Cancel ${s.name}?`} description="It stays on until the end of the paid period, then it is deleted after 7 days." confirmLabel="Cancel at period end" onConfirm={() => toast('Cancellation scheduled (simulated)')} trigger={<Button size="sm" variant="ghost" className="text-bad">Cancel</Button>} /></div></Panel><Panel title="This month"><Kv rows={[['Server', '$12.00'], ['Extra IPv4', '$1.50'], ['Snapshots 50 GB', '$2.00'], ['Total so far', '$15.50', 'ok']]} /></Panel></div>,
  }
  return (
    <div className="space-y-5">
      <ScreenHead back={<button onClick={onBack} className="mb-2 flex items-center gap-1.5 text-[13px] text-dim hover:text-fg">← Servers</button>} title={s.name} sub={`${s.plan} · ${s.region} · ${s.ip} · ${os}`} badge={<Badge tone={status === 'running' ? 'ok' : status === 'restarting' ? 'warn' : 'neutral'}>{rescue ? 'rescue' : status}</Badge>} actions={<PowerControls status={status} onAction={act} />} />
      <Tabs value={tab} onValueChange={setTab}><TabsList>{T.map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}</TabsList><div key={tab} className="step-in pt-5">{body[tab]}</div></Tabs>
    </div>
  )
}

export default function Vps() {
  const [open, setOpen] = useState(null), [state, setState] = useState('ready')
  if (open) return <Detail s={open} onBack={() => setOpen(null)} />
  return (
    <div className="space-y-5">
      <ScreenHead title="Servers" sub="Virtual servers with root access." actions={<Button><Plus />New server</Button>} />
      <div className="flex items-center gap-2"><span className={eyebrow}>List state</span><Segmented value={state} onValueChange={(v) => v && setState(v)} options={[['ready', 'Servers'], ['empty', 'Empty'], ['loading', 'Loading'], ['error', 'Error']]} /></div>
      {state === 'empty' ? <Panel pad={false}><StateHero state="idle" role="dev" word="NO SERVERS." sub="Your first one is online in under a minute." small><Button><Plus />Create a server</Button></StateHero></Panel>
        : <BulkTable state={state === 'ready' ? 'ready' : state} title="servers" rows={SERVERS} searchKeys={['name', 'ip', 'region']} filters={{ items: [['all', 'All'], ['running', 'Running'], ['stopped', 'Stopped']], match: (r, f) => r.status === f }} bulk={[['Restart'], ['Snapshot'], ['Stop']]} columns={[{ key: 'name', label: 'Server', sortable: true, cell: (r) => <button onClick={() => setOpen(r)} className="text-left font-medium hover:underline"><span className="block">{r.name}</span><span className="font-mono text-[11px] font-normal text-dim sm:hidden">{r.ip}</span></button> }, { key: 'plan', label: 'Plan', className: 'hidden sm:table-cell' }, { key: 'region', label: 'Region', className: 'hidden md:table-cell' }, { key: 'ip', label: 'IPv4', className: 'hidden font-mono sm:table-cell' }, { key: 'status', label: 'Status', cell: (r) => <Badge tone={ST[r.status]}>{r.status}</Badge> }, { key: 'price', label: 'Per month', align: 'right', cell: (r) => money(r.price) }]} />}
    </div>
  )
}
