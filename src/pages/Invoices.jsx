import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, CreditCard, Download, Loader2 } from 'lucide-react'
import { ChipTabs, Button, Card, Dialog, DialogContent, Input, Label, PageHeader, Segmented, Separator, Stat, StatusBadge } from '../components/ui.jsx'
import { DataTable } from '../components/ui2.jsx'
import { useStore } from '../lib/store.jsx'
import { cn, money, sleep } from '../lib/utils'

function InvoiceSheet({ inv, onClose }) {
  const { payInvoice } = useStore()
  const [phase, setPhase] = useState('view')
  const [method, setMethod] = useState('card')
  if (!inv) return null
  const pay = async () => {
    setPhase('busy'); await sleep(1600); payInvoice(inv.id); setPhase('done'); toast.success(`${inv.id} paid`)
  }
  return (
    <Dialog open={!!inv} onOpenChange={(o) => { if (!o) { onClose(); setTimeout(() => setPhase('view'), 300) } }}>
      <DialogContent side title={inv.id} description={`Issued ${inv.date} · Due ${inv.due}`}>
        {phase === 'view' && (
          <div className="space-y-6">
            <StatusBadge status={inv.status} />
            <div className="space-y-3 text-[13.5px]">
              {inv.items.map(([d, a]) => (<div key={d} className="flex justify-between text-mute"><span>{d}</span><span className="tabular-nums">{a < 0 ? '−' : ''}{money(Math.abs(a))}</span></div>))}
              <Separator />
              <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="tabular-nums">{money(inv.amount)}</span></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1"><Download />PDF</Button>
              {inv.status !== 'paid' && <Button className="flex-[2]" onClick={() => setPhase('pay')}>Pay {money(inv.amount)}</Button>}
            </div>
          </div>
        )}
        {phase === 'pay' && (
          <div className="space-y-5">
            <Segmented value={method} onValueChange={(v) => v && setMethod(v)} options={[['card', 'Card'], ['paypal', 'PayPal'], ['crypto', 'Crypto'], ['balance', 'Balance']]} />
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Card number</Label><Input className="font-mono" defaultValue="4242 4242 4242 4242" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Expiry</Label><Input className="font-mono" defaultValue="08 / 28" /></div>
                <div className="space-y-1.5"><Label>CVC</Label><Input className="font-mono" defaultValue="•••" /></div>
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={pay}><CreditCard />Pay {money(inv.amount)}</Button>
            <button className="w-full text-center text-[13px] text-dim hover:text-fg" onClick={() => setPhase('view')}>Back</button>
          </div>
        )}
        {phase === 'busy' && <div className="grid place-items-center gap-3 py-16 text-[13px] text-dim"><Loader2 className="size-6 animate-spin text-fg" />Confirming with your bank…</div>}
        {phase === 'done' && (
          <div className="grid place-items-center gap-3 py-12 text-center">
            <CheckCircle2 className="size-10 text-ok" />
            <div className="text-lg font-semibold">Payment received</div>
            <p className="text-[13px] text-dim">{money(inv.amount)} paid. A receipt was sent to your email.</p>
            <Button className="mt-3 w-full" onClick={onClose}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function Invoices() {
  const { invoices, balance } = useStore()
  const [f, setF] = useState('all')
  const [openId, setOpenId] = useState(null)
  const rows = invoices.filter((i) => f === 'all' || (f === 'paid' ? i.status === 'paid' : i.status !== 'paid'))
  const due = invoices.filter((i) => i.status !== 'paid').reduce((a, i) => a + i.amount, 0)
  const cur = invoices.find((i) => i.id === openId)
  return (
    <>
      <PageHeader title="Invoices" description="Pay, download and review your billing history.">
      </PageHeader>
      <ChipTabs value={f} onValueChange={setF} items={[['all', 'All', invoices.length], ['unpaid', 'Unpaid', invoices.filter((i) => i.status !== 'paid').length], ['paid', 'Paid', invoices.filter((i) => i.status === 'paid').length]]} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Outstanding" value={money(due)} hint={`${invoices.filter((i) => i.status !== 'paid').length} invoices`} delta={due ? 'Due' : undefined} tone="bad" />
        <Stat label="Paid this year" value="$412.00" hint="7 payments" delta="+12%" />
        <Stat label="Credit balance" value={money(balance)} hint="Auto-applied" />
      </div>
      <Card>
        <DataTable onRowClick={(r) => setOpenId(r.id)} columns={[{ key: 'id', label: 'Invoice', cell: (r) => <span className="font-mono text-[13px] text-fg">{r.id}</span> }, { key: 'date', label: 'Date' }, { key: 'due', label: 'Due' }, { key: 'status', label: 'Status', cell: (r) => <StatusBadge status={r.status} /> }, { key: 'amount', label: 'Amount', align: 'right', cell: (r) => <span className="tabular-nums">{money(r.amount)}</span> }, { key: 'a', label: '', align: 'right', cell: (r) => <Button size="sm" variant={r.status === 'paid' ? 'ghost' : 'default'}>{r.status === 'paid' ? 'View' : 'Pay now'}</Button> }]} rows={rows} />
      </Card>
      <InvoiceSheet inv={cur} onClose={() => setOpenId(null)} />
    </>
  )
}
