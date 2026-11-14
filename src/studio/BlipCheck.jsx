/* A health check told by a Blip, as a log. The Blip works through the checks one by one (each line decodes in, runs, then settles on its result),
   and ends with one sentence in plain words and the next step. Byte does servers, Glitch does game servers.
   The results stay scannable rows, not chat bubbles: the Blip adds the verdict, it does not replace the facts.
   Ticks are green when fine, amber when worth a look, red only when broken. Mock data; `scenario` picks which run to show. */
import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Check, Loader2, RotateCw, X } from 'lucide-react'
import { Button, Segmented } from '../components/ui.jsx'
import { Orb } from '../builder/FxBits.jsx'
import { Decode, eyebrow } from './kit.jsx'
import { cn } from '../lib/utils'

const calm = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const MARK = { ok: [Check, 'bg-ok/15 text-ok'], warn: [AlertTriangle, 'bg-warn/15 text-warn'], bad: [X, 'bg-bad/15 text-bad'] }
const stamp = (i) => `00:0${Math.floor((i * 7) / 10)}.${(i * 7) % 10}`

/* a row of small bars, for readings that have a history (ticks over 1, 5 and 15 minutes) */
const Bars = ({ items, max }) => (
  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">{items.map(([l, v]) => (
    <span key={l} className="flex items-center gap-2 font-mono text-[11px] text-dim"><span className="w-12">{l}</span><span className="h-1 w-20 overflow-hidden rounded-full bg-white/[0.08]"><i className={cn('block h-full rounded-full', v / max > 0.9 ? 'bg-ok' : v / max > 0.75 ? 'bg-warn' : 'bg-bad')} style={{ width: `${Math.min(100, (v / max) * 100)}%` }} /></span><span className="tabular-nums text-mute">{v}</span></span>
  ))}</div>
)

export function BlipCheck({ role = 'dev', name = 'Byte', title, intro, runs, actions = {}, className }) {
  const keys = Object.keys(runs)
  const [scenario, setScenario] = useState(keys[0])
  const [n, setN] = useState(-1)                 // -1 idle; 0..len-1 = index of the line that is running; len = finished
  const t = useRef(0)
  const run = runs[scenario], steps = run.steps, done = n >= steps.length, running = n >= 0 && !done
  const worst = steps.some((s) => s.state === 'bad') ? 'bad' : steps.some((s) => s.state === 'warn') ? 'warn' : 'ok'
  useEffect(() => () => clearTimeout(t.current), [])
  useEffect(() => { if (!running) return; t.current = setTimeout(() => setN((x) => x + 1), calm() ? 0 : 950); return () => clearTimeout(t.current) }, [n, running])
  const start = () => { clearTimeout(t.current); setN(0) }
  const pick = (k) => { clearTimeout(t.current); setScenario(k); setN(-1) }
  return (
    <section className={cn('overflow-hidden rounded-xl border border-line bg-card', className)} aria-label={title}>
      <header className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <Orb size={44} role={role} state={running ? 'thinking' : done ? (worst === 'ok' ? 'happy' : 'waiting') : 'idle'} className="shrink-0" />
        <div className="min-w-0 flex-1"><div className={eyebrow}>{name} · {title}</div><p className="mt-1 text-[13.5px] text-mute">{done ? <Decode key={scenario + 'v'} per={11} tone={worst === 'bad' ? 'bad' : 'fg'} text={run.verdict} /> : running ? `${steps[n].doing}…` : intro}</p></div>
        <div className="flex shrink-0 items-center gap-2">
          {keys.length > 1 && <Segmented value={scenario} onValueChange={(v) => v && pick(v)} options={keys.map((k) => [k, runs[k].label])} />}
          <Button variant={done ? 'outline' : 'default'} loading={running} onClick={start}>{done ? <><RotateCw />Check again</> : n < 0 ? 'Run the check' : 'Checking'}</Button>
        </div>
      </header>
      {n >= 0 && (
        <ol className="border-t border-line bg-black/30 px-4 py-3 font-mono text-[12px] leading-6 sm:px-5" aria-live="polite">
          {steps.slice(0, Math.min(steps.length, n + 1)).map((s, i) => {
            const live = i === n && running, [I, c] = MARK[s.state]
            return (
              <li key={s.label} className="step-in flex gap-3 py-1.5">
                <span className="hidden w-12 shrink-0 text-dim sm:block">{stamp(i)}</span>
                <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full', live ? 'bg-white/10 text-fg' : c)}>{live ? <Loader2 className="size-3 animate-spin" /> : <I className="size-3" strokeWidth={2.6} />}</span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block font-sans text-[13.5px] font-medium', live ? 'text-mute' : s.state === 'bad' ? 'text-bad' : 'text-fg')}>{live ? <Decode text={s.doing + '…'} per={14} /> : s.label}</span>
                  {!live && <span className="block text-[12px] text-dim">{s.detail}</span>}
                  {!live && s.bars && <Bars items={s.bars} max={s.max} />}
                </span>
                {!live && s.value && <span className={cn('shrink-0 tabular-nums', s.state === 'ok' ? 'text-ok' : s.state === 'warn' ? 'text-warn' : 'text-bad')}>{s.value}</span>}
              </li>
            )
          })}
        </ol>
      )}
      {done && (
        <footer className="step-in flex flex-wrap items-start gap-3 border-t border-line p-4 sm:p-5">
          <Orb size={28} role={role} state={worst === 'ok' ? 'happy' : 'thinking'} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1"><p className="text-[14px] leading-relaxed"><b className="font-semibold">{name}:</b> <span className="text-mute">{run.say}</span></p>
            {run.next?.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{run.next.map(([l, primary]) => <Button key={l} size="sm" variant={primary ? 'default' : 'outline'} onClick={() => actions[l]?.()}>{l}</Button>)}</div>}</div>
        </footer>
      )}
    </section>
  )
}

