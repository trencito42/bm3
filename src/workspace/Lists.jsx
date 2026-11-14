import { useState } from 'react'
import { ExternalLink, Monitor, RotateCw, Smartphone } from 'lucide-react'
import { Button, Segmented } from '../components/ui.jsx'
import { Doc } from './Doc.jsx'
import { cn } from '../lib/utils'

const PAGES = {
  apps: ['/apps', [['', 'Seven instances'], ['?s=empty', 'Empty'], ['?s=loading', 'Loading'], ['?s=error', 'Error']]],
  vps: ['/vps', [['', 'Two servers'], ['?s=one', 'One server'], ['?s=empty', 'Empty'], ['?s=loading', 'Loading'], ['?s=error', 'Error']]],
  domains: ['/domains', [['', 'Four domains'], ['?s=empty', 'Empty'], ['?s=loading', 'Loading'], ['?s=error', 'Error']]],
}

/* the real page in the real shell (sidebar or bottom bar included), in a frame. Mobile is the default: it is where the old pages hurt most. */
function Frames({ page }) {
  const [path, states] = PAGES[page]
  const [i, setI] = useState(0), [view, setView] = useState('mobile'), [run, setRun] = useState(0)
  const src = `${location.pathname}#${path}${states[i][0]}`
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="State" className="flex flex-wrap gap-1.5">{states.map(([q, l], k) => <button key={q} role="tab" aria-selected={k === i} onClick={() => { setI(k); setRun((n) => n + 1) }} className={cn('h-8 rounded-full border px-3 text-[12.5px] outline-none transition-[border-color,background-color,color] duration-150 focus-visible:border-white/50', k === i ? 'border-fg/70 bg-white/[0.07] text-fg' : 'border-line-2 text-mute hover:border-white/25 hover:text-fg')}>{l}</button>)}</div>
        <div className="flex items-center gap-2"><Segmented value={view} onValueChange={(v) => v && setView(v)} options={[['mobile', <span key="m" className="flex items-center gap-1.5"><Smartphone className="size-3.5" />Phone</span>], ['desktop', <span key="d" className="flex items-center gap-1.5"><Monitor className="size-3.5" />Desktop</span>]]} /><Button size="sm" variant="ghost" onClick={() => setRun((n) => n + 1)}><RotateCw />Reload</Button><Button size="sm" variant="ghost" onClick={() => window.open(src, '_blank', 'noopener')}><ExternalLink />Open</Button></div>
      </div>
      <div className="grid place-items-center overflow-hidden rounded-xl border border-line bg-[#050506] p-3 sm:p-5"><iframe key={src + view + run} title={`${page} ${view}`} src={src} className={cn('block rounded-xl border border-line-2 bg-bg', view === 'mobile' ? 'h-[780px] w-[390px] max-w-full' : 'h-[760px] w-full')} /></div>
    </div>
  )
}

const Changes = () => (
  <div className="overflow-x-auto rounded-xl border border-line">
    <table className="w-full min-w-[620px] text-[13.5px]"><thead><tr className="border-b border-line font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><th className="px-4 py-3 text-left font-normal">Before</th><th className="px-4 py-3 text-left font-normal">Now</th><th className="px-4 py-3 text-left font-normal">Why</th></tr></thead>
      <tbody className="[&_td]:border-b [&_td]:border-line/50 [&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_tr:last-child_td]:border-b-0">
        {[
          ['The title twice: in the bar and again on the page', 'Once, in the bar. The page opens with a line of counts and the monthly total', 'The first line should tell you something you did not know'],
          ['Three ways to deploy on one screen (sidebar, bar, page)', 'One primary action, in the bar. A plus on phones', 'One obvious next step'],
          ['Addresses in red', 'Quiet mono text, a copy button on hover, "Copy address" in the menu', 'Red means live or broken, nothing else'],
          ['Prices as large dot-matrix numerals in every row', 'Small mono numerals, right-aligned, one total at the top', 'Dot-matrix is for one headline number, not seven'],
          ['Tabs, a search field and three dropdowns', 'Search, one row of chips with counts, one sort control', 'Seven items do not need five filters; chips show what exists'],
          ['Every action behind the three dots', 'Restart (or Start) on the row itself; the rest in the menu', 'The common thing is one press away'],
          ['Stopped instances lost among the rest', 'A "Needs you" group on top', 'Problems first'],
          ['Phone: rows without address or price, three dropdowns in a row', 'Three-line rows with status, size, address and price; chips scroll sideways; sort in a sheet', 'Nothing is missing on a phone that is there on a desktop'],
          ['Phone: the menu is a small dropdown', 'A bottom sheet with 48 px rows', 'Thumb reach, no mis-taps'],
          ['Phone: the chat bubble sits on top of the rows', 'Chat is a button in the bar on phones', 'Nothing floats over content you need to press'],
          ['One server in a five-column table, the SSH command cut off', 'A card per server with the full command, copy, live use and the two buttons you need', 'A table is for many; one or two things deserve room'],
          ['Domains: a search form first, the list second', 'Connect a domain in one field on top, then your domains; the pending one shows the record to add and a "Check now"', 'The page is about your domains'],
        ].map(([a, b, c]) => <tr key={a}><td className="text-dim">{a}</td><td>{b}</td><td className="text-mute">{c}</td></tr>)}
      </tbody></table>
  </div>
)

export default function Lists() {
  return (
    <Doc title="App lists" lead="The three inventory pages of the customer app, redesigned for a desktop and, separately, for a phone: Apps and databases, Servers, Domains. Each frame is the real page inside the real shell. Press things: the menus, Restart, the pending domain, the search and the chips." sections={[
      { id: 'apps', title: 'Apps and databases', note: 'rows that answer the questions without opening them', node: <Frames page="apps" /> },
      { id: 'vps', title: 'Servers', note: 'a card per server while there are few', node: <Frames page="vps" /> },
      { id: 'domains', title: 'Domains', note: 'connect on top, problems opened for you', node: <Frames page="domains" /> },
      { id: 'changes', title: 'What changed and why', node: <Changes /> },
      { id: 'rules', title: 'Rules for every list page', node: (
        <ul className="space-y-3 text-[14px] leading-relaxed text-mute">
          <li><b className="font-medium text-fg">Row anatomy, always in this order:</b> what it is and its state, where it is, how it is doing, what it costs, what you can do.</li>
          <li><b className="font-medium text-fg">Phone rows are designed, not squeezed:</b> three lines, the whole row opens the item, a 44 px menu button, actions in a bottom sheet.</li>
          <li><b className="font-medium text-fg">Inputs are 16 px on phones</b> so the browser does not zoom, and the toolbar sticks under the bar while you scroll.</li>
          <li><b className="font-medium text-fg">Few items get cards, many get rows.</b> Up to three servers: cards. More: the same row as instances.</li>
          <li><b className="font-medium text-fg">Every list has four states:</b> content, empty with the next step, loading in the shape of the page, and an error that says your things are fine.</li>
        </ul>
      ) },
    ]} />
  )
}
