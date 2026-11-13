import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Copy, CreditCard, ExternalLink, Gamepad2, Heart, Link2, Pause, Play, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { Accordion, Button, Segmented, Switch } from '../components/ui.jsx'
import { Checkbox, FormField, Select, inputCls } from '../components/ui2.jsx'
import { AnimatedPrice, DotNum } from '../components/DotViz.jsx'
import { MorphAction } from '../components/MorphAction.jsx'
import { Brand } from '../components/logos.jsx'
import { DotText, Orb } from '../builder/FxBits.jsx'
import { Decode, DotRail, StateHero } from '../studio/kit.jsx'
import { useStore } from '../lib/store.jsx'
import { cn, money } from '../lib/utils'
import { GameArtwork } from './GameArtwork.jsx'
import { SUPPORT_GAMES, supportAmount, supportProfileError, supportTotal } from './communitySupport.js'
import './support.css'

const WRAP = 'mx-auto w-full max-w-6xl px-5 md:px-10'
const LABEL = 'font-mono text-[10.5px] uppercase tracking-[.08em] text-dim'
const supportRoute = profile => '/site/support/' + profile.slug
const demoUrl = profile => `${location.origin}${location.pathname}#${supportRoute(profile)}`

function ShareButton({ profile, label = 'Copy page link' }) {
  const [copied, setCopied] = useState(false)
  return <Button variant="outline" onClick={async () => {
    try { await navigator.clipboard.writeText(demoUrl(profile)); setCopied(true) }
    catch { toast.error('Copy the page address from the preview link.') }
  }}>{copied ? <Check /> : <Copy />}{copied ? 'Copied' : label}</Button>
}

