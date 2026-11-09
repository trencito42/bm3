import { useEffect, useState } from 'react'

/* The visible viewport, not the layout viewport. On iOS Safari the URL bar collapses while the page scrolls and the keyboard
   covers the bottom of the layout viewport without resizing it: a fixed element sized with 100vh or bottom:0 then leaves an empty
   strip or hides behind the keyboard. visualViewport reports what is really visible, so the chat sheet follows it. */
export function useVisualViewport(enabled = true) {
  const read = () => {
    const v = typeof window !== 'undefined' ? window.visualViewport : null
    return v ? { h: Math.round(v.height), top: Math.round(v.offsetTop), w: Math.round(v.width) } : { h: window.innerHeight, top: 0, w: window.innerWidth }
  }
  const [vp, setVp] = useState(read)
  useEffect(() => {
    if (!enabled) return
    const v = window.visualViewport
    let raf = 0
    const upd = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setVp((o) => { const n = read(); return o.h === n.h && o.top === n.top && o.w === n.w ? o : n })) }
    upd()
    v?.addEventListener('resize', upd); v?.addEventListener('scroll', upd)
    addEventListener('resize', upd); addEventListener('orientationchange', upd)
    return () => { cancelAnimationFrame(raf); v?.removeEventListener('resize', upd); v?.removeEventListener('scroll', upd); removeEventListener('resize', upd); removeEventListener('orientationchange', upd) }
  }, [enabled])
  return vp
}

/* below this width the chat is a full-screen sheet */
export function useIsPhone() {
  const q = '(max-width: 639px)'
  const [m, setM] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches)
  useEffect(() => { const mq = matchMedia(q), f = () => setM(mq.matches); f(); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f) }, [])
  return m
}
