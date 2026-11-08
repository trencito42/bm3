import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ArrowUp, Plus } from 'lucide-react'
import { Button, Card, Dialog, DialogContent, Input, Label, PageHeader, Segmented, StatusBadge, Textarea } from '../components/ui.jsx'
import { useStore } from '../lib/store.jsx'
import { cn, sleep } from '../lib/utils'
import LiveChat from './app/LiveChat.jsx'

function NewTicket({ open, setOpen, onCreate }) {
  const [subject, setSubject] = useState('')
  const [dept, setDept] = useState('Technical')
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent title="New ticket" description="Describe the problem and we will reply fast.">
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Subject</Label><Input placeholder="e.g. Website is slow" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Department</Label><div><Segmented value={dept} onValueChange={(v) => v && setDept(v)} options={[['Technical', 'Technical'], ['Billing', 'Billing'], ['Sales', 'Sales']]} /></div></div>
          <Button size="lg" className="w-full" onClick={() => { onCreate(subject.trim() || 'New request', dept); setSubject(''); setOpen(false) }}>Open ticket</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Tickets() {
  const { tickets, addTicket, patchTicket } = useStore()
  const [sel, setSel] = useState(tickets[0].id)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [nt, setNt] = useState(false)
  const end = useRef(null)
  const cur = tickets.find((t) => t.id === sel) || tickets[0]
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [cur.msgs.length, typing, sel])

  const send = async () => {
    const v = text.trim(); if (!v || typing) return
    const id = cur.id
    setText('')
    patchTicket(id, (t) => ({ ...t, status: 'open', msgs: [...t.msgs, ['me', v, 'now']] }))
    setTyping(true); await sleep(1500); setTyping(false)
    patchTicket(id, (t) => ({ ...t, status: 'answered', msgs: [...t.msgs, ['bot', 'Thanks, I am looking into that now. I will update this ticket in a few minutes.', 'now']] }))
  }

  return (
    <>
      <PageHeader title="Support" description="Average first reply under 6 minutes.">
        <Button onClick={() => setNt(true)}><Plus />New ticket</Button>
      </PageHeader>
      <div className="grid h-[calc(100dvh-230px)] min-h-[460px] gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="overflow-y-auto">
          {tickets.map((t) => (
            <button key={t.id} onClick={() => setSel(t.id)} className={cn('flex w-full items-start gap-3 border-b border-line/60 px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-hover', t.id === cur.id && 'bg-hover')}>
              <div className="min-w-0 flex-1"><div className="truncate text-[13.5px] font-medium">{t.subject}</div><div className="mt-0.5 text-xs text-dim">{t.dept} · {t.when}</div></div>
              <StatusBadge status={t.status} />
            </button>
          ))}
        </Card>
        <Card className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <div><div className="text-[14px] font-medium">{cur.subject}</div><div className="text-xs text-dim">Ticket #{1040 + cur.id} · {cur.dept}</div></div>
            <StatusBadge status={cur.status} />
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {cur.msgs.map(([w, m, t], i) => (
              <div key={i} className={cn('flex flex-col gap-1', w === 'me' ? 'items-end' : 'items-start')}>
                <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed', w === 'me' ? 'rounded-br-md bg-fg text-black' : 'rounded-bl-md border border-line bg-white/[0.03]')}>{m}</div>
                <span className="px-1 text-[11px] text-dim">{w === 'me' ? 'You' : 'Support'} · {t}</span>
              </div>
            ))}
            {typing && <div className="flex gap-1 px-1 py-2">{[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-bounce rounded-full bg-dim" style={{ animationDelay: `${i * 120}ms` }} />)}</div>}
            <div ref={end} />
          </div>
          <div className="flex items-end gap-2 border-t border-line p-3">
            <Textarea rows={1} className="max-h-32 min-h-9 flex-1" placeholder="Write a reply…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
            <Button size="icon" disabled={!text.trim() || typing} onClick={send} aria-label="Send"><ArrowUp /></Button>
          </div>
        </Card>
      </div>
      <NewTicket open={nt} setOpen={setNt} onCreate={(subject, dept) => { const id = Date.now(); addTicket({ id, subject, status: 'open', when: 'just now', dept, msgs: [['me', subject, 'now']] }); setSel(id); toast.success('Ticket opened') }} />
    </>
  )
}

export default function Support() {
  const [tab, setTab] = useState('tickets')
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-6">{[['tickets', 'Tickets'], ['chat', 'Live chat']].map(([v, l]) => <button key={v} onClick={() => setTab(v)} className={cn('flex items-center gap-2 text-[26px] font-semibold tracking-tight transition-colors', tab === v ? 'text-fg' : 'text-white/30 hover:text-white/55')}>{l}{v === 'chat' && <i className="size-2 animate-pulse rounded-full bg-ok" />}</button>)}</div>
      </div>
      {tab === 'tickets' ? <Tickets /> : <LiveChat />}
    </>
  )
}
