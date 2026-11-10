/* Loading placeholders in the same language as the dot-matrix type: a faint grid of dots (the "ghost" of the type), dots that pop in with a
   flash of the brand red (the dm-pop curve), and the occasional glitch where a band of rows slips sideways and a block of dots fires at once.
   Drawn on a canvas that fills its parent, so it has the parent's size and can never make the layout grow or spill. */
import { useEffect, useRef, useState } from 'react'
import { DotText } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'

const PITCH = 7, LIFE = 720
const calm = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const mix = (u) => 255 - u * (255 - 0), g = (u) => 255 - u * (255 - 45), b = (u) => 255 - u * (255 - 54)   // white to #ff2d36 as u goes 0 to 1

function useDotField(ref, { density = 1, glitch = true } = {}) {
  useEffect(() => {
    const c = ref.current, host = c?.parentElement
    if (!c || !host) return
    const ctx = c.getContext('2d')
    const s = { w: 0, h: 0, cols: 0, rows: 0, dpr: 1, pops: new Map(), slip: null, nextGlitch: 0, raf: 0, on: true, last: 0, seed: 1 }
    const rnd = () => { s.seed = (s.seed * 16807) % 2147483647; return s.seed / 2147483647 }
    const size = () => {
      s.dpr = Math.min(devicePixelRatio || 1, 2); s.w = host.clientWidth; s.h = host.clientHeight
      c.width = Math.max(1, s.w * s.dpr); c.height = Math.max(1, s.h * s.dpr)
      s.cols = Math.max(1, Math.floor(s.w / PITCH)); s.rows = Math.max(1, Math.floor(s.h / PITCH))
      s.ox = (s.w - s.cols * PITCH) / 2 + PITCH / 2; s.oy = (s.h - s.rows * PITCH) / 2 + PITCH / 2
      draw(performance.now())
    }
    const pop = (i, j, now, delay = 0) => s.pops.set(j * 4096 + i, now + delay)
    function draw(now) {
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0); ctx.clearRect(0, 0, s.w, s.h)
      const sl = s.slip && now < s.slip.until ? s.slip : null
      for (let j = 0; j < s.rows; j++) {
        const shift = sl && j >= sl.row && j < sl.row + sl.n ? sl.dx : 0
        for (let i = 0; i < s.cols; i++) {
          const x = s.ox + i * PITCH + shift * PITCH, y = s.oy + j * PITCH
          const t0 = s.pops.get(j * 4096 + i)
          let a = shift ? 0.35 : 0.1, r = 1.05, u = 0
          if (t0 != null && now >= t0) {
            const p = (now - t0) / LIFE
            if (p >= 1) s.pops.delete(j * 4096 + i)
            else if (p < 0.4) { const q = p / 0.4; a = 0.15 + 0.85 * q; r = 1.05 * (0.3 + 1.4 * q); u = q }
            else { const q = (p - 0.4) / 0.6; a = 1 - 0.9 * q; r = 1.05 * (1.7 - 0.7 * q); u = 1 - q }
          }
          if (a <= 0.02) continue
          ctx.fillStyle = `rgba(${mix(u)},${g(u)},${b(u)},${a.toFixed(3)})`
          ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill()
        }
      }
    }
    const frame = (now) => {
      s.raf = 0
      if (!s.on) return
      if (now - s.last >= 33) {
        s.last = now
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
      s.raf = requestAnimationFrame(frame)
    }
    const kick = () => { if (!s.raf && s.on && !calm()) s.raf = requestAnimationFrame(frame) }
    size()
    if (calm()) { for (let k = 0; k < Math.max(2, s.cols * s.rows * 0.05); k++) pop(Math.floor(rnd() * s.cols), Math.floor(rnd() * s.rows), performance.now() - LIFE * 0.4); draw(performance.now() - 0) }
    const ro = new ResizeObserver(() => { size(); kick() }); ro.observe(host)
    /* idle when off screen or in a hidden tab */
    const io = new IntersectionObserver(([e]) => { s.on = e.isIntersecting && !document.hidden; kick() }); io.observe(host)
    const vis = () => { s.on = !document.hidden; kick() }; document.addEventListener('visibilitychange', vis)
    kick()
    return () => { ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', vis); cancelAnimationFrame(s.raf) }
  }, [ref, density, glitch])
}

/* A placeholder with the size the content will have. Give it a height and (optionally) a width, as with any block. */
export function Skeleton({ className }) {
  const ref = useRef(null)
  useDotField(ref)
  return <div aria-hidden className={cn('relative block max-w-full min-h-[8px] overflow-hidden rounded-md [contain:paint]', className)}><canvas ref={ref} className="absolute inset-0 size-full" /></div>
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
/* re-mounts its child on an interval so the dot-matrix word assembles again and again while we wait */
function Cycle({ children }) {
  const [n, setN] = useState(0)
  useEffect(() => { const t = setInterval(() => setN((x) => x + 1), 2600); return () => clearInterval(t) }, [setN])
  return <span key={n}>{children}</span>
}
