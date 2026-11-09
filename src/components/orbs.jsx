/* Orb styles: ten constructions of the same assistant character.
   All share the face (eyes, blink, glance, cursor-follow, joy/sad states) and the six states:
   idle · thinking · speaking · happy · waiting · error.  All motion honours prefers-reduced-motion. */
import { useEffect, useId, useRef, useState } from 'react'
import '../builder/fx.js'
import './orbs.css'
import './orbs2.css'
import './orbs3.css'
import { cn } from '../lib/utils'

const fx = () => window.BlipFX
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- shared face (uses the .kl-face-* CSS: blink, glance, follow-cursor, joy arcs) ---------- */
const Face = () => (
  <span className="kl-face-fl"><span className="kl-face-f"><span className="kl-face-look"><span className="kl-face-eyes">
    <i className="kl-face-eye" /><i className="kl-face-eye kl-face-eye-r" />
    <svg className="kl-face-joys" viewBox="0 0 100 100"><path className="kl-face-joy" d="M35 54 Q40.5 41 46 54" /><path className="kl-face-joy kl-face-joy-r" d="M54 54 Q59.5 41 65 54" /></svg>
  </span></span></span></span>
)

/* a short soft pulse whenever the state changes, so the transition reads as a reaction (not a hard cut) */
function usePulse(ref, state) {
  const prev = useRef(state)
  useEffect(() => {
    if (prev.current === state) return
    prev.current = state
    const el = ref.current
    if (!el || reduced()) return
    el.removeAttribute('data-pulse'); void el.offsetWidth; el.setAttribute('data-pulse', '')
    const t = setTimeout(() => el.removeAttribute('data-pulse'), 320)
    return () => clearTimeout(t)
  }, [state, ref])
}

/* ---------- GOO: metaballs through an SVG gooey filter ---------- */
function GooBody() {
  const id = 'goo' + useId().replace(/[^a-z0-9]/gi, '')
  const fill = `url(#${id}g)`
  return (
    <span className="ob ob-goo">
      <svg viewBox="0 0 100 100" className="size-full">
        <defs>
          <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.6" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
          </filter>
          <linearGradient id={id + 'g'} gradientUnits="userSpaceOnUse" x1="18" y1="14" x2="82" y2="86">
            <stop offset="0" stopColor="#ff5ab8" /><stop offset=".5" stopColor="#ff8a4a" /><stop offset="1" stopColor="#8a4dff" />
          </linearGradient>
        </defs>
        <g className="grad-wrap"><g filter={`url(#${id})`}>
          <circle cx="50" cy="50" r="32" fill={fill} />
          <g className="orbit" style={{ '--t': '7s' }}><circle cx="50" cy="15" r="12" fill={fill} /></g>
          <g className="orbit rev" style={{ '--t': '9s' }}><circle cx="50" cy="86" r="11" fill={fill} /></g>
          <g className="orbit" style={{ '--t': '12s' }}><circle cx="84" cy="50" r="9" fill={fill} /></g>
        </g></g>
      </svg>
    </span>
  )
}

/* ---------- 1. AURORA: the original (dark ball + rotating colour rings), imperative ---------- */
function Aurora({ size, state, className }) {
  const host = useRef(null), orb = useRef(null)
  useEffect(() => { const o = fx().orb(size, state); orb.current = o; host.current.replaceChildren(o); return () => o.remove() }, [size])
  useEffect(() => { orb.current?.setState(state) }, [state])
  usePulse(host, state)
  return <span ref={host} className={cn('orb-host', className)} style={{ display: 'inline-grid' }} />
}

