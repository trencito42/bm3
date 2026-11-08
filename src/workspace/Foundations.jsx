import { useState } from 'react'
import { Activity, Bell, CreditCard, Database, Folder, Globe, KeyRound, LifeBuoy, Mail, Server, Settings, Shield, Terminal, User, Wand2, Archive, Cpu, HardDrive, Network, Receipt } from 'lucide-react'
import { Doc, Demo, Row } from './Doc.jsx'
import { DotText } from '../builder/FxBits.jsx'
import { DotNum } from '../components/DotViz.jsx'
import { Button, Badge, Segmented } from '../components/ui.jsx'
import { cn } from '../lib/utils'

const Swatch = ({ name, hex, note, ring }) => (
  <div className="space-y-2"><div className={cn('h-16 rounded-lg border border-line-2', ring)} style={{ background: hex }} /><div><div className="text-[12.5px] font-medium">{name}</div><div className="font-mono text-[11px] text-dim">{hex}{note && ` · ${note}`}</div></div></div>
)

function Colors() {
  return (
    <>
      <Demo label="Surfaces · each step sits on the previous">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Swatch name="sidebar" hex="#0b0b0d" note="rail" /><Swatch name="background" hex="#0d0d0f" note="page" /><Swatch name="card" hex="#141416" note="panels" /><Swatch name="muted" hex="#18181b" note="composer" /><Swatch name="accent" hex="#1d1d21" note="hover" />
        </div>
      </Demo>
      <Demo label="Lines & text">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Swatch name="border" hex="#1c1c20" /><Swatch name="border-strong" hex="#2a2a2f" /><Swatch name="foreground" hex="#f2f2f3" note="15.9:1" /><Swatch name="muted-fg" hex="#8e8e94" note="5.6:1" /><Swatch name="dim" hex="#6b6b72" note="3.7:1 · meta only" />
        </div>
      </Demo>
      <Demo label="Semantic · used for state only, never decoration">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Swatch name="brand" hex="#ff2d36" note="active icon, live dot" /><Swatch name="ok" hex="#4ade80" /><Swatch name="warn" hex="#fbbf24" /><Swatch name="bad" hex="#f87171" /><Swatch name="info" hex="#60a5fa" />
        </div>
        <p className="mt-4 text-[12.5px] text-dim">Red is the single brand accent and appears only as an active-state signal. Status colours are always paired with a label or icon, never colour alone.</p>
      </Demo>
    </>
  )
}

