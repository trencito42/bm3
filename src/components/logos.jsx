/* Blipmade logo styles. Each entry has a Mark (icon) and a Lockup (mark + wordmark).
   Everything is vector / CSS driven, uses currentColor + var(--brand), and animates subtly. */
import { useEffect, useRef, useState } from 'react'
import { DotText, Orb, fx } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'

const NS = 'http://www.w3.org/2000/svg'
const word = (h, extra) => ({ fontSize: h * 1.35, lineHeight: 1, ...extra })

/* ---- 1. DOTS (derived from Klinch's identity: kept only so you can compare / revert) ---- */
const Dots = {
  Mark: ({ size = 32 }) => <DotText text="B" height={size * 0.8} />,
  Lockup: ({ h = 13, text = 'BLIPMADE' }) => <DotText text={text.toUpperCase()} height={h} />,
}

/* ---- 2. PIXEL: chunky 1-bit blocks with a hard red offset shadow and a scan flicker ---- */
function PixelWord({ text, h }) {
  const ref = useRef(null)
  useEffect(() => {
    const s = fx().dotText({ text: text.toUpperCase(), title: text })
    const g = document.createElementNS(NS, 'g'), sh = document.createElementNS(NS, 'g')
    ;[...s.querySelectorAll('circle')].forEach((c) => {
      const x = +c.getAttribute('cx'), y = +c.getAttribute('cy')
      const mk = (dx, dy, fill, cls) => { const r = document.createElementNS(NS, 'rect'); r.setAttribute('x', x - 0.46 + dx); r.setAttribute('y', y - 0.46 + dy); r.setAttribute('width', 0.92); r.setAttribute('height', 0.92); r.setAttribute('rx', 0.06); r.setAttribute('fill', fill); if (cls) r.setAttribute('class', cls); r.style.setProperty('--d', x * 45 + 'ms'); return r }
      sh.appendChild(mk(0.24, 0.24, 'var(--brand)'))
      g.appendChild(mk(0, 0, 'currentColor', 'logo-pix'))
    })
    const vb = s.getAttribute('viewBox').split(' ').map(Number)
    s.setAttribute('viewBox', `${vb[0]} ${vb[1]} ${vb[2] + 0.5} ${vb[3] + 0.5}`)
    s.replaceChildren(sh, g)
    s.style.height = h * 1.05 + 'px'
    s.style.width = (h * 1.05 * (vb[2] + 0.5)) / (vb[3] + 0.5) + 'px'
    ref.current.replaceChildren(s)
  }, [text, h])
  return <span ref={ref} className="inline-flex" />
}
const Pixel = {
  Mark: ({ size = 32 }) => <PixelWord text="B" h={size * 0.82} />,
  Lockup: ({ h = 13, text = 'BLIPMADE' }) => <PixelWord text={text} h={h} />,
}