/* ---------- 4. DOT SPHERE: rotating fibonacci sphere of dots ---------- */
function DotSphereBody({ size, state }) {
  const c = useRef(null), st = useRef(state)
  st.current = state
  useEffect(() => {
    const cv = c.current, ctx = cv.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2)
    cv.width = cv.height = size * dpr
    const N = Math.max(90, Math.round(size * 2.6))
    const pts = Array.from({ length: N }, (_, i) => { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * 2.399963; return [Math.cos(a) * r, y, Math.sin(a) * r] })
    let t = 0, raf
    const tilt = 0.38, ct = Math.cos(tilt), sT = Math.sin(tilt)
    const draw = () => {
      const s = st.current
      t += { thinking: 0.04, speaking: 0.024, happy: 0.02, idle: 0.009, waiting: 0.004, error: 0.002 }[s] ?? 0.01
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size)
      const R = size * 0.45, cx = size / 2
      const col = s === 'error' ? '255,80,90' : s === 'happy' ? '170,255,200' : '255,255,255'
      const pulse = s === 'speaking' ? 1 + Math.sin(t * 9) * 0.05 : 1
      for (const [x, y, z] of pts) {
        const x1 = x * Math.cos(t) + z * Math.sin(t), z1 = -x * Math.sin(t) + z * Math.cos(t)
        const y2 = y * ct - z1 * sT, z2 = y * sT + z1 * ct
        const d = (z2 + 1) / 2
        ctx.fillStyle = `rgba(${col},${0.14 + d * 0.82})`
        ctx.beginPath(); ctx.arc(cx + x1 * R * pulse, cx + y2 * R * pulse, Math.max(0.5, size * (0.006 + d * 0.012)), 0, 6.283); ctx.fill()
      }
      if (!reduced()) raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [size])
  return <span className="ob ob-dsphere"><canvas ref={c} style={{ width: size, height: size, position: 'absolute', inset: 0 }} /></span>
}

/* ---------- 7. LED MATRIX: the whole face is lit pixels ---------- */
function LedBody({ size, state }) {
  const [t, setT] = useState(0)
  useEffect(() => { if (reduced()) return; const i = setInterval(() => setT((x) => x + 1), 110); return () => clearInterval(i) }, [])
  const N = 11, lit = new Set(), add = (x, y) => lit.add(x + ',' + y)
  let ex = [3, 7], rows = [4, 5, 6]
  const blink = t % 40 > 38
  if (blink) rows = [5]
  if (state === 'speaking') rows = t % 4 < 2 ? [4, 5, 6] : [5, 6]
  if (state === 'thinking') { const sh = Math.round(Math.sin(t / 4) * 1.6); ex = [3 + sh, 7 + sh]; if (t % 14 > 11) rows = [5] }
  if (state === 'waiting') { ex = [4, 8]; rows = [5, 6] }
  if (state === 'happy') { [[2, 6], [3, 5], [4, 6], [6, 6], [7, 5], [8, 6]].forEach(([x, y]) => add(x, y)); rows = [] }
  else if (state === 'error') { [[2, 4], [3, 5], [3, 6], [8, 4], [7, 5], [7, 6]].forEach(([x, y]) => add(x, y)); rows = [] }
  else ex.forEach((x) => rows.forEach((y) => add(x, y)))
  const cells = []
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (Math.hypot(x - 5, y - 5) > 5.25) { cells.push(<i key={x + '-' + y} style={{ visibility: 'hidden' }} />); continue }
    const on = lit.has(x + ',' + y)
    cells.push(<i key={x + '-' + y} style={{ borderRadius: '50%', background: on ? (state === 'error' ? '#ff5560' : '#fff') : 'rgba(255,255,255,.1)', boxShadow: on ? `0 0 ${size * 0.05}px ${state === 'error' ? '#ff5560' : '#fff'}` : 'none', transform: on ? 'scale(1.05)' : 'scale(.8)', transition: 'all .12s' }} />)
  }
  return <span className="ob ob-led"><span style={{ position: 'absolute', inset: '7%', display: 'grid', gridTemplateColumns: `repeat(${N}, 1fr)`, gap: size * 0.012 }}>{cells}</span></span>
}

