/* Notification center: the bell in the header opens a real list (All / Unread, mark read, dismiss, mark all read, empty
   states). A tiny external store keeps the bell, the popover and the demo in sync. Mock data only. */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Bell, Check, CheckCheck, CircleCheck, CreditCard, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './ui2.jsx'
import { Orb } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'

const SEED = [
  { id: 1, tone: 'bad', title: 'Invoice INV-1048 is overdue', body: '$38.00 was due on Nov 02. Pay now to avoid suspension.', time: '2 h ago', unread: true, to: '/invoices' },
  { id: 2, tone: 'warn', title: 'High memory on pg-main', body: 'Memory stayed above 85% for 10 minutes.', time: '5 h ago', unread: true, to: '/services' },
  { id: 3, tone: 'ok', title: 'Backup completed', body: 'nightly-2026-11-08 · 2.4 GB', time: '03:00', unread: true, to: '/services' },
  { id: 4, tone: 'info', title: 'Maria replied to your ticket', body: 'Migration window for Friday is confirmed.', time: 'Yesterday', unread: false, to: '/support' },
  { id: 5, tone: 'ok', title: 'Domain verified', body: 'blipmade.app now points to your server.', time: 'Mon', unread: false, to: '/domains' },
]

let items = SEED
let nextId = 100
const subs = new Set()
const emit = () => subs.forEach((f) => f())
const store = {
  subscribe: (f) => { subs.add(f); return () => subs.delete(f) },
  get: () => items,
  read: (id) => { items = items.map((n) => (n.id === id ? { ...n, unread: false } : n)); emit() },
  readAll: () => { items = items.map((n) => ({ ...n, unread: false })); emit() },
  drop: (id) => { items = items.filter((n) => n.id !== id); emit() },
  /* the demo can simulate something arriving; the bell reacts */
  push: () => { items = [{ id: ++nextId, tone: 'info', title: 'New login from Frankfurt', body: 'Chrome on macOS. Not you? Change your password.', time: 'now', unread: true, to: '/account' }, ...items]; emit() },
  reset: () => { items = SEED; emit() },
}
export const useNotifications = () => useSyncExternalStore(store.subscribe, store.get)
export const notificationStore = store

const ICON = { bad: AlertTriangle, warn: AlertTriangle, ok: CircleCheck, info: CreditCard }
const TONE = { bad: 'text-bad', warn: 'text-warn', ok: 'text-ok', info: 'text-info' }

