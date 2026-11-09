import { Brand } from '../components/logos.jsx'
import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight, Check, Cloud, Database, Gamepad2, Globe, Mail, Menu, Server, X } from 'lucide-react'
import { Badge, BackLink, Button, Card, CardBody, IconTile, Input, Segmented } from '../components/ui.jsx'
import { CodeBlock, FormField, InlineAlert, OTPInput, PasswordInput, inputCls } from '../components/ui2.jsx'
import { AnimatedPrice, DotBars, DotNum } from '../components/DotViz.jsx'
import { DotField, DotText, Orb } from '../builder/FxBits.jsx'
import { CATALOG, INCIDENTS } from '../lib/mock'
import HomePage from './HomePage.jsx'
import { SiteFooter, SiteHeader } from './Chrome.jsx'
import { AppPage, AppsCatalog } from './AppsPages.jsx'
import { PLAN_DATA } from '../components/product.jsx'
import { cn, money } from '../lib/utils'

function Shell({ children }) {
  const { pathname } = useLocation()
  const home = /^\/site\/?$/.test(pathname)
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-bg">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter cta={!home} />
    </div>
  )
}

const COMPARE = ['vCPU', 'Memory', 'Storage', 'Traffic']
function Products({ id }) {
  const nav = useNavigate()
  const c = CATALOG.find((x) => x.id === id)
  const [per, setPer] = useState('m')
  const [hot, setHot] = useState(null)   // plan card under the pointer / focus: its column in the compare table lights up
  const yearly = per === 'y'
  if (c) return (
    <div key={c.id} className="anim-page mx-auto max-w-5xl space-y-10 px-5 py-14 md:px-10">
      <div className="anim-rise" style={{ '--i': 0 }}><BackLink onClick={() => nav('/site/products')}>Products</BackLink><h1 className="mt-3 text-4xl font-semibold tracking-tight">{c.name}</h1><p className="mt-3 max-w-xl text-[15px] text-mute">{c.blurb}</p></div>
      <div className="anim-rise flex flex-wrap items-center justify-between gap-3" style={{ '--i': 1 }}>
        <h2 className="text-lg font-semibold">Choose a plan</h2>
        <div className="flex items-center gap-3">
          <span aria-hidden className={cn('font-mono text-[11px] uppercase tracking-[.06em] text-ok transition-[opacity,transform] duration-200 ease-[var(--ease-out)]', yearly ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-0')}>2 months free</span>
          <Segmented value={per} onValueChange={(v) => v && setPer(v)} options={[['m', 'Monthly'], ['y', 'Yearly \u221220%']]} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3" onPointerLeave={() => setHot(null)}>
        {PLAN_DATA.map((p, i) => {
          const price = p.price * (yearly ? 0.8 : 1)
          return (
            <div key={p.id} onPointerEnter={() => setHot(p.id)} onFocus={() => setHot(p.id)} onBlur={() => setHot(null)} style={{ '--i': i + 2 }}
              className={cn('anim-rise group flex flex-col rounded-2xl border bg-card p-6 transition-[border-color,background-color,transform] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:bg-[#161619]', p.tag ? 'border-white/40' : 'border-line hover:border-line-2')}>
              <div className="flex items-center gap-2 text-[13px] text-dim">{p.name}{p.tag && <Badge tone="info" dot={false}>{p.tag}</Badge>}</div>
              <div className="mt-4 flex items-end gap-2"><AnimatedPrice value={price} height={38} prefix="$" decimals={2} /><span className="pb-1 text-xs text-dim">/ mo</span></div>
              {/* the billing line cross-fades instead of popping, and reserves its height so the card never jumps */}
              <div className="relative mt-2 h-4 text-[12px] text-dim">
                <span className={cn('absolute inset-0 transition-opacity duration-200', yearly ? 'opacity-0' : 'opacity-100')}>Billed monthly</span>
                <span className={cn('absolute inset-0 transition-opacity duration-200', yearly ? 'opacity-100' : 'opacity-0')} aria-hidden={!yearly}>{money(price * 12)} billed yearly</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5 text-[13.5px] text-mute">{p.specs.map((s) => <li key={s} className="flex items-center gap-2.5"><Check className="size-3.5 text-fg" />{s}</li>)}</ul>
              <Button className="mt-6" variant={p.tag ? 'default' : 'outline'} onClick={() => nav('/site/register')}>Choose {p.name}<ArrowRight className="size-4 -translate-x-1 opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:opacity-100" /></Button>
            </div>
          )
        })}
      </div>
      <div className="anim-rise overflow-x-auto rounded-xl border border-line" style={{ '--i': 5 }}>
        <table className="w-full min-w-[420px] text-[13.5px]">
          <thead><tr className="border-b border-line font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><th className="px-4 py-3 text-left font-normal">Compare</th>{PLAN_DATA.map((p) => <th key={p.id} className={cn('px-4 py-3 text-left font-normal transition-colors duration-150', hot === p.id && 'text-fg')}>{p.name}</th>)}</tr></thead>
          <tbody>{COMPARE.map((r, i) => <tr key={r} className="border-b border-line/50 transition-colors duration-150 last:border-b-0 hover:bg-hover"><td className="px-4 py-3 text-mute">{r}</td>{PLAN_DATA.map((p) => <td key={p.id} className={cn('px-4 py-3 font-mono text-[12.5px] transition-colors duration-150', hot === p.id ? 'bg-white/[0.04] text-fg' : 'text-mute')}>{p.specs[i]}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  )
  return (
    <div className="anim-page mx-auto max-w-6xl space-y-8 px-5 py-14 md:px-10">
      <div className="anim-rise" style={{ '--i': 0 }}><h1 className="text-4xl font-semibold tracking-tight">Products</h1><p className="mt-3 text-[15px] text-mute">Pick a category to see plans and pricing.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOG.map((x, i) => (
          <button key={x.id} onClick={() => nav('/site/products/' + x.id)} style={{ '--i': i + 1 }} className="anim-rise group relative flex flex-col gap-3 rounded-xl border border-line bg-card p-5 text-left outline-none transition-[border-color,background-color,transform] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-line-2 hover:bg-[#161619] focus-visible:border-white/40 active:translate-y-0">
            <div className="flex items-start justify-between"><IconTile><Server /></IconTile><ArrowRight className="size-4 -translate-x-1 text-dim opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:text-fg group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" /></div>
            <div className="flex items-center gap-2 text-[15px] font-semibold">{x.name}{x.tag && <Badge tone="info" dot={false}>{x.tag}</Badge>}</div>
            <p className="text-[13px] text-mute">{x.blurb}</p>
            <span className="mt-auto font-mono text-[11px] uppercase text-dim">From {money(x.from)} / mo</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Auth({ mode }) {
  const nav = useNavigate()
  const [tab, setTab] = useState(mode)
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const bad = email && !/^\S+@\S+\.\S+$/.test(email)
  return (
    <div className="relative grid min-h-[calc(100dvh-96px)] place-items-center overflow-hidden px-5 py-12">
      <DotField className="pointer-events-none absolute inset-0 size-full" pitch={34} glyphs strength={0.5} />
      <div className="relative w-full max-w-sm">
        <span className="absolute -inset-10 -z-0 bg-black/80 backdrop-blur-[10px] [mask-image:radial-gradient(closest-side,#000_62%,transparent)]" />
        <div className="relative rounded-2xl border border-line-2 bg-card p-7 shadow-2xl shadow-black/60">
          <div className="mb-6 flex items-center gap-3"><Orb size={36} /><div><div className="text-[17px] font-semibold tracking-tight">{tab === 'login' ? 'Welcome back' : tab === 'register' ? 'Create your account' : tab === 'recover' ? 'Reset password' : 'Two-factor'}</div><div className="text-xs text-dim">{tab === 'login' ? 'Log in to your client area' : tab === 'register' ? 'Free to start. No card required.' : tab === 'recover' ? 'We will email you a reset link' : 'Enter the 6-digit code'}</div></div></div>
          {tab === 'login' && <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setTab('2fa') }}><FormField label="Email"><input type="email" required className={inputCls()} placeholder="you@example.com" /></FormField><FormField label="Password"><PasswordInput required /></FormField><div className="flex justify-end"><button type="button" onClick={() => setTab('recover')} className="text-xs text-dim hover:text-fg">Forgot password?</button></div><Button size="lg" className="w-full">Log in</Button><p className="text-center text-[13px] text-dim">New here? <button type="button" onClick={() => setTab('register')} className="text-fg underline underline-offset-4">Create account</button></p></form>}
          {tab === 'register' && <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Account created (simulated)'); nav('/') }}><FormField label="Name"><input required className={inputCls()} /></FormField><FormField label="Email" error={bad ? 'Enter a valid email address' : undefined}><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls(bad)} /></FormField><FormField label="Password" hint="At least 12 characters"><PasswordInput required autoComplete="new-password" /></FormField><Button size="lg" className="w-full" disabled={!!bad}>Create account</Button><p className="text-center text-[13px] text-dim">Have an account? <button type="button" onClick={() => setTab('login')} className="text-fg underline underline-offset-4">Log in</button></p></form>}
          {tab === 'recover' && (sent ? <div className="space-y-4"><InlineAlert tone="ok" title="Check your inbox">If an account exists for that address, a reset link is on its way. (simulated)</InlineAlert><Button variant="outline" className="w-full" onClick={() => { setSent(false); setTab('login') }}>Back to log in</Button></div> : <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true) }}><FormField label="Email"><input type="email" required className={inputCls()} /></FormField><Button size="lg" className="w-full">Send reset link</Button><button type="button" onClick={() => setTab('login')} className="block w-full text-center text-[13px] text-dim hover:text-fg">Back to log in</button></form>)}
          {tab === '2fa' && <div className="space-y-5"><OTPInput value={otp} onChange={setOtp} /><Button size="lg" className="w-full" disabled={otp.length < 6} onClick={() => nav('/')}>Verify</Button><p className="text-center text-xs text-dim">Any 6 digits work in this simulation.</p></div>}
        </div>
      </div>
    </div>
  )
}

function Docs() {
  const [sec, setSec] = useState('start')
  const D = { start: ['Quick start', 'Create your first server in under a minute.', 'blip login --key YOUR_KEY\nblip deploy vps --plan pro --region fra'], ssh: ['Connect via SSH', 'Add a public key, then connect to your server.', 'ssh root@45.83.12.9'], dns: ['Point your domain', 'Create an A record that points to your server.', 'A  @  45.83.12.9  300'], api: ['API reference', 'Authenticate with a bearer token.', 'curl -H "Authorization: Bearer $KEY" \\\n  https://api.blipmade.cloud/v1/services'] }
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[200px_1fr] md:px-10">
      <nav className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5">{Object.entries(D).map(([k, [t]]) => <button key={k} onClick={() => setSec(k)} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-left text-[13.5px] transition-colors', sec === k ? 'bg-white/[0.07] text-fg' : 'text-mute hover:text-fg')}>{t}</button>)}</nav>
      <article className="max-w-2xl space-y-5"><h1 className="text-3xl font-semibold tracking-tight">{D[sec][0]}</h1><p className="text-[15px] leading-relaxed text-mute">{D[sec][1]}</p><CodeBlock lang="bash" code={D[sec][2]} /><InlineAlert tone="info" title="Heads up">Examples use simulated values.</InlineAlert></article>
    </div>
  )
}

function Status() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 py-14 md:px-10">
      <div className="flex items-center gap-3"><span className="size-3 rounded-full bg-warn shadow-[0_0_12px_var(--color-warn)]" /><h1 className="text-3xl font-semibold tracking-tight">Partial degradation</h1></div>
      <div className="space-y-3">{[['Frankfurt', 'degraded'], ['Amsterdam', 'ok'], ['Helsinki', 'ok'], ['Ashburn', 'bad'], ['Control panel', 'ok'], ['Email delivery', 'ok']].map(([n, s]) => <div key={n} className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3.5 text-[14px]">{n}<Badge tone={s === 'ok' ? 'ok' : s === 'bad' ? 'bad' : 'warn'}>{s === 'ok' ? 'Operational' : s === 'bad' ? 'Outage' : 'Degraded'}</Badge></div>)}</div>
      <div className="space-y-3"><h2 className="text-lg font-semibold">Incidents</h2>{INCIDENTS.map((i) => <div key={i.id} className="rounded-xl border border-line bg-card p-4"><div className="font-medium">{i.t}</div><div className="mt-1 text-xs text-dim">{i.when} · {i.status}</div></div>)}</div>
    </div>
  )
}
const Legal = () => <div className="mx-auto max-w-2xl space-y-5 px-5 py-14 md:px-10"><h1 className="text-3xl font-semibold tracking-tight">Terms of service</h1><p className="font-mono text-[11px] uppercase text-dim">Last updated Nov 1, 2026 · sample text</p>{['Acceptable use', 'Billing and renewals', 'Service levels', 'Termination'].map((t, i) => <section key={t} className="space-y-2"><h2 className="text-lg font-semibold">{i + 1}. {t}</h2><p className="text-[14px] leading-relaxed text-mute">This is placeholder legal copy for the design mock-up. Real terms are authored by counsel and replace this section.</p></section>)}</div>
const NotFound = () => { const nav = useNavigate(); return <div className="grid min-h-[60dvh] place-items-center px-5 text-center"><div className="flex flex-col items-center gap-6"><Orb size={80} state="waiting" /><DotText text="404" height={56} assemble /><p className="text-[15px] text-mute">We could not find that page.</p><Button onClick={() => nav('/site')}>Back to home</Button></div></div> }

export default function SiteApp() {
  const { pathname } = useLocation()
  const [, seg = '', arg] = pathname.replace(/^\/site\/?/, '/').split('/')
  const page = { '': <HomePage />, products: <Products id={arg} />, apps: arg ? <AppPage key={arg} id={arg} /> : <AppsCatalog />, login: <Auth key="l" mode="login" />, register: <Auth key="r" mode="register" />, recover: <Auth key="c" mode="recover" />, docs: <Docs />, status: <Status />, legal: <Legal /> }[seg] || <NotFound />
  return <Shell>{page}</Shell>
}
