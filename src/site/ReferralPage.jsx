import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, Check, Copy, Link2, Pause, Play } from 'lucide-react'
import { Accordion, Button, Segmented, Slider } from '../components/ui.jsx'
import { FormField, inputCls } from '../components/ui2.jsx'
import { AnimatedPrice, DotNum } from '../components/DotViz.jsx'
import { MorphAction } from '../components/MorphAction.jsx'
import { DotText } from '../builder/FxBits.jsx'
import { Decode } from '../studio/kit.jsx'
import { Reveal } from './reveal.jsx'
import ReferralArtwork from './ReferralArtwork.jsx'
import { referralUrl } from './referrals.js'
import { cn, money } from '../lib/utils'
import './referral.css'

const WRAP = 'mx-auto w-full max-w-6xl px-5 md:px-10'
const LABEL = 'font-mono text-[10.5px] uppercase tracking-[.08em] text-dim'
const FAQ = [
  ['Who is this for?', 'Anyone who knows someone who needs hosting. Share Blipmade with your community, recommend it to a client, or include your link in the content you already make.'],
  ['How much do I earn?', 'The standard referral rate is 15% of eligible referred orders. Partner arrangements can earn up to 20%. Your rate is confirmed when you join; the calculator lets you explore both.'],
  ['What do I need to share?', 'Your personal referral link. Put it somewhere useful: a hosting guide, your community’s resources, a video description or a recommendation to a client. Make it clear that you may earn a commission.'],
  ['Do I need to run my own server?', 'No. You can recommend Blipmade without hosting a service yourself. Knowing the product helps you give people a useful, honest recommendation.'],
  ['Are the calculator numbers guaranteed?', 'No. They illustrate the commission on the number and value of eligible paid orders you enter. Actual earnings depend on referred purchases and your confirmed rate.'],
]

function CopyAction({ value, label = 'Copy link' }) {
  const [copied, setCopied] = useState(false), [failed, setFailed] = useState(false)
  return <Button variant="outline" size="sm" onClick={async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setFailed(false) }
    catch { setFailed(true) }
  }}>{copied ? <Check /> : <Copy />}{failed ? 'Select and copy the text' : copied ? 'Copied' : label}</Button>
}

function LinkPreview() {
  const [handle, setHandle] = useState(''), [channel, setChannel] = useState('Community'), [done, setDone] = useState(false)
  const valid = /^[a-z0-9][a-z0-9-]{2,23}$/.test(handle)
  const url = referralUrl(handle || 'your-name')
  const context = { Community: 'A home for our next game night.', Content: 'Looking for a home for your next project?', Clients: 'Hosting for your next website or application.' }[channel]
  const message = `${context} Take a look at Blipmade: ${url}\nAffiliate link: I may earn a commission on eligible purchases.`
  if (done) return <div className="step-in mt-7 space-y-5">
    <div><DotText text="READY TO SHARE." height={22} assemble /><p className="mt-3 text-[13px] text-mute"><Decode text="A good recommendation starts with you." per={16} /></p></div>
    <div className="space-y-3 border-y border-line py-4"><span className={LABEL}>Your link preview</span><p className="break-all select-all font-mono text-[12px] text-fg">{url}</p><CopyAction key={url} value={url} label="Copy preview link" /></div>
    <details className="text-[12px]"><summary className="cursor-pointer text-mute hover:text-fg">A starting point for your post</summary><p className="mt-3 whitespace-pre-line leading-relaxed text-mute">{message}</p><div className="mt-3"><CopyAction key={message} value={message} label="Copy message" /></div></details>
    <p className="text-[11px] leading-relaxed text-dim">Preview only. Create an affiliate account to activate a real referral link. This demo link does not track orders.</p>
    <Link to={'/site/invite?' + url.split('?')[1]} className="inline-flex items-center gap-2 text-[13px] text-mute hover:text-fg">See what your friends will see<ArrowRight className="size-3.5" /></Link>
    <div className="flex flex-wrap items-center gap-4"><Link to="/site/register" className="inline-flex h-11 items-center gap-2 rounded-lg bg-fg px-5 text-[13px] font-medium text-black hover:bg-white/85">Create an account<ArrowRight className="size-4" /></Link><button onClick={() => setDone(false)} className="text-[12px] text-mute hover:text-fg">Edit link</button></div>
  </div>
  return <form className="mt-7 space-y-6" onSubmit={e => { e.preventDefault(); if (valid) setDone(true) }}>
    <FormField label="Your referral handle" hint="3–24 lowercase letters, numbers or hyphens."><input autoComplete="off" name="handle" aria-label="Your referral handle" required minLength={3} maxLength={24} pattern="[a-z0-9][a-z0-9-]{2,23}" placeholder="your-name" value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className={cn(inputCls(), 'text-[16px] sm:text-[13px]')} /></FormField>
    <div><span className="mb-2.5 block text-[13px] text-mute">Where will you share it?</span><Segmented aria-label="Sharing channel" value={channel} onValueChange={v => v && setChannel(v)} options={['Community', 'Content', 'Clients'].map(v => [v, v])} /></div>
    <div className="border-y border-line py-4"><p className={LABEL}>Make a good introduction</p><p className="mt-3 break-all font-mono text-[12px] text-mute">blipmade.com/?ref=<span className="text-fg">{handle || 'your-name'}</span></p></div>
    <Button size="lg" className="w-full" disabled={!valid}>Preview my link<ArrowRight /></Button>
    <p className="text-[11px] leading-relaxed text-dim">Explore the experience first. An affiliate account is needed to activate a referral link and earn commission.</p>
  </form>
}