/* ---- 3. RADAR: a red "blip" with expanding ping rings ---- */
const RadarMark = ({ size = 32 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
    <circle cx="24" cy="24" r="4.6" fill="var(--brand)" />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx="24" cy="24" r="6" fill="none" stroke="currentColor" strokeWidth="1.7" opacity="0">
        <animate attributeName="r" values="6;22" dur="2.8s" begin={`${i * 0.93}s`} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0" dur="2.8s" begin={`${i * 0.93}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </svg>
)
const Radar = {
  Mark: RadarMark,
  Lockup: ({ h = 13, text = 'blipmade' }) => <span className="inline-flex items-center" style={{ gap: h * 0.5 }}><RadarMark size={h * 1.9} /><span className="font-sans font-bold" style={word(h, { letterSpacing: '-0.045em' })}>{text.toLowerCase()}</span></span>,
}

/* ---- 4. STACK: two server bars forming a "b", status LEDs blinking in sequence ---- */
const StackMark = ({ size = 32 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
    {[7, 19.5, 32].map((y, i) => (
      <g key={y}>
        <rect x="6" y={y} width="36" height="9" rx="3.2" fill="currentColor" opacity={i === 1 ? 1 : 0.92} />
        <circle cx="36" cy={y + 4.5} r="1.9" fill="#0d0d0f"><animate attributeName="fill" values="#0d0d0f;#ff2d36;#0d0d0f" dur="2.4s" begin={`${i * 0.4}s`} repeatCount="indefinite" /></circle>
        <rect x="11" y={y + 3.6} width={i === 1 ? 14 : 9} height="1.8" rx="0.9" fill="#0d0d0f" opacity="0.35" />
      </g>
    ))}
  </svg>
)
const Stack = {
  Mark: StackMark,
  Lockup: ({ h = 13, text = 'BLIPMADE' }) => <span className="inline-flex items-center" style={{ gap: h * 0.55 }}><StackMark size={h * 1.8} /><span className="font-sans font-extrabold" style={word(h, { letterSpacing: '0.16em', fontSize: h * 1.02 })}>{text.toUpperCase()}</span></span>,
}

/* ---- 5. HALFTONE: a "B" built from dots whose size follows the letter's density, pulsing outward ---- */
function useHalftone(char) {
  const [dots, setDots] = useState([])
  useEffect(() => {
    const draw = () => {
      const N = 15, S = 150
      const c = document.createElement('canvas'); c.width = c.height = S
      const x = c.getContext('2d')
      x.fillStyle = '#fff'; x.font = '900 128px Inter, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'alphabetic'
      x.fillText(char, S / 2, S * 0.8)
      const cell = S / N, out = []
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const d = x.getImageData(i * cell, j * cell, cell, cell).data
        let a = 0; for (let k = 3; k < d.length; k += 4) a += d[k]
        a /= (d.length / 4) * 255
        if (a > 0.1) out.push({ i, j, r: 0.28 + a * 0.72 })
      }
      setDots(out)
    }
    document.fonts?.ready.then(draw)
  }, [char])
  return dots
}
function HalftoneMark({ size = 32, char = 'B' }) {
  const dots = useHalftone(char)
  const hot = dots.length ? dots.reduce((b, d) => (d.i - d.j > b.i - b.j ? d : b), dots[0]) : null
  return (
    <svg viewBox="0 0 15 15" width={size} height={size} aria-hidden>
      {dots.map((d) => <circle key={d.i + '-' + d.j} cx={d.i + 0.5} cy={d.j + 0.5} r={d.r * 0.49} fill={hot === d ? 'var(--brand)' : 'currentColor'} className="logo-ht" style={{ '--d': Math.hypot(d.i - 7, d.j - 7) * 75 + 'ms' }} />)}
    </svg>
  )
}
const Halftone = {
  Mark: HalftoneMark,
  Lockup: ({ h = 13, text = 'blipmade' }) => <span className="inline-flex items-center" style={{ gap: h * 0.5 }}><HalftoneMark size={h * 2} char={(text[0] || 'b').toUpperCase()} /><span className="font-sans font-semibold" style={word(h, { letterSpacing: '-0.03em' })}>{text.toLowerCase()}</span></span>,
}

/* ---- 6. STRIPE: heavy wordmark cut by scanlines that thin out downward (retro-future), red scan sweep ---- */
function StripeWord({ text, h }) {
  const t = text.toUpperCase(), size = h * 1.9, w = t.length * size * 0.72, H = size * 1.0
  const id = 'st' + t.replace(/\W/g, '') + Math.round(h)
  const rows = 9
  return (
    <svg viewBox={`0 0 ${w} ${H}`} width={w * (h * 1.4) / H} height={h * 1.4} aria-label={text} role="img" style={{ overflow: 'visible' }}>
      <defs>
        <mask id={id}><text x="0" y={H * 0.86} fill="#fff" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize={size} letterSpacing={-size * 0.03} textLength={w} lengthAdjust="spacingAndGlyphs">{t}</text></mask>
      </defs>
      <g mask={`url(#${id})`} fill="currentColor">
        {Array.from({ length: rows }, (_, i) => { const p = H / rows; const th = p * (0.97 - (i / rows) * 0.52); return <rect key={i} x="0" y={i * p} width={w} height={th} /> })}
        <rect x="0" y="0" width={w} height={H * 0.06} fill="var(--brand)" className="logo-scan" style={{ '--h': H + 'px' }} />
      </g>
    </svg>
  )
}
const StripeMark = ({ size = 32 }) => <StripeWord text="B" h={size * 0.9} />
const Stripe = { Mark: StripeMark, Lockup: ({ h = 13, text = 'BLIPMADE' }) => <StripeWord text={text} h={h} /> }

/* ---- 7. TERMINAL: lowercase mono wordmark with prompt chevron and a blinking block cursor ---- */
const TermMark = ({ size = 32 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
    <rect x="4" y="6" width="40" height="36" rx="9" fill="none" stroke="currentColor" strokeWidth="2.6" />
    <path d="M14 18l9 6-9 6" fill="none" stroke="var(--brand)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="26" y="29" width="9" height="3.4" rx="1" fill="currentColor" className="logo-blink" />
  </svg>
)
const Term = {
  Mark: TermMark,
  Lockup: ({ h = 13, text = 'blipmade' }) => <span className="inline-flex items-center font-mono font-medium" style={word(h, { fontSize: h * 1.25, letterSpacing: '-0.02em' })}><span style={{ color: 'var(--brand)', marginRight: h * 0.35 }}>›</span>{text.toLowerCase()}<i className="logo-blink ml-[0.12em] inline-block bg-current" style={{ width: h * 0.62, height: h * 1.05 }} /></span>,
}

/* ---- 8. ORB: the assistant orb as the mark, tight geometric wordmark ---- */
const OrbL = {
  Mark: ({ size = 32 }) => <Orb size={size} />,
  Lockup: ({ h = 13, text = 'blipmade' }) => <span className="inline-flex items-center" style={{ gap: h * 0.6 }}><Orb size={h * 2} /><span className="font-sans font-bold" style={word(h, { letterSpacing: '-0.04em' })}>{text.toLowerCase()}</span></span>,
}

/* ---- 9. GRID: 4×4 dot grid with a red dot hopping along a spiral ---- */
const PATH = [0, 1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4, 5, 6, 10, 9]
function GridMark({ size = 32 }) {
  const [k, setK] = useState(0)
  useEffect(() => { const t = setInterval(() => setK((x) => (x + 1) % PATH.length), 420); return () => clearInterval(t) }, [])
  const on = PATH[k], trail = PATH[(k + PATH.length - 1) % PATH.length]
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
      {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={6 + (i % 4) * 12} cy={6 + Math.floor(i / 4) * 12} r={i === on ? 4.2 : i === trail ? 3.2 : 2.6} fill={i === on ? 'var(--brand)' : 'currentColor'} opacity={i === on ? 1 : i === trail ? 0.7 : 0.35} style={{ transition: 'all .35s var(--ease-spring)' }} />)}
    </svg>
  )
}
const Grid = {
  Mark: GridMark,
  Lockup: ({ h = 13, text = 'blipmade' }) => <span className="inline-flex items-center" style={{ gap: h * 0.55 }}><GridMark size={h * 1.9} /><span className="font-mono font-medium" style={word(h, { fontSize: h * 1.2, letterSpacing: '-0.03em' })}>{text.toLowerCase()}</span></span>,
}

