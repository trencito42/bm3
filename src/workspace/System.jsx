/* System pages: the standalone page the reverse proxy serves when the app cannot answer (public/deploying.html).
   It is one self-contained file with seven states; this section previews each one in an iframe, exactly as a visitor gets it. */
import { useState } from 'react'
import { ExternalLink, Monitor, RotateCw, Smartphone } from 'lucide-react'
import { Badge, Button, Segmented } from '../components/ui.jsx'
import { CodeBlock } from '../components/ui2.jsx'
import { Doc } from './Doc.jsx'
import { cn } from '../lib/utils'

const FILE = import.meta.env.BASE_URL + 'deploying.html'
const STATES = [
  { id: 'deploying', name: 'Deploying', tone: 'bad', when: 'Proxy answers 502, 503 or 504', says: 'BUILDING. / DEPLOYING. / ALMOST LIVE.', note: 'The default. Pip works (light circling), the rail carries a wave, the page checks every few seconds.' },
  { id: 'slow', name: 'Taking longer', tone: 'warn', when: 'Still deploying after 3 minutes', says: 'STILL WORKING. / HANG ON.', note: 'Same situation, honest about the delay. A "Try again" button appears.' },
  { id: 'maintenance', name: 'Maintenance', tone: 'warn', when: '503 with header X-Blip-State: maintenance', says: 'MAINTENANCE. / BACK SOON.', note: 'Planned work. Calmer: the light wanders instead of circling, the wave slows down.' },
  { id: 'busy', name: 'High demand', tone: 'warn', when: 'Proxy answers 429', says: 'ONE MOMENT. / YOU ARE NEXT.', note: 'Too many requests at once. Nothing for the visitor to do.' },
  { id: 'error', name: 'Error', tone: 'bad', when: '500, or any other failure status', says: 'SOMETHING BROKE.', note: 'Pip goes grey and worried, the rail stops where it got to, the noise in the headline is red. Says whose fault it is.' },
  { id: 'offline', name: 'Offline', tone: 'warn', when: 'The request never leaves the device', says: 'NO CONNECTION.', note: 'The visitor\'s network, not ours. Pip looks aside for the signal; the rail is a broken line. Resumes on reconnect.' },
  { id: 'back', name: 'Back online', tone: 'ok', when: 'The first successful answer', says: 'BACK ONLINE.', note: 'Pip hops, the rail fills green, then the page reloads to where the visitor was going.' },
]

const NGINX = `proxy_intercept_errors on;
error_page 500 502 503 504 /deploying.html;

location = /deploying.html {
  root /srv/static;            # outside what the deploy replaces
  internal;
  add_header Retry-After 20 always;
  add_header Cache-Control "no-store" always;
}

# planned maintenance: answer 503 and add
#   add_header X-Blip-State maintenance always;`

function Preview() {
  const [state, setState] = useState('deploying')
  const [view, setView] = useState('desktop')
  const [run, setRun] = useState(0)             // bump to replay the entrance and the decode
  const s = STATES.find((x) => x.id === state)
  const src = `${FILE}?state=${state}`
  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="State" className="flex flex-wrap gap-1.5">
        {STATES.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === state} onClick={() => { setState(x.id); setRun((n) => n + 1) }}
            className={cn('flex h-8 items-center gap-2 rounded-full border px-3 text-[12.5px] outline-none transition-[border-color,background-color,color] duration-150 focus-visible:border-white/50', x.id === state ? 'border-fg/70 bg-white/[0.07] text-fg' : 'border-line-2 text-mute hover:border-white/25 hover:text-fg')}>
            <i className={cn('size-1.5 rounded-full', x.tone === 'ok' ? 'bg-ok' : x.tone === 'warn' ? 'bg-warn' : 'bg-[var(--brand)]')} />{x.name}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-black">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-3 py-2">
          <span className="min-w-0 truncate font-mono text-[11px] text-dim">{src}</span>
          <div className="flex items-center gap-2">
            <Segmented value={view} onValueChange={(v) => v && setView(v)} options={[['desktop', <span key="d" className="flex items-center gap-1.5"><Monitor className="size-3.5" />Desktop</span>], ['mobile', <span key="m" className="flex items-center gap-1.5"><Smartphone className="size-3.5" />Mobile</span>]]} />
            <Button size="sm" variant="ghost" onClick={() => setRun((n) => n + 1)}><RotateCw />Replay</Button>
            <Button size="sm" variant="ghost" onClick={() => window.open(src, '_blank', 'noopener')}><ExternalLink />Open</Button>
          </div>
        </div>
        <div className="grid place-items-center bg-[#050506] p-3 sm:p-5">
          <iframe key={state + view + run} title={`System page: ${s.name}`} src={src} className={cn('block rounded-lg border border-line-2 bg-bg transition-[width] duration-300 ease-[var(--ease-out)]', view === 'mobile' ? 'h-[680px] w-[375px] max-w-full' : 'h-[600px] w-full')} />
        </div>
      </div>

      <div className="grid gap-3 text-[13.5px] sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-card p-4"><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Shows when</div><div className="mt-2">{s.when}</div></div>
        <div className="rounded-xl border border-line bg-card p-4"><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Headline</div><div className="mt-2 font-mono text-[12.5px]">{s.says}</div></div>
        <div className="rounded-xl border border-line bg-card p-4"><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Behaviour</div><div className="mt-2 text-mute">{s.note}</div></div>
      </div>
    </div>
  )
}

