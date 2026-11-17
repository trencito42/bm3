import { useState } from 'react'
import { ExternalLink, Monitor, RotateCw, Smartphone } from 'lucide-react'
import { Button, Segmented } from '../components/ui.jsx'
import { Doc } from './Doc.jsx'
import { cn } from '../lib/utils'

const url = () => `${location.pathname}#/bare/petal-home`

function Frame() {
  const [view, setView] = useState('desktop'), [run, setRun] = useState(0)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-dim">BM3's own palette now, not Petal's: near-black surfaces, one red accent. No light mode, matching the rest of this workspace.</p>
        <div className="flex items-center gap-2"><Segmented value={view} onValueChange={(v) => v && setView(v)} options={[['desktop', <span key="d" className="flex items-center gap-1.5"><Monitor className="size-3.5" />Desktop</span>], ['mobile', <span key="m" className="flex items-center gap-1.5"><Smartphone className="size-3.5" />Mobile</span>]]} /><Button size="sm" variant="ghost" onClick={() => setRun((n) => n + 1)}><RotateCw />Reload</Button><Button size="sm" variant="ghost" onClick={() => window.open(url(), '_blank', 'noopener')}><ExternalLink />Open</Button></div>
      </div>
      <div className="grid place-items-center overflow-hidden rounded-xl border border-line bg-[#050506] p-3 sm:p-5">
        <iframe key={view + run} title="Petal homepage" src={url()} className={cn('block rounded-xl border border-line-2', view === 'mobile' ? 'h-[820px] w-[390px] max-w-full' : 'h-[860px] w-full')} />
      </div>
    </div>
  )
}

export default function PetalDoc() {
  return (
    <Doc title="Homepage, rebuilt" lead="A full redesign of the public homepage: Petal's structural law (no borders or shadows, hierarchy from background-color steps only, the motion easing), Graphical's and Alloy's actual devices (a settling card deck, inline icon-pills, a black terminal card, a rail-and-crossfade explorer, a hairline accordion) — all recoloured in BM3's own palette, not Petal's. It is a separate, self-contained page (src/petal/) that does not touch bm3's own tokens, the real /site homepage, or anything inside the app or admin." sections={[
        { id: 'page', title: 'The page', note: 'nav, hero, products, a real configurator, the bridge to the dashboard, pricing, final CTA', node: <Frame /> },
        { id: 'notes', title: 'What this is and isn’t', node: (
          <ul className="space-y-3 text-[14px] leading-relaxed text-mute">
            <li><b className="font-medium text-fg">BM3's colours, Petal's and Graphical's composition.</b> Near-black surfaces, one red accent for the live/primary moment — the same palette as the rest of this workspace, not Petal's blue-on-grey. No light mode, to match.</li>
            <li><b className="font-medium text-fg">No new fonts.</b> Inter and Geist Mono were already loaded by this workspace.</li>
            <li><b className="font-medium text-fg">Every number is reused, not invented.</b> Product prices and the configurator come from the same mock catalog the rest of the workspace uses (lib/mock.js, site/appsData.js). No testimonials, uptime claims or customer counts were added.</li>
            <li><b className="font-medium text-fg">Not verified:</b> only looked at around 1440 and 390 px in this pane; no real device, no screen reader, no Lighthouse run.</li>
          </ul>
        ) },
      ]} />
  )
}
