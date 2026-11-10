/* Public homepage. Copy, prices and promises live in homeContent.js; this file is only how the page looks and moves.
   One idea per screen, in this order: what it is (headline + live stage, which say the same thing) -> what you can buy ->
   who helps you (Blips) -> what it is like to use -> what it costs and what is included -> proof -> switching -> questions -> go.
   Rule for adding anything here: it replaces something, it does not sit next to it. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Terminal as TermIcon } from 'lucide-react'
import { Accordion, Button, Slider, useSlideIndicator } from '../components/ui.jsx'
import { AnimatedPrice, DotBars, DotGauge, DotNum } from '../components/DotViz.jsx'
import { DotField, DotText, Orb } from '../builder/FxBits.jsx'
import { BlipCast } from '../components/BlipCast.jsx'
import { CATALOG } from '../lib/mock'
import { cn } from '../lib/utils'
import { useTorch } from '../lib/useTorch.js'
import { DotRule, Reveal, RevealGrid, useLive, useSeen } from './reveal.jsx'
import { DEPLOY_LOG, FAQ, FINAL, GAME_LOG, HERO, INCLUDED, MIGRATION, PRESETS, PRODUCT_ICONS, PRODUCT_PITCH, RATES, STACK, STAGE, STATS, VPS_SPEC } from './homeContent.js'

const eyebrow = 'font-mono text-[11px] uppercase tracking-[.1em] text-dim'
const CARD = 'torch rounded-2xl border border-line bg-card p-6 transition-[border-color,background-color] duration-200 hover:border-line-2 hover:bg-[#161619]'
const WRAP = 'mx-auto max-w-6xl px-5 md:px-10'
const SPACE = 'py-24 md:py-36'

const SectionHead = ({ label, title, sub, center, className }) => (
  <Reveal className={cn('mb-12 max-w-2xl md:mb-14', center && 'mx-auto text-center', className)}>
    <div className={eyebrow}>{label}</div>
    {title && <h2 className="mt-3 text-balance text-[32px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[44px]">{title}</h2>}
    {sub && <p className="mt-4 text-pretty text-[16px] leading-relaxed text-mute">{sub}</p>}
  </Reveal>
)

/* dot type sized to the width it has: `units` is the width of the longest line in dot columns (7 rows tall) */
function useFitHeight(ref, units, max) {
  const [h, setH] = useState(max)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => setH(Math.max(14, Math.min(max, Math.floor((el.clientWidth * 7) / units))))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, units, max])
  return h
}

/* a line of dot type whose words change: the old ones lose focus and lift away, the new ones light up in reading order */
function RotLine({ text, height }) {
  const [shown, setShown] = useState(text)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    if (text === shown) return
    setLeaving(true)
    const t = setTimeout(() => { setShown(text); setLeaving(false) }, 190)
    return () => clearTimeout(t)
  }, [text, shown])
  return (
    <span className={cn('flex w-full justify-center transition-[opacity,filter,transform] duration-200', leaving ? '-translate-y-1 opacity-0 [filter:blur(5px)]' : 'opacity-100')} style={{ height }}>
      <DotText key={shown} text={shown} height={height} assemble />
    </span>
  )
}

/* ---------------- a log that prints itself, then starts over ---------------- */
function AutoLog({ script, label }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  const live = useLive(ref)
  useEffect(() => { if (!live) return; const t = setInterval(() => setN((x) => (x >= script.length + 3 ? 0 : x + 1)), 900); return () => clearInterval(t) }, [live, script])
  return (
    <div ref={ref} className="font-mono text-[12.5px] leading-7" style={{ height: (script.length + 1) * 28 }} aria-label={label} role="img">
      {script.slice(0, Math.min(n, script.length)).map(([l, c], i) => <div key={i} className={cn('log-line truncate', c === 'ok' ? 'text-ok' : c === 'cmd' ? 'text-fg' : 'text-fg/60')}>{l}</div>)}
      {n < script.length && <span className="inline-block h-4 w-2 animate-pulse bg-fg align-middle" />}
    </div>
  )
}

