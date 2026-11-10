import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/utils'

/* seen: flips to true once the element scrolls into view (and stays). live: true only while it is on screen and the tab is
   visible, so the tickers below stop re-rendering when nobody can see them. */
export function useSeen(ref, margin = '0px 0px 12% 0px') {
  const [seen, setSeen] = useState(typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { rootMargin: margin })
    io.observe(el)
    /* a fast scrollbar drag can jump past an element between two frames, so IntersectionObserver never reports it:
       a throttled scroll check also reveals anything that is now at or above the fold */
    let raf = 0
    const check = () => { raf = 0; if (el.getBoundingClientRect().top < innerHeight * 1.08) setSeen(true) }
    /* a timeout, not rAF: animation frames do not run in a background tab, and the content must still appear */
    const onScroll = () => { if (!raf) raf = window.setTimeout(check, 50) }
    addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => { io.disconnect(); clearTimeout(raf); removeEventListener('scroll', onScroll, { capture: true }) }
  }, [seen])
  return seen
}
export function useLive(ref) {
  const [live, setLive] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let vis = true, tab = !document.hidden
    const upd = () => setLive(vis && tab)
    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([e]) => { vis = e.isIntersecting; upd() }) : null
    io?.observe(el)
    const onVis = () => { tab = !document.hidden; upd() }
    document.addEventListener('visibilitychange', onVis)
    return () => { io?.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])
  return live
}
/* scroll reveal: fades/rises once when first seen; `i` staggers siblings */
export const RevealGrid = ({ className, children }) => {
  const ref = useRef(null)
  const seen = useSeen(ref, '0px 0px 12% 0px')
  return <div ref={ref} data-seen={seen || undefined} className={cn('reveal-grid', className)}>{children}</div>
}
export const Reveal = ({ i = 0, className, children, as: T = 'div', ...p }) => {
  const ref = useRef(null)
  const seen = useSeen(ref)
  return <T ref={ref} data-seen={seen || undefined} className={cn(seen ? 'anim-reveal' : 'opacity-0', className)} style={{ '--i': i }} {...p}>{children}</T>
}

export const DotRule = () => {
  const ref = useRef(null)
  const seen = useSeen(ref, '0px 0px -10% 0px')
  return <div className="mx-auto max-w-6xl px-5 md:px-10"><div ref={ref} aria-hidden data-seen={seen || undefined} className="dotrule" /></div>
}

