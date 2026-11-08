/* React wrappers around the vanilla BlipFX engine (dot-matrix type, glyph grid, orb, mini site). */
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import './fx.js'

export const fx = () => window.BlipFX

export function Orb({ size = 28, state = 'idle', className }) {
  const host = useRef(null)
  const orb = useRef(null)
  useEffect(() => {
    const o = fx().orb(size, state)
    orb.current = o
    host.current.replaceChildren(o)
    return () => o.remove()
  }, [size])
  useEffect(() => { orb.current?.setState(state) }, [state])
  return <span ref={host} className={className} style={{ display: 'inline-grid' }} />
}

export function DotText({ text, height = 12, assemble, ghost, animate, quick, delay, className }) {
  const host = useRef(null)
  useEffect(() => {
    const s = fx().dotText({ text, assemble, ghost, animate, quick, delay, title: text })
    /* explicit natural width from the viewBox, capped to the container, height follows the ratio */
    const vb = s.getAttribute('viewBox').split(' ').map(Number)
    s.style.width = (height * vb[2]) / vb[3] + 'px'
    s.style.maxWidth = '100%'
    s.style.height = 'auto'
    host.current.replaceChildren(s)
  }, [text, height, assemble, ghost, animate])
  return <span ref={host} className={className} style={{ display: 'inline-flex', maxWidth: '100%', minWidth: 0 }} />
}

export const DotField = forwardRef(function DotField({ className, pitch = 28, glyphs = false, strength = 1 }, ref) {
  const c = useRef(null)
  const api = useRef(null)
  useEffect(() => {
    api.current = fx().dotField(c.current, { tone: 'dark', pitch, glyphs, strength, host: c.current.parentElement })
    return () => api.current?.destroy()
  }, [pitch, glyphs, strength])
  useImperativeHandle(ref, () => ({ pulse: (x, y) => api.current?.pulse(x, y) }))
  return <canvas ref={c} className={className} aria-hidden="true" />
})

export function DotBar({ value, n = 24 }) {
  const host = useRef(null)
  const bar = useRef(null)
  useEffect(() => {
    bar.current = fx().dotBar(n)
    host.current.replaceChildren(bar.current)
  }, [n])
  useEffect(() => { bar.current?.set(value) }, [value])
  return <span ref={host} className="inline-flex" />
}