/* ---------- 9. WAVEFORM: radial bars react to the state ---------- */
function WaveBody({ size, state }) {
  const [t, setT] = useState(0)
  useEffect(() => { if (reduced()) return; const i = setInterval(() => setT((x) => x + 1), 55); return () => clearInterval(i) }, [])
  const B = 44, cx = 50, r0 = 33
  const amp = { speaking: 1, thinking: 0.55, happy: 0.6, idle: 0.13, waiting: 0.06, error: 0.3 }[state] ?? 0.13
  return (
    <span className="ob ob-wave">
      <svg viewBox="0 0 100 100" className="size-full overflow-visible">
        {Array.from({ length: B }, (_, i) => {
          const a = (i / B) * Math.PI * 2
          const n = Math.abs(Math.sin(i * 0.7 + t * 0.55) * Math.sin(i * 0.29 + t * 0.21))
          const sweep = state === 'thinking' ? Math.max(0, Math.cos(a - t * 0.2)) * 0.9 : 0
          const len = 1.5 + (n * amp + sweep * amp) * 13
          return <line key={i} x1={cx + Math.cos(a) * r0} y1={cx + Math.sin(a) * r0} x2={cx + Math.cos(a) * (r0 + len)} y2={cx + Math.sin(a) * (r0 + len)} stroke={state === 'error' ? '#ff5560' : state === 'happy' ? '#9bffbf' : '#fff'} strokeWidth="1.5" strokeLinecap="round" opacity={0.45 + Math.min(1, len / 14) * 0.55} />
        })}
      </svg>
      <span className="disc" />
    </span>
  )
}

/* ---------- registry ---------- */
const bodies = {
  plasma: () => <span className="ob ob-plasma"><i /><i /><i /><i /></span>,
  glass: () => <span className="ob ob-glass" />,
  nebula: () => <span className="ob ob-nebula"><span className="arm a" /><span className="arm b" /><span className="stars" /></span>,
  bubble: () => <span className="ob ob-bubble" />,
  moon: () => <span className="ob ob-moon" />,
  halo: () => <span className="ob ob-halo" />,
  goo: () => <GooBody />,
  jelly: () => <span className="ob ob-jelly" />,
  eclipse: () => <span className="ob ob-eclipse" />,
  prism: () => <span className="ob ob-prism"><i className="gem" /><i className="spark" /></span>,
  sonar: () => <span className="ob ob-sonar"><i /><i /><i /></span>,
  cloud: () => <span className="ob ob-cloud"><i /><i /><i /></span>,
  marble: () => <span className="ob ob-marble"><span className="ob-marble-shine" /></span>,
  mercury: () => <span className="ob ob-mercury" />,
  ember: () => <span className="ob ob-ember"><i /><i /><i /><i /><i /></span>,
  mono: () => <span className="ob ob-mono"><span className="orbit" /></span>,
  dsphere: (p) => <DotSphereBody {...p} />,
  led: (p) => <LedBody {...p} />,
  wave: (p) => <WaveBody {...p} />,
}