function Row({ n, leaving, onOpen, onRead, onDrop }) {
  const I = ICON[n.tone] || Bell
  return (
    <li className={cn('grid transition-[grid-template-rows,opacity] duration-200 ease-[var(--ease-out)]', leaving ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100')}>
      <div className="min-h-0 overflow-hidden">
        <div className="group relative flex items-start gap-3 border-b border-line/50 px-4 py-3 transition-colors duration-150 hover:bg-hover focus-within:bg-hover">
          <button type="button" onClick={() => onOpen(n)} className="flex min-w-0 flex-1 items-start gap-3 text-left outline-none focus-visible:underline">
            <span className="relative mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-line-2 bg-black/30"><I className={cn('size-4', TONE[n.tone])} />{n.unread && <i aria-hidden className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-card bg-[var(--brand)]" />}</span>
            <span className="min-w-0"><span className={cn('block text-[13px]', n.unread ? 'font-medium text-fg' : 'text-mute')}>{n.title}<span className="sr-only">{n.unread ? ' (unread)' : ''}</span></span><span className="mt-0.5 block text-[12px] leading-snug text-dim">{n.body}</span><span className="mt-1 block font-mono text-[10.5px] text-dim">{n.time}</span></span>
          </button>
          <span className="flex shrink-0 flex-col gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 max-sm:opacity-100">
            {n.unread && <button type="button" aria-label="Mark as read" onClick={() => onRead(n.id)} className="grid size-6 place-items-center rounded-md text-dim outline-none transition-colors hover:bg-white/10 hover:text-fg focus-visible:bg-white/10"><Check className="size-3.5" /></button>}
            <button type="button" aria-label="Dismiss" onClick={() => onDrop(n.id)} className="grid size-6 place-items-center rounded-md text-dim outline-none transition-colors hover:bg-white/10 hover:text-fg focus-visible:bg-white/10"><X className="size-3.5" /></button>
          </span>
        </div>
      </div>
    </li>
  )
}

export function NotificationCenter({ className }) {
  const nav = useNavigate()
  const list = useNotifications()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('all')
  const [leaving, setLeaving] = useState([])
  const unread = list.filter((n) => n.unread).length
  const shown = tab === 'unread' ? list.filter((n) => n.unread) : list
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  /* a short ring on the bell when something new arrives while it is closed */
  const prev = useRef(unread)
  const [ring, setRing] = useState(0)
  useEffect(() => { if (unread > prev.current && !open) setRing((r) => r + 1); prev.current = unread }, [unread, open])
  const drop = (id) => { setLeaving((l) => [...l, id]); timers.current.push(setTimeout(() => { notificationStore.drop(id); setLeaving((l) => l.filter((x) => x !== id)) }, 210)) }
  const openItem = (n) => { store.read(n.id); setOpen(false); if (n.to) nav(n.to) }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'} className={cn('relative grid size-9 place-items-center rounded-lg text-mute outline-none transition-colors hover:bg-hover hover:text-fg focus-visible:bg-hover data-[state=open]:bg-hover data-[state=open]:text-fg', className)}>
          <Bell key={ring} className={cn('size-4', ring > 0 && 'animate-[bell-ring_700ms_var(--ease-out)]')} />
          <span aria-hidden className={cn('absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[var(--brand)] transition-[opacity,transform] duration-200', unread ? 'scale-100 opacity-100' : 'scale-0 opacity-0')} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(380px,calc(100vw-1rem))] overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="text-[13px] font-medium">Notifications{unread > 0 && <span className="ml-2 rounded-full bg-[var(--brand)]/15 px-1.5 py-0.5 font-mono text-[10.5px] text-[var(--brand)]">{unread} new</span>}</div>
          <button type="button" disabled={!unread} onClick={() => store.readAll()} className="inline-flex items-center gap-1.5 text-xs text-dim outline-none transition-colors hover:text-fg focus-visible:text-fg disabled:pointer-events-none disabled:opacity-40"><CheckCheck className="size-3.5" />Mark all read</button>
        </div>
        <div className="flex gap-1 border-b border-line px-3 py-2" role="tablist" aria-label="Filter notifications">
          {[['all', 'All', list.length], ['unread', 'Unread', unread]].map(([id, l, c]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn('inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] outline-none transition-colors duration-150 focus-visible:bg-hover', tab === id ? 'bg-white/[0.09] text-fg' : 'text-mute hover:bg-hover hover:text-fg')}>{l}<span className="font-mono text-[10.5px] tabular-nums text-dim">{c}</span></button>
          ))}
        </div>
        <div className="max-h-[min(420px,60dvh)] overflow-y-auto overscroll-contain">
          {shown.length === 0 ? (
            <div className="anim-rise flex flex-col items-center gap-3 px-6 py-10 text-center">
              <Orb size={44} state="happy" />
              <div className="text-[14px] font-medium">{tab === 'unread' ? 'You are all caught up' : 'Nothing here yet'}</div>
              <p className="text-[12.5px] text-dim">{tab === 'unread' ? 'New activity on your services will show up here.' : 'Alerts about billing and your servers will appear in this list.'}</p>
            </div>
          ) : <ul>{shown.map((n) => <Row key={n.id} n={n} leaving={leaving.includes(n.id)} onOpen={openItem} onRead={store.read} onDrop={drop} />)}</ul>}
        </div>
        <button type="button" onClick={() => { setOpen(false); nav('/notifications') }} className="group flex w-full items-center justify-center gap-1.5 border-t border-line py-2.5 text-[12.5px] text-mute outline-none transition-colors hover:bg-hover hover:text-fg focus-visible:bg-hover">View all<ArrowRight className="size-3.5 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5" /></button>
      </PopoverContent>
    </Popover>
  )
}
