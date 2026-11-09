import { useState } from 'react'
import { toast } from 'sonner'
import { Bell, ChevronDown, Copy, Download, Edit3, Eye, Inbox, Loader2, MoreHorizontal, Plus, Save, Search, Settings, Share2, Trash2, Upload, Home, Server, Receipt, LifeBuoy, Menu as MenuIcon, X, Folder, Globe } from 'lucide-react'
import { Doc, Demo, Row } from './Doc.jsx'
import { Avatar, Badge, Button, Card, Dialog, DialogContent, DialogTrigger, Input, Label, Menu, MenuContent, MenuItem, MenuLabel, MenuSep, MenuTrigger, Progress, Segmented, Slider, StatusBadge, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, Tooltip, EmptyState, ChipTabs, Separator, IconTile } from '../components/ui.jsx'
import { PasswordInput, Breadcrumbs, Checkbox, CodeBlock, Combobox, Confirm, ContextContent, ContextItem, ContextMenu, ContextSep, ContextTrigger, CopyButton, CopyValue, FormField, HoverCard, InlineAlert, NumberStepper, OTPInput, Pagination, Popover, PopoverContent, PopoverTrigger, Select, Skeleton, Stepper, TagInput, inputCls } from '../components/ui2.jsx'
import { DotBars, DotGauge } from '../components/DotViz.jsx'
import * as DialogP from '@radix-ui/react-dialog'
import * as RadioP from '@radix-ui/react-radio-group'
import { cn } from '../lib/utils'
import { ResizablePanel } from '../components/layouts.jsx'
import { AsyncCombobox, DataGrid, DatePicker, DateRangePicker, DateTimePicker, PercentInput, UnitStepper } from '../components/ui3.jsx'

/* ------------------------------ A. Actions ------------------------------ */
function Actions() {
  const [load, setLoad] = useState(false)
  const [sel, setSel] = useState(2)
  return (
    <>
      <Demo label="Button · variants × sizes × states">
        <div className="space-y-5">
          {['default', 'secondary', 'outline', 'ghost', 'destructive'].map((v) => (
            <Row key={v}><span className="w-24 font-mono text-[11px] uppercase text-dim">{v}</span><Button variant={v} size="sm">Small</Button><Button variant={v}>Medium</Button><Button variant={v} size="lg">Large</Button><Button variant={v} disabled>Disabled</Button><Button variant={v} loading={load} onClick={() => { setLoad(true); setTimeout(() => setLoad(false), 1500) }}>Save changes</Button></Row>
          ))}
        </div>
      </Demo>
      <div className="grid gap-5 lg:grid-cols-2">
        <Demo label="IconButton · ButtonGroup · SplitButton">
          <div className="space-y-4">
            <Row>{[Plus, Edit3, Share2, Trash2].map((I, i) => <Tooltip key={i} content={['Add', 'Edit', 'Share', 'Delete'][i]}><Button variant="outline" size="icon" aria-label={['Add', 'Edit', 'Share', 'Delete'][i]}><I /></Button></Tooltip>)}</Row>
            <div className="inline-flex overflow-hidden rounded-lg border border-line-2">{['Day', 'Week', 'Month'].map((l, i) => <button key={l} onClick={() => setSel(i)} className={cn('h-9 border-r border-line-2 px-4 text-[13px] last:border-r-0 transition-colors', sel === i ? 'bg-white/10 text-fg' : 'text-mute hover:bg-hover')}>{l}</button>)}</div>
            <div className="flex"><Button className="rounded-r-none" onClick={() => toast('Deploy simulated')}>Deploy</Button><Menu><MenuTrigger asChild><Button className="rounded-l-none border-l border-black/20 px-2" aria-label="More deploy options"><ChevronDown /></Button></MenuTrigger><MenuContent><MenuItem>Deploy to staging</MenuItem><MenuItem>Deploy from branch…</MenuItem><MenuItem>Schedule</MenuItem></MenuContent></Menu></div>
          </div>
        </Demo>
        <Demo label="LinkButton · CopyButton · FAB">
          <div className="space-y-4"><Row><button className="text-[13px] text-fg underline underline-offset-4 decoration-white/30 hover:decoration-fg">View documentation</button><CopyValue value="ssh root@45.83.12.9" /></Row><Row><CopyButton value="x" /><span className="text-[12.5px] text-dim">Copy flips to a check for 1.2 s</span></Row><button aria-label="New ticket" className="grid size-12 place-items-center rounded-full bg-fg text-black shadow-lg shadow-black/50 transition-transform hover:scale-105"><Plus className="size-5" /></button></div>
        </Demo>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Demo label="BulkActionToolbar"><div className="flex items-center gap-3 rounded-lg border border-line-2 bg-white/[0.04] px-3 py-2"><Checkbox checked /> <span className="text-[13px]">3 selected</span><span className="mx-1 h-4 w-px bg-line-2" /><Button size="sm" variant="ghost"><Download />Export</Button><Button size="sm" variant="ghost">Restart</Button><Button size="sm" variant="ghost" className="text-bad"><Trash2 />Delete</Button><button className="ml-auto text-xs text-dim hover:text-fg">Clear</button></div></Demo>
        <Demo label="Confirmation · destructive pattern (type to confirm)">
          <Row><Confirm title="Delete server?" description="This permanently deletes blipmade-prod, its disk and snapshots. This cannot be undone." danger confirmLabel="Delete forever" requireText="blipmade-prod" onConfirm={() => toast.error('Delete simulated')} trigger={<Button variant="destructive"><Trash2 />Delete server</Button>} /><Confirm title="Restart server?" description="Brief downtime of about 20 seconds." onConfirm={() => toast('Restart simulated')} trigger={<Button variant="outline">Restart</Button>} /></Row>
        </Demo>
      </div>
    </>
  )
}

