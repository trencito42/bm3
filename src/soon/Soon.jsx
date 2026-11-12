/* Coming soon and pre-registration.
   /soon            the page: a dot-matrix headline that glitches, the Blips waiting, one button
   the button       becomes the form in the middle of the screen (the same morph as the chat launcher, centred):
                    name + email or a social account, then "check your inbox"
   /soon/password   where the link in the email lands: choose a password, then "you are in"
   Everything is simulated. `?s=` forces a state so each one can be reviewed: form, sent, exists, social, in (page); expired, used, done (password). */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Mail, RotateCcw, X } from 'lucide-react'
import { Brand } from '../components/logos.jsx'
import { Button } from '../components/ui.jsx'
import { FormField, InlineAlert, PasswordInput, inputCls } from '../components/ui2.jsx'
import { DotField, DotText, Orb } from '../builder/FxBits.jsx'
import { Decode, DotRail } from '../studio/kit.jsx'
import { cn } from '../lib/utils'
import './soon.css'

const WORDS = ['YOUR WEBSITE.', 'YOUR APP.', 'YOUR GAME SERVER.', 'YOUR SERVER.']
const validEmail = (v) => /^\S+@\S+\.\S+$/.test(v.trim())
const calm = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const useQuery = () => { const { search } = useLocation(); return useMemo(() => new URLSearchParams(search), [search]) }

/* dot-matrix text with the glitch: the real word, and a red copy of it that flashes out of register */
function Glitch({ text, height, assemble = true, className }) {
  return (
    <span className={cn('gl', className)} aria-hidden>
      <span className="gl-main inline-flex max-w-full"><DotText text={text} height={height} assemble={assemble} /></span>
      <span className="gl-ghost inline-flex max-w-full"><DotText text={text} height={height} /></span>
    </span>
  )
}

