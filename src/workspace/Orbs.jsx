import { useEffect, useState } from 'react'
import { Check, Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { Doc, Demo } from './Doc.jsx'
import { Button } from '../components/ui.jsx'
import { ORBS, OrbX, ROLES, useOrbId } from '../components/orbs.jsx'
import { cn } from '../lib/utils'

const STATES = ['idle', 'thinking', 'speaking', 'happy', 'waiting', 'error']
const ROLE_IDS = Object.keys(ROLES)
const LADDER = [16, 20, 24, 28, 32, 40, 48, 64, 96, 128]

/* ------------------------------------------------------------------ the Blip ------------------------------------------------------------------ */
function Stage() {
  const [state, setState] = useState('idle')
  const [role, setRole] = useState('chat')
  const [light, setLight] = useState(false)
  const [cycle, setCycle] = useState(false)
  useEffect(() => {
    if (!cycle) return
    const t = setInterval(() => setState((s) => STATES[(STATES.indexOf(s) + 1) % STATES.length]), 2400)
    return () => clearInterval(t)
  }, [cycle])
  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-line">
        <div className={cn('relative grid h-[340px] place-items-center transition-colors duration-300', light ? 'bg-[#f1f1ee] [--ring:#f1f1ee]' : 'bg-black [--ring:#000]')} style={light ? { '--ring': '#f1f1ee', '--ink': '#fff' } : undefined}>
          <OrbX id="blip" size={200} state={state} role={role === 'chat' ? undefined : role} />
          <span className={cn('absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[.08em]', light ? 'text-black/40' : 'text-white/35')}>{ROLES[role].label} · {state}</span>
          <button onClick={() => setLight(!light)} aria-label="Toggle light stage" className={cn('absolute right-3 top-3 flex h-8 items-center gap-2 rounded-lg border px-3 text-[12.5px] transition-colors', light ? 'border-black/15 text-black/60 hover:text-black' : 'border-line-2 text-mute hover:text-fg')}>{light ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}{light ? 'Dark' : 'Light'}</button>
        </div>
        <div className="space-y-3 border-t border-line bg-card p-3">
          <div className="flex flex-wrap items-center gap-1">
            {STATES.map((s) => <button key={s} onClick={() => setState(s)} aria-pressed={state === s} className={cn('h-8 rounded-lg px-3 text-[12.5px] capitalize transition-colors', state === s ? 'bg-fg text-black' : 'bg-white/[0.06] text-mute hover:text-fg')}>{s}</button>)}
            <button onClick={() => setCycle(!cycle)} aria-pressed={cycle} className={cn('ml-auto h-8 rounded-lg border px-3 text-[12.5px] transition-colors', cycle ? 'border-fg bg-fg text-black' : 'border-line-2 text-mute hover:text-fg')}>{cycle ? 'Cycling' : 'Cycle'}</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {ROLE_IDS.map((r) => <button key={r} onClick={() => setRole(r)} aria-pressed={role === r} className={cn('h-8 rounded-lg px-3 text-[12.5px] transition-colors', role === r ? 'bg-fg text-black' : 'bg-white/[0.06] text-mute hover:text-fg')}>{ROLES[r].label}</button>)}
          </div>
        </div>
      </div>
      <div className="grid content-start gap-3">
        {[['Disc', 'A dark body with a one-device-pixel rim and a soft top light. No colour of its own: it sits on any background.'],
          ['Dot grid', 'A faint grid of dots inside the body, the same language as the dot-matrix type. It rises while the Blip is thinking or speaking.'],
          ['Ping', 'A hairline ring that leaves the disc like a radar ping, which is where the name comes from. Faster when busy, red and double on error.'],
          ['Signal', 'One red dot on the rim while it works. Red is the only accent, so it always means “active”.'],
          ['Face', 'Eyes and smile are cut from whole device pixels and placed from the centre, so both eyes mirror exactly at every size.']]
          .map(([t, d]) => <div key={t} className="rounded-xl border border-line bg-card px-4 py-3"><div className="text-[13.5px] font-semibold">{t}</div><p className="mt-0.5 text-[12.5px] leading-relaxed text-mute">{d}</p></div>)}
      </div>
    </div>
  )
}

