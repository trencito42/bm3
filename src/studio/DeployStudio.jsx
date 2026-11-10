/* Deploy Studio: one flow for every kind of product. The steps differ per type, the frame does not:
   stepper on top, the step in the middle, a live order summary on the side (a bar on phones), then checkout,
   provisioning and the result. A "scenario" switch drives the happy path and the two failure paths so every state can be reviewed. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Bot, Check, CreditCard, Database, FileArchive, Gamepad2, GitBranch, Globe, Lock, Mail, Package, Search, Server, ShieldCheck, Upload, Wand2 } from 'lucide-react'
import { Badge, Button, RadioCard, RadioGroup, Segmented, Switch } from '../components/ui.jsx'
import { Checkbox, FormField, InlineAlert, PasswordInput, Select, Stepper, inputCls } from '../components/ui2.jsx'
import { AnimatedPrice, DotNum } from '../components/DotViz.jsx'
import { DotText } from '../builder/FxBits.jsx'
import { BillingPeriod, KeyValueEditor, OSSelector, RegionSelector } from '../components/product.jsx'
import { ResourceAllocator, JobTimeline } from './patterns.jsx'
import { Decode, DotRail, StateHero, eyebrow, useSim } from './kit.jsx'
import { cn, money } from '../lib/utils'

/* ------------------------------------------------------------ catalogue (mock) ------------------------------------------------------------ */
const PRESETS = {
  app: [['starter', 'Starter', 1, 1, 20, 3.2, 'Side projects, small APIs'], ['pro', 'Pro', 2, 4, 60, 9, 'Production apps'], ['scale', 'Scale', 4, 8, 120, 24, 'Busy services, workers']],
  bot: [['tiny', 'Tiny', 1, 0.5, 5, 1.5, 'One small bot'], ['std', 'Standard', 1, 1, 10, 3.2, 'A bot with a queue'], ['plus', 'Plus', 2, 2, 20, 6.4, 'Many servers, music, workers']],
  game: [['small', '2 GB', 1, 2, 20, 6.24, 'Up to ~10 players'], ['mid', '4 GB', 1, 4, 30, 10.74, 'Suggested · ~25 players'], ['big', '16 GB', 4, 16, 100, 38, 'Modpacks, large worlds']],
  db: [['dev', 'Development', 1, 1, 10, 5, 'Tests and prototypes'], ['prod', 'Production', 2, 4, 50, 19, 'Daily backups, replica ready'], ['ha', 'High availability', 4, 8, 100, 49, 'Failover in under 30 s']],
  site: [['nano', 'Nano', 1, 1, 10, 3.74, 'One small site'], ['pro', 'Pro', 2, 2, 40, 9.9, 'Shops and busy sites'], ['biz', 'Business', 4, 4, 100, 18, 'Several sites, staging']],
  vps: [['nano', 'Nano', 1, 1, 25, 4, '1 TB traffic'], ['pro', 'Pro', 4, 8, 100, 12, '4 TB traffic · popular'], ['max', 'Max', 8, 32, 400, 29, '10 TB traffic']],
}
const ADDONS = {
  all: [['backups', 'Daily backups', 'Kept for 7 days, restore in one click', 2], ['monitor', 'Uptime monitoring', 'Alerts by email and chat', 1], ['ddos', 'DDoS protection', 'Always-on, nothing to configure', 3]],
  extra: { vps: [['ip', 'Extra IPv4 address', 'A second static address', 1.5], ['snap', 'Snapshot space 50 GB', 'For manual snapshots', 2]], game: [['ipd', 'Dedicated IPv4', 'Players connect without a port', 1.5], ['cf', 'Crash reports', 'Cause of a crash in plain words', 1]], db: [['replica', 'Read replica', 'A second copy that answers queries', 12]], app: [['ipd', 'Dedicated IPv4', 'Static outbound address', 1.5]] },
}
const EDITIONS = [['paper', 'Paper', 'Fast, plugin support', true], ['forge', 'Forge', 'Mods and modpacks', true], ['bedrock', 'Bedrock', 'Phones and consoles', true], ['folia', 'Folia', 'Regionised multithreading', true], ['vanilla', 'Vanilla', 'Coming soon', false]]
const ENGINES = [['pg', 'PostgreSQL', ['16', '15', '14']], ['my', 'MySQL', ['8.4', '8.0']], ['rd', 'Redis', ['7.2', '6.2']]]
const RUNTIMES = [['node', 'Node.js', ['22 LTS', '20 LTS', '18 (EOL)']], ['py', 'Python', ['3.12', '3.11']], ['php', 'PHP', ['8.3', '8.2']], ['go', 'Go', ['1.23']], ['rust', 'Rust', ['1.82']], ['docker', 'Docker image', ['latest']]]
const MAILPLANS = [['mail-s', 'Starter', 5, '5 mailboxes · 10 GB each', 2.5], ['mail-p', 'Business', 25, '25 mailboxes · 50 GB each', 9], ['mail-m', 'Max', 100, '100 mailboxes · 100 GB each', 29]]

