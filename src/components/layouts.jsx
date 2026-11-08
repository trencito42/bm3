/* LAYOUT MODELS: ResizablePanel · ScrollContainer · DetailLayout (all MOCK-data friendly) */
import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { Breadcrumbs } from './ui2.jsx'
import { cn } from '../lib/utils'

/* ---------------- ResizablePanel ----------------
   Drag the handle (pointer), or focus it and use arrows / Home / End. Double-click or Enter resets.
   Below `stackBelow` px of container width the two panes stack and the handle is hidden. */
export function ResizablePanel({ direction = 'horizontal', initial = 40, min = 20, max = 75, first, second, className, stackBelow = 560, minHeight = 220 }) {
  const [size, setSize] = useState(initial)
  const [active, setActive] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const box = useRef(null)
  const dragging = useRef(false)
  const horizontal = direction === 'horizontal'
  const clamp = (v) => Math.min(max, Math.max(min, v))
  useEffect(() => {
    const el = box.current
    const check = () => setNarrow(horizontal && el.clientWidth < stackBelow)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [horizontal, stackBelow])
  const onMove = (e) => {
    if (!dragging.current) return
    const r = box.current.getBoundingClientRect()
    setSize(clamp(((horizontal ? e.clientX - r.left : e.clientY - r.top) / (horizontal ? r.width : r.height)) * 100))
  }
  const onKey = (e) => {
    const step = e.shiftKey ? 10 : 2
    const dec = horizontal ? 'ArrowLeft' : 'ArrowUp'
    const inc = horizontal ? 'ArrowRight' : 'ArrowDown'
    if (e.key === dec) { e.preventDefault(); setSize((s) => clamp(s - step)) }
    else if (e.key === inc) { e.preventDefault(); setSize((s) => clamp(s + step)) }
    else if (e.key === 'Home') { e.preventDefault(); setSize(min) }
    else if (e.key === 'End') { e.preventDefault(); setSize(max) }
    else if (e.key === 'Enter') setSize(initial)
  }
  if (narrow) return <div ref={box} className={cn('flex flex-col gap-3', className)}><div className="min-w-0">{first}</div><div className="min-w-0">{second}</div></div>
  return (
    <div ref={box} className={cn('flex min-h-0 min-w-0 overflow-hidden rounded-xl border border-line-2', horizontal ? 'flex-row' : 'flex-col', className)} style={horizontal ? undefined : { minHeight }}>
      <div className="min-h-0 min-w-0 overflow-auto" style={{ flex: `0 0 ${size}%` }}>{first}</div>
      <div
        role="separator" aria-orientation={horizontal ? 'vertical' : 'horizontal'} aria-valuenow={Math.round(size)} aria-valuemin={min} aria-valuemax={max} aria-label="Resize panels" tabIndex={0}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); dragging.current = true; setActive(true) }}
        onPointerMove={onMove}
        onPointerUp={() => { dragging.current = false; setActive(false) }}
        onPointerCancel={() => { dragging.current = false; setActive(false) }}
        onDoubleClick={() => setSize(initial)}
        onKeyDown={onKey}
        className={cn('group relative z-10 flex shrink-0 touch-none select-none items-center justify-center outline-none transition-colors', horizontal ? 'w-3 cursor-col-resize flex-col' : 'h-3 cursor-row-resize', active ? 'bg-white/[0.08]' : 'bg-white/[0.02] hover:bg-white/[0.06] focus-visible:bg-white/[0.08]')}
      >
        <span className={cn('absolute bg-line-2 transition-colors group-hover:bg-white/40 group-focus-visible:bg-fg', horizontal ? 'inset-y-0 left-1/2 w-px' : 'inset-x-0 top-1/2 h-px', active && 'bg-fg')} />
        <span className={cn('relative flex gap-[3px] rounded-full bg-card', horizontal ? 'flex-col px-0.5 py-1' : 'flex-row px-1 py-0.5')}>{[0, 1, 2].map((i) => <i key={i} className={cn('size-[3px] rounded-full', active ? 'bg-fg' : 'bg-white/40 group-hover:bg-white/70')} />)}</span>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">{second}</div>
    </div>
  )
}