function Ladder() {
  return (
    <div className="space-y-3">
      {[['Dark', 'bg-black [--ring:#000]'], ['Light', 'bg-[#f1f1ee] [--ring:#f1f1ee]']].map(([n, cls]) => (
        <div key={n} className={cn('flex flex-wrap items-end gap-x-6 gap-y-5 overflow-x-auto rounded-2xl border border-line p-6', cls)}>
          {LADDER.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2"><OrbX id="blip" size={s} state="idle" role={s >= 28 ? 'builder' : undefined} /><span className={cn('font-mono text-[9.5px]', n === 'Light' ? 'text-black/40' : 'text-white/35')}>{s}</span></div>
          ))}
        </div>
      ))}
      <p className="text-xs text-dim">From 16 to 128 px: below 21 px the halo, ping, dot grid and signal are dropped, below 33 px the glow goes, and the role badge shows from 28 px. Eyes are never thinner than two device pixels.</p>
    </div>
  )
}

/* ------------------------------------------------------------------ roles ------------------------------------------------------------------ */
function Roles() {
  const [state, setState] = useState('thinking')
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">{STATES.map((s) => <button key={s} onClick={() => setState(s)} aria-pressed={state === s} className={cn('h-8 rounded-lg px-3 text-[12.5px] capitalize transition-colors', state === s ? 'bg-fg text-black' : 'bg-white/[0.06] text-mute hover:text-fg')}>{s}</button>)}</div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ROLE_IDS.map((r) => (
          <div key={r} className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-card p-6 text-center">
            <div className="grid h-28 place-items-center"><OrbX id="blip" size={88} state={state} role={r === 'chat' ? undefined : r} /></div>
            <div><div className="text-[15px] font-semibold">{ROLES[r].label} Blip</div><p className="mt-1 text-[12.5px] leading-relaxed text-mute">{ROLES[r].note}</p></div>
            <div className="mt-auto flex items-end gap-3">{[24, 32, 44].map((s) => <OrbX key={s} id="blip" size={s} state={state} role={r === 'chat' ? undefined : r} />)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InContext() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Demo label="Chat · answers" sim>
        <div className="space-y-3">
          <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-fg px-3.5 py-2.5 text-[13.5px] text-black">Why is my invoice higher this month?</div>
          <div className="flex items-start gap-3"><OrbX id="blip" size={32} state="speaking" /><div className="max-w-[82%] rounded-2xl rounded-bl-md border border-line bg-white/[0.03] px-3.5 py-2.5 text-[13.5px]">You resized pg-main to 8 GB on Nov 05, so it is billed at the new size from that day.</div></div>
          <div className="flex items-center gap-3"><OrbX id="blip" size={32} state="thinking" /><span className="flex gap-1">{[0, 1, 2].map((i) => <i key={i} className="size-1.5 animate-bounce rounded-full bg-dim" style={{ animationDelay: `${i * 120}ms` }} />)}</span></div>
        </div>
      </Demo>
      <Demo label="Website builder · working" sim>
        <div className="rounded-xl border border-line bg-black/30">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3"><OrbX id="blip" size={34} state="thinking" role="builder" /><div><div className="text-[13.5px] font-medium">Builder</div><div className="font-mono text-[11px] text-dim">Designing the menu section…</div></div></div>
          <div className="space-y-2 p-4">{['Hero · done', 'Menu · in progress', 'Booking form · queued'].map((l, i) => <div key={l} className="flex items-center gap-2.5 text-[12.5px] text-mute"><i className={cn('size-1.5 rounded-full', i === 0 ? 'bg-ok' : i === 1 ? 'bg-[var(--brand)]' : 'bg-white/20')} />{l}</div>)}</div>
        </div>
      </Demo>
      <Demo label="Dev · reads the code, finds the bug" sim>
        <div className="rounded-xl border border-line bg-black/40 font-mono text-[12px] leading-6">
          <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 font-sans"><OrbX id="blip" size={28} state="speaking" role="dev" /><span className="text-[13px] text-mute">Found it in <span className="font-mono text-fg">orders.ts:42</span></span></div>
          <div className="px-4 py-3"><div className="text-bad">TypeError: cannot read properties of undefined (reading 'total')</div><div className="text-dim">  at checkout (orders.ts:42:18)</div><div className="mt-2 text-ok">+ const total = cart?.total ?? 0</div></div>
        </div>
      </Demo>
      <Demo label="Game server · debugs the crash" sim>
        <div className="rounded-xl border border-line bg-black/40">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3"><OrbX id="blip" size={34} state="waiting" role="game" /><div><div className="text-[13.5px] font-medium">mc-survival</div><div className="font-mono text-[11px] text-dim">Tick lag spike · 3 plugins suspect</div></div></div>
          <div className="space-y-2 p-4 text-[12.5px]">{[['DynmapRenderer', '41% of tick time'], ['MobStacker', '18%'], ['ChunkLoader', '9%']].map(([a, b]) => <div key={a} className="flex justify-between text-mute"><span>{a}</span><span className="font-mono text-dim">{b}</span></div>)}</div>
        </div>
      </Demo>
    </div>
  )
}