/* ------------------------------ B. Inputs ------------------------------ */
function Inputs() {
  const [name, setName] = useState('')
  const [dom, setDom] = useState('blipmade')
  const [tags, setTags] = useState(['prod', 'eu'])
  const [os, setOs] = useState('ubuntu')
  const [multi, setMulti] = useState(['SSH'])
  const [otp, setOtp] = useState('12')
  const [gb, setGb] = useState([80])
  const [cpu, setCpu] = useState(2)
  const [cidr, setCidr] = useState('10.0.0.0/33')
  const bad = !/^\d{1,3}(\.\d{1,3}){3}\/([0-9]|[12][0-9]|3[0-2])$/.test(cidr)
  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        <Demo label="TextField · states">
          <div className="space-y-4">
            <FormField label="Project name" hint="Lowercase letters, numbers and dashes." required><input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-project" className={inputCls()} /></FormField>
            <FormField label="Invalid" error="Name is already taken in this region." required><input defaultValue="api-gateway" className={inputCls(true)} /></FormField>
            <FormField label="Read-only" optional><input readOnly defaultValue="fra-2.blipmade.cloud" className={inputCls()} /></FormField>
            <FormField label="Disabled"><input disabled defaultValue="Locked while provisioning" className={inputCls()} /></FormField>
          </div>
        </Demo>
        <Demo label="Domain · IP/CIDR · Money · Password">
          <div className="space-y-4">
            <FormField label="Domain" hint="We verify DNS after you save."><div className="flex"><input value={dom} onChange={(e) => setDom(e.target.value)} className={cn(inputCls(), 'rounded-r-none')} /><span className="grid h-9 place-items-center rounded-r-lg border border-l-0 border-line-2 px-3 font-mono text-[12.5px] text-dim">.blipmade.app</span></div></FormField>
            <FormField label="Allowed CIDR" error={bad ? 'Prefix must be between /0 and /32' : undefined} hint={!bad ? 'Valid range' : undefined}><input value={cidr} onChange={(e) => setCidr(e.target.value)} className={cn(inputCls(bad), 'font-mono')} /></FormField>
            <FormField label="Credit top-up"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-dim">$</span><input defaultValue="25.00" inputMode="decimal" className={cn(inputCls(), 'pl-7 text-right font-mono')} /></div></FormField>
            <FormField label="Password" hint="Min 12 characters"><PasswordInput defaultValue="hunter2hunter2" /></FormField>
          </div>
        </Demo>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Demo label="Select · Combobox · MultiSelect"><div className="space-y-3"><Select value={os} onValueChange={setOs} options={[['ubuntu', 'Ubuntu 24.04'], ['debian', 'Debian 12'], ['alma', 'AlmaLinux 9']]} /><Combobox value="Frankfurt" onChange={() => {}} options={['Frankfurt', 'Amsterdam', 'Helsinki', 'Ashburn']} /><Combobox multi value={multi} onChange={setMulti} placeholder="Open ports" options={['SSH', 'HTTP', 'HTTPS', 'Postgres', 'Redis']} /></div></Demo>
        <Demo label="Checkbox · Radio · Switch"><div className="space-y-4"><div className="space-y-2.5">{['Daily backups', 'DDoS protection'].map((l, i) => <label key={l} className="flex items-center gap-2.5 text-[13.5px]"><Checkbox defaultChecked={i === 0} />{l}</label>)}<label className="flex items-center gap-2.5 text-[13.5px] opacity-40"><Checkbox disabled />Disabled</label></div><RadioP.Root defaultValue="a" className="space-y-2.5">{[['a', 'Monthly'], ['b', 'Yearly']].map(([v, l]) => <label key={v} className="flex items-center gap-2.5 text-[13.5px]"><RadioP.Item value={v} className="grid size-4 place-items-center rounded-full border border-line-2 data-[state=checked]:border-fg"><RadioP.Indicator className="size-2 rounded-full bg-fg" /></RadioP.Item>{l}</label>)}</RadioP.Root><Row><Switch defaultChecked /><Switch /><Switch disabled /></Row></div></Demo>
        <Demo label="Slider · Steppers · OTP"><div className="space-y-4"><div><div className="mb-2 flex justify-between text-[12.5px]"><span className="text-mute">Disk</span><span className="font-mono">{gb[0]} GB</span></div><Slider min={25} max={500} step={25} value={gb} onValueChange={setGb} /></div><Row><NumberStepper value={cpu} onChange={setCpu} min={1} max={16} unit="vCPU" /></Row><OTPInput length={6} value={otp} onChange={setOtp} /></div></Demo>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Demo label="TagInput · SSH key · Dropzone"><div className="space-y-4"><FormField label="Labels"><TagInput value={tags} onChange={setTags} placeholder="Add label, press Enter" /></FormField><FormField label="Public SSH key"><textarea rows={3} defaultValue="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI… stefan@laptop" className={cn(inputCls(), 'h-auto py-2 font-mono text-[12px]')} /></FormField><div className="grid place-items-center gap-1 rounded-xl border border-dashed border-line-2 py-8 text-center text-[13px] text-mute transition-colors hover:border-white/40 hover:bg-hover"><Upload className="size-5" />Drop files or click to upload<span className="text-xs text-dim">Max 512 MB · simulated</span></div></div></Demo>
        <Demo label="Validation summary · unsaved changes"><div className="space-y-4"><InlineAlert tone="bad" title="2 fields need attention"><ul className="list-disc pl-4"><li>Project name is already taken</li><li>Allowed CIDR prefix is invalid</li></ul></InlineAlert><div className="flex items-center justify-between rounded-lg border border-line-2 bg-white/[0.04] px-4 py-2.5 text-[13px]"><span className="flex items-center gap-2"><i className="size-1.5 rounded-full bg-warn" />Unsaved changes</span><span className="flex gap-2"><Button variant="ghost" size="sm">Discard</Button><Button size="sm"><Save />Save</Button></span></div></div></Demo>
      </div>
    </>
  )
}


