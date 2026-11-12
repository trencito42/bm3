/* Public site: the app catalog (/site/apps) and the page of one app (/site/apps/:id). Mock data and mock ordering. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Collapsible from '@radix-ui/react-collapsible'
import { toast } from 'sonner'
import { ArrowRight, Check, ChevronDown, Search, X } from 'lucide-react'
import { Accordion, BackLink, Badge, Button, IconTile, RadioCard, RadioGroup, Segmented, Slider } from '../components/ui.jsx'
import { Select } from '../components/ui2.jsx'
import { AnimatedPrice } from '../components/DotViz.jsx'
import { Orb } from '../builder/FxBits.jsx'
import { APPS, APP_CATEGORIES, EDITIONS, REGIONS, priceOf } from './appsData.js'
import { cn, money } from '../lib/utils'

const eyebrow = 'font-mono text-[10.5px] uppercase tracking-[.08em] text-dim'
const catOf = (id) => APP_CATEGORIES.find((c) => c.id === id)

/* ------------------------------------------------------------------ catalog ------------------------------------------------------------------ */
function AppCard({ app, i }) {
  const nav = useNavigate()
  const Ico = catOf(app.category).icon
  return (
    <li className="anim-rise" style={{ '--i': Math.min(i, 10) }}>
      <button onClick={() => nav((app.category === 'games' ? '/site/games/' : '/site/apps/') + app.id)} className="group relative flex h-full w-full flex-col gap-3 rounded-xl border border-line bg-card p-5 text-left outline-none transition-[border-color,background-color,transform] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-line-2 hover:bg-[#161619] focus-visible:border-white/40 active:translate-y-0">
        <div className="flex items-start justify-between">
          <IconTile><Ico /></IconTile>
          {app.soon
            ? <Badge tone="warn" dot={false}>Coming soon</Badge>
            : <ArrowRight className="size-4 -translate-x-1 text-dim opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:text-fg group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" />}
        </div>
        <div className="text-[15px] font-semibold tracking-tight">{app.name}</div>
        <p className="line-clamp-2 text-[13px] leading-snug text-mute">{app.tagline}</p>
        <span className="mt-auto pt-1 font-mono text-[11px] uppercase text-dim">From {money(app.from)} / mo</span>
      </button>
    </li>
  )
}

