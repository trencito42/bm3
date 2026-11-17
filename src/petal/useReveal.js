/* Scoped to the Petal homepage: marks an element [data-seen] once it has scrolled into view, so petal.css's
   .p-reveal can animate it in. Separate from bm3's own reveal.jsx on purpose — that one is wired to bm3's tokens
   and global classes; this homepage must not depend on them. */
import { useEffect, useRef, useState } from 'react'

export function useReveal(margin = '0px 0px -10% 0px') {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true) }, { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [seen, margin])
  return [ref, seen]
}
