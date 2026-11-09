import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import * as ToggleP from '@radix-ui/react-toggle-group'
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Dialog, DialogContent, Input, Label, PageHeader, RadioCard, RadioGroup, Segmented, Separator, Slider, Switch } from '../components/ui.jsx'
import { PLANS, useStore } from '../lib/store.jsx'
import { cn, money, sleep } from '../lib/utils'
import { AnimatedPrice, DotNum } from '../components/DotViz.jsx'

const ADDS = [['backups', 'Daily backups', 2], ['ddos', 'DDoS protection', 3], ['ip', 'Dedicated IPv4', 1.5]]
const Chips = ({ value, onValueChange, items }) => (
  <ToggleP.Root type="single" value={value} onValueChange={(v) => v && onValueChange(v)} className="flex flex-wrap gap-2">
    {items.map((i) => (
      <ToggleP.Item key={i} value={i} className="h-8 rounded-lg border border-line-2 px-3.5 text-[13px] text-mute transition-colors hover:text-fg data-[state=on]:border-fg data-[state=on]:bg-fg data-[state=on]:text-black">{i}</ToggleP.Item>
    ))}
  </ToggleP.Root>
)

const STEPS = ['Reserving capacity', 'Allocating OS image', 'Attaching network · IPv4 + IPv6', 'Applying firewall rules', 'Generating SSH keys']

export default function Order() {
  const nav = useNavigate()
  const { addService, services } = useStore()
  const [plan, setPlan] = useState('pro')
  const [yearly, setYearly] = useState('m')
  const [region, setRegion] = useState('Frankfurt')
  const [os, setOs] = useState('Ubuntu 24.04')
  const [gb, setGb] = useState(0)
  const [add, setAdd] = useState({ backups: true, ddos: false, ip: false })
  const [step, setStep] = useState(-1)
  const [open, setOpen] = useState(false)
  const [newId, setNewId] = useState(null)

  const pl = PLANS.find((p) => p.id === plan)
  const disc = yearly === 'y' ? 0.8 : 1
  const lines = [[`${pl.name} plan`, pl.price], gb ? [`Extra storage · ${gb} GB`, gb * 0.05] : null, ...ADDS.filter(([k]) => add[k]).map(([, l, p]) => [l, p])].filter(Boolean)
  const total = lines.reduce((a, [, p]) => a + p, 0) * disc

  const checkout = async () => {
    setOpen(true); setStep(0); setNewId(null)
    for (let i = 0; i < STEPS.length; i++) { setStep(i); await sleep(750) }
    const id = 'vps-' + (10 + services.length)
    addService({ id, name: `new-${plan}-${services.length + 1}`, type: `VPS ${pl.name}`, icon: 'server', ip: `45.83.${30 + services.length}.${10 + services.length * 7}`, region, status: 'running', cpu: 4, ram: 12, disk: 6, price: +total.toFixed(2), due: 'Dec 08' })
    setStep(STEPS.length); setNewId(id); toast.success('Server provisioned')
  }

  return (
    <>
      <PageHeader title="New service" description="Configure a server. It is provisioned in about 40 seconds.">
        <Segmented value={yearly} onValueChange={(v) => v && setYearly(v)} options={[['m', 'Monthly'], ['y', 'Yearly −20%']]} />
      </PageHeader>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <RadioGroup value={plan} onValueChange={setPlan} className="grid gap-4 sm:grid-cols-3">
            {PLANS.map((p) => (
              <RadioCard key={p.id} value={p.id}>
                <div className="flex items-center gap-2 text-[13px] text-dim">{p.name}{p.tag && <Badge tone="info" dot={false}>{p.tag}</Badge>}</div>
                <div className="mt-4 flex items-end gap-2"><DotNum text={money(p.price * disc).replace('.00', '')} height={36} animate={false} /><span className="shrink-0 whitespace-nowrap pb-1 text-[12px] text-dim">/ mo</span></div>
                <ul className="mt-5 space-y-2 text-[13px] text-mute">{p.specs.map((s) => <li key={s} className="flex items-center gap-2"><span className="size-1 rounded-full bg-dim" />{s}</li>)}</ul>
              </RadioCard>
            ))}
          </RadioGroup>

          <Card>
            <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
            <CardBody className="space-y-6">
              <div className="space-y-2.5"><Label>Region</Label><Chips value={region} onValueChange={setRegion} items={['Frankfurt', 'Amsterdam', 'Helsinki', 'Ashburn']} /></div>
              <div className="space-y-2.5"><Label>Operating system</Label><Chips value={os} onValueChange={setOs} items={['Ubuntu 24.04', 'Debian 12', 'AlmaLinux 9', 'Arch']} /></div>
              <div className="space-y-3"><div className="flex justify-between"><Label>Extra storage</Label><span className="font-mono text-[12.5px] text-fg">+{gb} GB</span></div><Slider min={0} max={500} step={25} value={[gb]} onValueChange={([v]) => setGb(v)} /></div>
              <Separator />
              <div className="space-y-4">
                {ADDS.map(([k, l, p]) => (
                  <div key={k} className="flex items-center justify-between">
                    <div><div className="text-[13.5px]">{l}</div><div className="text-xs text-dim">+{money(p)} / month</div></div>
                    <Switch checked={add[k]} onCheckedChange={(v) => setAdd((a) => ({ ...a, [k]: v }))} aria-label={l} />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-0">
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardBody className="space-y-3 text-[13.5px]">
            {lines.map(([l, p]) => <div key={l} className="flex justify-between text-mute"><span>{l}</span><span className="tabular-nums">{money(p)}</span></div>)}
            {yearly === 'y' && <div className="flex justify-between text-ok"><span>Yearly discount</span><span>−20%</span></div>}
            <div className="text-xs text-dim">{region} · {os}</div>
            <Separator />
            <div className="flex items-end justify-between"><span className="text-dim">Total / month</span><AnimatedPrice value={total} height={26} /></div>
            <div className="space-y-1.5 pt-2"><Label>Promo code</Label><Input className="font-mono" placeholder="BLIP20" /></div>
            <Button size="lg" className="mt-1 w-full" onClick={checkout}>Checkout</Button>
          </CardBody>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={(o) => step >= STEPS.length && setOpen(o)}>
        <DialogContent title={step >= STEPS.length ? 'Your server is live' : 'Provisioning…'} description={step >= STEPS.length ? 'It is online and ready for SSH.' : `${pl.name} · ${region}`} onInteractOutside={(e) => step < STEPS.length && e.preventDefault()}>
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={s} className={cn('flex items-center gap-3 text-[13.5px] transition-colors', i <= step ? 'text-fg' : 'text-dim')}>
                {i < step ? <CheckCircle2 className="size-4 text-ok" /> : i === step ? <Loader2 className="size-4 animate-spin" /> : <Circle className="size-4" />}
                {s}
              </div>
            ))}
          </div>
          {step >= STEPS.length && <Button size="lg" className="mt-6 w-full" onClick={() => { setOpen(false); nav('/services/' + newId) }}>View service</Button>}
        </DialogContent>
      </Dialog>
    </>
  )
}
