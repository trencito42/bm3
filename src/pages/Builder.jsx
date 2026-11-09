import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ArrowUp, Check, Monitor, Rocket, Smartphone } from 'lucide-react'
import * as TabsP from '@radix-ui/react-tabs'
import * as ToggleP from '@radix-ui/react-toggle-group'
import { Button, Dialog, DialogContent } from '../components/ui.jsx'
import { DotBar, DotField, DotText, Orb, fx } from '../builder/FxBits.jsx'
import { useStore } from '../lib/store.jsx'
import { cn, sleep } from '../lib/utils'

const IDEAS = ['A bakery in Porto with online booking', 'Photographer portfolio with a gallery', 'Handmade candle shop with pricing', 'SaaS landing page, add FAQ']
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const hl = (src) =>
  esc(src)
    .replace(/(&lt;!--.*?--&gt;)/g, '<span style="color:#71717a">$1</span>')
    .replace(/(&lt;\/?[a-z0-9]+)/gi, '<span style="color:#ff9a4a">$1</span>')
    .replace(/\b(id|lang|charset)=/g, '<span style="color:#5fd4ff">$1</span>=')

export default function Builder() {
  const F = fx()
  const { addService, services } = useStore()
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [plan, setPlan] = useState(null)
  const [mobile, setMobile] = useState(false)
  const [tab, setTab] = useState('preview')
  const [code, setCode] = useState('')
  const [pub, setPub] = useState({ open: false, p: 0, done: false })
  const [headOrb, setHeadOrb] = useState('idle')
  const [mview, setMview] = useState('chat')

  const msRef = useRef(null)
  const boxRef = useRef(null)
  const frameRef = useRef(null)
  const prevRef = useRef(null)
  const fieldRef = useRef(null)
  const endRef = useRef(null)
  const taRef = useRef(null)
  const planRef = useRef(null)
  planRef.current = plan

  /* scale the 1000px mini-site into its frame */
  const refit = useCallback(() => {
    const box = boxRef.current, ms = msRef.current
    if (!box || !ms) return
    const s = box.clientWidth / (mobile ? 390 : 1000)
    ms.style.transformOrigin = '0 0'
    ms.style.transform = `scale(${s})`
    box.style.height = Math.max(380, Math.round(ms.offsetHeight * s)) + 'px'
  }, [mobile])
  useLayoutEffect(() => {
    msRef.current?.classList.toggle('m', mobile)
    refit()
    const t = setTimeout(refit, 520)
    return () => clearTimeout(t)
  }, [mobile, plan, refit])
  useEffect(() => {
    if (!frameRef.current) return
    const ro = new ResizeObserver(refit)
    ro.observe(frameRef.current)
    ro.observe(msRef.current)
    return () => ro.disconnect()
  }, [plan, refit])
  /* Follow the stream only while the reader is at the bottom. Direct scrollTop writes (no smooth scroll) because
     streaming updates every ~16 ms and chained smooth scrolls make the thread shake. */
  const stick = useRef(true)
  useEffect(() => {
    const el = endRef.current?.parentElement
    if (!el) return
    const onScroll = () => { stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80 }
    /* user intent wins immediately: scrolling up / touching releases the follow before the next stream tick */
    const release = (e) => { if (!e || e.type !== 'wheel' || e.deltaY < 0) stick.current = false }
    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('wheel', release, { passive: true })
    el.addEventListener('touchstart', release, { passive: true })
    return () => { el.removeEventListener('scroll', onScroll); el.removeEventListener('wheel', release); el.removeEventListener('touchstart', release) }
  }, [])
  useEffect(() => { const el = endRef.current?.parentElement; if (el && stick.current) el.scrollTop = el.scrollHeight }, [msgs])
  useEffect(() => {
    const t = taRef.current
    if (t) { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 140) + 'px' }
  }, [input])

  const upd = (id, patch) => setMsgs((m) => m.map((x) => (x.id === id ? { ...x, ...(typeof patch === 'function' ? patch(x) : patch) } : x)))
  const stream = async (id, key, text) => {
    for (let i = 2; i < text.length; i += 2) { upd(id, { [key]: text.slice(0, i) }); await sleep(16) }
    upd(id, { [key]: text })
  }
  const lightSection = (sid, on) => msRef.current?.querySelector(`[data-sec="${sid}"]`)?.classList.toggle('hl', on)

  const submit = async (override) => {
    const text = (override ?? input).trim()
    if (!text || busy) return
    setBusy(true); setInput(''); stick.current = true
    const uid = Date.now(), aid = uid + 1
    setMsgs((m) => [...m, { id: uid, role: 'u', text }, { id: aid, role: 'a', text: '', text2: '', orb: 'thinking', chips: null }])
    await sleep(900)

    if (!planRef.current) {
      const p = F.plan(text)
      setHeadOrb('thinking')
      upd(aid, { orb: 'speaking' })
      await stream(aid, 'text', F.reply(p))
      upd(aid, { orb: 'thinking' })
      const S = F.sections(p)
      upd(aid, { chips: S.map((s) => ({ id: s.id, label: s.label, st: 'idle' })) })
      setPlan(p)
      if (window.innerWidth < 768) setMview('preview')
      await sleep(80)
      const ms = msRef.current
      F.applyTheme(ms, p)
      for (let i = 1; i <= S.length; i++) {
        upd(aid, (x) => ({ chips: x.chips.map((c, k) => (k === i - 1 ? { ...c, st: 'run' } : c)) }))
        F.renderSite(ms, p, i)
        refit()
        setCode(F.siteSource({ ...p, sections: p.sections.slice(0, i) }))
        ms.lastElementChild?.scrollIntoView({ block: 'end', behavior: 'smooth' })
        const r = prevRef.current?.getBoundingClientRect()
        if (r) fieldRef.current?.pulse(r.width * 0.5, r.height * (0.2 + 0.6 * (i / S.length)))
        await sleep(720)
        upd(aid, (x) => ({ chips: x.chips.map((c, k) => (k === i - 1 ? { ...c, st: 'on' } : c)) }))
      }
      fieldRef.current?.pulse(-1e4, -1e4)
      upd(aid, { orb: 'speaking' })
      await stream(aid, 'text2', 'Done. It is live in the preview. Hover a chip to find its section, switch to mobile, or ask for changes.')
      upd(aid, { orb: 'happy' }); setHeadOrb('happy')
      setTimeout(() => { upd(aid, { orb: 'idle' }); setHeadOrb('idle') }, 2200)
    } else {
      const r = F.edit(planRef.current, text)
      if (!r) {
        upd(aid, { orb: 'speaking' })
        await stream(aid, 'text', 'Try: “make it dark”, “accent green”, “add pricing”, “remove the gallery”, “use a serif”.')
        upd(aid, { orb: 'idle' })
      } else {
        upd(aid, { orb: 'speaking' })
        await stream(aid, 'text', `Done. I ${r.note}.`)
        setPlan(r.plan)
        const S = F.renderSite(msRef.current, r.plan)
        refit(); setCode(F.siteSource(r.plan))
        upd(aid, { chips: S.map((s) => ({ id: s.id, label: s.label, st: 'on' })), orb: 'happy' })
        setTimeout(() => upd(aid, { orb: 'idle' }), 1800)
      }
    }
    setBusy(false)
  }

  const publish = async () => {
    setPub({ open: true, p: 0, done: false })
    for (let i = 1; i <= 20; i++) { setPub((s) => ({ ...s, p: i / 20 })); await sleep(90) }
    setPub((s) => ({ ...s, done: true }))
    addService({ id: 'site-' + (services.length + 1), name: planRef.current.slug + '.blipmade.app', type: 'Website', icon: 'globe', ip: 'edge', region: 'Global CDN', status: 'running', cpu: 2, ram: 8, disk: 3, price: 0, due: '—' })
    toast.success('Site published')
  }

  const empty = msgs.length === 0

  return (
    <div className="grid h-full grid-cols-1 bg-black md:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
      {/* -------------------------------- chat -------------------------------- */}
      <section className={cn('min-h-0 flex-col border-r border-white/10', mview === 'preview' ? 'hidden md:flex' : 'flex')}>
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/10 px-5">
          <Orb size={26} state={headOrb} />
          <DotText text="BLIPMADE" height={12} />
          <span className="text-xs font-medium text-white/55">Site builder</span>
          <div className="ml-auto flex rounded-lg border border-white/12 p-0.5 md:hidden">{[['chat', 'Chat'], ['preview', 'Preview']].map(([v, l]) => <button key={v} onClick={() => setMview(v)} className={cn('h-7 rounded-md px-2.5 text-[12px] transition-colors', mview === v ? 'bg-white text-black' : 'text-white/60')}>{l}</button>)}</div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
          {empty ? (
            <div className="my-auto flex flex-col items-start gap-5">
              <Orb size={64} state="idle" />
              <DotText text="DESCRIBE IT" height={28} assemble />
              <p className="max-w-xs text-[14.5px] leading-relaxed text-white/70">Tell me what you are making. I will build it on the right, section by section, while you watch.</p>
              <div className="flex flex-col items-start gap-2">
                {IDEAS.map((t) => (
                  <button key={t} onClick={() => submit(t)} className="rounded-full border border-white/12 px-3.5 py-1.5 text-left text-[12.5px] text-white/75 transition-colors hover:border-white/35 hover:bg-white/5 hover:text-white">{t}</button>
                ))}
              </div>
            </div>
          ) : (
            msgs.map((m) =>
              m.role === 'u' ? (
                <div key={m.id} className="rise ml-auto max-w-[88%] rounded-2xl rounded-br-sm border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-[14px] leading-relaxed">{m.text}</div>
              ) : (
                <div key={m.id} className="rise flex gap-3">
                  <Orb size={28} state={m.orb} className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1 text-[14px] leading-relaxed text-white/95">
                    {m.text && <p>{m.text}</p>}
                    {m.chips && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {m.chips.map((c) => (
                          <span key={c.id} onMouseEnter={() => lightSection(c.id, true)} onMouseLeave={() => lightSection(c.id, false)} className={cn('inline-flex h-7 cursor-default items-center gap-1.5 rounded-full border px-2.5 text-xs transition-all', c.st === 'on' ? 'border-white/35 text-white' : c.st === 'run' ? 'border-white/20 text-white/80' : 'border-white/12 text-white/45')}>
                            <i className={cn('size-1.5 rounded-full', c.st === 'on' ? 'bg-white' : c.st === 'run' ? 'animate-pulse bg-[#ff2d36]' : 'bg-white/20')} />
                            {c.label}
                          </span>
                        ))}
                      </div>
                    )}
                    {m.text2 && <p className="mt-3">{m.text2}</p>}
                  </div>
                </div>
              )
            )
          )}
          <div ref={endRef} />
        </div>

        <div className="shrink-0 border-t border-white/10 p-3.5">
          <form onSubmit={(e) => { e.preventDefault(); submit() }} className="flex items-end gap-2 rounded-xl border border-white/20 bg-black p-2 pl-3.5 transition-colors focus-within:border-white/70">
            <textarea ref={taRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }} placeholder={plan ? 'Ask for a change…' : 'Describe your site…'} aria-label="Message" className="max-h-36 flex-1 resize-none bg-transparent py-1.5 text-[14px] outline-none placeholder:text-white/35" />
            <button type="submit" disabled={!input.trim() || busy} aria-label="Send" className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-black transition-colors disabled:bg-white/10 disabled:text-white/35"><ArrowUp className="size-4" /></button>
          </form>
          {plan && !busy && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {['Make it dark', 'Accent green', 'Add pricing', 'Add a FAQ', 'Use a serif'].map((t) => (
                <button key={t} onClick={() => submit(t)} className="rounded-full border border-white/12 px-2.5 py-1 text-[11.5px] text-white/60 transition-colors hover:border-white/35 hover:text-white">{t}</button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------- preview -------------------------------- */}
      <TabsP.Root value={tab} onValueChange={setTab} className={cn('min-h-0 min-w-0 flex-col md:flex', mview === 'preview' ? 'flex' : 'hidden')}>
        <div className="relative z-10 flex h-14 shrink-0 items-center gap-3 overflow-x-auto border-b border-white/10 bg-black/60 px-3 backdrop-blur-md sm:px-5">
          <button onClick={() => setMview('chat')} className="shrink-0 text-[12.5px] text-white/60 md:hidden">← Chat</button>
          <TabsP.List className="flex rounded-lg border border-white/12 p-0.5">
            {[['preview', 'Preview'], ['code', 'Code']].map(([v, l]) => (
              <TabsP.Trigger key={v} value={v} className="h-7 rounded-md px-3 text-[12.5px] text-white/55 transition-colors hover:text-white data-[state=active]:bg-white data-[state=active]:text-black">{l}</TabsP.Trigger>
            ))}
          </TabsP.List>
          <div className="mx-auto hidden h-8 w-full max-w-sm items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-white/12 font-mono text-[11.5px] text-white/55 xl:flex">
            <i className={cn('size-1.5 rounded-full', pub.done ? 'bg-[#7dffb0] shadow-[0_0_8px_#7dffb0]' : 'bg-white/20')} />
            <span><b className="font-normal text-white">{plan?.slug || 'your-site'}</b>.blipmade.app</span>
          </div>
          <div className="flex-1 xl:hidden" />
          <ToggleP.Root type="single" value={mobile ? 'm' : 'd'} onValueChange={(v) => v && setMobile(v === 'm')} className="flex rounded-lg border border-white/12 p-0.5">
            <ToggleP.Item value="d" aria-label="Desktop" className="grid size-7 place-items-center rounded-md text-white/55 data-[state=on]:bg-white/12 data-[state=on]:text-white"><Monitor className="size-3.5" /></ToggleP.Item>
            <ToggleP.Item value="m" aria-label="Mobile" className="grid size-7 place-items-center rounded-md text-white/55 data-[state=on]:bg-white/12 data-[state=on]:text-white"><Smartphone className="size-3.5" /></ToggleP.Item>
          </ToggleP.Root>
          <Button size="sm" disabled={!plan || busy || msgs.length === 0} onClick={publish}><Rocket />Publish</Button>
        </div>

        <div ref={prevRef} className="relative min-h-0 flex-1 overflow-hidden">
          <DotField ref={fieldRef} className="pointer-events-none absolute inset-0 size-full" pitch={22} />
          {!plan && (
            <div className="pointer-events-none absolute inset-0 z-[1] grid place-items-center">
              <div className="relative isolate flex flex-col items-center gap-5 p-10 text-center">
                <span className="absolute -inset-16 -z-10 bg-black/85 backdrop-blur-[10px] [mask-image:radial-gradient(closest-side,#000_62%,transparent)]" />
                <DotText text="NOTHING YET" height={34} ghost animate />
                <p className="max-w-[260px] text-sm text-white/55">Your preview appears here. Hover the grid.</p>
              </div>
            </div>
          )}
          <TabsP.Content value="preview" forceMount className={cn('absolute inset-0 z-[2] overflow-auto p-6', (tab !== 'preview' || !plan) && 'hidden')}>
            <div ref={frameRef} className={cn('relative mx-auto overflow-hidden rounded-xl border border-white/12 bg-black shadow-2xl shadow-black/60 transition-[max-width] duration-500', mobile ? 'max-w-[390px]' : 'max-w-[1000px]')}>
              <div ref={boxRef} className="relative overflow-hidden"><div ref={msRef} className="ms absolute left-0 top-0" /></div>
            </div>
          </TabsP.Content>
          <TabsP.Content value="code" className="absolute inset-0 z-[3] overflow-auto bg-black p-6 font-mono text-[12.5px] leading-7 text-white/75">
            {code ? <pre dangerouslySetInnerHTML={{ __html: hl(code) }} /> : <span className="text-white/35">// nothing generated yet</span>}
          </TabsP.Content>
        </div>
      </TabsP.Root>

      <Dialog open={pub.open} onOpenChange={(o) => pub.done && setPub((s) => ({ ...s, open: o }))}>
        <DialogContent title={pub.done ? 'Your site is live' : 'Publishing…'} description={plan ? `${plan.slug}.blipmade.app` : ''}>
          <div className="grid place-items-center gap-6 py-6">
            <Orb size={72} state={pub.done ? 'happy' : 'thinking'} />
            {pub.done ? (
              <>
                <DotText text="LIVE" height={36} assemble />
                <Button className="w-full" onClick={() => setPub((s) => ({ ...s, open: false }))}><Check />Done</Button>
              </>
            ) : (
              <DotBar value={pub.p} n={28} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