const Rules = () => (
  <div className="overflow-x-auto rounded-xl border border-line">
    <table className="w-full min-w-[560px] text-[13.5px]">
      <thead><tr className="border-b border-line font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><th className="px-4 py-3 text-left font-normal">State</th><th className="px-4 py-3 text-left font-normal">Trigger</th><th className="px-4 py-3 text-left font-normal">Headline</th><th className="px-4 py-3 text-left font-normal">Retry button</th></tr></thead>
      <tbody>{STATES.map((x) => (
        <tr key={x.id} className="border-b border-line/50 last:border-b-0">
          <td className="px-4 py-3"><Badge tone={x.tone}>{x.name}</Badge></td>
          <td className="px-4 py-3 text-mute">{x.when}</td>
          <td className="px-4 py-3 font-mono text-[12px] text-fg/80">{x.says}</td>
          <td className="px-4 py-3 text-mute">{['slow', 'error', 'offline'].includes(x.id) ? 'Yes' : 'No'}</td>
        </tr>
      ))}</tbody>
    </table>
  </div>
)

const Serving = () => (
  <div className="grid gap-6 lg:grid-cols-2">
    <ul className="space-y-3 text-[14px] leading-relaxed text-mute">
      <li><b className="font-medium text-fg">One file, nothing to load.</b> Styles, script and the dot-matrix type are inline. While this page is on screen the app, its bundle and its fonts are exactly what is missing.</li>
      <li><b className="font-medium text-fg">It decides the state itself.</b> It asks for the URL it is standing on and reads the real answer: the status code, one optional header, or no answer at all.</li>
      <li><b className="font-medium text-fg">It leaves by itself.</b> The first successful answer shows "Back online" and reloads, so people land where they were going.</li>
      <li><b className="font-medium text-fg">Keep the error status.</b> Served with 200 it would be indexed by search engines, and it could not tell when the site is back.</li>
      <li><b className="font-medium text-fg">Keep it outside the deploy.</b> If the deploy replaces the folder it lives in, it disappears exactly when it is needed.</li>
      <li><b className="font-medium text-fg">No invented numbers.</b> There is no percentage and no countdown, because the page cannot know either. It shows how long you have waited, which is true.</li>
    </ul>
    <CodeBlock lang="nginx" code={NGINX} />
  </div>
)

export default function System() {
  return (
    <Doc
      title="System pages"
      lead="What visitors see when the site cannot answer: during a deploy, during maintenance, when something breaks, when they are offline. One standalone file, served by the proxy, in the same dot-matrix language as the rest of the site."
      sections={[
        { id: 'preview', title: 'States', note: 'the real file, in an iframe', node: <Preview /> },
        { id: 'rules', title: 'When each state shows', note: 'worked out from the server\'s real answer', node: <Rules /> },
        { id: 'serving', title: 'How it is served', node: <Serving /> },
      ]}
    />
  )
}
