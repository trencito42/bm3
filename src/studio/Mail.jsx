/* Multi-domain email: a domain rail on the left (a switcher on phones), then the tabs for the chosen domain.
   Webmail is the existing component, with an account switcher on top for people who read several mailboxes. */
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AtSign, Check, Globe, Inbox, Mail, Plus, Shield, Trash2 } from 'lucide-react'
import { Badge, Button, Dialog, DialogContent, Segmented, Switch, Tabs, TabsList, TabsTrigger } from '../components/ui.jsx'
import { Checkbox, CopyValue, FormField, InlineAlert, Select, Stepper, TagInput, inputCls } from '../components/ui2.jsx'
import { DNSRecordTable, Webmail } from '../components/product.jsx'
import { AsyncOperation, BulkTable } from './patterns.jsx'
import { Decode, DotRail, Kv, Panel, ScreenHead, StateHero, Tile, eyebrow, useSim } from './kit.jsx'
import { cn, money } from '../lib/utils'

const DOMAINS = [
  { id: 'example-studio.com', boxes: 6, quota: '41 / 100 GB', dns: 'ok', score: 98 },
  { id: 'northwind.dev', boxes: 12, quota: '88 / 100 GB', dns: 'warn', score: 81 },
  { id: 'mara.blog', boxes: 1, quota: '0.4 / 10 GB', dns: 'bad', score: 40 },
]
const BOXES = [['stefan', 18.2, 50, 'active'], ['support', 41.9, 50, 'active'], ['billing', 3.1, 50, 'active'], ['maria', 49.1, 50, 'active'], ['noreply', 0.1, 5, 'active'], ['old-intern', 0, 10, 'suspended']].map(([n, u, q, s]) => ({ id: n, name: n, used: u, quota: q, status: s }))
const ALIASES = [['info', 'support'], ['sales', 'stefan, maria'], ['abuse', 'stefan'], ['jobs', 'maria']]

