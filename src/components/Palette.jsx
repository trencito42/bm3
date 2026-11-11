/* Ctrl/Cmd+K search, one component for every area (customer app, admin, public site, design workspace).
   Each area supplies its own groups of items; this file owns the behaviour: fuzzy match, recent items, the empty state, keyboard hints,
   and the hotkey. Anything can open it by dispatching the "blip:open-search" event (the buttons in headers do). */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import * as DialogP from '@radix-ui/react-dialog'
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react'
import { Orb } from '../builder/FxBits.jsx'
import { cn } from '../lib/utils'

export const OPEN_EVENT = 'blip:open-search'
export const openSearch = () => dispatchEvent(new Event(OPEN_EVENT))

const KEY = (scope) => `blip-recent-${scope}`
const readRecent = (scope) => { try { return JSON.parse(localStorage.getItem(KEY(scope)) || '[]') } catch { return [] } }
const writeRecent = (scope, id) => { try { localStorage.setItem(KEY(scope), JSON.stringify([id, ...readRecent(scope).filter((x) => x !== id)].slice(0, 5))) } catch { /* private window: no history */ } }

/* every word typed must appear somewhere in the item; items that start with the query come first */
const filter = (value, search, keywords) => {
  const q = search.trim().toLowerCase()
  if (!q) return 1
  const hay = (keywords || []).join(' ').toLowerCase()
  const parts = q.split(/\s+/)
  if (!parts.every((p) => hay.includes(p))) return 0
  return (keywords?.[0] || '').toLowerCase().startsWith(q) ? 1 : hay.split(/\s+/).some((w) => w.startsWith(parts[0])) ? 0.7 : 0.4
}
const mark = (s, q) => { const t = q.trim().toLowerCase(), i = t ? s.toLowerCase().indexOf(t) : -1; return i < 0 ? s : <>{s.slice(0, i)}<mark className="rounded-sm bg-white/15 px-px text-fg">{s.slice(i, i + t.length)}</mark>{s.slice(i + t.length)}</> }

/* Ctrl/Cmd+K toggles it. With `slash`, "/" opens it too (when the focus is not in a field). */
export function usePaletteHotkey(setOpen, { slash = false } = {}) {
  useEffect(() => {
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o) }
      else if (slash && e.key === '/' && !e.metaKey && !e.ctrlKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) { e.preventDefault(); setOpen(true) }
    }
    const o = () => setOpen(true)
    addEventListener('keydown', k); addEventListener(OPEN_EVENT, o)
    return () => { removeEventListener('keydown', k); removeEventListener(OPEN_EVENT, o) }
  }, [setOpen, slash])
}

/* the button that sits in headers: it looks like a field and shows the shortcut */
export function SearchButton({ label = 'Search', className, compact }) {
  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
  return compact
    ? <button type="button" onClick={openSearch} aria-label={label} className={cn('grid size-9 place-items-center rounded-lg text-mute outline-none transition-colors hover:bg-hover hover:text-fg focus-visible:bg-hover', className)}><Search className="size-4" /></button>
    : <button type="button" onClick={openSearch} className={cn('group flex h-9 items-center gap-2 rounded-lg border border-line-2 px-2.5 text-[12.5px] text-dim outline-none transition-[border-color,color] duration-150 hover:border-white/25 hover:text-fg focus-visible:border-white/40', className)}><Search className="size-3.5" />{label}<kbd className="ml-6 rounded border border-line-2 px-1.5 font-mono text-[10px] text-dim">{mac ? '⌘' : 'Ctrl'} K</kbd></button>
}

