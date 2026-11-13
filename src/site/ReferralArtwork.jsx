import { useEffect, useRef } from 'react'
import { fx } from '../builder/FxBits.jsx'
import { useLive } from './reveal.jsx'

const random = i => { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n) }
const curve = (a, b, c, d, t) => (1-t)**3*a + 3*(1-t)**2*t*b + 3*(1-t)*t*t*c + t**3*d

/* The recommendation travels through the network and becomes a share of an order.
   Full-surface artwork; the large number uses BM3's actual dot type. */
export default function ReferralArtwork({ paused }) {
  const ref = useRef(null), live = useLive(ref)
  useEffect(() => {
    const canvas = ref.current, ctx = canvas.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    const glyph = fx().dotText({ text: '20%' })
    const cols = Number(glyph.getAttribute('viewBox').split(' ')[2])
    const dots = [...glyph.querySelectorAll('circle')].map(c => [+c.getAttribute('cx'), +c.getAttribute('cy')])
    let width = 1, height = 1, raf = 0, last = 0
    const start = performance.now()
    const draw = now => {
      if (now - last < 33) { raf = requestAnimationFrame(draw); return }
      last = now
      const still = reduce.matches || paused
      const time = still ? 5 : (now - start) / 1000
      const mobile = width < 700
      const center = [width * (mobile ? .53 : .72), height * (mobile ? .24 : .48)]
      const pitch = Math.min(mobile ? width / 24 : width / 49, 33)
      const numeralW = cols * pitch
      ctx.clearRect(0, 0, width, height)
      // Concentric orbital traces, progressively revealing the network.
      for (let ring = 0; ring < 3; ring++) for (let i = 0; i < 200; i++) {
        const a = i / 200 * Math.PI * 2
        const r = pitch * (7.2 + ring * 2.3)
        const x = center[0] + Math.cos(a) * r
        const y = center[1] + Math.sin(a) * r * .68
        const wave = Math.max(0, Math.cos(a - time * .6 - ring * .8)) ** 18
        ctx.fillStyle = `rgba(242,242,243,${.035 + wave * .24})`
        ctx.beginPath(); ctx.arc(x, y, .75 + wave * .5, 0, Math.PI * 2); ctx.fill()
      }
      const endpoints = [[.48,.16], [.97,.21], [1.05,.7], [.68,.87], [.44,.66]]
      endpoints.forEach(([ex, ey], k) => {
        const end = [ex * width, ey * height]
        const anchor = [center[0] + (ex > .72 ? 1 : -1) * numeralW * .43, center[1] + (ey - .48) * pitch * 5]
        for (let j = 0; j < 100; j++) {
          const t = j / 99
          const x = curve(end[0], end[0], anchor[0], anchor[0], t)
          const y = curve(end[1], center[1], end[1], anchor[1], t)
          const head = (time * .16 + k * .19) % 1
          const light = Math.max(0, 1 - Math.abs(t - head) / .09)
          ctx.fillStyle = `rgba(242,242,243,${.09 + light * .6})`
          ctx.beginPath(); ctx.arc(x, y, .7 + light * .6, 0, Math.PI * 2); ctx.fill()
        }
        for (let j = 0; j < 45; j++) {
          const a = j / 45 * Math.PI * 2
          ctx.fillStyle = 'rgba(242,242,243,.24)'
          ctx.beginPath(); ctx.arc(end[0] + Math.cos(a) * 12, end[1] + Math.sin(a) * 12, .85, 0, Math.PI * 2); ctx.fill()
        }
      })
      dots.forEach(([x, y], i) => {
        const delay = random(i + 3) * .8
        const arrival = still ? 1 : Math.min(1, Math.max(0, (time - delay) / 1.6))
        const ease = 1 - (1 - arrival) ** 3
        const tx = center[0] + (x - cols / 2 + .5) * pitch
        const ty = center[1] + (y - 3) * pitch
        for (let sub = 0; sub < 13; sub++) {
          const angle = sub / 12 * Math.PI * 2
          const r = sub === 12 ? 0 : pitch * .29
          const px = tx + Math.cos(angle) * r + (1 - ease) * (random(i * 17 + sub) - .5) * width
          const py = ty + Math.sin(angle) * r + (1 - ease) * (random(i * 29 + sub) - .5) * height
          const shimmer = .7 + Math.sin(x * .3 + y * .3 - time) * .12
          ctx.fillStyle = `rgba(242,242,243,${shimmer * (.35 + arrival * .65)})`
          ctx.beginPath(); ctx.arc(px, py, Math.max(.75, pitch * .037), 0, Math.PI * 2); ctx.fill()
        }
      })
      // The brand accent signals an arriving referral, never a decorative wash.
      ctx.fillStyle = '#ff2d36'; ctx.globalAlpha = .75
      ctx.beginPath(); ctx.arc(center[0], center[1] + pitch * 6, 2.2, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
      if (live && !still) raf = requestAnimationFrame(draw)
    }
    const size = () => {
      cancelAnimationFrame(raf)
      width = canvas.clientWidth; height = canvas.clientHeight
      const dpr = Math.min(devicePixelRatio || 1, 2)
      canvas.width = width * dpr; canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(performance.now())
    }
    const ro = new ResizeObserver(size); ro.observe(canvas); reduce.addEventListener('change', size); size()
    return () => { cancelAnimationFrame(raf); ro.disconnect(); reduce.removeEventListener('change', size) }
  }, [live, paused])
  return <canvas ref={ref} className="ref-artwork" aria-hidden="true" />
}