/* ---------------- live metrics ---------------- */
function LiveMetrics({ name = 'blipmade-prod', gauge = 88 }) {
  const [vals, setVals] = useState(() => Array.from({ length: 30 }, (_, i) => 40 + Math.sin(i / 2.5) * 22 + ((i * 17) % 13)))
  const ref = useRef(null)
  const live = useLive(ref)
  useEffect(() => { if (!live) return; const t = setInterval(() => setVals((v) => [...v.slice(1), 40 + Math.random() * 60]), 1100); return () => clearInterval(t) }, [live])
  const cpu = Math.round(vals[vals.length - 1] * 0.6)
  return (
    <div ref={ref} className="space-y-5">
      <div className="flex items-center justify-between gap-3"><span className={cn(eyebrow, 'truncate')}>{name} · live</span><span className="flex shrink-0 items-center gap-1.5 font-mono text-[10.5px] uppercase text-ok"><i className="size-1.5 animate-pulse rounded-full bg-ok" />streaming</span></div>
      <DotBars values={vals} rows={9} unit="Mbps" live />
      <div className="flex justify-around pt-1"><DotGauge value={cpu} label="CPU" size={gauge} n={36} /><DotGauge value={58} label="RAM" size={gauge} n={36} /><DotGauge value={41} label="DISK" size={gauge} n={36} /></div>
    </div>
  )
}

/* ---------------- builder scene: a sentence becomes a site ---------------- */
const PROMPT = 'A bakery in Porto with online booking'
function BuilderTeaser() {
  const [i, setI] = useState(0)
  const ref = useRef(null)
  const live = useLive(ref)
  useEffect(() => { if (!live) return; const t = setInterval(() => setI((x) => (x >= PROMPT.length + 26 ? 0 : x + 1)), 90); return () => clearInterval(t) }, [live])
  const typed = PROMPT.slice(0, Math.min(i, PROMPT.length))
  const built = Math.max(0, Math.min(4, Math.floor((i - PROMPT.length) / 4)))
  const state = i < PROMPT.length ? 'speaking' : built < 4 ? 'thinking' : 'happy'
  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3"><Orb size={36} state={state} role="builder" /><span className="text-[13px] text-mute">Forge <span className="text-dim">· site builder</span></span></div>
        <div className="min-h-[52px] rounded-xl border border-line-2 bg-black/40 p-3.5 text-[13.5px]">{typed}<span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-fg align-middle" /></div>
      </div>
      <div className="h-[212px] overflow-hidden rounded-xl border border-line-2 bg-[#fbf3e6] text-[#2b1d12]">
        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold"><span>Crumb & Co.</span><span className="opacity-50">Menu · Story · Visit</span></div>
        {built >= 1 && <div className="log-line px-4 pb-3 pt-2"><div className="font-serif text-[22px] leading-tight">Fresh bread,<br />slow mornings.</div><div className="mt-2 inline-block rounded-full bg-[#d9622b] px-3 py-1 text-[10px] font-semibold text-white">Reserve a table</div></div>}
        {built >= 2 && <div className="log-line grid grid-cols-3 gap-1.5 px-4 pb-3">{[0, 1, 2].map((k) => <div key={k} className="h-9 rounded-md bg-[#2b1d12]/10" />)}</div>}
        {built >= 3 && <div className="log-line mx-4 mb-4 rounded-md bg-[#d9622b]/15 px-3 py-2 text-[10px]">“Best croissant in town.”</div>}
        {built < 1 && <div className="px-4 pb-6 pt-8 text-center text-[11px] opacity-40">Waiting for your idea…</div>}
      </div>
    </div>
  )
}

