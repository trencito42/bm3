/* The public pages every hosting site needs besides the home page and the catalogue:
   status (/site/status), changelog (/site/changelog), contact (/site/contact) and the legal documents (/site/legal/:doc).
   Mock content only. Dates, incidents and releases are invented; the layouts and their behaviour are the deliverable. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Bell, Check, LifeBuoy, Mail, Printer, Rss, ShieldAlert, Wrench } from 'lucide-react'
import { Badge, Button, Textarea } from '../components/ui.jsx'
import { FormField, InlineAlert, Select, inputCls } from '../components/ui2.jsx'
import { DotText, Orb } from '../builder/FxBits.jsx'
import { Reveal, useSeen } from './reveal.jsx'
import { openCookieSettings } from './CookieConsent.jsx'
import { cn } from '../lib/utils'

const eyebrow = 'font-mono text-[10.5px] uppercase tracking-[.1em] text-dim'
const validEmail = (v) => /^\S+@\S+\.\S+$/.test(v.trim())
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/* ================================================================== STATUS ================================================================== */
const DAY = 86400000
function rng(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 } }
/* 90 days per component: 0 fine, 1 degraded, 2 outage, with the minutes it lasted. The last day is today's real state. */
function history(seed, today) {
  const r = rng(seed), out = []
  for (let i = 0; i < 90; i++) { const x = r(), m = 6 + Math.round(r() * 70); out.push(x < 0.012 ? { s: 2, m } : x < 0.04 ? { s: 1, m } : { s: 0, m: 0 }) }
  out[89] = today === 'ok' ? { s: 0, m: 0 } : today === 'bad' ? { s: 2, m: 118 } : { s: 1, m: 35 }
  return out
}
const GROUPS = [
  ['Regions', [['Frankfurt', 'warn', 11], ['Amsterdam', 'ok', 12], ['Helsinki', 'ok', 13], ['Ashburn', 'bad', 14]]],
  ['Platform', [['Client area', 'ok', 21], ['API', 'ok', 22], ['DNS', 'ok', 23], ['Email delivery', 'ok', 24], ['Billing and checkout', 'ok', 25]]],
]
const STATE = { ok: ['Operational', 'ok'], warn: ['Degraded', 'warn'], bad: ['Outage', 'bad'] }
const DAY_LABEL = ['No incidents', 'Degraded', 'Outage']
const BAR = ['bg-ok/45', 'bg-warn', 'bg-bad']
const ACTIVE = [
  { id: 'ash', title: 'Ashburn: servers unreachable', tone: 'bad', label: 'Outage', affects: 'Ashburn', updates: [
    ['Identified', '13:05 UTC', 'A power event at the data centre took one hall offline. Power is being restored rack by rack; servers come back on their own as their rack returns.'],
    ['Investigating', '12:31 UTC', 'Servers in Ashburn stopped answering. Other regions are not affected. Your data is safe.'],
  ] },
  { id: 'fra', title: 'Frankfurt: slower network than usual', tone: 'warn', label: 'Degraded', affects: 'Frankfurt', updates: [
    ['Monitoring', '14:02 UTC', 'Traffic has been moved to a second route and response times are back to normal. We are watching it for an hour before closing this.'],
    ['Identified', '13:41 UTC', 'One of our network routes is dropping packets.'],
    ['Investigating', '13:27 UTC', 'Some customers see slow responses from servers in Frankfurt.'],
  ] },
]
const PAST = [
  ['Nov 4', 'Delayed email delivery', 'Outgoing mail was queued for 22 minutes. Nothing was lost; every message was delivered.', '22 min'],
  ['Oct 27', 'Client area sign-in errors', 'Some sign-ins failed after a release. We rolled it back.', '9 min'],
  ['Oct 12', 'Helsinki: brief network interruption', 'A planned switch-over took longer than planned.', '4 min'],
]

