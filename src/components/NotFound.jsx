/* The 404: the zero is the assistant. It looks at your cursor, shrugs when you click it, and the page offers three places
   that do exist. Used by the public site, the client area, the admin and the design-system routes. */
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from './ui.jsx'
import { DotText, Orb } from '../builder/FxBits.jsx'
import { useTorch } from '../lib/useTorch.js'
import { cn } from '../lib/utils'

export function NotFoundScene({ home = '/', homeLabel = 'Back to home', links = [] }) {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [state, setState] = useState('waiting')
  const timer = useRef(0)
  useTorch()
  useEffect(() => () => clearTimeout(timer.current), [])
  /* hovering makes it think, clicking makes it laugh it off, then it goes back to waiting */
  const react = (s, ms) => { clearTimeout(timer.current); setState(s); timer.current = setTimeout(() => setState('waiting'), ms) }
  return (
    <div className="torch relative grid min-h-[calc(100dvh-8rem)] place-items-center overflow-hidden px-5 py-14 text-center">
      <div className="relative flex w-full max-w-xl flex-col items-center">
        <div className="anim-rise font-mono text-[10.5px] uppercase tracking-[.1em] text-dim" style={{ '--i': 0 }}>Error 404 · Not found</div>

        <div className="anim-rise mt-6 flex items-center justify-center gap-3 sm:gap-5" style={{ '--i': 1 }} role="img" aria-label="404">
          <span className="hidden sm:block"><DotText text="4" height={92} assemble /></span>
          <span className="sm:hidden"><DotText text="4" height={60} assemble /></span>
          <button type="button" aria-label="The assistant looks confused. Click to cheer it up." onPointerEnter={() => react('thinking', 1800)} onClick={() => react('happy', 1600)} className="rounded-full outline-none transition-transform duration-200 ease-[var(--ease-out)] hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-white/30 active:scale-95">
            <span className="hidden sm:block"><Orb size={92} state={state} /></span>
            <span className="sm:hidden"><Orb size={60} state={state} /></span>
          </button>
          <span className="hidden sm:block"><DotText text="4" height={92} assemble /></span>
          <span className="sm:hidden"><DotText text="4" height={60} assemble /></span>
        </div>

        <h1 className="anim-rise mt-8 text-[clamp(24px,4vw,34px)] font-semibold leading-tight tracking-tight" style={{ '--i': 2 }}>This page wandered off.</h1>
        <p className="anim-rise mt-3 max-w-md text-[15px] leading-relaxed text-mute" style={{ '--i': 3 }}>We looked everywhere and it is not here. The link may be old, or the address has a typo.</p>
        <div className="anim-rise mt-4 max-w-full truncate rounded-md border border-line-2 bg-black/30 px-3 py-1.5 font-mono text-[12px] text-dim" style={{ '--i': 4 }} title={pathname}>{pathname}</div>

        <div className="anim-rise mt-8 flex flex-wrap items-center justify-center gap-2" style={{ '--i': 5 }}>
          <Button size="lg" onClick={() => nav(home)}>{homeLabel}</Button>
          <Button size="lg" variant="outline" onClick={() => (history.length > 1 ? nav(-1) : nav(home))}><ArrowLeft />Go back</Button>
        </div>

        {links.length > 0 && (
          <div className="anim-rise mt-12 w-full" style={{ '--i': 6 }}>
            <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Maybe you were looking for</div>
            <ul className="grid gap-2 sm:grid-cols-3">
              {links.map(([label, to, hint]) => (
                <li key={to}>
                  <button onClick={() => nav(to)} className="group flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3 text-left outline-none transition-[border-color,background-color,transform] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-line-2 hover:bg-[#161619] focus-visible:border-white/40 active:translate-y-0">
                    <span className="min-w-0"><span className="block truncate text-[13.5px] font-medium">{label}</span>{hint && <span className="block truncate text-[12px] text-dim">{hint}</span>}</span>
                    <ArrowRight className="size-4 shrink-0 -translate-x-1 text-dim opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:text-fg group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export const SITE_LINKS = [['Products', '/site/products', 'Plans and pricing'], ['App catalog', '/site/apps', 'Games, databases, tools'], ['System status', '/site/status', 'Live regional health']]
export const APP_LINKS = [['Overview', '/', 'Your infrastructure'], ['All services', '/services', 'Servers and apps'], ['Support', '/support', 'Talk to us']]
export const ADMIN_LINKS = [['Dashboard', '/admin', 'Operations at a glance'], ['Customers', '/admin/customers', 'Accounts and billing'], ['Orders', '/admin/orders', 'Recent purchases']]