/* ---------------- hero stage: the product window for whatever the headline says ---------------- */
const paneL = 'border-b border-line p-6 md:border-b-0 md:border-r'
const paneHead = 'mb-3 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim'
const SCENES = {
  site: () => <div className="p-6"><BuilderTeaser /></div>,
  app: () => (
    <div className="grid h-full md:grid-cols-[1.1fr_1fr]">
      <div className={paneL}><div className={paneHead}><TermIcon className="size-3.5" />Deploy</div><AutoLog script={DEPLOY_LOG} label="Deploy log (animated example)" /></div>
      <div className="hidden p-6 md:block"><LiveMetrics /></div>
    </div>
  ),
  game: () => (
    <div className="grid h-full md:grid-cols-[1.1fr_1fr]">
      <div className={paneL}><div className={paneHead}><TermIcon className="size-3.5" />Console · survival-smp</div><AutoLog script={GAME_LOG} label="Game server console (animated example)" /></div>
      <div className="hidden flex-col justify-between gap-5 p-6 md:flex">
        <div className="flex items-center justify-between"><span className={eyebrow}>Paper 1.21 · 2 / 20 players</span><span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase text-ok"><i className="size-1.5 animate-pulse rounded-full bg-ok" />online</span></div>
        <div className="flex justify-around"><DotGauge value={99} label="TICK" size={88} n={36} /><DotGauge value={34} label="CPU" size={88} n={36} /><DotGauge value={61} label="RAM" size={88} n={36} /></div>
        <div className="flex items-end gap-2.5"><Orb size={28} state="speaking" role="game" /><div className="rounded-2xl rounded-bl-md border border-line bg-white/[0.03] px-3.5 py-2 text-[13px] leading-snug">Tick rate dipped at 21:04. One plugin used 38% of the tick. Want me to disable it?</div></div>
      </div>
    </div>
  ),
  vps: () => (
    <div className="grid h-full md:grid-cols-[1.1fr_1fr]">
      <div className={paneL}>
        <div className={paneHead}><TermIcon className="size-3.5" />Ready in 38 seconds</div>
        <dl className="font-mono text-[12.5px]">{VPS_SPEC.map(([k, v], i) => <div key={k} className="log-line flex justify-between border-b border-line/60 py-[7px] last:border-b-0" style={{ animationDelay: `${i * 60}ms` }}><dt className="text-dim">{k}</dt><dd className="text-fg/80">{v}</dd></div>)}</dl>
        <div className="mt-4 truncate rounded-lg border border-line bg-black/40 px-3 py-2 font-mono text-[12px] text-fg/70"><span className="text-dim">$</span> ssh root@45.83.12.9</div>
      </div>
      <div className="hidden p-6 md:block"><LiveMetrics name="vps-fra-01" /></div>
    </div>
  ),
}

function Stage({ id, auto, onPick, onNext }) {
  const nav = useNavigate()
  const box = useRef(null)
  const tabs = useRef(null)
  const live = useLive(box)
  const pill = useSlideIndicator(tabs)
  const i = STAGE.findIndex((s) => s.id === id)
  const s = STAGE[i]
  const Scene = SCENES[id]
  const onKey = (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const to = STAGE[(i + d + STAGE.length) % STAGE.length].id
    onPick(to)
    tabs.current?.querySelector(`[data-tab="${to}"]`)?.focus()
  }
  return (
    <div ref={box} data-live={live} className="stage relative mx-auto max-w-5xl">
      <div className="mb-5 flex justify-center">
        <div ref={tabs} role="tablist" aria-label="What are you launching?" onKeyDown={onKey} className="relative inline-flex max-w-full rounded-xl border border-line-2 bg-black/70 p-1 backdrop-blur">
          <span aria-hidden className="pointer-events-none absolute left-0 top-0 rounded-lg bg-white/[0.09]" style={pill ? { width: pill.width, height: pill.height, transform: `translate(${pill.left}px, ${pill.top}px)`, opacity: 1, transition: 'transform 320ms var(--ease-expo), width 320ms var(--ease-expo), opacity 120ms' } : { opacity: 0 }} />
          {STAGE.map((t) => {
            const on = t.id === id
            return (
              <button key={t.id} data-tab={t.id} role="tab" aria-selected={on} aria-controls="stage-panel" tabIndex={on ? 0 : -1} onClick={() => onPick(t.id)}
                className={cn('relative z-10 flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] outline-none transition-colors duration-200 sm:px-4', on ? 'text-fg' : 'text-dim hover:text-fg/80')}>
                <t.icon className="size-4" strokeWidth={1.7} />{t.label}
                {on && auto && <i key={t.id} aria-hidden onAnimationEnd={onNext} className="stage-progress absolute inset-x-3 bottom-[3px] h-px rounded-full bg-fg/60" />}
              </button>
            )
          })}
        </div>
      </div>
      <div className="torch relative overflow-hidden rounded-2xl border border-line-2 bg-[#0a0a0c] shadow-[0_40px_120px_rgba(0,0,0,.8)]">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5"><span className="flex gap-1.5">{[0, 1, 2].map((k) => <i key={k} className="size-2.5 rounded-full bg-white/15" />)}</span><span key={id} className="mx-auto truncate font-mono text-[11px] text-dim [animation:fade-in_300ms_ease-out]">{s.url}</span><span className="w-[42px]" /></div>
        <div id="stage-panel" role="tabpanel" aria-label={s.label} className="min-h-[392px] md:h-[340px] md:min-h-0"><div key={id} className="stage-scene h-full"><Scene /></div></div>
        <div className="flex items-center justify-between gap-4 border-t border-line bg-black/40 px-4 py-2.5">
          <span key={id} className="font-mono text-[11px] uppercase tracking-[.08em] text-dim [animation:fade-in_300ms_ease-out]">From <span className="text-fg">${s.from.toFixed(2)}</span> / month</span>
          <button type="button" onClick={() => nav(s.to)} className="group inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-fg outline-none"><span className="link-grow">{s.cta}</span><ArrowRight className="size-3.5 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5" /></button>
        </div>
      </div>
    </div>
  )
}