/* ---------------- ScrollContainer ----------------
   Bounded scroll region: hairlines show when content continues above/below, a 1px progress line,
   a "scroll for more" hint, and a back-to-top button once you are far down. */
export function ScrollContainer({ height = 280, children, className, header, progress = true }) {
  const ref = useRef(null)
  const [s, setS] = useState({ top: true, bottom: false, pct: 0, far: false, scrollable: false })
  const update = () => {
    const el = ref.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    setS({ top: el.scrollTop <= 1, bottom: max > 1 && el.scrollTop >= max - 1, pct: max > 0 ? (el.scrollTop / max) * 100 : 0, far: el.scrollTop > 160, scrollable: max > 1 })
  }
  useEffect(() => { update(); const ro = new ResizeObserver(update); ro.observe(ref.current); return () => ro.disconnect() }, [])
  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-line-2 bg-card', className)}>
      {header && <div className={cn('border-b px-4 py-2.5 text-[12.5px] transition-colors', s.top ? 'border-line' : 'border-white/25')}>{header}</div>}
      {progress && <div className="absolute inset-x-0 top-0 z-10 h-px"><i className="block h-full bg-fg transition-[width] duration-100" style={{ width: s.pct + '%' }} /></div>}
      <div
        ref={ref} onScroll={update} tabIndex={0} aria-label="Scrollable region" style={{ height }}
        className={cn('overflow-y-auto overscroll-contain p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20', !header && !s.top && 'shadow-[inset_0_1px_0_rgba(255,255,255,.18)]', !s.bottom && s.scrollable && 'shadow-[inset_0_-1px_0_rgba(255,255,255,.18)]')}
      >{children}</div>
      {s.scrollable && !s.bottom && <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center"><span className="rounded-full border border-line-2 bg-card px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[.08em] text-dim">Scroll for more</span></div>}
      {s.far && <button onClick={() => ref.current.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" className="anim-menu absolute bottom-3 right-3 grid size-9 place-items-center rounded-full border border-line-2 bg-card text-mute shadow-lg shadow-black/50 transition-colors hover:text-fg"><ArrowUp className="size-4" /></button>}
    </div>
  )
}

/* ---------------- DetailLayout ----------------
   Resource page skeleton: breadcrumbs, title + status + actions, tab bar, main column, sticky inspector
   aside (drops under the main column below lg), optional sticky action footer. */
export function DetailLayout({ crumbs, title, subtitle, status, actions, tabs, aside, footer, className }) {
  const [tab, setTab] = useState(tabs[0].id)
  const cur = tabs.find((t) => t.id === tab)
  return (
    <div className={cn('relative flex min-w-0 flex-col', className)}>
      <div className="space-y-3 pb-4">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2.5 text-xl font-semibold tracking-tight"><span className="truncate">{title}</span>{status}</h1>
            {subtitle && <p className="mt-1 font-mono text-xs text-dim">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
      <div role="tablist" className="flex max-w-full gap-1 overflow-x-auto whitespace-nowrap border-b border-line [scrollbar-width:none]">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn('relative h-10 shrink-0 px-3 text-[13px] transition-colors after:absolute after:inset-x-3 after:-bottom-px after:h-px after:bg-fg after:opacity-0', tab === t.id ? 'text-fg after:opacity-100' : 'text-dim hover:text-fg')}>
            {t.label}{t.badge != null && <span className="ml-1.5 rounded-full border border-line-2 px-1.5 font-mono text-[10px] text-mute">{t.badge}</span>}
          </button>
        ))}
      </div>
      <div className={cn('grid items-start gap-6 pt-6', aside && 'lg:grid-cols-[minmax(0,1fr)_300px]')}>
        <div key={tab} role="tabpanel" className="anim-page min-w-0 space-y-4">{cur.content}</div>
        {aside && <aside className="min-w-0 space-y-4 lg:sticky lg:top-4">{aside}</aside>}
      </div>
      {footer && <div className="sticky bottom-0 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-2 bg-[#101012] px-4 py-3 shadow-2xl shadow-black/60">{footer}</div>}
    </div>
  )
}
