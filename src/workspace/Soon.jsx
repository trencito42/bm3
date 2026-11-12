import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ExternalLink, Monitor, RotateCw, Smartphone } from 'lucide-react'
import { Button, Segmented } from '../components/ui.jsx'
import { Doc } from './Doc.jsx'
import { cn } from '../lib/utils'

const url = (path) => `${location.pathname}#/bare/soon${path}`
const PAGE = [['', 'Page', 'The headline changes word and glitches now and then; the Blips take turns; the log types itself once.'], ['?s=form', 'Form', 'The button travels to the middle and becomes the form. Esc, the cross or a click outside sends it back into the button.'], ['?s=sent', 'Check your inbox', 'After name and email. Resend unlocks after 30 seconds; the address can be changed.'], ['?s=exists', 'Already registered', 'Offers to send the link again instead of an error.'], ['?s=in', 'You are in', 'After a social account: no password step at all.']]
const PASS = [['/password', 'Choose a password', 'Strength as a row of dots, three rules that tick as you type. The Blip shuts its eyes while you type.'], ['/password?s=done', 'You are in', 'The end of the email path.'], ['/password?s=expired', 'Link expired', 'One button sends a fresh link.'], ['/password?s=used', 'Link already used', 'Same recovery, different reason.']]

function Frames({ items }) {
  const [i, setI] = useState(0), [view, setView] = useState('desktop'), [run, setRun] = useState(0)
  const [path, , note] = items[i]
  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="State" className="flex flex-wrap gap-1.5">{items.map(([p, l], k) => <button key={p} role="tab" aria-selected={k === i} onClick={() => { setI(k); setRun((n) => n + 1) }} className={cn('h-8 rounded-full border px-3 text-[12.5px] outline-none transition-[border-color,background-color,color] duration-150 focus-visible:border-white/50', k === i ? 'border-fg/70 bg-white/[0.07] text-fg' : 'border-line-2 text-mute hover:border-white/25 hover:text-fg')}>{l}</button>)}</div>
      <div className="overflow-hidden rounded-xl border border-line bg-black">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-3 py-2"><span className="min-w-0 truncate font-mono text-[11px] text-dim">/soon{path}</span><div className="flex items-center gap-2"><Segmented value={view} onValueChange={(v) => v && setView(v)} options={[['desktop', <span key="d" className="flex items-center gap-1.5"><Monitor className="size-3.5" />Desktop</span>], ['mobile', <span key="m" className="flex items-center gap-1.5"><Smartphone className="size-3.5" />Mobile</span>]]} /><Button size="sm" variant="ghost" onClick={() => setRun((n) => n + 1)}><RotateCw />Replay</Button><Button size="sm" variant="ghost" onClick={() => window.open(url(path), '_blank', 'noopener')}><ExternalLink />Open</Button></div></div>
        <div className="grid place-items-center bg-[#050506] p-3 sm:p-5"><iframe key={path + view + run} title={items[i][1]} src={url(path)} className={cn('block rounded-lg border border-line-2 bg-bg', view === 'mobile' ? 'h-[760px] w-[390px] max-w-full' : 'h-[760px] w-full')} /></div>
      </div>
      <p className="text-[13.5px] text-mute">{note}</p>
    </div>
  )
}

function Flow() {
  const nav = useNavigate()
  const steps = [['Coming soon page', 'One button.'], ['The button becomes the form', 'Name and email, or Google, GitHub, Discord.'], ['Check your inbox', 'One email with one link. Social accounts skip to the end.'], ['Choose a password', 'On its own page, from the link.'], ['You are in', 'We email on opening day.']]
  return (
    <div className="space-y-5">
      <ol className="grid gap-3 sm:grid-cols-5">{steps.map(([t, d], i) => <li key={t} className="rounded-xl border border-line bg-card p-4"><div className="font-mono text-[10.5px] text-dim">0{i + 1}</div><div className="mt-2 text-[13.5px] font-medium leading-snug">{t}</div><p className="mt-1 text-[12.5px] leading-snug text-mute">{d}</p></li>)}</ol>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13.5px]"><button onClick={() => nav('/soon')} className="link-grow inline-flex items-center gap-1 text-fg">Open the page in the workspace<ArrowRight className="size-3.5" /></button><button onClick={() => nav('/ds/emails')} className="link-grow inline-flex items-center gap-1 text-fg">See the email (Account, Pre-registration)<ArrowRight className="size-3.5" /></button></div>
    </div>
  )
}

export default function SoonDoc() {
  return (
    <Doc title="Coming soon" lead="The page people see before launch, and the whole pre-registration path: the button turns into the form in the middle of the screen, an email arrives with a link, the link opens a page to choose a password. Every state below is the real page in a frame; switch to Mobile to see it on a phone." sections={[
      { id: 'flow', title: 'The path', node: <Flow /> },
      { id: 'page', title: 'The page and the form', note: 'press Pre-register in the frame, or pick a state', node: <Frames items={PAGE} /> },
      { id: 'password', title: 'Choose a password', note: 'where the link in the email lands', node: <Frames items={PASS} /> },
      { id: 'rules', title: 'Rules', node: (
        <ul className="space-y-3 text-[14px] leading-relaxed text-mute">
          <li><b className="font-medium text-fg">One button, one form, one email.</b> No password on the first screen: asking for less is why people finish.</li>
          <li><b className="font-medium text-fg">The form grows out of the button.</b> It is the same element travelling to the centre, so nobody wonders where it came from, and it returns into the button when closed.</li>
          <li><b className="font-medium text-fg">Effects mark moments.</b> The headline glitches every few seconds, results arrive as dot-matrix words, sentences decode once. Labels, fields and errors are plain.</li>
          <li><b className="font-medium text-fg">Nothing invented.</b> No countdown, no "4,812 people ahead of you", no launch discount, until those are real.</li>
          <li><b className="font-medium text-fg">Never an error for "already registered".</b> It offers to send the link again.</li>
        </ul>
      ) },
    ]} />
  )
}
