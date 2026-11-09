import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Check, Mail } from 'lucide-react'
import { Button } from '../components/ui.jsx'
import { Who } from './Who.jsx'
import { AGENTS, chat, useChat } from './store.js'
import { cn } from '../lib/utils'

const WORDS = ['', 'Poor', 'Not great', 'Okay', 'Good', 'Great']
const TAGS = { good: ['Fast', 'Helpful', 'Friendly', 'Clear'], bad: ['Too slow', 'Did not solve it', 'Needed a person', 'Unclear'] }

function Star({ on, preview, i, onPick, onHover, checked, focusable }) {
  return (
    <button type="button" role="radio" aria-checked={checked} aria-label={`${i} star${i > 1 ? 's' : ''}: ${WORDS[i]}`} tabIndex={focusable ? 0 : -1}
      onClick={() => onPick(i)} onPointerEnter={() => onHover(i)} onFocus={() => onHover(i)}
      className="group grid size-11 place-items-center rounded-xl outline-none transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-white/40 active:scale-90">
      <svg viewBox="0 0 24 24" className={cn('size-8 transition-[transform,fill,stroke,opacity] duration-200 ease-[var(--ease-out)]', on ? 'scale-100 fill-white stroke-white' : preview ? 'scale-105 fill-white/50 stroke-white/70' : 'scale-95 fill-transparent stroke-white/30')} strokeWidth="1.6" strokeLinejoin="round"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17.1 6.6 19.9l1.1-6.1L3.2 9.6l6.1-.8z" /></svg>
    </button>
  )
}

/* End of chat: rate whoever helped, pick what went well or badly, optionally say more, then a thank-you */
export function Rating() {
  const { who, phase, rating } = useChat()
  const helper = who
  const [hover, setHover] = useState(0)
  const [busy, setBusy] = useState(false)
  const [comment, setComment] = useState(rating.comment || '')
  const timer = useRef(0)
  const stars = rating.stars
  const shown = hover || stars
  const mood = shown === 0 ? 'idle' : shown >= 4 ? 'happy' : shown === 3 ? 'waiting' : 'error'
  const key = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); chat.setRating({ stars: Math.min(5, (stars || 0) + 1) }) }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); chat.setRating({ stars: Math.max(1, (stars || 2) - 1) }) }
  }
  const toggleTag = (t) => chat.setRating({ tags: rating.tags.includes(t) ? rating.tags.filter((x) => x !== t) : [...rating.tags, t] })
  const submit = () => { setBusy(true); timer.current = setTimeout(() => { setBusy(false); chat.rate({ comment }); toast.success('Thanks for the feedback') }, 700) }

  if (phase === 'done') {
    return (
      <div className="anim-rise flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-8 text-center">
        <Who who={helper} size={84} state="happy" live={helper === 'operator'} />
        <div><div className="text-[19px] font-semibold tracking-tight">{rating.stars ? 'Thank you, Stefan' : 'Chat ended'}</div><p className="mx-auto mt-1.5 max-w-[260px] text-[13.5px] leading-relaxed text-mute">{rating.stars ? `Your ${rating.stars}-star rating helps us train ${AGENTS[helper].name} and the team.` : 'You can start a new conversation any time.'}</p></div>
        <div className="flex w-full max-w-[260px] flex-col gap-2">
          <Button size="lg" onClick={() => chat.restart()}>Start a new chat</Button>
          <Button variant="ghost" onClick={() => toast.success('Transcript sent to stefan@example.com (simulated)')}><Mail />Email me the transcript</Button>
        </div>
      </div>
    )
  }
  return (
    <div className="anim-rise flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-7 text-center">
      <div className="mx-auto"><Who who={helper} size={76} state={mood} live={helper === 'operator'} /></div>
      <div className="mt-5 text-[18px] font-semibold tracking-tight">How was {AGENTS[helper].name}?</div>
      <p className="mt-1 text-[13px] text-dim">{helper === 'operator' ? 'A person helped you in this chat.' : 'An automated Blip answered in this chat.'}</p>
      <div role="radiogroup" aria-label="Rating" onKeyDown={key} onPointerLeave={() => setHover(0)} className="mx-auto mt-5 flex">
        {[1, 2, 3, 4, 5].map((i) => <Star key={i} i={i} on={i <= shown && !(hover > stars)} preview={i <= shown && hover > stars} checked={stars === i} focusable={stars ? stars === i : i === 1} onPick={(n) => chat.setRating({ stars: n, tags: [] })} onHover={setHover} />)}
      </div>
      <div className="mt-1 h-5 font-mono text-[11px] uppercase tracking-[.08em] text-mute" aria-live="polite">{WORDS[shown]}</div>
      <div className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out)]', stars ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')} aria-hidden={!stars}>
        <div className="min-h-0 overflow-hidden">
          <div className="pt-4">
            <div className="text-[12.5px] text-dim">{stars >= 4 ? 'What went well?' : 'What could be better?'}</div>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">{(stars >= 4 ? TAGS.good : TAGS.bad).map((t) => { const on = rating.tags.includes(t); return <button key={t} type="button" aria-pressed={on} tabIndex={stars ? 0 : -1} onClick={() => toggleTag(t)} className={cn('inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] outline-none transition-[background-color,border-color,color,transform] duration-150 focus-visible:border-white/50 active:scale-95', on ? 'border-white/60 bg-fg text-black' : 'border-line-2 text-mute hover:text-fg')}>{on && <Check className="size-3" />}{t}</button> })}</div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={400} tabIndex={stars ? 0 : -1} aria-label="Anything else? (optional)" placeholder="Anything else? (optional)" className="mt-3 w-full resize-none rounded-xl border border-line-2 bg-black/30 px-3 py-2.5 text-[16px] text-fg outline-none transition-colors placeholder:text-dim focus:border-white/35 sm:text-[13.5px]" />
          </div>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-center gap-2 pt-6">
        <Button variant="ghost" onClick={() => chat.rate({ stars: 0, tags: [], comment: '' })}>Skip</Button>
        <Button disabled={!stars} loading={busy} onClick={submit}>Send feedback</Button>
      </div>
    </div>
  )
}