export const TYPES = {
  app: { label: 'Application', icon: Package, blip: 'dev', steps: ['Source', 'Runtime', 'Plan', 'Environment', 'Add-ons', 'Domain', 'Review'], word: 'APP.' },
  bot: { label: 'Bot or worker', icon: Bot, blip: 'dev', steps: ['Source', 'Runtime', 'Plan', 'Environment', 'Review'], word: 'BOT.' },
  game: { label: 'Game server', icon: Gamepad2, blip: 'game', steps: ['Edition', 'Plan', 'Mods', 'Add-ons', 'Review'], word: 'GAME.' },
  db: { label: 'Database', icon: Database, blip: 'dev', steps: ['Engine', 'Plan', 'Access', 'Add-ons', 'Review'], word: 'DATA.' },
  site: { label: 'Website', icon: Globe, blip: 'builder', steps: ['Source', 'Plan', 'Domain', 'Review'], word: 'SITE.' },
  vps: { label: 'VPS', icon: Server, blip: 'dev', steps: ['System', 'Plan', 'Access', 'Add-ons', 'Review'], word: 'VPS.' },
  mail: { label: 'Email hosting', icon: Mail, blip: 'chat', steps: ['Domain', 'Plan', 'Mailboxes', 'Review'], word: 'MAIL.' },
}
const FRESH = () => ({ source: 'git', repo: 'northwind/api', branch: 'main', build: 'npm run build', start: 'node dist/index.js', zip: null, runtime: 'node', ver: 0, preset: 1, custom: false, res: null, region: 'Frankfurt', edition: 'paper', gver: '1.21.4', mods: ['EssentialsX'], engine: 'pg', env: 0, addons: ['backups'], domain: 'free', sub: 'my-api', custom_domain: '', os: 'Ubuntu 24.04', key: 'macbook', pass: '', mdomain: 'example-studio.com', mplan: 0, boxes: ['stefan', 'support'], period: 'm', promo: '', terms: false, pay: 'card' })

/* ------------------------------------------------------------ price ------------------------------------------------------------ */
function price(type, c) {
  const lines = []
  if (type === 'mail') { const p = MAILPLANS[c.mplan]; lines.push([`${p[1]} · ${p[3].split(' · ')[0]}`, p[4] * Math.max(1, Math.ceil(c.boxes.length / 1) > p[2] ? 1 : 1)]) }
  else {
    const p = PRESETS[type][c.preset]
    lines.push([c.custom && c.res ? `Custom · ${c.res.cpu} vCPU · ${c.res.ram} GB` : `${p[1]}${type === 'game' ? ` · ${c.edition}` : ''}`, c.custom && c.res ? c.res.cpu * 2.5 + c.res.ram * 1.25 + c.res.disk * 0.03 : p[5]])
  }
  const list = [...ADDONS.all, ...(ADDONS.extra[type] || [])]
  if (type !== 'mail' && type !== 'site') c.addons.forEach((a) => { const x = list.find((y) => y[0] === a); if (x) lines.push([x[1], x[3]]) })
  if (type === 'app' || type === 'site') if (c.domain === 'custom' && c.custom_domain) lines.push(['Domain connection', 0])
  const sub = lines.reduce((s, l) => s + l[1], 0)
  const k = c.period === 'y' ? 0.8 : c.period === 'q' ? 0.92 : 1
  const disc = c.period === 'm' ? 0 : -(sub * (1 - k))
  const promo = c.promo.toUpperCase() === 'BLIP20' ? -(sub + disc) * 0.2 : 0
  return { lines: lines.filter((l) => l[1] !== 0 || l[0] === 'Domain connection'), disc, promo, total: sub + disc + promo, sub }
}

/* ------------------------------------------------------------ option card ------------------------------------------------------------ */
const Opt = ({ on, onClick, disabled, children, className, tag }) => (
  <button type="button" disabled={disabled} aria-pressed={on} onClick={onClick} className={cn('relative rounded-xl border p-4 text-left outline-none transition-[border-color,background-color,transform] duration-200 ease-[var(--ease-out)] focus-visible:border-white/50 disabled:cursor-not-allowed disabled:opacity-40', on ? 'border-fg bg-white/[0.05]' : 'border-line-2 hover:-translate-y-0.5 hover:border-white/30 disabled:hover:translate-y-0', className)}>{tag && <Badge tone="info" dot={false} className="absolute right-3 top-3">{tag}</Badge>}{children}{on && <span className="absolute bottom-3 right-3 grid size-4 place-items-center rounded-full bg-fg text-black"><Check className="size-3" /></span>}</button>
)
const Q = ({ t, d }) => <div className="mb-4"><h2 className="text-[17px] font-semibold tracking-tight">{t}</h2>{d && <p className="mt-1 text-[13.5px] text-mute">{d}</p>}</div>