/* one piece of state drives the hero: the headline's moving words and the stage are always the same product */
function Hero() {
  const nav = useNavigate()
  const [id, setId] = useState(STAGE[0].id)
  const [auto, setAuto] = useState(true)        // rotates by itself until the visitor picks a tab
  const fit = useRef(null)
  const h = useFitHeight(fit, 93, 46)           // 93 columns: "YOUR GAME SERVER."
  const i = STAGE.findIndex((s) => s.id === id)
  return (
    <section className="relative overflow-hidden border-b border-line">
      <DotField className="pointer-events-none absolute inset-0 size-full" pitch={34} glyphs strength={0.6} />
      <div className={cn(WRAP, 'relative pb-16 pt-20 md:pb-24 md:pt-32')}>
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="absolute -inset-x-16 -inset-y-10 -z-0 bg-black/85 backdrop-blur-[10px] [mask-image:radial-gradient(closest-side,#000_62%,transparent)]" />
          <div className="relative flex w-full flex-col items-center">
            <div ref={fit} className="flex w-full flex-col items-center" style={{ gap: Math.round(h * 0.42) }} aria-hidden>
              <RotLine text={STAGE[i].word} height={h} />
              <span className="flex justify-center text-fg/40" style={{ height: h }}><DotText text={HERO.fixed} height={h} assemble delay={320} /></span>
            </div>
            <h1 className="sr-only">{HERO.srTitle}</h1>
            <p className="anim-reveal mt-9 max-w-[32rem] text-pretty text-[17px] leading-[1.5] text-fg/75 md:text-[18px]" style={{ '--i': 4 }}>{HERO.sub}</p>
            <div className="anim-reveal mt-9 flex flex-wrap justify-center gap-3" style={{ '--i': 5 }}><Button size="lg" onClick={() => nav('/site/register')}>{HERO.primary} <ArrowRight /></Button><Button size="lg" variant="outline" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>{HERO.secondary}</Button></div>
            <p className={cn(eyebrow, 'anim-reveal mt-7')} style={{ '--i': 6 }}>{HERO.trust}</p>
          </div>
        </div>
        <div className="anim-reveal mt-16 md:mt-20" style={{ '--i': 8 }}>
          <Stage id={id} auto={auto} onPick={(v) => { setAuto(false); setId(v) }} onNext={() => setId(STAGE[(i + 1) % STAGE.length].id)} />
        </div>
      </div>
    </section>
  )
}