function Advanced() {
  const [d, setD] = useState(new Date(2026, 10, 12))
  const [s, setS] = useState(new Date(2026, 10, 1)); const [e, setE] = useState(new Date(2026, 10, 8))
  const [dt, setDt] = useState(new Date(2026, 10, 14))
  const [u, setU] = useState({ v: 80, u: 'GB' })
  const [pc, setPc] = useState('12.5')
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Demo label="DatePicker · DateRangePicker · DateTimePicker" sim><div className="space-y-3"><DatePicker value={d} onChange={setD} /><DateRangePicker start={s} end={e} onChange={(a, b) => { setS(a); setE(b) }} /><DateTimePicker value={dt} onChange={setDt} /></div></Demo>
      <Demo label="AsyncCombobox · UnitStepper · PercentInput" sim><div className="space-y-4"><AsyncCombobox /><div className="flex flex-wrap items-center gap-3"><UnitStepper value={u} onChange={setU} units={['MB', 'GB', 'TB']} /><PercentInput value={pc} onChange={setPc} />{+pc > 100 && <span className="text-xs text-bad">Max 100%</span>}</div></div></Demo>
      <Demo label="DataGrid · editable cells, keyboard navigation" sim className="lg:col-span-2"><DataGrid initial={[{ p: 'VPS Nano', r: 'Frankfurt', m: '$4.00', s: '212' }, { p: 'VPS Pro', r: 'Frankfurt', m: '$12.00', s: '96' }, { p: 'VPS Max', r: 'Amsterdam', m: '$29.00', s: '18' }, { p: 'DB Max', r: 'Helsinki', m: '$29.00', s: '4' }]} /></Demo>
    </div>
  )
}

