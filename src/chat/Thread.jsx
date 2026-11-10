import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, Check, CheckCheck, Clock, FileText, Receipt } from 'lucide-react'
import { AGENTS, chat, useChat } from './store.js'
import { cn } from '../lib/utils'

import { Who } from './Who.jsx'
export { Who }

const Ticks = ({ status }) => status === 'read' ? <CheckCheck className="size-3 text-ok" aria-label="Read" /> : status === 'sent' ? <Check className="size-3" aria-label="Sent" /> : <Clock className="size-3" aria-label="Sending" />

function Card({ card, onAct }) {
  if (card.type === 'invoice') {
    return (
      <div className="mt-1.5 w-[272px] max-w-full rounded-xl border border-line-2 bg-black/30 p-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line-2 bg-white/[0.04]"><Receipt className="size-4 text-mute" /></span>
          <div className="min-w-0 flex-1"><div className="font-mono text-[12.5px]">{card.id}</div><div className="text-[11.5px] text-dim">Due {card.due}</div></div>
          <div className="text-right"><div className="font-mono text-[14px] tabular-nums">{card.amount}</div><div className="font-mono text-[10px] uppercase tracking-[.06em] text-warn">{card.status}</div></div>
        </div>
        <div className="mt-3 flex gap-2"><button onClick={() => onAct('invoice')} className="h-8 min-w-0 flex-1 truncate whitespace-nowrap rounded-lg bg-fg px-2 text-[12.5px] font-semibold text-black outline-none transition-[transform,opacity] active:scale-[.97] focus-visible:ring-2 focus-visible:ring-white/40">Open invoice</button><button onClick={() => onAct('pay')} className="h-8 min-w-0 flex-1 truncate whitespace-nowrap rounded-lg border border-line-2 px-2 text-[12.5px] font-medium outline-none transition-[transform,background-color] hover:bg-hover active:scale-[.97] focus-visible:ring-2 focus-visible:ring-white/30">Pay now</button></div>
      </div>
    )
  }
  return <pre className="mt-1.5 w-full max-w-[290px] overflow-x-auto rounded-xl border border-line-2 bg-black/40 p-3 font-mono text-[11.5px] leading-5 text-fg/85">{card.lines.join('\n')}</pre>
}

