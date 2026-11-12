import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowRight, Box, Crosshair, Gamepad2, Pause, Play, Search, X } from 'lucide-react'
import { Accordion, Button, Segmented } from '../components/ui.jsx'
import { inputCls } from '../components/ui2.jsx'
import { DotNum } from '../components/DotViz.jsx'
import { DotText } from '../builder/FxBits.jsx'
import { Decode } from '../studio/kit.jsx'
import { AppPage } from './AppsPages.jsx'
import { GameArtwork } from './GameArtwork.jsx'
import { GameLaunch } from './GameLaunch.jsx'
import { FEATURED_GAMES, GAMES, GAME_FAQ, GAME_GROUPS } from './gamesData.js'
import { priceOf } from './appsData.js'
import { useLive } from './reveal.jsx'
import { cn, money } from '../lib/utils'
import './games.css'

const WRAP = 'mx-auto w-full max-w-6xl px-5 md:px-10'
const LABEL = 'font-mono text-[10.5px] uppercase tracking-[.08em] text-dim'

function GameHero({ onBrowse }) {
  const [index, setIndex] = useState(0), [paused, setPaused] = useState(false)
  const ref = useRef(null), live = useLive(ref)
  const game = FEATURED_GAMES[index]
  useEffect(() => {
    if (!live || paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => setIndex(i => (i + 1) % FEATURED_GAMES.length), 10500)
    return () => clearTimeout(t)
  }, [index, paused, live])
  return <section ref={ref} className="games-hero" aria-label="Game hosting">
    <GameArtwork id={game.id} paused={paused} />
    <div className="games-art-shade" />
    <div className={cn(WRAP, 'games-hero-copy')}>
      <div className={cn(LABEL, 'mb-7 flex items-center gap-2.5')}><i className="size-1.5 rounded-full bg-[var(--brand)]" />Game hosting</div>
      <h1 className="sr-only">Your world. Your rules. Game hosting by Blipmade.</h1>
      <div aria-hidden className="flex max-w-[540px] flex-col items-start gap-4"><DotText text="YOUR WORLD." height={44} assemble /><DotText text="YOUR RULES." height={44} assemble delay={200} /></div>
      <p className="mt-7 max-w-[340px] text-[15px] leading-relaxed text-mute">A server for the world you’re building.<br />A home for the people you play with.</p>
      <div className="mt-8 flex items-center gap-5"><GameLaunch game={game} label="Start a server" /><button onClick={onBrowse} className="inline-flex items-center gap-2 text-[13px] text-mute transition-colors hover:text-fg">All games<ArrowDown className="size-3.5" /></button></div>
      <div className="mt-9 max-w-[330px] border-t border-line pt-4"><span className={LABEL}>Now playing</span><div className="mt-2 text-[13px] text-mute"><Decode text={`${game.name} · ${game.tags[0]}`} per={16} /></div></div>
    </div>
    <div className={cn(WRAP, 'games-hero-controls')}>
      <div role="group" aria-label="Preview game worlds" className="flex flex-wrap gap-x-6 gap-y-2">{FEATURED_GAMES.map((g, i) => <button key={g.id} aria-pressed={index === i} onClick={() => setIndex(i)} className={cn('games-world-select', index === i && 'is-active')}><span className="font-mono text-[9px]">0{i + 1}</span>{g.name === 'Counter-Strike 2' ? 'Counter-Strike' : g.name}<span aria-hidden className="games-world-progress" style={{ animationDuration: '10.5s', animationPlayState: paused || !live ? 'paused' : 'running' }} /></button>)}</div>
      <button onClick={() => setPaused(p => !p)} aria-label={paused ? 'Play world animation' : 'Pause world animation'} className="grid size-10 shrink-0 place-items-center rounded-lg text-dim transition-colors hover:bg-hover hover:text-fg">{paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}</button>
    </div>
  </section>
}