export const LOGOS = [
  { id: 'dots', name: 'Dots', tag: 'Derived from Klinch', note: 'The dot-matrix wordmark we started from. Strong, but it is Klinch’s signature, so it will read as theirs. Kept only for comparison.', ...Dots },
  { id: 'pixel', name: 'Pixel', tag: '1-bit blocks', note: 'Square pixels with a hard red offset shadow and a slow scan flicker. Same heritage as dot-matrix but unmistakably different: blocks instead of dots, colour instead of glow.', ...Pixel },
  { id: 'radar', name: 'Radar blip', tag: 'Name-led', note: 'Literal “blip”: a red dot sending out ping rings. Works as a favicon, a loading state and a status light. Wordmark is tight lowercase Inter Bold.', ...Radar },
  { id: 'stack', name: 'Server stack', tag: 'Hosting-led', note: 'Three server bars forming a “b”, LEDs blinking in sequence. Says hosting without clip-art. Wordmark is wide-tracked uppercase for contrast with the dense mark.', ...Stack },
  { id: 'halftone', name: 'Halftone B', tag: 'Generated', note: 'The letter is rasterised at runtime into dots sized by density, pulsing outward from the centre. One red dot marks the top-right of the B.', ...Halftone },
  { id: 'stripe', name: 'Scanline', tag: 'Retro-future', note: 'Heavy extended wordmark cut by horizontal scanlines that thin downward, with a red scan sweep. Loud: best for hero and marketing, not for tiny UI.', ...Stripe },
  { id: 'term', name: 'Terminal', tag: 'Developer-led', note: 'Lowercase mono with a red prompt chevron and a blinking cursor. Very developer-friendly, almost no ink, scales down perfectly.', ...Term },
  { id: 'orb', name: 'Orb', tag: 'Product-led', note: 'The assistant orb is the mark, so the logo and the AI builder are one thing. Needs colour; add a flat one-colour fallback for print.', ...OrbL },
  { id: 'grid', name: 'Hop grid', tag: 'System-led', note: '4×4 grid with a red dot hopping a spiral path: infrastructure, capacity, “one thing moving through a system”. Mono wordmark.', ...Grid },
]

/* ---- selection (persisted, applies everywhere Brand is used) ---- */
const KEY = 'blipmade-logo'
const read = () => { try { return localStorage.getItem(KEY) || 'dots' } catch { return 'dots' } }
export function useBrandId() {
  const [id, setId] = useState(read)
  useEffect(() => { const f = () => setId(read()); addEventListener('brand-change', f); addEventListener('storage', f); return () => { removeEventListener('brand-change', f); removeEventListener('storage', f) } }, [])
  const set = (v) => { try { localStorage.setItem(KEY, v) } catch {} dispatchEvent(new Event('brand-change')) }
  return [id, set]
}
/* drop-in replacement for <DotText text="BLIPMADE" height={n} /> */
export function Brand({ height = 13, text = 'BLIPMADE', mark }) {
  const [id] = useBrandId()
  const L = LOGOS.find((l) => l.id === id) || LOGOS[0]
  return mark ? <L.Mark size={height * 1.8} /> : <L.Lockup h={height} text={text} />
}