/* ------------------------------------------------------------ steps ------------------------------------------------------------ */
function Source({ c, set, type }) {
  const [drag, setDrag] = useState(false), [up, setUp] = useState(0)
  useEffect(() => { if (!c.zip) return; setUp(0); const t = setInterval(() => setUp((u) => (u >= 100 ? 100 : u + 20)), 220); return () => clearInterval(t) }, [c.zip])
  return (
    <div className="space-y-5">
      <Q t={type === 'site' ? 'Where does your site come from?' : 'Where is your code?'} d="Connect a repository, upload an archive, or start from a template." />
      <Segmented value={c.source} onValueChange={(v) => v && set({ source: v })} options={[['git', <span key="g" className="flex items-center gap-1.5"><GitBranch className="size-3.5" />Git</span>], ['zip', <span key="z" className="flex items-center gap-1.5"><FileArchive className="size-3.5" />ZIP</span>], ['tpl', <span key="t" className="flex items-center gap-1.5"><Wand2 className="size-3.5" />Template</span>]]} />
      {c.source === 'git' && <div className="step-in grid gap-4 sm:grid-cols-2"><FormField label="Repository"><div className="relative"><GitBranch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" /><input value={c.repo} onChange={(e) => set({ repo: e.target.value })} className={cn(inputCls(), 'pl-9 font-mono')} /></div></FormField><FormField label="Branch"><Select value={c.branch} onValueChange={(v) => set({ branch: v })} options={['main', 'staging', 'develop']} /></FormField><FormField label="Build command" hint="Detected from package.json"><input value={c.build} onChange={(e) => set({ build: e.target.value })} className={cn(inputCls(), 'font-mono')} /></FormField><FormField label={type === 'bot' ? 'Run command' : 'Start command'}><input value={c.start} onChange={(e) => set({ start: e.target.value })} className={cn(inputCls(), 'font-mono')} /></FormField><div className="sm:col-span-2"><InlineAlert tone="ok" title="Repository reachable">Every push to <b className="font-mono">{c.branch}</b> deploys automatically. You can turn that off later.</InlineAlert></div></div>}
      {c.source === 'zip' && <div className="step-in space-y-3"><label onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); set({ zip: 'project.zip' }) }} className={cn('grid cursor-pointer place-items-center rounded-xl border border-dashed p-8 text-center transition-colors', drag ? 'border-fg bg-white/[0.05]' : 'border-line-2 hover:border-white/30')}><Upload className="mb-2 size-5 text-dim" /><span className="text-[14px]">Drop a .zip here, or <span className="underline underline-offset-4">choose a file</span></span><span className="mt-1 text-[12px] text-dim">Up to 250 MB</span><input type="file" className="sr-only" onChange={() => set({ zip: 'project.zip' })} /></label>{c.zip && <div className="flex items-center gap-3 rounded-lg border border-line p-3 text-[13px]"><FileArchive className="size-4 text-dim" /><span className="font-mono">{c.zip}</span><span className="ml-auto font-mono text-[11px] text-dim">{up < 100 ? `${up}%` : '4.2 MB'}</span>{up >= 100 && <Check className="size-4 text-ok" />}</div>}</div>}
      {c.source === 'tpl' && <div className="step-in grid gap-3 sm:grid-cols-3">{[['Express API', 'Node'], ['Discord bot', 'discord.js'], ['Next.js site', 'Node']].map(([n, d]) => <Opt key={n} on={c.repo === n} onClick={() => set({ repo: n })}><div className="text-[14px] font-medium">{n}</div><div className="mt-0.5 font-mono text-[11.5px] text-dim">{d}</div></Opt>)}</div>}
    </div>
  )
}
function Runtime({ c, set }) {
  const r = RUNTIMES.find((x) => x[0] === c.runtime)
  return (
    <div className="space-y-5"><Q t="What does it run on?" d="We detected Node.js from your package.json. Change it if that is wrong." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{RUNTIMES.map(([id, n]) => <Opt key={id} on={c.runtime === id} onClick={() => set({ runtime: id, ver: 0 })} tag={id === 'node' ? 'Detected' : undefined}><div className="text-[14px] font-medium">{n}</div></Opt>)}</div>
      <FormField label="Version"><div className="flex flex-wrap gap-2">{r[2].map((v, i) => <button key={v} type="button" aria-pressed={c.ver === i} onClick={() => set({ ver: i })} className={cn('h-8 rounded-lg border px-3 font-mono text-[12.5px] transition-colors', c.ver === i ? 'border-fg bg-fg text-black' : 'border-line-2 text-mute hover:text-fg')}>{v}</button>)}</div></FormField>
      {r[2][c.ver].includes('EOL') && <InlineAlert tone="warn" title="This version no longer gets security updates">Pick a newer one unless your app needs it.</InlineAlert>}</div>
  )
}
function Edition({ c, set }) {
  return (
    <div className="space-y-5"><Q t="Which edition?" d="You can change the version later without losing the world." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{EDITIONS.map(([id, n, d, ok]) => <Opt key={id} on={c.edition === id} disabled={!ok} onClick={() => set({ edition: id })} tag={!ok ? 'Soon' : id === 'paper' ? 'Popular' : undefined}><div className="text-[14px] font-medium">{n}</div><div className="mt-0.5 text-[12.5px] text-dim">{d}</div></Opt>)}</div>
      <FormField label="Game version"><div className="flex flex-wrap gap-2">{['1.21.4', '1.21.1', '1.20.6', '1.19.4'].map((v) => <button key={v} type="button" aria-pressed={c.gver === v} onClick={() => set({ gver: v })} className={cn('h-8 rounded-lg border px-3 font-mono text-[12.5px] transition-colors', c.gver === v ? 'border-fg bg-fg text-black' : 'border-line-2 text-mute hover:text-fg')}>{v}</button>)}</div></FormField></div>
  )
}
function Engine({ c, set }) {
  const e = ENGINES.find((x) => x[0] === c.engine)
  return (
    <div className="space-y-5"><Q t="Which engine?" d="Managed: updates, backups and failover are ours." />
      <div className="grid gap-3 sm:grid-cols-3">{ENGINES.map(([id, n]) => <Opt key={id} on={c.engine === id} onClick={() => set({ engine: id, ver: 0 })}><div className="text-[14px] font-medium">{n}</div></Opt>)}</div>
      <FormField label="Version"><div className="flex flex-wrap gap-2">{e[2].map((v, i) => <button key={v} type="button" aria-pressed={c.ver === i} onClick={() => set({ ver: i })} className={cn('h-8 rounded-lg border px-3 font-mono text-[12.5px]', c.ver === i ? 'border-fg bg-fg text-black' : 'border-line-2 text-mute hover:text-fg')}>{v}</button>)}</div></FormField></div>
  )
}
function Plan({ c, set, type }) {
  const P = PRESETS[type]
  return (
    <div className="space-y-6"><Q t="Pick a size" d="Start with a preset. You can resize later without losing data." />
      <RadioGroup value={String(c.custom ? -1 : c.preset)} onValueChange={(v) => set({ preset: +v, custom: false })} className="grid gap-3 sm:grid-cols-3">
        {P.map((p, i) => <RadioCard key={p[0]} value={String(i)} className="p-4"><div className="flex items-center gap-2 text-[13px] text-dim">{p[1]}{i === 1 && <Badge tone="info" dot={false}>Popular</Badge>}</div><div className="mt-3 flex items-end gap-2"><DotNum text={money(p[5]).replace('.00', '')} height={28} animate={false} /><span className="pb-0.5 text-[11.5px] text-dim">/ mo</span></div><div className="mt-3 font-mono text-[11.5px] leading-5 text-mute">{p[2]} vCPU · {p[3]} GB · {p[4]} GB NVMe</div><div className="mt-1 text-[12px] text-dim">{p[6]}</div></RadioCard>)}
      </RadioGroup>
      <div className="rounded-xl border border-line p-4"><label className="flex items-center justify-between gap-3 text-[13.5px]"><span><b className="font-medium">Set the exact size</b><span className="block text-[12.5px] text-dim">Pay for exactly the vCPU, memory and storage you choose.</span></span><Switch checked={c.custom} onCheckedChange={(v) => set({ custom: v })} /></label>{c.custom && <div className="step-in mt-5 border-t border-line pt-5"><ResourceAllocator hideApply initial={{ cpu: P[c.preset][2], ram: Math.max(1, P[c.preset][3]), disk: P[c.preset][4] }} onChange={(res) => set({ res })} /></div>}</div>
      <FormField label="Region"><RegionSelector value={c.region} onChange={(r) => set({ region: r })} /></FormField>
    </div>
  )
}
function Env({ c, set, type }) {
  return (
    <div className="space-y-5"><Q t="Environment" d={type === 'bot' ? 'Your bot token is stored encrypted and never shown again.' : 'Values are encrypted and available to your app at runtime.'} />
      {type === 'bot' && <FormField label="Bot token" hint="Discord developer portal, Bot, Reset token"><PasswordInput autoComplete="off" placeholder="paste the token" value={c.pass} onChange={(e) => set({ pass: e.target.value })} /></FormField>}
      <KeyValueEditor title="Variables" rows={[['NODE_ENV', 'production'], ['PORT', '3000'], ['LOG_LEVEL', 'info']]} secret />
      <InlineAlert tone="info" title="Change these any time">Updating a variable restarts the {type === 'bot' ? 'bot' : 'app'} in about 5 seconds.</InlineAlert></div>
  )
}
function Addons({ c, set, type }) {
  const list = [...ADDONS.all, ...(ADDONS.extra[type] || [])]
  return (
    <div className="space-y-5"><Q t="Anything else?" d="Optional. Each one can be added or removed later." />
      <div className="space-y-2">{list.map(([id, n, d, p]) => { const on = c.addons.includes(id); return <label key={id} className={cn('flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors', on ? 'border-fg bg-white/[0.04]' : 'border-line-2 hover:border-white/30')}><Checkbox checked={on} onCheckedChange={(v) => set({ addons: v ? [...c.addons, id] : c.addons.filter((x) => x !== id) })} /><span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">{n}</span><span className="block text-[12.5px] text-dim">{d}</span></span><span className="font-mono text-[12.5px] tabular-nums text-mute">+{money(p)}</span></label> })}</div></div>
  )
}
function Domain({ c, set }) {
  const [chk, run] = useSim(900)
  return (
    <div className="space-y-5"><Q t="Where will people find it?" d="Start on a free address and connect your own domain whenever you like." />
      <div className="grid gap-3 sm:grid-cols-2"><Opt on={c.domain === 'free'} onClick={() => set({ domain: 'free' })}><div className="text-[14px] font-medium">Free address</div><div className="mt-1 font-mono text-[12.5px] text-dim">{c.sub || 'name'}.blipmade.app</div></Opt><Opt on={c.domain === 'custom'} onClick={() => set({ domain: 'custom' })}><div className="text-[14px] font-medium">Your own domain</div><div className="mt-1 text-[12.5px] text-dim">HTTPS is set up for you</div></Opt></div>
      {c.domain === 'free' ? <FormField label="Name"><div className="flex items-center gap-2"><input value={c.sub} onChange={(e) => set({ sub: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className={cn(inputCls(), 'font-mono')} /><span className="font-mono text-[13px] text-dim">.blipmade.app</span></div></FormField>
        : <div className="step-in space-y-3"><FormField label="Domain"><div className="flex gap-2"><input value={c.custom_domain} placeholder="example-studio.com" onChange={(e) => set({ custom_domain: e.target.value })} className={cn(inputCls(), 'font-mono')} /><Button variant="outline" loading={chk === 'running'} disabled={!c.custom_domain} onClick={() => run(false)}>Check</Button></div></FormField>{chk === 'ok' && <InlineAlert tone="warn" title="Add one DNS record after the deploy">CNAME <b className="font-mono">@</b> to <b className="font-mono">edge.blipmade.app</b>. We check it for you and switch HTTPS on when it is there.</InlineAlert>}</div>}</div>
  )
}
function System({ c, set }) {
  return (
    <div className="space-y-5"><Q t="Choose a system" d="You get full root access." /><OSSelector value={c.os} onChange={(v) => set({ os: v })} /><div className="grid gap-3 sm:grid-cols-3">{[['Ubuntu 24.04', 'LTS, five years of updates'], ['Debian 12', 'Stable and small'], ['AlmaLinux 9', 'RHEL compatible']].map(([n, d]) => <div key={n} className={cn('rounded-lg border p-3 text-[12.5px] transition-colors', c.os === n ? 'border-fg/60 text-fg' : 'border-line text-dim')}><b className="block font-medium">{n}</b>{d}</div>)}</div></div>
  )
}
function Access({ c, set, type }) {
  return type === 'db' ? (
    <div className="space-y-5"><Q t="Who can connect?" d="Locked down by default." /><RadioGroup value={c.key} onValueChange={(v) => set({ key: v })} className="grid gap-3"><RadioCard value="macbook" className="p-4"><div className="text-[14px] font-medium">Only my services</div><div className="text-[12.5px] text-dim">Reachable from your other Blipmade services over a private network.</div></RadioCard><RadioCard value="ip" className="p-4"><div className="text-[14px] font-medium">Allowed addresses</div><div className="text-[12.5px] text-dim">Open to the IP addresses you list. Always encrypted.</div></RadioCard></RadioGroup><InlineAlert tone="info" title="Credentials are shown once after the deploy">Rotate them any time from the database page.</InlineAlert></div>
  ) : (
    <div className="space-y-5"><Q t="How will you sign in?" d="Keys are safer than passwords. We never email a password." /><FormField label="SSH key"><Select value={c.key} onValueChange={(v) => set({ key: v })} options={[['macbook', 'macbook · ed25519 · added Oct 02'], ['ci', 'ci-deploy · ed25519'], ['new', 'Add a new key…']]} /></FormField>{c.key === 'new' && <FormField label="Public key"><textarea rows={3} placeholder="ssh-ed25519 AAAA…" className={cn(inputCls(), 'h-auto py-2 font-mono text-[12px]')} /></FormField>}<label className="flex items-center justify-between rounded-lg border border-line p-3 text-[13.5px]"><span>Also allow password sign-in<span className="block text-[12px] text-dim">Not recommended</span></span><Switch checked={!!c.pass} onCheckedChange={(v) => set({ pass: v ? 'on' : '' })} /></label></div>
  )
}
function Mods({ c, set }) {
  const [q, setQ] = useState('')
  const all = [['EssentialsX', 'Core commands', 'plugin'], ['LuckPerms', 'Permissions', 'plugin'], ['WorldEdit', 'In-game editing', 'plugin'], ['Dynmap', 'Live map · heavy on memory', 'plugin'], ['Vault', 'Economy API', 'plugin'], ['CoreProtect', 'Rollback and logs', 'plugin']]
  return (
    <div className="space-y-5"><Q t="Plugins and mods" d="Optional. Installed before the first start." /><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" /><input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search plugins" placeholder="Search" className={cn(inputCls(), 'pl-9')} /></div>
      <div className="space-y-2">{all.filter((a) => a[0].toLowerCase().includes(q.toLowerCase())).map(([n, d]) => { const on = c.mods.includes(n); return <label key={n} className={cn('flex cursor-pointer items-center gap-4 rounded-xl border p-3.5 transition-colors', on ? 'border-fg bg-white/[0.04]' : 'border-line-2 hover:border-white/30')}><Checkbox checked={on} onCheckedChange={(v) => set({ mods: v ? [...c.mods, n] : c.mods.filter((x) => x !== n) })} /><span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">{n}</span><span className="block text-[12.5px] text-dim">{d}</span></span></label> })}</div></div>
  )
}
function MailDomain({ c, set }) {
  return <div className="space-y-5"><Q t="Which domain?" d="Mailboxes will look like name@your-domain." /><FormField label="Domain"><input value={c.mdomain} onChange={(e) => set({ mdomain: e.target.value })} className={cn(inputCls(), 'font-mono')} /></FormField><InlineAlert tone="info" title="We will show the DNS records after checkout">MX, SPF, DKIM and DMARC. Mail keeps working where it is until you switch them.</InlineAlert></div>
}
function MailPlan({ c, set }) {
  return <div className="space-y-5"><Q t="Pick a plan" d="Per domain. Mailboxes are shared by the whole plan." /><RadioGroup value={String(c.mplan)} onValueChange={(v) => set({ mplan: +v })} className="grid gap-3 sm:grid-cols-3">{MAILPLANS.map((p, i) => <RadioCard key={p[0]} value={String(i)} className="p-4"><div className="text-[13px] text-dim">{p[1]}</div><div className="mt-3 flex items-end gap-2"><DotNum text={money(p[4]).replace('.00', '')} height={28} animate={false} /><span className="pb-0.5 text-[11.5px] text-dim">/ mo</span></div><div className="mt-3 text-[12px] text-mute">{p[3]}</div></RadioCard>)}</RadioGroup></div>
}
function Boxes({ c, set }) {
  const [t, setT] = useState('')
  const max = MAILPLANS[c.mplan][2]
  return <div className="space-y-5"><Q t="First mailboxes" d={`${c.boxes.length} of ${max} used. Add the rest later.`} /><div className="space-y-2">{c.boxes.map((b) => <div key={b} className="flex items-center gap-3 rounded-lg border border-line p-3 text-[13.5px]"><Mail className="size-4 text-dim" /><span className="font-mono">{b}@{c.mdomain}</span><button type="button" aria-label={`Remove ${b}`} onClick={() => set({ boxes: c.boxes.filter((x) => x !== b) })} className="ml-auto text-dim hover:text-fg">Remove</button></div>)}</div><form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = t.trim().toLowerCase(); if (v && !c.boxes.includes(v) && c.boxes.length < max) { set({ boxes: [...c.boxes, v] }); setT('') } }}><input value={t} onChange={(e) => setT(e.target.value)} placeholder="name" aria-label="New mailbox name" className={cn(inputCls(), 'font-mono')} /><Button type="submit" variant="outline">Add</Button></form></div>
}

/* ------------------------------------------------------------ review, checkout ------------------------------------------------------------ */
function Review({ c, set, type, q, go }) {
  const rows = []
  const T = TYPES[type]
  if (['app', 'bot', 'site'].includes(type)) rows.push(['Source', c.source === 'git' ? `${c.repo} · ${c.branch}` : c.source === 'zip' ? c.zip || 'no file yet' : c.repo, 0])
  if (['app', 'bot'].includes(type)) rows.push(['Runtime', `${RUNTIMES.find((r) => r[0] === c.runtime)[1]} ${RUNTIMES.find((r) => r[0] === c.runtime)[2][c.ver]}`, 1])
  if (type === 'game') rows.push(['Edition', `${c.edition} ${c.gver}`, 0], ['Mods', c.mods.join(', ') || 'none', 2])
  if (type === 'db') rows.push(['Engine', `${ENGINES.find((e) => e[0] === c.engine)[1]} ${ENGINES.find((e) => e[0] === c.engine)[2][c.ver]}`, 0])
  if (type === 'vps') rows.push(['System', c.os, 0])
  if (type === 'mail') rows.push(['Domain', c.mdomain, 0], ['Mailboxes', c.boxes.map((b) => b + '@').join(' '), 2])
  if (type !== 'mail') rows.push(['Region', c.region, type === 'site' ? 1 : 1])
  if (['app', 'site'].includes(type)) rows.push(['Address', c.domain === 'free' ? `${c.sub}.blipmade.app` : c.custom_domain || 'your domain', type === 'app' ? 5 : 2])
  return (
    <div className="space-y-5"><Q t="Check your order" d="Nothing is created or charged until you pay." />
      <dl className="divide-y divide-line rounded-xl border border-line">{rows.map(([k, v, s]) => <div key={k} className="flex items-center gap-4 px-4 py-3 text-[13.5px]"><dt className="w-24 shrink-0 text-dim">{k}</dt><dd className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{v}</dd><button type="button" onClick={() => go(s)} className="link-grow text-[12.5px] text-mute hover:text-fg">Edit</button></div>)}</dl>
      <div className="grid gap-4 sm:grid-cols-2"><FormField label="Billing"><BillingPeriod value={c.period} onChange={(v) => set({ period: v })} /></FormField><FormField label="Promo code" hint={c.promo && c.promo.toUpperCase() !== 'BLIP20' ? 'This code is not valid or has expired' : c.promo ? '20% off applied' : undefined} error={c.promo && c.promo.toUpperCase() !== 'BLIP20' ? 'Code not recognised' : undefined}><input value={c.promo} onChange={(e) => set({ promo: e.target.value })} placeholder="BLIP20" className={cn(inputCls(c.promo && c.promo.toUpperCase() !== 'BLIP20'), 'font-mono uppercase')} /></FormField></div>
      <label className="flex items-start gap-3 text-[13px] text-mute"><Checkbox className="mt-0.5" checked={c.terms} onCheckedChange={(v) => set({ terms: !!v })} />I agree to the terms of service and the acceptable use policy.</label></div>
  )
}
function Checkout({ c, set, q, scenario, onPaid }) {
  const [st, run, reset] = useSim(1500)
  const [three, setThree] = useState(false)
  const pay = () => { if (scenario === 'declined') { run(true); return } run(false, () => (c.pay === 'card' ? setThree(true) : onPaid())) }
  return (
    <div className="space-y-5"><Q t="Payment" d={`You pay ${money(q.total * 1.19)} today, VAT included.`} />
      <RadioGroup value={c.pay} onValueChange={(v) => { set({ pay: v }); reset() }} className="grid gap-3">
        <RadioCard value="card" className="p-4"><div className="flex items-center gap-3"><CreditCard className="size-4 text-dim" /><div><div className="text-[14px] font-medium">Visa ending 6411</div><div className="text-[12.5px] text-dim">Expires 09/28 · default</div></div></div></RadioCard>
        <RadioCard value="credit" className="p-4"><div className="flex items-center gap-3"><Lock className="size-4 text-dim" /><div><div className="text-[14px] font-medium">Account credit</div><div className="text-[12.5px] text-dim">$42.50 available{q.total * 1.19 > 42.5 ? ' · not enough for this order' : ''}</div></div></div></RadioCard>
        <RadioCard value="new" className="p-4"><div className="flex items-center gap-3"><CreditCard className="size-4 text-dim" /><div className="text-[14px] font-medium">Use a new card</div></div></RadioCard>
      </RadioGroup>
      {c.pay === 'new' && <div className="step-in grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><FormField label="Card number"><input inputMode="numeric" placeholder="4242 4242 4242 4242" className={cn(inputCls(), 'font-mono')} /></FormField></div><FormField label="Expiry"><input placeholder="MM / YY" className={cn(inputCls(), 'font-mono')} /></FormField><FormField label="CVC"><input placeholder="123" className={cn(inputCls(), 'font-mono')} /></FormField></div>}
      {st === 'failed' && <InlineAlert tone="bad" title="Your bank declined the payment" action={<Button size="sm" variant="outline" onClick={() => set({ pay: 'new' })}>Use another card</Button>}>Nothing was charged. Try again, or pick another way to pay.</InlineAlert>}
      {three && <div className="step-in rounded-xl border border-line-2 bg-black p-5 text-center"><ShieldCheck className="mx-auto size-6 text-dim" /><div className="mt-2 text-[14px] font-medium">Confirm in your banking app</div><p className="mt-1 text-[12.5px] text-dim">Your bank asked for a second check. This window continues by itself.</p><Button className="mt-4" size="sm" onClick={() => { setThree(false); onPaid() }}>I approved it</Button></div>}
      <div className="flex items-center gap-2 text-[12px] text-dim"><Lock className="size-3.5" />Payments are encrypted. We never see or store your full card number.</div>
      <Button size="lg" className="w-full" loading={st === 'running'} disabled={c.pay === 'credit' && q.total * 1.19 > 42.5} onClick={pay}>{st === 'failed' ? 'Try again' : `Pay ${money(q.total * 1.19)}`}</Button></div>
  )
}

/* ------------------------------------------------------------ provisioning and result ------------------------------------------------------------ */
const PSTEPS = ['Order accepted', 'Payment confirmed', 'Reserving capacity', 'Creating the instance', 'Installing and starting', 'Opening the network']
function Provision({ type, c, scenario, onDone, onChangeRegion, restart }) {
  const [i, setI] = useState(0), [st, setSt] = useState('run'), [attempt, setAttempt] = useState(1)
  const T = TYPES[type]
  useEffect(() => { setI(0); setSt('run') }, [restart, attempt])
  useEffect(() => {
    if (st !== 'run') return
    const t = setTimeout(() => { if (scenario === 'capacity' && attempt === 1 && i === 2) { setSt('fail'); return } if (i >= PSTEPS.length - 1) { setSt('ok'); return } setI((n) => n + 1) }, 1000)
    return () => clearTimeout(t)
  }, [i, st, scenario, attempt])
  const steps = PSTEPS.map((n, k) => ({ name: n, state: st === 'fail' && k === i ? 'failed' : k < i || st === 'ok' ? 'done' : k === i ? 'running' : 'queued', ms: k < i || st === 'ok' ? 600 + k * 330 : st === 'fail' && k === i ? 8400 : undefined, hint: k === 2 ? c.region : undefined, log: st === 'fail' && k === i ? [`› requesting capacity in ${c.region}`, '› host answered: no free memory', 'error: capacity timeout after 8.4 s'] : undefined }))
  if (st === 'ok') return <Result type={type} c={c} onDone={onDone} />
  return (
    <div className="space-y-6">
      <StateHero state={st === 'fail' ? 'waiting' : 'thinking'} role={T.blip} word={st === 'fail' ? 'NO ROOM.' : 'BUILDING.'} tone={st === 'fail' ? 'bad' : undefined} sub={st === 'fail' ? `${c.region} is full right now. Your payment is held, not taken.` : `Setting up your ${T.label.toLowerCase()}. This usually takes under a minute.`} />
      <DotRail value={(i + (st === 'run' ? 0.5 : 0)) / PSTEPS.length} state={st === 'fail' ? 'fail' : 'run'} n={36} className="justify-center" />
      <div className="mx-auto max-w-md"><JobTimeline steps={steps} /></div>
      {st === 'fail' && <div className="step-in mx-auto flex max-w-md flex-wrap justify-center gap-2"><Button onClick={() => setAttempt(2)}>Try again here</Button><Button variant="outline" onClick={onChangeRegion}>Choose another region</Button><Button variant="ghost" onClick={() => toast('Payment released (simulated)')}>Cancel and release payment</Button></div>}
    </div>
  )
}
function Result({ type, c, onDone }) {
  const T = TYPES[type]
  const rows = { app: [['Address', `${c.sub}.blipmade.app`], ['Build', 'Passed in 38 s'], ['Region', c.region]], bot: [['Status', 'Online'], ['Logs', 'Streaming'], ['Region', c.region]], game: [['Connect', '45.83.12.9:25565'], ['Edition', `${c.edition} ${c.gver}`], ['Console', 'Ready']], db: [['Host', 'pg-7f3a.blipmade.app'], ['Port', '5432'], ['Password', 'shown once, next page']], site: [['Address', `${c.sub}.blipmade.app`], ['HTTPS', 'Active'], ['Region', c.region]], vps: [['IPv4', '45.83.12.9'], ['User', 'root'], ['Sign in', 'with your SSH key']], mail: [['Domain', c.mdomain], ['Next', 'Add the DNS records'], ['Mailboxes', String(c.boxes.length)]] }[type]
  return (
    <div className="space-y-6"><StateHero state="happy" role={T.blip} word="LIVE." sub={`Your ${T.label.toLowerCase()} is ready.`} /><dl className="mx-auto max-w-md divide-y divide-line rounded-xl border border-line">{rows.map(([k, v]) => <div key={k} className="flex items-center justify-between gap-4 px-4 py-3 text-[13.5px]"><dt className="text-dim">{k}</dt><dd className="font-mono text-[12.5px]">{v}</dd></div>)}</dl><div className="flex flex-wrap justify-center gap-2"><Button onClick={onDone}>Open it<ArrowRight /></Button><Button variant="outline" onClick={onDone}>Deploy another</Button></div></div>
  )
}

/* ------------------------------------------------------------ the studio ------------------------------------------------------------ */
export default function DeployStudio({ initialType = 'app', initialScenario = 'ok', hideSwitch }) {
  const [type, setType] = useState(initialType), [c, setC] = useState(FRESH), [step, setStep] = useState(0), [phase, setPhase] = useState('configure'), [scenario, setScenario] = useState(initialScenario), [run, setRun] = useState(0)
  const set = (p) => setC((o) => ({ ...o, ...p }))
  const T = TYPES[type], steps = T.steps, last = steps.length - 1
  const q = useMemo(() => price(type, c), [type, c])
  const body = useRef(null)
  useEffect(() => { body.current?.scrollIntoView?.({ block: 'nearest' }) }, [step])
  const pickType = (t) => { setType(t); setC(FRESH()); setStep(0); setPhase('configure'); setRun((n) => n + 1) }
  const name = steps[step]
  const valid = name === 'Review' ? c.terms && !(c.promo && c.promo.toUpperCase() !== 'BLIP20') : name === 'Source' && c.source === 'zip' ? !!c.zip : name === 'Domain' && type !== 'mail' && c.domain === 'custom' ? !!c.custom_domain : name === 'Environment' && type === 'bot' ? c.pass.length > 5 : true
  const view = { Source: Source, Runtime: Runtime, Edition: Edition, Engine: Engine, Plan: Plan, Environment: Env, 'Add-ons': Addons, Domain: type === 'mail' ? MailDomain : Domain, System: System, Access: Access, Mods: Mods, Mailboxes: Boxes }[name]
  const Step = name === 'Plan' && type === 'mail' ? MailPlan : view
  const Summary = (
    <div className="space-y-4">
      <div className={eyebrow}>Your order</div>
      <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg border border-line-2 text-mute"><T.icon className="size-4" /></span><div><div className="text-[14px] font-medium">{T.label}</div><div className="font-mono text-[11.5px] text-dim">{type === 'mail' ? c.mdomain : c.region}</div></div></div>
      <div className="space-y-2 border-t border-line pt-4 text-[13px]">{q.lines.map(([l, p]) => <div key={l} className="flex justify-between gap-3 text-mute"><span className="min-w-0 truncate">{l}</span><span className="tabular-nums">{money(p)}</span></div>)}{q.disc !== 0 && <div className="flex justify-between text-ok"><span>{c.period === 'y' ? 'Yearly' : 'Quarterly'} discount</span><span>−{money(-q.disc)}</span></div>}{q.promo !== 0 && <div className="flex justify-between text-ok"><span>BLIP20</span><span>−{money(-q.promo)}</span></div>}</div>
      <div className="flex items-end justify-between border-t border-line pt-4"><span className="text-[12.5px] text-dim">Per {c.period === 'y' ? 'month, billed yearly' : c.period === 'q' ? 'month, billed quarterly' : 'month'}</span><AnimatedPrice value={q.total} height={26} /></div>
      <p className="text-[11.5px] text-dim">Prices in USD, VAT added at checkout. Hourly billing is available on VPS.</p>
    </div>
  )
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Product type">{Object.entries(TYPES).map(([id, t]) => <button key={id} role="tab" aria-selected={type === id} onClick={() => pickType(id)} className={cn('flex h-8 items-center gap-2 rounded-full border px-3 text-[12.5px] outline-none transition-[border-color,background-color,color] duration-150 focus-visible:border-white/50', type === id ? 'border-fg/70 bg-white/[0.07] text-fg' : 'border-line-2 text-mute hover:border-white/25 hover:text-fg')}><t.icon className="size-3.5" />{t.label}</button>)}</div>
        {!hideSwitch && <div className="flex items-center gap-2"><span className={eyebrow}>Scenario</span><Segmented value={scenario} onValueChange={(v) => v && setScenario(v)} options={[['ok', 'Works'], ['declined', 'Card declined'], ['capacity', 'No capacity']]} /></div>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-6">
          {phase === 'configure' && <Stepper steps={steps} current={step} onStep={setStep} />}
          <div ref={body} key={phase + (phase === 'configure' ? name + type : run)} className="step-in min-h-[320px]">
            {phase === 'configure' && (name === 'Review' ? <Review c={c} set={set} type={type} q={q} go={setStep} /> : <Step c={c} set={set} type={type} />)}
            {phase === 'checkout' && <Checkout c={c} set={set} q={q} scenario={scenario} onPaid={() => setPhase('provision')} />}
            {phase === 'provision' && <Provision key={run} type={type} c={c} scenario={scenario} restart={run} onChangeRegion={() => { setPhase('configure'); setStep(steps.indexOf('Plan') >= 0 ? steps.indexOf('Plan') : 0) }} onDone={() => pickType(type)} />}
          </div>
          {phase !== 'provision' && (
            <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
              <Button variant="ghost" disabled={phase === 'configure' && step === 0} onClick={() => (phase === 'checkout' ? setPhase('configure') : setStep(step - 1))}><ArrowLeft />Back</Button>
              {phase === 'configure' && <Button disabled={!valid} onClick={() => (step === last ? setPhase('checkout') : setStep(step + 1))}>{step === last ? 'Continue to payment' : 'Continue'}<ArrowRight /></Button>}
            </div>
          )}
        </div>
        {phase !== 'provision' && <aside className="rounded-xl border border-line bg-card p-5 lg:sticky lg:top-0 max-lg:order-first">{Summary}</aside>}
      </div>
    </div>
  )
}
