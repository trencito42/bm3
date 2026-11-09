/* Public site blog: index (/site/blog) and article (/site/blog/:id). Mock content, dot-matrix covers, no images to load. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight, Search, X } from 'lucide-react'
import { BackLink, Button } from '../components/ui.jsx'
import { CodeBlock, CopyButton, inputCls } from '../components/ui2.jsx'
import { CAST, OrbX } from '../components/orbs.jsx'
import { DotText, Orb } from '../builder/FxBits.jsx'
import { useTorch } from '../lib/useTorch.js'
import { AUTHORS, BLOG_CATEGORIES, POSTS, fmtDate, postById } from './blogData.js'
import { Reveal, RevealGrid, useSeen } from './reveal.jsx'
import { cn } from '../lib/utils'

const eyebrow = 'font-mono text-[10.5px] uppercase tracking-[.1em] text-dim'
const catLabel = (id) => BLOG_CATEGORIES.find((c) => c.id === id)?.label || id
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/* ------------------------------------------------------------------ dot covers ------------------------------------------------------------------ */
function rng(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 } }
function coverDots(kind, seed) {
  const out = [], r = rng(seed)
  if (kind === 'wave') {
    const cols = 44, p1 = r() * 6, p2 = r() * 6, hotCol = 8 + Math.floor(r() * 28)
    for (let c = 0; c < cols; c++) {
      const x = 10 + c * (380 / (cols - 1))
      const top = 110 + Math.sin(c * 0.32 + p1) * 44 + Math.sin(c * 0.11 + p2) * 26
      for (let y = 192; y > top; y -= 9) out.push({ x, y, r: 1.5, o: 0.22 + 0.7 * (1 - (y - top) / (192 - top + 1)) * 0.6 })
      out.push({ x, y: top, r: 2.1, o: 1, hot: c === hotCol })
    }
  } else if (kind === 'sphere') {
    const N = 300, R = 78, rot = r() * 6.28, tilt = 0.4
    for (let i = 0; i < N; i++) {
      const yy = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - yy * yy), a = i * 2.399963 + rot
      const x0 = Math.cos(a) * rr, z0 = Math.sin(a) * rr
      const y1 = yy * Math.cos(tilt) - z0 * Math.sin(tilt), z1 = yy * Math.sin(tilt) + z0 * Math.cos(tilt), d = (z1 + 1) / 2
      out.push({ x: 200 + x0 * R, y: 100 + y1 * R, r: 0.7 + d * 1.7, o: 0.12 + d * 0.8, z: z1 })
    }
    const front = out.reduce((b, p) => (p.z > b.z ? p : b), out[0]); front.hot = true
  } else if (kind === 'grid') {
    const cols = 37, rows = 19, fx = 90 + r() * 220, fy = 40 + r() * 120
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = 10 + i * 10.5, y = 8 + j * 10.5, d = Math.hypot(x - fx, y - fy)
      out.push({ x, y, r: Math.max(0.5, 3.4 - d / 38), o: Math.max(0.12, 1 - d / 210) })
    }
    out.push({ x: fx, y: fy, r: 3.6, o: 1, hot: true })
  } else {
    const rot = r() * 6.28
    for (let ring = 1; ring <= 8; ring++) {
      const rad = ring * 12, n = Math.max(8, Math.round((Math.PI * 2 * rad) / 9))
      for (let k = 0; k < n; k++) { const a = (k / n) * 6.28318 + rot * ring * 0.15; out.push({ x: 200 + Math.cos(a) * rad * 1.5, y: 100 + Math.sin(a) * rad * 0.95, r: 1.3 + (ring % 3) * 0.3, o: 0.9 - ring * 0.08 }) }
    }
    out.push({ x: 200 + 12 * 1.5, y: 100, r: 3.2, o: 1, hot: true })
  }
  return out
}
function DotCover({ cover, className }) {
  const dots = useMemo(() => (cover.kind === 'cast' ? [] : coverDots(cover.kind, cover.seed)), [cover.kind, cover.seed])
  return (
    <div className={cn('relative aspect-[2/1] w-full overflow-hidden bg-[#0a0a0c]', className)} aria-hidden>
      {cover.kind === 'cast'
        ? <div className="absolute inset-0 grid place-items-center [background-image:radial-gradient(rgba(255,255,255,.1)_1px,transparent_1.3px)] [background-size:14px_14px]"><div className="flex items-end gap-[3.2%]">{['chat', 'builder', 'dev', 'game'].map((r) => <span key={r} className="block"><OrbX id="cast" role={r} size={58} state="idle" /></span>)}</div></div>
        : <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">{dots.map((d, i) => <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.r.toFixed(2)} fill={d.hot ? 'var(--brand)' : '#fff'} opacity={d.o.toFixed(2)} />)}</svg>}
    </div>
  )
}

function Meta({ post, className }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-dim', className)}>
      <span className="text-mute">{catLabel(post.category)}</span><span aria-hidden>·</span><span>{fmtDate(post.date)}</span><span aria-hidden>·</span><span>{post.read} min read</span>
    </div>
  )
}