function Strip({ days, name, uptime }) {
  const ref = useRef(null)
  const seen = useSeen(ref)
  const [hot, setHot] = useState(-1)
  const d = hot >= 0 ? days[hot] : null
  const date = (i) => new Date(Date.now() - (89 - i) * DAY).toLocaleDateString('en', { month: 'short', day: 'numeric' })
  const incidents = days.filter((x) => x.s).length
  return (
    <div>
      <div ref={ref} data-seen={seen || undefined} role="img" aria-label={`${name}: ${uptime}% uptime over 90 days, ${incidents} days with an incident`} onPointerLeave={() => setHot(-1)} className="up-strip flex h-7 items-stretch gap-[2px]">
        {days.map((x, i) => <i key={i} onPointerEnter={() => setHot(i)} style={{ '--n': i }} className={cn('min-w-0 flex-1 rounded-[2px] transition-[opacity,transform] duration-150', BAR[x.s], i < 60 && 'hidden sm:block', hot >= 0 && hot !== i && 'opacity-40', hot === i && 'scale-y-[1.18]')} />)}
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[.06em] text-dim">
        {d ? <span className="text-mute">{date(hot)} · <span className={cn(d.s === 2 ? 'text-bad' : d.s === 1 ? 'text-warn' : 'text-fg')}>{DAY_LABEL[d.s]}{d.s ? ` for ${d.m} min` : ''}</span></span> : <><span className="hidden sm:inline">90 days ago</span><span className="sm:hidden">30 days ago</span></>}
        <span>{d ? '' : 'Today'}</span>
      </div>
    </div>
  )
}

function StatusSubscribe() {
  const [open, setOpen] = useState(false)
  const [v, setV] = useState('')
  const [phase, setPhase] = useState('idle')
  const [touched, setTouched] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const bad = touched && !validEmail(v)
  const submit = (e) => {
    e.preventDefault(); setTouched(true)
    if (phase !== 'idle' || !validEmail(v)) return
    setPhase('busy'); timer.current = setTimeout(() => setPhase('done'), 900)
  }
  if (!open) return <Button variant="outline" onClick={() => setOpen(true)}><Bell />Get updates</Button>
  if (phase === 'done') return <span className="anim-rise inline-flex h-9 items-center gap-2 text-[13.5px] text-ok"><Check className="size-4" />We will email you when this changes. (simulated)</span>
  return (
    <form onSubmit={submit} noValidate className="anim-rise flex w-full max-w-sm gap-2">
      <input autoFocus type="email" aria-label="Email address" aria-invalid={bad || undefined} value={v} onChange={(e) => setV(e.target.value)} placeholder="you@example.com" className={cn(inputCls(bad), 'min-w-0 flex-1')} />
      <Button type="submit" loading={phase === 'busy'}>Subscribe</Button>
    </form>
  )
}

