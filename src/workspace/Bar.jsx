import { NavLink, useLocation } from 'react-router-dom'
import { DotText } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'

const SECTIONS = [
  ['01', 'Foundations', '/ds/foundations', (p) => p.startsWith('/ds/foundations')],
  ['02', 'Components', '/ds/components', (p) => p.startsWith('/ds/components')],
  ['03', 'Patterns', '/ds/patterns', (p) => p.startsWith('/ds/patterns')],
  ['04', 'Product', '/ds/product', (p) => p.startsWith('/ds/product')],
  ['05', 'Customer app', '/', (p) => !/^\/(ds|admin|site)/.test(p)],
  ['06', 'Admin', '/admin', (p) => p.startsWith('/admin')],
  ['07', 'Public site', '/site', (p) => p.startsWith('/site')],
  ['08', 'States & mobile', '/ds/states', (p) => p.startsWith('/ds/states')],
]

export default function WorkspaceBar() {
  const { pathname } = useLocation()
  return (
    <div className="flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-b border-line bg-black px-3">
      <NavLink to="/ds/foundations" className="mr-3 flex shrink-0 items-center gap-2"><DotText text="BLIPMADE" height={11} /><span className="font-mono text-[10px] uppercase tracking-[.08em] text-dim">Design system</span></NavLink>
      {SECTIONS.map(([n, l, to, is]) => (
        <NavLink key={n} to={to} className={cn('flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] transition-colors', is(pathname) ? 'bg-white/[0.08] text-fg' : 'text-mute hover:text-fg')}>
          <span className={cn('font-mono text-[10px]', is(pathname) ? 'text-[var(--brand)]' : 'text-dim')}>{n}</span>{l}
        </NavLink>
      ))}
      <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-line-2 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[.08em] text-dim"><i className="size-1.5 rounded-full bg-warn" />Simulated · mock data</span>
    </div>
  )
}
