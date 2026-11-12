import { useEffect, useRef } from 'react'
import { useLive } from './reveal.jsx'

/* A sampled world, not an enlarged pixel icon. Each point has a stable address:
   it travels from the previous world into a surface of the next one. */
function world(id) {
  const points = []
  const add = (x, y, z, light = 1) => points.push([x, y, z, light])
  const line = (a, b, step = .18, light = 1) => {
    const n = Math.ceil(Math.hypot(...a.map((v, i) => v - b[i])) / step)
    for (let i = 0; i <= n; i++) add(...a.map((v, k) => v + (b[k] - v) * i / Math.max(1, n)), light)
  }
  const box = (x, y, z, w, h, d, light = 1) => {
    const p = .3
    for (let a = 0; a <= w; a += p) for (let b = 0; b <= d; b += p) add(x + a, y + h, z + b, light)
    for (let a = 0; a <= w; a += p) for (let b = 0; b <= h; b += p) { add(x + a, y + b, z, light * .6); add(x + a, y + b, z + d, light * .8) }
    for (let a = 0; a <= d; a += p) for (let b = 0; b <= h; b += p) { add(x, y + b, z + a, light * .55); add(x + w, y + b, z + a, light * .75) }
  }
  if (id === 'minecraft') {
    const heights = new Map()
    for (let x = -9; x <= 9; x++) for (let z = -7; z <= 7; z++) {
      const r = x * x / 90 + z * z / 54
      if (r > 1 + Math.sin(x * 2 + z) * .08) continue
      heights.set(`${x},${z}`, Math.floor(1.6 + Math.sin(x * .46) * .8 + Math.cos(z * .6) * .65))
    }
    heights.forEach((h, key) => {
      const [x, z] = key.split(',').map(Number)
      for (let a = 0; a < 1; a += .28) for (let b = 0; b < 1; b += .28) add(x + a, h, z + b, .75)
      for (const [dx, dz] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const bottom = heights.get(`${x + dx},${z + dz}`) ?? -2.8 + Math.abs(x) * .12
        if (bottom >= h) continue
        for (let a = 0; a < 1; a += .28) for (let b = bottom; b <= h; b += .28) add(x + (dx === 1 ? 1 : dx === -1 ? 0 : a), b, z + (dz === 1 ? 1 : dz === -1 ? 0 : a), .3 + (b / 12))
      }
    })
    // A little home and three block-built trees, with a stepping-stone path.
    box(-2, 2, -1, 4, 2.8, 3, .95)
    for (let i = 0; i < 5; i++) box(-2.5 + i * .5, 4.8 + i * .38, -1.5, 5 - i, .35, 4, .9)
    box(.6, 5.2, -.2, .6, 2, .6, .55)
    for (const [x, z, h] of [[-5, -2, 4.5], [4, -3, 5], [5, 3, 3.7]]) {
      const base = heights.get(`${x},${z}`) || 1
      box(x, base, z, .65, h, .65, .6)
      box(x - 1.3, base + h - 1.7, z - 1.3, 3.2, 1.8, 3.2, .72)
      box(x - .8, base + h, z - .8, 2.2, 1, 2.2, .9)
    }
    for (let i = 0; i < 5; i++) box(-.4, 1.8 - i * .22, 3 + i * .65, .8, .15, .4, .95)
  } else if (id === 'cs2') {
    // A tactical courtyard: low walls, stacked crates, an arched gate and stairs.
    box(-9, -1.2, -6, 18, .4, 12, .22)
    box(-8, -.8, -5, 4, 5, 3, .65); box(4, -.8, -5, 4, 6.5, 4, .7)
    box(-3.5, -.8, -5, 1.5, 4.8, 1, .8); box(2, -.8, -5, 1.5, 4.8, 1, .8)
    box(-3.5, 4, -5, 7, 1.2, 1, .85)
    for (let z = -5; z <= -4; z += .3) for (let r = 2; r < 2.5; r += .22) for (let a = 0; a < Math.PI; a += .08) add(Math.cos(a) * r, 2.2 + Math.sin(a) * r, z, .95)
    box(-8, -.8, 1, 2.5, 2, 2.5, .9); box(-6, 1.2, 1.3, 1.8, 1.8, 1.8, .8)
    box(4, -.8, 2, 2, 1.7, 2, .9)
    for (let i = 0; i < 7; i++) box(5, -.8, -i * .65, 3, .3 + i * .3, .65, .7)
    for (let x = -8; x <= 8; x += 1) line([x, -.7, -6], [x, -.7, 6], .4, .25)
  } else {
    // Rust's industrial silhouette: a lattice radio tower above a rocky island.
    for (let x = -9; x < 9; x += .3) for (let z = -6; z < 6; z += .3) {
      const r = x * x / 90 + z * z / 43
      if (r < 1) add(x, -1.7 + Math.sin(x * .65) * Math.cos(z * .6) * 1.5 - r, z, .3)
    }
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
    for (let tier = 0; tier < 6; tier++) {
      const y = tier * 1.7 - 1, low = 2.1 - tier * .27, high = low - .27
      corners.forEach(([x, z], i) => {
        const [nx, nz] = corners[(i + 1) % 4]
        line([x * low, y, z * low], [x * high, y + 1.7, z * high], .12, .9)
        line([x * low, y, z * low], [nx * low, y, nz * low], .12, .7)
        line([x * low, y, z * low], [nx * high, y + 1.7, nz * high], .15, .6)
      })
    }
    line([0, 9, 0], [0, 12, 0], .1)
    box(3, -1, -3, 4, 2.5, 3, .55)
    for (let a = 0; a < Math.PI * 2; a += .045) for (let r = 0; r < 2.2; r += .25) add(-4 + Math.cos(a) * r, 2.5 + Math.sin(a) * r, 1 + r * r * .18, .85)
    line([-4, -1, 1], [-4, 2.5, 1], .15, .8)
  }
  // Stable shuffle breaks up rows during the assembly sweep.
  return points.sort((a, b) => Math.sin(a[0] * 12.9 + a[1] * 78.2 + a[2] * 33.1) - Math.sin(b[0] * 12.9 + b[1] * 78.2 + b[2] * 33.1)).slice(0, 10500)
}
const SCENES = Object.fromEntries(['minecraft', 'cs2', 'rust'].map(id => [id, world(id)]))
const noise = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.54; return x - Math.floor(x) }