/* ------------------------------ C. Navigation ------------------------------ */
function Navigation() {
  const [step, setStep] = useState(1)
  const [page, setPage] = useState(2)
  const [vt, setVt] = useState('general')
  const [tab, setTab] = useState('overview')
  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        <Demo label="Breadcrumbs · PageHeader"><div className="space-y-4"><Breadcrumbs items={['Services', 'blipmade-prod', 'Network']} /><div className="flex items-end justify-between"><div><h3 className="text-xl font-semibold tracking-tight">Network</h3><p className="text-[13px] text-dim">Firewall rules and addresses.</p></div><Button size="sm"><Plus />Add rule</Button></div></div></Demo>
        <Demo label="Tabs · VerticalTabs"><div className="space-y-5"><Tabs value={tab} onValueChange={setTab}><TabsList>{['overview', 'console', 'files', 'backups'].map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}</TabsList></Tabs><div className="grid grid-cols-[140px_1fr] gap-4"><div className="flex flex-col gap-0.5">{[['general', 'General'], ['network', 'Network'], ['security', 'Security']].map(([v, l]) => <button key={v} onClick={() => setVt(v)} className={cn('rounded-lg px-3 py-1.5 text-left text-[13px] transition-colors', vt === v ? 'bg-white/[0.08] text-fg' : 'text-mute hover:bg-hover')}>{l}</button>)}</div><div className="rounded-lg border border-line p-4 text-[13px] text-mute">Panel: <span className="text-fg capitalize">{vt}</span></div></div></div></Demo>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Demo label="Stepper · WizardNavigation"><div className="space-y-5"><Stepper steps={['Plan', 'Configure', 'Review', 'Pay']} current={step} onStep={setStep} /><div className="flex justify-between"><Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button><Button disabled={step === 3} onClick={() => setStep(step + 1)}>Continue</Button></div></div></Demo>
        <Demo label="Pagination · ChipTabs"><div className="space-y-4"><Pagination page={page} pages={5} onPage={setPage} /><ChipTabs value="all" onValueChange={() => {}} items={[['all', 'All', 24], ['run', 'Running', 20], ['stop', 'Stopped', 4]]} /></div></Demo>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Demo label="AppSidebar (rail + full)" pad={false} className="overflow-hidden"><div className="flex h-64"><div className="flex w-12 flex-col items-center gap-1 border-r border-line py-3">{[Home, Server, Receipt, LifeBuoy].map((I, i) => <span key={i} className={cn('grid size-8 place-items-center rounded-lg', i === 1 ? 'bg-white/[0.08] text-[var(--brand)]' : 'text-mute')}><I className="size-4" /></span>)}</div><div className="flex-1 space-y-1 p-3">{['Overview', 'Services', 'Invoices', 'Support'].map((l, i) => <div key={l} className={cn('flex h-8 items-center rounded-[10px] px-2.5 text-[13px]', i === 1 ? 'bg-white/[0.08] text-fg' : 'text-mute')}>{l}</div>)}</div></div></Demo>
        <Demo label="MobileBottomNavigation" pad={false} className="overflow-hidden"><div className="relative h-64 bg-black"><div className="p-4 text-[13px] text-dim">Content…</div><nav className="absolute inset-x-0 bottom-0 grid grid-cols-4 border-t border-line bg-[#0b0b0d] pb-3 pt-1.5">{[[Home, 'Home'], [Server, 'Services'], [Receipt, 'Billing'], [Settings, 'More']].map(([I, l], i) => <span key={l} className={cn('flex min-h-11 flex-col items-center justify-center gap-0.5 text-[10.5px]', i === 1 ? 'text-fg' : 'text-dim')}><I className={cn('size-5', i === 1 && 'text-[var(--brand)]')} />{l}</span>)}</nav></div></Demo>
        <Demo label="SearchResults (⌘K)"><div className="space-y-1">{[[Search, 'Search “prod”', ''], [Server, 'blipmade-prod', 'Service'], [Globe, 'prod.blipmade.app', 'Domain'], [Folder, 'prod.env', 'File']].map(([I, l, h], i) => <div key={l} className={cn('flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13px]', i === 1 ? 'bg-white/[0.07] text-fg' : 'text-mute')}><I className="size-4" />{l}<span className="ml-auto font-mono text-[10.5px] text-dim">{h}</span></div>)}</div></Demo>
      </div>
    </>
  )
}

