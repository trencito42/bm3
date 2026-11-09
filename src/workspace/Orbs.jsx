import { useState } from 'react'
import { Check, Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { Doc, Demo } from './Doc.jsx'
import { Button } from '../components/ui.jsx'
import { BlipCast } from '../components/BlipCast.jsx'
import { CAST, CAST_IDS, ORBS, OrbX, useOrbId } from '../components/orbs.jsx'
import { cn } from '../lib/utils'

const STATES = ['idle', 'thinking', 'speaking', 'happy', 'waiting', 'error']
const LADDER = [16, 20, 24, 28, 32, 40, 48, 64, 96, 128]

const StateBar = ({ state, setState, light, setLight }) => (
  <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center gap-3 rounded-xl border border-line-2 bg-bg/90 px-3 py-2.5 backdrop-blur">
    <div className="flex flex-wrap gap-1">{STATES.map((s) => <button key={s} onClick={() => setState(s)} aria-pressed={state === s} className={cn('h-8 rounded-lg px-3 text-[12.5px] capitalize transition-colors', state === s ? 'bg-fg text-black' : 'bg-white/[0.06] text-mute hover:text-fg')}>{s}</button>)}</div>
    <button onClick={() => setLight(!light)} aria-label="Toggle light stage" className="ml-auto flex h-8 items-center gap-2 rounded-lg border border-line-2 px-3 text-[12.5px] text-mute transition-colors hover:text-fg">{light ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}{light ? 'Dark stage' : 'Light stage'}</button>
  </div>
)

/* ------------------------------------------------------------------ the cast ------------------------------------------------------------------ */
function Cast() {
  return (
    <div className="torch relative overflow-hidden rounded-2xl border border-line bg-card px-5 py-12 sm:py-16">
      <BlipCast />
    </div>
  )
}

/* ------------------------------------------------------------------ characters ------------------------------------------------------------------ */
function Characters() {
  const [state, setState] = useState('idle')
  const [light, setLight] = useState(false)
  return (
    <>
      <StateBar state={state} setState={setState} light={light} setLight={setLight} />
      <div className="grid gap-4 sm:grid-cols-2">
        {CAST_IDS.map((r) => {
          const c = CAST[r]
          return (
            <div key={r} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-card">
              <div className={cn('relative grid h-60 place-items-center transition-colors', light ? 'bg-[#f1f1ee]' : 'bg-black')}>
                <OrbX id="cast" role={r} size={132} state={state} />
                <span className={cn('absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-[.08em]', light ? 'text-black/40' : 'text-white/35')}>{state}</span>
              </div>
              <div className="flex items-end justify-center gap-5 border-y border-line px-4 py-4">
                {[22, 32, 48, 64].map((s) => <div key={s} className="flex flex-col items-center gap-1.5"><OrbX id="cast" role={r} size={s} state={state} /><span className="font-mono text-[9.5px] text-dim">{s}</span></div>)}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex items-baseline justify-between gap-2"><h3 className="text-[19px] font-semibold tracking-tight">{c.name}</h3><span className="font-mono text-[10.5px] uppercase tracking-[.06em] text-dim">{c.label} · {c.tag}</span></div>
                <p className="text-[13px] leading-relaxed text-mute">{c.note}</p>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function Ladder() {
  return (
    <div className="space-y-3">
      {[['Dark', 'bg-black'], ['Light', 'bg-[#f1f1ee]']].map(([n, cls]) => (
        <div key={n} className={cn('space-y-4 overflow-x-auto rounded-2xl border border-line p-5', cls)}>
          {CAST_IDS.map((r) => (
            <div key={r} className="flex items-end gap-x-5">
              <span className={cn('w-14 shrink-0 pb-1 font-mono text-[10px] uppercase tracking-[.06em]', n === 'Light' ? 'text-black/45' : 'text-white/35')}>{CAST[r].name}</span>
              {LADDER.map((s) => <div key={s} className="flex flex-col items-center gap-1.5"><OrbX id="cast" role={r} size={s} /><span className={cn('font-mono text-[9px]', n === 'Light' ? 'text-black/35' : 'text-white/30')}>{s}</span></div>)}
            </div>
          ))}
        </div>
      ))}
      <p className="text-xs text-dim">From 16 to 128 px, dark and light. Eyes are cut from whole device pixels (never thinner than two) and mirror exactly; below 33 px the glow is dropped so the edges stay crisp.</p>
    </div>
  )
}

function InContext() {
  const { chat, builder, dev, game } = CAST
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Demo label={`${chat.name} · chat`} sim>
        <div className="space-y-3">
          <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-fg px-3.5 py-2.5 text-[13.5px] text-black">Why is my invoice higher this month?</div>
          <div className="flex items-start gap-3"><OrbX id="cast" role="chat" size={32} state="speaking" /><div className="max-w-[82%] rounded-2xl rounded-bl-md border border-line bg-white/[0.03] px-3.5 py-2.5 text-[13.5px]">You resized pg-main to 8 GB on Nov 05, so it is billed at the new size from that day.</div></div>
          <div className="flex items-center gap-3"><OrbX id="cast" role="chat" size={32} state="thinking" /><span className="flex gap-1">{[0, 1, 2].map((i) => <i key={i} className="size-1.5 animate-bounce rounded-full bg-dim" style={{ animationDelay: `${i * 120}ms` }} />)}</span></div>
        </div>
      </Demo>
      <Demo label={`${builder.name} · website builder`} sim>
        <div className="rounded-xl border border-line bg-black/30">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3"><OrbX id="cast" role="builder" size={36} state="thinking" /><div><div className="text-[13.5px] font-medium">{builder.name}</div><div className="font-mono text-[11px] text-dim">Designing the menu section…</div></div></div>
          <div className="space-y-2 p-4">{['Hero · done', 'Menu · in progress', 'Booking form · queued'].map((l, i) => <div key={l} className="flex items-center gap-2.5 text-[12.5px] text-mute"><i className={cn('size-1.5 rounded-full', i === 0 ? 'bg-ok' : i === 1 ? 'bg-[var(--brand)]' : 'bg-white/20')} />{l}</div>)}</div>
        </div>
      </Demo>
      <Demo label={`${dev.name} · reads the code, finds the bug`} sim>
        <div className="rounded-xl border border-line bg-black/40 font-mono text-[12px] leading-6">
          <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 font-sans"><OrbX id="cast" role="dev" size={30} state="speaking" /><span className="text-[13px] text-mute">Found it in <span className="font-mono text-fg">orders.ts:42</span></span></div>
          <div className="px-4 py-3"><div className="text-bad">TypeError: cannot read properties of undefined (reading 'total')</div><div className="text-dim">  at checkout (orders.ts:42:18)</div><div className="mt-2 text-ok">+ const total = cart?.total ?? 0</div></div>
        </div>
      </Demo>
      <Demo label={`${game.name} · debugs the crash`} sim>
        <div className="rounded-xl border border-line bg-black/40">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3"><OrbX id="cast" role="game" size={36} state="waiting" /><div><div className="text-[13.5px] font-medium">mc-survival</div><div className="font-mono text-[11px] text-dim">Tick lag spike · 3 plugins suspect</div></div></div>
          <div className="space-y-2 p-4 text-[12.5px]">{[['DynmapRenderer', '41% of tick time'], ['MobStacker', '18%'], ['ChunkLoader', '9%']].map(([a, b]) => <div key={a} className="flex justify-between text-mute"><span>{a}</span><span className="font-mono text-dim">{b}</span></div>)}</div>
        </div>
      </Demo>
    </div>
  )
}

/* ------------------------------------------------------------------ skins ------------------------------------------------------------------ */
function Card({ o, state, light, active, onUse }) {
  const inCast = Object.values(CAST).find((c) => c.skin === o.id)
  return (
    <div className={cn('flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card transition-colors', active ? 'border-white/50' : 'border-line hover:border-line-2')}>
      <div className={cn('relative grid h-56 place-items-center transition-colors', light ? 'bg-[#f1f1ee]' : 'bg-black')}>
        <OrbX id={o.id} size={116} state={state} />
        {inCast && <span className="absolute left-3 top-3 rounded-full border border-line-2 bg-black/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.06em] text-mute">{inCast.name} · {inCast.label}</span>}
        {active && <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.06em] text-ok"><i className="size-1.5 rounded-full bg-ok" />In use</span>}
      </div>
      <div className="flex items-end justify-center gap-5 border-y border-line px-4 py-4">{[22, 32, 48].map((s) => <div key={s} className="flex flex-col items-center gap-1.5"><OrbX id={o.id} size={s} state={state} /><span className="font-mono text-[9.5px] text-dim">{s}</span></div>)}</div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2"><h3 className="text-[15px] font-semibold">{o.name}</h3><span className="font-mono text-[10.5px] uppercase tracking-[.06em] text-dim">{o.tag}</span></div>
        <p className="text-[12.5px] leading-relaxed text-mute">{o.note}</p>
        <Button className="mt-auto" variant={active ? 'secondary' : 'default'} disabled={active} onClick={onUse}>{active ? <><Check />Active everywhere</> : 'Use for every Blip'}</Button>
      </div>
    </div>
  )
}

function Skins() {
  const [sel, setSel] = useOrbId()
  const [state, setState] = useState('idle')
  const [light, setLight] = useState(false)
  return (
    <>
      <StateBar state={state} setState={setState} light={light} setLight={setLight} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3">
        <p className="min-w-0 flex-1 text-[13px] text-mute">{sel === 'cast' ? <>Each Blip uses its own character (<span className="text-fg">{CAST_IDS.map((r) => CAST[r].name).join(', ')}</span>). Picking a skin below replaces all of them everywhere in this mock-up.</> : <>Every Blip currently uses one skin. Go back to give each Blip its own character.</>}</p>
        <Button variant={sel === 'cast' ? 'secondary' : 'default'} size="sm" disabled={sel === 'cast'} onClick={() => { setSel('cast'); toast.success('Each Blip is itself again') }}>{sel === 'cast' ? 'The cast is active' : 'Back to the cast'}</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ORBS.map((o) => <Card key={o.id} o={o} state={state} light={light} active={sel === o.id} onUse={() => { setSel(o.id); toast.success(`${o.name} is now every Blip`) }} />)}
      </div>
    </>
  )
}

function Spec() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[['One family, four characters', 'Pip (chat), Forge (builder), Byte (dev) and Glitch (game) are four of the best-made constructions, picked so that no two share a colour, a silhouette or a temperament. They share a contract: size, state, role.'],
        ['The cast in a headline', 'The Muse-style headline: pick a Blip and the sentence becomes its own ("Forge, the AI that builds your site"). The words are dot-matrix type that dissolves and re-assembles from loose dots; the avatar in the line is the real character at 1:1.'],
        ['States', 'Idle: blinks, glances, smiles on hover. Thinking: eyes scan. Speaking: eyes pulse. Happy: arcs and a hop. Waiting: slow, eyes lowered. Error: colour shifts, eyes droop. Each body reacts in its own way (the gel squishes, the gem sparkles).'],
        ['Cursor follow', 'Eyes drift towards the pointer, capped at a few percent of the body, and return to their idle glance after 2.5 s. Off under reduced motion and on touch.'],
        ['Pixel grid', 'Eye width, height and gap are rounded to one device pixel (read from devicePixelRatio, so it holds under zoom) and both eyes are placed from the centre, so they mirror exactly at every size.'],
        ['Skins', 'The other constructions stay available as skins that replace every Blip at once. "Back to the cast" restores the four characters.']]
        .map(([t, d]) => <div key={t} className="rounded-xl border border-line bg-card p-4"><div className="text-[14px] font-semibold">{t}</div><p className="mt-1 text-[13px] leading-relaxed text-mute">{d}</p></div>)}
    </div>
  )
}

export default function Orbs() {
  return <Doc title="Blip lab" lead="Blips are the AI agents of Blipmade. Four characters, one per job: Pip answers, Forge builds, Byte fixes code, Glitch debugs game servers. Same family, different bodies." sections={[
    { id: 'cast', title: 'The cast', note: 'pick one, the headline follows', node: <Cast /> },
    { id: 'characters', title: 'Characters', note: 'states, light and dark', node: <Characters /> },
    { id: 'ladder', title: 'Pixel ladder', note: '16 to 128 px', node: <Ladder /> },
    { id: 'context', title: 'In context', node: <InContext /> },
    { id: 'skins', title: 'Other skins', note: '20 constructions, optional', node: <Skins /> },
    { id: 'spec', title: 'How they work', node: <Spec /> },
  ]} />
}