/* ------------------------------------------------------------ the two checks ------------------------------------------------------------ */
const VPS_RUNS = {
  ok: { label: 'All fine', verdict: 'Everything on our side is working.', say: 'the server is up and SSH answers from our network. If you still cannot log in, the problem is on the way in: check the key, the user (debian), the address and port shown above, and the firewall or network you connect from.', next: [['Open the console', true], ['Show the SSH command']],
    steps: [
      { label: 'The server is active on your account', doing: 'Looking up the server and its subscription', detail: 'It is built and its subscription is in order.', state: 'ok' },
      { label: 'The machine is running', doing: 'Asking the host if the machine is up', detail: 'Up for 7 hours 51 minutes.', value: '7h 51m', state: 'ok' },
      { label: 'The load is normal', doing: 'Reading processor and memory', detail: 'Processor 1%, memory 52%.', value: '1% · 52%', state: 'ok' },
      { label: 'SSH answers on our network', doing: 'Knocking on port 22101 from our side', detail: 'It answered in 14 ms.', value: '14 ms', state: 'ok' },
    ] },
  bad: { label: 'SSH is closed', verdict: 'The machine runs, but SSH does not answer.', say: 'the server itself is healthy, so nothing is lost. SSH is not answering on port 22101: either the service stopped inside the machine or your firewall rule for that port was removed. Open the console (it works without SSH) and I will show you what to run.', next: [['Open the console', true], ['Check the firewall'], ['Talk to a person']],
    steps: [
      { label: 'The server is active on your account', doing: 'Looking up the server and its subscription', detail: 'It is built and its subscription is in order.', state: 'ok' },
      { label: 'The machine is running', doing: 'Asking the host if the machine is up', detail: 'Up for 7 hours 51 minutes.', value: '7h 51m', state: 'ok' },
      { label: 'The load is high', doing: 'Reading processor and memory', detail: 'Processor 12%, memory 91%. Not the cause, but worth a look.', value: '12% · 91%', state: 'warn' },
      { label: 'SSH does not answer on our network', doing: 'Knocking on port 22101 from our side', detail: 'No answer after 5 seconds, tried three times.', value: 'timeout', state: 'bad' },
    ] },
}
const MC_RUNS = {
  ok: { label: 'No lag', verdict: 'The server keeps 20 ticks a second.', say: 'there is no lag from the server. If players still feel it, it is their connection or a heavy area of the map, not the machine. I can watch for the next hour and tell you if it dips.', next: [['Watch for an hour', true], ['Open the console']],
    steps: [
      { label: 'The server answered', doing: 'Asking the running server', detail: 'Paper 1.21.4, 3 players online.', state: 'ok' },
      { label: 'Ticks per second', doing: 'Measuring how many ticks it keeps', detail: '20 is healthy. It has held 20 for the last 15 minutes.', value: '20.0', state: 'ok', max: 20, bars: [['1 min', 20], ['5 min', 20], ['15 min', 20]] },
      { label: 'Memory', doing: 'Reading how full its memory is', detail: '789 of 2048 MB in use.', value: '39%', state: 'ok' },
      { label: 'Processor', doing: 'Reading the processor', detail: 'Plenty of room.', value: '2%', state: 'ok' },
    ] },
  bad: { label: 'Lagging', verdict: 'It is lagging: 14 ticks a second and memory is nearly full.', say: 'the server is dropping ticks because it is out of memory, and one plugin (DynmapRenderer) is using 41% of every tick. Lowering its render threads fixes most of it without a restart; more memory fixes the rest.', next: [['Apply the fix', true], ['Raise memory to 4 GB'], ['Show the profile']],
    steps: [
      { label: 'The server answered', doing: 'Asking the running server', detail: 'Paper 1.21.4, 14 players online.', state: 'ok' },
      { label: 'Ticks per second', doing: 'Measuring how many ticks it keeps', detail: '20 is healthy. It has been falling for 15 minutes.', value: '14.2', state: 'bad', max: 20, bars: [['1 min', 14.2], ['5 min', 16.8], ['15 min', 19.1]] },
      { label: 'Memory is nearly full', doing: 'Reading how full its memory is', detail: '1980 of 2048 MB in use.', value: '97%', state: 'bad' },
      { label: 'Processor', doing: 'Reading the processor', detail: 'One core is busy most of the time.', value: '88%', state: 'warn' },
    ] },
}
export const VpsCheck = (p) => <BlipCheck role="dev" name="Byte" title="Cannot connect?" intro="I check the four things that stop you from logging in, from our side of the network." runs={VPS_RUNS} {...p} />
export const LagCheck = (p) => <BlipCheck role="game" name="Glitch" title="Is the server lagging?" intro="I ask the running server how many ticks a second it keeps (20 is healthy) and how full its memory is." runs={MC_RUNS} {...p} />
