/* Scene 1: nav + hero + the interface composition beneath it. Built after the deck/pill/accordion version was
   rejected a second time for still reading as "a generic SaaS template" underneath Graphical's mechanisms. Corrections
   applied here, from the reference studied at 1440 and 390px:
   - The hero is compact (restrained display size, a 560px text column, 2-3 lines), not a giant responsive headline.
   - No right-hand column of cards next to the hero text. The composition is its own scene, full width, well below.
   - The inline kinetic element is two independent pills inside one real sentence (Graphical: "...visual {pill}
     themes, customize {pill} colors..."), not one word cycling through synonyms of the same thing.
   - Every artifact in the composition is a small, detailed, believable product screen (a header, real controls,
     a data row or a chart, a status chip) — not an icon, a title and two lines.
   - One or two dominant panels, two or three medium supporting ones, a couple of small foreground/background
     details, distinct z-index, mixed light/dark/accent surfaces, real bounding-box overlap, a loose arc.
   This file is intentionally kept separate from sections.jsx: nothing below this scene has been re-worked yet. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, AtSign, Bot, Check, ChevronRight, Database, Gamepad2, Globe, Lock, Mail, Pause, Play, Server, ShieldCheck, Terminal } from 'lucide-react'
import { cn } from '../lib/utils'
import { useReveal } from './useReveal.js'

const Eyebrow = ({ children, className }) => <div className={cn('petal-label', className)}>{children}</div>
function Reveal({ as: T = 'div', i = 0, className, children, style }) {
  const [ref, seen] = useReveal()
  return <T ref={ref} data-seen={seen || undefined} className={cn('p-reveal', className)} style={{ '--d': i, ...style }}>{children}</T>
}

/* ================================================================== nav ================================================================== */
export function Nav() {
  const nav = useNavigate()
  /* Graphical's own header is not a conventional bar at all: it's two small links,
     absolutely positioned top-right, nothing top-left — the wordmark lives in the hero
     itself (see the pill badge in Hero below), not in persistent chrome. Matching that
     restraint directly, instead of the usual logo-left/links-center/actions-right bar. */
  return (
    <header className="absolute right-0 top-0 z-30 flex items-center gap-1" style={{ padding: 'var(--sec-x)' }}>
      <button onClick={() => nav('/site/login')} className="h-8 items-center rounded-full px-3.5 text-[13px] font-medium text-[var(--ink3)] transition-colors hover:text-[var(--ink)] inline-flex">Log in</button>
      <button onClick={() => nav('/site/register')} className="petal-btn petal-btn-accent h-8 px-3.5 text-[13px]">Get started</button>
    </header>
  )
}

/* ================================================================== hero ================================================================== */
/* two independent pills inside one real sentence, each cycling through its own short set, on its own timer. */
function Pill({ options, period = 2200, phase = 0 }) {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % options.length), period); return () => clearInterval(t) }, [period, options.length])
  return (
    <span className="p-pill-stage">
      {options.map(([I, w], k) => <span key={w} data-on={k === i || undefined} aria-hidden={k !== i} className="p-pill"><I className="size-[0.62em]" />{w}</span>)}
      {phase === 0 && <span className="sr-only">{options[0][1]}</span>}
    </span>
  )
}
export function Hero() {
  const nav = useNavigate()
  return (
    <section id="top" className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pb-20 pt-24 text-center md:pb-28 md:pt-28">
      {/* Graphical puts its wordmark here, as a pill-outline badge sitting above the headline, instead of in a
          persistent top-left nav slot — the page opens on one centred mark, not split attention. Measured on the
          live reference at 1440px: the sentence below runs in a ~960px column at 48px/500, not a narrow display
          headline, so the column and type here are sized to match rather than to Petal's tighter admin scale. */}
      <Reveal><span className="inline-flex items-center rounded-full border border-[var(--s4)] px-5 py-2 text-[15px] font-semibold tracking-tight">Blipmade</span></Reveal>
      <Reveal i={1} as="h1" className="mx-auto mt-8 max-w-[820px] text-[30px] font-medium leading-[1.3] tracking-[-0.01em] sm:text-[38px] md:text-[44px]">
        Deploy a <Pill options={[[Gamepad2, 'Minecraft server'], [Bot, 'Discord bot'], [Terminal, 'Node app']]} />, connect a <Pill options={[[Database, 'database'], [Globe, 'domain'], [Mail, 'mailbox']]} period={2600} />, and watch it run.
      </Reveal>
      <Reveal i={2} className="mt-5 max-w-[420px] text-[15px] leading-relaxed text-[var(--ink2)]">One dashboard for everything you host. Root access included, no terminal required to get started.</Reveal>
      <Reveal i={3} className="mt-8 flex items-center gap-3">
        <button onClick={() => nav('/site/register')} className="petal-btn petal-btn-accent h-10 px-5 text-[14px]">Start building<ArrowRight className="size-3.5" /></button>
        <a href="#fan" className="petal-btn petal-btn-ghost h-10 px-4 text-[14px]">See what's inside<ChevronRight className="size-3.5" /></a>
      </Reveal>
    </section>
  )
}