function DnsTab({ d }) {
  const [st, run] = useSim(1500)
  const rows = [['MX', '@', 'mx1.blipmade.mail', 'ok'], ['TXT (SPF)', '@', 'v=spf1 include:spf.blipmade.mail ~all', d.dns === 'bad' ? 'bad' : 'ok'], ['TXT (DKIM)', 'blip._domainkey', 'v=DKIM1; k=rsa; p=MIIB…', d.dns === 'bad' ? 'bad' : 'ok'], ['TXT (DMARC)', '_dmarc', 'v=DMARC1; p=none', d.dns === 'ok' ? 'ok' : 'warn']]
  return (
    <div className="space-y-5">
      {d.dns !== 'ok' && <InlineAlert tone={d.dns === 'bad' ? 'bad' : 'warn'} title={d.dns === 'bad' ? 'Mail is not being delivered yet' : 'Add a DMARC record to protect your name'} action={<Button size="sm" variant="outline" loading={st === 'running'} onClick={() => run(false)}>Check again</Button>}>{d.dns === 'bad' ? 'SPF and DKIM are missing at your DNS provider.' : 'Without it, anyone can send mail that looks like yours.'}</InlineAlert>}
      {st === 'ok' && <InlineAlert tone="ok" title="Checked just now">Records can take up to an hour to show everywhere.</InlineAlert>}
      <Panel title="Records to add at your DNS provider" pad={false}><div className="divide-y divide-line">{rows.map(([t, h, v, s]) => <div key={t} className="grid gap-2 p-4 sm:grid-cols-[110px_1fr_auto] sm:items-center"><span className="font-mono text-[12px]">{t}</span><div className="min-w-0 space-y-1.5"><CopyValue label="Name" value={h} /><CopyValue label="Value" value={v} /></div><Badge tone={s}>{s === 'ok' ? 'Verified' : s === 'warn' ? 'Recommended' : 'Missing'}</Badge></div>)}</div></Panel>
    </div>
  )
}
function Boxes({ d }) {
  const [add, setAdd] = useState(false), [pw, setPw] = useState(null), [name, setName] = useState('')
  return (
    <>
      <BulkTable title="mailboxes" rows={BOXES} searchKeys={['name']} filters={{ items: [['all', 'All'], ['active', 'Active'], ['suspended', 'Suspended']], match: (r, f) => r.status === f }} bulk={[['Reset password'], ['Suspend'], ['Delete', null, true]]} columns={[{ key: 'name', label: 'Mailbox', sortable: true, cell: (r) => <span className="font-mono text-[12.5px]">{r.name}@{d.id}</span> }, { key: 'used', label: 'Storage', sortable: true, cell: (r) => <div className="w-32"><div className="mb-1 flex justify-between font-mono text-[11px] text-dim"><span>{r.used} GB</span><span>{r.quota} GB</span></div><div className="h-1 overflow-hidden rounded-full bg-white/[0.08]"><i className={cn('block h-full rounded-full', r.used / r.quota > 0.9 ? 'bg-warn' : 'bg-fg/60')} style={{ width: `${(r.used / r.quota) * 100}%` }} /></div></div> }, { key: 'status', label: 'Status', cell: (r) => <Badge tone={r.status === 'active' ? 'ok' : 'neutral'}>{r.status}</Badge> }]} />
      <div className="mt-4 flex justify-end"><Button onClick={() => setAdd(true)}><Plus />New mailbox</Button></div>
      <Dialog open={add} onOpenChange={(o) => { setAdd(o); if (!o) { setPw(null); setName('') } }}><DialogContent title={pw ? 'Mailbox created' : 'New mailbox'} description={pw ? 'Copy the password now. It is not shown again.' : `Address: name@${d.id}`}>{pw ? <div className="space-y-4"><CopyValue label="Address" value={`${name}@${d.id}`} /><CopyValue label="Password" mask value={pw} /><InlineAlert tone="info" title="They can change it after the first sign-in" /><div className="flex justify-end"><Button onClick={() => setAdd(false)}>Done</Button></div></div> : <div className="space-y-4"><FormField label="Name"><div className="flex items-center gap-2"><input value={name} onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))} className={cn(inputCls(), 'font-mono')} autoFocus /><span className="font-mono text-[12.5px] text-dim">@{d.id}</span></div></FormField><FormField label="Storage"><Select value="50" onValueChange={() => {}} options={[['10', '10 GB'], ['50', '50 GB'], ['100', '100 GB']]} /></FormField><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setAdd(false)}>Cancel</Button><Button disabled={!name} onClick={() => setPw('Wk7-hQz3-pN9x-2Lm4')}>Create</Button></div></div>}</DialogContent></Dialog>
    </>
  )
}
function Aliases({ d }) {
  const [rows, setRows] = useState(ALIASES), [a, setA] = useState(''), [t, setT] = useState([])
  return (
    <div className="grid gap-5 lg:grid-cols-3"><Panel title="Aliases" className="lg:col-span-2" desc="Extra addresses that deliver to a mailbox"><ul className="divide-y divide-line text-[13.5px]">{rows.map(([x, to]) => <li key={x} className="flex items-center gap-3 py-3"><AtSign className="size-4 text-dim" /><span className="font-mono">{x}@{d.id}</span><span className="text-dim">→</span><span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-mute">{to}</span><button aria-label={`Delete ${x}`} onClick={() => setRows((r) => r.filter((y) => y[0] !== x))} className="text-dim hover:text-bad"><Trash2 className="size-4" /></button></li>)}</ul></Panel>
      <Panel title="New alias"><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (a && t.length) { setRows((r) => [...r, [a, t.join(', ')]]); setA(''); setT([]); toast.success('Alias created (simulated)') } }}><FormField label="Address"><div className="flex items-center gap-2"><input value={a} onChange={(e) => setA(e.target.value.toLowerCase())} className={cn(inputCls(), 'font-mono')} /><span className="font-mono text-[12px] text-dim">@{d.id}</span></div></FormField><FormField label="Delivers to"><TagInput value={t} onChange={setT} placeholder="Mailbox names" /></FormField><Button type="submit" disabled={!a || !t.length} className="w-full">Create alias</Button></form></Panel></div>
  )
}
function Connect({ d }) {
  const [c, setC] = useState('thunderbird')
  return (
    <div className="grid gap-5 lg:grid-cols-2"><Panel title="Incoming (IMAP)"><div className="space-y-2"><CopyValue label="Server" value="imap.blipmade.mail" /><CopyValue label="Port" value="993 · SSL/TLS" /><CopyValue label="User" value={`stefan@${d.id}`} /></div></Panel><Panel title="Outgoing (SMTP)"><div className="space-y-2"><CopyValue label="Server" value="smtp.blipmade.mail" /><CopyValue label="Port" value="465 · SSL/TLS" /><CopyValue label="User" value={`stefan@${d.id}`} /></div></Panel>
      <Panel title="Set up a client" className="lg:col-span-2"><div className="space-y-4"><Segmented value={c} onValueChange={(v) => v && setC(v)} options={[['thunderbird', 'Thunderbird'], ['apple', 'Apple Mail'], ['outlook', 'Outlook'], ['phone', 'Phone']]} /><ol className="list-decimal space-y-2 pl-5 text-[13.5px] text-mute"><li>Add a new account and enter <b className="font-mono text-fg">stefan@{d.id}</b>.</li><li>Choose manual setup and paste the two servers above.</li><li>Use your mailbox password. App passwords are available if you turn on two-factor.</li></ol></div></Panel></div>
  )
}
function Deliver({ d }) {
  const [allow, setAllow] = useState(['partner.com']), [block, setBlock] = useState(['spam-sender.biz'])
  return (
    <div className="grid gap-5 lg:grid-cols-3"><Panel title="Reputation"><div className="flex items-end gap-3"><span className="font-mono text-[34px] leading-none tabular-nums">{d.score}</span><span className="pb-1 text-[12px] text-dim">of 100</span></div><div className="mt-4"><DotRail value={d.score / 100} state={d.score < 60 ? 'fail' : 'ok'} n={24} /></div><p className="mt-3 text-[12.5px] text-dim">{d.score >= 90 ? 'Mail from this domain is trusted by the big providers.' : d.score >= 60 ? 'Fix the open DNS items to reach 90.' : 'Mail is likely landing in spam or being rejected.'}</p></Panel>
      <Panel title="Last 24 hours" className="lg:col-span-2"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Tile label="Sent" value="412" /><Tile label="Delivered" value="408" tone="ok" /><Tile label="Bounced" value="3" tone="warn" /><Tile label="Spam folder" value="1" /></div><ul className="mt-4 divide-y divide-line text-[13px]">{[['bounce', 'old.client@mail.example', 'mailbox full', '10:12'], ['bounce', 'x@invalid.tld', 'domain not found', '09:40'], ['deferred', 'person@big-provider.com', 'rate limited, retrying', '09:31']].map(([t, a, w, h]) => <li key={a} className="flex items-center gap-3 py-2.5"><Badge tone={t === 'bounce' ? 'warn' : 'neutral'} dot={false}>{t}</Badge><span className="min-w-0 flex-1 truncate font-mono text-[12px]">{a}</span><span className="hidden text-dim sm:inline">{w}</span><span className="font-mono text-[11px] text-dim">{h}</span></li>)}</ul></Panel>
      <Panel title="Always accept"><TagInput value={allow} onChange={setAllow} placeholder="domain or address" /></Panel><Panel title="Always reject"><TagInput value={block} onChange={setBlock} placeholder="domain or address" /></Panel></div>
  )
}
function Plan({ d }) {
  const [change, setChange] = useState(false), [pick, setPick] = useState(1)
  const P = [['Starter', 5, 2.5], ['Business', 25, 9], ['Max', 100, 29]]
  return (
    <div className="grid gap-5 lg:grid-cols-2"><Panel title="Subscription" actions={<Button size="sm" onClick={() => setChange(true)}>Change plan</Button>}><Kv rows={[['Plan', 'Business · $9.00 / mo'], ['Domain', d.id], ['Mailboxes', `${d.boxes} of 25`], ['Storage', d.quota], ['Renews', 'Dec 02']]} /></Panel>
      <Panel title="Usage"><div className="space-y-5">{[['Mailboxes', d.boxes, 25], ['Storage (GB)', parseFloat(d.quota), 100]].map(([l, v, m]) => <div key={l}><div className="mb-1.5 flex justify-between text-[13px]"><span>{l}</span><span className="font-mono text-dim">{v} / {m}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]"><i className={cn('block h-full rounded-full', v / m > 0.85 ? 'bg-warn' : 'bg-fg/60')} style={{ width: `${Math.min(100, (v / m) * 100)}%` }} /></div></div>)}{d.boxes / 25 > 0.4 && <InlineAlert tone="info" title="Plenty of room for now" />}</div></Panel>
      <Dialog open={change} onOpenChange={setChange}><DialogContent title="Change plan" description="Billed from today, prorated for the days left."><div className="space-y-2">{P.map(([n, b, p], i) => <button key={n} onClick={() => setPick(i)} aria-pressed={pick === i} className={cn('flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors', pick === i ? 'border-fg bg-white/[0.05]' : 'border-line-2 hover:border-white/30')}><span><b className="block text-[14px] font-medium">{n}</b><span className="text-[12.5px] text-dim">{b} mailboxes</span></span><span className="font-mono">{money(p)}</span></button>)}</div>{pick === 0 && d.boxes > 5 && <div className="mt-4"><InlineAlert tone="bad" title={`You use ${d.boxes} mailboxes`}>Starter allows 5. Remove some first.</InlineAlert></div>}<div className="mt-5 flex justify-between text-[13px]"><span className="text-dim">Change today</span><span className="font-mono">{pick === 1 ? 'no change' : pick === 2 ? '+$20.00 prorated' : '−$6.50 credit'}</span></div><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setChange(false)}>Cancel</Button><Button disabled={pick === 0 && d.boxes > 5} onClick={() => { setChange(false); toast.success('Plan changed (simulated)') }}>Confirm</Button></div></DialogContent></Dialog></div>
  )
}
function Web() {
  const [acct, setAcct] = useState('stefan@example-studio.com')
  return <div className="space-y-3"><div className="flex flex-wrap items-center gap-3"><span className={eyebrow}>Reading as</span><div className="w-72"><Select value={acct} onValueChange={setAcct} options={['stefan@example-studio.com', 'support@example-studio.com', 'stefan@northwind.dev']} /></div><Badge tone="neutral" dot={false}>3 unread across accounts</Badge></div><div key={acct} className="step-in"><Webmail /></div></div>
}
function AddDomain({ open, onOpenChange, onAdded }) {
  const [s, setS] = useState(0), [v, setV] = useState(''), [chk, run] = useSim(1400)
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setS(0); setV('') } }}><DialogContent className="max-w-lg" title="Add a domain" description="Three steps. Mail keeps working where it is until you switch the records."><Stepper steps={['Domain', 'DNS', 'Verify']} current={s} />
      <div className="mt-6 min-h-[180px]">{s === 0 && <FormField label="Domain you own"><input value={v} onChange={(e) => setV(e.target.value.toLowerCase())} placeholder="example.com" className={cn(inputCls(), 'font-mono')} autoFocus /></FormField>}{s === 1 && <div className="space-y-2"><CopyValue label="MX" value="mx1.blipmade.mail" /><CopyValue label="SPF" value="v=spf1 include:spf.blipmade.mail ~all" /><p className="pt-1 text-[12.5px] text-dim">Add these at your DNS provider, then press Next.</p></div>}{s === 2 && (chk === 'ok' ? <StateHero state="happy" role="chat" word="VERIFIED." sub={`${v} is ready for mailboxes.`} small /> : chk === 'failed' ? <InlineAlert tone="warn" title="Records not visible yet">DNS can take a while. You can add the domain now and verify later.</InlineAlert> : <div className="py-6 text-center"><Button loading={chk === 'running'} onClick={() => run(false)}>Check the records</Button></div>)}</div>
      <div className="mt-4 flex justify-between"><Button variant="ghost" disabled={s === 0} onClick={() => setS(s - 1)}>Back</Button>{s < 2 ? <Button disabled={!/\.\w{2,}$/.test(v)} onClick={() => setS(s + 1)}>Next</Button> : <Button disabled={chk === 'running'} onClick={() => { onAdded(v); onOpenChange(false); setS(0); setV('') }}>{chk === 'ok' ? 'Finish' : 'Add and verify later'}</Button>}</div></DialogContent></Dialog>
  )
}