const SCALE = [['Display', 'DotText · 40/48', null], ['Heading 1', 'Inter 600 · 28/34 · −0.02em', 'text-[28px] font-semibold tracking-tight'], ['Heading 2', 'Inter 600 · 18/26', 'text-lg font-semibold tracking-tight'], ['Body', 'Inter 400 · 13.5/21', 'text-[13.5px]'], ['Body small', 'Inter 400 · 12.5/18 · muted', 'text-[12.5px] text-mute'], ['Label', 'Geist Mono 10.5 · uppercase · +0.08em', 'font-mono text-[10.5px] uppercase tracking-[.08em] text-dim'], ['Code', 'Geist Mono 12.5/24', 'font-mono text-[12.5px]']]
function Type() {
  return (
    <Demo label="Scale">
      <div className="divide-y divide-line/60">
        {SCALE.map(([n, spec, cls]) => (
          <div key={n} className="grid items-center gap-4 py-3 sm:grid-cols-[130px_1fr_260px]"><span className="text-[12px] text-dim">{n}</span><span>{cls ? <span className={cls}>Servers that stay out of your way</span> : <DotText text="HELLO, STEFAN" height={34} />}</span><span className="font-mono text-[11px] text-dim">{spec}</span></div>
        ))}
        <div className="grid items-center gap-4 py-3 sm:grid-cols-[130px_1fr_260px]"><span className="text-[12px] text-dim">Dot numerals</span><DotNum text="$42.50  99.98%" height={28} animate={false} /><span className="font-mono text-[11px] text-dim">5×7 grid · r 0.4 · currentColor</span></div>
      </div>
      <p className="mt-4 text-[12.5px] text-dim">Dot-matrix type is reserved for the logo, hero headings and key numerals (balance, totals, KPIs). Never for paragraphs.</p>
    </Demo>
  )
}
function Spacing() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Demo label="Spacing · 4px base"><div className="space-y-2">{[4, 8, 12, 16, 20, 24, 32, 48].map((n) => <div key={n} className="flex items-center gap-3"><span className="w-10 font-mono text-[11px] text-dim">{n}</span><i className="h-3 rounded-sm bg-fg/80" style={{ width: n * 3 }} /></div>)}</div></Demo>
      <Demo label="Radius"><div className="grid grid-cols-3 gap-3">{[['6', 'chips, kbd'], ['8', 'buttons'], ['10', 'nav rows'], ['12', 'cards, inputs'], ['16', 'dialogs'], ['999', 'badges, pills']].map(([r, u]) => <div key={r} className="space-y-1.5"><div className="h-14 border border-line-2 bg-white/[0.04]" style={{ borderRadius: +r }} /><div className="font-mono text-[11px]">{r}</div><div className="text-[11px] text-dim">{u}</div></div>)}</div></Demo>
      <Demo label="Elevation · by border, not blur"><div className="space-y-3 text-[12.5px]">{[['Page', 'bg #0d0d0f · no border'], ['Panel', 'card · 1px #1c1c20'], ['Raised', 'card · 1px #2a2a2f (hover, popovers)'], ['Overlay', 'scrim 60% + 3px blur · dialog shadow 40px']].map(([a, b], i) => <div key={a} className={cn('rounded-lg p-3', i === 0 ? 'bg-bg' : 'bg-card', i === 1 && 'border border-line', i >= 2 && 'border border-line-2', i === 3 && 'shadow-2xl shadow-black/70')}><div className="font-medium">{a}</div><div className="text-dim">{b}</div></div>)}</div></Demo>
    </div>
  )
}
const ICONS = [[Server, 'Server'], [Database, 'Database'], [Globe, 'Domain'], [Mail, 'Mail'], [Terminal, 'Console'], [Folder, 'Files'], [Archive, 'Backup'], [Network, 'Network'], [Shield, 'Security'], [KeyRound, 'SSH key'], [Receipt, 'Invoice'], [CreditCard, 'Payment'], [LifeBuoy, 'Support'], [Bell, 'Alerts'], [Cpu, 'CPU'], [HardDrive, 'Disk'], [Activity, 'Traffic'], [Wand2, 'AI'], [User, 'Account'], [Settings, 'Settings']]
function Icons() {
  return (
    <Demo label="Lucide · 1.7 stroke · 17px in nav, 16px in controls, 20px in empty states">
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-10">{ICONS.map(([I, n]) => <div key={n} className="flex flex-col items-center gap-2 rounded-lg border border-line py-4 text-mute transition-colors hover:border-line-2 hover:text-fg"><I className="size-[17px]" /><span className="text-[11px]">{n}</span></div>)}</div>
    </Demo>
  )
}
function Motion() {
  const [k, setK] = useState(0)
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Demo label="Easing · cubic-bezier(.22,.8,.24,1)">
        <div className="space-y-4">
          <div className="relative h-10 rounded-lg bg-white/[0.04]"><i key={k} className="absolute left-2 top-1/2 size-5 -translate-y-1/2 rounded-full bg-fg" style={{ animation: 'slidebox 1s var(--ease-spring) forwards' }} /></div>
          <style>{`@keyframes slidebox{to{left:calc(100% - 28px)}}`}</style>
          <Button variant="outline" size="sm" onClick={() => setK(k + 1)}>Replay</Button>
        </div>
      </Demo>
      <Demo label="Durations">
        <dl className="space-y-2 text-[13px]">{[['Hover / colour', '150 ms'], ['Popover, menu', '140 ms'], ['Dialog, drawer', '220–300 ms'], ['Page enter', '350 ms'], ['Dot wave-in', '1.1 s (stagger 14 ms/col)']].map(([a, b]) => <div key={a} className="flex justify-between"><dt className="text-mute">{a}</dt><dd className="font-mono text-[12px]">{b}</dd></div>)}</dl>
        <p className="mt-3 text-[12.5px] text-dim">All motion respects prefers-reduced-motion: dot animations and the orb stop, transitions drop to 0.</p>
      </Demo>
    </div>
  )
}
function A11y() {
  const [d, setD] = useState('comfortable')
  const pad = { compact: 'h-8 px-3 text-[12.5px]', comfortable: 'h-9 px-4 text-[13px]', touch: 'h-11 px-5 text-sm' }[d]
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Demo label="Focus indicator">
        <div className="flex flex-wrap items-center gap-4"><button className="h-9 rounded-lg border border-line-2 px-4 text-[13px] outline-none ring-2 ring-white/30">Button · focus</button><input className="h-9 rounded-lg border border-white/40 bg-transparent px-3 text-[13px] outline-none ring-2 ring-white/10" defaultValue="Input · focus" /><span className="text-xs text-dim">2px ring, white 30%, offset by border</span></div>
      </Demo>
      <Demo label="Density & touch targets">
        <div className="space-y-4"><Segmented value={d} onValueChange={(v) => v && setD(v)} options={[['compact', 'Compact 32'], ['comfortable', 'Comfortable 36'], ['touch', 'Touch 44']]} /><Row><button className={cn('rounded-lg bg-fg font-medium text-black transition-all', pad)}>Primary</button><button className={cn('rounded-lg border border-line-2 font-medium transition-all', pad)}>Secondary</button><Badge tone="ok">Running</Badge></Row><p className="text-xs text-dim">Mobile uses the 44px touch size for every tappable control; desktop tables use compact rows.</p></div>
      </Demo>
      <Demo label="Contrast (WCAG 2.2 AA)" className="lg:col-span-2"><div className="grid gap-3 sm:grid-cols-4">{[['Foreground on card', '#f2f2f3 / #141416', '15.2:1', 'AAA'], ['Muted on card', '#8e8e94 / #141416', '5.4:1', 'AA'], ['Dim on card', '#6b6b72 / #141416', '3.5:1', 'Meta only'], ['Black on white button', '#0b0b0d / #f2f2f3', '17.6:1', 'AAA']].map(([a, b, c, d2]) => <div key={a} className="rounded-lg border border-line p-3"><div className="text-[12.5px]">{a}</div><div className="font-mono text-[11px] text-dim">{b}</div><div className="mt-1 flex items-center gap-2"><span className="font-mono text-[13px]">{c}</span><Badge dot={false} tone={d2 === 'Meta only' ? 'warn' : 'ok'}>{d2}</Badge></div></div>)}</div></Demo>
    </div>
  )
}
function Layouts() {
  return (
    <Demo label="Breakpoints & grids">
      <div className="space-y-4">
        {[['Phone S', '320–389', '4 col · 16 gutter · bottom nav'], ['Phone L', '390–639', '4 col · 16 gutter · bottom nav'], ['Tablet', '640–1023', '8 col · 24 · rail sidebar'], ['Desktop', '1024–1439', '12 col · 24 · 256 sidebar'], ['Wide', '1440+', '12 col · max 1152 content']].map(([n, r, g]) => (
          <div key={n} className="grid items-center gap-3 sm:grid-cols-[100px_100px_1fr]"><span className="text-[13px] font-medium">{n}</span><span className="font-mono text-[11.5px] text-dim">{r}</span><div className="flex gap-1">{Array.from({ length: n.startsWith('Phone') ? 4 : n === 'Tablet' ? 8 : 12 }, (_, i) => <i key={i} className="h-5 flex-1 rounded-sm bg-white/[0.07]" />)}<span className="ml-2 hidden whitespace-nowrap font-mono text-[11px] text-dim lg:block">{g}</span></div></div>
        ))}
      </div>
    </Demo>
  )
}

export default function Foundations() {
  return <Doc title="Foundations" lead="The visual language of Blipmade: a quiet near-black interface, hairline borders, mono labels, and dot-matrix type reserved for moments that matter. One red accent signals the active state." sections={[
    { id: 'color', title: 'Color', node: <Colors /> },
    { id: 'type', title: 'Typography', node: <Type /> },
    { id: 'space', title: 'Spacing, radius, elevation', node: <Spacing /> },
    { id: 'icons', title: 'Iconography', node: <Icons /> },
    { id: 'motion', title: 'Motion', node: <Motion /> },
    { id: 'a11y', title: 'Accessibility & density', node: <A11y /> },
    { id: 'layout', title: 'Layout grids', node: <Layouts /> },
  ]} />
}
