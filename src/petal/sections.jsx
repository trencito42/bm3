/* Petal homepage — sections. Deliberately not importing bm3's own Button/Card/etc: this page is a separate visual
   system (see petal.css) and must not quietly inherit bm3's near-black tokens or dark dot-matrix identity.
   Data is real mock, reused from the existing catalog (lib/mock.js, site/appsData.js) rather than invented here;
   every number on this page traces back to a value that already exists elsewhere in the workspace. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Bot, Check, Code2, Database, Gamepad2, Globe, Mail, Moon, Rocket, Server, Sun, X } from 'lucide-react'
import { CATALOG } from '../lib/mock'
import { APPS } from '../site/appsData.js'
import { cn } from '../lib/utils'
import { useReveal } from './useReveal.js'

const money = (n) => '$' + n.toFixed(2)
const PRODUCT_ICON = { web: Globe, vps: Server, game: Gamepad2, db: Database, mail: Mail, dom: Globe }

/* ---------------------------------------------------------------- shared bits ---------------------------------------------------------------- */
export function PetalBtn({ as: T = 'button', variant = 'accent', size = 'md', className, children, ...p }) {
  return <T className={cn('petal-btn', `petal-btn-${variant}`, size === 'lg' ? 'h-13 px-7 text-[15.5px]' : size === 'sm' ? 'h-9 px-4 text-[13px]' : 'h-11 px-5', className)} {...p}>{children}</T>
}
export function Reveal({ as: T = 'div', i = 0, className, children }) {
  const [ref, seen] = useReveal()
  return <T ref={ref} data-seen={seen || undefined} className={cn('p-reveal', className)} style={{ '--d': i }}>{children}</T>
}
const Eyebrow = ({ children }) => <div className="petal-label">{children}</div>

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
          <button aria-label="Menu" onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-full text-[var(--ink2)] md:hidden"><Rocket className="hidden" /><span className="text-[13px] font-bold">☰</span></button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 petal-card m-3 rounded-[24px] p-6 md:hidden" style={{ background: 'var(--s1)' }}>
          <div className="flex items-center justify-between"><span className="petal-title text-[18px]">Blipmade</span><button aria-label="Close" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-[var(--s2)]"><X className="size-5" /></button></div>
          <nav className="mt-8 flex flex-col gap-1">{links.map(([l, to]) => <a key={l} href={to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3.5 text-[17px] font-bold hover:bg-[var(--s2)]">{l}</a>)}</nav>
          <div className="mt-6 flex flex-col gap-2"><PetalBtn size="lg" onClick={() => nav('/site/register')}>Get started</PetalBtn><PetalBtn size="lg" variant="ghost" onClick={() => nav('/site/login')}>Log in</PetalBtn></div>
        </div>
      )}
    </header>
  )
}

/* ---------------------------------------------------------------- hero ---------------------------------------------------------------- */
const WORDS = ['apps.', 'game servers.', 'databases.', 'Discord bots.']
export function Hero() {
  const nav = useNavigate()
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % WORDS.length), 2600); return () => clearInterval(t) }, [])
  return (
    <section id="top" className="mx-auto grid max-w-6xl items-center gap-10 pb-10 pt-10 md:grid-cols-[1.1fr_1fr] md:pb-20 md:pt-16" style={{ paddingInline: 'var(--sec-x)' }}>
      <div>
        <Reveal><span className="petal-chip inline-flex items-center gap-2 px-3 py-1.5 text-[12.5px] font-bold text-[var(--ink2)]"><span className="size-1.5 rounded-full bg-[var(--good)]" />Now taking new accounts</span></Reveal>
        <Reveal i={1} as="h1" className="petal-display mt-5 text-[13vw] sm:text-[52px] md:text-[60px]">
          Deploy your<br /><span className="p-word align-top" aria-live="off">{WORDS.map((w, k) => <span key={w} data-on={k === i || undefined} aria-hidden={k !== i}>{w}</span>)}</span>
          <span className="sr-only">{WORDS[i]}</span>
        </Reveal>
        <Reveal i={2} className="mt-6 max-w-md text-[16.5px] leading-relaxed text-[var(--ink2)]">Pick what you're running, set the size yourself, and it's live in minutes — on your own server, with root access and a dashboard that stays out of your way.</Reveal>
        <Reveal i={3} className="mt-8 flex flex-wrap items-center gap-3">
          <PetalBtn size="lg" onClick={() => nav('/site/register')}>Start building<ArrowRight className="size-4" /></PetalBtn>
          <PetalBtn size="lg" variant="tint" as="a" href="#pricing">See pricing</PetalBtn>
        </Reveal>
        <Reveal i={4} className="mt-5 text-[13px] text-[var(--ink3)]">No card required to look around · Cancel any time</Reveal>
      </div>
      <Reveal i={2} className="relative hidden md:block">
        <div className="petal-card p-float relative ml-auto w-[320px] p-5" style={{ '--r': '-2deg' }}>
          <Eyebrow>Example deploy</Eyebrow>
          <div className="petal-inset mt-3 p-4 font-mono text-[12px] leading-6 text-[var(--ink2)]">
            <div className="text-[var(--ink)]">$ blip deploy ./app</div>
            <div>› Building image…</div>
            <div>› Reserving capacity</div>
            <div className="text-[var(--good)]">✓ Live in 38s</div>
          </div>
        </div>
        <div className="petal-card p-float absolute -bottom-8 -left-4 w-[220px] p-4" style={{ '--r': '2deg', animationDelay: '1.4s' }}>
          <Eyebrow>Minecraft · Paper</Eyebrow>
          <div className="mt-2 flex items-center gap-2 text-[13px] font-bold"><span className="size-2 rounded-full bg-[var(--good)]" />4 / 20 players online</div>
        </div>
      </Reveal>
    </section>
  )
}

