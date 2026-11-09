import { useEffect, useState } from 'react'
import { Check, Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { Doc, Demo } from './Doc.jsx'
import { Button } from '../components/ui.jsx'
import { ORBS, OrbX, useOrbId } from '../components/orbs.jsx'
import { cn } from '../lib/utils'

const STATES = ['idle', 'thinking', 'speaking', 'happy', 'waiting', 'error']

function Card({ o, state, light, active, onUse }) {
  return (
    <div className={cn('flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card transition-colors', active ? 'border-white/50' : 'border-line hover:border-line-2')}>
      <div className={cn('relative grid h-56 place-items-center transition-colors', light ? 'bg-[#f1f1ee]' : 'bg-black')}>
        <OrbX id={o.id} size={116} state={state} />
        {active && <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.06em] text-ok"><i className="size-1.5 rounded-full bg-ok" />In use</span>}
        <span className={cn('absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-[.08em]', light ? 'text-black/40' : 'text-white/35')}>{state}</span>
      </div>
      <div className="flex items-end justify-center gap-5 border-y border-line px-4 py-4">
        {[22, 32, 48].map((s) => <div key={s} className="flex flex-col items-center gap-1.5"><OrbX id={o.id} size={s} state={state} /><span className="font-mono text-[9.5px] text-dim">{s}</span></div>)}
        <div className="ml-auto flex items-center gap-2.5 rounded-xl border border-line bg-black/40 py-2 pl-2 pr-3.5"><OrbX id={o.id} size={30} state={state} /><span className="text-[12.5px] text-mute">Hi! How can I help?</span></div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2"><h3 className="text-[15px] font-semibold">{o.name}</h3><span className="font-mono text-[10.5px] uppercase tracking-[.06em] text-dim">{o.tag}</span></div>
        <p className="text-[12.5px] leading-relaxed text-mute">{o.note}</p>
        <Button className="mt-auto" variant={active ? 'secondary' : 'default'} disabled={active} onClick={onUse}>{active ? <><Check />Active everywhere</> : 'Use this orb'}</Button>
      </div>
    </div>
  )
}

function Gallery() {
  const [sel, setSel] = useOrbId()
  const [state, setState] = useState('idle')
  const [light, setLight] = useState(false)
  const [cycle, setCycle] = useState(false)
  useEffect(() => {
    if (!cycle) return
    const t = setInterval(() => setState((s) => STATES[(STATES.indexOf(s) + 1) % STATES.length]), 2600)
    return () => clearInterval(t)
  }, [cycle])
  return (
    <>
      <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center gap-3 rounded-xl border border-line-2 bg-bg/90 px-3 py-2.5 backdrop-blur">
        <div className="flex flex-wrap gap-1">{STATES.map((s) => <button key={s} onClick={() => setState(s)} className={cn('h-8 rounded-lg px-3 text-[12.5px] capitalize transition-colors', state === s ? 'bg-fg text-black' : 'bg-white/[0.06] text-mute hover:text-fg')}>{s}</button>)}</div>
        <button onClick={() => setCycle(!cycle)} aria-pressed={cycle} className={cn('ml-auto flex h-8 items-center gap-2 rounded-lg border px-3 text-[12.5px] transition-colors', cycle ? 'border-fg bg-fg text-black' : 'border-line-2 text-mute hover:text-fg')}>{cycle ? 'Cycling states' : 'Cycle states'}</button>
        <button onClick={() => setLight(!light)} aria-label="Toggle light stage" className="flex h-8 items-center gap-2 rounded-lg border border-line-2 px-3 text-[12.5px] text-mute transition-colors hover:text-fg">{light ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}{light ? 'Dark stage' : 'Light stage'}</button>
      </div>
      <p className="text-[12.5px] text-dim">Move the cursor around: every style’s eyes follow it. Hover an idle orb to see it smile. Pick a state above to preview them all at once.</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ORBS.map((o) => <Card key={o.id} o={o} state={state} light={light} active={sel === o.id} onUse={() => { setSel(o.id); toast.success(`${o.name} is now the Blipmade orb`) }} />)}
      </div>
    </>
  )
}

function InContext() {
  const [sel] = useOrbId()
  return (
    <Demo label="Selected orb in context · assistant message, typing indicator, empty state" sim>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-fg px-3.5 py-2.5 text-[13.5px] text-black">Build me a bakery site in Porto.</div>
          <div className="flex items-start gap-3"><OrbX id={sel} size={34} state="speaking" /><div className="max-w-[80%] rounded-2xl rounded-bl-md border border-line bg-white/[0.03] px-3.5 py-2.5 text-[13.5px]">On it. I will start with the hero and the menu.</div></div>
          <div className="flex items-center gap-3"><OrbX id={sel} size={34} state="thinking" /><span className="flex gap-1">{[0, 1, 2].map((i) => <i key={i} className="size-1.5 animate-bounce rounded-full bg-dim" style={{ animationDelay: `${i * 120}ms` }} />)}</span></div>
        </div>
        <div className="grid place-items-center gap-3 rounded-xl border border-dashed border-line-2 py-10 text-center"><OrbX id={sel} size={72} state="waiting" /><div className="text-[14px] font-semibold">Nothing here yet</div><div className="text-xs text-dim">Describe what you want to build.</div></div>
      </div>
    </Demo>
  )
}

function Spec() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[['Shared contract', 'Every style renders inside the same 1:1 box, takes size and state, uses the same face (eyes, blink, glance, joy arcs) and the same six states, so they are drop-in replacements for one another.'],
        ['Cursor follow', 'The eyes drift towards the pointer, capped at a few percent of the orb, and return to their idle glance after 2.5 s without movement. Disabled under reduced motion and on touch.'],
        ['State language', 'Idle: blink + occasional glance, smiles on hover. Thinking: faster motion and eyes scanning side to side. Speaking: eyes pulse, motion speeds up. Happy: arcs and a small hop. Waiting: slow, eyes lowered. Error: colour shifts and eyes droop.'],
        ['Performance', 'Most styles are pure CSS (compositor-friendly transforms). Dot sphere uses one small canvas and LED / Waveform update at about 10–18 fps. Cheap enough for a chat message per orb.']]
        .map(([t, d]) => <div key={t} className="rounded-xl border border-line bg-card p-4"><div className="text-[14px] font-semibold">{t}</div><p className="mt-1 text-[13px] leading-relaxed text-mute">{d}</p></div>)}
    </div>
  )
}

export default function Orbs() {
  return <Doc title="Orb lab" lead="Twenty constructions of the same assistant character. Pick one and it becomes the orb in the site builder, chat, support and everywhere else the assistant appears." sections={[
    { id: 'gallery', title: 'Styles', note: 'click “Use this orb” to apply everywhere', node: <Gallery /> },
    { id: 'context', title: 'In context', node: <InContext /> },
    { id: 'spec', title: 'How they work', node: <Spec /> },
  ]} />
}