/* ------------------------------------------------------------------ skins ------------------------------------------------------------------ */
function Card({ o, state, light, active, onUse }) {
  return (
    <div className={cn('flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card transition-colors', active ? 'border-white/50' : 'border-line hover:border-line-2')}>
      <div className={cn('relative grid h-56 place-items-center transition-colors', light ? 'bg-[#f1f1ee] [--ring:#f1f1ee]' : 'bg-black [--ring:#000]')}>
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
        <Button className="mt-auto" variant={active ? 'secondary' : 'default'} disabled={active} onClick={onUse}>{active ? <><Check />Active everywhere</> : 'Use this skin'}</Button>
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
      <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center gap-3 rounded-xl border border-line-2 bg-bg/90 px-3 py-2.5 backdrop-blur">
        <div className="flex flex-wrap gap-1">{STATES.map((s) => <button key={s} onClick={() => setState(s)} className={cn('h-8 rounded-lg px-3 text-[12.5px] capitalize transition-colors', state === s ? 'bg-fg text-black' : 'bg-white/[0.06] text-mute hover:text-fg')}>{s}</button>)}</div>
        <button onClick={() => setLight(!light)} aria-label="Toggle light stage" className="ml-auto flex h-8 items-center gap-2 rounded-lg border border-line-2 px-3 text-[12.5px] text-mute transition-colors hover:text-fg">{light ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}{light ? 'Dark stage' : 'Light stage'}</button>
      </div>
      <p className="text-[12.5px] text-dim">Alternative skins on the same contract (size, state, face). The Blip is the default; any skin you pick here replaces it everywhere in this mock-up.</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ORBS.map((o) => <Card key={o.id} o={o} state={state} light={light} active={sel === o.id} onUse={() => { setSel(o.id); toast.success(`${o.name} is now the Blipmade assistant`) }} />)}
      </div>
    </>
  )
}

function Spec() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[['One contract', 'Every Blip takes a size, a state and an optional role. Skins render in the same 1:1 box with the same face and the same six states, so they are drop-in replacements for one another.'],
        ['Roles', 'Chat has no mark. Builder, Dev and Game add a small chip on the lower right (wand, code, gamepad) from 28 px up. The role changes what the Blip is for, never its character.'],
        ['States', 'Idle: blinks, glances, smiles on hover. Thinking: dots rise, ping speeds up, red signal, eyes scan. Speaking: eyes pulse. Happy: arcs, double ping. Waiting: slow, eyes lowered, no ping. Error: red hollow signal, double red ping, eyes droop.'],
        ['Cursor follow', 'Eyes drift towards the pointer, capped at a few percent of the disc, and return to their idle glance after 2.5 s. Off under reduced motion and on touch.'],
        ['Pixel grid', 'Lengths are rounded to one device pixel (read from devicePixelRatio, so it also holds when the page is zoomed). Eye width, height and gap are multiples of it and both eyes are placed from the centre, so they mirror exactly.'],
        ['Cost', 'The Blip is pure CSS (transforms and opacity). The ping, dot grid and signal switch off below 21 px; every animation stops under reduced motion.']]
        .map(([t, d]) => <div key={t} className="rounded-xl border border-line bg-card p-4"><div className="text-[14px] font-semibold">{t}</div><p className="mt-1 text-[13px] leading-relaxed text-mute">{d}</p></div>)}
    </div>
  )
}

export default function Orbs() {
  return <Doc title="Blip lab" lead="Blips are the AI agents of Blipmade: the chat assistant, the website builder, the developer agent and the game-server debugger. One character, four roles, built to stay crisp from 16 px to 128 px." sections={[
    { id: 'blip', title: 'The Blip', note: 'states, roles, light and dark', node: <Stage /> },
    { id: 'ladder', title: 'Pixel ladder', note: '16 to 128 px', node: <Ladder /> },
    { id: 'roles', title: 'Roles', node: <Roles /> },
    { id: 'context', title: 'In context', node: <InContext /> },
    { id: 'skins', title: 'Skins', note: '20 alternative constructions', node: <Skins /> },
    { id: 'spec', title: 'How they work', node: <Spec /> },
  ]} />
}