/* ---------------- products: a price list, not a wall of cards ---------------- */
function Products() {
  const nav = useNavigate()
  return (
    <Reveal className="overflow-hidden rounded-2xl border border-line bg-card">
      {CATALOG.map((p) => {
        const Icon = PRODUCT_ICONS[p.id]
        return (
          <button key={p.id} type="button" onClick={() => nav('/site/products/' + p.id)} className="torch group grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 border-b border-line px-5 py-5 text-left outline-none transition-colors duration-200 last:border-b-0 hover:bg-white/[0.025] focus-visible:bg-white/[0.04] md:grid-cols-[auto_200px_1fr_auto_auto] md:gap-x-6 md:px-7 md:py-6">
            {Icon && <Icon className="size-[18px] text-dim transition-colors duration-200 group-hover:text-fg" strokeWidth={1.6} />}
            <span className="text-[16px] font-semibold tracking-tight">{p.name}</span>
            <span className="col-span-2 col-start-2 row-start-2 text-pretty text-[14px] leading-relaxed text-mute md:col-span-1 md:col-start-3 md:row-start-1">{PRODUCT_PITCH[p.id] || p.blurb}</span>
            <span className="col-start-3 row-start-1 flex items-end gap-1.5 md:col-start-4"><span className="hidden pb-px font-mono text-[10px] uppercase tracking-[.08em] text-dim sm:block">from</span><DotNum text={`$${p.from}`} height={15} /><span className="whitespace-nowrap text-xs leading-none text-dim">/ mo</span></span>
            <ArrowRight className="hidden size-4 -translate-x-1.5 text-dim opacity-0 transition-[opacity,transform,color] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:text-fg group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 md:block" />
          </button>
        )
      })}
    </Reveal>
  )
}

/* ---------------- dot world map ---------------- */
const MAP = [
  '                                                          ',
  '      ####                   ##   #########               ',
  '    #######        #   ##  ########################       ',
  '   ##########     ###  ##########################         ',
  '   ###########    ##    ##  ##################### #       ',
  '    ##########           ###########################      ',
  '     #########         ######  #############  ####         ',
  '      #######           #####   ###########   ##           ',
  '       #####              ###      #######                 ',
  '        ####    #         ####      #####   #              ',
  '         ###   ####       #####       ##   ###             ',
  '          ##  ######      ######           ####            ',
  '           # #######     #######            ##   ####      ',
  '             #######      ######                ######     ',
  '             ######        #####                #######    ',
  '              #####         ####                 #####     ',
  '              ####           ##                            ',
  '              ###                                          ',
]
const PINGS = [[14, 5, 'Ashburn', 96], [31, 3, 'Frankfurt', 14], [30, 2, 'Amsterdam', 18], [34, 1, 'Helsinki', 31]]
function Regions() {
  const [hot, setHot] = useState(null)
  const P = 8
  return (
    <>
      <svg viewBox={`0 0 ${58 * P} ${MAP.length * P}`} className="mt-6 h-auto w-full" role="img" aria-label="Regions: Ashburn, Frankfurt, Amsterdam, Helsinki">
        {MAP.map((row, y) => [...row].map((c, x) => <circle key={x + '-' + y} cx={x * P + 4} cy={y * P + 4} r={c === '#' ? 2.1 : 0.7} fill="#fff" opacity={c === '#' ? 0.5 : 0.1} />))}
        {PINGS.map(([x, y, n]) => (
          <g key={n} style={{ opacity: hot && hot !== n ? 0.25 : 1, transition: 'opacity 200ms' }}>
            <circle cx={x * P + 4} cy={y * P + 4} r={hot === n ? 5 : 3.5} fill="#ff2d36" style={{ transition: 'r 200ms var(--ease-out)' }} />
            <circle cx={x * P + 4} cy={y * P + 4} r="3.5" fill="none" stroke="#ff2d36" strokeWidth="1"><animate attributeName="r" from="3.5" to="16" dur="2.4s" repeatCount="indefinite" /><animate attributeName="opacity" from="0.8" to="0" dur="2.4s" repeatCount="indefinite" /></circle>
          </g>
        ))}
      </svg>
      <div className="mt-4 flex flex-wrap gap-1.5" onPointerLeave={() => setHot(null)}>
        {PINGS.map(([, , n, ms]) => <span key={n} tabIndex={0} onPointerEnter={() => setHot(n)} onFocus={() => setHot(n)} onBlur={() => setHot(null)} className={cn('cursor-default rounded-full border px-2 py-0.5 font-mono text-[10.5px] outline-none transition-colors duration-150', hot === n ? 'border-white/40 text-fg' : 'border-line-2 text-mute')}>{n}<span className={cn('ml-1.5 transition-colors', hot === n ? 'text-ok' : 'text-dim')}>{ms} ms</span></span>)}
      </div>
    </>
  )
}

