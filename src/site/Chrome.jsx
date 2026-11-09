/* Public-site chrome: mega-menu header (desktop hover/focus/keyboard via Radix NavigationMenu, mobile accordion panel)
   and the mega footer. Mock only: every link points at an existing /site route. */
import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import * as NM from '@radix-ui/react-navigation-menu'
import * as Collapsible from '@radix-ui/react-collapsible'
import { toast } from 'sonner'
import { ArrowRight, BookOpen, Boxes, ChevronDown, Cloud, Code2, Database, Gamepad2, GitBranch, Globe, LifeBuoy, Mail, Menu, Rocket, Server, ShieldCheck, Terminal, Users, X, Zap } from 'lucide-react'
import { Brand } from '../components/logos.jsx'
import { Button } from '../components/ui.jsx'
import { inputCls } from '../components/ui2.jsx'
import { DotNum } from '../components/DotViz.jsx'
import { DotText, Orb } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'

/* ------------------------------ menu content ------------------------------ */
const P = '/site/products/'
export const MENU = [
  {
    id: 'products', label: 'Products',
    cols: [
      { h: 'Hosting', items: [
        { t: 'Web hosting', d: 'Managed PHP, static and Node sites.', to: P + 'web', I: Globe },
        { t: 'VPS', d: 'NVMe servers with full root access.', to: P + 'vps', I: Server },
        { t: 'Game servers', d: 'One-click Minecraft, Rust, CS2.', to: P + 'game', I: Gamepad2 },
      ] },
      { h: 'Data & identity', items: [
        { t: 'Databases', d: 'PostgreSQL, MySQL and Redis with backups.', to: P + 'db', I: Database },
        { t: 'Email hosting', d: 'Business mailboxes on your domain.', to: P + 'mail', I: Mail },
        { t: 'Domains', d: 'Register and transfer, WHOIS privacy included.', to: P + 'dom', I: Cloud },
      ] },
    ],
    feature: { tag: 'Popular', t: 'Web hosting', d: 'Free SSL, daily backups and a site builder that writes the first draft for you.', price: 4, to: P + 'web', cta: 'See plans' },
  },
  {
    id: 'solutions', label: 'Solutions',
    cols: [
      { h: 'By team', items: [
        { t: 'Startups', d: 'Start on one VPS, grow without re-platforming.', to: '/site/products', I: Rocket },
        { t: 'Agencies', d: 'Client billing, access and per-site backups.', to: '/site/products', I: Users },
        { t: 'Game communities', d: 'Servers that stay up during the launch rush.', to: P + 'game', I: Gamepad2 },
      ] },
      { h: 'By need', items: [
        { t: 'Launch a site fast', d: 'Describe it, review it, publish it.', to: '/site/register', I: Zap },
        { t: 'Move from another host', d: 'Free migration with a Friday cutover window.', to: '/site/docs', I: GitBranch },
        { t: 'Security & compliance', d: 'Isolation, audit logs, 2FA everywhere.', to: '/site/legal', I: ShieldCheck },
      ] },
    ],
    feature: { tag: 'New', t: 'Site builder', d: 'Chat with an assistant, watch the site assemble, ship it to your own server.', to: '/site/register', cta: 'Try it free', orb: true },
  },
  {
    id: 'developers', label: 'Developers',
    cols: [
      { h: 'Build', items: [
        { t: 'Documentation', d: 'Quick start, SSH, DNS and API guides.', to: '/site/docs', I: BookOpen },
        { t: 'API reference', d: 'Bearer-token REST API for every service.', to: '/site/docs', I: Code2 },
        { t: 'CLI', d: 'Deploy and manage from your terminal.', to: '/site/docs', I: Terminal },
      ] },
      { h: 'Operate', items: [
        { t: 'System status', d: 'Live regional health and incident history.', to: '/site/status', I: Boxes },
        { t: 'Support', d: 'Median first reply under 8 minutes.', to: '/site/login', I: LifeBuoy },
      ] },
    ],
    feature: { tag: 'CLI', t: 'Deploy in one line', d: 'blip deploy vps --plan pro --region fra', mono: true, to: '/site/docs', cta: 'Read the quick start' },
  },
]
const FLAT = [['/site/products', 'Pricing'], ['/site/status', 'Status']]

