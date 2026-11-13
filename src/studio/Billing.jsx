/* Billing for a customer: subscription lifecycle, invoices, payment failures, plan changes, cancellation, credit. */
import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, CreditCard, Download, Plus, Printer, RotateCcw } from 'lucide-react'
import { Badge, Button, Dialog, DialogContent, RadioCard, RadioGroup, Segmented, Tabs, TabsList, TabsTrigger } from '../components/ui.jsx'
import { Checkbox, FormField, InlineAlert, Select, inputCls } from '../components/ui2.jsx'
import { PaymentMethodCard } from '../components/product.jsx'
import { Orb } from '../builder/FxBits.jsx'
import { BulkTable, JobTimeline } from './patterns.jsx'
import { Kv, Panel, ScreenHead, StateHero, Tile, eyebrow, useSim } from './kit.jsx'
import { cn, money } from '../lib/utils'
import { useStore } from '../lib/store.jsx'

const SUBS = [
  { id: 's1', name: 'web-01 · VPS Pro', price: 12, state: 'active', next: 'Dec 02', since: 'Mar 2026', period: 'Monthly' },
  { id: 's2', name: 'mc-survival · Game 4 GB', price: 10.74, state: 'past_due', next: 'retry Nov 12', since: 'Jun 2026', period: 'Monthly' },
  { id: 's3', name: 'example-studio.com · Mail Business', price: 9, state: 'canceling', next: 'ends Dec 02', since: 'Jan 2026', period: 'Yearly' },
  { id: 's4', name: 'lab · VPS Nano', price: 4, state: 'cancelled', next: 'deleted Nov 20', since: 'Sep 2026', period: 'Monthly' },
]
const TONE = { active: 'ok', past_due: 'bad', canceling: 'warn', cancelled: 'neutral', trial: 'info' }
const INV = [['INV-1049', 'Nov 09', 38, 'failed'], ['INV-1048', 'Nov 09', 51.17, 'paid'], ['INV-1031', 'Oct 09', 51.17, 'paid'], ['INV-1012', 'Sep 09', 42, 'paid'], ['INV-0990', 'Aug 09', 12, 'refunded']].map(([id, d, t, s]) => ({ id, date: d, total: t, status: s }))

function Cancel({ s, open, onOpenChange, onDone }) {
  const [step, setStep] = useState(0), [why, setWhy] = useState(''), [when, setWhen] = useState('end')
  const reset = () => { setStep(0); setWhy(''); setWhen('end') }
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset() }}><DialogContent title={step === 2 ? 'Cancellation scheduled' : `Cancel ${s?.name}`} description={step === 0 ? 'Tell us why, it helps. One question.' : step === 1 ? 'Choose when it stops.' : undefined}>
      {step === 0 && <div className="space-y-4"><RadioGroup value={why} onValueChange={setWhy} className="grid gap-2">{['Too expensive', 'I do not need it any more', 'Moving to another provider', 'Something did not work'].map((w) => <RadioCard key={w} value={w} className="p-3.5 text-[13.5px]">{w}</RadioCard>)}</RadioGroup>{why === 'Too expensive' && <InlineAlert tone="info" title="A smaller size may fit" action={<Button size="sm" variant="outline">See plans</Button>}>Downsizing keeps your data and cuts the price.</InlineAlert>}<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>Keep it</Button><Button disabled={!why} onClick={() => setStep(1)}>Continue</Button></div></div>}
      {step === 1 && <div className="space-y-4"><RadioGroup value={when} onValueChange={setWhen} className="grid gap-2"><RadioCard value="end" className="p-3.5"><b className="block text-[13.5px] font-medium">At the end of the period</b><span className="text-[12.5px] text-dim">Stays on until {s?.next.replace('retry ', '')}. No refund needed.</span></RadioCard><RadioCard value="now" className="p-3.5"><b className="block text-[13.5px] font-medium">Right now</b><span className="text-[12.5px] text-dim">Stops today. Unused days become account credit.</span></RadioCard></RadioGroup><InlineAlert tone="warn" title="Data is deleted 7 days after it stops">Download a backup first if you may want it.</InlineAlert><div className="flex justify-between"><Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft />Back</Button><Button className="!bg-bad !text-black" onClick={() => setStep(2)}>Cancel subscription</Button></div></div>}
      {step === 2 && <div className="space-y-4"><StateHero state="waiting" role="chat" word="SEE YOU." sub={when === 'end' ? `It keeps running until ${s?.next.replace('retry ', '')}. Changed your mind? Resume any time before then.` : 'It stopped today. Unused days were added to your credit.'} small size={56} /><div className="flex justify-end"><Button onClick={() => { onDone(when); onOpenChange(false); reset() }}>Done</Button></div></div>}
    </DialogContent></Dialog>
  )
}