/* ------------------------------ D. Overlays ------------------------------ */
function Overlays() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Demo label="Dialog · Drawer · BottomSheet">
        <Row>
          <Dialog><DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger><DialogContent title="Rename server" description="Names are visible only to you."><div className="space-y-4"><Input defaultValue="blipmade-prod" /><div className="flex justify-end gap-2"><DialogP.Close asChild><Button variant="outline">Cancel</Button></DialogP.Close><DialogP.Close asChild><Button>Save</Button></DialogP.Close></div></div></DialogContent></Dialog>
          <Dialog><DialogTrigger asChild><Button variant="outline">Open drawer</Button></DialogTrigger><DialogContent side title="Invoice INV-1048" description="Issued Nov 02"><div className="space-y-3 text-[13.5px] text-mute"><div className="flex justify-between"><span>VPS Pro</span><span>$12.00</span></div><div className="flex justify-between"><span>Managed DB</span><span>$29.00</span></div></div></DialogContent></Dialog>
          <Dialog><DialogTrigger asChild><Button variant="outline">Open bottom sheet</Button></DialogTrigger>
            <DialogP.Portal><DialogP.Overlay className="anim-overlay fixed inset-0 z-50 bg-black/60" /><DialogP.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border border-line-2 bg-card p-5 pb-8 outline-none"><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" /><DialogP.Title className="text-base font-semibold">Server actions</DialogP.Title><DialogP.Description className="sr-only">Actions</DialogP.Description><div className="mt-3 grid gap-1">{['Restart', 'Open console', 'Take snapshot', 'Delete'].map((a) => <DialogP.Close key={a} className={cn('flex h-12 items-center rounded-lg px-3 text-left text-[14px] hover:bg-hover', a === 'Delete' && 'text-bad')}>{a}</DialogP.Close>)}</div></DialogP.Content></DialogP.Portal></Dialog>
        </Row>
      </Demo>
      <Demo label="Popover · DropdownMenu · ContextMenu · Tooltip · HoverCard">
        <Row>
          <Popover><PopoverTrigger asChild><Button variant="outline">Popover</Button></PopoverTrigger><PopoverContent className="w-64"><div className="space-y-2"><div className="text-[13px] font-medium">Share read-only link</div><CopyValue value="https://blipmade.app/s/k3f9" /></div></PopoverContent></Popover>
          <Menu><MenuTrigger asChild><Button variant="outline">Menu <ChevronDown /></Button></MenuTrigger><MenuContent><MenuLabel>Server</MenuLabel><MenuItem><Eye />View</MenuItem><MenuItem><Copy />Duplicate</MenuItem><MenuSep /><MenuItem danger><Trash2 />Delete</MenuItem></MenuContent></Menu>
          <ContextMenu><ContextTrigger asChild><div className="grid h-9 place-items-center rounded-lg border border-dashed border-line-2 px-4 text-[12.5px] text-dim">Right-click me</div></ContextTrigger><ContextContent><ContextItem><Edit3 />Rename</ContextItem><ContextItem><Download />Download</ContextItem><ContextSep /><ContextItem danger><Trash2 />Delete</ContextItem></ContextContent></ContextMenu>
          <Tooltip content="Copied to clipboard"><Button variant="ghost" size="icon" aria-label="Tip"><Copy /></Button></Tooltip>
          <HoverCard trigger={<button className="text-[13px] underline decoration-white/30 underline-offset-4">@stefan</button>}><div className="flex gap-3"><Avatar name="Stefan" className="size-10" /><div><div className="text-[13.5px] font-semibold">Stefan</div><div className="text-xs text-dim">Owner · joined 2024</div></div></div></HoverCard>
        </Row>
      </Demo>
      <Demo label="NotificationDropdown" className="lg:col-span-2">
        <Popover><PopoverTrigger asChild><Button variant="outline"><Bell />Notifications<Badge tone="bad" dot={false}>2</Badge></Button></PopoverTrigger><PopoverContent className="w-80 p-0" align="start"><div className="flex items-center justify-between border-b border-line px-4 py-3 text-[13px] font-medium">Notifications<button className="text-xs text-dim hover:text-fg">Mark all read</button></div>{[['bad', 'Invoice overdue', '2 h ago'], ['ok', 'Backup completed', '03:00'], ['warn', 'High memory on pg-cluster', 'Yesterday']].map(([t, l, w]) => <div key={l} className="flex gap-3 border-b border-line/50 px-4 py-3 last:border-b-0"><i className={cn('mt-1.5 size-2 rounded-full', t === 'bad' ? 'bg-bad' : t === 'ok' ? 'bg-ok' : 'bg-warn')} /><div><div className="text-[13px]">{l}</div><div className="text-xs text-dim">{w}</div></div></div>)}</PopoverContent></Popover>
      </Demo>
    </div>
  )
}

