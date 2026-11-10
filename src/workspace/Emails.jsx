import { useMemo, useRef, useState } from 'react'
import { Check, Copy, Monitor, Moon, Smartphone, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { Doc } from './Doc.jsx'
import { Button } from '../components/ui.jsx'
import { EMAILS, MOCK, render } from '../emails/templates.js'
import { cn } from '../lib/utils'

/* the images are the real PNG files in public/email; the preview points {{assets}} at the local copy */
const ASSETS = () => new URL(import.meta.env.BASE_URL + 'email', location.href).href
function resolve(html, theme) {
  let out = html.replaceAll('{{assets}}', ASSETS())
  out = out.replace(/\{\{(\w+)\}\}/g, (m, k) => MOCK[k] ?? m)
  if (theme === 'light') out = out.replace('<html lang="en"', '<html lang="en" class="force-light"')
  return out
}
const resolveText = (t) => t.replace(/\{\{(\w+)\}\}/g, (m, k) => MOCK[k] ?? m)

function Seg({ value, onChange, options }) {
  return <div className="inline-flex rounded-lg border border-line p-0.5">{options.map(([v, l, I]) => <button key={v} onClick={() => onChange(v)} aria-pressed={value === v} className={cn('inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] transition-colors', value === v ? 'bg-white/[0.11] text-fg' : 'text-mute hover:text-fg')}>{I && <I className="size-3.5" />}{l}</button>)}</div>
}

function Viewer() {
  const [family, setFamily] = useState('system')
  const [id, setId] = useState('verify')
  const [device, setDevice] = useState('desktop')
  const [theme, setTheme] = useState('dark')
  const [view, setView] = useState('preview')
  const [h, setH] = useState(700)
  const frame = useRef(null)
  const list = EMAILS.filter((e) => e.kind === family)
  const cur = list.find((e) => e.id === id) || list[0]
  const mail = useMemo(() => render(cur.id), [cur.id])
  const doc = useMemo(() => resolve(mail.html, theme), [mail, theme])
  const copy = async () => { try { await navigator.clipboard.writeText(mail.html); toast.success('HTML copied') } catch { toast.error('Copy is blocked in this browser') } }
  const fit = () => { try { const d = frame.current?.contentDocument; if (d) setH(Math.max(420, d.documentElement.scrollHeight)) } catch {} }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Seg value={family} onChange={(v) => { setFamily(v); setId(EMAILS.find((e) => e.kind === v).id) }} options={[['system', 'System'], ['marketing', 'Marketing']]} />
        <span className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{list.length} templates</span>
      </div>
      <div className="space-y-2">
        {[...new Set(list.map((e) => e.group))].map((g) => (
          <div key={g} className="flex flex-wrap items-center gap-1">
            {family === 'system' && <span className="w-[72px] shrink-0 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{g}</span>}
            {list.filter((e) => e.group === g).map((e) => <button key={e.id} onClick={() => setId(e.id)} aria-pressed={cur.id === e.id} className={cn('h-8 rounded-lg px-3 text-[12.5px] transition-colors', cur.id === e.id ? 'bg-fg text-black' : 'bg-white/[0.06] text-mute hover:text-fg')}>{e.name}</button>)}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-3">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Subject</div>
          <div className="truncate text-[13.5px] font-medium">{mail.subject}</div>
          <div className="truncate text-[12.5px] text-dim">{mail.preheader}</div>
        </div>
        <Seg value={device} onChange={setDevice} options={[['desktop', 'Desktop', Monitor], ['mobile', 'Mobile', Smartphone]]} />
        <Seg value={theme} onChange={setTheme} options={[['dark', 'Dark', Moon], ['light', 'Light', Sun]]} />
        <Seg value={view} onChange={setView} options={[['preview', 'Preview'], ['html', 'HTML'], ['text', 'Text']]} />
        <Button variant="outline" size="sm" onClick={copy}><Copy />Copy HTML</Button>
      </div>
      {view === 'preview' ? (
        <div className={cn('overflow-x-auto rounded-2xl border border-line p-4 sm:p-6', theme === 'light' ? 'bg-[#e3e3df]' : 'bg-black')}>
          <iframe ref={frame} key={cur.id + device + theme} title={mail.subject} srcDoc={doc} sandbox="allow-same-origin" onLoad={fit} className="mx-auto block rounded-lg border-0 bg-transparent" style={{ width: device === 'mobile' ? 375 : 680, maxWidth: '100%', height: h }} />
        </div>
      ) : (
        <pre className="max-h-[640px] overflow-auto rounded-2xl border border-line bg-black/40 p-4 font-mono text-[11.5px] leading-5 text-mute">{view === 'html' ? mail.html : resolveText(mail.text)}</pre>
      )}
      <p className="text-xs text-dim">The images are real PNG files in <span className="font-mono">public/email</span> (a light-ink and a dark-ink copy of each dot image, switched by the colour scheme). In the copied HTML they are addressed as <span className="font-mono">{'{{assets}}'}/name.png</span>: the sender replaces that with the public address of the folder. Merge tags such as {'{{first_name}}'} are filled with sample values here.</p>
    </div>
  )
}

function Difference() {
  const rows = [
    ['Purpose', 'Tell you something that happened, exactly.', 'Make you want to do something.'],
    ['Layout', 'One left-aligned card, one column of facts.', 'Centred hero, numbered sections, bigger breathing room.'],
    ['Type', 'Small headline (24 px), mono figures, mostly 13 to 14.5 px body.', 'Dot-matrix headline image, 30 to 34 px titles, 15.5 px body.'],
    ['Imagery', 'None except the wordmark. Nothing to load, nothing to block.', 'A Blip illustration, dot headline, pricing cards.'],
    ['Colour', 'Red only for a failure; green for success; amber for a warning.', 'White and black with one red dot in the badge: the accent stays rare.'],
    ['Action', 'One primary button, at most one ghost button next to it.', 'One pill button, optionally a quiet second link.'],
    ['Footer', 'Why you got it and where to change notifications. No unsubscribe: service mail must arrive.', 'Unsubscribe, preferences, view in browser and the postal address.'],
  ]
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="grid grid-cols-[110px_1fr_1fr] border-b border-line bg-card font-mono text-[10.5px] uppercase tracking-[.08em] text-dim sm:grid-cols-[130px_1fr_1fr]"><div className="p-3" /><div className="p-3">System</div><div className="p-3">Marketing</div></div>
      {rows.map(([k, a, b]) => <div key={k} className="grid grid-cols-[110px_1fr_1fr] border-b border-line/60 text-[13px] last:border-b-0 sm:grid-cols-[130px_1fr_1fr]"><div className="p-3 font-medium">{k}</div><div className="p-3 text-mute">{a}</div><div className="p-3 text-mute">{b}</div></div>)}
    </div>
  )
}

function Rules() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[['Built for real clients', 'Table layout, inline styles, a 600 px column and bulletproof buttons made of table cells, so Gmail, Outlook and Apple Mail keep the shape.'],
        ['Dark first, light aware', 'Dark is the base look. A style block flips tokens and the two copies of each dot image for clients that report a light colour scheme.'],
        ['Preheader and plain text', 'Every email carries a hidden preheader and a plain-text alternative, shown in the Text tab.'],
        ['Mobile', 'Under 620 px the columns stack, padding tightens and headlines shrink. Check the Mobile switch.'],
        ['Tone', 'System mail states facts and the next step. Marketing mail is allowed one idea and one action.'],
        ['Never a password', 'No email carries a password or a full card number. A new server email says where to set access, not what it is.'],
        ['No invented voices', 'No customer quotes or logos unless they are real and attributable. Blips sign what they did; people sign what they wrote.'],
        ['Mock only', 'Addresses, amounts and company details are invented. Links are placeholders. Nothing is sent from this page.']]
        .map(([t, d]) => <div key={t} className="rounded-xl border border-line bg-card p-4"><div className="text-[14px] font-semibold">{t}</div><p className="mt-1 text-[13px] leading-relaxed text-mute">{d}</p></div>)}
    </div>
  )
}

export default function Emails() {
  return <Doc title="Email" lead="Eighteen emails in two families, signed by the four Blips. System mail (account, billing, services, support) is quiet and exact; marketing mail (launches, digests, offers) is louder and editorial. Same identity, different layout and energy." sections={[
    { id: 'templates', title: 'Templates', note: 'preview, mobile, dark and light, HTML and text', node: <Viewer /> },
    { id: 'difference', title: 'System vs marketing', node: <Difference /> },
    { id: 'rules', title: 'Rules', node: <Rules /> },
  ]} />
}
