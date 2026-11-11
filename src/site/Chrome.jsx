/* Public-site chrome: mega-menu header (desktop hover/focus/keyboard via Radix NavigationMenu, mobile accordion panel)
   and the mega footer. Mock only: every link points at an existing /site route. */
import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import * as NM from '@radix-ui/react-navigation-menu'
import * as Collapsible from '@radix-ui/react-collapsible'
import { toast } from 'sonner'
import { ArrowRight, ArrowUp, BookOpen, Boxes, Check, ChevronDown, Cloud, Code2, Database, Gamepad2, GitBranch, Globe, LifeBuoy, Mail, Menu, Rocket, Server, ShieldCheck, Terminal, Users, X, Zap } from 'lucide-react'
import { Brand } from '../components/logos.jsx'
import { Button } from '../components/ui.jsx'
import { inputCls } from '../components/ui2.jsx'
import { DotNum } from '../components/DotViz.jsx'
import { DotText, Orb } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'
import { openCookieSettings } from './CookieConsent.jsx'
import { SearchButton } from '../components/Palette.jsx'

/* ------------------------------ menu content ------------------------------ */
const P = '/site/products/'
export const MENU = [
  {
    id: 'products', label: 'Products', width: 840,
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
    feature: { tag: 'Popular', t: 'Web hosting', d: 'Free SSL, daily backups and a site builder that writes the first draft for you.', price: 4, to: '/site/apps', cta: 'Browse the catalog' },
  },
  {
    id: 'solutions', label: 'Solutions', width: 800,
    cols: [
      { h: 'By team', items: [
        { t: 'Startups', d: 'Start on one VPS, grow without re-platforming.', to: '/site/products', I: Rocket },
        { t: 'Agencies', d: 'Client billing, access and per-site backups.', to: '/site/products', I: Users },
        { t: 'Game communities', d: 'Servers that stay up during the launch rush.', to: P + 'game', I: Gamepad2 },
      ] },
      { h: 'By need', items: [
        { t: 'Launch a site fast', d: 'Describe it, review it, publish it.', to: '/site/register', I: Zap },
        { t: 'Move from another host', d: 'Free migration with a Friday cutover window.', to: '/site/contact', I: GitBranch },
        { t: 'Security & compliance', d: 'Isolation, audit logs, 2FA everywhere.', to: '/site/legal/dpa', I: ShieldCheck },
      ] },
    ],
    feature: { tag: 'New', t: 'Site builder', d: 'Chat with an assistant, watch the site assemble, ship it to your own server.', to: '/site/register', cta: 'Try it free', orb: true },
  },
  {
    id: 'developers', label: 'Developers', width: 760,
    cols: [
      { h: 'Build', items: [
        { t: 'Documentation', d: 'Quick start, SSH, DNS and API guides.', to: '/site/docs', I: BookOpen },
        { t: 'API reference', d: 'Bearer-token REST API for every service.', to: '/site/docs', I: Code2 },
        { t: 'Changelog', d: 'What shipped, once a month.', to: '/site/changelog', I: Terminal },
      ] },
      { h: 'Operate', items: [
        { t: 'System status', d: 'Live regional health and incident history.', to: '/site/status', I: Boxes },
        { t: 'Support', d: 'Median first reply under 8 minutes.', to: '/site/login', I: LifeBuoy },
        { t: 'Blog', d: 'Product news, engineering notes and guides.', to: '/site/blog', I: BookOpen },
      ] },
    ],
    feature: { tag: 'CLI', t: 'Deploy in one line', d: 'blip deploy vps --plan pro --region fra', mono: true, to: '/site/docs', cta: 'Read the quick start' },
  },
]
const FLAT = [['/site/apps', 'Apps'], ['/site/products', 'Pricing'], ['/site/blog', 'Blog'], ['/site/status', 'Status']]

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
        <div className="mt-auto flex flex-col gap-3 pt-5">
          {f.price && <div className="flex items-end gap-1.5"><span className="pb-0.5 font-mono text-[10.5px] uppercase text-dim">from</span><DotNum text={'$' + f.price} height={22} animate={false} /><span className="shrink-0 whitespace-nowrap pb-0.5 text-[11px] text-dim">/ mo</span></div>}
          <span className="flex items-center gap-1 text-[12.5px] text-fg">{f.cta}<ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" /></span>
        </div>
      </NavLink>
    </NM.Link>
  )
}
function Panel({ m }) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-[1fr_1fr_232px] gap-4">
        {m.cols.map((c, ci) => (
          <div key={c.h}>
            <div className="mb-1.5 px-2.5 pt-1 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{c.h}</div>
            <ul className="space-y-0.5">{c.items.map((it, ii) => <li key={it.t} data-stagger style={{ '--s': ci * 3 + ii }}><MegaLink it={it} /></li>)}</ul>
          </div>
        ))}
        <div data-stagger style={{ '--s': 2 }}><Feature f={m.feature} /></div>
      </div>
      <div data-stagger style={{ '--s': 7 }} className="mx-1 mt-3 flex items-center justify-between border-t border-line px-1.5 pb-1 pt-3 text-[12.5px]">
        <NM.Link asChild><NavLink to="/site/status" className="flex items-center gap-2 text-mute outline-none hover:text-fg focus-visible:text-fg"><span className="size-2 rounded-full bg-warn shadow-[0_0_8px_var(--color-warn)]" />Partial degradation · Frankfurt, Ashburn</NavLink></NM.Link>
        <NM.Link asChild><NavLink to="/site/products" className="flex items-center gap-1 text-mute outline-none hover:text-fg focus-visible:text-fg">Compare all plans<ArrowRight className="size-3.5" /></NavLink></NM.Link>
      </div>
    </div>
  )
}

