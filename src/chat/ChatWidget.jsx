/* ChatWidget: the launcher and the conversation are ONE element. Pressing the button grows that element into the chat (size,
   corner radius and position all transition together) while the avatar fades out and the conversation fades in; closing plays it
   backwards. The conversation is laid out at its final size and only revealed, so nothing reflows during the animation.
   On phones it becomes a full-screen sheet that follows the visual viewport (iOS URL bar, keyboard), locks the page behind it,
   and honours safe areas. The panel code is a separate chunk, fetched when the browser is idle or on first hover. */
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Who } from './Who.jsx'
import { AGENTS, chat, useChat } from './store.js'
import { useIsPhone, useVisualViewport } from './useViewport.js'
import { cn } from '../lib/utils'
import './chat.css'

const loadPanel = () => import('./Panel.jsx')
const Panel = lazy(loadPanel)
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const TEASER = 'blipmade-chat-teaser'

export function ChatWidget({ inApp = false }) {
  const { open, unread, who, typing } = useChat()
  const phone = useIsPhone()
  const vp = useVisualViewport(true)
  const [everOpen, setEverOpen] = useState(open)
  const [hover, setHover] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const btn = useRef(null)
  const wasOpen = useRef(open)

  /* fetch the panel when the browser is idle, so the first press has nothing to wait for */
  useEffect(() => {
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1800))
    const cancel = window.cancelIdleCallback || clearTimeout
    const h = idle(() => loadPanel(), { timeout: 4000 })
    return () => cancel(h)
  }, [])
  useEffect(() => { if (open) setEverOpen(true) }, [open])

  /* a one-time greeting a few seconds after the page loads, never again in this session */
  useEffect(() => {
    let seen = false
    try { seen = !!sessionStorage.getItem(TEASER) } catch {}
    if (seen || open) return
    const a = setTimeout(() => { setTeaser(true); try { sessionStorage.setItem(TEASER, '1') } catch {} }, 5200)
    const b = setTimeout(() => setTeaser(false), 5200 + 9000)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [])
  useEffect(() => { if (open) setTeaser(false) }, [open])

  /* phone sheet: lock the page behind it; give focus back to the launcher when it closes */
  useEffect(() => {
    const root = document.documentElement
    const lock = open && phone
    root.classList.toggle('chat-lock', lock)
    return () => root.classList.remove('chat-lock')
  }, [open, phone])
  useEffect(() => {
    if (wasOpen.current && !open) { const t = setTimeout(() => btn.current?.focus({ preventScroll: true }), 40); wasOpen.current = open; return () => clearTimeout(t) }
    wasOpen.current = open
  }, [open])
  useEffect(() => {
    if (!open) return
    const k = (e) => { if (e.key === 'Escape') chat.close() }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [open])

  const minimise = useCallback(() => chat.close(), [])

  /* geometry: always right/bottom anchored (robust against the collapsing iOS toolbar); open phone = the visible viewport */
  const layoutH = typeof document !== 'undefined' ? document.documentElement.clientHeight : vp.h
  const PW = phone ? vp.w : 400
  const PH = phone ? vp.h : Math.min(690, Math.max(360, vp.h - 40))
  const pill = hover && !open && !phone
  const closedBottom = phone ? `calc(${inApp ? 76 : 16}px + env(safe-area-inset-bottom))` : '20px'
  const shell = open
    ? { right: phone ? 0 : 20, bottom: phone ? Math.max(0, layoutH - vp.top - vp.h) : 20, width: PW, height: PH, borderRadius: phone ? 0 : 22 }
    : { right: phone ? 16 : 20, bottom: closedBottom, width: pill ? 212 : 56, height: 56, borderRadius: 28 }

  return (
    <>
      {/* teaser */}
      <div aria-hidden={!teaser} className={cn('chat-teaser fixed z-[61] max-w-[250px] origin-bottom-right rounded-2xl rounded-br-md border border-line-2 bg-[#17171b] p-3.5 pr-9 text-[13.5px] leading-snug shadow-2xl shadow-black/50 transition-[opacity,transform] duration-300 ease-[var(--ease-out)]', teaser && !open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-2 scale-95 opacity-0')} style={{ right: phone ? 16 : 20, bottom: phone ? `calc(${inApp ? 76 : 16}px + env(safe-area-inset-bottom) + 66px)` : 88 }}>
        <b className="font-semibold">Hi Stefan.</b> <span className="text-mute">Stuck on something? I am Pip, and I can bring in a person.</span>
        <button aria-label="Dismiss" tabIndex={teaser ? 0 : -1} onClick={() => setTeaser(false)} className="absolute right-2 top-2 grid size-6 place-items-center rounded-md text-dim outline-none transition-colors hover:text-fg focus-visible:text-fg"><X className="size-3.5" /></button>
      </div>

      <div role="dialog" aria-label="Chat with Blipmade" aria-modal={open && phone ? true : undefined} data-open={open || undefined}
        className={cn(phone && inApp && !open && 'pointer-events-none opacity-0', 'chat-shell fixed z-[60] border bg-[#121214] shadow-[0_8px_30px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.05)] data-[open]:shadow-[0_30px_90px_rgba(0,0,0,.7)]', pill ? 'border-white/25' : 'border-line-2')}
        style={shell}>
        {/* unread badge sits outside the clip */}
        <span aria-hidden className={cn('absolute -right-1 -top-1 z-10 grid h-5 min-w-5 place-items-center rounded-full border-2 border-bg bg-[var(--brand)] px-1 font-mono text-[10px] font-semibold leading-none text-white transition-[opacity,transform] duration-200 ease-[var(--ease-out)]', unread && !open ? 'scale-100 opacity-100' : 'scale-50 opacity-0')}>{unread}</span>
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
          {/* the conversation: final size, anchored bottom right, revealed by the growing shell */}
          <div className="chat-panel absolute bottom-0 right-0" style={{ width: PW, height: PH, opacity: open ? 1 : 0, transitionDelay: open && !reduced() ? '160ms' : '0ms' }} inert={!open}>
            {everOpen && <Suspense fallback={<div className="grid h-full place-items-center text-dim"><Who who={who} size={44} state="thinking" /></div>}><Panel open={open} onMinimize={minimise} autoFocus /></Suspense>}
          </div>
          {/* the launcher */}
          <button ref={btn} onClick={() => chat.open()} onPointerEnter={(e) => { if (e.pointerType === 'mouse') { setHover(true); loadPanel() } }} onPointerLeave={() => setHover(false)} onFocus={() => loadPanel()}
            aria-label={unread ? `Open chat, ${unread} unread` : 'Open chat'} aria-expanded={open} tabIndex={open ? -1 : 0}
            className={cn('chat-launcher absolute inset-y-0 right-0 flex w-full items-center justify-end gap-3 pl-5 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/40', open ? 'pointer-events-none opacity-0' : 'opacity-100 active:scale-[.96]')}>
            {/* two lines: who you will talk to, and what that costs you in waiting. Right-aligned so it grows out of the avatar. */}
            <span aria-hidden className={cn('flex min-w-0 flex-col items-end whitespace-nowrap text-right transition-[opacity,transform] duration-300 ease-[var(--ease-expo)]', pill ? 'translate-x-0 opacity-100 delay-75' : 'translate-x-3 opacity-0')}>
              <span className="text-[13.5px] font-semibold leading-tight tracking-tight">{who === 'operator' ? 'Reply to ' : 'Ask '}{AGENTS[who].name}</span>
              <span className="mt-1 flex items-center gap-1.5 font-mono text-[9.5px] uppercase leading-none tracking-[.08em] text-dim"><i className="size-1 rounded-full bg-ok" />{AGENTS[who].line}</span>
            </span>
            <span className="chat-bob grid size-10 shrink-0 place-items-center"><Who who={who} size={40} state={typing ? 'thinking' : 'idle'} live={who === 'operator'} /></span>
          </button>
        </div>
      </div>
    </>
  )
}