/* ------------------------------ desktop mega panel ------------------------------ */
function MegaLink({ it }) {
  return (
    <NM.Link asChild>
      <NavLink to={it.to} className="group flex items-start gap-3 rounded-xl p-2.5 outline-none transition-colors duration-150 hover:bg-hover focus-visible:bg-hover">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line-2 bg-card text-mute transition-colors duration-150 group-hover:text-fg"><it.I className="size-4" /></span>
        <span className="min-w-0"><span className="block text-[13.5px] font-medium text-fg">{it.t}</span><span className="mt-0.5 block text-[12.5px] leading-snug text-dim">{it.d}</span></span>
      </NavLink>
    </NM.Link>
  )
}
function Feature({ f }) {
  return (
    <NM.Link asChild>
      <NavLink to={f.to} className="group relative flex flex-col overflow-hidden rounded-xl border border-line-2 bg-card p-5 outline-none transition-colors duration-150 hover:border-white/25 focus-visible:border-white/40">
        <div className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{f.tag}{f.orb && <Orb size={28} />}</div>
        <div className="mt-3 text-[15px] font-semibold tracking-tight">{f.t}</div>
        <p className={cn('mt-1.5 text-[12.5px] leading-snug text-mute', f.mono && 'rounded-md border border-line bg-black/40 p-2.5 font-mono text-[12px] text-fg')}>{f.d}</p>
        <div className="mt-auto flex items-end justify-between pt-5">
          {f.price ? <div className="flex items-end gap-1.5"><span className="pb-0.5 font-mono text-[10.5px] uppercase text-dim">from</span><DotNum text={'$' + f.price} height={22} animate={false} /><span className="pb-0.5 text-[11px] text-dim">/ mo</span></div> : <span />}
          <span className="flex items-center gap-1 text-[12.5px] text-fg">{f.cta}<ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" /></span>
        </div>
      </NavLink>
    </NM.Link>
  )
}
function Panel({ m }) {
  return (
    <div className="mx-auto max-w-6xl px-10">
      <div className="grid grid-cols-[1fr_1fr_280px] gap-8 py-7">
        {m.cols.map((c) => (
          <div key={c.h}>
            <div className="mb-2 px-2.5 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{c.h}</div>
            <ul className="space-y-0.5">{c.items.map((it) => <li key={it.t}><MegaLink it={it} /></li>)}</ul>
          </div>
        ))}
        <Feature f={m.feature} />
      </div>
      <div className="flex items-center justify-between border-t border-line py-3 text-[12.5px]">
        <NM.Link asChild><NavLink to="/site/status" className="flex items-center gap-2 text-mute outline-none hover:text-fg focus-visible:text-fg"><span className="size-2 rounded-full bg-warn shadow-[0_0_8px_var(--color-warn)]" />Partial degradation · Frankfurt, Ashburn</NavLink></NM.Link>
        <NM.Link asChild><NavLink to="/site/products" className="flex items-center gap-1 text-mute outline-none hover:text-fg focus-visible:text-fg">Compare all plans<ArrowRight className="size-3.5" /></NavLink></NM.Link>
      </div>
    </div>
  )
}