export function GameArtwork({ id, paused }) {
  const ref = useRef(null), particles = useRef([]), target = useRef(id)
  const live = useLive(ref)
  useEffect(() => { target.current = id }, [id])
  useEffect(() => {
    const canvas = ref.current, ctx = canvas.getContext('2d')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const started = performance.now()
    let raf = 0, width = 1, height = 1, last = 0, elapsed = 0, changed = 0, current = '', pointer = [0, 0]
    const draw = now => {
      if (now - last < 32) { raf = requestAnimationFrame(draw); return }
      const dt = Math.min((now - last) / 1000, 2); last = now
      if (!paused) elapsed = (now - started) / 1000
      if (current !== target.current) { current = target.current; changed = elapsed }
      const points = SCENES[current] || SCENES.minecraft
      const mobile = width < 700
      const scale = Math.min(width * (mobile ? .049 : .037), height * .068)
      const yaw = -.62 + (reduced.matches || paused ? 0 : Math.sin(elapsed * .12) * .09) + pointer[0] * .035
      const cos = Math.cos(yaw), sin = Math.sin(yaw)
      const cx = width * (mobile ? .54 : .66), cy = height * (mobile ? .39 : .54)
      ctx.clearRect(0, 0, width, height)
      for (let i = 0; i < points.length; i++) {
        const t = points[i]
        let p = particles.current[i]
        if (!p) p = particles.current[i] = [(noise(i) - .5) * 58, (noise(i + 13) - .5) * 30, (noise(i + 37) - .5) * 40]
        const age = elapsed - changed
        const speed = reduced.matches || paused ? 1 : age < noise(i + 21) * .65 ? .002 : 1 - Math.exp(-dt * (3 + noise(i + 19) * 2))
        for (let k = 0; k < 3; k++) p[k] += (t[k] - p[k]) * speed
        const depth = p[0] * sin + p[2] * cos
        const x = cx + (p[0] * cos - p[2] * sin) * scale
        const y = cy + (depth * .43 - p[1] * .85) * scale + pointer[1] * 3
        const edge = Math.min(1, Math.max(0, x / width * 2.7 - .42))
        const alpha = Math.max(.06, Math.min(.85, t[3] * (.48 + (depth + 12) / 55))) * edge
        ctx.fillStyle = `rgba(242,242,243,${alpha})`
        ctx.beginPath(); ctx.arc(x, y, (mobile ? .65 : .85) + noise(i + 2) * .45, 0, Math.PI * 2); ctx.fill()
      }
      // Sparse free particles make the entire surface part of the composition.
      for (let i = 0; i < 90; i++) {
        const x = noise(i + 900) * width, y = (noise(i + 400) * height + elapsed * (2 + noise(i) * 3)) % height
        ctx.fillStyle = `rgba(242,242,243,${.06 + noise(i + 1) * .18})`
        ctx.fillRect(x, y, 1, 1)
      }
      if (live && !reduced.matches && !paused) raf = requestAnimationFrame(draw)
    }
    const fit = () => {
      cancelAnimationFrame(raf)
      width = canvas.clientWidth; height = canvas.clientHeight
      const dpr = Math.min(devicePixelRatio || 1, 2)
      canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw(performance.now())
    }
    const move = e => { const r = canvas.parentElement.getBoundingClientRect(); pointer = [(e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5] }
    const ro = new ResizeObserver(fit); ro.observe(canvas)
    canvas.parentElement.addEventListener('pointermove', move)
    reduced.addEventListener('change', fit); fit()
    return () => { cancelAnimationFrame(raf); ro.disconnect(); reduced.removeEventListener('change', fit); canvas.parentElement?.removeEventListener('pointermove', move) }
  }, [live, paused, id])
  return <canvas ref={ref} className="game-artwork" aria-hidden="true" />
}
