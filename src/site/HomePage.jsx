import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ArrowRight, Check, ChevronDown, Plus, Terminal as TermIcon } from 'lucide-react'
import { Button, Slider } from '../components/ui.jsx'
import { AnimatedPrice, DotBars, DotGauge, DotNum } from '../components/DotViz.jsx'
import { DotField, DotText, Orb } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'

/* seen: flips to true once the element scrolls into view (and stays). live: true only while it is on screen and the tab is
   visible, so the tickers below stop re-rendering when nobody can see them. */
function useSeen(ref, margin = '0px 0px 12% 0px') {
  const [seen, setSeen] = useState(typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { rootMargin: margin })
    io.observe(el)
    /* a fast scrollbar drag can jump past an element between two frames, so IntersectionObserver never reports it:
       a throttled scroll check also reveals anything that is now at or above the fold */
    let raf = 0
    const check = () => { raf = 0; if (el.getBoundingClientRect().top < innerHeight * 1.08) setSeen(true) }
    /* a timeout, not rAF: animation frames do not run in a background tab, and the content must still appear */
    const onScroll = () => { if (!raf) raf = window.setTimeout(check, 50) }
    addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => { io.disconnect(); clearTimeout(raf); removeEventListener('scroll', onScroll, { capture: true }) }
  }, [seen])
  return seen
}
function useLive(ref) {
  const [live, setLive] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let vis = true, tab = !document.hidden
    const upd = () => setLive(vis && tab)
    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([e]) => { vis = e.isIntersecting; upd() }) : null
    io?.observe(el)
    const onVis = () => { tab = !document.hidden; upd() }
    document.addEventListener('visibilitychange', onVis)
    return () => { io?.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])
  return live
}
/* scroll reveal: fades/rises once when first seen; `i` staggers siblings */
const RevealGrid = ({ className, children }) => {
  const ref = useRef(null)
  const seen = useSeen(ref, '0px 0px 12% 0px')
  return <div ref={ref} data-seen={seen || undefined} className={cn('reveal-grid', className)}>{children}</div>
}
const Reveal = ({ i = 0, className, children, as: T = 'div', ...p }) => {
  const ref = useRef(null)
  const seen = useSeen(ref)
  return <T ref={ref} className={cn(seen ? 'anim-rise' : 'opacity-0', className)} style={{ '--i': i }} {...p}>{children}</T>
}

const eyebrow = 'font-mono text-[11px] uppercase tracking-[.1em] text-dim'
const Section = ({ id, eyebrowText, title, sub, children, className }) => (
  <section id={id} className={cn('mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28', className)}>
    <Reveal className="mb-12 max-w-2xl"><div className={eyebrow}>{eyebrowText}</div><h2 className="mt-3 text-[34px] font-semibold leading-[1.08] tracking-tight md:text-[44px]">{title}</h2>{sub && <p className="mt-4 text-[16px] leading-relaxed text-mute">{sub}</p>}</Reveal>
    {children}
  </section>
)