const Join = ({ label = 'Get your referral link', variant = 'default' }) => <MorphAction label={label} variant={variant} title="Make it yours." description="A personal link. A good recommendation. A share of the orders you bring in.">{() => <LinkPreview />}</MorphAction>

function EarningsCalculator() {
  const [orders, setOrders] = useState(10), [average, setAverage] = useState(50), [rate, setRate] = useState('15')
  const sales = orders * average, earnings = sales * Number(rate) / 100
  return <div className="ref-calculator">
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-[15px] font-medium">Your referral scenario</h3><Segmented aria-label="Commission rate" value={rate} onValueChange={v => v && setRate(v)} options={[[ '15', '15% standard'], ['20', '20% partner']]} /></div>
      <div><div className="mb-4 flex items-center justify-between text-[13px]"><span className="text-mute">Referred orders</span><output className="font-mono tabular-nums" htmlFor="ref-orders">{orders}</output></div><Slider id="ref-orders" aria-label="Referred orders" min={1} max={100} step={1} value={[orders]} onValueChange={v => setOrders(v[0])} /><div className="mt-3 flex justify-between font-mono text-[10px] text-dim"><span>1 order</span><span>100 orders</span></div></div>
      <div><div className="mb-4 flex items-center justify-between text-[13px]"><span className="text-mute">Average order value</span><output className="font-mono tabular-nums" htmlFor="ref-value">{money(average)}</output></div><Slider id="ref-value" aria-label="Average order value in USD" min={10} max={500} step={10} value={[average]} onValueChange={v => setAverage(v[0])} /><div className="mt-3 flex justify-between font-mono text-[10px] text-dim"><span>$10</span><span>$500</span></div></div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5 text-[12px]"><span className="text-dim">Eligible referred order value</span><span className="font-mono text-mute">{orders} × {money(average)} = {money(sales)}</span></div>
    </div>
    <div className="ref-calculator-result">
      <div className={LABEL}>Your potential commission</div>
      <div className="my-6 min-h-14" role="status" aria-live="polite" aria-atomic="true"><AnimatedPrice value={earnings} height={48} /></div>
      <p className="font-mono text-[11px] text-mute">{rate}% of {money(sales)} in orders</p>
      <p className="mt-6 max-w-[275px] text-[12px] leading-relaxed text-dim">An illustration, not a promise. Actual earnings depend on eligible paid orders and your confirmed commission rate.</p>
      <div className="mt-7"><Join label="Make your first introduction" variant="outline" /></div>
    </div>
  </div>
}

