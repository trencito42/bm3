/* Loading placeholders in the same language as the dot-matrix type: a faint grid of dots (the "ghost" of the type), dots that pop in with a
   flash of the brand red (the dm-pop curve), and the occasional glitch where a band of rows slips sideways and a block of dots fires at once.
   Each block is drawn on a canvas that fills its parent, so it has the parent's size and can never make the layout grow or spill.
   One shared ticker drives every block on the page (a page-shaped skeleton can hold dozens), and it sleeps when nothing is visible. */
import { useEffect, useRef, useState } from 'react'
import { DotText } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'

const PITCH = 7, LIFE = 720
const calm = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const gch = (u) => 255 - u * 210, bch = (u) => 255 - u * 201   // white to #ff2d36: red stays 255, green and blue fall

/* ---------------- one ticker for all fields ---------------- */
const fields = new Set()
let raf = 0, lastTick = 0
function tick(now) {
  raf = 0
  if (now - lastTick >= 33) { lastTick = now; for (const f of fields) if (f.on) f.frame(now) }
  if ([...fields].some((f) => f.on)) raf = requestAnimationFrame(tick)
}
const wake = () => { if (!raf && !calm()) raf = requestAnimationFrame(tick) }
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { for (const f of fields) f.hidden = document.hidden; wake() })

function useDotField(ref, { density = 1, glitch = true } = {}) {
  useEffect(() => {
    const c = ref.current, host = c?.parentElement
    if (!c || !host) return
    const ctx = c.getContext('2d')
    const s = { w: 0, h: 0, cols: 0, rows: 0, dpr: 1, pops: new Map(), slip: null, nextGlitch: 0, seen: true, hidden: false, seed: 1 + Math.floor(Math.random() * 9000) }
    Object.defineProperty(s, 'on', { get: () => s.seen && !s.hidden })
    const rnd = () => { s.seed = (s.seed * 16807) % 2147483647; return s.seed / 2147483647 }
    const pop = (i, j, now, delay = 0) => s.pops.set(j * 4096 + i, now + delay)
    function draw(now) {
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0); ctx.clearRect(0, 0, s.w, s.h)
      const sl = s.slip && now < s.slip.until ? s.slip : null
      for (let j = 0; j < s.rows; j++) {
        const shift = sl && j >= sl.row && j < sl.row + sl.n ? sl.dx : 0
        for (let i = 0; i < s.cols; i++) {
          const x = s.ox + i * PITCH + shift * PITCH, y = s.oy + j * PITCH, key = j * 4096 + i, t0 = s.pops.get(key)
          let a = shift ? 0.35 : 0.1, r = 1.05, u = 0
          if (t0 != null && now >= t0) {
            const p = (now - t0) / LIFE
            if (p >= 1) s.pops.delete(key)
            else if (p < 0.4) { const q = p / 0.4; a = 0.15 + 0.85 * q; r = 1.05 * (0.3 + 1.4 * q); u = q }
            else { const q = (p - 0.4) / 0.6; a = 1 - 0.9 * q; r = 1.05 * (1.7 - 0.7 * q); u = 1 - q }
          }
          if (a <= 0.02) continue
          ctx.fillStyle = `rgba(255,${gch(u) | 0},${bch(u) | 0},${a.toFixed(3)})`
          ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill()
        }
      }
    }
    s.frame = (now) => {
      /* random dots fire on their own */
      const n = Math.max(1, Math.round(s.cols * s.rows * 0.0085 * density))
      for (let k = 0; k < n; k++) if (rnd() < 0.55) pop(Math.floor(rnd() * s.cols), Math.floor(rnd() * s.rows), now)
      /* now and then: a block fires at once and a band of rows slips sideways */
      if (glitch && now > s.nextGlitch) {
        s.nextGlitch = now + 1500 + rnd() * 1800
        const bw = 3 + Math.floor(rnd() * 6), bh = 1 + Math.floor(rnd() * 2), bi = Math.floor(rnd() * Math.max(1, s.cols - bw)), bj = Math.floor(rnd() * Math.max(1, s.rows - bh + 1))
        for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) if (rnd() < 0.8) pop(bi + i, bj + j, now, rnd() * 120)
        s.slip = { row: Math.floor(rnd() * s.rows), n: 1 + Math.floor(rnd() * 2), dx: (rnd() < 0.5 ? -1 : 1) * (1 + Math.floor(rnd() * 3)), until: now + 90 + rnd() * 90 }
      }
      draw(now)
    }
    const size = () => {
      s.dpr = Math.min(devicePixelRatio || 1, 2); s.w = host.clientWidth; s.h = host.clientHeight
      c.width = Math.max(1, s.w * s.dpr); c.height = Math.max(1, s.h * s.dpr)
      s.cols = Math.max(1, Math.floor(s.w / PITCH)); s.rows = Math.max(1, Math.floor(s.h / PITCH))
      s.ox = (s.w - s.cols * PITCH) / 2 + PITCH / 2; s.oy = (s.h - s.rows * PITCH) / 2 + PITCH / 2
      draw(performance.now())
    }
    size()
    if (calm()) { for (let k = 0; k < Math.max(2, s.cols * s.rows * 0.05); k++) pop(Math.floor(rnd() * s.cols), Math.floor(rnd() * s.rows), performance.now() - LIFE * 0.4); draw(performance.now()) }
    fields.add(s)
    const ro = new ResizeObserver(size); ro.observe(host)
    /* asleep when off screen */
    const io = new IntersectionObserver(([e]) => { s.seen = e.isIntersecting; wake() }); io.observe(host)
    wake()
    return () => { fields.delete(s); ro.disconnect(); io.disconnect() }
  }, [ref, density, glitch])
}