/* ------------------------------ E. Data presentation ------------------------------ */
function DataPres() {
  return (
    <>
      <div className="grid gap-5 lg:grid-cols-3">
        <Demo label="StatusBadge · StatusIndicator"><div className="space-y-4"><Row>{['running', 'stopped', 'restarting', 'paid', 'unpaid', 'overdue', 'open', 'closed'].map((s) => <StatusBadge key={s} status={s} />)}</Row><Row>{[['bg-ok', 'Online'], ['bg-warn', 'Degraded'], ['bg-bad', 'Offline'], ['bg-dim', 'Unknown']].map(([c, l]) => <span key={l} className="flex items-center gap-2 text-[13px] text-mute"><i className={cn('size-2 rounded-full', c)} />{l}</span>)}</Row></div></Demo>
        <Demo label="Avatar · AvatarGroup · Progress"><div className="space-y-4"><div className="flex -space-x-2">{['S', 'M', 'A', 'K'].map((n) => <Avatar key={n} name={n} className="ring-2 ring-card" />)}<span className="grid size-8 place-items-center rounded-full border border-line-2 bg-card font-mono text-[10.5px]">+3</span></div><div className="space-y-3"><Progress value={34} /><Progress value={91} hot /></div></div></Demo>
        <Demo label="ProgressRing · UsageMeter"><div className="flex items-center gap-4"><DotGauge value={64} label="RAM" size={92} /><div className="flex-1 space-y-3 text-[12.5px]">{[['Bandwidth', 72, '720 GB of 1 TB'], ['Storage', 41, '33 of 80 GB']].map(([l, v, t]) => <div key={l}><div className="mb-1 flex justify-between"><span>{l}</span><span className="text-dim">{t}</span></div><Progress value={v} /></div>)}</div></div></Demo>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Demo label="InlineAlert · Toast"><div className="space-y-3"><InlineAlert tone="info" title="Maintenance Nov 12, 02:00 UTC">fra-2 · about 10 minutes.</InlineAlert><InlineAlert tone="ok" title="Backup completed" /><InlineAlert tone="warn" title="Disk 91% full" action={<Button size="sm" variant="outline">Resize</Button>} /><InlineAlert tone="bad" title="Payment failed">Card ending 4242 was declined.</InlineAlert><Row><Button variant="outline" size="sm" onClick={() => toast.success('Server restarted')}>Success toast</Button><Button variant="outline" size="sm" onClick={() => toast.error('Could not reach node')}>Error toast</Button></Row></div></Demo>
        <Demo label="Loading · Skeleton · Empty · Error"><div className="space-y-5"><div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-4/5" /></div><EmptyState icon={<Inbox />} title="No snapshots yet" actions={<Button size="sm">Take snapshot</Button>}>Snapshots let you roll the server back to a known state.</EmptyState></div></Demo>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Demo label="CodeBlock · CopyableValue"><div className="space-y-3"><CodeBlock lang="bash" code={'curl -fsSL https://blipmade.cloud/install.sh | sh\nblip login --key kl_live_••••'} /><CopyValue label="Key" value="blip_live_9f3a21c7d84e" mask /></div></Demo>
        <Demo label="Charts · ChartTooltip"><div className="space-y-3"><DotBars values={Array.from({ length: 28 }, (_, i) => 40 + Math.sin(i / 3) * 24 + ((i * 29) % 13))} rows={9} /><p className="text-xs text-dim">Dot columns are the standard chart. Hover shows a mono tooltip; the hovered column turns brand red.</p></div></Demo>
      </div>
    </>
  )
}