/* ---------------- deploy pipeline: push -> build -> provision -> live ---------------- */
const PIPE = [['Push', 'git push origin main'], ['Build', 'Building image · 18 s'], ['Ship', 'Reserving capacity · Frankfurt'], ['Live', '✓ api-7f3a.blipmade.app']]
function Pipeline() {
  const [n, setN] = useState(0)                 // 0-3: that step is running; 4-5: everything done, hold, then start over
  const ref = useRef(null)
  const live = useLive(ref)
  useEffect(() => { if (!live) return; const t = setInterval(() => setN((x) => (x + 1) % 6), 1300); return () => clearInterval(t) }, [live])
  const at = Math.min(n, 3)
  const done = n > 3
  return (
    <div ref={ref} className="mt-8" role="img" aria-label="Deploy pipeline (animated example): push, build, ship, live">
      <div className="relative flex justify-between">
        <span className="absolute left-3 right-3 top-3 h-px bg-line-2" />
        <span className="absolute left-3 right-3 top-3 h-px origin-left bg-fg/70 transition-transform duration-700 ease-[var(--ease-expo)]" style={{ transform: `scaleX(${done ? 1 : at / 3})` }} />
        {PIPE.map(([l], k) => {
          const ok = k < at || done
          const run = k === at && !done
          return (
            <div key={l} className="relative flex flex-col items-center gap-2.5">
              <span className={cn('grid size-6 place-items-center rounded-full border transition-[background-color,border-color,color] duration-300', ok ? 'border-fg bg-fg text-black' : run ? 'border-fg bg-card text-fg' : 'border-line-2 bg-card text-dim')}>
                {ok ? <Check className="size-3.5 [animation:badge-pop_260ms_var(--ease-out)]" strokeWidth={2.6} /> : <i className={cn('size-1.5 rounded-full', run ? 'animate-pulse bg-[var(--brand)]' : 'bg-white/20')} />}
              </span>
              <span className={cn('font-mono text-[10.5px] uppercase tracking-[.08em] transition-colors duration-300', ok || run ? 'text-fg' : 'text-dim')}>{l}</span>
            </div>
          )
        })}
      </div>
      <div key={at + (done ? 'd' : '')} className={cn('log-line mt-7 truncate rounded-lg border border-line bg-black/40 px-3 py-2 font-mono text-[12px]', done ? 'text-ok' : 'text-fg/60')}>{PIPE[at][1]}</div>
    </div>
  )
}