/* ================================================================== the composition ================================================================== */
/* each artifact is a believable product screen, not an icon+title+number. */
const Chip = ({ tone = 'ok', children }) => <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', tone === 'ok' && 'bg-[var(--good-bg)] text-[var(--good)]', tone === 'warn' && 'bg-[var(--warn-bg)] text-[var(--warn)]', tone === 'muted' && 'bg-[var(--s3)] text-[var(--ink3)]')}>{children}</span>
const Bars = ({ v, tone }) => <div className="flex items-end gap-[3px]" style={{ height: 22 }}>{v.map((h, i) => <i key={i} className="w-[3px] rounded-full" style={{ height: `${h}%`, background: tone || 'var(--accent)', opacity: .55 + (h / 100) * .45 }} />)}</div>

function MinecraftCard() {
  return (
    <div className="flex h-full flex-col p-4" style={{ background: '#fff', color: '#14141a' }}>
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Gamepad2 className="size-4" style={{ color: '#ff2d36' }} /><span className="text-[13px] font-semibold">mc-survival</span></div><Chip>● Online</Chip></div>
      <div className="mt-0.5 text-[10.5px]" style={{ color: '#8a8a92' }}>Paper 1.21 · fra-1</div>
      <div className="mt-3.5 grid grid-cols-3 gap-2">
        {[['Players', '14/40'], ['TPS', '19.8'], ['Memory', '72%']].map(([l, v]) => <div key={l} className="rounded-[10px] px-2.5 py-2" style={{ background: '#f4f4f6' }}><div className="text-[9px] font-medium uppercase tracking-wide" style={{ color: '#9a9aa2' }}>{l}</div><div className="mt-0.5 text-[14px] font-bold tabular-nums">{v}</div></div>)}
      </div>
      <div className="mt-3 flex items-end justify-between rounded-[10px] px-3 py-2.5" style={{ background: '#f4f4f6' }}>
        <Bars v={[40, 55, 48, 70, 60, 75, 65, 80]} tone="#ff2d36" />
        <span className="text-[9.5px]" style={{ color: '#9a9aa2' }}>tick / 10s</span>
      </div>
      <div className="mt-auto space-y-1 pt-3 font-mono text-[10px]" style={{ color: '#8a8a92' }}>
        <div>[Server] Mara joined the game</div>
        <div style={{ color: '#1e8f52' }}>[Server] Saved the world</div>
      </div>
    </div>
  )
}
function VpsCard() {
  return (
    <div className="flex h-full flex-col p-4" style={{ background: '#121214', color: '#d6d8dd' }}>
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Server className="size-4" style={{ color: '#7d8597' }} /><span className="text-[13px] font-semibold" style={{ color: '#f2f2f3' }}>web-01</span></div>
        <div className="flex items-center gap-1">{[Play, Pause].map((I, k) => <span key={k} className="grid size-5 place-items-center rounded-full" style={{ background: '#1f1f23' }}><I className="size-2.5" style={{ color: k === 0 ? '#4ade80' : '#7d8597' }} strokeWidth={2.5} fill={k === 0 ? '#4ade80' : 'none'} /></span>)}</div>
      </div>
      <div className="mt-0.5 text-[10.5px]" style={{ color: '#71717a' }}>45.83.12.9 · Ubuntu 24.04</div>
      <div className="mt-3 flex-1 space-y-1 rounded-[10px] p-3 font-mono text-[10.5px] leading-[17px]" style={{ background: '#09090a' }}>
        <div style={{ color: '#f2f2f3' }}>$ systemctl status api</div>
        <div style={{ color: '#4ade80' }}>● active (running)</div>
        <div style={{ color: '#71717a' }}>since Mon 09:12 UTC; 3 days ago</div>
        <div style={{ color: '#71717a' }}>Main PID: 2041 (node)</div>
      </div>
      <div className="mt-3 flex gap-3">{[['CPU', 22], ['RAM', 48], ['Disk', 31]].map(([l, v]) => <div key={l} className="flex-1"><div className="flex justify-between text-[9.5px]" style={{ color: '#71717a' }}><span>{l}</span><span>{v}%</span></div><div className="mt-1 h-[3px] rounded-full" style={{ background: '#2a2a2f' }}><i className="block h-full rounded-full" style={{ width: v + '%', background: '#6b7280' }} /></div></div>)}</div>
    </div>
  )
}
function DeployCard() {
  const steps = [['Build', 'done'], ['Push', 'done'], ['Provision', 'active'], ['Live', 'pending']]
  return (
    <div className="flex h-full flex-col" style={{ background: '#17080a', color: '#f2e6e7' }}>
      <div className="px-4 pt-4"><div className="flex items-center gap-2"><Terminal className="size-4" style={{ color: '#ff5a62' }} /><span className="text-[12.5px] font-semibold">Deploying node-api</span></div><div className="mt-0.5 text-[10px]" style={{ color: '#9a7072' }}>main @ 3f9a1c2</div></div>
      <div className="mt-4 flex-1 space-y-2.5 px-4">
        {steps.map(([s, st], i) => (
          <div key={s} className="flex items-center gap-2.5">
            <span className="grid size-4 shrink-0 place-items-center rounded-full" style={{ background: st === 'done' ? '#ff2d36' : st === 'active' ? 'transparent' : '#3a2022', border: st === 'active' ? '1.5px solid #ff2d36' : 'none' }}>{st === 'done' && <Check className="size-2.5" style={{ color: '#17080a' }} strokeWidth={3.5} />}</span>
            <span className="text-[11.5px]" style={{ color: st === 'pending' ? '#8a5d5f' : '#f2e6e7', fontWeight: st === 'active' ? 600 : 400 }}>{s}</span>
            {st === 'active' && <span className="ml-auto text-[9.5px]" style={{ color: '#ff5a62' }}>reserving fra-1…</span>}
          </div>
        ))}
      </div>
      <div className="flex gap-2 px-4 pb-4 pt-3">{['2 vCPU', '4 GB'].map((c) => <span key={c} className="rounded-full px-2 py-1 text-[9.5px]" style={{ background: '#2a1416', color: '#d99a9c' }}>{c}</span>)}</div>
    </div>
  )
}
function DbCard() {
  const rows = [['#5021', 'Maya Chen', '$1,200.35', 'ok'], ['#5020', 'Northwind Ltd', '$340.00', 'ok'], ['#5019', 'Ilinca R.', '$89.50', 'warn']]
  return (
    <div className="flex h-full flex-col p-4" style={{ background: '#fff', color: '#14141a' }}>
      <div className="flex items-center gap-2"><Database className="size-4" style={{ color: '#2a63e8' }} /><span className="text-[13px] font-semibold">orders</span><span className="ml-auto text-[10px]" style={{ color: '#9a9aa2' }}>PostgreSQL 17</span></div>
      <div className="mt-3 overflow-hidden rounded-[10px]" style={{ background: '#f8f8fa' }}>
        <div className="grid grid-cols-[52px_1fr_64px_48px] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wide" style={{ color: '#9a9aa2' }}><span>id</span><span>customer</span><span>total</span><span>status</span></div>
        {rows.map((r) => <div key={r[0]} className="grid grid-cols-[52px_1fr_64px_48px] items-center border-t px-2.5 py-1.5 text-[10.5px]" style={{ borderColor: '#eeeef1' }}><span style={{ color: '#9a9aa2' }}>{r[0]}</span><span className="truncate font-medium">{r[1]}</span><span className="tabular-nums">{r[2]}</span><Chip tone={r[3] === 'ok' ? 'ok' : 'warn'}>{r[3] === 'ok' ? 'paid' : 'due'}</Chip></div>)}
      </div>
      <div className="mt-2.5 font-mono text-[9.5px]" style={{ color: '#9a9aa2' }}>select * from orders order by created_at desc</div>
    </div>
  )
}
function DomainCard() {
  return (
    <div className="flex h-full flex-col p-4" style={{ background: '#fff', color: '#14141a' }}>
      <div className="flex items-center gap-2"><Globe className="size-4" style={{ color: '#14141a' }} /><span className="truncate text-[12.5px] font-semibold">northwind.gg</span><Chip>Verified</Chip></div>
      <div className="mt-3 space-y-1 font-mono text-[10px]" style={{ color: '#6a6a72' }}>
        <div className="flex gap-3"><span className="w-12" style={{ color: '#2a63e8' }}>A</span><span className="flex-1">@</span><span>45.83.12.9</span></div>
        <div className="flex gap-3"><span className="w-12" style={{ color: '#2a63e8' }}>CNAME</span><span className="flex-1">www</span><span>@</span></div>
      </div>
      <div className="mt-auto flex items-center justify-between pt-3 text-[10.5px]"><span className="flex items-center gap-1.5" style={{ color: '#6a6a72' }}><Lock className="size-3" />HTTPS</span><Chip>Active</Chip></div>
    </div>
  )
}
function MailCard() {
  return (
    <div className="flex h-full flex-col p-3.5" style={{ background: '#101013', color: '#dcdce0' }}>
      <div className="flex items-center gap-2"><Mail className="size-3.5" style={{ color: '#8a8f99' }} /><span className="text-[11.5px] font-semibold">Mail</span><span className="ml-auto rounded-full px-1.5 py-px text-[9px] font-semibold" style={{ background: '#ff2d36', color: '#fff' }}>3</span></div>
      <div className="mt-2 space-y-2 border-t pt-2" style={{ borderColor: '#242428' }}>
        {[['Invoice INV-1049', '2m', true], ['Domain verified', '1h', false]].map(([s, t, unread]) => <div key={s} className="flex items-center justify-between text-[10.5px]"><span className="truncate" style={{ fontWeight: unread ? 600 : 400, color: unread ? '#f2f2f3' : '#8a8f99' }}>{s}</span><span style={{ color: '#5a5a60' }}>{t}</span></div>)}
      </div>
    </div>
  )
}