/* ------------------------------ F. Layout ------------------------------ */
function LayoutC() {
  return (
    <>
      <Demo label="AppShell · AdminShell anatomy" pad={false} className="overflow-hidden">
        <div className="grid h-72 grid-cols-[180px_1fr] text-[12px]">
          <div className="border-r border-line bg-[#0b0b0d] p-3 text-dim"><div className="mb-3 font-mono text-[10.5px] uppercase tracking-[.08em]">Sidebar · 256/56</div><div className="space-y-1.5">{[1, 2, 3, 4].map((i) => <div key={i} className="h-7 rounded-lg bg-white/[0.04]" />)}</div></div>
          <div className="flex flex-col"><div className="flex h-10 items-center border-b border-line px-4 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Topbar · 56</div><div className="grid flex-1 grid-cols-[1fr_200px]"><div className="space-y-3 p-4"><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Content · max 1152 · gutter 24–32</div><div className="grid grid-cols-3 gap-3">{[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-lg border border-line bg-card" />)}</div><div className="h-20 rounded-lg border border-line bg-card" /></div><div className="border-l border-line p-4 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Inspector · 320</div></div></div>
        </div>
      </Demo>
      <div className="grid gap-5 lg:grid-cols-2">
        <Demo label="StickyActionFooter · EditorPageLayout"><div className="relative h-44 overflow-hidden rounded-lg border border-line"><div className="space-y-2 p-4"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-9" /><Skeleton className="h-9" /></div><div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-line bg-[#101012] px-4 py-3"><span className="flex items-center gap-2 text-[12.5px] text-mute"><i className="size-1.5 rounded-full bg-warn" />2 unsaved changes</span><span className="flex gap-2"><Button variant="ghost" size="sm">Discard</Button><Button size="sm">Save changes</Button></span></div></div></Demo>
        <Demo label="SplitView · ResizablePanel (drag the handle)" sim><ResizablePanel className="h-28" initial={40} min={20} max={70} first={<div className="p-3 text-[12px] text-mute">List</div>} second={<div className="p-3 text-[12px] text-dim">Detail</div>} /></Demo>
      </div>
    </>
  )
}
function Resizable() {
  const [w, setW] = useState(40)
  return (
    <div className="space-y-3"><div className="flex h-28 overflow-hidden rounded-lg border border-line text-[12px]"><div style={{ width: w + '%' }} className="bg-white/[0.04] p-3 text-mute">List · {w}%</div><div className="flex-1 border-l border-line p-3 text-dim">Detail</div></div><Slider min={20} max={70} value={[w]} onValueChange={([v]) => setW(v)} /></div>
  )
}

export default function Components() {
  return <Doc title="Components" lead="Reusable primitives built on Radix UI and styled with the Blipmade tokens. Every control shows its states; interactive ones respond so you can feel the behaviour. All demos are simulated." sections={[
    { id: 'actions', title: 'A · Actions', node: <Actions /> },
    { id: 'inputs', title: 'B · Inputs & forms', node: <Inputs /> },
    { id: 'advanced', title: 'B2 · Advanced inputs', node: <Advanced /> },
    { id: 'nav', title: 'C · Navigation', node: <Navigation /> },
    { id: 'overlays', title: 'D · Overlays', node: <Overlays /> },
    { id: 'data', title: 'E · Data presentation', node: <DataPres /> },
    { id: 'layout', title: 'F · Layout', node: <LayoutC /> },
  ]} />
}