function SupportPayment({ profile, contribution, close }) {
  const { addSupportContribution, balance } = useStore()
  const [method, setMethod] = useState('card'), [phase, setPhase] = useState('review')
  const locked = useRef(false), timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const pay = () => {
    if (locked.current) return
    locked.current = true; setPhase('processing')
    timer.current = setTimeout(() => {
      addSupportContribution({ ...contribution, id: crypto.randomUUID(), when: 'Just now · demo' })
      setPhase('done')
    }, 1400)
  }
  if (phase === 'done') return <div className="step-in mt-6">
    <div className="support-thanks"><StateHero role="game" state="happy" word="THANK YOU." sub={`A little more room for the good times. ${profile.name} says thanks.`} /></div>
    <div className="border-y border-line py-4 text-center"><p className={LABEL}>Added to the owner’s demo service balance</p><div className="mt-3"><DotNum text={money(contribution.amountCents / 100)} height={30} animate /></div><p className="mt-3 text-[12px] text-mute">New Blipmade balance: {money(balance)}</p></div>
    <p className="mt-4 text-center text-[11px] leading-relaxed text-dim">No money was charged. This contribution and the balance update are simulated.</p>
    <Button className="mt-6 w-full" size="lg" onClick={close}>Back to the community<Heart /></Button>
  </div>
  if (phase === 'processing') return <div className="py-10" role="status"><StateHero role="game" state="thinking" word="A LITTLE LOVE." sub="Adding your contribution to the demo balance…" /><DotRail value={.6} n={24} className="justify-center" /><p className="mt-5 text-center font-mono text-[10px] uppercase text-dim">Simulating · no real payment</p></div>
  return <div className="step-in mt-7 space-y-6">
    <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl border border-line-2 text-mute"><Gamepad2 className="size-5" /></span><div><p className="text-[14px] font-medium">{profile.name}</p><p className="mt-1 text-[11px] text-dim">Service credit for @{profile.owner}</p></div></div>
    <dl className="divide-y divide-line border-y border-line text-[13px]">{[['Contribution', money(contribution.amountCents / 100)], ['Frequency', 'One time'], ['Support wall', contribution.public ? contribution.name || 'Anonymous' : 'Anonymous'], ['Destination', 'Owner’s Blipmade service balance']].map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-3"><dt className="text-dim">{k}</dt><dd className="max-w-[240px] text-right text-mute">{v}</dd></div>)}</dl>
    <div><span className="mb-3 block text-[13px] text-mute">Payment preview</span><Segmented aria-label="Support payment method preview" value={method} onValueChange={v => v && setMethod(v)} options={[[ 'card', <span key="c" className="flex items-center gap-2"><CreditCard className="size-3.5" />Card</span>], ['paypal', 'PayPal']]} /><p className="mt-3 text-[11px] leading-relaxed text-dim">Demo checkout. No card details are collected and no payment is taken.</p></div>
    <Button size="lg" className="w-full" onClick={pay}>Simulate {money(contribution.amountCents / 100)} contribution<Heart /></Button>
  </div>
}

function ContributionPanel({ profile }) {
  const [preset, setPreset] = useState(1000), [custom, setCustom] = useState(''), [isCustom, setIsCustom] = useState(false)
  const [name, setName] = useState(''), [message, setMessage] = useState(''), [showPublic, setShowPublic] = useState(false)
  const amountCents = isCustom ? supportAmount(custom) : preset
  const invalid = isCustom && custom !== '' && amountCents === null
  return <section className="support-contribution" aria-labelledby="support-contribute">
    <div className="flex items-center justify-between"><span className={LABEL}>A little support goes a long way</span><Heart className="size-4 text-mute" strokeWidth={1.5} /></div>
    <h2 id="support-contribute" className="mt-4 text-[23px] font-semibold tracking-tight">Keep the good times going.</h2>
    <p className="mt-3 text-[13px] leading-relaxed text-mute">Your contribution goes to the owner’s Blipmade balance, ready to put towards hosting services.</p>
    {!profile.accepting ? <div className="mt-7 border-y border-line py-8 text-center"><Orb state="waiting" role="game" size={48} className="mx-auto" /><h3 className="mt-4 text-base font-medium">Taking a little pause.</h3><p className="mt-2 text-[12px] text-mute">This community isn’t accepting contributions right now.</p></div> : <>
      <div role="group" aria-label="Choose a contribution" className="mt-6 grid grid-cols-4 gap-2">{[500, 1000, 2000, 5000].map(value => <button key={value} aria-pressed={!isCustom && preset === value} onClick={() => { setPreset(value); setIsCustom(false) }} className={cn('h-11 rounded-lg border font-mono text-[13px] transition-colors', !isCustom && preset === value ? 'border-fg/70 bg-fg text-black' : 'border-line-2 text-mute hover:border-white/30 hover:text-fg')}>${value / 100}</button>)}</div>
      <div className="mt-3"><button onClick={() => setIsCustom(v => !v)} aria-expanded={isCustom} className="min-h-8 text-[12px] text-mute hover:text-fg">{isCustom ? 'Use a suggested amount' : 'Choose your own amount'}</button>{isCustom && <div className="step-in mt-2"><label className="sr-only" htmlFor="support-amount">Custom contribution in USD</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-dim">$</span><input id="support-amount" inputMode="decimal" value={custom} onChange={e => setCustom(e.target.value)} placeholder="1.00–1,000.00" aria-invalid={invalid || undefined} aria-describedby="support-amount-hint" className={cn(inputCls(invalid), 'pl-7 text-[16px]')} /></div><p id="support-amount-hint" className={cn('mt-2 text-[11px]', invalid ? 'text-bad' : 'text-dim')}>{invalid ? 'Enter $1–$1,000 with no more than two decimal places.' : 'One-time contribution in USD.'}</p></div>}</div>
      <div className="mt-5 space-y-4"><div><label htmlFor="support-name" className="mb-2 block text-[12px] text-mute">Your name <span className="text-dim">· optional</span></label><input id="support-name" value={name} onChange={e => setName(e.target.value)} maxLength={40} placeholder="A friend from the server" className={cn(inputCls(), 'text-[16px] sm:text-[13px]')} /></div><div><label htmlFor="support-message" className="mb-2 block text-[12px] text-mute">Leave a little message <span className="text-dim">· optional</span></label><textarea id="support-message" value={message} onChange={e => setMessage(e.target.value)} maxLength={160} rows={2} placeholder="See you at spawn." className={cn(inputCls(), 'h-auto resize-y py-2 text-[16px] sm:text-[13px]')} /></div><label className="flex cursor-pointer items-start gap-2.5 text-[11.5px] leading-relaxed text-mute"><Checkbox checked={showPublic} onCheckedChange={v => setShowPublic(v === true)} className="mt-0.5" />Show my name and message on the support wall.</label></div>
      <div className="mt-6 border-t border-line pt-5"><div className="mb-5 flex items-end justify-between"><span className="text-[12px] text-dim">One-time contribution</span><AnimatedPrice value={(amountCents || 0) / 100} height={29} showDelta={false} /></div><div className="[&>button]:w-full"><MorphAction label={`Continue${amountCents ? ' · ' + money(amountCents / 100) : ''}`} title="You’re backing something good." description="A little contribution, made for a community you care about." closeLabel="Close contribution checkout" disabled={!amountCents}>{close => <SupportPayment profile={profile} close={close} contribution={{ amountCents, name: name.trim(), message: message.trim(), public: showPublic }} />}</MorphAction></div><p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[.04em] text-dim">Service credit · One time · Demo checkout</p></div>
    </>}
  </section>
}

const FAQ = [
  ['Where does my contribution go?', 'It is added to the server owner’s Blipmade service balance, which they can use for Blipmade hosting services. It is service credit rather than a payment to their personal bank account.'],
  ['Is this a recurring payment?', 'No. Contributions on this page are one time. You choose an amount and review it before continuing.'],
  ['Can I stay anonymous?', 'Yes. Public sharing is off by default. Unless you select the support-wall option, your name and message are only visible to the owner in this demo.'],
  ['Will this demo charge me?', 'No. This BM3 page is a working interface prototype. Checkout, the service-balance update and the supporter activity are simulated.'],
]

export function PublicSupportPage({ slug }) {
  const { supportProfile: profile, supportEntries } = useStore()
  const [paused, setPaused] = useState(false)
  const form = useRef(null), [formVisible, setFormVisible] = useState(false)
  useEffect(() => {
    if (!form.current) return
    const observer = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting && entry.intersectionRatio >= .35), { threshold: .35 })
    observer.observe(form.current)
    return () => observer.disconnect()
  }, [slug])
  const total = supportTotal(supportEntries), progress = Math.min(1, total / profile.goalCents)
  if (slug !== profile.slug && slug !== 'preview') return <div className="flex h-full flex-col items-center justify-center gap-5 bg-bg px-5 text-center"><Orb role="game" state="waiting" size={64} /><h1 className="text-2xl font-semibold">This community page isn’t here.</h1><p className="text-sm text-mute">The link may have changed. Check the address with the server owner.</p><Link to="/site/support" className="text-sm underline underline-offset-4">Community support at Blipmade</Link></div>
  return <div className="support-public h-full overflow-y-auto bg-bg">
    <header className="border-b border-line"><div className={cn(WRAP, 'flex h-16 items-center justify-between gap-4')}><Link to="/site" aria-label="Blipmade home"><Brand height={12} /></Link><Link to="/site/support" className="inline-flex items-center gap-2 text-[12px] text-mute hover:text-fg">For server owners<ArrowRight className="size-3.5" /></Link></div></header>
    <div className="support-stage"><div className="support-world"><GameArtwork id={profile.game} paused={paused} /></div><div className="support-stage-shade" />
      <main className={cn(WRAP, 'relative grid items-start gap-12 py-10 md:py-16 lg:grid-cols-[1fr_400px] lg:gap-20')}>
        <div className="support-intro"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl border border-line-2 bg-bg/80"><Gamepad2 className="size-5 text-mute" /></span><div><h1 className="text-[18px] font-semibold tracking-tight">{profile.name}</h1><p className="mt-1 font-mono text-[9px] uppercase tracking-[.06em] text-dim">{SUPPORT_GAMES.find(([id]) => id === profile.game)?.[1]} <span className="px-1">/</span> By @{profile.owner}</p></div></div>
          <div aria-hidden className="support-headline mt-10"><DotText text="KEEP OUR" height={43} assemble /><DotText text="WORLD ONLINE." height={43} assemble delay={180} /></div>
          <p className="mt-7 max-w-[415px] whitespace-pre-line text-[14px] leading-[1.85] text-mute">{profile.story}</p>
          {profile.showGoal && <div className="mt-10 max-w-[415px] border-t border-line-2 pt-5"><div className="flex items-center justify-between gap-3"><p className="text-[12px] text-mute">{profile.goalLabel}</p><Heart className={cn('size-3.5', progress >= 1 ? 'text-ok' : 'text-dim')} /></div><div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-2"><DotNum text={money(total / 100)} height={30} /><span className="pb-1 font-mono text-[11px] text-dim">of {money(profile.goalCents / 100)}</span></div><div className="mt-5"><DotRail n={28} value={progress} state={progress >= 1 ? 'ok' : 'idle'} /></div><p className="mt-3 text-[11px] text-dim">{progress >= 1 ? 'Goal reached. Look what we did together.' : `${Math.round(progress * 100)}% funded · every little bit helps.`}</p></div>}
          <div className="mt-7 flex flex-wrap items-center gap-3"><ShareButton profile={profile} label="Share this community" /><button aria-label={paused ? 'Play server artwork' : 'Pause server artwork'} onClick={() => setPaused(v => !v)} className="grid size-10 place-items-center rounded-lg text-dim hover:bg-hover hover:text-fg">{paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}</button></div>
        </div>
        <div ref={form}><ContributionPanel profile={profile} /></div>
      </main>
    </div>
    <div className={cn(WRAP, 'grid gap-12 border-t border-line py-12 md:py-16 lg:grid-cols-[1fr_400px] lg:gap-20')}>
      {profile.showSupporters ? <section><p className={LABEL}>A world doesn’t build itself</p><h2 className="mt-3 text-[25px] font-semibold tracking-tight">Good people. Good company.</h2><p className="mt-3 text-[12px] text-dim">A little thank-you to the people keeping it going. Demo activity.</p><ul className="mt-6 divide-y divide-line border-y border-line">{supportEntries.slice(0, 8).map(entry => <li key={entry.id} className="flex items-start gap-3 py-4"><span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-2 font-mono text-[10px] text-dim">{entry.public && entry.name ? entry.name[0].toUpperCase() : <Heart className="size-3.5" />}</span><div className="min-w-0 flex-1"><p className="text-[13px] font-medium">{entry.public && entry.name ? entry.name : 'A quiet supporter'}</p>{entry.public && entry.message && <p className="mt-1.5 break-words text-[12px] leading-relaxed text-mute">{entry.message}</p>}<p className="mt-1.5 font-mono text-[9px] text-dim">{entry.when}</p></div><span className="pt-1 font-mono text-[12px] text-mute">{money(entry.amountCents / 100)}</span></li>)}</ul></section> : <section><Heart className="size-5 text-dim" /><h2 className="mt-4 text-xl font-semibold">A little support. A lasting world.</h2><p className="mt-3 max-w-md text-[13px] leading-relaxed text-mute">This community keeps its supporter activity private. Contributions still help keep its next chapter online.</p></section>}
      <section><p className={LABEL}>Before you send a little love</p><h2 className="mb-5 mt-3 text-[25px] font-semibold tracking-tight">Good questions.</h2><Accordion items={FAQ} size="sm" /></section>
    </div>
    <footer className="border-t border-line"><div className={cn(WRAP, 'flex flex-wrap items-center justify-between gap-4 py-6 text-[11px] text-dim')}><span className="flex items-center gap-2">A community page, powered by <Link to="/site" className="text-mute hover:text-fg">Blipmade</Link></span><div className="flex gap-5"><Link to="/site/legal/terms" className="hover:text-fg">Terms</Link><Link to="/site/legal/privacy" className="hover:text-fg">Privacy</Link><Link to="/site/contact" className="hover:text-fg">Contact</Link></div></div></footer>
    {profile.accepting && !formVisible && <div className="support-mobile-action"><div className="min-w-0"><p className="truncate text-[12px] font-medium">{profile.name}</p><p className="mt-1 text-[10px] text-dim">A little help with hosting.</p></div><Button onClick={() => form.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })}>Support this server<Heart /></Button></div>}
  </div>
}

export function SupportOwnerPage() {
  const { supportProfile: profile, patchSupportProfile, supportEntries, balance } = useStore()
  const [draft, setDraft] = useState(profile), [goal, setGoal] = useState(String(profile.goalCents / 100)), [error, setError] = useState('')
  const set = patch => setDraft(p => ({ ...p, ...patch }))
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile) || goal !== String(profile.goalCents / 100)
  const save = e => {
    e.preventDefault()
    const next = { ...draft, name: draft.name.trim(), story: draft.story.trim(), slug: draft.slug.trim(), goalLabel: draft.goalLabel.trim(), goalCents: supportAmount(goal, 1000000) || 0 }
    const problem = supportProfileError(next)
    if (problem) { setError(problem); return }
    patchSupportProfile(next); setDraft(next); setGoal(String(next.goalCents / 100)); setError(''); toast.success('Saved in this demo browser', { description: 'Your page is ready to preview. Real publishing and payments need the backend.' })
  }
  return <div className={cn(WRAP, 'anim-page py-12 md:py-16')}>
    <div className="flex flex-wrap items-start justify-between gap-5"><div><p className={LABEL}>Community support / Owner workspace</p><h1 className="mt-3 text-[34px] font-semibold leading-tight tracking-tight md:text-[44px]">Built by you.<br /><span className="text-mute">Kept going together.</span></h1><p className="mt-5 max-w-xl text-[14px] leading-relaxed text-mute">Give your community a simple way to help with hosting. One shareable page. Contributions go straight to your Blipmade service balance.</p></div><Link to={supportRoute(profile)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line-2 px-4 text-[13px] text-mute hover:bg-hover hover:text-fg">Open public page<ExternalLink className="size-3.5" /></Link></div>
    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_350px] lg:gap-16">
      <form onSubmit={save} className="min-w-0 space-y-8">
        <section className="space-y-5 border-t border-line pt-6"><h2 className="text-[17px] font-semibold">Make it feel like your server.</h2><div className="grid gap-5 sm:grid-cols-2"><FormField label="Server name"><input aria-label="Server name" maxLength={48} required value={draft.name} onChange={e => set({ name: e.target.value })} className={cn(inputCls(), 'text-[16px] sm:text-[13px]')} /></FormField><div><label className="mb-1.5 block text-[12.5px] font-medium text-fg/85">Game</label><Select value={draft.game} onValueChange={game => set({ game })} options={SUPPORT_GAMES} /></div></div><FormField label="Your page address" hint="3–30 lowercase letters, numbers or hyphens."><div className="flex items-center gap-2 rounded-lg border border-line-2 px-3"><span className="shrink-0 font-mono text-[11px] text-dim">/support/</span><input aria-label="Support page handle" maxLength={30} required value={draft.slug} onChange={e => set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className="h-10 min-w-0 flex-1 bg-transparent font-mono text-[13px] outline-none" /></div></FormField><FormField label="A note for your community" hint={`${draft.story.length} / 480 characters`}><textarea aria-label="Community introduction" maxLength={480} rows={4} value={draft.story} onChange={e => set({ story: e.target.value })} className={cn(inputCls(), 'h-auto resize-y py-3 text-[16px] sm:text-[13px]')} /></FormField></section>
        <section className="space-y-5 border-t border-line pt-6"><h2 className="text-[17px] font-semibold">Something to work towards.</h2><div className="grid gap-5 sm:grid-cols-[1fr_140px]"><FormField label="Goal name"><input aria-label="Goal name" maxLength={60} value={draft.goalLabel} onChange={e => set({ goalLabel: e.target.value })} className={cn(inputCls(), 'text-[16px] sm:text-[13px]')} /></FormField><FormField label="Goal in USD"><input aria-label="Support goal in USD" inputMode="decimal" value={goal} onChange={e => setGoal(e.target.value)} className={cn(inputCls(), 'font-mono text-[16px] sm:text-[13px]')} /></FormField></div><div className="divide-y divide-line">{[['accepting', 'Accept contributions', 'Pause the contribution form whenever you need.'], ['showGoal', 'Show the goal', 'Let people see what their support is helping with.'], ['showSupporters', 'Show the support wall', 'Names and messages are public only when supporters opt in.']].map(([key, title, note]) => <label key={key} className="flex cursor-pointer items-center justify-between gap-5 py-4"><span><span className="block text-[13px]">{title}</span><span className="mt-1 block text-[11.5px] leading-relaxed text-dim">{note}</span></span><Switch aria-label={title} checked={draft[key]} onCheckedChange={value => set({ [key]: value })} /></label>)}</div></section>
        {error && <p role="alert" className="text-[12px] text-bad">{error}</p>}<div className="flex flex-wrap items-center gap-4 border-t border-line pt-5"><Button size="lg" disabled={!dirty}>Save demo page<Check /></Button>{dirty && <button type="button" className="text-[12px] text-mute hover:text-fg" onClick={() => { setDraft(profile); setGoal(String(profile.goalCents / 100)); setError('') }}>Discard changes</button>}<p className="text-[11px] text-dim">Settings stay in this browser. Payments are simulated.</p></div>
      </form>
      <aside className="space-y-7 lg:sticky lg:top-24"><div className="support-owner-preview"><span className={LABEL}>Your community page</span><div className="mt-6"><Orb role="game" state="idle" size={62} /></div><h2 className="mt-5 break-words text-xl font-semibold tracking-tight">{draft.name || 'Your server'}</h2><p className="mt-2 text-[12px] text-dim">By @{profile.owner}</p><p className="mt-5 line-clamp-4 whitespace-pre-line text-[12px] leading-relaxed text-mute">{draft.story || 'A note from you to the people who make the server feel like home.'}</p><div className="mt-6 flex gap-2">{[5, 10, 20].map(n => <span key={n} className="flex-1 rounded-lg border border-line-2 py-2 text-center font-mono text-[12px] text-mute">${n}</span>)}</div><div className="mt-5 flex items-center gap-2 font-mono text-[10px] text-dim"><Link2 className="size-3.5 shrink-0" /><span className="truncate">blipmade.com/support/{draft.slug || 'your-server'}</span></div></div>
        <div className="space-y-4 border-y border-line py-6"><span className={LABEL}>Share your saved demo page</span><ShareButton key={profile.slug} profile={profile} /><p className="text-[11px] leading-relaxed text-dim">The copied link opens this BM3 preview. Production payments and publishing are not connected.</p></div><div><span className={LABEL}>Your Blipmade service balance</span><div className="mt-3"><DotNum text={money(balance)} height={30} /></div><p className="mt-3 text-[12px] text-dim">{money(supportTotal(supportEntries) / 100)} from community support in this demo.</p><Link to="/billing" className="mt-4 inline-flex items-center gap-2 text-[12px] text-mute hover:text-fg">View billing<ArrowRight className="size-3.5" /></Link></div>
      </aside>
    </div>
    <section className="mt-14 border-t border-line pt-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className={LABEL}>A little love, accounted for</p><h2 className="mt-3 text-[23px] font-semibold tracking-tight">Community contributions.</h2></div><span className="flex items-center gap-2 text-[11px] text-dim"><Wallet className="size-3.5" />Demo ledger · service credit</span></div><ul className="mt-6 divide-y divide-line border-y border-line">{supportEntries.map(entry => <li key={entry.id} className="grid grid-cols-[1fr_auto] gap-4 py-4"><div><p className="text-[13px] font-medium">{entry.name || 'Anonymous supporter'}<span className="ml-2 font-mono text-[9px] font-normal uppercase text-dim">{entry.public ? 'Public' : 'Private'}</span></p>{entry.message && <p className="mt-1.5 break-words text-[12px] text-mute">{entry.message}</p>}<p className="mt-2 font-mono text-[9px] text-dim">{entry.when}</p></div><div className="text-right"><p className="font-mono text-[13px]">+{money(entry.amountCents / 100)}</p><p className="mt-2 text-[10px] text-dim">Added as service credit</p></div></li>)}</ul></section>
  </div>
}