/* ---------------- configurator ---------------- */
/* defined at module level: a component declared inside Configurator would remount on every value change and break dragging */
const SliderRow = ({ l, v, u, st, min, max, set, glide }) => (
  <div><div className="mb-2.5 flex justify-between text-[13px]"><span className="text-mute">{l}</span><span className="font-mono tabular-nums">{v} {u}</span></div><Slider className={glide ? 'slider-glide' : undefined} min={min} max={max} step={st} value={[v]} onValueChange={([x]) => set(x)} aria-label={l} /></div>
)
function Configurator() {
  const nav = useNavigate()
  const [cfg, setCfg] = useState({ cpu: 2, ram: 4, disk: 80 })
  const [glide, setGlide] = useState(false)     // thumbs travel to a preset; while dragging they follow the finger with no easing
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const set = (k) => (v) => { setGlide(false); setCfg((c) => ({ ...c, [k]: v })) }
  const preset = (p) => { setGlide(true); setCfg({ cpu: p.cpu, ram: p.ram, disk: p.disk }); clearTimeout(timer.current); timer.current = setTimeout(() => setGlide(false), 520) }
  const active = PRESETS.find((p) => p.cpu === cfg.cpu && p.ram === cfg.ram && p.disk === cfg.disk)?.id
  const price = cfg.cpu * RATES.cpu + cfg.ram * RATES.ram + cfg.disk * RATES.disk
  return (
    <Reveal className="torch grid gap-8 rounded-2xl border border-line-2 bg-card p-6 md:grid-cols-[1fr_300px] md:gap-10 md:p-9">
      <div>
        <div role="group" aria-label="Start from a preset" className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" aria-pressed={active === p.id} title={p.hint} onClick={() => preset(p)} className={cn('h-8 rounded-full border px-3.5 text-[13px] outline-none transition-[border-color,background-color,color] duration-200 focus-visible:border-white/50', active === p.id ? 'border-fg/70 bg-white/[0.07] text-fg' : 'border-line-2 text-mute hover:border-white/25 hover:text-fg active:bg-white/[0.05]')}>{p.label}</button>
          ))}
        </div>
        <div className="mt-9 space-y-8">
          <SliderRow l="vCPU" v={cfg.cpu} u="cores" st={1} min={1} max={16} set={set('cpu')} glide={glide} />
          <SliderRow l="Memory" v={cfg.ram} u="GB" st={1} min={1} max={64} set={set('ram')} glide={glide} />
          <SliderRow l="NVMe storage" v={cfg.disk} u="GB" st={10} min={20} max={1000} set={set('disk')} glide={glide} />
        </div>
      </div>
      <div className="flex flex-col justify-between border-t border-line pt-7 md:border-l md:border-t-0 md:pl-10 md:pt-0">
        <div>
          <div className={eyebrow}>Your server</div>
          <div className="mt-5"><AnimatedPrice value={price} height={40} /></div>
          <div className="mt-3 text-xs text-dim">per month · <span className="font-mono tabular-nums text-mute">${(price / 730).toFixed(3)}</span> per hour</div>
        </div>
        <Button size="lg" className="mt-8 w-full" onClick={() => nav('/site/register')}>Deploy this server <ArrowRight /></Button>
      </div>
    </Reveal>
  )
}

function Stats() {
  const ref = useRef(null)
  const seen = useSeen(ref, '0px 0px -10% 0px')
  return (
    <div ref={ref} className="border-y border-line bg-black/30"><div className={cn(WRAP, 'grid grid-cols-2 gap-px py-16 md:grid-cols-4 md:py-20')}>{STATS.map(([n, l], i) => (
      <div key={l} className="space-y-3 py-4 text-center">
        <div className="flex h-9 justify-center">{seen && <DotNum text={n} height={32} animate />}</div>
        <div className={cn('text-[13px] text-dim transition-opacity duration-500', seen ? 'opacity-100' : 'opacity-0')} style={{ transitionDelay: seen ? `${300 + i * 80}ms` : '0ms' }}>{l}</div>
      </div>))}</div></div>
  )
}

const DrawCheck = ({ i = 0, className }) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cn('draw-check size-4 shrink-0 text-ok', className)} style={{ '--i': i }}><path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