export const ORBS = [
  { id: 'aurora', name: 'Aurora', tag: 'Current', note: 'Dark ball ringed by rotating colour bands, glowing white eyes. The one we started with.' },
  { id: 'plasma', name: 'Plasma', tag: 'Fluid', note: 'Four colour blobs drift and blend inside a dark glass sphere with a specular highlight. Thinking speeds the flow up; error rotates the hue.' },
  { id: 'nebula', name: 'Nebula', tag: 'Cosmic', note: 'A small galaxy: two dust arms turn in opposite directions over a field of twinkling stars. Deep and calm; the core is kept dark so the eyes stay clear.' },
  { id: 'glass', name: 'Glass', tag: 'Refractive', dark: true, note: 'A translucent blue sphere with a rim light, a gloss crescent and a caustic that slides along the bottom. Dark eyes read clearly on it.' },
  { id: 'bubble', name: 'Bubble', tag: 'Iridescent', note: 'Thin-film colour travelling around a nearly clear sphere, wobbling like soap. Almost no mass: the most delicate option.' },
  { id: 'halo', name: 'Halo', tag: 'Neon ring', note: 'One bold ring of rotating spectrum around a dark void, with a soft bloom outside. Speaking makes the whole orb breathe.' },
  { id: 'goo', name: 'Goo', tag: 'Metaballs', note: 'Blobs orbit a core and fuse into it through a gooey filter, so the silhouette keeps changing while the gradient flows across it.' },
  { id: 'jelly', name: 'Jelly', tag: 'Squish', dark: true, note: 'Translucent green gel that squishes while it talks and hops when it is happy. The friendliest, most physical of the set.' },
  { id: 'mercury', name: 'Mercury', tag: 'Liquid metal', dark: true, note: 'A chrome blob whose outline slowly morphs, with a sweeping sheen. Heavy and expensive-looking; works best large.' },
  { id: 'moon', name: 'Moon', tag: 'Matte pearl', dark: true, note: 'A matte pearl lit from one side; the light source drifts around it so the shading is always slowly moving. Quiet and soft.' },
  { id: 'eclipse', name: 'Eclipse', tag: 'Corona', note: 'A black disc with a thin bright rim and a faintly turning corona of rays. High contrast, very graphic.' },
  { id: 'prism', name: 'Prism', tag: 'Faceted gem', dark: true, note: 'A six-facet gem whose colours sweep slowly around, with one sparkle that flashes now and then. The only orb that is not round, so it reads instantly at small sizes.' },
  { id: 'sonar', name: 'Sonar', tag: 'Ripples', note: 'A dark core sending out cyan ripples. Thinking speeds the pings up; error shifts them to a warning hue. Feels like something is listening.' },
  { id: 'cloud', name: 'Cloud', tag: 'Soft', dark: true, note: 'Pale blue puffs drifting over a soft sphere, with dark eyes. The gentlest, most approachable option, especially on light backgrounds.' },
  { id: 'marble', name: 'Marble', tag: 'Glass swirl', dark: true, note: 'A glass marble with a colour swirl rolling inside and a hard highlight. Toy-like and glossy, and it still holds up at 22 px.' },
  { id: 'ember', name: 'Ember', tag: 'Warm', note: 'A glowing coal that flickers, with sparks rising off it. The warm counterpart to the cool orbs; hue-rotates to a cold tone on error.' },
  { id: 'dsphere', name: 'Dot sphere', tag: 'On-brand', note: 'A rotating sphere of dots drawn on canvas. Same language as the dot-matrix type; the back of the sphere dims so the eyes stay legible.' },
  { id: 'led', name: 'LED matrix', tag: 'Pixel face', noFace: true, note: 'An 11\u00d711 dot display where the entire face (eyes, blink, smile, frown) is made of lit pixels. No overlay: the expression is the display.' },
  { id: 'wave', name: 'Waveform', tag: 'Voice', note: 'A dark disc ringed by 44 radial bars that respond to the state: calm when idle, full amplitude when speaking, a travelling sweep when thinking.' },
  { id: 'mono', name: 'Mono', tag: 'Minimal', dark: true, note: 'A flat off-white disc with black eyes. Thinking adds a single red orbiting dot. The quietest option, and the only one that survives one-colour print.' },
]

/* ---------- the orb ---------- */
export function OrbX({ id = 'aurora', size = 28, state = 'idle', className }) {
  const meta = ORBS.find((o) => o.id === id) || ORBS[0]
  const root = useRef(null)
  useEffect(() => { if (id === 'aurora') return; const off = fx().track(root.current); return off }, [id])
  usePulse(root, state)
  if (id === 'aurora') return <Aurora size={size} state={state} className={className} />
  return (
    <span ref={root} className={cn('kl-face orbx', meta.dark && 'face-dark', className)} data-state={state} style={{ '--orb': size + 'px' }} aria-hidden="true">
      {bodies[id]({ size, state })}
      {!meta.noFace && <Face />}
    </span>
  )
}

/* ---------- app-wide selection ---------- */
const KEY = 'blipmade-orb'
const read = () => { try { return localStorage.getItem(KEY) || 'aurora' } catch { return 'aurora' } }
export function useOrbId() {
  const [id, setId] = useState(read)
  useEffect(() => { const f = () => setId(read()); addEventListener('orb-change', f); addEventListener('storage', f); return () => { removeEventListener('orb-change', f); removeEventListener('storage', f) } }, [])
  const set = (v) => { try { localStorage.setItem(KEY, v) } catch {} dispatchEvent(new Event('orb-change')) }
  return [id, set]
}
/* drop-in: every <Orb /> in the app uses the selected style */
export function Orb({ size = 28, state = 'idle', className, id }) {
  const [sel] = useOrbId()
  return <OrbX id={id || sel} size={size} state={state} className={className} />
}
