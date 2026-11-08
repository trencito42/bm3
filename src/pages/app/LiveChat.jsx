import { useState } from 'react'
import { toast } from 'sonner'
import { BookOpen, CheckCircle2, Clock, Phone, X } from 'lucide-react'
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Avatar } from '../../components/ui.jsx'
import { TicketThread, LiveChatWidget } from '../../components/product.jsx'
import { AttachmentPreview, NewConversation } from '../../components/ui3.jsx'
import { Orb, DotText } from '../../builder/FxBits.jsx'
import { cn } from '../../lib/utils'

const AGENTS = [['Maria', 'Support L2', true], ['Andrei', 'Infrastructure', true], ['Elena', 'Billing', false]]

export default function LiveChat() {
  const [state, setState] = useState('chat') /* new | chat | closed */
  const [stars, setStars] = useState(0)
  const [key, setKey] = useState(0)
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <Card className="flex h-[min(640px,calc(100dvh-220px))] min-h-[420px] flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Orb size={34} state={state === 'chat' ? 'idle' : 'waiting'} />
          <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold">Live chat</div><div className="flex items-center gap-1.5 text-xs text-ok"><i className="size-1.5 animate-pulse rounded-full bg-ok" />Maria is online · replies in ~2 min</div></div>
          {state === 'chat' && <Button size="sm" variant="outline" onClick={() => setState('closed')}><X />End chat</Button>}
        </div>
        {state === 'new' && <div className="grid flex-1 place-items-center p-6"><div className="w-full max-w-sm"><NewConversation /><Button className="mt-3 w-full" variant="ghost" onClick={() => { setKey(key + 1); setState('chat') }}>Skip, just start chatting</Button></div></div>}
        {state === 'chat' && <div className="min-h-0 flex-1" key={key}><TicketThread initial={[['bot', 'Hi Stefan! I am Maria. What can I help you with today?', '14:02']]} agent="Maria" /></div>}
        {state === 'closed' && (
          <div className="grid flex-1 place-items-center p-6 text-center"><div className="space-y-5"><CheckCircle2 className="mx-auto size-10 text-ok" /><div><div className="text-lg font-semibold">Conversation closed</div><p className="mt-1 text-[13px] text-dim">How was your chat with Maria?</p></div>
            <div className="flex justify-center gap-1.5">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setStars(n)} aria-label={`${n} stars`} className={cn('grid size-10 place-items-center rounded-lg border text-lg transition-colors', n <= stars ? 'border-fg bg-fg text-black' : 'border-line-2 text-dim hover:text-fg')}>★</button>)}</div>
            <div className="flex justify-center gap-2"><Button disabled={!stars} onClick={() => { toast.success('Thanks for the feedback'); setStars(0); setKey(key + 1); setState('new') }}>Send rating</Button><Button variant="ghost" onClick={() => { setKey(key + 1); setState('new') }}>New chat</Button></div></div></div>
        )}
      </Card>
      <div className="space-y-4">
        <Card><CardHeader><CardTitle>Agents online</CardTitle></CardHeader><CardBody className="space-y-3">{AGENTS.map(([n, r, on]) => <div key={n} className="flex items-center gap-3 text-[13px]"><div className="relative"><Avatar name={n} className="size-8" /><i className={cn('absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card', on ? 'bg-ok' : 'bg-dim')} /></div><div className="flex-1"><div className="font-medium">{n}</div><div className="text-xs text-dim">{r}</div></div>{!on && <span className="text-xs text-dim">away</span>}</div>)}</CardBody></Card>
        <Card><CardHeader><CardTitle>While you wait</CardTitle></CardHeader><CardBody className="space-y-2 text-[13px]">{['Connect via SSH', 'Reset a firewall rule', 'Point a domain'].map((t) => <button key={t} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-mute transition-colors hover:bg-hover hover:text-fg"><BookOpen className="size-4 shrink-0" />{t}</button>)}</CardBody></Card>
        <Card><CardBody className="flex items-center gap-3 text-[13px]"><Clock className="size-4 text-dim" /><div><div className="font-medium">Support hours</div><div className="text-xs text-dim">24/7 for incidents · chat 08:00–22:00 UTC</div></div></CardBody></Card>
      </div>
    </div>
  )
}
