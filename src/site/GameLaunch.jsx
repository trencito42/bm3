import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Segmented, Slider } from '../components/ui.jsx'
import { Select, Stepper } from '../components/ui2.jsx'
import { AnimatedPrice } from '../components/DotViz.jsx'
import { Decode, DotRail, StateHero } from '../studio/kit.jsx'
import { EDITIONS, REGIONS, priceOf } from './appsData.js'
import { cn, money } from '../lib/utils'

const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches

function Configure({ game, close }) {
  const [ram, setRam] = useState(game.ram[0]), [disk, setDisk] = useState(10), [edition, setEdition] = useState('paper'), [region, setRegion] = useState('fra'), [yearly, setYearly] = useState(false)
  const [step, setStep] = useState(0), [progress, setProgress] = useState(0)
  const ed = game.editions ? EDITIONS.find(e => e.id === edition) : null
  const memory = Math.max(ram, ed?.ramMin || game.ram[0])
  const total = priceOf(game, memory, disk, yearly)
  useEffect(() => {
    if (step !== 2 || progress >= 5) return
    const t = setTimeout(() => setProgress(p => p + 1), 650)
    return () => clearTimeout(t)
  }, [step, progress])
  return <div className="p-6 sm:p-8">
    <button onClick={close} aria-label="Close configuration" className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-dim hover:bg-hover hover:text-fg"><X className="size-4" /></button>
    <p className="mb-2 font-mono text-[10px] uppercase tracking-[.08em] text-dim">Game server / {game.group}</p>
    <Dialog.Title className="pr-8 text-xl font-semibold tracking-tight">{game.name}</Dialog.Title>
    <Dialog.Description className="mt-2 text-[13px] text-mute">{game.soon ? 'This game is coming soon. Explore the configuration.' : 'Your world, configured your way.'}</Dialog.Description>
    <div className="mt-6"><Stepper steps={['Configure', 'Review', 'Ready']} current={Math.min(step, 2)} onStep={i => step < 2 && setStep(i)} /></div>
    {step < 2 ? <>
      <div key={step} className="step-in mt-7 min-h-[235px] space-y-6">
        {step === 0 ? <>
          {game.editions && <div><label className="mb-2 block text-[13px] text-mute">Edition</label><Select value={edition} onValueChange={setEdition} options={EDITIONS.map(e => [e.id, e.label])} /><p className="mt-2 text-[11.5px] text-dim">{ed.note}</p></div>}
          <div><div className="mb-3 flex justify-between text-[13px]"><span className="text-mute">Memory</span><span className="font-mono text-[12px]">{memory} GB</span></div><Slider aria-label="Server memory in GB" min={Math.max(game.ram[0], ed?.ramMin || 0)} max={game.ram[1]} step={1} value={[memory]} onValueChange={v => setRam(v[0])} /></div>
          <div><div className="mb-3 flex justify-between text-[13px]"><span className="text-mute">NVMe storage</span><span className="font-mono text-[12px]">{disk} GB</span></div><Slider aria-label="Server storage in GB" min={10} max={200} step={10} value={[disk]} onValueChange={v => setDisk(v[0])} /></div>
          <div className="grid gap-5 sm:grid-cols-2"><div><label className="mb-2 block text-[13px] text-mute">Region</label><Select value={region} onValueChange={setRegion} options={REGIONS.map(([v, name]) => [v, name])} /></div><div><span className="mb-2 block text-[13px] text-mute">Billing</span><Segmented value={yearly ? 'y' : 'm'} onValueChange={v => v && setYearly(v === 'y')} options={[[ 'm', 'Monthly'], ['y', 'Yearly −20%']]} /></div></div>
        </> : <>
          <p className="text-[14px]"><Decode text="One last look before your world goes live." per={12} /></p>
          <dl className="divide-y divide-line">{[['Game', game.name + (ed ? ` · ${ed.label}` : '')], ['Memory / storage', `${memory} GB / ${disk} GB NVMe`], ['Region', REGIONS.find(r => r[0] === region)[1]], ['Billing', yearly ? `${money(total * 12)} yearly` : 'Monthly'], ['Included', 'Daily backups · web console']].map(([k, v]) => <div key={k} className="flex justify-between gap-5 py-3 text-[12px]"><dt className="text-dim">{k}</dt><dd className="text-right text-mute">{v}</dd></div>)}</dl>
          <p className="text-[11px] leading-relaxed text-dim">Prototype only. No payment is taken and no real server is created.</p>
        </>}
      </div>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-5 border-t border-line pt-5"><div><span className="mb-2 block text-[11px] text-dim">{yearly ? 'Per month, billed yearly' : 'Per month'}</span><AnimatedPrice value={total} height={28} /></div><div className="flex gap-2">{step > 0 && <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft />Back</Button>}<Button onClick={() => game.soon ? toast.success('You are on the list (simulated)') : setStep(step + 1)}>{game.soon ? 'Notify me' : step === 0 ? 'Review server' : 'Create demo server'}<ArrowRight /></Button></div></div>
    </> : <div className="pb-3 pt-7"><StateHero state={progress >= 5 ? 'happy' : 'thinking'} role="game" word={progress >= 5 ? 'READY TO PLAY.' : 'BUILDING.'} sub={progress >= 5 ? 'Your demo server is ready. Invite the crew.' : 'Preparing your world. This is a simulated deployment.'} /><DotRail n={26} value={progress / 5} state={progress >= 5 ? 'ok' : 'run'} className="justify-center" /><p className="mt-5 text-center font-mono text-[11px] text-dim">{progress >= 5 ? 'DEMO COMPLETE / NO REAL SERVER CREATED' : ['Reserving resources', 'Installing game files', 'Preparing your world', 'Applying configuration', 'Starting server'][progress]}</p>{progress >= 5 && <Button className="mx-auto mt-7 flex" onClick={close}><Check />Done</Button>}</div>}
  </div>
}