export default function HomePage() {
  const nav = useNavigate()
  useTorch()
  return (
    <>
      <Hero />

      {/* ------------ stack marquee ------------ */}
      <div className="group overflow-hidden border-b border-line py-5 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]" aria-label={'Runs ' + STACK.join(', ').toLowerCase()}>
        <div aria-hidden className="marquee flex w-max gap-12 font-mono text-[12px] tracking-[.12em] text-dim">{[...STACK, ...STACK].map((l, i) => <span key={i} className="flex items-center gap-12">{l}<i className="size-1 rounded-full bg-white/20" /></span>)}</div>
      </div>

      {/* ------------ products ------------ */}
      <section id="products" className={cn(WRAP, SPACE)}>
        <SectionHead label="Products" title="One home for everything you put online." />
        <Products />
      </section>

      {/* ------------ the Blips: nothing else on this screen ------------ */}
      <section id="blips" className="border-y border-line bg-black/30">
        <div className={cn(WRAP, SPACE)}>
          <Reveal className={cn(eyebrow, 'mb-12 text-center')}>Meet the Blips, your AI crew</Reveal>
          <BlipCast />
        </div>
      </section>

      {/* ------------ the panel: three things, one visual each ------------ */}
      <section className={cn(WRAP, SPACE)}>
        <SectionHead label="The panel" title="A control panel you will actually like." sub="Every tool is where you expect it, and nothing gets in the way." />
        <RevealGrid className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className={cn(CARD, 'flex flex-col')}><div className={eyebrow}>Deploy</div><h3 className="mt-2 text-xl font-semibold tracking-tight">Push to live in 40 seconds.</h3><p className="mt-2 text-[14px] leading-relaxed text-mute">Connect a repository or drop in a folder. We build it and switch on HTTPS.</p><div className="mt-auto"><Pipeline /></div></div>
          <div className={CARD}><div className={eyebrow}>Regions</div><h3 className="mt-2 text-xl font-semibold tracking-tight">Close to your users.</h3><Regions /></div>
          <div className={cn(CARD, 'md:col-span-2 lg:col-span-1')}><div className={eyebrow}>Observe</div><h3 className="mt-2 text-xl font-semibold tracking-tight">Live, down to the dot.</h3><div className="mt-6"><LiveMetrics gauge={72} /></div></div>
        </RevealGrid>
      </section>

      <DotRule />

      {/* ------------ pricing, and what the price includes ------------ */}
      <section id="pricing" className={cn(WRAP, SPACE)}>
        <SectionHead label="Pricing" title="Build the server you need. Pay for exactly that." />
        <Configurator />
        <Reveal as="ul" className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3.5 text-[13.5px] text-mute md:grid-cols-4" aria-label="Included with every plan">
          {INCLUDED.map(([, t], i) => <li key={t} className="flex items-center gap-2.5"><DrawCheck i={i} />{t}</li>)}
        </Reveal>
      </section>

      <Stats />

      {/* ------------ migration ------------ */}
      <section className={cn(WRAP, SPACE)}>
        <Reveal className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
          <div className="flex flex-col items-start">
            <div className={eyebrow}>Free migration</div>
            <h2 className="mt-3 text-balance text-[32px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[44px]">{MIGRATION.title}</h2>
            <p className="mt-4 text-pretty text-[16px] leading-relaxed text-mute">{MIGRATION.sub}</p>
            <Button size="lg" variant="outline" className="mt-8" onClick={() => nav('/site/register')}>{MIGRATION.cta} <ArrowRight /></Button>
          </div>
          <ol className="border-t border-line">
            {MIGRATION.steps.map((t, i) => (
              <li key={t} className="flex items-center gap-5 border-b border-line py-5">
                <span className="font-mono text-[11px] text-dim">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 text-[15px]">{t}</span>
                <DrawCheck i={i * 2} />
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <DotRule />

      {/* ------------ FAQ ------------ */}
      <section id="faq" className={cn('mx-auto max-w-3xl px-5 md:px-10', SPACE)}>
        <SectionHead label="FAQ" title="Good questions." />
        <Reveal><Accordion items={FAQ} defaultOpen={0} className="torch" /></Reveal>
      </section>

      {/* ------------ final CTA ------------ */}
      <section className="relative overflow-hidden border-t border-line">
        <DotField className="pointer-events-none absolute inset-0 size-full" pitch={34} glyphs strength={0.6} />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 py-28 text-center md:py-40">
          <span className="absolute -inset-x-10 inset-y-4 -z-0 bg-black/85 backdrop-blur-[10px] [mask-image:radial-gradient(closest-side,#000_62%,transparent)]" />
          <Reveal className="relative flex flex-col items-center"><Orb size={64} className="mb-8" /><DotText text={FINAL.headline} height={44} assemble /><p className="mt-7 max-w-md text-[16px] text-mute">{FINAL.sub}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button size="lg" onClick={() => nav('/site/register')}>{FINAL.primary} <ArrowRight /></Button><Button size="lg" variant="outline" onClick={() => nav('/site/products')}>{FINAL.secondary}</Button></div></Reveal>
        </div>
      </section>
    </>
  )
}