/* ------------------------------ dot wave ------------------------------ */
/* A ring of light travels across a dot grid that sits on the shared panel (the grid is the panel's own background,
   so the wave simply lights the dots that are already there). It starts at the notch under the new trigger, so a switch
   reads as the same panel being "re-tuned" rather than one panel replaced by another. */
const PITCH = 14
const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
function DotWash({ wash, vp }) {
  const cv = useRef(null)
  useEffect(() => {
    const c = cv.current, el = vp.current
    if (!wash.n || !c || !el || reducedMotion()) return
    const W = wash.w
    const H = parseFloat(getComputedStyle(el).getPropertyValue('--radix-navigation-menu-viewport-height')) || el.offsetHeight || 300
    const dpr = Math.min(devicePixelRatio || 1, 2)
    c.width = W * dpr; c.height = H * dpr
    const ctx = c.getContext('2d')
    const ox = wash.ox, maxR = Math.hypot(Math.max(ox, W - ox), H) + 70
    const cols = Math.ceil(W / PITCH), rows = Math.ceil(H / PITCH)
    const DUR = 640, BAND = 56
    let raf = 0, t0 = 0
    const frame = (now) => {
      if (!t0) t0 = now
      const t = Math.min(1, (now - t0) / DUR)
      const R = (1 - Math.pow(1 - t, 3)) * maxR
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H)
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x = i * PITCH + PITCH / 2, y = j * PITCH + PITCH / 2
        const d = Math.hypot(x - ox, y)
        const k = (d - R) / BAND
        const crest = Math.exp(-k * k)
        const trail = d < R ? 0.2 * Math.exp(-(R - d) / 150) : 0
        const a = Math.min(1, crest * 0.9 + trail) * (1 - t * 0.5)
        if (a < 0.025) continue
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`
        ctx.beginPath(); ctx.arc(x, y, 0.9 + crest * 1.5, 0, 6.2832); ctx.fill()
      }
      if (t < 1) raf = requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H) }
  }, [wash.n])
  return <canvas ref={cv} aria-hidden className="pointer-events-none absolute z-10 rounded-2xl" style={{ left: wash.left, top: 6, width: wash.w }} />
}

/* ------------------------------ mobile panel ------------------------------ */
function MobilePanel({ id, onClose }) {
  const nav = useNavigate()
  const [open, setOpen] = useState('products')
  const go = (to) => { onClose(); nav(to) }
  return (
    <div id={id} role="dialog" aria-label="Site menu" className="anim-menu absolute inset-x-0 top-full flex max-h-[calc(100dvh-96px)] flex-col overflow-hidden border-b border-line bg-bg lg:hidden" style={{ transformOrigin: '50% 0' }}>
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
  const [pos, setPos] = useState({ left: 0, notch: 60, w: 800 })   // where the shared panel sits under the active trigger
  const [glide, setGlide] = useState(false)                        // true when switching between menus: the panel slides, it does not jump
  const [wash, setWash] = useState({ n: 0, ox: 0, left: 0, w: 800 })
  const trig = useRef({})
  const vp = useRef(null)
  const was = useRef('')
  const btn = useRef(null)
  const head = useRef(null)
  const pid = useId()
  const close = () => setMob(false)
  const place = useCallback((v) => {
    const t = trig.current[v], h = head.current, m = MENU.find((x) => x.id === v)
    if (!t || !h || !m) return null
    const hr = h.getBoundingClientRect(), tr = t.getBoundingClientRect()
    const center = tr.left + tr.width / 2 - hr.left
    const w = Math.min(m.width, hr.width - 24)
    const left = Math.max(24, Math.min(center - w / 2, hr.width - w - 24))
    return { left, notch: Math.max(24, Math.min(center - left, w - 24)), w }
  }, [])
  useLayoutEffect(() => {
    if (!val) { was.current = ''; return }
    const p = place(val)
    if (!p) return
    setGlide(!!was.current)
    setPos(p)
    setWash((o) => ({ n: o.n + 1, ox: p.notch, left: p.left, w: p.w }))
    was.current = val
  }, [val, place])
  useEffect(() => {
    if (!val) return
    const f = () => { const p = place(val); if (p) { setGlide(false); setPos(p) } }
    addEventListener('resize', f)
    return () => removeEventListener('resize', f)
  }, [val, place])
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
    const mq = matchMedia('(min-width: 1024px)'), f = () => mq.matches && setMob(false)
    mq.addEventListener('change', f)
    return () => { removeEventListener('keydown', k); mq.removeEventListener('change', f); if (sc) sc.style.overflow = prev || '' }
  }, [mob])
  /* a string, not NavLink's className callback: Radix Slot would stringify a function className */
  const link = (to) => cn('rounded-lg px-3 py-1.5 text-[13.5px] outline-none transition-colors duration-150 focus-visible:text-fg', pathname.startsWith(to) ? 'text-fg' : 'text-mute hover:text-fg')
  return (
    <header ref={head} className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-6 border-b border-line bg-bg/90 px-5 backdrop-blur md:px-10">
      <NavLink to="/site" className="flex items-center gap-2" aria-label="Blipmade home"><Brand height={12} /></NavLink>
      <NM.Root value={val} onValueChange={setVal} delayDuration={110} skipDelayDuration={450} className="static hidden lg:block">
        <NM.List className="flex items-center gap-0.5">
          {MENU.map((m) => (
            <NM.Item key={m.id} value={m.id}>
              <NM.Trigger ref={(el) => { trig.current[m.id] = el }} className="group flex items-center gap-1 rounded-lg px-3 py-1.5 text-[13.5px] text-mute outline-none transition-colors duration-150 hover:text-fg focus-visible:text-fg data-[state=open]:text-fg">
                {m.label}<ChevronDown className="size-3 text-dim transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </NM.Trigger>
              <NM.Content className="mega-content absolute left-0 top-0" style={{ width: Math.min(m.width, 1200) }}><Panel m={m} /></NM.Content>
            </NM.Item>
          ))}
          {FLAT.map(([to, l]) => <NM.Item key={l}><NM.Link asChild><NavLink to={to} className={link(to)}>{l}</NavLink></NM.Link></NM.Item>)}
        </NM.List>
        <div aria-hidden className={cn('mega-dim pointer-events-none absolute inset-x-0 top-full h-screen bg-black/45', val ? 'opacity-100' : 'opacity-0')} />
        <div className="pointer-events-none absolute inset-x-0 top-full">
          {/* the notch follows the active trigger; the panel glides and resizes to the next menu instead of being replaced */}
          <span aria-hidden className="absolute z-20 size-3 rotate-45 rounded-[3px] border-l border-t border-line-2 bg-[#0b0b0d]" style={{ top: 1, left: pos.left + pos.notch - 6, opacity: val ? 1 : 0, transition: `${glide ? 'left 380ms var(--ease-out), ' : ''}opacity 180ms` }} />
          <NM.Viewport ref={vp} className="mega-viewport pointer-events-auto absolute overflow-hidden rounded-2xl border border-line-2 bg-[#0b0b0d] shadow-2xl shadow-black/70"
            style={{ top: 6, left: pos.left, width: 'var(--radix-navigation-menu-viewport-width)', backgroundImage: 'linear-gradient(to bottom, rgba(11,11,13,0) 0, #0b0b0d 96%), radial-gradient(rgba(255,255,255,.1) 1px, transparent 1.3px)', backgroundSize: '100% 100%, 14px 14px', transition: `height 360ms var(--ease-out), width 360ms var(--ease-out)${glide ? ', left 380ms var(--ease-out)' : ''}` }} />
          <DotWash wash={wash} vp={vp} />
        </div>
      </NM.Root>
      <div className="ml-auto hidden items-center gap-2 lg:flex"><SearchButton compact label="Search the site" /><Button variant="ghost" onClick={() => nav('/site/login')}>Log in</Button><Button onClick={() => nav('/site/register')}>Get started</Button></div>
      <SearchButton compact label="Search the site" className="ml-auto lg:hidden" /><button ref={btn} className="grid size-9 place-items-center rounded-lg text-mute outline-none transition-colors hover:text-fg focus-visible:text-fg lg:hidden" onClick={() => setMob((o) => !o)} aria-label={mob ? 'Close menu' : 'Open menu'} aria-expanded={mob} aria-controls={pid}>
        <span className="relative grid size-5 place-items-center"><Menu className={cn('absolute size-5 transition-[opacity,transform] duration-150', mob ? 'rotate-90 scale-50 opacity-0' : 'opacity-100')} /><X className={cn('absolute size-5 transition-[opacity,transform] duration-150', mob ? 'opacity-100' : '-rotate-90 scale-50 opacity-0')} /></span>
      </button>
      {mob && <MobilePanel id={pid} onClose={close} />}
    </header>
  )
}

/* ------------------------------ footer ------------------------------ */
/* The footer shares the header's language: a faint dot grid that the pointer lights up like a torch, a ring of light
   that sweeps across it when the footer first scrolls into view and whenever you subscribe, and links that
   assemble one after another. Everything stops when the footer is off screen and under reduced motion. */
const FPITCH = 16
const FooterDots = forwardRef(function FooterDots(_, ref) {
  const cv = useRef(null)
  const st = useRef({ w: 0, h: 0, mx: -1e4, my: -1e4, k: 0, waves: [], raf: 0, on: true, dpr: 1 })
  const draw = useCallback((now) => {
    const s = st.current, c = cv.current
    if (!c || !s.w) { s.raf = 0; return }
    const ctx = c.getContext('2d')
    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0); ctx.clearRect(0, 0, s.w, s.h)
    s.waves = s.waves.filter((w) => now - w.t0 < w.dur)
    s.k = s.hover ? Math.min(1, s.k + 0.12) : Math.max(0, s.k - 0.05)
    const cols = Math.ceil(s.w / FPITCH), rows = Math.ceil(s.h / FPITCH)
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * FPITCH + FPITCH / 2, y = j * FPITCH + FPITCH / 2
      let a = 0.055, r = 0.9
      if (s.k > 0.01) {
        const d = Math.hypot(x - s.mx, y - s.my)
        if (d < 170) { const f = Math.pow(1 - d / 170, 2) * s.k; a += f * 0.5; r += f * 1.1 }
      }
      for (const w of s.waves) {
        const e = now - w.t0, R = e * w.speed, k = (Math.hypot(x - w.x, y - w.y) - R) / 70
        const crest = Math.exp(-k * k) * (1 - e / w.dur)
        if (crest > 0.01) { a += crest * 0.65; r += crest * 1.3 }
      }
      ctx.fillStyle = `rgba(255,255,255,${Math.min(a, 0.9).toFixed(3)})`
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill()
    }
    s.raf = s.on && (s.waves.length || s.k > 0.01 || s.hover) ? requestAnimationFrame(draw) : 0
  }, [])
  const kick = useCallback(() => { const s = st.current; if (!s.raf && s.on) s.raf = requestAnimationFrame(draw) }, [draw])
  useImperativeHandle(ref, () => ({
    /* a ring of light from a point in client coordinates */
    pulse(cx, cy, dur = 1100) {
      const c = cv.current
      if (!c || reducedMotion()) return
      const r = c.getBoundingClientRect()
      st.current.waves.push({ x: cx - r.left, y: cy - r.top, t0: performance.now(), dur, speed: 1.15 })
      kick()
    },
    move(cx, cy) {
      const c = cv.current
      if (!c || reducedMotion()) return
      const r = c.getBoundingClientRect(), s = st.current
      s.mx = cx - r.left; s.my = cy - r.top; s.hover = true; kick()
    },
    leave() { st.current.hover = false; kick() },
  }), [kick])
  useEffect(() => {
    const c = cv.current, p = c?.parentElement
    if (!c || !p) return
    const s = st.current
    const size = () => {
      s.dpr = Math.min(devicePixelRatio || 1, 2); s.w = p.clientWidth; s.h = p.clientHeight
      c.width = s.w * s.dpr; c.height = s.h * s.dpr
      kick()
    }
    size()
    const ro = new ResizeObserver(size); ro.observe(p)
    /* idle when off screen or in a hidden tab */
    const io = new IntersectionObserver(([e]) => { s.on = e.isIntersecting && !document.hidden; if (s.on) kick() })
    io.observe(p)
    return () => { ro.disconnect(); io.disconnect(); cancelAnimationFrame(s.raf); s.raf = 0 }
  }, [kick])
  return <canvas ref={cv} aria-hidden className="pointer-events-none absolute inset-0 z-0 size-full" />
})

/* The oversized wordmark is drawn from the same dot glyphs as every other dot-matrix text, but on a canvas so it can
   move: the letters rise out of the bottom edge one column after another when the footer is first seen, a soft band of
   light passes through every few seconds (no pointer reaction on purpose: it was too much). Only the top half of the word shows (the rest is cropped), so it always reads as "more below". */
function DotWordmark({ seen }) {
  const box = useRef(null), cv = useRef(null), host = useRef(null)
  const st = useRef({ pts: [], w: 0, h: 0, dpr: 1, t0: 0, raf: 0, on: true, seen: false })
  st.current.seen = seen
  useEffect(() => {
    const c = cv.current, b = box.current, s = st.current
    if (!c || !b) return
    /* read the glyph dots out of the (hidden) DotText svg: positions are in its viewBox units */
    const svg = host.current?.querySelector('svg')
    const vb = (svg?.getAttribute('viewBox') || '-0.5 -0.5 45 7').split(' ').map(Number)
    const raw = svg ? [...svg.querySelectorAll('circle')].map((n) => [+n.getAttribute('cx'), +n.getAttribute('cy')]) : []
    s.vb = vb; s.raw = raw
    const reduce = reducedMotion()
    const place = () => {
      s.dpr = Math.min(devicePixelRatio || 1, 2); s.w = b.clientWidth
      s.h = s.w * (vb[3] / vb[2])            // the canvas holds the whole word; the box crops it to half
      c.width = s.w * s.dpr; c.height = s.h * s.dpr; c.style.height = s.h + 'px'
      const u = s.w / vb[2]
      const old = s.pts
      s.pts = raw.map(([cx, cy], i) => ({ x: (cx - vb[0]) * u, y: (cy - vb[1]) * u, col: cx, ox: old[i]?.ox || 0, oy: old[i]?.oy || 0 }))
      s.r = 0.4 * u
    }
    place()
    const draw = (now) => {
      s.raf = 0
      const ctx = c.getContext('2d')
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0); ctx.clearRect(0, 0, s.w, s.h)
      if (!s.seen) return   // idle until the footer has been seen; the effect on `seen` restarts the loop
      if (!s.t0) s.t0 = now
      const el = now - s.t0
      const bx = (((now / 1000) % 9) / 9) * s.w * 1.5 - s.w * 0.25
      for (const p of s.pts) {
        const k = reduce ? 1 : Math.min(1, Math.max(0, (el - p.col * 24) / 700))
        const e = 1 - Math.pow(1 - k, 3)
        if (e <= 0) continue
        let a = 0.17 * e
        if (!reduce) a += Math.exp(-Math.pow((p.x - bx) / (s.w * 0.07), 2)) * 0.13 * e
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y + (1 - e) * s.h * 0.4, s.r, 0, 6.2832)
        ctx.fill()
      }
      if (s.on && !reduce) s.raf = requestAnimationFrame(draw)
    }
    const kick = () => { if (!s.raf) s.raf = requestAnimationFrame(draw) }
    s.kick = kick
    kick()
    const ro = new ResizeObserver(() => { place(); kick() }); ro.observe(b)
    const io = new IntersectionObserver(([e]) => { s.on = e.isIntersecting && !document.hidden; if (s.on) kick() }); io.observe(b)
    return () => { ro.disconnect(); io.disconnect(); cancelAnimationFrame(s.raf); s.raf = 0 }
  }, [])
  useEffect(() => { st.current.kick?.() }, [seen])
  return (
    <div ref={box} aria-hidden="true" className="pointer-events-none relative mt-2 aspect-[90/7] w-full select-none overflow-hidden px-3 md:px-6 [mask-image:linear-gradient(to_bottom,#000_35%,transparent)]">
      <div ref={host} hidden><DotText text="BLIPMADE" height={80} /></div>
      <canvas ref={cv} className="absolute left-0 top-0 w-full" />
    </div>
  )
}

/* true once the element has been on screen; a throttled scroll check backs up IntersectionObserver for fast drags */
function useSeenOnce(ref, margin = '0px 0px -6% 0px') {
  const [seen, setSeen] = useState(typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true) }, { rootMargin: margin })
    io.observe(el)
    let raf = 0
    const check = () => { raf = 0; if (el.getBoundingClientRect().top < innerHeight * 0.95) setSeen(true) }
    /* a timeout, not rAF: animation frames do not run in a background tab, and the content must still appear */
    const onScroll = () => { if (!raf) raf = window.setTimeout(check, 50) }
    addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => { io.disconnect(); clearTimeout(raf); removeEventListener('scroll', onScroll, { capture: true }) }
  }, [seen])
  return seen
}

const COLS = [
  ['Hosting', [['Web hosting', P + 'web'], ['VPS', P + 'vps'], ['Game servers', '/site/apps'], ['Databases', P + 'db'], ['Email hosting', P + 'mail'], ['Domains', P + 'dom']]],
  ['Solutions', [['Startups', '/site/products'], ['Agencies', '/site/products'], ['Game communities', P + 'game'], ['Migrations', '/site/docs'], ['Site builder', '/site/register']]],
  ['Developers', [['Documentation', '/site/docs'], ['API reference', '/site/docs'], ['CLI', '/site/docs'], ['System status', '/site/status'], ['Changelog', '/site/changelog']]],
  ['Company', [['Blog', '/site/blog'], ['Changelog', '/site/changelog'], ['Contact', '/site/contact'], ['Support', '/site/login'], ['Client area', '/site/login']]],
  ['Legal', [['Terms of service', '/site/legal/terms'], ['Privacy policy', '/site/legal/privacy'], ['Acceptable use', '/site/legal/aup'], ['SLA', '/site/legal/sla'], ['DPA', '/site/legal/dpa'], ['Cookie policy', '/site/legal/cookies']]],
]

/* idle -> sending -> done: the button itself reports the result, and a ring of light leaves it */
function Newsletter({ onSent }) {
  const [v, setV] = useState('')
  const [touched, setTouched] = useState(false)
  const [phase, setPhase] = useState('idle')
  const btn = useRef(null)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const bad = touched && !/^\S+@\S+\.\S+$/.test(v.trim())
  const submit = (e) => {
    e.preventDefault(); setTouched(true)
    if (phase !== 'idle' || !/^\S+@\S+\.\S+$/.test(v.trim())) return
    setPhase('sending')
    timer.current = setTimeout(() => {
      setPhase('done')
      const r = btn.current?.getBoundingClientRect()
      if (r) onSent(r.left + r.width / 2, r.top + r.height / 2)
      timer.current = setTimeout(() => { setPhase('idle'); setV(''); setTouched(false) }, 2600)
    }, 900)
  }
  const done = phase === 'done'
  return (
    <form onSubmit={submit} noValidate className="w-full max-w-sm">
      <label htmlFor="nl" className="mb-2 block font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Changelog &amp; incident digest</label>
      <div className="flex gap-2">
        <input id="nl" type="email" value={v} disabled={phase !== 'idle'} onChange={(e) => setV(e.target.value)} onBlur={() => v && setTouched(true)} placeholder="you@example.com" aria-invalid={bad || undefined} aria-describedby={bad ? 'nl-err' : undefined} className={cn(inputCls(bad), 'min-w-0 flex-1 transition-opacity duration-200', done && 'opacity-60')} />
        <span ref={btn} className="relative">
          <Button type="submit" variant="outline" loading={phase === 'sending'} className={cn('min-w-[108px] transition-[border-color,color] duration-200', done && 'border-ok/50 text-ok')}>
            <span className="relative grid place-items-center">
              <span className={cn('transition-[opacity,transform] duration-200', done ? 'scale-75 opacity-0' : 'opacity-100')}>Subscribe</span>
              <span aria-hidden className={cn('absolute inline-flex items-center gap-1.5 transition-[opacity,transform] duration-200', done ? 'opacity-100' : 'scale-75 opacity-0')}><Check className="size-4" />Done</span>
            </span>
          </Button>
        </span>
      </div>
      <p id="nl-err" className={cn('mt-1.5 h-4 text-[12px] transition-[opacity,color] duration-150', bad ? 'text-bad opacity-100' : done ? 'text-ok opacity-100' : 'opacity-0')} aria-live="polite">{bad ? 'Enter a valid email address' : done ? 'Subscribed. Check your inbox (simulated).' : ''}</p>
    </form>
  )
}

/* `cta`: the home page ends with its own call to action, so it skips the footer's band */
export function SiteFooter({ cta = true }) {
  const nav = useNavigate()
  const root = useRef(null)
  const dots = useRef(null)
  const seen = useSeenOnce(root)
  const fired = useRef(false)
  /* the first time the footer is seen, a ring of light sweeps in from the lower left */
  useEffect(() => {
    if (!seen || fired.current) return
    fired.current = true
    const r = root.current?.getBoundingClientRect()
    if (r) dots.current?.pulse(r.left + r.width * 0.12, r.bottom - 40, 1500)
  }, [seen])
  const rise = (i) => ({ className: seen ? 'anim-rise' : 'opacity-0', style: { '--i': i } })
  const top = () => { const sc = root.current?.closest('.overflow-y-auto'); sc?.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }) }
  return (
    <footer ref={root} onPointerMove={(e) => e.pointerType !== 'touch' && dots.current?.move(e.clientX, e.clientY)} onPointerLeave={() => dots.current?.leave()} className="relative shrink-0 overflow-hidden border-t border-line bg-bg">
      <FooterDots ref={dots} />
      <div className="relative z-10">
        {cta && <div className="border-b border-line px-5 py-12 md:px-10 md:py-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div {...rise(0)}><div className="flex items-center gap-5">
              <Orb size={56} className="shrink-0" />
              <div><h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Ship something today.</h2><p className="mt-1.5 text-[14px] text-mute">Free to start. No card required. Cancel from the client area.</p></div>
            </div></div>
            <div {...rise(1)}><div className="flex flex-col gap-2 sm:flex-row"><Button size="lg" onClick={() => nav('/site/register')}>Get started</Button><Button size="lg" variant="outline" onClick={() => nav('/site/products')}>Compare plans</Button></div></div>
          </div>
        </div>}
        <div className="px-5 py-12 md:px-10">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.25fr_3fr]">
            <div className="space-y-6">
              <div {...rise(0)}><Brand height={12} /></div>
              <p {...rise(1)} className={cn('max-w-xs text-[13px] leading-relaxed text-dim', rise(1).className)}>Hosting that stays out of your way. VPS, web, databases, email and domains from one client area.</p>
              <div {...rise(2)}><Newsletter onSent={(x, y) => dots.current?.pulse(x, y, 1300)} /></div>
              <div {...rise(3)}><NavLink to="/site/status" className="group inline-flex items-center gap-2 rounded-full border border-line-2 px-3 py-1.5 text-[12.5px] text-mute outline-none transition-colors hover:border-white/25 hover:text-fg focus-visible:border-white/40">
                <span className="relative grid size-2 place-items-center"><span className="absolute size-2 animate-ping rounded-full bg-warn/60 [animation-duration:2.4s]" /><span className="relative size-2 rounded-full bg-warn shadow-[0_0_8px_var(--color-warn)]" /></span>Partial degradation<ArrowRight className="-ml-1 size-3 w-0 opacity-0 transition-[width,opacity,margin] duration-200 ease-[var(--ease-out)] group-hover:ml-0 group-hover:w-3 group-hover:opacity-100" />
              </NavLink></div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 md:grid-cols-5 lg:gap-x-4">
              {COLS.map(([h, ls], ci) => (
                <nav key={h} aria-label={h} {...rise(ci + 1)}>
                  <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{h}</div>
                  <ul className="space-y-2 text-[13px]">{ls.map(([l, to]) => (
                    <li key={l}><NavLink to={to} className="group relative inline-block rounded py-0.5 text-mute outline-none transition-[color,transform] duration-200 ease-[var(--ease-out)] hover:translate-x-0.5 hover:text-fg focus-visible:text-fg">
                      {l}<span aria-hidden className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-fg/50 transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                    </NavLink></li>
                  ))}</ul>
                </nav>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-line px-5 py-5 md:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 text-[12.5px] text-dim md:flex-row md:items-center md:justify-between">
            <div>© 2026 Blipmade. All rights reserved. Mock-up: no real services.</div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10.5px] uppercase tracking-[.08em]"><span>Frankfurt · Amsterdam · Helsinki · Ashburn</span><span>EN · EUR</span>
              <button type="button" onClick={openCookieSettings} className="uppercase tracking-[.08em] text-dim underline-offset-4 outline-none transition-colors hover:text-fg hover:underline focus-visible:text-fg">Cookie settings</button>
              <button type="button" onClick={top} className="group inline-flex items-center gap-1.5 rounded-md border border-line-2 px-2.5 py-1 uppercase tracking-[.08em] text-mute outline-none transition-[color,border-color] duration-150 hover:border-white/25 hover:text-fg focus-visible:border-white/40" aria-label="Back to top">Top<ArrowUp className="size-3 transition-transform duration-200 ease-[var(--ease-out)] group-hover:-translate-y-0.5" /></button>
            </div>
          </div>
        </div>
        <DotWordmark seen={seen} />
      </div>
    </footer>
  )
}
