import { toast } from 'sonner'
import { ChevronDown, Flag, Headset, Mail, MoreHorizontal, Sparkles } from 'lucide-react'
import { Menu, MenuContent, MenuItem, MenuSep, MenuTrigger } from '../components/ui.jsx'
import { Composer } from './Composer.jsx'
import { Rating } from './Rating.jsx'
import { Thread } from './Thread.jsx'
import { Who } from './Who.jsx'
import { AGENTS, chat, useChat } from './store.js'
import { cn } from '../lib/utils'

/* Blip | Person: one pill that slides, with what each choice costs in waiting time */
function Switch({ person, queued, pos }) {
  const opts = [['blip', 'Blip', 'Instant'], ['person', 'Person', queued ? `In line · ${pos}` : person ? 'Maria' : '~1 min']]
  return (
    <div role="radiogroup" aria-label="Who do you want to talk to?" className="relative mx-3.5 mt-3 grid grid-cols-2 rounded-xl border border-line bg-black/30 p-0.5">
      <span aria-hidden className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-[9px] bg-white/[0.1] transition-transform duration-300 ease-[var(--ease-out)]" style={{ transform: person ? 'translateX(100%)' : 'none' }} />
      {opts.map(([id, label, sub]) => {
        const on = (id === 'person') === person
        return <button key={id} role="radio" aria-checked={on} onClick={() => (id === 'person' ? chat.requestOperator() : chat.backToBlip())} className="relative flex h-10 flex-col items-center justify-center rounded-[9px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[.98]"><span className={cn('text-[13px] font-medium leading-none transition-colors', on ? 'text-fg' : 'text-mute')}>{label}</span><span className="mt-1 font-mono text-[10px] leading-none text-dim">{sub}</span></button>
      })}
    </div>
  )
}

export default function Panel({ open, onMinimize, autoFocus }) {
  const { who, op, typing, phase, ending } = useChat()
  const person = who === 'operator' || op.status === 'queued'
  const A = AGENTS[who]
  const status = typing ? (typing === 'operator' ? 'typing…' : 'thinking…') : op.status === 'queued' ? `In line · ${op.pos}` : A.line
  return (
    <div className="flex h-full w-full flex-col bg-[#0e0e10]" onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onMinimize() } }}>
      <header className="flex shrink-0 items-center gap-3 border-b border-line px-3.5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <span key={who} className="grid shrink-0 place-items-center [animation:blip-in_420ms_cubic-bezier(.3,1.5,.5,1)_both]"><Who who={who} size={38} state={typing ? 'thinking' : 'idle'} live={who === 'operator'} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><span className="truncate text-[15px] font-semibold leading-tight tracking-tight">{A.name}</span><span className="rounded-full border border-line-2 px-1.5 py-px font-mono text-[9.5px] uppercase tracking-[.06em] text-dim">{who === 'operator' ? 'Human' : 'Blip'}</span></div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-dim"><i className={cn('size-1.5 shrink-0 rounded-full', op.status === 'queued' ? 'animate-pulse bg-warn' : 'bg-ok')} /><span className="truncate" aria-live="polite">{status}</span></div>
        </div>
        {phase === 'chat' && (
          <Menu>
            <MenuTrigger aria-label="Chat options" className="grid size-9 place-items-center rounded-lg text-dim outline-none transition-[color,background-color] hover:bg-hover hover:text-fg focus-visible:bg-hover data-[state=open]:bg-hover data-[state=open]:text-fg"><MoreHorizontal className="size-[18px]" /></MenuTrigger>
            <MenuContent className="z-[70]">
              {!person ? <MenuItem onSelect={() => chat.requestOperator()}><Headset />Talk to a person</MenuItem> : <MenuItem onSelect={() => chat.backToBlip()}><Sparkles />Back to Pip</MenuItem>}
              <MenuItem onSelect={() => toast.success('Transcript sent to stefan@example.com (simulated)')}><Mail />Email transcript</MenuItem>
              <MenuItem onSelect={() => toast('Reported. A person will review this chat (simulated)')}><Flag />Report a problem</MenuItem>
              <MenuSep />
              <MenuItem danger onSelect={() => chat.askEnd(true)}>End chat</MenuItem>
            </MenuContent>
          </Menu>
        )}
        <button aria-label="Minimise chat" onClick={onMinimize} className="grid size-9 place-items-center rounded-lg text-dim outline-none transition-[color,background-color,transform] hover:bg-hover hover:text-fg focus-visible:bg-hover active:scale-90"><ChevronDown className="size-5" /></button>
      </header>

      {phase === 'chat' ? (
        <>
          <Switch person={person} queued={op.status === 'queued'} pos={op.pos} />
          <Thread onClose={onMinimize} />
          {ending && (
            <div className="anim-rise mx-3.5 mb-2 flex items-center gap-3 rounded-xl border border-line-2 bg-[#17171b] px-3.5 py-2.5" role="alertdialog" aria-label="End this chat?">
              <span className="min-w-0 flex-1 text-[13px]">End this chat?</span>
              <button onClick={() => chat.askEnd(false)} className="h-8 rounded-lg px-3 text-[12.5px] text-mute outline-none transition-colors hover:text-fg focus-visible:bg-hover">Keep chatting</button>
              <button onClick={() => chat.end()} className="h-8 rounded-lg bg-fg px-3 text-[12.5px] font-semibold text-black outline-none transition-transform focus-visible:ring-2 focus-visible:ring-white/40 active:scale-95">End and rate</button>
            </div>
          )}
          <Composer autoFocus={open && autoFocus} />
        </>
      ) : <Rating />}
    </div>
  )
}
