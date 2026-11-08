import { useState } from 'react'
import { Check, Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { Doc, Demo } from './Doc.jsx'
import { Button, Segmented } from '../components/ui.jsx'
import { LOGOS, useBrandId } from '../components/logos.jsx'
import { cn } from '../lib/utils'

function Card({ logo, active, onUse, text }) {
  const [light, setLight] = useState(false)
  const { Mark, Lockup } = logo
  return (
    <div className={cn('flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card transition-colors', active ? 'border-white/50' : 'border-line hover:border-line-2')}>
      {/* stage */}
      <div className={cn('relative grid h-44 place-items-center px-4 transition-colors', light ? 'bg-[#f4f4f1] text-[#0d0d0f]' : 'bg-black text-fg')}>
        <Lockup h={22} text={text} />
        <button onClick={() => setLight(!light)} aria-label={light ? 'Show on dark' : 'Show on light'} className={cn('absolute right-3 top-3 grid size-8 place-items-center rounded-lg border transition-colors', light ? 'border-black/15 text-black/60 hover:text-black' : 'border-line-2 text-mute hover:text-fg')}>{light ? <Moon className="size-4" /> : <Sun className="size-4" />}</button>
        {active && <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.06em] text-ok"><i className="size-1.5 rounded-full bg-ok" />In use</span>}
      </div>
      {/* sizes + app icon */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-y border-line px-4 py-4">
        <div className="flex items-end gap-4">{[44, 28, 16].map((s) => <div key={s} className="flex flex-col items-center gap-1.5"><Mark size={s} /><span className="font-mono text-[9.5px] text-dim">{s}</span></div>)}</div>
        <div className="ml-auto flex items-center gap-3">
          <div className="grid size-14 place-items-center rounded-[22%] border border-line-2 bg-black"><Mark size={34} /></div>
          <div className="grid size-14 place-items-center rounded-[22%] bg-[#f4f4f1] text-[#0d0d0f]"><Mark size={34} /></div>
        </div>
      </div>
      {/* meta */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2"><h3 className="text-[15px] font-semibold">{logo.name}</h3><span className="font-mono text-[10.5px] uppercase tracking-[.06em] text-dim">{logo.tag}</span></div>
        <p className="text-[12.5px] leading-relaxed text-mute">{logo.note}</p>
        <Button variant={active ? 'secondary' : 'default'} className="mt-auto" onClick={onUse} disabled={active}>{active ? <><Check />Active everywhere</> : 'Use this logo'}</Button>
      </div>
    </div>
  )
}

function Gallery() {
  const [id, setId] = useBrandId()
  const [text, setText] = useState('blipmade')
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[13px] text-mute">Wordmark
          <input value={text} onChange={(e) => setText(e.target.value.slice(0, 14))} aria-label="Wordmark text" className="h-9 w-44 rounded-lg border border-line-2 bg-transparent px-3 font-mono text-[13px] text-fg outline-none focus:border-white/40" />
        </label>
        <span className="text-xs text-dim">Type any name to see every style render it. The choice you make applies to the sidebar, top bar, admin and public site.</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {LOGOS.map((l) => <Card key={l.id} logo={l} text={text} active={id === l.id} onUse={() => { setId(l.id); toast.success(`${l.name} is now the Blipmade logo`) }} />)}
      </div>
    </>
  )
}

function HowTo() {
  const steps = [
    ['Pick the idea first', 'One metaphor, in one sentence. “A signal ping”, “a server stack”, “a grid with one live cell”. If you cannot say it, the shape will not carry it.'],
    ['Give it a construction rule', 'Dots on a 5×7 grid, bars on a 4-px module, a ring every 8 px. A rule makes it look designed and lets you generate variants consistently.'],
    ['Limit colour to one signal', 'Everything in currentColor, one red accent for the “live” element. It then works on dark, light and in one colour for print.'],
    ['Add exactly one motion', 'Ping, blink, hop, scan. One idea, slow, looping, and removed under prefers-reduced-motion. Static fallback must still look finished.'],
    ['Test the harsh cases', 'Favicon at 16 px, app icon in a squircle, black on white, one colour, and the wordmark at 11 px in a sidebar. If it dies at 16 px, simplify.'],
    ['Lock the lockup', 'Mark height = x. Gap = 0.5x. Clear space = x on every side. Never stretch, recolour the accent, or add effects outside the animation.'],
  ]
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">{steps.map(([t, d], i) => <div key={t} className="rounded-xl border border-line bg-card p-4"><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Step {i + 1}</div><div className="mt-1 text-[14px] font-semibold">{t}</div><p className="mt-1 text-[13px] leading-relaxed text-mute">{d}</p></div>)}</div>
      <Demo label="Ways to generate more styles">
        <ul className="space-y-2.5 text-[13px] text-mute">{['Swap the metaphor (ping → stack → grid → terminal) and keep the same lockup rules.', 'Swap the construction (dots → squares → stripes → halftone) and keep the same word.', 'Take any style and change one axis: weight, tracking, case, mark-left vs mark-above, or which element carries the red.', 'Ask for a new style by naming the metaphor and the construction rule, for example “wordmark built from stacked rack-unit bars, LED blinks in the dot of the i”.'].map((x) => <li key={x} className="flex gap-2.5"><i className="mt-2 size-1 shrink-0 rounded-full bg-dim" />{x}</li>)}</ul>
      </Demo>
    </>
  )
}

export default function Logos() {
  return <Doc title="Logo lab" lead="Nine distinct directions for the Blipmade mark, each with a lockup, small sizes, an app icon and a light variant. The first is the Klinch-derived one we started from; the rest are original. Pick one and it replaces the logo across the whole workspace." sections={[
    { id: 'gallery', title: 'Directions', note: 'click “Use this logo” to apply', node: <Gallery /> },
    { id: 'how', title: 'How to design more', node: <HowTo /> },
  ]} />
}