export function AppsCatalog() {
  const nav = useNavigate()
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const search = useRef(null)
  /* "/" focuses the search field, like the rest of the product */
  useEffect(() => {
    const k = (e) => { if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) && !e.metaKey && !e.ctrlKey) { e.preventDefault(); search.current?.focus() } }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [])
  const needle = q.trim().toLowerCase()
  const match = (a) => !needle || (a.name + ' ' + a.tagline).toLowerCase().includes(needle)
  const inCat = (a) => cat === 'all' || a.category === cat
  const groups = APP_CATEGORIES.map((c) => ({ ...c, apps: APPS.filter((a) => a.category === c.id && inCat(a) && match(a)).sort((x, y) => Number(!!x.soon) - Number(!!y.soon)) })).filter((g) => g.apps.length)
  const total = groups.reduce((n, g) => n + g.apps.length, 0)
  const ready = APPS.filter((a) => !a.soon).length
  const countIn = (id) => APPS.filter((a) => (id === 'all' || a.category === id) && match(a)).length
  return (
    <div className="anim-page">
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-12 md:px-10 md:pt-16">
        <div className="anim-rise flex items-center gap-2 text-[13px] text-dim" style={{ '--i': 0 }}><button onClick={() => nav('/site')} className="rounded outline-none transition-colors hover:text-fg focus-visible:text-fg">Home</button><span aria-hidden>/</span><span className="text-mute">Catalog</span></div>
        <h1 className="anim-rise mt-5 max-w-3xl text-[clamp(34px,5.4vw,60px)] font-semibold leading-[1.02] tracking-tight" style={{ '--i': 1 }}>Games, databases and tools, on one price card.</h1>
        <p className="anim-rise mt-5 max-w-xl text-[16px] leading-relaxed text-mute" style={{ '--i': 2 }}>Everything starts as a container with the resources you choose. Pick one of the <b className="font-semibold text-fg">{ready}</b> things you can deploy right now and have it running in minutes.</p>
      </section>

      <div className="sticky top-14 z-20 border-y border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center md:px-10">
          <div role="group" aria-label="Filter apps by category" className="flex flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {[{ id: 'all', label: 'All', icon: null }, ...APP_CATEGORIES].map((c) => {
              const on = cat === c.id
              return (
                <button key={c.id} aria-pressed={on} onClick={() => setCat(c.id)} className={cn('inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-[13.5px] font-medium outline-none transition-[background-color,border-color,color] duration-150 focus-visible:border-white/40', on ? 'border-line-2 bg-white/[0.09] text-fg' : 'border-transparent text-mute hover:bg-hover hover:text-fg')}>
                  {c.icon && <c.icon className="size-3.5" />}{c.label}<span className={cn('font-mono text-[10.5px] tabular-nums transition-colors', on ? 'text-mute' : 'text-dim')}>{countIn(c.id)}</span>
                </button>
              )
            })}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
            <input ref={search} type="search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the catalog" placeholder="Search the catalog" onKeyDown={(e) => { if (e.key === 'Escape') { setQ(''); e.currentTarget.blur() } }} className="h-9 w-full rounded-lg border border-line-2 bg-black/30 pl-9 pr-9 text-[16px] text-fg outline-none transition-colors placeholder:text-dim hover:border-white/20 focus:border-white/40 sm:text-[13.5px] [&::-webkit-search-cancel-button]:hidden" />
            {q ? <button aria-label="Clear search" onClick={() => { setQ(''); search.current?.focus() }} className="absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-dim transition-colors hover:text-fg"><X className="size-3.5" /></button>
              : <kbd aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line-2 px-1.5 font-mono text-[10px] text-dim sm:block">/</kbd>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:px-10">
        <p className="sr-only" role="status" aria-live="polite">{total} {total === 1 ? 'app' : 'apps'} shown</p>
        {total === 0 ? (
          <div className="anim-rise flex flex-col items-center gap-4 py-20 text-center">
            <Orb size={64} state="waiting" />
            <div className="text-[17px] font-semibold">Nothing in the catalog matches “{q}”.</div>
            <p className="max-w-sm text-[14px] text-mute">Try a shorter name, or tell us what you want to run and we will look at it.</p>
            <div className="flex gap-2"><Button variant="outline" onClick={() => { setQ(''); setCat('all') }}>Clear filters</Button><Button onClick={() => nav('/site/docs')}>How to tell us</Button></div>
          </div>
        ) : groups.map((g) => (
          <section key={g.id + cat + needle} aria-labelledby={'cat-' + g.id} className="mb-14 last:mb-0">
            <div className="anim-rise mb-5 flex items-center gap-4">
              <IconTile><g.icon /></IconTile>
              <div><h2 id={'cat-' + g.id} className="text-xl font-semibold tracking-tight">{g.label}</h2><p className="mt-0.5 text-[13.5px] text-dim">{g.blurb}</p></div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{g.apps.map((a, i) => <AppCard key={a.id} app={a} i={i} />)}</ul>
          </section>
        ))}
        <div className="anim-rise mt-16 flex flex-col gap-5 rounded-2xl border border-line-2 bg-card p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div><h2 className="text-xl font-semibold tracking-tight">Running something else?</h2><p className="mt-1 max-w-lg text-[14px] text-mute">The catalog grows one verified image at a time. Tell us what you want to run and we will look at it.</p></div>
          <Button variant="outline" onClick={() => nav('/site/docs')}>How to tell us<ArrowRight /></Button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ one app ------------------------------------------------------------------ */
const FAQ = [
  ['Can I change the size later?', 'Yes. Memory and disk can be changed at any time from the client area. The price follows the new size from that moment, and unused credit stays on your account.'],
  ['What happens if it crashes?', 'It restarts on its own and the reason is kept in the log. You get a notification only when it did not come back.'],
  ['Where is it hosted?', 'In the region you pick: Frankfurt, Amsterdam, Helsinki or Ashburn. Moving later is a snapshot and a restore.'],
  ['Is there a contract?', 'No. Billing is hourly or monthly, you can cancel at any time, and yearly billing is 20% cheaper if you prefer it.'],
]

/* module-level on purpose: components declared inside AppPage would remount on every change and break slider dragging */
const Field = ({ label, value, children }) => (
  <div><div className="mb-2.5 flex items-baseline justify-between text-[13px]"><span className="text-mute">{label}</span><span className="font-mono tabular-nums">{value}</span></div>{children}</div>
)
const Line = ({ k, v }) => <div className="flex justify-between text-[13px]"><span className="text-dim">{k}</span><span className="font-mono tabular-nums text-fg">{v}</span></div>

function Summary({ app, ed, ram, cpu, disk, region, yearly, setYearly, price, deploying, onDeploy, bar }) {
  const r = REGIONS.find((x) => x[0] === region)
  if (bar) return (
    <div className="sticky bottom-0 z-10 -mx-5 flex items-center justify-between gap-4 border-t border-line bg-bg/90 px-5 py-3 backdrop-blur lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="flex items-end gap-1.5"><AnimatedPrice value={price} height={26} showDelta={false} /><span className="shrink-0 whitespace-nowrap pb-0.5 text-[11px] text-dim">/ mo</span></div>
      <Button loading={deploying} disabled={app.soon} onClick={onDeploy}>{app.soon ? 'Notify me' : 'Deploy'}</Button>
    </div>
  )
  return (
    <aside aria-label="Order summary" className="rounded-2xl border border-line-2 bg-card p-6 lg:sticky lg:top-32">
      <div className={eyebrow}>Your {app.name}{ed ? ` · ${ed.label}` : ''}</div>
      <div className="mt-4 flex items-end gap-2"><AnimatedPrice value={price} height={42} /><span className="shrink-0 whitespace-nowrap pb-1 text-xs text-dim">/ mo</span></div>
      <div className="relative mt-2 h-4 text-[12px] text-dim">
        <span className={cn('absolute inset-0 transition-opacity duration-200', yearly ? 'opacity-0' : 'opacity-100')}>Billed hourly, capped monthly</span>
        <span className={cn('absolute inset-0 transition-opacity duration-200', yearly ? 'opacity-100' : 'opacity-0')} aria-hidden={!yearly}>{money(price * 12)} billed yearly</span>
      </div>
      <Segmented className="mt-5 w-full [&>button]:flex-1" value={yearly ? 'y' : 'm'} onValueChange={(v) => v && setYearly(v === 'y')} options={[['m', 'Monthly'], ['y', 'Yearly −20%']]} />
      <div className="mt-5 space-y-2 border-t border-line pt-5"><Line k="Memory" v={`${ram} GB`} /><Line k="vCPU" v={`${cpu} cores`} /><Line k="NVMe" v={`${disk} GB`} /><Line k="Region" v={r[1]} /><Line k="Backups" v="Daily, included" /></div>
      <Button size="lg" className="mt-6 w-full" loading={deploying} disabled={app.soon} onClick={onDeploy}>{app.soon ? 'Coming soon' : 'Deploy this server'}{!deploying && !app.soon && <ArrowRight />}</Button>
      {app.soon ? <Button variant="outline" className="mt-2 w-full" onClick={() => toast.success('We will let you know (simulated)')}>Notify me</Button> : <p className="mt-3 text-center text-[12px] text-dim">No card required to explore. Simulated checkout.</p>}
    </aside>
  )
}

export function AppPage({ id, game }) {
  const nav = useNavigate()
  const app = APPS.find((a) => a.id === id)
  const [edId, setEdId] = useState('paper')
  const [ram, setRam] = useState(app?.ram[2] ?? 2)
  const [disk, setDisk] = useState(20)
  const [region, setRegion] = useState('fra')
  const [yearly, setYearly] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  if (!app) return (
    <div className="anim-page mx-auto flex max-w-xl flex-col items-center gap-5 px-5 py-24 text-center"><Orb size={72} state="waiting" /><h1 className="text-2xl font-semibold tracking-tight">We could not find that app.</h1><p className="text-mute">It may have been renamed. The catalog lists everything you can deploy.</p><Button onClick={() => nav('/site/apps')}>Back to the catalog</Button></div>
  )
  const cat = catOf(app.category)
  const ed = app.editions ? EDITIONS.find((e) => e.id === edId) : null
  const min = Math.max(app.ram[0], ed?.ramMin ?? 0)
  const ramV = Math.max(ram, min)
  const cpu = Math.max(1, Math.ceil(ramV / 2))
  const price = priceOf(app, ramV, disk, yearly)
  const players = app.slots ? ramV * app.slots : null
  const presets = [['s', 'Small', Math.max(min, app.ram[2])], ['m', 'Medium', Math.min(app.ram[1], Math.max(min, app.ram[2] * 2))], ['l', 'Large', Math.min(app.ram[1], Math.max(min, app.ram[2] * 4))]]
  const preset = presets.find((p) => p[2] === ramV)?.[0] ?? ''
  const related = APPS.filter((a) => a.category === app.category && a.id !== app.id).slice(0, 3)
  const deploy = () => {
    if (app.soon) { toast.success('We will let you know (simulated)'); return }
    setDeploying(true)
    timer.current = setTimeout(() => { setDeploying(false); toast.success(`${app.name} is being created (simulated)`, { description: `${ramV} GB · ${REGIONS.find((r) => r[0] === region)[1]}`, action: { label: 'Open', onClick: () => nav('/') } }) }, 1400)
  }
  const sum = { app, ed, ram: ramV, cpu, disk, region, yearly, setYearly, price, deploying, onDeploy: deploy }
  return (
    <div key={app.id} className="anim-page mx-auto max-w-6xl px-5 pb-10 pt-10 md:px-10 md:pt-14">
      <div className="anim-rise" style={{ '--i': 0 }}>
        <BackLink onClick={() => nav(game ? '/site/games' : '/site/apps')}>{game ? 'All games' : 'Catalog'}</BackLink>
        <div className="mt-5 flex items-start gap-4 md:gap-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-line-2 bg-card text-fg md:size-16"><cat.icon className="size-6 md:size-7" /></span>
          <div className="min-w-0">
            <div className={eyebrow}>{game ? `Game hosting · ${game.group}` : cat.label}</div>
            <h1 className="mt-1.5 flex flex-wrap items-center gap-3 text-[clamp(28px,4.4vw,44px)] font-semibold leading-none tracking-tight">{app.name}{app.soon && <Badge tone="warn" dot={false}>Coming soon</Badge>}</h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-mute">{game ? game.intro : app.tagline}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-10">
          {ed && (
            <section className="anim-rise" style={{ '--i': 1 }} aria-labelledby="ed-h">
              <h2 id="ed-h" className="mb-4 text-lg font-semibold tracking-tight">Edition</h2>
              <RadioGroup value={edId} onValueChange={setEdId} className="grid grid-cols-2 gap-2.5 sm:grid-cols-5" aria-label="Minecraft edition">
                {EDITIONS.map((e) => <RadioCard key={e.id} value={e.id} className="p-4 pr-10 text-[14px] font-semibold"><span>{e.label}</span></RadioCard>)}
              </RadioGroup>
              <div className="relative mt-3 min-h-[3.25rem] rounded-xl border border-line bg-black/30 px-4 py-3">
                {EDITIONS.map((e) => (
                  <div key={e.id} aria-hidden={e.id !== edId} className={cn('absolute inset-x-4 top-3 transition-[opacity,transform] duration-200 ease-[var(--ease-out)]', e.id === edId ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0')}>
                    <p className="text-[13.5px] text-mute">{e.note}{e.ramMin ? ` Needs at least ${e.ramMin} GB.` : ''}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">{e.tags.map((t) => <span key={t} className="rounded-full border border-line-2 px-2 py-0.5 font-mono text-[10.5px] text-dim">{t}</span>)}</div>
                  </div>
                ))}
                <p aria-hidden className="invisible text-[13.5px]">{ed.note} Needs at least 4 GB.<span className="mt-2 block h-6" /></p>
              </div>
            </section>
          )}

          <section className="anim-rise space-y-7 rounded-2xl border border-line bg-card p-6" style={{ '--i': 2 }} aria-labelledby="res-h">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="res-h" className="text-lg font-semibold tracking-tight">Resources</h2>
              <Segmented value={preset} onValueChange={(v) => { const p = presets.find((x) => x[0] === v); if (p) setRam(p[2]) }} options={presets.map(([v, l]) => [v, l])} aria-label="Size preset" />
            </div>
            <Field label="Memory" value={`${ramV} GB${players ? ` · about ${players} players` : ''}`}><Slider min={min} max={app.ram[1]} step={1} value={[ramV]} onValueChange={(v) => setRam(v[0])} aria-label="Memory in GB" /></Field>
            <Field label="NVMe storage" value={`${disk} GB`}><Slider min={10} max={200} step={10} value={[disk]} onValueChange={(v) => setDisk(v[0])} aria-label="Storage in GB" /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><div className="mb-2.5 text-[13px] text-mute">Region</div><Select value={region} onValueChange={setRegion} options={REGIONS.map(([v, l, ms]) => [v, `${l} · ${ms} ms`])} /></div>
              <div><div className="mb-2.5 text-[13px] text-mute">Processor</div><div className="flex h-9 items-center rounded-lg border border-line px-3 font-mono text-[12.5px] text-mute">{cpu} vCPU · scales with memory</div></div>
            </div>
          </section>

          <section className="anim-rise" style={{ '--i': 3 }} aria-labelledby="inc-h">
            <h2 id="inc-h" className="mb-4 text-lg font-semibold tracking-tight">Included in every plan</h2>
            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">{['Daily backups, kept for 7 days', 'DDoS protection', 'Instant setup, ready in about a minute', 'Web console and file manager', 'Automatic restart on failure', 'Support that answers in minutes'].map((t) => <li key={t} className="flex items-center gap-2.5 text-[14px] text-mute"><Check className="size-4 shrink-0 text-fg" />{t}</li>)}</ul>
          </section>

          <section className="anim-rise" style={{ '--i': 4 }} aria-labelledby="faq-h">
            <h2 id="faq-h" className="mb-4 text-lg font-semibold tracking-tight">Questions</h2>
            <Faq />
          </section>
        </div>
        <div className="anim-rise hidden lg:block" style={{ '--i': 2 }}><Summary {...sum} /></div>
        <div className="anim-rise lg:hidden" style={{ '--i': 2 }}><Summary {...sum} /></div>
      </div>

      {related.length > 0 && (
        <section className="anim-rise mt-16" style={{ '--i': 5 }} aria-labelledby="rel-h">
          <h2 id="rel-h" className="mb-4 text-lg font-semibold tracking-tight">More in {cat.label}</h2>
          <ul className="grid gap-3 sm:grid-cols-3">{related.map((a, i) => <AppCard key={a.id} app={a} i={0} />)}</ul>
        </section>
      )}
      <Summary {...sum} bar />
    </div>
  )
}

const Faq = () => <Accordion items={FAQ} size="sm" />
