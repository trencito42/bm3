/* Screen 32 - BM3 motion & interaction lab.
   Not a gallery of effects: the interaction language BM3 already had (the button that
   becomes a form, the chat launcher that becomes a panel, MorphAction, DotText, DotRail,
   the menus and drawers) is extracted here into named, reusable components, each one
   shown with its states and the job it is for.

   Everything in this page is a local demonstration. Nothing here calls a production
   endpoint, and a success is only shown after the mocked work has actually finished. */
import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, ChevronRight, Copy, RotateCw, Terminal, Trash2 } from 'lucide-react'
import { Button } from '../components/ui.jsx'
import { Demo } from '../workspace/Doc.jsx'
import { ActionConfirmation, AnimatedValue, AsyncActionButton, BottomSheet, ContentReveal, CopyFeedback, InlineUndo, MorphActionSurface, ProgressJourney, SmartMenu, StatusTransition } from '../components/feedback.jsx'
import { DotRail } from './kit.jsx'
import { cn } from '../lib/utils'

const Section = ({ id, title, for: use, children, states }) => (
  <section id={id} className="scroll-mt-6">
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
      <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      <span className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{use}</span>
    </div>
    <div className="space-y-4">
      {children}
      {states && (
        <div className="rounded-xl border border-line bg-card p-4">
          <div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">States</div>
          <ul className="mt-2 grid gap-1.5 text-[13px] leading-relaxed text-mute sm:grid-cols-2">
            {states.map((s) => <li key={s} className="flex gap-2"><span className="mt-[7px] size-1 shrink-0 rounded-full bg-white/25" />{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  </section>
)

/* ------------------------------------------------------------------ 1. morph */
function MorphDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <MorphActionSurface
        label="Open console"
        title="blipmade-prod · console"
        description="The button you pressed travels into the panel and becomes it. Closing travels back."
        trigger={<Button variant="outline"><Terminal className="size-4" />Open console</Button>}
      >
        {(close) => (
          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-line bg-black/50 p-4 font-mono text-[12.5px] leading-6 text-mute">
              root@blipmade-prod:~$ systemctl status blipmade-api<br />
              <span className="text-ok">● active (running)</span><br />
              <span className="text-dim">Main PID: 4821 · uptime 12d 04h</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={close}>Close</Button>
              <Button variant="ghost" onClick={close}>Dismiss</Button>
            </div>
          </div>
        )}
      </MorphActionSurface>
      <p className="mt-3 text-[13px] text-dim">The source keeps its own space while the panel is open, so the page does not jump when it closes.</p>
    </>
  )
}

/* ------------------------------------------------------------------ 2. async */
function AsyncDemo() {
  const [log, setLog] = React.useState([])
  const run = (label, fail) => async () => {
    setLog((l) => [...l, label])
    if (fail) throw new Error('failed')
    await new Promise((r) => setTimeout(r, 700))
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <AsyncActionButton icon={RotateCw} onAction={run('restart')}>Restart</AsyncActionButton>
        <AsyncActionButton variant="outline" icon={Archive} onAction={run('archive')}>Archive</AsyncActionButton>
        <AsyncActionButton variant="outline" simulateFailure onAction={run('migrate', true)}>Migrate</AsyncActionButton>
      </div>
      <p className="text-[13px] text-dim">The third one fails on purpose, so the error state is visible. The button never changes size: the widest of the three labels sets its width from the first frame.</p>
      {log.length > 0 && <div className="font-mono text-[11.5px] text-dim">called: {log.join(' · ')}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ 3. confirmation */
function ConfirmDemo() {
  const [done, setDone] = React.useState([])
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <ActionConfirmation risk="low" label="Restart" icon={RotateCw} onConfirm={() => setDone((d) => [...d, 'restart'])} />
        <ActionConfirmation risk="medium" label="Change plan" onConfirm={() => setDone((d) => [...d, 'plan'])} />
        <ActionConfirmation risk="high" label="Delete service" requireText="Delete" confirmLabel="Delete it" description="The service, its files and its backups are removed. This cannot be undone." onConfirm={() => setDone((d) => [...d, 'delete'])} />
      </div>
      <p className="text-[13px] text-dim">Three levels of friction, chosen by the risk of the action and not by the size of the button. A reversible action asks once in place; a destructive one asks for the word.</p>
      {done.length > 0 && <div className="font-mono text-[11.5px] text-dim">confirmed: {done.join(' · ')}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ 4. undo */
function UndoDemo() {
  const [state, setState] = React.useState('idle')
  const [msg, setMsg] = React.useState('')
  return (
    <div className="space-y-3">
      <Button variant="outline" icon={Archive} onClick={() => { setMsg('stefan.dev was archived.'); setState('done') }}>Archive a domain</Button>
      {state === 'done' && <InlineUndo message={msg} onUndo={() => { setState('idle'); setMsg('') }} />}
      <p className="text-[13px] text-dim">The undo is offered right where the action happened, with the time it has left on it. No toast, no modal.</p>
    </div>
  )
}

/* ------------------------------------------------------------------ 5. status */
const STATUSES = ['provisioning', 'running', 'restarting', 'stopped', 'failed', 'suspended']
function StatusDemo() {
  const [i, setI] = React.useState(1)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-black/30 px-4 py-3">
        {STATUSES.map((s) => <StatusTransition key={s} status={s} />)}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setI((v) => (v + 1) % STATUSES.length)}>Next state</Button>
        <StatusTransition status={STATUSES[i]} />
      </div>
      <p className="text-[13px] text-dim">One pulse when the state changes, then the new state simply is. A stopped service is grey, not red: stopping something on purpose is not a failure.</p>
    </div>
  )
}

/* ------------------------------------------------------------------ 6. journey */
const STAGES = [
  { id: 'queue', label: 'Queued', note: 'Waiting for a free node' },
  { id: 'disk', label: 'Disk', note: 'Volume attached' },
  { id: 'image', label: 'Image', note: 'Pterodactyl image pulled' },
  { id: 'install', label: 'Install', note: 'Container started' },
  { id: 'ready', label: 'Ready', note: 'Address is live' },
]
function JourneyDemo() {
  const [cur, setCur] = React.useState(0)
  const [state, setState] = React.useState('run')
  React.useEffect(() => {
    if (state !== 'run') return
    const t = setTimeout(() => setCur((c) => {
      if (c >= STAGES.length) { setState('done'); return c }
      return c + 1
    }), 900)
    return () => clearTimeout(t)
  }, [cur, state])
  return (
    <div className="space-y-4">
      <ProgressJourney stages={STAGES} current={cur} state={state} />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => { setCur(0); setState('run') }}>Run again</Button>
        <Button size="sm" variant="outline" onClick={() => { setCur(3); setState('fail') }}>Show a failure</Button>
        <DotRail value={cur / STAGES.length} state={state === 'fail' ? 'fail' : state === 'done' ? 'ok' : 'run'} />
      </div>
      <p className="text-[13px] text-dim">The stages are the real stages of a deployment, in the order they happen. Only the stage that is running moves.</p>
    </div>
  )
}

/* ------------------------------------------------------------------ 7. reveal */
function RevealDemo() {
  const [state, setState] = React.useState('ready')
  const [refetch, setRefetch] = React.useState(0)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {['loading', 'ready', 'empty', 'error'].map((s) => (
          <Button key={s} size="sm" variant={state === s ? 'default' : 'outline'} onClick={() => setState(s)}>{s}</Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => setRefetch((r) => r + 1)}>Refetch ({refetch})</Button>
      </div>
      <ContentReveal
        state={state}
        skeleton={<div className="h-[92px] rounded-xl border border-line bg-card p-4"><div className="h-3 w-40 rounded bg-white/10" /><div className="mt-3 h-3 w-full rounded bg-white/[0.07]" /><div className="mt-2 h-3 w-2/3 rounded bg-white/[0.07]" /></div>}
        empty={<div className="rounded-xl border border-dashed border-line-2 p-10 text-center text-[13px] text-mute">Nothing here yet.</div>}
        error={<div className="rounded-xl border border-bad/25 bg-bad/[0.06] p-6 text-center text-[13px] text-bad">Could not load. Your services are fine.</div>}
      >
        <div className="rounded-xl border border-line bg-card p-4">
          <div className="text-[14px] font-medium">Content that was loaded</div>
          <div className="mt-1 text-[13px] text-mute">The reveal animation plays once. A refetch does not replay it, because the content did not leave.</div>
        </div>
      </ContentReveal>
    </div>
  )
}

/* ------------------------------------------------------------------ 8. smart menu */
function MenuDemo() {
  const [sheet, setSheet] = React.useState(false)
  const [last, setLast] = React.useState('')
  const items = [
    [RotateCw, 'Restart', () => setLast('Restart')],
    [Terminal, 'Open console', () => setLast('Open console')],
    [Copy, 'Copy address', () => setLast('Copy address')],
    '-',
    [Trash2, 'Delete', () => setLast('Delete'), true],
  ]
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-lg border border-line bg-card px-3 py-2 text-[13.5px]">pg-primary</span>
        <SmartMenu items={items} title="pg-primary" sub="pg-primary.db.blipmade.com" />
        <Button size="sm" variant="outline" onClick={() => setSheet(true)}>Open the sheet</Button>
      </div>
      {last && <div className="font-mono text-[11.5px] text-dim">last action: {last}</div>}
      <p className="text-[13px] text-dim">One item list, two surfaces: a menu next to the row on a desktop, a bottom sheet with 48 px rows on a phone.</p>
      <BottomSheet open={sheet} onOpenChange={setSheet} title="pg-primary" sub="pg-primary.db.blipmade.com">
        {items.map((it, i) => {
          if (it === '-') return <div key={i} className="mx-3 my-1 h-px bg-line" />
          const I = it[0]
          return (
            <button key={it[1]} onClick={() => { setSheet(false); setLast(it[1]) }} className={cn('flex min-h-12 w-full items-center gap-3.5 rounded-xl px-3 text-left text-[15px] outline-none transition-colors active:bg-hover focus-visible:bg-hover', it[3] ? 'text-bad' : 'text-fg')}>
              {I && <I className="size-[18px] shrink-0 text-mute" />}<span className="min-w-0 flex-1 truncate">{it[1]}</span>
            </button>
          )
        })}
      </BottomSheet>
    </div>
  )
}

/* ------------------------------------------------------------------ 9. animated value */
function ValueDemo() {
  const [v, setV] = React.useState(72)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <AnimatedValue value={v} format={(n) => n + '%'} delta className="text-[28px] font-semibold tracking-tight text-fg" />
        <Button size="sm" variant="outline" onClick={() => setV((x) => Math.max(0, Math.min(100, x + (x > 50 ? -9 : 11))))}>Change the number</Button>
        <Button size="sm" variant="ghost" onClick={() => setV(72)}>Back to 72</Button>
      </div>
      <p className="text-[13px] text-dim">A metric arrives, it does not perform. No rolling digits, no counting up: the old number leaves and the new one comes in, and a small delta says which way it went.</p>
    </div>
  )
}

/* ------------------------------------------------------------------ 10. copy */
function CopyDemo() {
  return (
    <div className="space-y-3">
      <CopyFeedback value="pg-primary.db.blipmade.com" display="pg-primary.db.blipmade.com" label="host" />
      <CopyFeedback value="postgresql://blipmade:secret@pg-primary.db.blipmade.com:5432/blipmade" display="postgresql://blipmade:••••@pg-primary.db.blipmade.com:5432/blipmade" label="dsn" />
      <p className="text-[13px] text-dim">The confirmation lives on the control, so nothing else on the page moves and no toast covers what you were reading.</p>
    </div>
  )
}

/* ------------------------------------------------------------------ page */
export default function MotionLab() {
  const nav = useNavigate()
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-12 px-4 py-6 sm:px-6 md:py-8">
        <header>
          <h1 className="text-[30px] font-semibold tracking-tight">Motion &amp; interaction lab</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-mute">
            The interaction language of BM3, extracted into named components. Every example below is a local
            demonstration: nothing here calls a server, and a success is only shown after the mocked work has
            finished. The durations come from the tokens in <code className="font-mono text-[13px] text-fg">src/index.css</code>;
            the new ones live in <code className="font-mono text-[13px] text-fg">src/design/tokens.css</code>.
          </p>
        </header>

        <Section id="morph" title="MorphActionSurface" for="a source that opens into a surface" states={['Closed: only the trigger exists', 'Opening: the trigger travels into the panel', 'Open: the panel is a panel, and Escape closes it', 'Reduced motion: the panel simply appears']}>
          <MorphDemo />
        </Section>

        <Section id="async" title="AsyncActionButton" for="idle, pending, success, error" states={['Idle: the label of the action', 'Pending: the work is running, the size does not change', 'Success: only after the work really finished', 'Error: the action can be tried again']}>
          <AsyncDemo />
        </Section>

        <Section id="confirm" title="ActionConfirmation" for="risk-aware confirmation" states={['Low risk: one question, asked in place', 'Medium risk: a dialog with the consequence in writing', 'High risk: a dialog, and the name has to be typed', 'Reversible actions skip the dialog entirely']}>
          <ConfirmDemo />
        </Section>

        <Section id="undo" title="InlineUndo" for="a short, usable way back" states={['Shown after the action succeeded', 'The line is the time that is left', 'Undo puts everything back', 'It disappears on its own']}>
          <UndoDemo />
        </Section>

        <Section id="status" title="StatusTransition" for="states that really changed" states={['Provisioning, starting, restarting: a spinner', 'Running: a green dot', 'Stopped: grey, because you stopped it', 'Failed: red, and it needs you', 'Suspended: amber']}>
          <StatusDemo />
        </Section>

        <Section id="journey" title="ProgressJourney" for="operations with stages" states={['Every stage has the meaning the operation gives it', 'One stage moves at a time', 'A failure stops on the stage that failed', 'Done: the last stage is the last stage']}>
          <JourneyDemo />
        </Section>

        <Section id="reveal" title="ContentReveal" for="skeleton to content" states={['Loading: the shape of the page', 'Ready: the content arrives once', 'Empty and error: the page says what it means', 'A refetch never replays the reveal']}>
          <RevealDemo />
        </Section>

        <Section id="smartmenu" title="SmartPopover / SmartSheet" for="one action list, two surfaces" states={['Desktop: a menu next to the row', 'Phone: a bottom sheet with 48 px rows', 'The same items and the same order', 'Escape and the backdrop close it']}>
          <MenuDemo />
        </Section>

        <Section id="value" title="AnimatedValue" for="metrics that changed" states={['The new figure arrives', 'The old figure leaves', 'The delta says which way it went', 'No rolling digits, ever']}>
          <ValueDemo />
        </Section>

        <Section id="copy" title="CopyFeedback" for="a value that was copied" states={['The value stays where it is', 'A small chip says it was copied', 'A blocked clipboard says so instead', 'Announced politely for screen readers']}>
          <CopyDemo />
        </Section>

        <section className="border-t border-line pt-6">
          <h2 className="text-[17px] font-semibold tracking-tight">Where these are used</h2>
          <ul className="mt-3 grid gap-2 text-[13.5px] leading-relaxed text-mute sm:grid-cols-2">
            <li><b className="font-medium text-fg">Screen 30 · Overview</b> — AsyncActionButton for paying, InlineUndo after it, StatusTransition for every service state, AnimatedValue for the platform figures.</li>
            <li><b className="font-medium text-fg">Screen 31 · Apps &amp; databases</b> — AsyncActionButton for retrying a failed service, SmartMenu for the row actions, CopyFeedback for the address, StatusTransition for the state column.</li>
            <li><b className="font-medium text-fg">Still to be ported</b> — MorphActionSurface replaces the pre-register button in the coming-soon page, and ProgressJourney replaces the ad-hoc provisioning bars in Deploy Studio.</li>
          </ul>
          <Button className="mt-4" variant="outline" onClick={() => nav('/ds/overview')}>See them in the overview<ChevronRight className="size-4" /></Button>
        </section>

        <section className="border-t border-line pt-6">
          <h2 className="text-[17px] font-semibold tracking-tight">What to port to production, and in which order</h2>
          <ol className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed text-mute">
            <li><b className="font-medium text-fg">1 · AsyncActionButton and CopyFeedback.</b> Both are self-contained and change nothing visually outside the control. They remove the two worst failures of the current customer app: a success that is shown before the work finished, and a copy button that gives no answer.</li>
            <li><b className="font-medium text-fg">2 · StatusTransition and the state vocabulary.</b> One component decides what a state looks like, so "stopped" can never be painted as an error. This is the piece the whole list depends on, and it is the smallest change with the largest effect.</li>
            <li><b className="font-medium text-fg">3 · SmartMenu.</b> One item list, two surfaces: a menu on a desktop and a bottom sheet on a phone. The list is written once, so a phone can never end up with fewer actions than a desktop.</li>
            <li><b className="font-medium text-fg">4 · ActionConfirmation and InlineUndo.</b> The confirmation level follows the risk, and anything reversible skips the dialog and gets an undo instead. Both need the real API to know what is reversible.</li>
            <li><b className="font-medium text-fg">5 · ContentReveal and ProgressJourney.</b> The skeleton has to match the real layout, and a long operation has to show its stages. The last one is the largest job, because the stages have to agree with what the backend actually does.</li>
            <li><b className="font-medium text-fg">6 · MorphActionSurface and AnimatedValue.</b> The two pieces of theatre. They are last on purpose: a morph on top of an unstable layout looks like a bug, and a number that rolls is decoration, not information.</li>
          </ol>
          <p className="mt-4 text-[13px] leading-relaxed text-dim">
            Nothing here needs a new dependency. The components use the tokens that BM3 already
            has, plus the durations and easings added in <code className="font-mono text-[12px] text-mute">src/design/tokens.css</code>.
          </p>
        </section>

        <section className="border-t border-line pt-6">
          <h2 className="text-[17px] font-semibold tracking-tight">Open questions and assumptions</h2>
          <ul className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed text-mute">
            <li><b className="font-medium text-fg">The morph animates geometry.</b> Every other animation here moves opacity or a transform, so it stays on the compositor. A shared surface has to change its size and its place, so <code className="font-mono text-[12px] text-mute">left/top/width/height</code> are transitioned for that one component. It is the single exception, and it is switched off entirely under reduced motion.</li>
            <li><b className="font-medium text-fg">The success state has a life of a few seconds.</b> If the page is reloaded, the success is gone. A production version should keep the result of the last action, not just the last few seconds of it.</li>
            <li><b className="font-medium text-fg">The clipboard can be blocked.</b> The demo says so instead of pretending. A browser that blocks the clipboard on an insecure origin cannot be helped by any component, so the message has to be honest.</li>
            <li><b className="font-medium text-fg">The undo window is eight seconds.</b> That is long enough to read and short enough not to sit on the screen. It assumes that undo really puts everything back, which is only true once the API supports it.</li>
            <li><b className="font-medium text-fg">The production app was not available here.</b> No customer-app screenshots and no production source were in this workspace, so these components were matched against the BM3 interaction language and against the behaviour the brief describes, not against the live screens.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