/* positions are intentionally bespoke per artifact, not generated from a loop — a designed arrangement, not a pattern. */
const LAYOUT = [
  { Card: MailCard, w: 190, h: 150, rot: 6, left: '1%', top: 30, z: 1, shadow: 'rgba(0,0,0,.35)' },
  { Card: MinecraftCard, w: 330, h: 236, rot: -2, left: '13%', top: 6, z: 3, shadow: 'rgba(0,0,0,.4)' },
  { Card: DomainCard, w: 208, h: 172, rot: -7, left: '31%', top: 232, z: 5, shadow: 'rgba(0,0,0,.4)' },
  { Card: VpsCard, w: 292, h: 268, rot: 4, left: '47%', top: 0, z: 4, shadow: 'rgba(0,0,0,.45)' },
  { Card: DeployCard, w: 232, h: 290, rot: -5, left: '71%', top: 56, z: 2, shadow: 'rgba(0,0,0,.45)' },
  { Card: DbCard, w: 262, h: 196, rot: 5, left: '69%', top: 300, z: 6, shadow: 'rgba(0,0,0,.4)' },
]
function Artifact({ def, i }) {
  const ref = useRef(null)
  const move = (e) => { const r = ref.current.getBoundingClientRect(); ref.current.style.setProperty('--tx', ((e.clientX - r.left) / r.width - 0.5).toFixed(2)); ref.current.style.setProperty('--ty', ((e.clientY - r.top) / r.height - 0.5).toFixed(2)) }
  const leave = () => { ref.current.style.setProperty('--tx', 0); ref.current.style.setProperty('--ty', 0) }
  const [host, seen] = useReveal('0px 0px -10% 0px')
  return (
    <div ref={host} data-seen={seen || undefined} className="p-art-card" style={{ left: def.left, top: def.top, width: def.w, height: def.h, '--rot': def.rot + 'deg', '--z': def.z, transitionDelay: `${i * 80}ms` }}>
      <div ref={ref} onMouseMove={move} onMouseLeave={leave} className="p-tilt h-full overflow-hidden rounded-[16px]" style={{ boxShadow: `0 18px 40px -12px ${def.shadow}` }}><def.Card /></div>
    </div>
  )
}
export function Composition() {
  const order = [1, 0, 2] // minecraft (dominant) leads, mail and domain peek behind it — enough contrast for the mobile moment
  const [active, setActive] = useState(0)   // index into `order`: which one is in front right now
  const front = order[active], back = order.filter((_, k) => k !== active)
  return (
    <section id="fan" className="mx-auto max-w-6xl px-5 pb-28">
      <Reveal className="mb-10 text-center md:mb-14"><Eyebrow>Inside the dashboard</Eyebrow><h2 className="mt-2 text-[22px] font-semibold tracking-tight md:text-[26px]">One screen per thing you run.</h2></Reveal>

      {/* desktop / tablet: the full arrangement */}
      <div className="p-art relative mx-auto hidden md:block" style={{ height: 520, maxWidth: 980 }}>
        {LAYOUT.map((def, i) => <Artifact key={i} def={def} i={i} />)}
      </div>

      {/* phone: one focal interface, two peeking behind it, tap to bring one forward */}
      <div className="relative mx-auto h-[320px] max-w-[300px] md:hidden">
        {back.map((idx, k) => { const def = LAYOUT[idx]; const Card = def.Card; const side = k === 0 ? -1 : 1
          return (
            <button key={idx} aria-label={`Bring ${['Mail', 'Minecraft', 'Domains'][idx]} to the front`} onClick={() => setActive(order.indexOf(idx))} className="absolute top-6 overflow-hidden rounded-[14px]" style={{ left: '50%', width: def.w * 0.72, height: def.h * 0.72, transform: `translateX(calc(-50% + ${side * 86}px)) rotate(${side * 7}deg)`, zIndex: 1, boxShadow: '0 14px 30px -10px rgba(0,0,0,.4)', opacity: .88 }}>
              <div style={{ transform: `scale(${1 / 0.72})`, transformOrigin: 'top left', width: def.w, height: def.h }}><Card /></div>
            </button>
          )
        })}
        <div key={front} className="p-reveal absolute left-1/2 top-0 -translate-x-1/2 overflow-hidden rounded-[16px]" data-seen style={{ width: LAYOUT[front].w * 0.86, height: LAYOUT[front].h * 0.86, zIndex: 2, boxShadow: '0 20px 44px -12px rgba(0,0,0,.5)' }}>
          <div style={{ transform: 'scale(.86)', transformOrigin: 'top left', width: LAYOUT[front].w, height: LAYOUT[front].h }}>{(() => { const C = LAYOUT[front].Card; return <C /> })()}</div>
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-1.5 md:hidden">{order.map((idx, k) => <button key={idx} aria-label={`Show panel ${k + 1}`} onClick={() => setActive(k)} className="p-dot" data-on={k === active || undefined} />)}</div>
    </section>
  )
}