/* ------------------------------------------------------------------ newsletter band ------------------------------------------------------------------ */
function Subscribe() {
  const [v, setV] = useState('')
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const bad = touched && !/^\S+@\S+\.\S+$/.test(v.trim())
  const submit = (e) => {
    e.preventDefault(); setTouched(true)
    if (busy || !/^\S+@\S+\.\S+$/.test(v.trim())) return
    setBusy(true)
    timer.current = setTimeout(() => { setBusy(false); setV(''); setTouched(false); toast.success('Subscribed (simulated)') }, 900)
  }
  return (
    <div className="torch rounded-2xl border border-line-2 bg-card p-7 sm:p-9">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-center gap-5"><Orb size={52} className="shrink-0" /><div><h2 className="text-xl font-semibold tracking-tight">One email a month. Five minutes to read.</h2><p className="mt-1 text-[14px] text-mute">What we shipped, what broke, and what we learned. No tracking pixels.</p></div></div>
        <form onSubmit={submit} noValidate className="w-full md:w-80">
          <div className="flex gap-2"><input type="email" aria-label="Email address" value={v} disabled={busy} onChange={(e) => setV(e.target.value)} onBlur={() => v && setTouched(true)} placeholder="you@example.com" aria-invalid={bad || undefined} className={cn(inputCls(bad), 'min-w-0 flex-1')} /><Button type="submit" loading={busy}>Subscribe</Button></div>
          <p className={cn('mt-1.5 h-4 text-[12px] text-bad transition-opacity duration-150', bad ? 'opacity-100' : 'opacity-0')} aria-live="polite">{bad ? 'Enter a valid email address' : ''}</p>
        </form>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ index ------------------------------------------------------------------ */
function PostCard({ post, i = 0 }) {
  const nav = useNavigate()
  const a = AUTHORS[post.author]
  return (
    <button onClick={() => nav('/site/blog/' + post.id)} className="torch group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-card text-left outline-none transition-[border-color,background-color,transform] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-line-2 focus-visible:border-white/40 active:translate-y-0">
      <DotCover cover={post.cover} className="border-b border-line" />
      <div className="flex flex-1 flex-col p-5">
        <Meta post={post} />
        <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight [text-wrap:balance]">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-mute">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="flex items-center gap-2.5 text-[12.5px] text-mute"><span className="grid size-6 place-items-center rounded-full border border-line-2 bg-white/5 text-[11px]">{a.initial}</span>{a.name}</span>
          <ArrowRight className="size-4 -translate-x-1 text-dim opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:text-fg group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" />
        </div>
      </div>
    </button>
  )
}

export function BlogIndex() {
  const nav = useNavigate()
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const search = useRef(null)
  useTorch()
  useEffect(() => {
    const k = (e) => { if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) && !e.metaKey && !e.ctrlKey) { e.preventDefault(); search.current?.focus() } }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [])
  const needle = q.trim().toLowerCase()
  const match = (p) => !needle || (p.title + ' ' + p.excerpt + ' ' + catLabel(p.category)).toLowerCase().includes(needle)
  const featured = POSTS.find((p) => p.featured)
  const filtering = cat !== 'all' || needle
  const list = POSTS.filter((p) => (cat === 'all' || p.category === cat) && match(p) && (filtering || p !== featured))
  const countIn = (id) => POSTS.filter((p) => (id === 'all' || p.category === id) && match(p)).length
  return (
    <div className="anim-page">
      <section className="relative mx-auto max-w-6xl px-5 pb-10 pt-14 md:px-10 md:pt-20">
        <div className="anim-rise" style={{ '--i': 0 }}><div className={eyebrow}>The Blipmade blog</div></div>
        <div className="anim-rise mt-5 hidden sm:block" style={{ '--i': 1 }}><DotText text="NOTES FROM THE CLOUD" height={44} assemble /></div>
        <div className="anim-rise mt-5 sm:hidden" style={{ '--i': 1 }}><DotText text="NOTES" height={40} assemble /></div>
        <h1 className="sr-only">Notes from the cloud</h1>
        <p className="anim-rise mt-6 max-w-xl text-[16px] leading-relaxed text-mute" style={{ '--i': 2 }}>Product news, engineering write-ups and guides from the people who run your servers. Written by humans, reviewed by Blips.</p>
      </section>

      <div className="sticky top-14 z-20 border-y border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center md:px-10">
          <div role="group" aria-label="Filter posts by category" className="flex flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {[{ id: 'all', label: 'All' }, ...BLOG_CATEGORIES].map((c) => {
              const on = cat === c.id
              return <button key={c.id} aria-pressed={on} onClick={() => setCat(c.id)} className={cn('inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-[13.5px] font-medium outline-none transition-[background-color,border-color,color] duration-150 focus-visible:border-white/40', on ? 'border-line-2 bg-white/[0.09] text-fg' : 'border-transparent text-mute hover:bg-hover hover:text-fg')}>{c.label}<span className={cn('font-mono text-[10.5px] tabular-nums', on ? 'text-mute' : 'text-dim')}>{countIn(c.id)}</span></button>
            })}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
            <input ref={search} type="search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the blog" placeholder="Search the blog" onKeyDown={(e) => { if (e.key === 'Escape') { setQ(''); e.currentTarget.blur() } }} className="h-9 w-full rounded-lg border border-line-2 bg-black/30 pl-9 pr-9 text-[16px] text-fg outline-none transition-colors placeholder:text-dim hover:border-white/20 focus:border-white/40 sm:text-[13.5px] [&::-webkit-search-cancel-button]:hidden" />
            {q ? <button aria-label="Clear search" onClick={() => { setQ(''); search.current?.focus() }} className="absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-dim transition-colors hover:text-fg"><X className="size-3.5" /></button> : <kbd aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line-2 px-1.5 font-mono text-[10px] text-dim sm:block">/</kbd>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:px-10">
        <p className="sr-only" role="status" aria-live="polite">{list.length + (!filtering && featured ? 1 : 0)} posts shown</p>
        {!filtering && featured && (
          <Reveal>
            <button onClick={() => nav('/site/blog/' + featured.id)} className="torch group mb-8 grid w-full overflow-hidden rounded-2xl border border-line-2 bg-card text-left outline-none transition-[border-color,transform] duration-200 ease-[var(--ease-out)] hover:border-white/25 focus-visible:border-white/40 md:grid-cols-[1.15fr_1fr]">
              <DotCover cover={featured.cover} className="min-h-[220px] border-b border-line md:aspect-auto md:h-full md:border-b-0 md:border-r" />
              <div className="flex flex-col justify-center p-7 sm:p-9">
                <div className="mb-4 flex items-center gap-2"><span className="rounded-full border border-[var(--brand)]/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.08em] text-[var(--brand)]">Featured</span></div>
                <Meta post={featured} />
                <h2 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight [text-wrap:balance] sm:text-[30px]">{featured.title}</h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-mute">{featured.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-medium">Read the story<ArrowRight className="size-4 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-1" /></span>
              </div>
            </button>
          </Reveal>
        )}
        {list.length === 0 ? (
          <div className="anim-rise flex flex-col items-center gap-4 py-20 text-center">
            <Orb size={64} state="waiting" />
            <div className="text-[17px] font-semibold">No posts match “{q}”.</div>
            <p className="max-w-sm text-[14px] text-mute">Try a shorter word, or browse everything.</p>
            <Button variant="outline" onClick={() => { setQ(''); setCat('all') }}>Show all posts</Button>
          </div>
        ) : (
          <RevealGrid key={cat + needle} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((p, i) => <PostCard key={p.id} post={p} i={i} />)}</RevealGrid>
        )}
        <div className="mt-16"><Reveal><Subscribe /></Reveal></div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ article ------------------------------------------------------------------ */
const TONE = { info: 'bg-info', warn: 'bg-warn', ok: 'bg-ok', bad: 'bg-bad' }
function Block({ b }) {
  const [t, ...r] = b
  if (t === 'p') return <p className="text-[16.5px] leading-[1.75] text-fg/80">{r[0]}</p>
  if (t === 'h2') return <h2 id={slug(r[0])} className="scroll-mt-28 pt-4 text-[24px] font-semibold leading-tight tracking-tight">{r[0]}</h2>
  if (t === 'list') return <ul className="space-y-2.5 text-[16px] leading-[1.7] text-fg/80">{r[0].map((x) => <li key={x} className="flex gap-3"><i aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-dim" /><span>{x}</span></li>)}</ul>
  if (t === 'quote') return <figure className="my-2 border-l-2 border-[var(--brand)] pl-6"><blockquote className="text-[21px] font-medium leading-snug tracking-tight [text-wrap:balance]">“{r[0]}”</blockquote><figcaption className="mt-3 font-mono text-[11.5px] text-dim">{r[1]}</figcaption></figure>
  if (t === 'code') return <CodeBlock lang={r[0]} code={r[1]} />
  if (t === 'callout') return <aside className="rounded-xl border border-line-2 bg-card p-5"><div className="flex items-center gap-2.5 text-[14px] font-semibold"><i className={cn('size-2 rounded-full', TONE[r[2]] || 'bg-info')} />{r[0]}</div><p className="mt-2 text-[14.5px] leading-relaxed text-mute">{r[1]}</p></aside>
  return null
}

export function BlogPost({ id }) {
  const nav = useNavigate()
  const post = postById(id)
  const bar = useRef(null)
  const root = useRef(null)
  const [active, setActive] = useState('')
  useTorch()
  const heads = useMemo(() => (post ? post.body.filter((b) => b[0] === 'h2').map((b) => b[1]) : []), [post])
  /* reading progress along the top, and which section is current */
  useEffect(() => {
    const sc = root.current?.closest('.overflow-y-auto')
    if (!sc || !post) return
    let t = 0
    const f = () => {
      t = 0
      const art = root.current.querySelector('article')
      if (!art) return
      const r = art.getBoundingClientRect(), s = sc.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (s.top + 120 - r.top) / Math.max(1, r.height - (s.height - 240))))
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
      let cur = ''
      for (const h of heads) { const n = document.getElementById(slug(h)); if (n && n.getBoundingClientRect().top - s.top < 160) cur = h }
      setActive(cur)
    }
    const on = () => { if (!t) t = window.setTimeout(f, 30) }
    sc.addEventListener('scroll', on, { passive: true })
    f()
    return () => { sc.removeEventListener('scroll', on); clearTimeout(t) }
  }, [post, heads])
  if (!post) return (
    <div className="anim-page mx-auto flex max-w-xl flex-col items-center gap-5 px-5 py-24 text-center"><Orb size={72} state="waiting" /><h1 className="text-2xl font-semibold tracking-tight">We could not find that post.</h1><p className="text-mute">It may have moved. Everything we have written is on the blog.</p><Button onClick={() => nav('/site/blog')}>Back to the blog</Button></div>
  )
  const a = AUTHORS[post.author]
  const i = POSTS.findIndex((p) => p.id === post.id)
  const related = POSTS.filter((p) => p.id !== post.id).sort((x, y) => Number(y.category === post.category) - Number(x.category === post.category)).slice(0, 3)
  const next = POSTS[(i + 1) % POSTS.length]
  const reviewer = post.blip ? CAST[post.blip] : null
  const url = typeof location !== 'undefined' ? location.href : ''
  return (
    <div ref={root} key={post.id} className="anim-page relative">
      <div aria-hidden className="pointer-events-none sticky top-14 z-30 h-0.5 w-full"><div ref={bar} className="h-full origin-left bg-fg/80" style={{ transform: 'scaleX(0)', transition: 'transform 90ms linear' }} /></div>
      <header className="mx-auto max-w-3xl px-5 pb-8 pt-10 md:px-10 md:pt-14">
        <div className="anim-rise" style={{ '--i': 0 }}><BackLink onClick={() => nav('/site/blog')}>Blog</BackLink></div>
        <div className="anim-rise mt-6" style={{ '--i': 1 }}><Meta post={post} /></div>
        <h1 className="anim-rise mt-4 text-[clamp(30px,5vw,46px)] font-semibold leading-[1.08] tracking-tight [text-wrap:balance]" style={{ '--i': 2 }}>{post.title}</h1>
        <p className="anim-rise mt-5 text-[18px] leading-relaxed text-mute" style={{ '--i': 3 }}>{post.excerpt}</p>
        <div className="anim-rise mt-7 flex flex-wrap items-center gap-x-5 gap-y-3" style={{ '--i': 4 }}>
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full border border-line-2 bg-white/5 text-sm">{a.initial}</span><span className="text-[13px] leading-tight"><b className="block font-medium">{a.name}</b><span className="text-dim">{a.role}</span></span></div>
          {reviewer && <span className="flex items-center gap-2 rounded-full border border-line-2 py-1 pl-1.5 pr-3 text-[12px] text-mute"><OrbX id="cast" role={post.blip} size={20} />Reviewed by <b className="font-medium text-fg">{reviewer.name}</b></span>}
          <span className="ml-auto flex items-center gap-1.5 text-[12px] text-dim">Copy link<CopyButton value={url} /></span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 md:px-10 lg:max-w-5xl"><div className="anim-rise overflow-hidden rounded-2xl border border-line" style={{ '--i': 5 }}><DotCover cover={post.cover} /></div></div>

      <div className="mx-auto grid max-w-5xl gap-10 px-5 pb-16 pt-12 md:px-10 lg:grid-cols-[190px_minmax(0,680px)] lg:justify-center lg:gap-14">
        <aside className="hidden lg:block"><nav aria-label="In this article" className="sticky top-32"><div className={cn(eyebrow, 'mb-3')}>In this article</div>
          <ul className="space-y-0.5 border-l border-line">{heads.map((h) => <li key={h}><button onClick={() => document.getElementById(slug(h))?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className={cn('-ml-px block w-full border-l py-1.5 pl-3 text-left text-[13px] leading-snug outline-none transition-[color,border-color] duration-150 focus-visible:text-fg', active === h ? 'border-fg text-fg' : 'border-transparent text-mute hover:text-fg')}>{h}</button></li>)}</ul></nav></aside>
        <article className="min-w-0 space-y-6">{post.body.map((b, k) => <Block key={k} b={b} />)}</article>
      </div>

      <div className="mx-auto max-w-5xl space-y-14 px-5 pb-24 md:px-10">
        <Reveal><div className="torch flex flex-col gap-5 rounded-2xl border border-line bg-card p-6 sm:flex-row sm:items-center">
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-line-2 bg-white/5 text-xl">{a.initial}</span>
          <div className="min-w-0 flex-1"><div className="text-[15px] font-semibold">Written by {a.name}</div><p className="mt-1 text-[13.5px] leading-relaxed text-mute">{a.role} at Blipmade.{reviewer ? ` This post was read and checked by ${reviewer.name}, our ${reviewer.label.toLowerCase()} Blip.` : ''}</p></div>
          {reviewer && <OrbX id="cast" role={post.blip} size={56} state="happy" />}
        </div></Reveal>
        <div><div className="mb-5 flex items-end justify-between"><h2 className="text-xl font-semibold tracking-tight">Keep reading</h2><button onClick={() => nav('/site/blog')} className="text-[13px] text-dim outline-none transition-colors hover:text-fg focus-visible:text-fg">All posts</button></div>
          <RevealGrid className="grid gap-4 md:grid-cols-3">{related.map((p) => <PostCard key={p.id} post={p} />)}</RevealGrid></div>
        <Reveal><Subscribe /></Reveal>
        <div className="flex justify-end"><button onClick={() => nav('/site/blog/' + next.id)} className="group text-right outline-none"><div className={eyebrow}>Next</div><div className="mt-1 flex items-center justify-end gap-2 text-[15px] font-medium transition-colors group-hover:text-mute group-focus-visible:text-mute">{next.title}<ArrowRight className="size-4 shrink-0 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-1" /></div></button></div>
      </div>
    </div>
  )
}