export default function ReferralPage() {
  const [paused, setPaused] = useState(false)
  const calculator = useRef(null)
  const explore = () => calculator.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  return <div className="anim-page referral-page">
    <section className="ref-hero">
      <ReferralArtwork paused={paused} />
      <div className="ref-hero-shade" />
      <div className={cn(WRAP, 'ref-hero-content')}>
        <div className={cn(LABEL, 'mb-7 flex items-center gap-2.5')}><i className="size-1.5 rounded-full bg-[var(--brand)]" />The Blipmade referral program</div>
        <h1 className="sr-only">Good words. Real rewards. Earn 15–20% on referred orders.</h1>
        <div aria-hidden className="ref-headline"><DotText text="GOOD WORDS." height={44} assemble /><DotText text="REAL REWARDS." height={44} assemble delay={180} /></div>
        <p className="mt-7 max-w-[365px] text-[15px] leading-relaxed text-mute">You know people building good things.<br />Introduce them to Blipmade. Earn <span className="text-fg">15–20%</span> on the orders you bring our way.</p>
        <div className="mt-8 flex flex-wrap items-center gap-5"><Join /><button onClick={explore} className="inline-flex min-h-11 items-center gap-2 text-[13px] text-mute hover:text-fg">Do the maths<ArrowDown className="size-3.5" /></button></div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[.06em] text-dim">Your recommendation. Your link. Your share.</p>
      </div>
      <div className="ref-art-caption" aria-hidden><span>UP TO</span><span>COMMISSION ON REFERRED ORDERS</span></div>
      <div className={cn(WRAP, 'ref-hero-bottom')}><span className={LABEL}>A good word goes a long way.</span><button aria-label={paused ? 'Play referral animation' : 'Pause referral animation'} onClick={() => setPaused(v => !v)} className="grid size-11 place-items-center rounded-lg text-dim hover:bg-hover hover:text-fg">{paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}</button></div>
    </section>

    <section className={cn(WRAP, 'py-16 md:py-24')} aria-labelledby="ref-how">
      <Reveal className="mb-10 grid gap-5 md:grid-cols-2 md:gap-16"><div><p className={LABEL}>How it works</p><h2 id="ref-how" className="mt-3 text-[30px] font-semibold leading-tight tracking-tight md:text-[38px]">You make the introduction.<br /><span className="text-mute">We take it from there.</span></h2></div><p className="max-w-md self-end text-[14px] leading-relaxed text-mute">For the community admin everyone asks for advice. The creator with a useful tutorial. The developer helping a client find a home. Good recommendations deserve something back.</p></Reveal>
      <ol className="ref-steps">{[[Link2, 'Make it personal.', 'Get your own referral link. One address for the people you send our way.'], [ArrowRight, 'Put in a good word.', 'Share it in a guide, with your community, or with a client who needs hosting.'], [Check, 'Get your share.', 'Earn 15–20% commission on eligible orders placed by the customers you refer.']].map(([I, title, text], i) => <li key={title}><div className="mb-6 flex items-center justify-between"><span className={LABEL}>0{i + 1}</span><I className="size-4 text-dim" strokeWidth={1.5} /></div><h3 className="text-[17px] font-medium tracking-tight">{title}</h3><p className="mt-3 max-w-xs text-[13px] leading-relaxed text-mute">{text}</p></li>)}</ol>
    </section>

    <section ref={calculator} id="referral-calculator" className="scroll-mt-20 border-y border-line bg-black/15">
      <div className={cn(WRAP, 'py-16 md:py-24')}><div className="mb-12 max-w-2xl"><p className={LABEL}>Put a number on it</p><h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-tight md:text-[38px]">A little word of mouth.<br /><span className="text-mute">A meaningful return.</span></h2><p className="mt-4 max-w-lg text-[14px] leading-relaxed text-mute">No guesswork in the maths. Pick an order value, move the slider, and see what your share could look like.</p></div><EarningsCalculator /></div>
    </section>

    <section className={cn(WRAP, 'py-16 md:py-24')} aria-labelledby="ref-rates"><div className="grid gap-8 md:grid-cols-[.85fr_1.15fr] md:gap-20"><div><p className={LABEL}>The commission</p><h2 id="ref-rates" className="mt-3 text-[28px] font-semibold tracking-tight">A fair share.<br />Room for more.</h2><p className="mt-4 max-w-sm text-[13px] leading-relaxed text-mute">Start with a good recommendation. If you have an audience or a bigger partnership in mind, let’s talk.</p></div><div className="border-t border-line">{[['15%', 'Referral', 'The standard rate on eligible orders you refer.'], ['20%', 'Partner', 'Up to 20% for agreed partner arrangements.']].map(([rate, name, desc]) => <div key={name} className="grid grid-cols-[100px_1fr] items-center gap-5 border-b border-line py-7"><DotNum text={rate} height={30} /><div><h3 className="text-[15px] font-medium">{name}</h3><p className="mt-2 text-[12.5px] leading-relaxed text-mute">{desc}</p></div></div>)}<Link to="/site/contact" className="mt-5 inline-flex items-center gap-2 text-[13px] text-mute hover:text-fg">Let’s talk partnerships<ArrowRight className="size-3.5" /></Link></div></div></section>

    <section className="border-t border-line"><div className={cn(WRAP, 'grid gap-8 py-16 md:py-24 lg:grid-cols-[.85fr_1.15fr] lg:gap-20')}><div><p className={LABEL}>Before you share</p><h2 className="mt-3 text-[28px] font-semibold tracking-tight">Good questions.</h2></div><Accordion items={FAQ} /></div></section>
    <section className="ref-final border-t border-line"><div className={cn(WRAP, 'relative flex flex-col items-center py-20 text-center md:py-28')}><span className={LABEL}>Someone you know is building something.</span><h2 className="mt-5 text-[32px] font-semibold leading-tight tracking-tight md:text-[44px]">Be their good recommendation.</h2><p className="mb-8 mt-4 max-w-lg text-[14px] leading-relaxed text-mute">A server, a site, a next big idea. Help them find a home for it — and earn your share.</p><Join /></div></section>
  </div>
}
