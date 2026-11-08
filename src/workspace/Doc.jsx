import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/utils'

/* Documentation page: sticky left index + scrolling sections */
export function Doc({ title, lead, sections }) {
  const [active, setActive] = useState(sections[0].id)
  const root = useRef(null)
  useEffect(() => {
    const el = root.current
    const onScroll = () => {
      let cur = sections[0].id
      for (const s of sections) { const n = document.getElementById('sec-' + s.id); if (n && n.getBoundingClientRect().top - el.getBoundingClientRect().top < 120) cur = s.id }
      setActive(cur)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [sections])
  const go = (id) => document.getElementById('sec-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return (
    <div ref={root} className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-7xl gap-10 px-4 py-6 sm:px-6 md:px-10 md:py-8">
        <aside className="sticky top-0 hidden h-fit w-48 shrink-0 pt-1 lg:block">
          <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{title}</div>
          <nav className="flex flex-col gap-0.5">
            {sections.map((s) => <button key={s.id} onClick={() => go(s.id)} className={cn('rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors', active === s.id ? 'bg-white/[0.07] text-fg' : 'text-mute hover:text-fg')}>{s.title}</button>)}
          </nav>
        </aside>
        <div className="min-w-0 flex-1 space-y-14 pb-24">
          <header><h1 className="text-[30px] font-semibold tracking-tight">{title}</h1>{lead && <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-mute">{lead}</p>}</header>
          {sections.map((s) => (
            <section key={s.id} id={'sec-' + s.id} className="scroll-mt-6">
              <div className="mb-5 flex items-baseline gap-3 border-b border-line pb-3"><h2 className="text-lg font-semibold tracking-tight">{s.title}</h2>{s.note && <span className="text-[12.5px] text-dim">{s.note}</span>}</div>
              <div className="space-y-8">{s.node}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

/* labelled demo box */
export const Demo = ({ label, children, className, pad = true, sim }) => (
  <div className="min-w-0 space-y-2">
    {label && <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{label}{sim && <span className="rounded border border-line-2 px-1 text-[9.5px]">simulated</span>}</div>}
    <div className={cn('min-w-0 max-w-full overflow-x-auto rounded-xl border border-line bg-card', pad && 'p-4 sm:p-5', className)}>{children}</div>
  </div>
)
export const Row = ({ children, className }) => <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>
