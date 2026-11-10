/* Cookie consent for the public site. Three rules it is built around:
   1. Saying no is exactly as easy as saying yes: the two buttons are the same size and the same style.
   2. Nothing optional is on until the visitor turns it on.
   3. The choice can be reopened at any time (footer link, cookie policy), and it does not block the page while it waits.
   The categories here are examples: the shipped list must match what the site really sets. */
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button, Switch } from '../components/ui.jsx'
import { cn } from '../lib/utils'

const KEY = 'blip-consent'
const EVENT = 'blip:cookie-settings'
export const openCookieSettings = () => dispatchEvent(new Event(EVENT))
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null } }
const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* private window: the choice lasts for this visit only */ } }

const OPTIONAL = [['prefs', 'Preferences', 'Remembers your language and currency.'], ['analytics', 'Analytics', 'Counts visits so we know which pages help.']]

export function CookieConsent() {
  const [show, setShow] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [detail, setDetail] = useState(false)
  const [pick, setPick] = useState({ prefs: false, analytics: false })
  const box = useRef(null)
  const timer = useRef(0)
  useEffect(() => {
    const saved = read()
    if (!saved) timer.current = setTimeout(() => setShow(true), 900)   // let the page land first
    const reopen = () => { const s = read(); setPick({ prefs: !!s?.prefs, analytics: !!s?.analytics }); setDetail(true); setLeaving(false); setShow(true); requestAnimationFrame(() => box.current?.focus()) }
    addEventListener(EVENT, reopen)
    return () => { removeEventListener(EVENT, reopen); clearTimeout(timer.current) }
  }, [])
  const save = (v) => {
    write({ v: 1, ...v, at: new Date().toISOString() })
    setLeaving(true)
    timer.current = setTimeout(() => { setShow(false); setLeaving(false); setDetail(false) }, 180)
  }
  if (!show) return null
  return (
    <div ref={box} tabIndex={-1} role="region" aria-label="Cookie choice"
      className={cn('fixed inset-x-3 bottom-[84px] z-50 rounded-2xl border border-line-2 bg-[#121214] p-5 shadow-[0_18px_60px_rgba(0,0,0,.6)] outline-none sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[380px]', leaving ? 'cookie-out' : 'cookie-in')}>
      <h2 className="text-[15px] font-semibold tracking-tight">Cookies</h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-mute">We need a few to keep you signed in and remember your basket. Anything else is off unless you turn it on. <NavLink to="/site/legal/cookies" className="text-fg underline underline-offset-4">Cookie policy</NavLink></p>
      <div className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out)]', detail ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')} inert={!detail}>
        <div className="overflow-hidden">
          <ul className="mt-4 divide-y divide-line border-y border-line">
            <li className="flex items-center justify-between gap-4 py-3"><div><div className="text-[13.5px] font-medium">Necessary</div><div className="text-[12.5px] text-dim">Sign-in, basket, this choice.</div></div><span className="font-mono text-[10.5px] uppercase tracking-[.06em] text-dim">Always on</span></li>
            {OPTIONAL.map(([k, t, d]) => (
              <li key={k} className="flex items-center justify-between gap-4 py-3"><label htmlFor={'ck-' + k} className="cursor-pointer"><div className="text-[13.5px] font-medium">{t}</div><div className="text-[12.5px] text-dim">{d}</div></label><Switch id={'ck-' + k} checked={pick[k]} onCheckedChange={(v) => setPick((o) => ({ ...o, [k]: v }))} /></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {detail
          ? <><Button variant="outline" onClick={() => setDetail(false)}>Back</Button><Button variant="outline" onClick={() => save(pick)}>Save my choice</Button></>
          : <><Button variant="outline" onClick={() => save({ prefs: false, analytics: false })}>Only necessary</Button><Button variant="outline" onClick={() => save({ prefs: true, analytics: true })}>Accept all</Button></>}
      </div>
      {!detail && <button onClick={() => setDetail(true)} className="mt-3 block w-full text-center text-[12.5px] text-dim outline-none transition-colors hover:text-fg focus-visible:text-fg">Let me choose</button>}
    </div>
  )
}