/* A placeholder with the size the content will have. Give it a height and (optionally) a width, as with any block. */
export function Skeleton({ className }) {
  const ref = useRef(null)
  useDotField(ref)
  return <div aria-hidden className={cn('relative block max-w-full min-h-[8px] overflow-hidden rounded-md [contain:paint]', className)}><canvas ref={ref} className="absolute inset-0 size-full" /></div>
}

/* re-mounts its child on an interval so the dot-matrix word assembles again and again while we wait */
function Cycle({ children }) {
  const [n, setN] = useState(0)
  useEffect(() => { const t = setInterval(() => setN((x) => x + 1), 2600); return () => clearInterval(t) }, [])
  return <span key={n}>{children}</span>
}
/* A whole screen or panel that is still on its way: the word assembles out of dots, over a field of flickering ones. */
export function MatrixLoader({ label = 'Loading', className }) {
  const ref = useRef(null)
  useDotField(ref, { density: 1.4 })
  return (
    <div role="status" aria-live="polite" aria-label={label} className={cn('mx-auto flex w-full max-w-full flex-col items-center gap-5 overflow-hidden py-10', className)}>
      <div aria-hidden className="relative h-11 w-[min(300px,100%)] overflow-hidden [contain:paint]"><canvas ref={ref} className="absolute inset-0 size-full" /></div>
      <Cycle><DotText text="LOADING" height={20} assemble /></Cycle>
      <span className="font-mono text-[10.5px] uppercase tracking-[.14em] text-dim">{label}</span>
    </div>
  )
}

/* Shows the page-shaped skeleton for a moment each time `id` changes, then the page itself. In the real app the moment is however long
   the data takes; here it is simulated. Skipped under reduced motion (the page just appears). */
export function PageLoad({ id, skeleton, ms = 720, wrap = 'space-y-6', children }) {
  const [ready, setReady] = useState(calm())
  useEffect(() => {
    if (calm()) { setReady(true); return }
    setReady(false)
    const t = setTimeout(() => setReady(true), ms)
    return () => clearTimeout(t)
  }, [id, ms])
  /* the page is rendered as it is (no wrapper), so the spacing and layout rules of its parent keep applying to it */
  if (!ready) return <div role="status" aria-busy="true" aria-label="Loading the page" className={wrap}>{skeleton}</div>
  return children
}
