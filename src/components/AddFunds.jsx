import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button, Dialog, DialogContent, Input, Label } from './ui.jsx'
import { useStore } from '../lib/store.jsx'
import { cn, money, sleep } from '../lib/utils'

export function AddFundsDialog({ open, onOpenChange }) {
  const { addFunds, balance } = useStore()
  const [amt, setAmt] = useState(25)
  const [phase, setPhase] = useState('form')
  const submit = async () => {
    setPhase('busy')
    await sleep(1300)
    addFunds(Number(amt))
    setPhase('done')
    toast.success('Funds added')
  }
  const close = (o) => {
    onOpenChange(o)
    if (!o) setTimeout(() => setPhase('form'), 250)
  }
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent title="Add funds" description="Credit is applied to invoices automatically.">
        {phase === 'form' && (
          <div className="space-y-5">
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((a) => (
                <button key={a} onClick={() => setAmt(a)} className={cn('h-10 rounded-lg border text-[13.5px] transition-colors', Number(amt) === a ? 'border-fg bg-fg text-black' : 'border-line-2 text-mute hover:text-fg')}>
                  ${a}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label>Custom amount</Label>
              <Input type="number" min="1" value={amt} onChange={(e) => setAmt(e.target.value)} />
            </div>
            <Button size="lg" className="w-full" disabled={!(Number(amt) > 0)} onClick={submit}>
              Add {money(Number(amt) || 0)}
            </Button>
          </div>
        )}
        {phase === 'busy' && (
          <div className="grid place-items-center gap-3 py-10 text-[13px] text-dim">
            <Loader2 className="size-6 animate-spin text-fg" />
            Processing payment…
          </div>
        )}
        {phase === 'done' && (
          <div className="grid place-items-center gap-3 py-6 text-center">
            <CheckCircle2 className="size-9 text-ok" />
            <div className="text-lg font-semibold">New balance {money(balance)}</div>
            <Button className="mt-2 w-full" onClick={() => close(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
