import { useEffect } from 'react'

/* One listener for every `.torch` element on the page: it only writes two CSS variables (--mx / --my) on the element
   under the pointer, coalesced to one write per frame. The dots themselves are CSS (see `.torch` in index.css). */
export function useTorch() {
  useEffect(() => {
    let raf = 0, last = null
    const apply = () => {
      raf = 0
      if (!last) return
      const card = last.target.closest?.('.torch')
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', last.x - r.left + 'px')
      card.style.setProperty('--my', last.y - r.top + 'px')
    }
    const move = (e) => {
      if (e.pointerType === 'touch') return
      last = { target: e.target, x: e.clientX, y: e.clientY }
      if (!raf) raf = requestAnimationFrame(apply)
    }
    document.addEventListener('pointermove', move, { passive: true })
    return () => { document.removeEventListener('pointermove', move); cancelAnimationFrame(raf) }
  }, [])
}
