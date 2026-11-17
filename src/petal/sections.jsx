/* Petal homepage — sections, rebuilt from scratch after the first pass read as "a generic SaaS template with Petal
   colors." This version borrows Graphical's actual devices, not its brand: a scattered card deck that settles into
   a fan (their footer), inline icon-pills inside a sentence (their hero), a black terminal card (their "build with
   your agent" section), a component-by-component explorer with a sliding rail and auto-advancing dots (their
   theme-switch panel), and a hairline-divided accordion FAQ. Alloy's restraint is in the components themselves:
   plain surfaces, a neutral primary action reserved for the one real commitment on the page, generous label-top
   spacing. Data is real mock, reused from lib/mock.js and site/appsData.js; every mock UI is labelled "Example". */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Bot, Check, ChevronDown, Database, Gamepad2, Globe, Lock, Mail, Minus, Moon, Plus, RefreshCw, Server, ShieldCheck, Sun, Terminal, X } from 'lucide-react'
import { CATALOG } from '../lib/mock'
import { APPS } from '../site/appsData.js'
import { cn } from '../lib/utils'
import { useReveal } from './useReveal.js'

const money = (n) => '$' + n.toFixed(2)
const ICON = { web: Globe, vps: Server, game: Gamepad2, db: Database, mail: Mail, dom: Globe }

/* ---------------------------------------------------------------- shared bits ---------------------------------------------------------------- */
export function PetalBtn({ as: T = 'button', variant = 'accent', size = 'md', className, children, ...p }) {
  return <T className={cn('petal-btn', `petal-btn-${variant}`, size === 'lg' ? 'h-13 px-7 text-[15.5px]' : size === 'sm' ? 'h-9 px-4 text-[13px]' : 'h-11 px-5', className)} {...p}>{children}</T>
}
function Reveal({ as: T = 'div', i = 0, className, children, ...p }) {
  const [ref, seen] = useReveal()
  return <T ref={ref} data-seen={seen || undefined} className={cn('p-reveal', className)} style={{ '--d': i }} {...p}>{children}</T>
}
const Eyebrow = ({ children }) => <div className="petal-label">{children}</div>
/* a card that leans toward the cursor — the depth cue is real, computed from the pointer, not a canned keyframe */
function Tilt({ children, className }) {
  const ref = useRef(null)
  const move = (e) => { const r = ref.current.getBoundingClientRect(); ref.current.style.setProperty('--tx', ((e.clientX - r.left) / r.width - 0.5).toFixed(2)); ref.current.style.setProperty('--ty', ((e.clientY - r.top) / r.height - 0.5).toFixed(2)) }
  const leave = () => { ref.current.style.setProperty('--tx', 0); ref.current.style.setProperty('--ty', 0) }
  return <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={cn('p-tilt', className)}>{children}</div>
}
/* one card of a scattered deck: settles in (opacity/scale), the fan angle itself is fixed, never animated */
function DeckCard({ i, rot, x, y, w, className, children, style }) {
  const [ref, seen] = useReveal('0px 0px -5% 0px')
  return (
    <div ref={ref} data-seen={seen || undefined} className="p-deck-card" style={{ left: x, top: y, width: w, '--rot': rot + 'deg', '--z': i, transitionDelay: `${i * 90}ms`, ...style }}>
      <Tilt className={cn('petal-card h-full p-4', className)}>{children}</Tilt>
    </div>
  )
}