const Message = memo(function Message({ m, first, last, onAct, onQuick, showQuick }) {
  if (m.from === 'system') {
    if (m.kind === 'queue') return <QueueCard />
    return <div className="anim-rise flex justify-center py-1"><span className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-center font-mono text-[10.5px] leading-4 tracking-[.02em] text-dim">{m.text}</span></div>
  }
  const me = m.from === 'me'
  return (
    <>
    <div data-me={me || undefined} className={cn('chat-msg flex items-end gap-2', me ? 'flex-row-reverse' : 'flex-row')}>
      {!me && <span className={cn('w-7 shrink-0', !last && 'invisible')}>{last && <Who who={m.from} size={28} live={m.from === 'operator'} />}</span>}
      <div className={cn('flex min-w-0 max-w-[82%] flex-col', me ? 'items-end' : 'items-start')}>
        {m.kind === 'file' ? (
          <div className="flex w-full min-w-0 max-w-[280px] items-center gap-3 rounded-2xl rounded-br-md border border-line-2 bg-white/[0.06] py-2 pl-2 pr-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line-2 bg-black/30"><FileText className="size-4 text-mute" /></span><span className="min-w-0 flex-1"><span className="block truncate text-[13px]" title={m.file.name}>{m.file.name}</span><span className="block font-mono text-[10.5px] text-dim">{m.file.size}</span></span></div>
        ) : m.kind === 'card' ? <Card card={m.card} onAct={onAct} /> : (
          <div className={cn('whitespace-pre-wrap break-words px-3.5 py-2.5 text-[14px] leading-[1.5] rounded-2xl', me ? 'bg-fg text-black' : 'border border-line bg-white/[0.04] text-fg', me && last && 'rounded-br-md', !me && last && 'rounded-bl-md', me && !first && 'rounded-tr-md', !me && !first && 'rounded-tl-md')}>
            {m.text}{m.streaming && <span aria-hidden className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current align-baseline" />}
          </div>
        )}
        {last && <div className="mt-1 flex items-center gap-1.5 px-1 font-mono text-[10px] text-dim">{m.t}{me && m.status && <Ticks status={m.status} />}</div>}
      </div>
    </div>
    {showQuick && m.quick && <div className="ml-9 mt-2 flex flex-wrap gap-1.5">{['Why is my bill higher?', 'Point a domain', 'My Minecraft server lags', 'Talk to a person'].map((q, i) => <button key={q} onClick={() => onQuick(q)} style={{ animationDelay: `${i * 70}ms` }} className="anim-rise h-8 rounded-full border border-line-2 px-3 text-[12.5px] text-mute outline-none transition-[color,background-color,border-color,transform] duration-150 hover:border-white/30 hover:bg-hover hover:text-fg focus-visible:border-white/50 active:scale-[.96]">{q}</button>)}</div>}
    </>
  )
})

function QueueCard() {
  const { op, who } = useChat()
  const name = AGENTS[who].name
  return (
    <div className="anim-rise mx-auto w-full max-w-[300px] rounded-2xl border border-line-2 bg-black/30 p-4 text-center" role="status" aria-live="polite">
      <div className="mx-auto flex w-fit items-center gap-1.5">{[3, 2, 1].map((n) => <i key={n} className={cn('size-2 rounded-full transition-[background-color,transform] duration-500', op.pos <= n ? 'scale-110 bg-ok' : 'bg-white/15')} />)}</div>
      <div className="mt-3 text-[14px] font-medium">{op.pos > 1 ? `You are number ${op.pos} in line` : 'You are next'}</div>
      <div className="mt-0.5 text-[12.5px] text-dim">About {Math.max(1, op.pos) * 15} seconds. {name} shared the conversation, so you will not repeat yourself.</div>
      <button onClick={() => chat.backToBlip()} className="mt-3 text-[12.5px] text-mute underline underline-offset-4 outline-none transition-colors hover:text-fg focus-visible:text-fg">Stay with {name} instead</button>
    </div>
  )
}

function Typing({ who }) {
  return (
    <div className="flex items-end gap-2" aria-label={`${AGENTS[who].name} is typing`}>
      <Who who={who} size={28} state="thinking" live={who === 'operator'} />
      <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-white/[0.04] px-3.5 py-3">{[0, 1, 2].map((i) => <i key={i} className="chat-dot size-1.5 rounded-full bg-fg" style={{ animationDelay: `${i * 150}ms` }} />)}</div>
    </div>
  )
}

export function Thread({ onClose }) {
  const { msgs, typing } = useChat()
  const nav = useNavigate()
  const box = useRef(null)
  const stick = useRef(true)
  const [away, setAway] = useState(0)          // messages that arrived while the reader was scrolled up
  const prev = useRef(msgs.length)
  const sig = msgs.length + ':' + (msgs[msgs.length - 1]?.text?.length ?? 0) + ':' + (typing || '')
  const onScroll = () => { const e = box.current; const near = e.scrollHeight - e.scrollTop - e.clientHeight < 56; stick.current = near; if (near) setAway(0) }
  /* follow the conversation only while the reader is at the bottom; streaming writes scrollTop directly (smooth scrolling every
     few milliseconds makes the text shake) */
  useLayoutEffect(() => {
    const e = box.current
    if (!e) return
    if (stick.current) e.scrollTop = e.scrollHeight
    else if (msgs.length > prev.current) setAway((n) => n + (msgs.length - prev.current))
    prev.current = msgs.length
  }, [sig])
  useEffect(() => { const e = box.current; if (e) e.scrollTop = e.scrollHeight }, [])
  const act = (k) => { onClose?.(); nav(k === 'pay' ? '/invoices' : '/invoices') }
  const onlyGreeting = msgs.every((m) => m.from !== 'me')
  return (
    <div className="relative min-h-0 flex-1">
      <div ref={box} onScroll={onScroll} role="log" aria-live="polite" aria-label="Conversation" tabIndex={-1} className="chat-scroll absolute inset-0 space-y-1.5 overflow-y-auto overscroll-contain px-3.5 py-4 [scrollbar-width:thin]">
        {msgs.map((m, i) => {
          const p = msgs[i - 1], n = msgs[i + 1]
          const sameP = p && p.from === m.from && m.from !== 'system', sameN = n && n.from === m.from && m.from !== 'system'
          return <div key={m.id} className={cn(!sameP && i > 0 && 'pt-2.5')}><Message m={m} first={!sameP} last={!sameN} onAct={act} onQuick={(q) => chat.send(q)} showQuick={onlyGreeting} /></div>
        })}
        {typing && <div className="chat-msg pt-1"><Typing who={typing} /></div>}
      </div>
      <button onClick={() => { const e = box.current; e.scrollTo({ top: e.scrollHeight, behavior: 'smooth' }); setAway(0) }} aria-label="Jump to latest message"
        className={cn('absolute bottom-3 left-1/2 flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full border border-line-2 bg-[#1a1a1e] px-3 text-[12px] shadow-lg shadow-black/50 outline-none transition-[opacity,transform] duration-200 ease-[var(--ease-out)] focus-visible:ring-2 focus-visible:ring-white/30', away ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0')}><ArrowDown className="size-3.5" />{away} new</button>
    </div>
  )
}
