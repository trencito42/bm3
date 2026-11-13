import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowDown, ArrowRight, Check, Code2, Gamepad2, Globe, Link2, Pause, Play, Server, Database, Mail } from 'lucide-react'
import { Accordion, Segmented } from '../components/ui.jsx'
import { DotText, DotField, Orb } from '../builder/FxBits.jsx'
import { DotNum } from '../components/DotViz.jsx'
import { Decode } from '../studio/kit.jsx'
import { GameArtwork } from './GameArtwork.jsx'
import { GAMES } from './gamesData.js'
import { APPS, priceOf } from './appsData.js'
import { CATALOG } from '../lib/mock.js'
import { readReferral, referralPath } from './referrals.js'
import { cn, money } from '../lib/utils'
import './invitation.css'

const WRAP = 'mx-auto w-full max-w-6xl px-5 md:px-10'
const LABEL = 'font-mono text-[10.5px] uppercase tracking-[.08em] text-dim'
const OPTIONS = {
  all: { label: 'All hosting', I: Server, lines: ['GOOD COMPANY.', 'GREAT HOSTING.'], intro: 'Your next website, app, game server or VPS. One home for everything you put online, recommended by someone you know.', action: 'Explore Blipmade', to: '/site/products', title: 'What will you put online?', role: 'chat', benefits: ['Websites, apps and more', 'One control panel', 'Resources you choose', 'Help when you need it'] },
  games: { label: 'Game night', I: Gamepad2, lines: ['GOOD COMPANY.', 'GREAT SERVERS.'], intro: 'A home for your next game night. Your world, your mods, and the people who make it worth logging in.', action: 'Find your game', to: '/site/games', title: 'What are we playing?', role: 'game', benefits: ['Your mods and plugins', 'Daily world backups', 'Console in your browser', 'Resources you can resize'] },
  apps: { label: 'Next project', I: Code2, lines: ['YOUR NEXT IDEA.', 'ONLINE TODAY.'], intro: 'A home for the thing you’re building. Pick an app, a database or a runtime, and take it from your laptop to the world.', action: 'Explore the apps', to: '/site/apps', title: 'What are you building?', role: 'dev', benefits: ['Your choice of runtime', 'Persistent storage', 'Logs in your browser', 'Resources you can resize'] },
  sites: { label: 'A new website', I: Globe, lines: ['A GOOD PLACE.', 'TO START.'], intro: 'A home for your next website. Bring your code, move an existing site, or start something new with the builder.', action: 'See hosting plans', to: '/site/products/web', title: 'Make yourself at home.', role: 'builder', benefits: ['HTTPS included', 'Daily backups', 'Your own domain', 'One control panel'] },
}
const FAQ = [
  ['What is Blipmade?', 'Hosting for websites, applications, VPS, game servers, databases and business email, with domains and one client area to manage it all. Choose what you want to run and the resources it needs.'],
  ['What does the referral mean?', 'Someone shared their personal link with you. They may earn a commission on eligible orders you place. This invitation does not itself add a discount or credit.'],
  ['Can I explore before choosing a plan?', 'Yes. Browse the games, apps and hosting plans, and try their configurators before creating an account.'],
  ['Can I bring something I already run?', 'You can upload an existing game world, deploy your application or move a website. Contact us if you want help planning a migration.'],
]