export function GamesCatalog() {
  const [group, setGroup] = useState('All games'), [query, setQuery] = useState('')
  const catalog = useRef(null)
  const needle = query.trim().toLowerCase()
  const games = GAMES.filter(g => (group === 'All games' || g.group === group) && `${g.id} ${g.name} ${g.tags.join(' ')}`.toLowerCase().includes(needle))
  const browse = () => catalog.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  return <div className="anim-page games-page">
    <GameHero onBrowse={browse} />
    <section ref={catalog} className={cn(WRAP, 'scroll-mt-20 pb-16 pt-16 md:pb-24 md:pt-24')} aria-labelledby="games-title">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className={LABEL}>The lineup</p><h2 id="games-title" className="mt-3 text-[28px] font-semibold tracking-tight md:text-[34px]">Pick your game. Make it yours.</h2></div><span className={LABEL}>{GAMES.filter(g => !g.soon).length} available / 1 coming soon</span></div>
      <div className="mb-2 mt-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="max-w-full overflow-x-auto"><Segmented aria-label="Game category" value={group} onValueChange={v => v && setGroup(v)} options={GAME_GROUPS.map(g => [g, g])} /></div><div className="relative sm:w-60"><Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-dim" /><input type="search" aria-label="Search games" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search games" className={cn(inputCls(), 'pl-9 pr-9 text-[16px] sm:text-[13px] [&::-webkit-search-cancel-button]:hidden')} />{query && <button aria-label="Clear game search" onClick={() => setQuery('')} className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-dim hover:text-fg"><X className="size-3.5" /></button>}</div></div>
      <div className={cn(LABEL, 'mt-6 hidden grid-cols-[1fr_170px_170px_124px] gap-5 border-b border-line pb-3 md:grid')}><span>Game</span><span>Starting memory</span><span>From / month</span><span /></div>
      <p className="sr-only" role="status" aria-live="polite">{games.length} games shown</p>
      <ul className="border-t border-line md:border-t-0">{games.map(game => {
        const Icon = game.group === 'Competitive' ? Crosshair : game.group === 'Sandbox' ? Box : Gamepad2
        return <li key={game.id} className="games-row group">
          <Link to={'/site/games/' + game.id} className="flex min-w-0 items-center gap-4 outline-none"><Icon strokeWidth={1.5} className="size-5 shrink-0 text-dim transition-colors group-hover:text-fg" /><div className="min-w-0"><h3 className="flex flex-wrap items-center gap-2 text-[15px] font-medium">{game.name}{game.soon && <span className="font-mono text-[9px] uppercase text-dim">Coming soon</span>}</h3><p className="mt-1.5 text-[12px] text-dim">{game.tags.join(' · ')}</p></div></Link>
          <span className="hidden font-mono text-[12px] text-mute md:block">{game.ram[0]} GB <span className="text-dim">RAM</span></span>
          <div className="games-row-price"><DotNum text={money(priceOf(game, game.ram[0], 10, false))} height={19} animate={false} /><span className="mt-1 block font-mono text-[9px] text-dim md:hidden">/ month</span></div>
          <GameLaunch game={game} />
        </li>
      })}</ul>
      {!games.length && <div className="space-y-3 border-b border-line py-14 text-center"><p className="text-sm text-mute">No games match these filters.</p><Button variant="outline" onClick={() => { setQuery(''); setGroup('All games') }}>Clear filters</Button></div>}
      <div className="mt-6 flex flex-wrap justify-between gap-4 text-[12px] text-dim"><p>Daily backups. Web console. Resources you can change later.</p><Link to="/site/contact" className="inline-flex items-center gap-2 text-mute hover:text-fg">Looking for another game?<ArrowRight className="size-3.5" /></Link></div>
    </section>
    <section className="border-t border-line"><div className={cn(WRAP, 'grid gap-8 py-16 lg:grid-cols-[1fr_1.4fr] lg:gap-20')}><div><p className={LABEL}>Before you start</p><h2 className="mt-3 text-[28px] font-semibold tracking-tight">Good questions.</h2><Link to="/site/contact" className="mt-5 inline-flex items-center gap-2 text-[13px] text-mute hover:text-fg">Talk to us<ArrowRight className="size-3.5" /></Link></div><Accordion items={GAME_FAQ.slice(0, 4)} /></div></section>
  </div>
}

export function GamePage({ id }) {
  const game = GAMES.find(g => g.id === id), nav = useNavigate()
  if (!game) return <div className={cn(WRAP, 'space-y-5 py-24 text-center')}><h1 className="text-2xl font-semibold">Game not found.</h1><Button onClick={() => nav('/site/games')}>Browse games<ArrowRight /></Button></div>
  return <AppPage id={id} game={game} />
}