/* ------------------------------------------------------------ the form inside the shell ------------------------------------------------------------ */
const PROVIDERS = [['google', 'Google', 'G'], ['github', 'GitHub', 'GH'], ['discord', 'Discord', 'D']]
function Panel({ step, setStep, data, setData, onClose, base, firstField }) {
  const nav = useNavigate()
  const [touched, setTouched] = useState({}), [busy, setBusy] = useState(false), [wait, setWait] = useState(0), [prov, setProv] = useState(null)
  const t = useRef(0)
  useEffect(() => () => clearTimeout(t.current), [])
  useEffect(() => { if (wait <= 0) return; const i = setTimeout(() => setWait((w) => w - 1), 1000); return () => clearTimeout(i) }, [wait])
  const err = { name: data.name.trim().length < 2 && 'Tell us what to call you', email: !validEmail(data.email) && 'Enter a valid email address' }
  const show = (k) => (touched[k] ? err[k] || undefined : undefined)
  const submit = (e) => {
    e.preventDefault(); setTouched({ name: true, email: true })
    if (busy || err.name || err.email) return
    setBusy(true)
    t.current = setTimeout(() => { setBusy(false); if (/taken|exists/.test(data.email)) setStep('exists'); else { setStep('sent'); setWait(30) } }, 1100)
  }
  const social = (id) => { setProv(id); setStep('social'); t.current = setTimeout(() => setStep('in'), 1500) }
  const Head = ({ title, sub, back }) => (
    <div className="mb-5 flex items-start gap-3 pr-8">
      {back && <button type="button" onClick={back} aria-label="Back" className="-ml-1 mt-0.5 grid size-7 shrink-0 place-items-center rounded-md text-dim outline-none transition-colors hover:bg-hover hover:text-fg focus-visible:bg-hover"><ArrowLeft className="size-4" /></button>}
      <div className="min-w-0"><h2 id="pre-title" className="text-[18px] font-semibold tracking-tight">{title}</h2>{sub && <p className="mt-1 text-[13px] leading-relaxed text-mute">{sub}</p>}</div>
    </div>
  )
  return (
    <div className="relative p-6 sm:p-7">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid size-8 place-items-center rounded-md text-dim outline-none transition-colors hover:bg-hover hover:text-fg focus-visible:bg-hover"><X className="size-4" /></button>

      {step === 'form' && (
        <div key="form" className="pre-step">
          <div className="mb-5 flex items-center gap-3 pr-8"><Orb size={38} role="chat" state="idle" /><div><h2 id="pre-title" className="text-[18px] font-semibold tracking-tight">Pre-register</h2><p className="text-[13px] text-mute">Your account, ready the day we open.</p></div></div>
          <div className="grid grid-cols-3 gap-2">{PROVIDERS.map(([id, n, g]) => <button key={id} type="button" onClick={() => social(id)} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-line-2 text-[13px] font-medium outline-none transition-[border-color,background-color] duration-150 hover:border-white/30 hover:bg-white/[0.04] focus-visible:border-white/50 active:bg-white/[0.08]"><span aria-hidden className="grid h-5 min-w-5 place-items-center rounded bg-fg px-1 font-mono text-[9.5px] font-semibold text-black">{g}</span><span className="max-[380px]:sr-only">{n}</span></button>)}</div>
          <div className="my-5 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[.1em] text-dim"><span className="h-px flex-1 bg-line" />or with email<span className="h-px flex-1 bg-line" /></div>
          <form onSubmit={submit} noValidate className="space-y-4">
            <FormField label="Name" error={show('name')}><input ref={firstField} value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} onBlur={() => setTouched((o) => ({ ...o, name: true }))} autoComplete="name" aria-invalid={!!show('name') || undefined} className={cn(inputCls(!!show('name')), 'text-[16px] sm:text-[13.5px]')} /></FormField>
            <FormField label="Email" error={show('email')}><input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} onBlur={() => setTouched((o) => ({ ...o, email: true }))} autoComplete="email" placeholder="you@example.com" aria-invalid={!!show('email') || undefined} className={cn(inputCls(!!show('email')), 'text-[16px] sm:text-[13.5px]')} /></FormField>
            <Button type="submit" size="lg" className="w-full" loading={busy}>Pre-register<ArrowRight /></Button>
            <p className="text-center text-[12px] leading-relaxed text-dim">We send one email with a link to choose your password. Nothing to pay. By continuing you accept the terms and the privacy policy.</p>
          </form>
        </div>
      )}

      {step === 'sent' && (
        <div key="sent" className="pre-step flex flex-col items-center text-center" role="status">
          <Orb size={64} role="chat" state="happy" />
          <div className="mt-5"><DotText text="CHECK YOUR INBOX." height={22} assemble /></div>
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-mute"><Decode per={12} text={`We sent a link to ${data.email || 'your address'}. Open it to choose your password.`} /></p>
          <div className="mt-6 w-full space-y-2">
            <Button className="w-full" variant="outline" onClick={() => nav(`${base}/password?email=${encodeURIComponent(data.email)}&name=${encodeURIComponent(data.name)}`)}><Mail />Open the link (demo)</Button>
            <Button className="w-full" variant="ghost" disabled={wait > 0} onClick={() => setWait(30)}><RotateCcw />{wait > 0 ? `Send again in 0:${String(wait).padStart(2, '0')}` : 'Send it again'}</Button>
          </div>
          <button type="button" onClick={() => setStep('form')} className="mt-4 text-[12.5px] text-dim underline-offset-4 outline-none hover:text-fg hover:underline focus-visible:text-fg">Wrong address? Change it</button>
        </div>
      )}

      {step === 'exists' && (
        <div key="exists" className="pre-step">
          <Head title="You are already on the list" sub={`${data.email || 'This address'} pre-registered earlier.`} back={() => setStep('form')} />
          <InlineAlert tone="info" title="Did not get the email?">We can send the link again. It replaces the old one.</InlineAlert>
          <div className="mt-5 flex gap-2"><Button className="flex-1" onClick={() => { setStep('sent'); setWait(30) }}>Send the link again</Button><Button variant="outline" onClick={() => setStep('form')}>Use another email</Button></div>
        </div>
      )}

      {step === 'social' && (
        <div key="social" className="pre-step flex flex-col items-center py-6 text-center" role="status">
          <Orb size={56} role="chat" state="thinking" />
          <p className="mt-5 font-mono text-[12px] uppercase tracking-[.1em] text-mute"><Decode text={`Connecting to ${PROVIDERS.find((p) => p[0] === prov)?.[1] || 'your account'}…`} /></p>
          <div className="mt-4"><DotRail n={22} value={0.5} state="run" /></div>
        </div>
      )}

      {step === 'in' && (
        <div key="in" className="pre-step flex flex-col items-center text-center" role="status">
          <Orb size={64} role="chat" state="happy" />
          <div className="mt-5"><DotText text="YOU ARE IN." height={24} assemble /></div>
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-mute"><Decode per={12} text="No password needed: you will sign in with the same account. We email you the day we open." /></p>
          <Button className="mt-6 w-full" onClick={onClose}>Done</Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ the button that becomes the form ------------------------------------------------------------ */
function PreRegister({ base, initial, onOpenChange }) {
  const btn = useRef(null), inner = useRef(null), first = useRef(null)
  const [phase, setPhase] = useState('idle')                       // idle | from | open | closing
  const [rect, setRect] = useState(null)                           // where the button is, at the moment the shell leaves or returns
  const [h, setH] = useState(460)
  const [vp, setVp] = useState(() => ({ w: typeof innerWidth !== 'undefined' ? innerWidth : 1200, h: typeof innerHeight !== 'undefined' ? innerHeight : 800 }))
  const [step, setStep] = useState('form')
  const [data, setData] = useState({ name: '', email: '' })
  const t = useRef(0)
  const open = phase === 'open'
  const busy = phase !== 'idle'

  useEffect(() => { const f = () => setVp({ w: innerWidth, h: innerHeight }); addEventListener('resize', f); return () => { removeEventListener('resize', f); clearTimeout(t.current) } }, [])
  /* the panel has its natural height; the shell follows it, so a step that is taller or shorter makes the shell glide to the new size */
  useLayoutEffect(() => { const el = inner.current; if (!el) return; const ro = new ResizeObserver(() => setH(el.offsetHeight)); ro.observe(el); setH(el.offsetHeight); return () => ro.disconnect() }, [])
  useEffect(() => { onOpenChange?.(busy) }, [busy, onOpenChange])

  const doOpen = useCallback((s = 'form') => {
    const r = btn.current?.getBoundingClientRect(); if (!r) return
    setStep(s); setRect(r); setPhase('from')
    /* a timer, not an animation frame: frames do not run in a background tab, and the form must still open there */
    t.current = setTimeout(() => { setPhase('open'); t.current = setTimeout(() => first.current?.focus({ preventScroll: true }), calm() ? 0 : 320) }, 34)
  }, [])
  const doClose = useCallback(() => {
    const r = btn.current?.getBoundingClientRect(); if (r) setRect(r)
    setPhase('closing')
    t.current = setTimeout(() => setPhase('idle'), calm() ? 0 : 330)
  }, [])
  /* focus goes back to the button once it is visible again (it cannot take focus while hidden) */
  const wasOpen = useRef(false)
  useEffect(() => { if (phase === 'open') wasOpen.current = true; else if (phase === 'idle' && wasOpen.current) { wasOpen.current = false; const f = setTimeout(() => btn.current?.focus({ preventScroll: true }), 60); return () => clearTimeout(f) } }, [phase])   // after the page behind stops being inert
  useEffect(() => { if (initial) { const i = setTimeout(() => doOpen(initial), 500); return () => clearTimeout(i) } }, [initial, doOpen])
  useEffect(() => { if (!open) return; const k = (e) => { if (e.key === 'Escape') doClose() }; addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [open, doClose])

  const W = Math.min(440, vp.w - 24), H = Math.min(h, vp.h - 24)
  const target = { left: (vp.w - W) / 2, top: Math.max(12, (vp.h - H) / 2), width: W, height: H, borderRadius: 22 }
  const home = rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, borderRadius: rect.height / 2 } : target
  const style = open ? target : home

  return (
    <>
      <Button ref={btn} size="lg" onClick={() => doOpen('form')} aria-haspopup="dialog" aria-expanded={open} className={cn('h-12 rounded-full px-7 text-[15px]', busy && 'invisible')}>Pre-register<ArrowRight /></Button>
      {typeof document !== 'undefined' && createPortal(
        <>
          <div aria-hidden onClick={() => open && doClose()} className={cn('pre-back fixed inset-0 z-[64] bg-black/65', open ? 'opacity-100 backdrop-blur-[5px]' : 'pointer-events-none opacity-0 backdrop-blur-0')} />
          <div role="dialog" aria-modal="true" aria-labelledby="pre-title" data-phase={phase}
            className={cn('pre-shell fixed z-[65] overflow-hidden border', busy ? '' : 'pointer-events-none invisible', 'bg-[#121214]', open ? 'border-line-2 shadow-[0_30px_90px_rgba(0,0,0,.7)]' : 'border-transparent')}
            style={style}>
            {/* the button's own face (white, with its label) rides along and fades as the shell leaves; the dark panel is underneath from the start,
                so the text of the form never sits on a half-way colour */}
            <span aria-hidden className={cn('pre-label absolute inset-0 z-10 flex items-center justify-center gap-2 whitespace-nowrap bg-fg text-[15px] font-medium text-black', open ? 'pointer-events-none opacity-0' : 'opacity-100')}>Pre-register<ArrowRight className="size-4" /></span>
            {/* the form at its final size, centred, revealed by the growing shell */}
            <div className="pre-panel absolute left-1/2 top-0 max-h-full -translate-x-1/2 overflow-y-auto overscroll-contain" style={{ width: W, maxHeight: vp.h - 24, opacity: open ? 1 : 0, transitionDelay: open && !calm() ? '170ms' : '0ms' }} inert={!open}>
              <div ref={inner}><Panel step={step} setStep={setStep} data={data} setData={setData} onClose={doClose} base={base} firstField={first} /></div>
            </div>
          </div>
        </>, document.body)}
    </>
  )
}

/* ------------------------------------------------------------ the page ------------------------------------------------------------ */
const BOOT = ['> building blipmade', '> hosting: websites, apps, game servers, vps', '> data: european union', '> doors: closed', '> pre-registration: open']
function BootLog() {
  const [n, setN] = useState(calm() ? BOOT.length : 0)
  useEffect(() => { if (n >= BOOT.length) return; const t = setTimeout(() => setN((x) => x + 1), n === 0 ? 900 : 620); return () => clearTimeout(t) }, [n])
  return (
    <div aria-hidden className="mx-auto w-full max-w-md rounded-xl border border-line bg-black/50 p-4 text-left font-mono text-[11.5px] leading-6 text-mute backdrop-blur-sm">
      {BOOT.slice(0, n).map((l, i) => <div key={l} className={cn(i === BOOT.length - 1 && 'text-ok')}><Decode text={l} per={10} />{i === n - 1 && <span className="soon-cursor" />}</div>)}
      {n === 0 && <div><span className="soon-cursor" /></div>}
    </div>
  )
}
function Cast({ paused }) {
  const [on, setOn] = useState(0)
  useEffect(() => { if (paused || calm()) return; const t = setInterval(() => setOn((x) => (x + 1) % 4), 2200); return () => clearInterval(t) }, [paused])
  return <div className="soon-cast flex items-end justify-center gap-4 sm:gap-6">{['chat', 'builder', 'dev', 'game'].map((r, i) => <span key={r} data-on={on === i || undefined} className={cn(on === i ? 'opacity-100' : 'opacity-70')}><Orb size={44} role={r} state={on === i ? 'thinking' : 'idle'} /></span>)}</div>
}

function ComingSoon({ base }) {
  const q = useQuery()
  const [w, setW] = useState(0), [modal, setModal] = useState(false)
  useEffect(() => { if (modal || calm()) return; const t = setInterval(() => { if (!document.hidden) setW((x) => (x + 1) % WORDS.length) }, 3400); return () => clearInterval(t) }, [modal])
  return (
    <div className="relative flex min-h-full flex-col overflow-x-hidden bg-bg">
      <DotField className="pointer-events-none absolute inset-0 size-full" pitch={34} glyphs strength={0.55} />
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,13,15,.2)_0%,rgba(13,13,15,.92)_70%)]" />
      <div inert={modal} className="relative flex min-h-full flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between px-5 md:px-10"><Brand height={13} /><span className="flex items-center gap-2 rounded-full border border-line-2 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[.1em] text-mute"><i className="size-1.5 animate-pulse rounded-full bg-[var(--brand)]" />Opening soon</span></header>

        <main className="flex flex-1 flex-col items-center justify-center gap-9 px-5 py-10 text-center md:gap-11">
          <h1 className="sr-only">Blipmade is coming soon. Pre-register to have your account ready on the day we open.</h1>
          <div className="anim-rise font-mono text-[10.5px] uppercase tracking-[.16em] text-dim" style={{ '--i': 0 }}>Hosting for everything you put online</div>
          <div className="anim-rise flex max-w-full flex-col items-center gap-3 md:gap-4" style={{ '--i': 1 }}>
            <div className="flex h-[30px] max-w-full items-center justify-center sm:h-[46px] md:h-[58px]"><span className="hidden md:inline-flex"><Glitch key={w} text={WORDS[w]} height={58} /></span><span className="hidden sm:inline-flex md:hidden"><Glitch key={w} text={WORDS[w]} height={46} /></span><span className="inline-flex sm:hidden"><Glitch key={w} text={WORDS[w]} height={26} /></span></div>
            <div className="flex max-w-full justify-center text-mute"><span className="hidden md:inline-flex"><DotText text="COMING SOON." height={58} /></span><span className="hidden sm:inline-flex md:hidden"><DotText text="COMING SOON." height={46} /></span><span className="inline-flex sm:hidden"><DotText text="COMING SOON." height={26} /></span></div>
          </div>
          <p className="anim-rise max-w-md text-[15.5px] leading-relaxed text-mute" style={{ '--i': 2 }}>We are getting the last things ready. Pre-register now and your account is waiting for you the moment the doors open.</p>
          <div className="anim-rise flex flex-col items-center gap-4" style={{ '--i': 3 }}>
            <PreRegister base={base} initial={q.get('s')} onOpenChange={setModal} />
            <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-dim">Nothing to pay · one email · leave any time</span>
          </div>
          <div className="anim-rise" style={{ '--i': 4 }}><Cast paused={modal} /></div>
          <div className="anim-rise w-full" style={{ '--i': 5 }}><BootLog /></div>
        </main>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-5 py-5 text-[12px] text-dim md:px-10"><span>© 2026 Blipmade</span><span className="flex gap-5"><a href="#/site/legal/terms" className="hover:text-fg">Terms</a><a href="#/site/legal/privacy" className="hover:text-fg">Privacy</a><a href="#/site/contact" className="hover:text-fg">Contact</a></span></footer>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ choose a password ------------------------------------------------------------ */
const RULES = [['At least 12 characters', (p) => p.length >= 12], ['A number', (p) => /\d/.test(p)], ['A capital letter or a symbol', (p) => /[A-Z]|[^A-Za-z0-9]/.test(p)]]
function PasswordPage({ base }) {
  const q = useQuery(), nav = useNavigate()
  const email = q.get('email') || 'stefan@example.com', name = (q.get('name') || 'Stefan').split(' ')[0]
  const [state, setState] = useState(q.get('s') || 'form')         // form | done | expired | used
  const [p, setP] = useState(''), [c, setC] = useState(''), [touched, setTouched] = useState(false), [busy, setBusy] = useState(false), [sent, setSent] = useState(false)
  const t = useRef(0)
  useEffect(() => () => clearTimeout(t.current), [])
  const passed = RULES.map(([, f]) => f(p)), score = passed.filter(Boolean).length + (p.length >= 16 ? 1 : 0)
  const ok = passed.every(Boolean), match = p === c
  const submit = (e) => { e.preventDefault(); setTouched(true); if (!ok || !match || busy) return; setBusy(true); t.current = setTimeout(() => { setBusy(false); setState('done') }, 1200) }
  const typing = p.length > 0 && state === 'form'
  return (
    <div className="relative flex min-h-full flex-col overflow-x-hidden bg-bg">
      <DotField className="pointer-events-none absolute inset-0 size-full" pitch={34} glyphs strength={0.5} />
      <header className="relative flex h-16 shrink-0 items-center justify-between px-5 md:px-10"><button type="button" onClick={() => nav(base)} className="rounded outline-none focus-visible:ring-2 focus-visible:ring-white/30" aria-label="Blipmade, back to the page"><Brand height={13} /></button><span className="font-mono text-[10.5px] uppercase tracking-[.1em] text-dim">Step 2 of 2</span></header>
      <main className="relative grid flex-1 place-items-center px-5 py-10">
        <div className="relative w-full max-w-sm">
          <span aria-hidden className="absolute -inset-10 bg-black/80 backdrop-blur-[10px] [mask-image:radial-gradient(closest-side,#000_62%,transparent)]" />
          <div key={state} className="pre-step relative rounded-2xl border border-line-2 bg-card p-7 shadow-2xl shadow-black/60">
            {state === 'form' && (
              <form onSubmit={submit} noValidate>
                <div className="mb-6 flex items-center gap-3"><Orb size={40} role="chat" state={busy ? 'thinking' : 'idle'} /><div><h1 className="text-[18px] font-semibold tracking-tight">Choose your password, {name}</h1><p className="text-[12.5px] text-dim">{email}</p></div></div>
                <div className="space-y-4">
                  <FormField label="Password"><PasswordInput autoFocus autoComplete="new-password" value={p} onChange={(e) => setP(e.target.value)} className="text-[16px] sm:text-[13.5px]" aria-describedby="pw-rules" /></FormField>
                  <div id="pw-rules" className="space-y-3">
                    <div className="flex items-center gap-3"><DotRail n={20} value={Math.min(1, score / 4)} state={score >= 3 ? 'ok' : 'idle'} className="flex-1" /><span className={cn('w-14 text-right font-mono text-[10.5px] uppercase tracking-[.06em]', score >= 3 ? 'text-ok' : 'text-dim')}>{!typing ? '' : score >= 4 ? 'strong' : score === 3 ? 'good' : 'weak'}</span></div>
                    <ul className="space-y-1.5">{RULES.map(([l], i) => <li key={l} className={cn('flex items-center gap-2 text-[12.5px] transition-colors duration-200', passed[i] ? 'text-fg' : touched ? 'text-bad' : 'text-dim')}><span className={cn('grid size-4 place-items-center rounded-full border transition-colors duration-200', passed[i] ? 'border-ok bg-ok text-black' : 'border-line-2')}>{passed[i] && <Check className="size-3" strokeWidth={3} />}</span>{l}</li>)}</ul>
                  </div>
                  <FormField label="Once more" error={touched && !match ? 'The two passwords are different' : undefined}><PasswordInput autoComplete="new-password" value={c} onChange={(e) => setC(e.target.value)} className="text-[16px] sm:text-[13.5px]" /></FormField>
                  <Button type="submit" size="lg" className="w-full" loading={busy}>Save and finish</Button>
                </div>
              </form>
            )}
            {state === 'done' && (
              <div className="flex flex-col items-center py-2 text-center" role="status">
                <Orb size={72} role="chat" state="happy" />
                <div className="mt-6"><Glitch text="YOU ARE IN." height={26} /></div>
                <p className="mt-4 text-[14px] leading-relaxed text-mute"><Decode per={12} text={`That is everything, ${name}. We email ${email} the day we open, and you sign in with this password.`} /></p>
                <Button className="mt-6 w-full" onClick={() => nav(base)}>Back to the page</Button>
              </div>
            )}
            {(state === 'expired' || state === 'used') && (
              <div className="flex flex-col items-center py-2 text-center">
                <Orb size={64} role="chat" state="waiting" />
                <div className="mt-6 [&_circle]:!fill-[var(--color-warn)]"><DotText text={state === 'expired' ? 'LINK EXPIRED.' : 'ALREADY USED.'} height={22} assemble /></div>
                <p className="mt-4 text-[14px] leading-relaxed text-mute">{state === 'expired' ? 'Links work for 24 hours. We can send a fresh one to the same address.' : 'This link already set a password. If that was not you, send a new link and choose another.'}</p>
                {sent ? <div className="mt-5 w-full"><InlineAlert tone="ok" title="Sent">Check {email}.</InlineAlert></div> : <Button className="mt-6 w-full" onClick={() => setSent(true)}><Mail />Send a new link</Button>}
                <button onClick={() => nav(base)} className="mt-4 text-[12.5px] text-dim underline-offset-4 outline-none hover:text-fg hover:underline focus-visible:text-fg">Back to the page</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SoonApp({ base = '/soon' }) {
  const { pathname } = useLocation()
  return pathname.slice(base.length).startsWith('/password') ? <PasswordPage base={base} /> : <ComingSoon base={base} />
}