/* ------------------------------ mobile panel ------------------------------ */
function MobilePanel({ id, onClose }) {
  const nav = useNavigate()
  const [open, setOpen] = useState('products')
  const go = (to) => { onClose(); nav(to) }
  return (
    <div id={id} role="dialog" aria-label="Site menu" className="anim-menu absolute inset-x-0 top-full flex max-h-[calc(100dvh-96px)] flex-col overflow-hidden border-b border-line bg-bg md:hidden" style={{ transformOrigin: '50% 0' }}>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4 pt-2">
        {MENU.map((m) => (
          <Collapsible.Root key={m.id} open={open === m.id} onOpenChange={(o) => setOpen(o ? m.id : '')} className="border-b border-line">
            <Collapsible.Trigger className="flex h-12 w-full items-center justify-between text-[15px] font-medium outline-none focus-visible:text-fg">
              {m.label}<ChevronDown className={cn('size-4 text-dim transition-transform duration-200', open === m.id && 'rotate-180')} />
            </Collapsible.Trigger>
            <Collapsible.Content className="anim-collapse overflow-hidden">
              <div className="space-y-4 pb-4">
                {m.cols.map((c) => (
                  <div key={c.h}>
                    <div className="mb-1 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{c.h}</div>
                    {c.items.map((it) => (
                      <button key={it.t} onClick={() => go(it.to)} className="flex w-full items-start gap-3 rounded-lg py-2.5 text-left outline-none active:bg-hover focus-visible:bg-hover">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line-2 bg-card text-mute"><it.I className="size-4" /></span>
                        <span><span className="block text-[14px] font-medium">{it.t}</span><span className="block text-[12.5px] leading-snug text-dim">{it.d}</span></span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        ))}
        {FLAT.map(([to, l]) => <button key={l} onClick={() => go(to)} className="flex h-12 w-full items-center justify-between border-b border-line text-left text-[15px] font-medium outline-none focus-visible:text-fg">{l}<ArrowRight className="size-4 text-dim" /></button>)}
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-line bg-bg p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <Button variant="outline" size="lg" onClick={() => go('/site/login')}>Log in</Button>
        <Button size="lg" onClick={() => go('/site/register')}>Get started</Button>
      </div>
    </div>
  )
}

/* ------------------------------ header ------------------------------ */
export function SiteHeader() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [mob, setMob] = useState(false)
  const [val, setVal] = useState('')
  const btn = useRef(null)
  const head = useRef(null)
  const pid = useId()
  const close = () => setMob(false)
  useEffect(() => { setMob(false); setVal('') }, [pathname])
  /* mobile panel: Esc closes (focus back on the toggle), the page behind it stops scrolling */
  useEffect(() => {
    if (!mob) return
    const sc = head.current?.parentElement
    const prev = sc?.style.overflow
    if (sc) sc.style.overflow = 'hidden'
    const k = (e) => { if (e.key === 'Escape') { setMob(false); btn.current?.focus() } }
    addEventListener('keydown', k)
    /* resizing up to the desktop layout would leave the panel logically open, so close it */
    const mq = matchMedia('(min-width: 768px)'), f = () => mq.matches && setMob(false)
    mq.addEventListener('change', f)
    return () => { removeEventListener('keydown', k); mq.removeEventListener('change', f); if (sc) sc.style.overflow = prev || '' }
  }, [mob])
  /* a string, not NavLink's className callback: Radix Slot would stringify a function className */
  const link = (to) => cn('rounded-lg px-3 py-1.5 text-[13.5px] outline-none transition-colors duration-150 focus-visible:text-fg', pathname.startsWith(to) ? 'text-fg' : 'text-mute hover:text-fg')
  return (
    <header ref={head} className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-6 border-b border-line bg-bg/90 px-5 backdrop-blur md:px-10">
      <NavLink to="/site" className="flex items-center gap-2" aria-label="Blipmade home"><Brand height={12} /></NavLink>
      <NM.Root value={val} onValueChange={setVal} delayDuration={80} skipDelayDuration={300} className="static hidden md:block">
        <NM.List className="flex items-center gap-0.5">
          {MENU.map((m) => (
            <NM.Item key={m.id} value={m.id}>
              <NM.Trigger className="group flex items-center gap-1 rounded-lg px-3 py-1.5 text-[13.5px] text-mute outline-none transition-colors duration-150 hover:text-fg focus-visible:text-fg data-[state=open]:text-fg">
                {m.label}<ChevronDown className="size-3 text-dim transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </NM.Trigger>
              <NM.Content className="mega-content absolute inset-x-0 top-0"><Panel m={m} /></NM.Content>
            </NM.Item>
          ))}
          {FLAT.map(([to, l]) => <NM.Item key={l}><NM.Link asChild><NavLink to={to} className={link(to)}>{l}</NavLink></NM.Link></NM.Item>)}
        </NM.List>
        <div className="absolute inset-x-0 top-full flex justify-center">
          <NM.Viewport className="mega-viewport relative w-full overflow-hidden border-b border-line bg-[#0b0b0d] shadow-2xl shadow-black/60" />
        </div>
      </NM.Root>
      <div className="ml-auto hidden items-center gap-2 md:flex"><Button variant="ghost" onClick={() => nav('/site/login')}>Log in</Button><Button onClick={() => nav('/site/register')}>Get started</Button></div>
      <button ref={btn} className="ml-auto grid size-9 place-items-center rounded-lg text-mute outline-none transition-colors hover:text-fg focus-visible:text-fg md:hidden" onClick={() => setMob((o) => !o)} aria-label={mob ? 'Close menu' : 'Open menu'} aria-expanded={mob} aria-controls={pid}>
        <span className="relative grid size-5 place-items-center"><Menu className={cn('absolute size-5 transition-[opacity,transform] duration-150', mob ? 'rotate-90 scale-50 opacity-0' : 'opacity-100')} /><X className={cn('absolute size-5 transition-[opacity,transform] duration-150', mob ? 'opacity-100' : '-rotate-90 scale-50 opacity-0')} /></span>
      </button>
      {mob && <MobilePanel id={pid} onClose={close} />}
    </header>
  )
}

/* ------------------------------ footer ------------------------------ */
const COLS = [
  ['Hosting', [['Web hosting', P + 'web'], ['VPS', P + 'vps'], ['Game servers', P + 'game'], ['Databases', P + 'db'], ['Email hosting', P + 'mail'], ['Domains', P + 'dom']]],
  ['Solutions', [['Startups', '/site/products'], ['Agencies', '/site/products'], ['Game communities', P + 'game'], ['Migrations', '/site/docs'], ['Site builder', '/site/register']]],
  ['Developers', [['Documentation', '/site/docs'], ['API reference', '/site/docs'], ['CLI', '/site/docs'], ['System status', '/site/status'], ['Changelog', '/site/docs']]],
  ['Company', [['About', '/site'], ['Careers', '/site'], ['Support', '/site/login'], ['Contact', '/site/login'], ['Client area', '/site/login']]],
  ['Legal', [['Terms of service', '/site/legal'], ['Privacy policy', '/site/legal'], ['Acceptable use', '/site/legal'], ['SLA', '/site/legal'], ['DPA', '/site/legal']]],
]
function Newsletter() {
  const [v, setV] = useState('')
  const [touched, setTouched] = useState(false)
  const bad = touched && !/^\S+@\S+\.\S+$/.test(v.trim())
  const submit = (e) => {
    e.preventDefault(); setTouched(true)
    if (!/^\S+@\S+\.\S+$/.test(v.trim())) return
    toast.success('Subscribed (simulated)'); setV(''); setTouched(false)
  }
  return (
    <form onSubmit={submit} noValidate className="w-full max-w-sm">
      <label htmlFor="nl" className="mb-2 block font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Changelog &amp; incident digest</label>
      <div className="flex gap-2">
        <input id="nl" type="email" value={v} onChange={(e) => setV(e.target.value)} onBlur={() => v && setTouched(true)} placeholder="you@example.com" aria-invalid={bad || undefined} aria-describedby={bad ? 'nl-err' : undefined} className={cn(inputCls(bad), 'min-w-0 flex-1')} />
        <Button type="submit" variant="outline">Subscribe</Button>
      </div>
      <p id="nl-err" className={cn('mt-1.5 h-4 text-[12px] text-bad transition-opacity duration-150', bad ? 'opacity-100' : 'opacity-0')} aria-live="polite">{bad ? 'Enter a valid email address' : ''}</p>
    </form>
  )
}
/* `cta`: the home page ends with its own call to action, so it skips the footer's band */
export function SiteFooter({ cta = true }) {
  const nav = useNavigate()
  return (
    <footer className="relative shrink-0 overflow-hidden border-t border-line bg-bg">
      {/* call to action band */}
      {cta && <div className="border-b border-line px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <Orb size={56} className="shrink-0" />
            <div><h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Ship something today.</h2><p className="mt-1.5 text-[14px] text-mute">Free to start. No card required. Cancel from the client area.</p></div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row"><Button size="lg" onClick={() => nav('/site/register')}>Get started</Button><Button size="lg" variant="outline" onClick={() => nav('/site/products')}>Compare plans</Button></div>
        </div>
      </div>}
      {/* link grid */}
      <div className="px-5 py-12 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.25fr_3fr]">
          <div className="space-y-6">
            <Brand height={12} />
            <p className="max-w-xs text-[13px] leading-relaxed text-dim">Hosting that stays out of your way. VPS, web, databases, email and domains from one client area.</p>
            <Newsletter />
            <NavLink to="/site/status" className="inline-flex items-center gap-2 rounded-full border border-line-2 px-3 py-1.5 text-[12.5px] text-mute outline-none transition-colors hover:border-white/25 hover:text-fg focus-visible:border-white/40"><span className="size-2 rounded-full bg-warn shadow-[0_0_8px_var(--color-warn)]" />Partial degradation</NavLink>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 md:grid-cols-5 lg:gap-x-4">
            {COLS.map(([h, ls]) => (
              <nav key={h} aria-label={h}>
                <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{h}</div>
                <ul className="space-y-2 text-[13px]">{ls.map(([l, to]) => <li key={l}><NavLink to={to} className="block rounded text-mute outline-none transition-colors duration-150 hover:text-fg focus-visible:text-fg">{l}</NavLink></li>)}</ul>
              </nav>
            ))}
          </div>
        </div>
      </div>
      {/* legal bar + wordmark */}
      <div className="border-t border-line px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-[12.5px] text-dim md:flex-row md:items-center md:justify-between">
          <div>© 2026 Blipmade. All rights reserved. Mock-up: no real services.</div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10.5px] uppercase tracking-[.08em]"><span>Frankfurt · Amsterdam · Helsinki · Ashburn</span><span>EN · EUR</span></div>
        </div>
      </div>
      {/* oversized wordmark: spans the full width and is cropped at the bottom edge, so only its top half shows
          (viewBox is 45x7, so half the glyph height is an aspect of 90 / 7) */}
      <div aria-hidden="true" className="pointer-events-none relative mt-2 aspect-[90/7] w-full select-none overflow-hidden px-3 opacity-[.2] md:px-6 [mask-image:linear-gradient(to_bottom,#000_35%,transparent)]">
        <DotText text="BLIPMADE" height={80} className="!flex !w-full [&_svg]:!h-auto [&_svg]:!w-full [&_svg]:!max-w-none" />
      </div>
    </footer>
  )
}