export default function MailScreen() {
  const [doms, setDoms] = useState(DOMAINS), [sel, setSel] = useState(DOMAINS[0].id), [tab, setTab] = useState('overview'), [add, setAdd] = useState(false)
  const d = doms.find((x) => x.id === sel) || doms[0]
  const T = [['overview', 'Overview'], ['mailboxes', 'Mailboxes'], ['aliases', 'Aliases'], ['dns', 'DNS'], ['connect', 'Connect'], ['deliverability', 'Deliverability'], ['plan', 'Plan'], ['webmail', 'Webmail']]
  const body = { overview: <div className="grid gap-5 lg:grid-cols-3"><Panel title="At a glance" className="lg:col-span-2"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Tile label="Mailboxes" value={d.boxes} /><Tile label="Storage" value={d.quota.split(' / ')[0] + ' GB'} /><Tile label="DNS" value={d.dns === 'ok' ? 'Healthy' : d.dns === 'warn' ? 'Needs care' : 'Broken'} tone={d.dns} /><Tile label="Reputation" value={d.score} /></div></Panel><Panel title="Next step">{d.dns === 'ok' ? <StateHero state="happy" role="chat" word="ALL GOOD." sub="Nothing needs your attention." small size={56} /> : <div className="space-y-3 text-[13.5px] text-mute"><p>{d.dns === 'bad' ? 'Mail cannot reach this domain yet.' : 'One recommended record is missing.'}</p><Button onClick={() => setTab('dns')}>Open DNS records</Button></div>}</Panel></div>, mailboxes: <Boxes d={d} />, aliases: <Aliases d={d} />, dns: <DnsTab d={d} />, connect: <Connect d={d} />, deliverability: <Deliver d={d} />, plan: <Plan d={d} />, webmail: <Web /> }
  return (
    <div className="space-y-5">
      <ScreenHead title="Email" sub="Domains, mailboxes and webmail in one place." actions={<Button onClick={() => setAdd(true)}><Plus />Add domain</Button>} />
      <div className="grid items-start gap-5 lg:grid-cols-[230px_1fr]">
        <nav aria-label="Domains" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">{doms.map((x) => <button key={x.id} onClick={() => setSel(x.id)} aria-current={sel === x.id} className={cn('flex shrink-0 items-center gap-3 rounded-xl border px-3.5 py-3 text-left outline-none transition-colors focus-visible:border-white/50', sel === x.id ? 'border-fg/60 bg-white/[0.05]' : 'border-line hover:bg-hover')}><i className={cn('size-2 shrink-0 rounded-full', x.dns === 'ok' ? 'bg-ok' : x.dns === 'warn' ? 'bg-warn' : 'bg-bad')} /><span className="min-w-0"><span className="block truncate text-[13.5px] font-medium">{x.id}</span><span className="font-mono text-[11px] text-dim">{x.boxes} mailboxes</span></span></button>)}</nav>
        <div className="min-w-0"><Tabs value={tab} onValueChange={setTab}><TabsList>{T.map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}</TabsList><div key={tab + sel} className="step-in pt-5">{body[tab]}</div></Tabs></div>
      </div>
      <AddDomain open={add} onOpenChange={setAdd} onAdded={(v) => { setDoms((x) => [...x, { id: v, boxes: 0, quota: '0 / 10 GB', dns: 'warn', score: 70 }]); setSel(v) }} />
    </div>
  )
}