/* ---------------------------------------------------------------- nav ---------------------------------------------------------------- */
export function Nav({ theme, setTheme }) {
  const nav = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const el = document.getElementById('petal-scroll')
    if (!el) return
    const f = () => setScrolled(el.scrollTop > 8)
    el.addEventListener('scroll', f, { passive: true })
    return () => el.removeEventListener('scroll', f)
  }, [])
  const links = [['Products', '#products'], ['Pricing', '#pricing'], ['Docs', '/site/docs']]
  return (
    <header className={cn('p-nav sticky top-0 z-30', scrolled ? 'bg-[var(--bg)]/92 backdrop-blur' : '')}>
      <div className={cn('mx-auto flex max-w-6xl items-center gap-6 transition-[padding] duration-200', scrolled ? 'py-2.5' : 'py-4')} style={{ paddingInline: 'var(--sec-x)' }}>
        <a href="#top" className="petal-title text-[19px]">Blipmade</a>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {links.map(([l, to]) => <a key={l} href={to} className="rounded-full px-3.5 py-2 text-[13.5px] font-semibold text-[var(--ink2)] transition-colors duration-150 hover:bg-[var(--s2)] hover:text-[var(--ink)]">{l}</a>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'} onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} className="grid size-9 place-items-center rounded-full text-[var(--ink2)] transition-colors hover:bg-[var(--s2)] hover:text-[var(--ink)]">
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <PetalBtn variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => nav('/site/login')}>Log in</PetalBtn>
          <PetalBtn size="sm" onClick={() => nav('/site/register')}>Get started</PetalBtn>
          <button aria-label="Menu" onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-full text-[var(--ink2)] md:hidden text-[13px] font-bold">☰</button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 m-3 rounded-[24px] p-6 md:hidden" style={{ background: 'var(--s1)' }}>
          <div className="flex items-center justify-between"><span className="petal-title text-[18px]">Blipmade</span><button aria-label="Close" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-[var(--s2)]"><X className="size-5" /></button></div>
          <nav className="mt-8 flex flex-col gap-1">{links.map(([l, to]) => <a key={l} href={to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3.5 text-[17px] font-bold hover:bg-[var(--s2)]">{l}</a>)}</nav>
          <div className="mt-6 flex flex-col gap-2"><PetalBtn size="lg" onClick={() => nav('/site/register')}>Get started</PetalBtn><PetalBtn size="lg" variant="ghost" onClick={() => nav('/site/login')}>Log in</PetalBtn></div>
        </div>
      )}
    </header>
  )
}

/* ---------------------------------------------------------------- hero: a sentence with cycling icon-pills, over a settling deck ---------------------------------------------------------------- */
const PILL_WORDS = [[Globe, 'a website'], [Server, 'a VPS'], [Gamepad2, 'a game server'], [Database, 'a database'], [Bot, 'a Discord bot']]
const DECK = [
  { id: 'deploy', w: 232, x: '0%', y: 54, rot: -7, tone: 'dark', node: () => (
    <div className="font-mono text-[11.5px] leading-6" style={{ color: '#9aa7bb' }}><div className="text-[var(--on-ink)]" style={{ color: '#fff' }}>$ blip deploy ./site</div><div>› Building…</div><div>› Reserving capacity</div><div style={{ color: '#3ddc84' }}>✓ Live in 38s</div></div>
  ) },
  { id: 'price', w: 168, x: '17%', y: 2, rot: 5, tone: 'light', node: () => (<><Eyebrow>VPS Pro</Eyebrow><div className="mt-2 petal-mono petal-title text-[26px]">$9.00<span className="text-[12px] text-[var(--ink3)]">/mo</span></div></>) },
  { id: 'mc', w: 196, x: '34%', y: 86, rot: -4, tone: 'light', node: () => (<><div className="flex items-center gap-2 text-[12.5px] font-bold"><span className="size-2 rounded-full bg-[var(--good)]" />minecraft-paper</div><div className="mt-2 text-[22px] font-black petal-mono">4<span className="text-[13px] text-[var(--ink3)]">/20 players</span></div></>) },
  { id: 'dom', w: 208, x: '52%', y: 18, rot: 6, tone: 'dark', node: () => (<><Eyebrow>DNS · CNAME</Eyebrow><div className="mt-2 petal-mono text-[12px]" style={{ color: '#9aa7bb' }}>play.northwind.gg</div><div className="petal-mono text-[12px]" style={{ color: '#7aa2ff' }}>→ blip.app</div></>) },
  { id: 'bot', w: 176, x: '69%', y: 70, rot: -6, tone: 'light', node: () => (<><div className="flex items-center gap-2"><Bot className="size-4 text-[var(--accent)]" /><span className="text-[12.5px] font-bold">Support bot</span></div><div className="mt-2 text-[11.5px] text-[var(--ink2)]">Online · 3 servers</div></>) },
  { id: 'db', w: 212, x: '84%', y: 8, rot: 4, tone: 'light', node: () => (<><Eyebrow>PostgreSQL</Eyebrow><div className="mt-2 flex items-end gap-2"><span className="petal-mono text-[22px] font-black">1.2M</span><span className="text-[11px] text-[var(--ink3)]">rows</span></div><div className="mt-1.5 h-1.5 rounded-full" style={{ background: 'var(--s3)' }}><i className="block h-full w-[38%] rounded-full" style={{ background: 'var(--accent)' }} /></div></>) },
]
export function Hero() {
  const nav = useNavigate()
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % PILL_WORDS.length), 1900); return () => clearInterval(t) }, [])
  return (
    <section id="top" className="mx-auto max-w-6xl pb-6 pt-14 md:pt-20" style={{ paddingInline: 'var(--sec-x)' }}>
      <Reveal className="flex justify-center"><span className="petal-chip inline-flex items-center gap-2 px-3 py-1.5 text-[12.5px] font-bold text-[var(--ink2)]"><span className="size-1.5 rounded-full bg-[var(--good)]" />Now taking new accounts</span></Reveal>
      <Reveal i={1} as="h1" className="petal-display mx-auto mt-6 max-w-3xl text-balance text-center text-[11vw] sm:text-[48px] md:text-[56px]">
        Spin up <span className="p-pill-stage" aria-live="off">{PILL_WORDS.map(([I, w], k) => <span key={w} data-on={k === i || undefined} aria-hidden={k !== i} className="p-pill"><I className="size-[0.62em]" />{w}</span>)}</span>
        <span className="sr-only">a website, a VPS, a game server, a database or a Discord bot</span>
        <br />in minutes, not hours.
      </Reveal>
      <Reveal i={2} className="mx-auto mt-6 max-w-md text-center text-[16px] leading-relaxed text-[var(--ink2)]">Root access, your own server, a dashboard that stays out of your way. Pick the size yourself.</Reveal>
      <Reveal i={3} className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <PetalBtn size="lg" onClick={() => nav('/site/register')}>Start building<ArrowRight className="size-4" /></PetalBtn>
        <PetalBtn size="lg" variant="tint" as="a" href="#pricing">See pricing</PetalBtn>
      </Reveal>

      {/* desktop: the deck settles into a fan beneath the headline */}
      <div className="p-deck mt-16 hidden md:block" style={{ height: 300 }}>
        {DECK.map((c, k) => <DeckCard key={c.id} i={k} rot={c.rot} x={c.x} y={c.y} w={c.w} className={c.tone === 'dark' ? 'bg-[#11151d]' : ''}>{c.node()}</DeckCard>)}
      </div>
      {/* phone: the same cards as a snapping horizontal strip */}
      <div className="-mx-5 mt-10 flex gap-3 overflow-x-auto px-5 pb-2 md:hidden" style={{ scrollSnapType: 'x mandatory' }}>
        {DECK.map((c) => <div key={c.id} className={cn('petal-card shrink-0 p-4', c.tone === 'dark' && 'bg-[#11151d]')} style={{ width: 200, scrollSnapAlign: 'start' }}>{c.node()}</div>)}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- product explorer ---------------------------------------------------------------- */
const PREVIEW = {
  web: () => (<div><Eyebrow>yourproject.blipmade.app</Eyebrow><div className="mt-3 flex items-center gap-2"><span className="size-2 rounded-full bg-[var(--good)]" /><span className="text-[13px] font-bold">Live · HTTPS on</span></div><div className="mt-4 petal-inset h-28" /></div>),
  vps: () => (<div className="petal-mono text-[12.5px]" style={{ color: 'var(--ink2)' }}><div style={{ color: 'var(--ink)' }}>ssh root@45.83.12.9</div><div className="mt-3 flex gap-4">{[['CPU', 18], ['RAM', 44], ['Disk', 26]].map(([l, v]) => <span key={l} className="flex items-center gap-2"><span className="w-7 text-[11px]">{l}</span><span className="h-1 w-16 rounded-full" style={{ background: 'var(--s3)' }}><i className="block h-full rounded-full" style={{ width: v + '%', background: 'var(--accent)' }} /></span></span>)}</div></div>),
  game: () => (<div><div className="flex items-center justify-between"><Eyebrow>Paper 1.21 · fra-1</Eyebrow><span className="petal-mono text-[12px] text-[var(--good)]">20 tps</span></div><ul className="mt-3 space-y-1.5 text-[13px]" style={{ color: 'var(--ink2)' }}>{['mara', 'tudor', 'ilinca'].map((n) => <li key={n} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[var(--good)]" />{n}</li>)}</ul></div>),
  db: () => (<div><Eyebrow>Query, last run 12ms</Eyebrow><div className="mt-3 petal-mono text-[12px]" style={{ color: 'var(--accent)' }}>select * from orders<br />where status = 'paid'</div></div>),
  mail: () => (<div className="space-y-2">{[['Invoice ready', '2m'], ['Welcome to Blipmade', '1d'], ['New sign-in', '3d']].map(([s, t]) => <div key={s} className="flex items-center justify-between text-[13px]" style={{ color: 'var(--ink2)' }}><span>{s}</span><span className="petal-mono text-[11px] text-[var(--ink3)]">{t}</span></div>)}</div>),
  dom: () => (<div className="space-y-2 petal-mono text-[11.5px]" style={{ color: 'var(--ink2)' }}>{[['A', '@', '45.83.12.9'], ['CNAME', 'www', '@'], ['MX', '@', 'mx.blipmade.app']].map((r) => <div key={r.join()} className="flex gap-3"><span className="w-14" style={{ color: 'var(--accent)' }}>{r[0]}</span><span className="w-10">{r[1]}</span><span>{r[2]}</span></div>)}</div>),
}
export function Explorer() {
  const nav = useNavigate()
  const items = CATALOG
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const railRef = useRef([])
  const [rail, setRail] = useState({ top: 0, h: 0 })
  useEffect(() => { const t = setInterval(() => { if (!paused) setI((x) => (x + 1) % items.length) }, 3200); return () => clearInterval(t) }, [paused, items.length])
  useEffect(() => { const el = railRef.current[i]; if (el) setRail({ top: el.offsetTop, h: el.offsetHeight }) }, [i])
  return (
    <section id="products" className="mx-auto max-w-6xl" style={{ padding: 'var(--sec-y) var(--sec-x)' }}>
      <Reveal><Eyebrow>Products</Eyebrow></Reveal>
      <Reveal i={1} as="h2" className="petal-title mt-3 max-w-xl text-[32px] md:text-[40px]">Everything you host, one panel.</Reveal>
      {/* desktop: a list with a sliding rail, the right side cross-fades */}
      <div className="mt-10 hidden gap-10 md:grid md:grid-cols-[280px_1fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="relative pl-5">
          <div className="p-rail" style={{ top: rail.top, height: rail.h }} />
          {items.map((c, k) => {
            const I = ICON[c.id] || Server
            return (
              <button key={c.id} ref={(el) => (railRef.current[k] = el)} onClick={() => setI(k)} onMouseEnter={() => setI(k)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-150', i === k ? 'bg-[var(--s2)]' : 'hover:bg-[var(--s2)]')}>
                <I className={cn('size-4 shrink-0', i === k ? 'text-[var(--accent)]' : 'text-[var(--ink3)]')} />
                <span className="min-w-0 flex-1"><span className={cn('block text-[14.5px] font-bold', i !== k && 'text-[var(--ink2)]')}>{c.name}</span></span>
                <span className="petal-mono text-[11.5px] text-[var(--ink3)]">from {money(c.from)}</span>
              </button>
            )
          })}
        </div>
        <div className="petal-card p-xfade p-8">
          {items.map((c, k) => { const P = PREVIEW[c.id] || PREVIEW.web; return <div key={c.id} data-on={i === k || undefined}><div className="flex items-start justify-between"><p className="max-w-xs text-[13.5px] leading-relaxed text-[var(--ink2)]">{c.blurb}</p><span className="petal-chip px-2.5 py-1 text-[10.5px] font-bold text-[var(--ink2)]">Example</span></div><div className="mt-6"><P /></div><PetalBtn size="sm" variant="tint" className="mt-6" onClick={() => nav('/site/products/' + c.id)}>Configure {c.name.toLowerCase()}<ArrowRight className="size-3.5" /></PetalBtn></div> })}
        </div>
      </div>
      {/* phone: an accordion — tapping a row expands its own preview, no side panel to fit */}
      <div className="mt-8 space-y-2 md:hidden">
        {items.map((c, k) => {
          const I = ICON[c.id] || Server, P = PREVIEW[c.id] || PREVIEW.web
          return (
            <div key={c.id} data-open={i === k || undefined} className="p-acc petal-card overflow-hidden">
              <button onClick={() => setI(i === k ? -1 : k)} className="flex w-full items-center gap-3 p-4 text-left">
                <I className="size-4 shrink-0 text-[var(--accent)]" /><span className="flex-1 text-[14.5px] font-bold">{c.name}</span><span className="petal-mono text-[11.5px] text-[var(--ink3)]">from {money(c.from)}</span><ChevronDown className="p-acc-chev size-4 text-[var(--ink3)]" />
              </button>
              <div className="p-acc-body px-4"><div><div className="pb-4"><P /><PetalBtn size="sm" variant="tint" className="mt-4 w-full" onClick={() => nav('/site/products/' + c.id)}>Configure<ArrowRight className="size-3.5" /></PetalBtn></div></div></div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- deploy: a terminal that types itself out, then a real slider ---------------------------------------------------------------- */
const LOG = ['$ blip deploy ./app --region fra', '› Packing source (4.2 MB)', '› Building image node:22', '› Reserving capacity', '✓ Live at api-7f3a.blipmade.app']
function TypedLog() {
  const [ref, seen] = useReveal()
  const [n, setN] = useState(0)
  useEffect(() => { if (!seen || n >= LOG.length) return; const t = setTimeout(() => setN((x) => x + 1), n === 0 ? 300 : 480); return () => clearTimeout(t) }, [seen, n])
  return (
    <div ref={ref} className="font-mono text-[12.5px] leading-7" style={{ color: '#aab4c4', minHeight: LOG.length * 1.75 + 'em' }}>
      {LOG.slice(0, n).map((l, k) => <div key={l} style={{ color: k === LOG.length - 1 ? '#3ddc84' : k === 0 ? '#fff' : undefined }}>{l}{k === n - 1 && n < LOG.length && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse" style={{ background: '#aab4c4' }} />}</div>)}
    </div>
  )
}
const DEMO = APPS.find((a) => a.id === 'minecraft') || APPS[0]
export function Deploy() {
  const [ram, setRam] = useState(DEMO.ram[2])
  const price = DEMO.base + ram * DEMO.rate
  return (
    <section className="mx-auto max-w-5xl" style={{ padding: '0 var(--sec-x) var(--sec-y)' }}>
      <Reveal className="overflow-hidden rounded-[28px] p-6 md:p-10" style={{ background: '#0b0d12' }}>
        <div className="flex items-center justify-between"><Eyebrow>Example deploy</Eyebrow><span className="petal-chip px-2.5 py-1 text-[10.5px] font-bold" style={{ background: '#1b2330', color: '#a0adbd' }}>Real pricing logic</span></div>
        <div className="mt-5"><TypedLog /></div>
        <div className="mt-8 grid gap-8 rounded-[20px] p-6 md:grid-cols-[1fr_auto] md:items-center" style={{ background: 'rgba(255,255,255,.04)' }}>
          <div>
            <div className="flex items-center justify-between text-[13px]" style={{ color: '#a0adbd' }}><span>{DEMO.name} · memory</span><span className="petal-mono" style={{ color: '#fff' }}>{ram} GB</span></div>
            <input type="range" min={DEMO.ram[0]} max={DEMO.ram[1]} value={ram} onChange={(e) => setRam(+e.target.value)} className="petal-range mt-3 w-full" style={{ '--pct': `${((ram - DEMO.ram[0]) / (DEMO.ram[1] - DEMO.ram[0])) * 100}%` }} aria-label="Memory in GB" />
            <p className="mt-2 text-[11.5px]" style={{ color: '#6b7488' }}>{money(DEMO.rate)} per GB, the same rate used on the product page.</p>
          </div>
          <div className="text-right"><span className="petal-mono petal-title text-[36px]" style={{ color: '#fff' }}>{money(price)}</span><div className="text-[12px]" style={{ color: '#6b7488' }}>/month</div></div>
        </div>
      </Reveal>
    </section>
  )
}

/* ---------------------------------------------------------------- included: a plain 2-col list, no card background ---------------------------------------------------------------- */
const INCLUDED = [[Lock, 'Root access', 'Full SSH access on every server, no exceptions.'], [ShieldCheck, 'Daily backups', 'Kept for 7 days, restore in one click.'], [RefreshCw, 'Hourly or monthly billing', 'Switch any time, no lock-in.'], [Globe, 'Hosted in the EU', 'Frankfurt, Amsterdam and Helsinki.']]
export function Included() {
  return (
    <section className="mx-auto max-w-6xl" style={{ padding: '0 var(--sec-x) var(--sec-y)' }}>
      <Reveal as="h2" className="petal-title max-w-md text-[28px] md:text-[34px]">Included with everything, always.</Reveal>
      <div className="mt-10 grid gap-x-16 gap-y-10 sm:grid-cols-2">
        {INCLUDED.map(([I, t, d], k) => (
          <Reveal key={t} i={k} className="max-w-sm">
            <I className="size-5 text-[var(--ink2)]" strokeWidth={1.5} />
            <div className="mt-3 text-[16px] font-bold">{t}</div>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ink2)]">{d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- the dashboard bridge: a tilted stack, not a side-by-side ---------------------------------------------------------------- */
export function PanelShowcase() {
  return (
    <section className="mx-auto max-w-5xl" style={{ padding: '0 var(--sec-x) var(--sec-y)' }}>
      <Reveal><Eyebrow>Your dashboard</Eyebrow></Reveal>
      <Reveal i={1} as="h2" className="petal-title mt-3 max-w-xl text-[28px] md:text-[34px]">This calm page is the storefront. Once you're in, it looks like this.</Reveal>
      <Reveal i={2} className="mt-3 max-w-lg text-[14px] leading-relaxed text-[var(--ink2)]">On purpose, not an oversight: logs and live metrics read better darker and denser. The two are meant to feel like two rooms of the same place.</Reveal>
      <div className="relative mt-14 h-[360px] sm:h-[300px]">
        <Reveal i={2} className="petal-card absolute left-1/2 top-0 w-[86%] -translate-x-1/2 p-6 sm:left-[8%] sm:w-[62%] sm:translate-x-0" style={{ transform: 'rotate(-2deg)' }}>
          <Eyebrow>blipmade.com</Eyebrow>
          <div className="mt-3 flex items-center gap-2"><span className="size-2 rounded-full bg-[var(--good)]" /><span className="text-[13px] font-bold">Pick a plan, deploy</span></div>
          <div className="mt-4 h-24 rounded-[14px]" style={{ background: 'var(--s2)' }} />
        </Reveal>
        <Tilt className="absolute bottom-0 right-1/2 w-[86%] translate-x-1/2 overflow-hidden rounded-[22px] p-5 sm:bottom-2 sm:right-[6%] sm:w-[58%] sm:translate-x-0" style={{ background: '#0d0d0f' }}>
          <div className="font-mono text-[10.5px] uppercase tracking-[.1em]" style={{ color: '#6b6b72' }}>Overview</div>
          <div className="mt-3 grid grid-cols-2 gap-2">{[['CPU', '31%'], ['RAM', '54%'], ['Services', '4'], ['Uptime', '99.98%']].map(([l, v]) => <div key={l} className="rounded-[10px] p-2.5" style={{ background: '#1c1c20' }}><div className="font-mono text-[9.5px]" style={{ color: '#6b6b72' }}>{l}</div><div className="mt-1 font-mono text-[13px]" style={{ color: '#f2f2f3' }}>{v}</div></div>)}</div>
        </Tilt>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- pricing: a cascade, not a grid of equals ---------------------------------------------------------------- */
export function Pricing() {
  const nav = useNavigate()
  const rows = CATALOG.slice(0, 3)
  const off = [0, 30, 10]
  return (
    <section id="pricing" className="mx-auto max-w-6xl" style={{ padding: 'var(--sec-y) var(--sec-x)' }}>
      <Reveal><Eyebrow>Pricing</Eyebrow></Reveal>
      <Reveal i={1} as="h2" className="petal-title mt-3 max-w-xl text-[30px] md:text-[36px]">Pay for the size you pick. That's the whole model.</Reveal>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {rows.map((c, i) => {
          const I = ICON[c.id] || Server
          return (
            <Reveal key={c.id} i={i} className="petal-card p-6" style={{ marginTop: off[i], marginLeft: i % 2 ? 14 : 0 }}>
              <I className="size-5 text-[var(--ink2)]" strokeWidth={1.5} />
              <div className="mt-4 text-[15px] font-bold" style={{ color: 'var(--ink2)' }}>{c.name}</div>
              <div className="mt-2 flex items-baseline gap-1"><span className="petal-mono petal-title text-[34px]">{money(c.from)}</span><span className="text-[13px] text-[var(--ink3)]">/mo from</span></div>
              <PetalBtn size="sm" variant="tint" className="mt-6 w-full" onClick={() => nav('/site/products/' + c.id)}>Configure<ArrowRight className="size-3.5" /></PetalBtn>
            </Reveal>
          )
        })}
      </div>
      <Reveal i={3} className="mt-12 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {['Billed hourly or monthly, cancel any time', 'Root access, SSH and SFTP on every server', 'Daily backups and IPv4 + IPv6 included', 'Hosted in the EU'].map((t) => <div key={t} className="flex items-center gap-2.5 text-[13.5px] text-[var(--ink2)]"><Check className="size-4 shrink-0 text-[var(--good)]" />{t}</div>)}
      </Reveal>
    </section>
  )
}

/* ---------------------------------------------------------------- faq ---------------------------------------------------------------- */
const FAQ = [['Who is this for?', 'Anyone who needs a server and would rather not learn sysadmin work to get it: small apps, game servers for a friend group, a side project database.'], ['What happens if I need more?', 'Resize from the dashboard. Storage and memory scale up without reinstalling anything.'], ['Is there a contract?', 'No. Billing is hourly or monthly and you can cancel from your account at any time.'], ['Moving from another host?', 'Tell us what you run today and we plan the move with you before anything switches.']]
export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="mx-auto max-w-3xl" style={{ padding: '0 var(--sec-x) var(--sec-y)' }}>
      <Reveal as="h2" className="petal-title text-[30px]">FAQ</Reveal>
      <div className="mt-6" style={{ borderTop: '1px solid var(--s4)' }}>
        {FAQ.map(([q, a], k) => (
          <Reveal key={q} i={k} as="div" data-open={open === k || undefined} className="p-acc" style={{ borderBottom: '1px solid var(--s4)' }}>
            <button onClick={() => setOpen(open === k ? -1 : k)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
              <span className="text-[15.5px] font-bold">{q}</span><ChevronDown className="p-acc-chev size-4 shrink-0 text-[var(--ink3)]" />
            </button>
            <div className="p-acc-body"><div><p className="pb-5 max-w-xl text-[14px] leading-relaxed text-[var(--ink2)]">{a}</p></div></div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- closing: a second, smaller deck bookends the hero's ---------------------------------------------------------------- */
const CLOSE_DECK = [
  { id: 'fast', w: 150, x: '6%', y: 4, rot: -6, node: () => <div className="text-[13px] font-bold">Live in 38s</div> },
  { id: 'free', w: 140, x: '70%', y: 10, rot: 5, node: () => <div className="text-[13px] font-bold">€0 setup fee</div> },
  { id: 'cancel', w: 160, x: '2%', y: 150, rot: 5, node: () => <div className="text-[13px] font-bold">Cancel any time</div> },
  { id: 'eu', w: 150, x: '74%', y: 140, rot: -5, node: () => <div className="text-[13px] font-bold">Hosted in the EU</div> },
]
export function FinalCta() {
  const nav = useNavigate()
  return (
    <section className="mx-auto max-w-5xl" style={{ padding: '0 var(--sec-x) var(--sec-y)' }}>
      <div className="p-deck relative overflow-hidden rounded-[28px] px-6 py-16 text-center md:py-24" style={{ background: 'var(--s1)', minHeight: 320 }}>
        {CLOSE_DECK.map((c, k) => <DeckCard key={c.id} i={k} rot={c.rot} x={c.x} y={c.y} w={c.w} className="hidden sm:flex sm:items-center sm:justify-center opacity-90">{c.node()}</DeckCard>)}
        <Reveal className="relative"><Bot className="mx-auto size-8 text-[var(--accent)]" /></Reveal>
        <Reveal i={1} as="h2" className="petal-title relative mx-auto mt-5 max-w-md text-[34px] md:text-[44px]">Go live today.</Reveal>
        <Reveal i={2} className="relative mx-auto mt-4 max-w-sm text-[14.5px] text-[var(--ink2)]">Your first service is online in under a minute. No card required to start.</Reveal>
        <Reveal i={3} className="relative mt-8"><PetalBtn size="lg" onClick={() => nav('/site/register')}>Create a free account<ArrowRight className="size-4" /></PetalBtn></Reveal>
      </div>
    </section>
  )
}
export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--s4)' }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-[12.5px] text-[var(--ink3)]" style={{ padding: '28px var(--sec-x)' }}>
        <span>© 2026 Blipmade</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2"><a href="/site/docs" className="hover:text-[var(--ink)]">Docs</a><a href="/site/status" className="hover:text-[var(--ink)]">Status</a><a href="/site/legal/terms" className="hover:text-[var(--ink)]">Terms</a><a href="/site/legal/privacy" className="hover:text-[var(--ink)]">Privacy</a></div>
      </div>
    </footer>
  )
}