/* ---------------------------------------------------------------- products ---------------------------------------------------------------- */
export function Products() {
  const nav = useNavigate()
  const [hot, setHot] = useState(null)
  return (
    <section id="products" className="mx-auto max-w-6xl" style={{ padding: 'var(--sec-y) var(--sec-x)' }}>
      <Reveal><Eyebrow>Products</Eyebrow></Reveal>
      <Reveal i={1} as="h2" className="petal-title mt-3 max-w-xl text-[34px] md:text-[42px]">One panel for everything you host.</Reveal>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOG.map((c, i) => {
          const I = PRODUCT_ICON[c.id] || Server
          return (
            <Reveal key={c.id} i={i} as="button" className="petal-option block w-full p-6 text-left outline-none" onMouseEnter={() => setHot(c.id)} onMouseLeave={() => setHot(null)} onClick={() => nav('/site/products/' + c.id)}>
              <div className="flex items-start justify-between"><span className="petal-inset grid size-11 place-items-center"><I className="size-5 text-[var(--accent)]" /></span>{c.tag && <span className="petal-chip px-2.5 py-1 text-[10.5px] font-bold text-[var(--accent)]">{c.tag}</span>}</div>
              <div className="mt-4 text-[17px] font-bold">{c.name}</div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ink2)]">{c.blurb}</p>
              <div className="mt-5 flex items-center justify-between"><span className="petal-mono text-[12px] text-[var(--ink3)]">from {money(c.from)}/mo</span><ArrowRight className={cn('size-4 text-[var(--ink3)] transition-transform duration-200', hot === c.id && 'translate-x-1 text-[var(--accent)]')} /></div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- deploy experience ---------------------------------------------------------------- */
const DEMO = APPS.find((a) => a.id === 'minecraft') || APPS[0]
export function Deploy() {
  const [ram, setRam] = useState(DEMO.ram[2])
  const price = DEMO.base + ram * DEMO.rate
  return (
    <section className="mx-auto max-w-6xl" style={{ padding: '0 var(--sec-x) var(--sec-y)' }}>
      <div className="petal-card grid gap-8 p-6 md:grid-cols-2 md:p-10">
        <Reveal>
          <Eyebrow>Real configurator</Eyebrow>
          <h2 className="petal-title mt-3 text-[28px] md:text-[32px]">Size it yourself. The price updates as you move the slider.</h2>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[var(--ink2)]">This is the same pricing logic used in the product pages — {money(DEMO.rate)} per GB of memory for {DEMO.name}, nothing invented for this demo.</p>
        </Reveal>
        <Reveal i={1} className="petal-inset p-6">
          <div className="flex items-center justify-between"><span className="text-[14px] font-bold">{DEMO.name}</span><span className="petal-chip px-2.5 py-1 text-[11px] font-bold text-[var(--ink2)]">Example</span></div>
          <div className="mt-6 flex items-center justify-between text-[13px] text-[var(--ink2)]"><span>Memory</span><span className="petal-mono text-[var(--ink)]">{ram} GB</span></div>
          <input type="range" min={DEMO.ram[0]} max={DEMO.ram[1]} value={ram} onChange={(e) => setRam(+e.target.value)} className="petal-range mt-2 w-full" style={{ '--pct': `${((ram - DEMO.ram[0]) / (DEMO.ram[1] - DEMO.ram[0])) * 100}%` }} aria-label="Memory in GB" />
          <div className="mt-6 flex items-end justify-between"><span className="text-[13px] text-[var(--ink3)]">Estimated price</span><span className="petal-mono petal-title text-[28px]">{money(price)}<span className="text-[13px] text-[var(--ink3)]"> /mo</span></span></div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- dashboard showcase (the deliberate bridge) ---------------------------------------------------------------- */
export function PanelShowcase() {
  return (
    <section className="mx-auto max-w-6xl" style={{ padding: '0 var(--sec-x) var(--sec-y)' }}>
      <Reveal><Eyebrow>Your dashboard</Eyebrow></Reveal>
      <Reveal i={1} as="h2" className="petal-title mt-3 max-w-xl text-[30px] md:text-[36px]">This calm page is the storefront. Once you're in, the panel looks like this.</Reveal>
      <Reveal i={2} className="mt-3 max-w-lg text-[14px] leading-relaxed text-[var(--ink2)]">On purpose: the console, logs and live metrics read better with a darker, denser screen. The two are meant to feel like two rooms of the same place, not two products.</Reveal>
      <div className="mt-10 grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
        <Reveal i={2} className="petal-card p-6"><Eyebrow>blipmade.com</Eyebrow><div className="mt-3 h-40 rounded-[16px]" style={{ background: 'var(--s2)' }} /><div className="mt-3 text-[13px] font-bold">Pick a plan, deploy</div></Reveal>
        <ArrowRight className="hidden size-6 text-[var(--ink3)] md:block" />
        <Reveal i={3} className="overflow-hidden rounded-[24px] p-5" style={{ background: '#0d0d0f' }}>
          <div className="font-mono text-[10.5px] uppercase tracking-[.1em] text-[#6b6b72]">Overview</div>
          <div className="mt-3 grid grid-cols-2 gap-2">{[['CPU', '31%'], ['RAM', '54%'], ['Services', '4'], ['Uptime', '99.98%']].map(([l, v]) => <div key={l} className="rounded-[10px] p-2.5" style={{ background: '#1c1c20' }}><div className="font-mono text-[9.5px] text-[#6b6b72]">{l}</div><div className="mt-1 font-mono text-[13px] text-[#f2f2f3]">{v}</div></div>)}</div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- pricing & trust ---------------------------------------------------------------- */
export function Pricing() {
  const nav = useNavigate()
  return (
    <section id="pricing" className="mx-auto max-w-6xl" style={{ padding: 'var(--sec-y) var(--sec-x)' }}>
      <Reveal><Eyebrow>Pricing</Eyebrow></Reveal>
      <Reveal i={1} as="h2" className="petal-title mt-3 max-w-xl text-[32px] md:text-[38px]">Pay for the size you pick. That's the whole model.</Reveal>
      <div className="mt-10 grid gap-3 md:grid-cols-3">
        {CATALOG.slice(0, 3).map((c, i) => {
          const I = PRODUCT_ICON[c.id] || Server
          return (
            <Reveal key={c.id} i={i} className="petal-card p-6">
              <I className="size-5 text-[var(--accent)]" />
              <div className="mt-4 text-[16px] font-bold">{c.name}</div>
              <div className="mt-2 flex items-baseline gap-1"><span className="petal-mono petal-title text-[30px]">{money(c.from)}</span><span className="text-[13px] text-[var(--ink3)]">/mo from</span></div>
              <PetalBtn size="sm" variant="tint" className="mt-5 w-full" onClick={() => nav('/site/products/' + c.id)}>Configure<ArrowRight className="size-3.5" /></PetalBtn>
            </Reveal>
          )
        })}
      </div>
      <Reveal i={3} className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {['Billed hourly or monthly, cancel any time', 'Root access, SSH and SFTP on every server', 'Daily backups and IPv4 + IPv6 included', 'Hosted in the EU'].map((t) => <div key={t} className="flex items-center gap-2.5 text-[13.5px] text-[var(--ink2)]"><Check className="size-4 shrink-0 text-[var(--good)]" />{t}</div>)}
      </Reveal>
    </section>
  )
}

/* ---------------------------------------------------------------- final cta + footer ---------------------------------------------------------------- */
export function FinalCta() {
  const nav = useNavigate()
  return (
    <section className="mx-auto max-w-6xl" style={{ padding: '0 var(--sec-x) var(--sec-y)' }}>
      <Reveal className="petal-card flex flex-col items-center gap-5 p-10 text-center md:p-16">
        <Bot className="size-8 text-[var(--accent)]" />
        <h2 className="petal-title max-w-md text-[32px] md:text-[42px]">Go live today.</h2>
        <p className="max-w-sm text-[14.5px] text-[var(--ink2)]">Your first service is online in under a minute. No card required to start.</p>
        <PetalBtn size="lg" onClick={() => nav('/site/register')}>Create a free account<ArrowRight className="size-4" /></PetalBtn>
      </Reveal>
    </section>
  )
}
export function Footer() {
  return (
    <footer className="petal-divider border-0 border-t" style={{ borderTopWidth: 1 }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-[12.5px] text-[var(--ink3)]" style={{ padding: '28px var(--sec-x)' }}>
        <span>© 2026 Blipmade</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2"><a href="/site/docs" className="hover:text-[var(--ink)]">Docs</a><a href="/site/status" className="hover:text-[var(--ink)]">Status</a><a href="/site/legal/terms" className="hover:text-[var(--ink)]">Terms</a><a href="/site/legal/privacy" className="hover:text-[var(--ink)]">Privacy</a></div>
      </div>
    </footer>
  )
}