/* ---------------- auto-playing deploy terminal ---------------- */
const SCRIPT = [
  ['$ blip deploy ./api --region fra', 'cmd'], ['› Packing source (4.2 MB)', ''], ['› Building image node:22', ''], ['› Reserving capacity in Frankfurt', ''], ['› Attaching network · IPv4 + IPv6', ''], ['✓ Live at api-7f3a.blipmade.app', 'ok'],
]
function AutoTerminal() {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  const live = useLive(ref)
  useEffect(() => { if (!live) return; const t = setInterval(() => setN((x) => (x >= SCRIPT.length + 3 ? 0 : x + 1)), 900); return () => clearInterval(t) }, [live])
  return (
    <div ref={ref} className="font-mono text-[12.5px] leading-7" style={{ height: (SCRIPT.length + 1) * 28 }} aria-label="Deploy log (animated example)" role="img">
      {SCRIPT.slice(0, Math.min(n, SCRIPT.length)).map(([l, c], i) => <div key={i} className={cn('rise', c === 'ok' ? 'text-ok' : c === 'cmd' ? 'text-fg' : 'text-fg/60')}>{l}</div>)}
      {n < SCRIPT.length && <span className="inline-block h-4 w-2 animate-pulse bg-fg align-middle" />}
    </div>
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
const PINGS = [[14, 5, 'Ashburn'], [31, 3, 'Frankfurt'], [30, 2, 'Amsterdam'], [34, 1, 'Helsinki']]
function WorldMap() {
  const P = 8
  return (
    <svg viewBox={`0 0 ${58 * P} ${MAP.length * P}`} className="h-auto w-full">
      {MAP.map((row, y) => [...row].map((c, x) => <circle key={x + '-' + y} cx={x * P + 4} cy={y * P + 4} r={c === '#' ? 2.1 : 0.7} fill="#fff" opacity={c === '#' ? 0.5 : 0.1} />))}
      {PINGS.map(([x, y, n]) => (
        <g key={n}>
          <circle cx={x * P + 4} cy={y * P + 4} r="3.5" fill="#ff2d36" />
          <circle cx={x * P + 4} cy={y * P + 4} r="3.5" fill="none" stroke="#ff2d36" strokeWidth="1"><animate attributeName="r" from="3.5" to="16" dur="2.4s" repeatCount="indefinite" /><animate attributeName="opacity" from="0.8" to="0" dur="2.4s" repeatCount="indefinite" /></circle>
        </g>
      ))}
    </svg>
  )
}

/* ---------------- live metrics card ---------------- */
function LiveMetrics() {
  const [vals, setVals] = useState(() => Array.from({ length: 30 }, (_, i) => 40 + Math.sin(i / 2.5) * 22 + ((i * 17) % 13)))
  const ref = useRef(null)
  const live = useLive(ref)
  useEffect(() => { if (!live) return; const t = setInterval(() => setVals((v) => [...v.slice(1), 40 + Math.random() * 60]), 1100); return () => clearInterval(t) }, [live])
  const cpu = Math.round(vals[vals.length - 1] * 0.6)
  return (
    <div ref={ref} className="space-y-5">
      <div className="flex items-center justify-between"><span className={eyebrow}>blipmade-prod · live</span><span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase text-ok"><i className="size-1.5 animate-pulse rounded-full bg-ok" />streaming</span></div>
      <DotBars values={vals} rows={9} unit="Mbps" live />
      <div className="flex justify-around pt-1"><DotGauge value={cpu} label="CPU" size={88} n={36} /><DotGauge value={58} label="RAM" size={88} n={36} /><DotGauge value={41} label="DISK" size={88} n={36} /></div>
    </div>
  )
}

/* ---------------- builder teaser ---------------- */
const PROMPT = 'A bakery in Porto with online booking'
function BuilderTeaser() {
  const [i, setI] = useState(0)
  const ref = useRef(null)
  const live = useLive(ref)
  useEffect(() => { if (!live) return; const t = setInterval(() => setI((x) => (x >= PROMPT.length + 18 ? 0 : x + 1)), 90); return () => clearInterval(t) }, [live])
  const typed = PROMPT.slice(0, Math.min(i, PROMPT.length))
  const built = Math.max(0, Math.min(4, Math.floor((i - PROMPT.length) / 4)))
  const state = i < PROMPT.length ? 'speaking' : built < 4 ? 'thinking' : 'happy'
  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3"><Orb size={36} state={state} /><span className="text-[13px] text-mute">Blipmade builder</span></div>
        <div className="rounded-xl border border-line-2 bg-black/40 p-3.5 text-[13.5px]">{typed}<span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-fg align-middle" /></div>
      </div>
      <div className="h-[212px] overflow-hidden rounded-xl border border-line-2 bg-[#fbf3e6] text-[#2b1d12]">
        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold"><span>Crumb & Co.</span><span className="opacity-50">Menu · Story · Visit</span></div>
        {built >= 1 && <div className="rise px-4 pb-3 pt-2"><div className="font-serif text-[22px] leading-tight">Fresh bread,<br />slow mornings.</div><div className="mt-2 inline-block rounded-full bg-[#d9622b] px-3 py-1 text-[10px] font-semibold text-white">Reserve a table</div></div>}
        {built >= 2 && <div className="rise grid grid-cols-3 gap-1.5 px-4 pb-3">{[0, 1, 2].map((k) => <div key={k} className="h-9 rounded-md bg-[#2b1d12]/10" />)}</div>}
        {built >= 3 && <div className="rise mx-4 mb-4 rounded-md bg-[#d9622b]/15 px-3 py-2 text-[10px]">“Best croissant in town.”</div>}
        {built < 1 && <div className="px-4 pb-6 pt-8 text-center text-[11px] opacity-40">Waiting for your idea…</div>}
      </div>
    </div>
  )
}

/* ---------------- configurator ---------------- */
/* defined at module level: a component declared inside Configurator remounts on every value change and breaks dragging */
const SliderRow = ({ l, v, u, st, min, max, set }) => (<div><div className="mb-2 flex justify-between text-[13px]"><span className="text-mute">{l}</span><span className="font-mono">{v[0]} {u}</span></div><Slider min={min} max={max} step={st} value={v} onValueChange={set} /></div>)

function Configurator() {
  const nav = useNavigate()
  const [cpu, setCpu] = useState([2]); const [ram, setRam] = useState([4]); const [disk, setDisk] = useState([80])
  const price = cpu[0] * 2.5 + ram[0] * 1.25 + disk[0] * 0.03
  return (
    <div className="grid gap-8 rounded-2xl border border-line-2 bg-card p-6 md:grid-cols-[1fr_300px] md:p-8">
      <div className="space-y-7"><SliderRow l="vCPU" v={cpu} u="cores" st={1} min={1} max={16} set={setCpu} /><SliderRow l="Memory" v={ram} u="GB" st={1} min={1} max={64} set={setRam} /><SliderRow l="NVMe storage" v={disk} u="GB" st={10} min={20} max={1000} set={setDisk} /></div>
      <div className="flex flex-col justify-between rounded-xl border border-line bg-black/40 p-5"><div><div className={eyebrow}>Your server</div><div className="mt-4"><AnimatedPrice value={price} height={38} /></div><div className="mt-2 text-xs text-dim">per month · billed hourly</div></div><Button size="lg" className="mt-6 w-full" onClick={() => nav('/site/register')}>Deploy this server <ArrowRight /></Button></div>
    </div>
  )
}

const FAQ = [['Where are my servers located?', 'Frankfurt, Amsterdam, Helsinki and Ashburn. You choose the region when you deploy, and can move later with a snapshot.'], ['Can I try it without a card?', 'Yes. New accounts start with demo credit, and no payment details are required to explore.'], ['How fast does support reply?', 'The median first reply is about six minutes, from real engineers, not a script.'], ['Is there a contract?', 'No. Billing is hourly or monthly, you can cancel any time, and unused credit stays on your account.']]
function Faq() {
  const [open, setOpen] = useState(0)
  return <Reveal className="divide-y divide-line overflow-hidden rounded-2xl border border-line-2 bg-card">{FAQ.map(([q, a], i) => (
    <Collapsible.Root key={q} open={open === i} onOpenChange={(o) => setOpen(o ? i : -1)}>
      <Collapsible.Trigger className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-medium outline-none transition-colors duration-150 hover:bg-white/[0.02] focus-visible:bg-white/[0.04] active:bg-white/[0.04]">{q}<ChevronDown className={cn('size-4 shrink-0 text-dim transition-[transform,color] duration-300 ease-[var(--ease-out)] group-hover:text-fg', open === i && 'rotate-180 text-fg')} /></Collapsible.Trigger>
      <Collapsible.Content className="anim-collapse overflow-hidden"><p className="px-6 pb-5 text-[14px] leading-relaxed text-mute">{a}</p></Collapsible.Content>
    </Collapsible.Root>))}</Reveal>
}

function Stats() {
  const ref = useRef(null)
  const seen = useSeen(ref, '0px 0px -10% 0px')
  return (
    <div ref={ref} className="border-y border-line bg-black/30"><div className="mx-auto grid max-w-6xl gap-px px-5 py-16 sm:grid-cols-4 md:px-10">{[['99.98%', 'Uptime, 90 days'], ['40S', 'Median deploy'], ['6 MIN', 'First reply'], ['4', 'Regions']].map(([n, l], i) => (
      <div key={l} className="space-y-3 py-4 text-center">
        <div className="flex h-9 justify-center">{seen && <DotNum text={n} height={36} animate />}</div>
        <div className={cn('text-[13px] text-dim transition-opacity duration-500', seen ? 'opacity-100' : 'opacity-0')} style={{ transitionDelay: seen ? `${300 + i * 80}ms` : '0ms' }}>{l}</div>
      </div>))}</div></div>
  )
}

const BENTO = 'rounded-2xl border border-line bg-card p-6 transition-[border-color,background-color] duration-200 hover:border-line-2 hover:bg-[#161619]'
const LOGOS = ['NODE.JS', 'PYTHON', 'PHP', 'GO', 'RUST', 'DOCKER', 'POSTGRES', 'REDIS', 'NEXT.JS', 'LARAVEL', 'MINECRAFT']

export default function HomePage() {
  const nav = useNavigate()
  return (
    <>
      {/* ------------ hero ------------ */}
      <section className="relative overflow-hidden border-b border-line">
        <DotField className="pointer-events-none absolute inset-0 size-full" pitch={34} glyphs strength={0.6} />
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-20 md:px-10 md:pt-28">
          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="absolute -inset-x-16 -inset-y-10 -z-0 bg-black/85 backdrop-blur-[10px] [mask-image:radial-gradient(closest-side,#000_62%,transparent)]" />
            <div className="relative flex flex-col items-center">
              <button type="button" onClick={() => nav('/site/register')} className="group mb-8 inline-flex items-center gap-2 rounded-full border border-line-2 bg-black/60 py-1 pl-1.5 pr-3 text-[12px] text-mute outline-none transition-[border-color,color] duration-200 hover:border-white/30 hover:text-fg focus-visible:border-white/40 focus-visible:text-fg"><Orb size={20} />New · AI site builder is live <ArrowRight className="size-3 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5" /></button>
              <DotText text="HOSTING, SIMPLIFIED" height={46} assemble />
              <h1 className="sr-only">Hosting, simplified</h1>
              <p className="mt-8 max-w-xl text-[18px] leading-snug text-fg/75">Deploy apps, VPS, databases and email in seconds. One calm control panel, EU infrastructure, and support that answers in minutes.</p>
              <div className="mt-9 flex flex-wrap justify-center gap-3"><Button size="lg" onClick={() => nav('/site/register')}>Start free <ArrowRight /></Button><Button size="lg" variant="outline" onClick={() => nav('/')}>Open the live demo</Button></div>
              <p className={cn(eyebrow, 'mt-6')}>99.98% uptime · 4 regions · from $4 / month</p>
            </div>
          </div>
          {/* product window */}
          <div className="relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-line-2 bg-[#0a0a0c] shadow-[0_40px_120px_rgba(0,0,0,.8)]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5"><span className="flex gap-1.5">{[0, 1, 2].map((i) => <i key={i} className="size-2.5 rounded-full bg-white/15" />)}</span><span className="mx-auto font-mono text-[11px] text-dim">console.blipmade.cloud</span></div>
            <div className="grid md:grid-cols-[1.1fr_1fr]"><div className="border-b border-line p-6 md:border-b-0 md:border-r"><div className="mb-3 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><TermIcon className="size-3.5" />Deploy</div><AutoTerminal /></div><div className="p-6"><LiveMetrics /></div></div>
          </div>
        </div>
      </section>

      {/* ------------ stack marquee ------------ */}
      <div className="group overflow-hidden border-b border-line py-5 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <div className="marquee flex w-max gap-12 font-mono text-[12px] tracking-[.12em] text-dim">{[...LOGOS, ...LOGOS].map((l, i) => <span key={i} className="flex items-center gap-12">{l}<i className="size-1 rounded-full bg-white/20" /></span>)}</div>
      </div>

      {/* ------------ bento ------------ */}
      <Section eyebrowText="Why Blipmade" title="Everything you run, one calm surface." sub="Not another dashboard with forty tabs. Every tool is where you expect it and nothing gets in the way.">
        <RevealGrid className="grid gap-4 md:grid-cols-6">
          <div className={cn(BENTO, 'md:col-span-4')}><div className={eyebrow}>Deploy</div><h3 className="mt-2 text-xl font-semibold tracking-tight">From git push to live in 40 seconds.</h3><p className="mt-2 max-w-md text-[14px] text-mute">Connect a repository or upload a folder. We build, provision and attach HTTPS for you.</p><div className="mt-6 rounded-xl border border-line bg-black/40 p-5"><AutoTerminal /></div></div>
          <div className={cn(BENTO, 'md:col-span-2')}><div className={eyebrow}>Regions</div><h3 className="mt-2 text-xl font-semibold tracking-tight">Close to your users.</h3><div className="mt-5"><WorldMap /></div><div className="mt-3 flex flex-wrap gap-1.5">{PINGS.map(([, , n]) => <span key={n} className="rounded-full border border-line-2 px-2 py-0.5 font-mono text-[10.5px] text-mute">{n}</span>)}</div></div>
          <div className={cn(BENTO, 'md:col-span-2')}><div className={eyebrow}>Observe</div><h3 className="mt-2 text-xl font-semibold tracking-tight">Live, down to the dot.</h3><div className="mt-5"><LiveMetrics /></div></div>
          <div className={cn(BENTO, 'md:col-span-4')}><div className={eyebrow}>AI site builder</div><h3 className="mt-2 text-xl font-semibold tracking-tight">Describe it. Watch it get built.</h3><p className="mt-2 max-w-md text-[14px] text-mute">Say what you need in a sentence. The builder designs, writes and deploys a real site you can keep editing by chatting.</p><div className="mt-6"><BuilderTeaser /></div></div>
          <div className={cn(BENTO, 'md:col-span-3')}><div className={eyebrow}>Console & files</div><h3 className="mt-2 text-xl font-semibold tracking-tight">A full shell and file manager, in the browser.</h3><div className="mt-5 overflow-hidden rounded-xl border border-line bg-black/40 font-mono text-[12px] leading-6 text-fg/70">{[['server.js', '6.4 KB'], ['package.json', '1.8 KB'], ['.env', '412 B'], ['logs/', '—']].map(([n, s]) => <div key={n} className="flex justify-between border-b border-line/50 px-4 py-1.5 last:border-b-0"><span>{n}</span><span className="text-dim">{s}</span></div>)}</div></div>
          <div className={cn(BENTO, 'md:col-span-3')}><div className={eyebrow}>Support</div><h3 className="mt-2 text-xl font-semibold tracking-tight">Real engineers, in minutes.</h3><div className="mt-5 space-y-2.5"><div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-fg px-3.5 py-2 text-[13px] text-black">I cannot SSH into my VPS.</div><div className="flex items-end gap-2.5"><Orb size={28} state="speaking" /><div className="max-w-[80%] rounded-2xl rounded-bl-md border border-line bg-white/[0.03] px-3.5 py-2 text-[13px]">Found it: the firewall reset after maintenance. Restored port 22. Try again?</div></div></div></div>
        </RevealGrid>
      </Section>

      {/* ------------ configurator ------------ */}
      <Section eyebrowText="Pricing" title="Build the server you need. Pay for exactly that." sub="Drag the sliders. The price updates instantly, and hourly billing means you never pay for a month you did not use."><Configurator /></Section>

      {/* ------------ stats ------------ */}
      <Stats />

      {/* ------------ testimonials ------------ */}
      <Section eyebrowText="Customers" title="People who stopped thinking about hosting." sub="Quotes below are sample copy for this design mock-up.">
        <RevealGrid className="grid gap-4 md:grid-cols-3">{[['We moved 40 services over a weekend. The panel is the first one my whole team actually likes.', 'Maya Chen', 'CTO, Northwind'], ['Support fixed a firewall issue before I finished writing the second message.', 'Jonas Weber', 'Indie developer'], ['The builder shipped our landing page while we were still on the kickoff call.', 'Elena Rossi', 'Founder, Studio Rossi']].map(([q, n, r]) => <figure key={n} className={cn(BENTO, 'flex flex-col justify-between gap-6')}><blockquote className="text-[15px] leading-relaxed">“{q}”</blockquote><figcaption className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full border border-line-2 bg-white/5 text-sm">{n[0]}</span><span className="text-[13px]"><b className="block font-medium">{n}</b><span className="text-dim">{r}</span></span></figcaption></figure>)}</RevealGrid>
      </Section>

      {/* ------------ FAQ ------------ */}
      <Section id="faq" eyebrowText="FAQ" title="Good questions." className="max-w-3xl"><Faq /></Section>

      {/* ------------ final CTA ------------ */}
      <section className="relative overflow-hidden border-t border-line">
        <DotField className="pointer-events-none absolute inset-0 size-full" pitch={34} glyphs strength={0.6} />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center md:py-32">
          <span className="absolute -inset-x-10 inset-y-4 -z-0 bg-black/85 backdrop-blur-[10px] [mask-image:radial-gradient(closest-side,#000_62%,transparent)]" />
          <div className="relative flex flex-col items-center"><Orb size={64} className="mb-8" /><DotText text="DEPLOY NOW" height={44} assemble /><p className="mt-7 max-w-md text-[16px] text-mute">Your first server is live in under a minute. No card required.</p><div className="mt-8 flex gap-3"><Button size="lg" onClick={() => nav('/site/register')}>Create free account <ArrowRight /></Button><Button size="lg" variant="outline" onClick={() => nav('/site/products')}>See products</Button></div></div>
        </div>
      </section>
    </>
  )
}
