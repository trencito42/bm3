/* BlipCast: the Blips on a row, and a headline that belongs to the one you pick ("Forge, the AI that builds your site").
   The headline is dot-matrix type: when the selection changes the old words dissolve and the new ones assemble from loose dots.
   The inline avatar is the real character at 1:1 (pixel-snapped); the row above is the cast to choose from. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DotText } from '../builder/FxBits.jsx'
import { CAST, CAST_IDS, OrbX } from './orbs.jsx'
import { cn } from '../lib/utils'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function BlipCast({ defaultRole = 'chat', auto = true, className }) {
  const [role, setRole] = useState(defaultRole)
  const [shown, setShown] = useState(defaultRole)       // what the headline currently displays (lags `role` by the dissolve)
  const [leaving, setLeaving] = useState(false)
  const [state, setState] = useState('idle')
  const [live, setLive] = useState(true)
  const [touched, setTouched] = useState(false)
  const [h, setH] = useState(36)
  const box = useRef(null)
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /* size the dot type to the width it has: the longest line is about 18.6 type-heights wide */
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const f = () => setH(Math.max(12, Math.min(44, Math.floor((el.clientWidth - 8) / 19))))
    f()
    const ro = new ResizeObserver(f)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  /* auto-rotate only while it is on screen, in a visible tab, and until the visitor chooses */
  useEffect(() => {
    const el = box.current
    if (!el) return
    let vis = true, tab = !document.hidden
    const upd = () => setLive(vis && tab)
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; upd() })
    io.observe(el)
    const onVis = () => { tab = !document.hidden; upd() }
    document.addEventListener('visibilitychange', onVis)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  const pick = useCallback((r, byUser = true) => {
    if (byUser) setTouched(true)
    setRole((cur) => {
      if (cur === r) return cur
      timers.current.forEach(clearTimeout); timers.current = []
      setLeaving(true)
      timers.current.push(setTimeout(() => { setShown(r); setLeaving(false); setState('happy') }, reduced() ? 0 : 190))
      timers.current.push(setTimeout(() => setState('idle'), 1500))
      return r
    })
  }, [])
  useEffect(() => {
    if (!auto || touched || !live || reduced()) return
    const t = setInterval(() => pick(CAST_IDS[(CAST_IDS.indexOf(role) + 1) % CAST_IDS.length], false), 5200)
    return () => clearInterval(t)
  }, [auto, touched, live, role, pick])

  const c = CAST[shown]
  const Icon = c.icon
  const av = Math.round(h * 1.6)
  const key = (e) => {
    const i = CAST_IDS.indexOf(role)
    if (e.key === 'ArrowRight') { e.preventDefault(); pick(CAST_IDS[(i + 1) % CAST_IDS.length]) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); pick(CAST_IDS[(i + CAST_IDS.length - 1) % CAST_IDS.length]) }
  }
  return (
    <div ref={box} className={cn('mx-auto flex w-full max-w-3xl flex-col items-center text-center', className)}>
      {/* the cast */}
      <div role="tablist" aria-label="Choose a Blip" onKeyDown={key} className="flex items-end justify-center gap-3 sm:gap-5">
        {CAST_IDS.map((r) => {
          const on = role === r
          return (
            <button key={r} role="tab" aria-selected={on} tabIndex={on ? 0 : -1} onClick={() => pick(r)} onPointerEnter={() => on && setState('happy')} onPointerLeave={() => on && setState('idle')}
              className="group relative flex flex-col items-center gap-2 rounded-2xl p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-white/30">
              <span className={cn('block transition-[transform,opacity,filter] duration-500 ease-[var(--ease-out)]', on ? 'scale-[1.12] opacity-100' : 'scale-[.78] opacity-50 [filter:saturate(.7)] group-hover:scale-[.9] group-hover:opacity-90 group-hover:[filter:none]')}>
                <OrbX id="cast" role={r} size={64} state={on ? state : 'idle'} />
              </span>
              <span className={cn('font-mono text-[10.5px] uppercase tracking-[.08em] transition-colors duration-300', on ? 'text-fg' : 'text-dim group-hover:text-mute')}>{CAST[r].name}</span>
              <i aria-hidden className={cn('absolute -bottom-0.5 h-px w-6 bg-[var(--brand)] transition-[opacity,transform] duration-300', on ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0')} />
            </button>
          )
        })}
      </div>

      {/* the headline: dot-matrix type, dissolves and re-assembles when the Blip changes */}
      <div className={cn('mt-9 flex min-h-[calc(var(--h)*3.6)] w-full flex-col items-center justify-center gap-[calc(var(--h)*.5)] transition-[opacity,filter] duration-200 ease-[var(--ease-out)]', leaving ? 'opacity-0 [filter:blur(3px)]' : 'opacity-100')} style={{ '--h': h + 'px' }} role="heading" aria-level={2} aria-label={`${c.name}, the AI that ${c.line}`}>
        <div key={'a' + shown} className="flex items-center justify-center gap-[calc(var(--h)*.5)]">
          <DotText text={c.name.toUpperCase()} height={h} assemble />
          <span key={shown} className="grid shrink-0 place-items-center [animation:blip-in_480ms_cubic-bezier(.3,1.5,.5,1)_both]" style={{ width: av, height: av }}><OrbX id="cast" role={shown} size={av % 2 ? av + 1 : av} state={state} /></span>
          <DotText text=", THE AI THAT" height={h} assemble delay={120} />
        </div>
        <div key={'b' + shown} className="flex items-center justify-center gap-[calc(var(--h)*.5)]">
          <DotText text={c.line.toUpperCase()} height={h} assemble delay={240} />
          <span className="grid shrink-0 place-items-center rounded-[28%] border border-line-2 bg-white/[0.04] text-fg [animation:blip-in_480ms_var(--ease-out)_.3s_both]" style={{ width: av, height: av }}><Icon style={{ width: av * 0.5, height: av * 0.5 }} strokeWidth={1.8} /></span>
        </div>
      </div>

      <p key={'n' + shown} className={cn('mt-6 min-h-[3.2rem] max-w-md text-[15px] leading-relaxed text-mute transition-opacity duration-200', leaving ? 'opacity-0' : 'opacity-100')} style={{ animation: leaving ? undefined : 'fade-in 360ms var(--ease-out) 200ms both' }}>{c.note}</p>
    </div>
  )
}