export function StatusPage() {
  const data = useMemo(() => GROUPS.map(([g, rows]) => [g, rows.map(([name, state, seed]) => {
    const days = history(seed, state)
    const down = days.reduce((a, x) => a + (x.s === 2 ? x.m : 0), 0)
    return { name, state, days, uptime: (100 - (down / (90 * 1440)) * 100).toFixed(2) }
  })]), [])
  const all = data.flatMap(([, r]) => r)
  const hit = all.filter((r) => r.state !== 'ok').length
  return (
    <div className="anim-page mx-auto max-w-4xl px-5 pb-24 pt-14 md:px-10 md:pt-20">
      <header>
        <div className={cn(eyebrow, 'anim-rise')} style={{ '--i': 0 }}>System status</div>
        <div className="anim-rise mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-5" style={{ '--i': 1 }}>
          <h1 className="flex items-center gap-4 text-[clamp(28px,5vw,44px)] font-semibold leading-none tracking-tight">
            <span className="relative grid size-3.5 shrink-0 place-items-center"><span className="absolute size-3.5 animate-ping rounded-full bg-warn/50 [animation-duration:2.4s]" /><span className="relative size-3.5 rounded-full bg-warn" /></span>
            {hit ? 'Partial degradation' : 'All systems operational'}
          </h1>
          <StatusSubscribe />
        </div>
        <p className="anim-rise mt-4 text-[15px] text-mute" style={{ '--i': 2 }}>{hit} of {all.length} systems are affected. Everything else is working normally. <span className="whitespace-nowrap font-mono text-[11.5px] text-dim">Checked 14:32 UTC</span></p>
      </header>

      <section aria-label="Open incidents" className="mt-12 space-y-4">
        {ACTIVE.map((inc, k) => (
          <Reveal key={inc.id} i={k}>
            <article className={cn('rounded-2xl border bg-card p-6 sm:p-7', inc.tone === 'bad' ? 'border-bad/35' : 'border-warn/30')}>
              <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-[17px] font-semibold tracking-tight">{inc.title}</h2><Badge tone={inc.tone}>{inc.label}</Badge></div>
              <ol className="mt-5">
                {inc.updates.map(([st, at, text], i) => (
                  <li key={at} className="relative pb-5 pl-6 last:pb-0">
                    {i < inc.updates.length - 1 && <span aria-hidden className="absolute bottom-0 left-[4.5px] top-3 w-px bg-line-2" />}
                    <span aria-hidden className={cn('absolute left-0 top-[7px] size-2.5 rounded-full border-2 border-card', i === 0 ? (inc.tone === 'bad' ? 'bg-bad' : 'bg-warn') : 'bg-dim')} />
                    <div className="flex flex-wrap items-baseline gap-x-3"><span className={cn('text-[13.5px] font-medium', i > 0 && 'text-mute')}>{st}</span><span className="font-mono text-[11px] text-dim">{at}</span></div>
                    <p className={cn('mt-1 text-[14px] leading-relaxed', i === 0 ? 'text-fg/85' : 'text-mute')}>{text}</p>
                  </li>
                ))}
              </ol>
            </article>
          </Reveal>
        ))}
      </section>

      {data.map(([g, rows]) => (
        <section key={g} className="mt-14">
          <div className="mb-2 flex items-baseline justify-between"><h2 className={eyebrow}>{g}</h2><span className={eyebrow}>Uptime · 90 days</span></div>
          <div className="divide-y divide-line border-y border-line">
            {rows.map((r) => (
              <div key={r.name} className="py-5">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3"><span className="truncate text-[15px] font-medium">{r.name}</span><Badge tone={STATE[r.state][1]}>{STATE[r.state][0]}</Badge></div>
                  <span className="shrink-0 font-mono text-[13px] tabular-nums text-mute">{r.uptime}%</span>
                </div>
                <Strip days={r.days} name={r.name} uptime={r.uptime} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <Reveal><div className="h-full rounded-2xl border border-line bg-card p-6">
          <div className="flex items-center gap-2.5 text-[13px] text-mute"><Wrench className="size-4" />Planned maintenance</div>
          <h3 className="mt-3 text-[16px] font-semibold tracking-tight">Helsinki: network upgrade</h3>
          <p className="mt-1 font-mono text-[11.5px] text-dim">Nov 18 · 02:00 to 04:00 UTC</p>
          <p className="mt-3 text-[14px] leading-relaxed text-mute">No downtime expected. Connections may be slower for a few seconds while traffic moves over.</p>
        </div></Reveal>
        <Reveal i={1}><div className="h-full rounded-2xl border border-line bg-card p-6">
          <div className="flex items-center gap-2.5 text-[13px] text-mute"><Rss className="size-4" />Follow along</div>
          <h3 className="mt-3 text-[16px] font-semibold tracking-tight">Updates where you already look</h3>
          <p className="mt-3 text-[14px] leading-relaxed text-mute">Email for the systems you use, or the feed for everything. Customers also see incidents that touch their own services in the client area.</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px]"><NavLink to="/site/changelog" className="link-grow inline-flex items-center gap-1 text-fg">Changelog<ArrowRight className="size-3.5" /></NavLink><NavLink to="/site/contact" className="link-grow inline-flex items-center gap-1 text-fg">Report a problem<ArrowRight className="size-3.5" /></NavLink></div>
        </div></Reveal>
      </section>

      <section className="mt-14">
        <h2 className={cn(eyebrow, 'mb-2')}>Past incidents</h2>
        <ul className="divide-y divide-line border-y border-line">
          {PAST.map(([when, t, d, dur]) => (
            <li key={t} className="grid gap-x-8 gap-y-1 py-5 sm:grid-cols-[88px_1fr_auto] sm:items-baseline">
              <span className="font-mono text-[11.5px] text-dim">{when}</span>
              <div><div className="text-[15px] font-medium">{t}</div><p className="mt-1 text-[14px] leading-relaxed text-mute">{d}</p></div>
              <span className="flex items-center gap-3"><span className="font-mono text-[11.5px] text-dim">{dur}</span><Badge tone="neutral" dot={false}>Resolved</Badge></span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/* ================================================================== CHANGELOG ================================================================== */
const KIND = { new: ['New', 'info'], improved: ['Improved', 'ok'], fixed: ['Fixed', 'neutral'] }
const LOG = [
  { v: '2026.11', date: 'Nov 1, 2026', title: 'Bookings, a new status page, faster deploys', post: 'november-changelog', items: [
    ['new', 'Bookings in the site builder', 'Describe a reservation flow and the builder sets up the form, the emails and the calendar.'],
    ['new', 'Status page with 90 days of history', 'Per-region history, incident updates by email and a feed.'],
    ['improved', 'Deploys finish in about 40 seconds', 'Down from about 65 seconds. Nothing to change on your side.'],
    ['fixed', 'DNS verification retries by itself', 'A check that failed once no longer needs a manual retry.'],
  ] },
  { v: '2026.10', date: 'Oct 6, 2026', title: 'Game server crash reports', items: [
    ['new', 'Crash reports for game servers', 'When a server goes down you get the cause in plain words, not just a log file.'],
    ['improved', 'Backups restore to a new server', 'Try a restore next to the original before you switch over.'],
    ['fixed', 'Invoices show the right VAT for mixed carts', 'Carts with a domain and a server were rounded twice.'],
  ] },
  { v: '2026.09', date: 'Sep 2, 2026', title: 'Teams and per-project access', items: [
    ['new', 'Invite your team', 'Give someone access to one project without sharing the whole account.'],
    ['new', 'Audit log', 'Who changed what, and when, for every project.'],
    ['improved', 'Two-factor on every sign-in method', 'Including sign-in links sent by email.'],
  ] },
  { v: '2026.08', date: 'Aug 4, 2026', title: 'Hourly billing for servers', items: [
    ['new', 'Pay by the hour', 'Start a server for an afternoon and pay for an afternoon.'],
    ['improved', 'Resize without a new IP address', 'The address stays, so DNS stays.'],
    ['fixed', 'Email forwarders with a plus sign', 'Addresses like name+tag@ are now accepted.'],
  ] },
]

export function ChangelogPage() {
  const nav = useNavigate()
  const [kind, setKind] = useState('all')
  const count = (k) => LOG.reduce((a, r) => a + r.items.filter((i) => k === 'all' || i[0] === k).length, 0)
  const list = LOG.map((r) => ({ ...r, items: r.items.filter((i) => kind === 'all' || i[0] === kind) })).filter((r) => r.items.length)
  return (
    <div className="anim-page">
      <section className="mx-auto max-w-4xl px-5 pb-10 pt-14 md:px-10 md:pt-20">
        <div className={cn(eyebrow, 'anim-rise')} style={{ '--i': 0 }}>Changelog</div>
        <div className="anim-rise mt-5 hidden sm:block" style={{ '--i': 1 }}><DotText text="WHAT SHIPPED" height={44} assemble /></div>
        <div className="anim-rise mt-5 sm:hidden" style={{ '--i': 1 }}><DotText text="SHIPPED" height={38} assemble /></div>
        <h1 className="sr-only">Changelog: what shipped</h1>
        <p className="anim-rise mt-6 max-w-xl text-[16px] leading-relaxed text-mute" style={{ '--i': 2 }}>Everything we change, once a month, in words you do not need a manual for.</p>
      </section>

      <div className="sticky top-14 z-20 border-y border-line bg-bg/90 backdrop-blur">
        <div role="group" aria-label="Filter by type of change" className="mx-auto flex max-w-4xl gap-1.5 overflow-x-auto px-5 py-3 [scrollbar-width:none] md:px-10">
          {[['all', 'Everything'], ...Object.entries(KIND).map(([k, [l]]) => [k, l])].map(([k, l]) => {
            const on = kind === k
            return <button key={k} aria-pressed={on} onClick={() => setKind(k)} className={cn('inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-[13.5px] font-medium outline-none transition-[background-color,border-color,color] duration-150 focus-visible:border-white/40', on ? 'border-line-2 bg-white/[0.09] text-fg' : 'border-transparent text-mute hover:bg-hover hover:text-fg')}>{l}<span className={cn('font-mono text-[10.5px] tabular-nums', on ? 'text-mute' : 'text-dim')}>{count(k)}</span></button>
          })}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 pb-24 pt-6 md:px-10">
        <p className="sr-only" role="status" aria-live="polite">{list.length} releases shown</p>
        <ol key={kind}>
          {list.map((r, k) => (
            <Reveal as="li" key={r.v} className="grid gap-x-10 border-b border-line py-10 last:border-b-0 md:grid-cols-[150px_1fr] md:py-14">
              <div className="mb-4 md:mb-0">
                <div className="md:sticky md:top-32">
                  <div className="flex items-center gap-2.5 font-mono text-[12.5px] text-fg">{k === 0 && kind === 'all' && <i aria-hidden className="size-1.5 rounded-full bg-[var(--brand)]" />}{r.v}</div>
                  <div className="mt-1 font-mono text-[11px] text-dim">{r.date}</div>
                </div>
              </div>
              <div>
                <h2 className="text-[22px] font-semibold leading-tight tracking-tight [text-wrap:balance] sm:text-[26px]">{r.title}</h2>
                <ul className="mt-6 space-y-5">
                  {r.items.map(([t, title, d]) => (
                    <li key={title} className="grid gap-x-4 gap-y-1.5 sm:grid-cols-[92px_1fr]">
                      <span className="pt-0.5"><Badge tone={KIND[t][1]} dot={false}>{KIND[t][0]}</Badge></span>
                      <div><div className="text-[15px] font-medium">{title}</div><p className="mt-1 text-[14px] leading-relaxed text-mute">{d}</p></div>
                    </li>
                  ))}
                </ul>
                {r.post && <button onClick={() => nav('/site/blog/' + r.post)} className="link-grow mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-medium outline-none">Read the full story<ArrowRight className="size-3.5" /></button>}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </div>
  )
}

/* ================================================================== CONTACT ================================================================== */
const TOPICS = [['sales', 'Sales and plans'], ['support', 'Help with a service'], ['billing', 'Billing'], ['abuse', 'Report abuse'], ['other', 'Something else']]
const TOPIC_HINT = { support: 'Already a customer? A ticket from the client area reaches the people who can see your services.', abuse: 'Include the address or domain and what you saw. Abuse reports are read first.' }

export function ContactPage() {
  const nav = useNavigate()
  const [f, setF] = useState({ topic: 'sales', name: '', email: '', company: '', msg: '' })
  const [touched, setTouched] = useState({})
  const [phase, setPhase] = useState('idle')
  const [writing, setWriting] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.value }))
  const blur = (k) => () => setTouched((o) => ({ ...o, [k]: true }))
  const err = { name: !f.name.trim() && 'Tell us who to reply to', email: !validEmail(f.email) && 'Enter a valid email address', msg: f.msg.trim().length < 10 && 'A sentence or two helps us answer the first time' }
  const show = (k) => (touched[k] ? err[k] || undefined : undefined)
  const submit = (e) => {
    e.preventDefault(); setTouched({ name: true, email: true, msg: true })
    if (phase !== 'idle' || err.name || err.email || err.msg) return
    setPhase('busy'); timer.current = setTimeout(() => setPhase('done'), 1100)
  }
  const done = phase === 'done'
  return (
    <div className="anim-page mx-auto grid max-w-6xl gap-x-16 gap-y-12 px-5 pb-24 pt-14 md:px-10 md:pt-20 lg:grid-cols-[1fr_minmax(0,480px)]">
      <div>
        <div className={cn(eyebrow, 'anim-rise')} style={{ '--i': 0 }}>Contact</div>
        <h1 className="anim-rise mt-5 text-[clamp(32px,5vw,52px)] font-semibold leading-[1.04] tracking-tight [text-wrap:balance]" style={{ '--i': 1 }}>Talk to a person.</h1>
        <p className="anim-rise mt-5 max-w-md text-[16px] leading-relaxed text-mute" style={{ '--i': 2 }}>Tell us what you are trying to do. Whoever answers can actually help, and you will not be passed around.</p>
        <ul className="anim-rise mt-12 divide-y divide-line border-y border-line" style={{ '--i': 3 }}>
          {[[LifeBuoy, 'Already a customer', 'Open a ticket from the client area. It carries your account, so you do not explain twice.', 'Open the client area', '/site/login'],
            [Mail, 'Sales', 'Plans, migrations, anything before you sign up.', 'Compare plans', '/site/products'],
            [ShieldAlert, 'Abuse and security', 'Report something hosted with us, or a vulnerability you found.', 'Acceptable use policy', '/site/legal/aup']].map(([I, t, d, cta, to]) => (
            <li key={t} className="flex items-start gap-4 py-5">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-line-2 text-mute"><I className="size-4" /></span>
              <div className="min-w-0"><div className="text-[15px] font-medium">{t}</div><p className="mt-1 text-[14px] leading-relaxed text-mute">{d}</p><NavLink to={to} className="link-grow mt-2 inline-flex items-center gap-1 text-[13.5px] text-fg">{cta}<ArrowRight className="size-3.5" /></NavLink></div>
            </li>
          ))}
        </ul>
      </div>

      <div className="anim-rise" style={{ '--i': 2 }}>
        <div className="rounded-2xl border border-line-2 bg-card p-6 sm:p-8">
          {done ? (
            <div className="anim-rise flex flex-col items-center py-8 text-center" role="status">
              <Orb size={72} state="happy" />
              <h2 className="mt-6 text-[22px] font-semibold tracking-tight">Message sent.</h2>
              <p className="mt-2 max-w-xs text-[14.5px] leading-relaxed text-mute">We will reply to <b className="font-medium text-fg">{f.email}</b>. Nothing was really sent: this is a simulation.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-2"><Button variant="outline" onClick={() => { setPhase('idle'); setF((o) => ({ ...o, msg: '' })); setTouched({}) }}>Send another</Button><Button onClick={() => nav('/site')}>Back to home</Button></div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5">
              <div className="flex items-center gap-4">
                <Orb size={44} state={phase === 'busy' ? 'thinking' : writing ? 'thinking' : 'idle'} className="shrink-0" />
                <div><h2 className="text-[17px] font-semibold tracking-tight">Send us a message</h2><p className="text-[13px] text-dim">Pip sorts it to the right team.</p></div>
              </div>
              <FormField label="What is it about?"><Select value={f.topic} onValueChange={(v) => setF((o) => ({ ...o, topic: v }))} options={TOPICS} /></FormField>
              {TOPIC_HINT[f.topic] && <div key={f.topic} className="anim-rise"><InlineAlert tone="info" title={f.topic === 'support' ? 'Faster through a ticket' : 'What to include'}>{TOPIC_HINT[f.topic]}</InlineAlert></div>}
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Name" required error={show('name')}><input value={f.name} onChange={set('name')} onBlur={blur('name')} autoComplete="name" aria-invalid={!!show('name') || undefined} className={cn(inputCls(!!show('name')), 'text-[16px] sm:text-[13.5px]')} /></FormField>
                <FormField label="Email" required error={show('email')}><input type="email" value={f.email} onChange={set('email')} onBlur={blur('email')} autoComplete="email" placeholder="you@example.com" aria-invalid={!!show('email') || undefined} className={cn(inputCls(!!show('email')), 'text-[16px] sm:text-[13.5px]')} /></FormField>
              </div>
              <FormField label="Company" optional><input value={f.company} onChange={set('company')} autoComplete="organization" className={cn(inputCls(), 'text-[16px] sm:text-[13.5px]')} /></FormField>
              <FormField label="Message" required error={show('msg')}>
                <Textarea rows={5} maxLength={2000} value={f.msg} onChange={set('msg')} onFocus={() => setWriting(true)} onBlur={() => { setWriting(false); blur('msg')() }} aria-invalid={!!show('msg') || undefined} className="text-[16px] sm:text-[13.5px]" />
              </FormField>
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[11px] tabular-nums text-dim">{f.msg.length} / 2000</span>
                <Button size="lg" type="submit" loading={phase === 'busy'}>Send message<ArrowRight /></Button>
              </div>
              <p className="text-[12px] leading-relaxed text-dim">We use what you write here only to answer you. See the <NavLink to="/site/legal/privacy" className="text-mute underline underline-offset-4 hover:text-fg">privacy policy</NavLink>.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

/* ================================================================== LEGAL ================================================================== */
/* Layout only. Each section says what it has to cover; the wording itself is written by counsel. */
export const LEGAL_DOCS = {
  terms: ['Terms of service', [['Your account', 'Who can open an account, and who is responsible for what happens in it.'], ['Acceptable use', 'What may and may not be hosted, with a pointer to the full policy.'], ['Billing and renewals', 'How and when we charge, what happens when a payment fails, how to cancel.'], ['Service levels', 'What we commit to, with a pointer to the SLA.'], ['Your content', 'You own it. What we are allowed to do with it in order to run the service.'], ['Suspension and termination', 'When we may suspend a service, the notice we give, how you get your data.'], ['Liability', 'The limits, in plain words first.'], ['Changes to these terms', 'How much notice you get and where it is announced.']]],
  privacy: ['Privacy policy', [['What we collect', 'Account details, billing details, usage and logs. Listed, not described vaguely.'], ['Why we collect it', 'The purpose and the legal basis for each kind of data.'], ['Who we share it with', 'Named categories of processors and where they are.'], ['How long we keep it', 'A period for each kind of data.'], ['Your rights', 'Access, correction, deletion, export, and how to ask.'], ['Contact', 'Who to write to, and the supervisory authority.']]],
  aup: ['Acceptable use', [['What is not allowed', 'A short list people can actually read.'], ['Resource use', 'What counts as fair use on shared plans.'], ['Email sending', 'Limits, and what gets a mailbox paused.'], ['Reporting abuse', 'Where to send a report and what to include.'], ['What we do about it', 'The steps, from a warning to suspension.']]],
  sla: ['Service level agreement', [['What is covered', 'Which services and which plans.'], ['The commitment', 'The uptime figure and how it is measured.'], ['Credits', 'What you get back when we miss it, and how to claim it.'], ['What does not count', 'Planned maintenance, and problems outside our network.']]],
  dpa: ['Data processing agreement', [['Roles', 'Who is the controller and who is the processor.'], ['What we process', 'Kinds of data and of people, and for how long.'], ['Security measures', 'Described at the level a customer needs for their own compliance.'], ['Sub-processors', 'The list, and how changes are announced.'], ['International transfers', 'Where data may go and under which safeguards.'], ['Audits and deletion', 'What you can ask for and what happens at the end of the contract.']]],
  cookies: ['Cookie policy', [['What we use', 'The table below, kept in step with what the site really sets.'], ['Your choice', 'How to change it at any time.'], ['Other storage', 'Local storage and similar, treated the same way.']]],
}
const COOKIE_ROWS = [['Necessary', 'Sign-in, your basket, your cookie choice.', 'No'], ['Preferences', 'Remembers language and currency.', 'Yes'], ['Analytics', 'Counts visits so we know which pages help.', 'Yes']]

export function LegalPage({ id = 'terms' }) {
  const doc = LEGAL_DOCS[id] || LEGAL_DOCS.terms
  const key = LEGAL_DOCS[id] ? id : 'terms'
  const [title, sections] = doc
  const root = useRef(null)
  const [active, setActive] = useState(sections[0][0])
  useEffect(() => {
    const sc = root.current?.closest('.overflow-y-auto')
    if (!sc) return
    let t = 0
    const f = () => { t = 0; const top = sc.getBoundingClientRect().top; let cur = sections[0][0]; for (const [h] of sections) { const n = document.getElementById(slug(h)); if (n && n.getBoundingClientRect().top - top < 170) cur = h } setActive(cur) }
    const on = () => { if (!t) t = window.setTimeout(f, 40) }
    sc.addEventListener('scroll', on, { passive: true }); f()
    return () => { sc.removeEventListener('scroll', on); clearTimeout(t) }
  }, [sections])
  return (
    <div ref={root} className="anim-page">
      <div className="border-b border-line">
        <nav aria-label="Legal documents" className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-5 py-3 [scrollbar-width:none] md:px-10">
          {Object.entries(LEGAL_DOCS).map(([k, [t]]) => <NavLink key={k} to={'/site/legal/' + k} aria-current={k === key ? 'page' : undefined} className={cn('inline-flex h-9 shrink-0 items-center rounded-lg border px-3 text-[13.5px] font-medium outline-none transition-[background-color,border-color,color] duration-150 focus-visible:border-white/40', k === key ? 'border-line-2 bg-white/[0.09] text-fg' : 'border-transparent text-mute hover:bg-hover hover:text-fg')}>{t}</NavLink>)}
        </nav>
      </div>
      <div className="mx-auto grid max-w-6xl gap-x-14 px-5 pb-24 pt-12 md:px-10 md:pt-16 lg:grid-cols-[210px_minmax(0,680px)]">
        <aside className="hidden lg:block"><nav aria-label="On this page" className="sticky top-24"><div className={cn(eyebrow, 'mb-3')}>On this page</div>
          <ul className="space-y-0.5 border-l border-line">{sections.map(([h], i) => <li key={h}><button onClick={() => document.getElementById(slug(h))?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className={cn('-ml-px flex w-full gap-2.5 border-l py-1.5 pl-3 text-left text-[13px] leading-snug outline-none transition-[color,border-color] duration-150 focus-visible:text-fg', active === h ? 'border-fg text-fg' : 'border-transparent text-mute hover:text-fg')}><span className="font-mono text-[11px] text-dim">{i + 1}</span>{h}</button></li>)}</ul></nav></aside>
        <article key={key} className="anim-rise min-w-0">
          <h1 className="text-[clamp(30px,5vw,44px)] font-semibold leading-[1.06] tracking-tight">{title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[.06em] text-dim"><span>Last updated Nov 1, 2026</span><span>Version 3</span><button onClick={() => window.print()} className="inline-flex items-center gap-1.5 uppercase tracking-[.06em] text-mute outline-none transition-colors hover:text-fg focus-visible:text-fg"><Printer className="size-3.5" />Print</button></div>
          <div className="mt-8"><InlineAlert tone="warn" title="Sample document">This page shows the layout. The real wording is written by a lawyer and replaces every section below.</InlineAlert></div>
          <div className="mt-10 space-y-12">
            {sections.map(([h, covers], i) => (
              <section key={h} id={slug(h)} className="scroll-mt-24">
                <h2 className="flex items-baseline gap-3 text-[21px] font-semibold tracking-tight"><span className="font-mono text-[13px] font-normal text-dim">{i + 1}</span>{h}</h2>
                <p className="mt-3 text-[16px] leading-[1.75] text-fg/80">{covers}</p>
                <p className="mt-3 text-[16px] leading-[1.75] text-mute">Placeholder paragraph, set in the size and measure the real text will use, so the page can be judged for reading comfort before the wording exists.</p>
                {key === 'cookies' && i === 0 && (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-line">
                    <table className="w-full min-w-[440px] text-[13.5px]"><thead><tr className="border-b border-line font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><th className="px-4 py-3 text-left font-normal">Category</th><th className="px-4 py-3 text-left font-normal">What it is for</th><th className="px-4 py-3 text-left font-normal">Can be turned off</th></tr></thead>
                      <tbody>{COOKIE_ROWS.map(([a, b, c]) => <tr key={a} className="border-b border-line/50 last:border-b-0"><td className="px-4 py-3 font-medium">{a}</td><td className="px-4 py-3 text-mute">{b}</td><td className="px-4 py-3 font-mono text-[12px] text-mute">{c}</td></tr>)}</tbody></table>
                  </div>
                )}
                {key === 'cookies' && i === 1 && <Button className="mt-5" variant="outline" onClick={openCookieSettings}>Change cookie settings</Button>}
              </section>
            ))}
          </div>
          <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-[13.5px] text-mute"><span>Questions about this document?</span><NavLink to="/site/contact" className="link-grow inline-flex items-center gap-1 text-fg">Contact us<ArrowUpRight className="size-3.5" /></NavLink></div>
        </article>
      </div>
    </div>
  )
}