/* groups: [{ heading, items: [{ id, label, hint?, icon?, to?, run?, keywords?: string[] }] }] */
export function CommandPalette({ open, onOpenChange, scope, placeholder = 'Search or jump to…', groups, extra }) {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [recent, setRecent] = useState([])
  const list = useRef(null)
  useEffect(() => { if (open) { setQ(''); setRecent(readRecent(scope)) } }, [open, scope])
  const all = useMemo(() => groups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.heading }))), [groups])
  const recents = useMemo(() => recent.map((id) => all.find((i) => i.id === id)).filter(Boolean), [recent, all])
  const run = useCallback((item) => {
    writeRecent(scope, item.id)
    onOpenChange(false)
    if (item.run) setTimeout(() => item.run(), 0); else if (item.to) nav(item.to)
  }, [scope, nav, onOpenChange])
  const Row = ({ i, tag = '' }) => {
    const Icon = i.icon || ArrowRight
    return (
      <Command.Item key={tag + i.id} value={tag + i.id} keywords={[i.label, i.hint || '', i.group || '', ...(i.keywords || [])]} onSelect={() => run(i)} className="group/item">
        <span className="grid size-6 shrink-0 place-items-center text-dim group-data-[selected=true]/item:text-fg"><Icon className="size-4" /></span>
        <span className="min-w-0 flex-1 truncate">{mark(i.label, q)}</span>
        {i.hint && <span className="hidden max-w-[40%] shrink-0 truncate font-mono text-[11px] text-dim sm:inline">{i.hint}</span>}
        <CornerDownLeft className="size-3.5 shrink-0 text-dim opacity-0 transition-opacity group-data-[selected=true]/item:opacity-100" />
      </Command.Item>
    )
  }
  return (
    <DialogP.Root open={open} onOpenChange={onOpenChange}>
      <DialogP.Portal>
        <DialogP.Overlay className="anim-overlay fixed inset-0 z-[70] bg-black/60 backdrop-blur-[3px]" />
        <DialogP.Content className="anim-pop fixed left-1/2 top-[12%] z-[70] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-line-2 bg-card shadow-2xl shadow-black/70 outline-none" onOpenAutoFocus={(e) => { e.preventDefault(); list.current?.querySelector('input')?.focus() }}>
          <DialogP.Title className="sr-only">Search</DialogP.Title>
          <DialogP.Description className="sr-only">Type to search, arrow keys to move, Enter to open, Escape to close</DialogP.Description>
          <Command filter={filter} loop ref={list}>
            <div className="flex items-center border-b border-line pl-4"><Search className="size-4 shrink-0 text-dim" /><Command.Input value={q} onValueChange={setQ} placeholder={placeholder} autoFocus className="!border-0" /></div>
            <Command.List className="!max-h-[min(380px,55dvh)]">
              <Command.Empty>
                <div className="flex flex-col items-center gap-3 py-5"><Orb size={44} state="waiting" /><div className="text-[13.5px] text-mute">Nothing for “{q}”</div><div className="text-[12px] text-dim">Try fewer words, or one of these</div><div className="flex flex-wrap justify-center gap-1.5">{all.slice(0, 3).map((i) => <button key={i.id} onClick={() => run(i)} className="rounded-md border border-line-2 px-2.5 py-1 text-[12px] text-mute transition-colors hover:text-fg">{i.label}</button>)}</div></div>
              </Command.Empty>
              {!q && recents.length > 0 && <Command.Group heading="Recent">{recents.map((i) => <Row key={'r' + i.id} i={i} tag="recent:" />)}</Command.Group>}
              {extra}
              {groups.map((g) => <Command.Group key={g.heading} heading={g.heading}>{g.items.map((i) => <Row key={i.id} i={{ ...i, group: g.heading }} />)}</Command.Group>)}
            </Command.List>
            <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2 text-[11.5px] text-dim"><span className="flex items-center gap-3"><span><kbd className="font-mono">↑↓</kbd> move</span><span><kbd className="font-mono">↵</kbd> open</span><span><kbd className="font-mono">esc</kbd> close</span></span><span className="hidden sm:inline">{all.length} things to find</span></div>
          </Command>
        </DialogP.Content>
      </DialogP.Portal>
    </DialogP.Root>
  )
}