function Subscriptions() {
  const [rows, setRows] = useState(SUBS), [sel, setSel] = useState(null), [cancel, setCancel] = useState(false), [st, run] = useSim(1500)
  const s = rows.find((r) => r.id === sel)
  if (s) return (
    <div className="space-y-5">
      <button onClick={() => setSel(null)} className="flex items-center gap-1.5 text-[13px] text-dim hover:text-fg"><ArrowLeft className="size-3.5" />Subscriptions</button>
      <ScreenHead title={s.name} badge={<Badge tone={TONE[s.state]}>{s.state.replace('_', ' ')}</Badge>} sub={`${money(s.price)} / ${s.period === 'Yearly' ? 'mo, billed yearly' : 'mo'} · since ${s.since}`} />
      {s.state === 'past_due' && <InlineAlert tone="bad" title="Your bank declined the last payment" action={<Button size="sm" loading={st === 'running'} onClick={() => run(false, () => setRows((r) => r.map((x) => (x.id === s.id ? { ...x, state: 'active', next: 'Dec 12' } : x))))}>Retry now</Button>}>Services stay on until Nov 16. We try again on Nov 12 and 14.</InlineAlert>}
      {s.state === 'canceling' && <InlineAlert tone="warn" title={`Ends ${s.next.replace('ends ', '')}`} action={<Button size="sm" variant="outline" onClick={() => setRows((r) => r.map((x) => (x.id === s.id ? { ...x, state: 'active', next: 'Dec 02' } : x)))}><RotateCcw />Resume</Button>}>Everything keeps working until then.</InlineAlert>}
      <div className="grid gap-5 lg:grid-cols-2"><Panel title="Lifecycle"><JobTimeline compact steps={[{ name: 'Subscribed', state: 'done', ms: undefined, hint: s.since }, { name: 'Last payment', state: s.state === 'past_due' ? 'failed' : 'done', hint: s.state === 'past_due' ? 'declined' : 'Nov 09' }, { name: s.state === 'cancelled' ? 'Stopped' : s.state === 'canceling' ? 'Ends' : 'Next charge', state: s.state === 'active' || s.state === 'past_due' ? 'queued' : s.state === 'canceling' ? 'running' : 'done', hint: s.next }, { name: 'Data deleted', state: 'queued', hint: '7 days after it stops' }]} /></Panel><Panel title="Details"><Kv rows={[['Billing', s.period], ['Payment method', 'Visa ending 6411'], ['Next', s.next], ['Auto-renew', s.state === 'canceling' || s.state === 'cancelled' ? 'Off' : 'On']]} /><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="outline">Change plan</Button><Button size="sm" variant="outline">Switch to {s.period === 'Yearly' ? 'monthly' : 'yearly'}</Button>{(s.state === 'active' || s.state === 'past_due') && <Button size="sm" variant="ghost" className="text-bad" onClick={() => setCancel(true)}>Cancel</Button>}</div></Panel></div>
      <Cancel s={s} open={cancel} onOpenChange={setCancel} onDone={(w) => setRows((r) => r.map((x) => (x.id === s.id ? { ...x, state: w === 'now' ? 'cancelled' : 'canceling', next: w === 'now' ? 'deleted in 7 days' : 'ends ' + x.next } : x)))} />
    </div>
  )
  return (
    <Panel title="Subscriptions" pad={false}><ul className="divide-y divide-line">{rows.map((r) => <li key={r.id}><button onClick={() => setSel(r.id)} className="flex w-full items-center gap-4 px-5 py-4 text-left outline-none transition-colors hover:bg-hover focus-visible:bg-hover"><span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">{r.name}</span><span className="font-mono text-[11.5px] text-dim">{r.period} · {r.next}</span></span><span className="font-mono text-[13px]">{money(r.price)}</span><Badge tone={TONE[r.state]}>{r.state.replace('_', ' ')}</Badge></button></li>)}</ul></Panel>
  )
}

function InvoiceDoc({ i, onBack }) {
  return (
    <div className="space-y-4"><div className="flex items-center justify-between"><button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-dim hover:text-fg"><ArrowLeft className="size-3.5" />Invoices</button><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => window.print()}><Printer />Print</Button><Button size="sm" variant="outline" onClick={() => toast('PDF downloaded (simulated)')}><Download />PDF</Button></div></div>
      <div className="mx-auto max-w-2xl rounded-xl border border-line bg-card p-6 sm:p-9"><div className="flex items-start justify-between"><div><div className={eyebrow}>Invoice</div><div className="mt-1 font-mono text-[18px]">{i.id}</div></div><Badge tone={i.status === 'paid' ? 'ok' : i.status === 'failed' ? 'bad' : 'neutral'}>{i.status}</Badge></div>
        <div className="mt-6 grid gap-6 text-[13px] sm:grid-cols-2"><div><div className={eyebrow}>Billed to</div><p className="mt-1.5 leading-6 text-mute">Stefan Example<br />Example Studio SRL<br />Str. Exemplu 1, Cluj-Napoca</p></div><div><div className={eyebrow}>Date</div><p className="mt-1.5 text-mute">{i.date}, 2026</p></div></div>
        <table className="mt-7 w-full text-[13.5px]"><thead><tr className="border-b border-line font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><th className="py-2 text-left font-normal">Item</th><th className="py-2 text-right font-normal">Amount</th></tr></thead><tbody>{[['VPS Pro · Frankfurt · Nov 09 to Dec 09', 12], ['Managed PostgreSQL 16', 29], ['IPv4 address', 2]].map(([a, p]) => <tr key={a} className="border-b border-line/50"><td className="py-3 text-mute">{a}</td><td className="py-3 text-right font-mono">{money(p)}</td></tr>)}</tbody></table>
        <div className="ml-auto mt-4 w-full max-w-[240px] space-y-1.5 text-[13px]"><div className="flex justify-between text-mute"><span>Subtotal</span><span className="font-mono">$43.00</span></div><div className="flex justify-between text-mute"><span>VAT 19%</span><span className="font-mono">$8.17</span></div><div className="flex justify-between border-t border-line pt-2 text-[14px] font-medium"><span>Total</span><span className="font-mono">${i.total.toFixed(2)}</span></div></div></div></div>
  )
}
function Invoices() {
  const [open, setOpen] = useState(null)
  if (open) return <InvoiceDoc i={open} onBack={() => setOpen(null)} />
  return <BulkTable title="invoices" rows={INV} searchKeys={['id']} filters={{ items: [['all', 'All'], ['paid', 'Paid'], ['failed', 'Failed']], match: (r, f) => r.status === f }} bulk={[['Download PDFs']]} columns={[{ key: 'id', label: 'Invoice', sortable: true, cell: (r) => <button onClick={() => setOpen(r)} className="font-mono text-[12.5px] hover:underline">{r.id}</button> }, { key: 'date', label: 'Date' }, { key: 'total', label: 'Total', align: 'right', sortable: true, cell: (r) => money(r.total) }, { key: 'status', label: 'Status', cell: (r) => <Badge tone={r.status === 'paid' ? 'ok' : r.status === 'failed' ? 'bad' : 'neutral'}>{r.status}</Badge> }]} />
}

function Payment() {
  const [add, setAdd] = useState(false), [st, run] = useSim(1400), [failed, setFailed] = useState(true)
  return (
    <div className="space-y-5">
      {failed && <InlineAlert tone="bad" title="Visa ending 6411 was declined" action={<Button size="sm" loading={st === 'running'} onClick={() => run(false, () => { setFailed(false); toast.success('Payment collected (simulated)') })}>Retry payment</Button>}>INV-1049 ($38.00) is open. Update the card or pay with credit before Nov 16.</InlineAlert>}
      <div className="grid gap-5 lg:grid-cols-2"><Panel title="Payment methods" actions={<Button size="sm" variant="outline" onClick={() => setAdd(true)}><Plus />Add card</Button>}><div className="space-y-2.5"><PaymentMethodCard def /><PaymentMethodCard brand="MC" last="9931" exp="02/27" /></div></Panel><Panel title="Billing address"><Kv rows={[['Name', 'Example Studio SRL'], ['Address', 'Str. Exemplu 1, Cluj-Napoca'], ['VAT ID', 'RO12345678', 'ok']]} /><Button className="mt-4" size="sm" variant="outline">Edit</Button></Panel></div>
      <Dialog open={add} onOpenChange={setAdd}><DialogContent title="Add a card"><div className="space-y-4"><FormField label="Card number"><input inputMode="numeric" placeholder="4242 4242 4242 4242" className={cn(inputCls(), 'font-mono')} /></FormField><div className="grid grid-cols-2 gap-4"><FormField label="Expiry"><input placeholder="MM / YY" className={cn(inputCls(), 'font-mono')} /></FormField><FormField label="CVC"><input placeholder="123" className={cn(inputCls(), 'font-mono')} /></FormField></div><label className="flex items-center gap-3 text-[13px] text-mute"><Checkbox defaultChecked />Use as the default card</label><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setAdd(false)}>Cancel</Button><Button onClick={() => { setAdd(false); toast.success('Card added (simulated)') }}>Add card</Button></div></div></DialogContent></Dialog>
    </div>
  )
}
function Credit() {
  const { balance: bal, addFunds, supportEntries } = useStore()
  const [open, setOpen] = useState(false), [amt, setAmt] = useState(25), [st, run, reset] = useSim(1300)
  const history = [...supportEntries.filter(e => e.source === 'community-support').map(e => [`Community support · ${e.name || 'Anonymous'}`, '+' + money(e.amountCents / 100), e.when]), ['Top-up', '+$50.00', 'Nov 02'], ['Applied to INV-1031', '−$7.50', 'Oct 09'], ['Refund · INV-0990', '+$12.00', 'Aug 21'], ['Welcome credit', '+$10.00', 'Mar 04']]
  return (
    <div className="grid gap-5 lg:grid-cols-3"><Panel title="Balance" className="lg:col-span-1"><div className="flex items-center gap-4"><Orb size={44} role="chat" state={st === 'ok' ? 'happy' : 'idle'} /><div><div className="font-mono text-[30px] leading-none tabular-nums">{money(bal)}</div><div className="mt-1 text-[12px] text-dim">Used before your card</div></div></div><Button className="mt-5 w-full" onClick={() => { reset(); setOpen(true) }}><Plus />Add funds</Button></Panel>
      <Panel title="History" className="lg:col-span-2"><ul className="divide-y divide-line text-[13.5px]">{history.map(([a, b, c], i) => <li key={a + i} className="flex items-center gap-3 py-3"><span className="flex-1">{a}</span><span className={cn('font-mono', b.startsWith('+') ? 'text-ok' : 'text-mute')}>{b}</span><span className="font-mono text-[11px] text-dim">{c}</span></li>)}</ul></Panel>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent title="Add funds" description="Credit never expires and is used first.">{st === 'ok' ? <StateHero state="happy" role="chat" word="ADDED." sub={`${money(amt)} is in your balance.`} small size={56}><Button onClick={() => { addFunds(amt); setOpen(false); reset() }}>Done</Button></StateHero> : <div className="space-y-4"><div className="grid grid-cols-4 gap-2">{[10, 25, 50, 100].map((a) => <button key={a} onClick={() => setAmt(a)} aria-pressed={amt === a} className={cn('h-10 rounded-lg border font-mono text-[13px] transition-colors', amt === a ? 'border-fg bg-fg text-black' : 'border-line-2 text-mute hover:text-fg')}>${a}</button>)}</div><div className="flex items-center justify-between rounded-lg border border-line p-3 text-[13px]"><span className="flex items-center gap-2 text-dim"><CreditCard className="size-4" />Visa ending 6411</span><span className="font-mono">{money(amt)}</span></div><Button className="w-full" size="lg" loading={st === 'running'} onClick={() => run(false)}>Pay {money(amt)}</Button></div>}</DialogContent></Dialog></div>
  )
}
function PlanChange() {
  const [to, setTo] = useState(2), P = [['Nano', 4, '1 vCPU · 1 GB'], ['Pro', 12, '4 vCPU · 8 GB'], ['Max', 29, '8 vCPU · 32 GB']]
  const days = 21, delta = ((P[to][1] - 12) * days) / 30
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]"><Panel title="Change the plan of web-01" desc="Resize without losing data."><RadioGroup value={String(to)} onValueChange={(v) => setTo(+v)} className="grid gap-3 sm:grid-cols-3">{P.map(([n, p, s], i) => <RadioCard key={n} value={String(i)} className="p-4"><div className="text-[13px] text-dim">{n}{i === 1 && <Badge tone="neutral" dot={false} className="ml-2">current</Badge>}</div><div className="mt-2 font-mono text-[20px]">{money(p)}</div><div className="mt-1 text-[12px] text-mute">{s}</div></RadioCard>)}</RadioGroup>{to === 0 && <div className="mt-4"><InlineAlert tone="warn" title="Smaller than what you use">Memory is at 54% of 8 GB. 1 GB will not fit.</InlineAlert></div>}</Panel>
      <Panel title="What happens"><Kv rows={[['From', 'Pro · $12.00'], ['To', `${P[to][0]} · ${money(P[to][1])}`], ['Days left in period', String(days)], ['Charged today', to === 1 ? 'nothing' : delta > 0 ? `${money(delta)}` : `credit ${money(-delta)}`, delta > 0 ? 'warn' : 'ok']]} /><Button className="mt-5 w-full" disabled={to === 1 || to === 0} onClick={() => toast.success('Plan changed (simulated)')}>Confirm change</Button></Panel></div>
  )
}

export default function Billing() {
  const [tab, setTab] = useState('subscriptions')
  const T = [['subscriptions', 'Subscriptions'], ['invoices', 'Invoices'], ['payment', 'Payment'], ['credit', 'Credit'], ['plan', 'Change plan']]
  const body = { subscriptions: <Subscriptions />, invoices: <Invoices />, payment: <Payment />, credit: <Credit />, plan: <PlanChange /> }
  return (
    <div className="space-y-5"><ScreenHead title="Billing" sub="What you pay for, how you pay, and what happens when something goes wrong." />
      <Tabs value={tab} onValueChange={setTab}><TabsList>{T.map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}</TabsList><div key={tab} className="step-in pt-5">{body[tab]}</div></Tabs></div>
  )
}