/* Same button-to-panel movement as Soon.PreRegister, with Radix owning focus,
   Escape, outside-click and restoring focus to the original trigger. */
export function GameLaunch({ game, label }) {
  const trigger = useRef(null), timer = useRef(null)
  const [open, setOpen] = useState(false), [ready, setReady] = useState(false), [rect, setRect] = useState(null), [selected, setSelected] = useState(game)
  const [vp, setVp] = useState({ w: innerWidth, h: innerHeight })
  useEffect(() => { const resize = () => setVp({ w: innerWidth, h: innerHeight }); addEventListener('resize', resize); return () => { removeEventListener('resize', resize); clearTimeout(timer.current) } }, [])
  const close = () => { clearTimeout(timer.current); setReady(false); timer.current = setTimeout(() => setOpen(false), calm() ? 0 : 320) }
  const change = value => {
    if (!value) { close(); return }
    clearTimeout(timer.current)
    setRect(trigger.current.getBoundingClientRect().toJSON()); setSelected(game); setOpen(true); setReady(false)
    timer.current = setTimeout(() => setReady(true), calm() ? 0 : 34)
  }
  const width = Math.min(620, vp.w - 24), height = Math.min(690, vp.h - 32)
  const final = { left: (vp.w - width) / 2, top: (vp.h - height) / 2, width, height, borderRadius: 16 }
  const initial = rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, borderRadius: 8 } : final
  return <Dialog.Root open={open} onOpenChange={change}>
    <Dialog.Trigger asChild><Button ref={trigger} variant={label ? 'default' : 'outline'} size={label ? 'lg' : 'md'}>{label || (game.soon ? 'Notify me' : 'Configure')}<ArrowRight /></Button></Dialog.Trigger>
    <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[65] bg-black/65 backdrop-blur-[5px]" style={{ opacity: ready ? 1 : 0, transition: 'opacity 320ms' }} /><Dialog.Content className="game-morph" data-ready={ready} style={ready ? final : initial} onEscapeKeyDown={e => { e.preventDefault(); close() }} onPointerDownOutside={e => { e.preventDefault(); close() }}>
      <div className="game-morph-inner" style={{ width, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}><Configure key={selected.id} game={selected} close={close} /></div><span aria-hidden className="game-morph-label">{label || (selected.soon ? 'Notify me' : 'Configure')}<ArrowRight className="size-4" /></span>
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>
}
