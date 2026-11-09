import { useMemo, useRef, useState } from 'react'
import { Check, Copy, Monitor, Moon, Smartphone, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { Doc } from './Doc.jsx'
import { Button } from '../components/ui.jsx'
import { EMAILS, MOCK, render } from '../emails/templates.js'
import { cn } from '../lib/utils'

/* ---- preview-only: swap the hosted-image tokens for inline SVG so the preview shows the same dots without a CDN ---- */
const svgUri = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
function dotUri(text, color) {
  const svg = window.BlipFX.dotText({ text })
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.querySelectorAll('circle').forEach((c) => c.setAttribute('fill', color))
  return svgUri(svg.outerHTML)
}
/* preview-only drawings of the four characters (production uses exported PNGs of the real components) */
function blipUri(size, role) {
  const eyes = (fill) => `<rect x="36.5" y="40" width="9" height="20" rx="4.5" fill="${fill}"/><rect x="54.5" y="40" width="9" height="20" rx="4.5" fill="${fill}"/>`
  const art = {
    chat: `<defs><radialGradient id="a" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e9e4dc"/><stop offset="1" stop-color="#b9b2a7"/></radialGradient></defs><circle cx="50" cy="50" r="47" fill="url(#a)"/>${eyes('#16161a')}`,
    builder: `<polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#1b1030"/><polygon points="50,4 91,27 50,50" fill="#ff5ab8"/><polygon points="91,27 91,73 50,50" fill="#8a4dff"/><polygon points="91,73 50,96 50,50" fill="#24c6ff"/><polygon points="50,96 9,73 50,50" fill="#3f7bff"/><polygon points="9,73 9,27 50,50" fill="#ff8a3a"/><polygon points="9,27 50,4 50,50" fill="#ffd24a"/><polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/>${eyes('#0b0b0e')}`,
    dev: `<defs><radialGradient id="a" cx="36%" cy="28%" r="80%"><stop offset="0" stop-color="#9fc3ff"/><stop offset=".5" stop-color="#4a6fe0"/><stop offset="1" stop-color="#1d2a74"/></radialGradient></defs><circle cx="50" cy="50" r="47" fill="url(#a)"/><ellipse cx="38" cy="24" rx="20" ry="9" fill="rgba(255,255,255,.35)" transform="rotate(-24 38 24)"/>${eyes('#0b0b0e')}`,
    game: `<defs><radialGradient id="a" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#b8ffd8"/><stop offset=".5" stop-color="#2fe08a"/><stop offset="1" stop-color="#0b7a4a"/></radialGradient></defs><ellipse cx="50" cy="52" rx="47" ry="44" fill="url(#a)"/><ellipse cx="36" cy="28" rx="15" ry="7" fill="rgba(255,255,255,.4)" transform="rotate(-20 36 28)"/>${eyes('#05281a')}`,
  }
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">${art[role] || art.chat}</svg>`)
}
function resolve(html, theme) {
  let out = html.replace(/\{\{DOT:([^:}]+):([^:}]+):([^}]+)\}\}/g, (_, text, color) => dotUri(text, color)).replace(/\{\{BLIP:(\d+):([^}]*)\}\}/g, (_, size, role) => blipUri(+size, role))
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
  const [id, setId] = useState('order')
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
        <div className="flex flex-wrap gap-1">{list.map((e) => <button key={e.id} onClick={() => setId(e.id)} aria-pressed={cur.id === e.id} className={cn('h-8 rounded-lg px-3 text-[12.5px] transition-colors', cur.id === e.id ? 'bg-fg text-black' : 'bg-white/[0.06] text-mute hover:text-fg')}>{e.name}</button>)}</div>
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
      <p className="text-xs text-dim">The images in the HTML are hosted PNGs rendered from the dot font (a light-ink and a dark-ink copy, switched by the colour scheme). This preview draws the same dots as inline SVG, and merge tags such as {'{{first_name}}'} are filled with sample values.</p>
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
        ['Mock only', 'Addresses, amounts and company details are invented. Nothing is sent from this page.']]
        .map(([t, d]) => <div key={t} className="rounded-xl border border-line bg-card p-4"><div className="text-[14px] font-semibold">{t}</div><p className="mt-1 text-[13px] leading-relaxed text-mute">{d}</p></div>)}
    </div>
  )
}

export default function Emails() {
  return <Doc title="Email" lead="Ten emails in two families, signed by the four Blips. System mail (orders, payments, alerts, builds, crashes, security) is quiet and exact; marketing mail (launches, digests, offers) is louder and editorial. Same identity, different layout and energy." sections={[
    { id: 'templates', title: 'Templates', note: 'preview, mobile, dark and light, HTML and text', node: <Viewer /> },
    { id: 'difference', title: 'System vs marketing', node: <Difference /> },
    { id: 'rules', title: 'Rules', node: <Rules /> },
  ]} />
}