export default function InvitationPage() {
  const { search } = useLocation()
  const referral = readReferral(search, window.location.search)
  const [picked, setPicked] = useState(null), [paused, setPaused] = useState(false)
  const intent = picked || referral?.intent || 'all'
  const option = OPTIONS[intent], lineup = useRef(null)
  const to = path => referralPath(path, referral ? { ...referral, intent } : null)
  const name = referral?.handle
  const browse = () => lineup.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  const allHosting = [
    { ...CATALOG.find(c => c.id === 'web'), I: Globe },
    { id: 'apps', name: 'Applications', from: 3.2, blurb: 'Your code, your runtime. Apps and tools, ready to deploy.', to: '/site/apps', I: Code2 },
    { ...CATALOG.find(c => c.id === 'vps'), I: Server },
    { ...CATALOG.find(c => c.id === 'game'), from: Math.min(...GAMES.filter(g => !g.soon).map(g => priceOf(g, g.ram[0], 10, false))), to: '/site/games', I: Gamepad2 },
    { ...CATALOG.find(c => c.id === 'db'), I: Database },
    { ...CATALOG.find(c => c.id === 'mail'), I: Mail },
    { ...CATALOG.find(c => c.id === 'dom'), from: null, I: Globe },
  ].map(c => ({ ...c, tagline: c.blurb, to: c.to || '/site/products/' + c.id }))
  const rows = intent === 'all' ? allHosting : intent === 'games' ? ['minecraft', 'cs2', 'rust'].map(id => GAMES.find(g => g.id === id)) : intent === 'apps' ? ['node', 'docker', 'postgres'].map(id => APPS.find(a => a.id === id)) : [
    { id: 'web', name: 'Web hosting', tagline: 'Bring your website. We’ll give it a home.', from: 4, to: '/site/products/web' },
    { id: 'builder', name: 'Site builder', tagline: 'Describe your idea and build from there.', to: '/site/register' },
    { id: 'move', name: 'Move an existing site', tagline: 'A fresh start, with help planning the move.', to: '/site/contact' },
  ]
  return <div className="anim-page invitation-page">
    <section className="invite-hero">
      {intent === 'games' ? <div className="invite-world"><GameArtwork id="minecraft" paused={paused} /></div> : <><DotField className="pointer-events-none absolute inset-0 size-full" pitch={28} glyphs strength={.5} /><div className="invite-blip" aria-hidden><Orb size={164} role={option.role} state={paused ? 'waiting' : 'idle'} /></div></>}
      <div className="invite-shade" />
      <div className={cn(WRAP, 'invite-copy')}>
        <div className="mb-7 flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full border border-line-2 bg-card font-mono text-[12px] text-mute">{name ? name[0].toUpperCase() : <Link2 className="size-4" />}</span><div><span className={cn(LABEL, 'block !text-[9px]')}>A good recommendation</span><span className="mt-1 block text-[13px] text-mute">{name ? <>From <b className="font-medium text-fg">@{name}</b> to you.</> : 'You’re in good company.'}</span></div></div>
        <h1 className="sr-only">{name ? `Invited by ${name}. ` : ''}{option.lines.join(' ')}</h1>
        <div key={intent} aria-hidden className="invite-headline"><DotText text={option.lines[0]} height={42} assemble /><DotText text={option.lines[1]} height={42} assemble delay={150} /></div>
        <p className="mt-7 max-w-[365px] text-[15px] leading-relaxed text-mute"><Decode text={option.intro} per={7} /></p>
        <div className="mt-8 flex flex-wrap items-center gap-5"><Link to={to(option.to)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-fg px-5 text-[13px] font-medium text-black hover:bg-white/85">{option.action}<ArrowRight className="size-4" /></Link><button onClick={browse} className="inline-flex min-h-11 items-center gap-2 text-[13px] text-mute hover:text-fg">Take a look around<ArrowDown className="size-3.5" /></button></div>
        <p className="mt-6 max-w-[365px] text-[11px] leading-relaxed text-dim">{name ? <>Affiliate invitation: @{name} may earn a commission on eligible purchases.</> : 'Explore the hosting, find your fit, make it yours.'}</p>
      </div>
      <div className={cn(WRAP, 'invite-controls')}><div className="max-w-full overflow-x-auto"><Segmented aria-label="What brings you here" value={intent} onValueChange={v => v && setPicked(v)} options={Object.entries(OPTIONS).map(([id, o]) => [id, <span key={id} className="flex items-center gap-2"><o.I className="size-3.5" />{o.label}</span>])} /></div>{intent === 'games' && <button aria-label={paused ? 'Play invitation animation' : 'Pause invitation animation'} onClick={() => setPaused(v => !v)} className="grid size-11 shrink-0 place-items-center rounded-lg text-dim hover:bg-hover hover:text-fg">{paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}</button>}</div>
    </section>

    <div className="border-b border-line"><ul className={cn(WRAP, 'grid grid-cols-2 gap-x-5 gap-y-4 py-6 text-[12px] text-mute md:grid-cols-4')}>{option.benefits.map(t => <li key={t} className="flex items-center gap-2"><Check className="size-3.5 shrink-0 text-dim" />{t}</li>)}</ul></div>

    <section ref={lineup} className={cn(WRAP, 'scroll-mt-20 py-16 md:py-24')}><p className={LABEL}>Your next thing starts here</p><div className="mt-3 flex flex-wrap items-end justify-between gap-5"><h2 className="text-[30px] font-semibold tracking-tight md:text-[38px]">{option.title}</h2><Link to={to(option.to)} className="inline-flex items-center gap-2 text-[13px] text-mute hover:text-fg">{option.action}<ArrowRight className="size-3.5" /></Link></div>
      <ul key={intent} className="anim-page mt-8 border-t border-line">{rows.map(row => {
        const Icon = row.I || option.I
        return <li key={row.id}><Link to={to(row.to || `${intent === 'games' ? '/site/games/' : '/site/apps/'}${row.id}`)} className="invite-product group">
          <div className="flex items-center gap-4"><Icon className="size-5 shrink-0 text-dim" strokeWidth={1.5} /><div><h3 className="text-[15px] font-medium">{row.name}</h3><p className="mt-1.5 text-[12px] leading-relaxed text-dim">{row.tagline}</p></div></div>
          <div className="flex items-center gap-6">{(row.ram || row.from) && <div><span className="mb-2 block font-mono text-[9px] uppercase text-dim">From / month</span><DotNum height={20} text={money(row.ram ? priceOf(row, row.ram[0], 10, false) : row.from)} /></div>}<ArrowRight className="size-4 shrink-0 text-dim transition-transform group-hover:translate-x-1 group-hover:text-fg" /></div>
        </Link></li>
      })}</ul>
      <p className="mt-5 text-[12px] text-dim">Start with what you need. Change the resources when your project grows.</p>
    </section>

    <section className="border-y border-line"><div className={cn(WRAP, 'grid gap-8 py-16 md:py-24 lg:grid-cols-[.85fr_1.15fr] lg:gap-20')}><div><p className={LABEL}>Make yourself at home</p><h2 className="mt-3 text-[28px] font-semibold tracking-tight">A few things to know.</h2><Link to={to('/site/contact')} className="mt-5 inline-flex items-center gap-2 text-[13px] text-mute hover:text-fg">Talk to us<ArrowRight className="size-3.5" /></Link></div><Accordion items={FAQ} /></div></section>
    <section className={cn(WRAP, 'flex flex-col items-start justify-between gap-6 py-16 sm:flex-row sm:items-center')}><div><p className={LABEL}>{name ? `Introduced by @${name}. Hosted by Blipmade.` : 'A home for what comes next.'}</p><h2 className="mt-3 text-[28px] font-semibold tracking-tight">Ready when you are.</h2></div><Link to={to('/site/register')} className="inline-flex h-11 items-center gap-2 rounded-lg bg-fg px-5 text-[13px] font-medium text-black hover:bg-white/85">Create your account<ArrowRight className="size-4" /></Link></section>
  </div>
}
