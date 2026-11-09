import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ArrowUp, Paperclip } from 'lucide-react'
import { AGENTS, chat, useChat } from './store.js'
import { cn } from '../lib/utils'

const fmtSize = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB')

/* The composer owns its text: typing never re-renders the thread. Enter sends, Shift+Enter breaks the line, the field grows to
   five lines then scrolls. 16 px text on phones so iOS does not zoom into the field. */
export function Composer({ autoFocus }) {
  const { draft, who, op } = useChat()
  const [v, setV] = useState(draft)
  const ta = useRef(null)
  const file = useRef(null)
  const grow = () => { const e = ta.current; if (!e) return; e.style.height = 'auto'; e.style.height = Math.min(e.scrollHeight, 132) + 'px' }
  useEffect(grow, [v])
  useEffect(() => { if (autoFocus) { const t = setTimeout(() => ta.current?.focus({ preventScroll: true }), 380); return () => clearTimeout(t) } }, [autoFocus])
  const send = () => { const t = v.trim(); if (!t) return; chat.send(t); setV(''); chat.setDraft(''); requestAnimationFrame(() => { grow(); ta.current?.focus({ preventScroll: true }) }) }
  const onFile = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (f.size > 10 * 1048576) { toast.error('Files can be up to 10 MB'); return }
    chat.send('', { name: f.name, size: fmtSize(f.size) })
  }
  const waiting = who === 'operator' && op.status === 'queued'
  const ph = waiting ? 'You are in the queue. Write now, we will see it.' : who === 'operator' ? 'Reply to Maria…' : `Ask ${AGENTS[who].name} anything…`
  const can = v.trim().length > 0
  return (
    <div className="border-t border-line px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
      <div className="flex items-end gap-1.5 rounded-2xl border border-line-2 bg-black/30 p-1.5 transition-[border-color,box-shadow] duration-200 focus-within:border-white/35 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,.05)]">
        <input ref={file} type="file" className="hidden" onChange={onFile} tabIndex={-1} aria-hidden />
        <button type="button" aria-label="Attach a file" onClick={() => file.current?.click()} className="grid size-9 shrink-0 place-items-center rounded-xl text-dim outline-none transition-[color,background-color,transform] hover:bg-hover hover:text-fg focus-visible:bg-hover active:scale-90"><Paperclip className="size-[18px]" /></button>
        <textarea ref={ta} rows={1} value={v} aria-label="Message" placeholder={ph} enterKeyHint="send" autoCapitalize="sentences" maxLength={2000}
          onChange={(e) => { setV(e.target.value); chat.setDraft(e.target.value) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send() } }}
          className="max-h-[132px] min-h-9 flex-1 resize-none bg-transparent px-1.5 py-[7px] text-[16px] leading-[22px] text-fg outline-none placeholder:text-dim sm:text-[14px]" />
        <button type="button" aria-label="Send message" disabled={!can} onClick={send} className={cn('grid size-9 shrink-0 place-items-center rounded-xl outline-none transition-[background-color,color,transform,opacity] duration-200 focus-visible:ring-2 focus-visible:ring-white/40', can ? 'bg-fg text-black active:scale-90' : 'bg-white/[0.06] text-dim')}><ArrowUp className={cn('size-[18px] transition-transform duration-200 ease-[var(--ease-out)]', can && '-translate-y-px')} /></button>
      </div>
      <p className="mt-2 hidden px-1 font-mono text-[10px] tracking-[.02em] text-dim sm:block">Enter to send · Shift+Enter for a new line</p>
    </div>
  )
}
