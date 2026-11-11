import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Doc } from './Doc.jsx'
import { MatrixLoader, Skeleton } from '../components/loaders.jsx'
import { SKELETONS, Sk } from '../components/pageSkeletons.jsx'
import { cn } from '../lib/utils'

/* [kind, route that opens the real page, so the skeleton can be compared with what replaces it] */
const GROUPS = [
  ['Customer app', 'Each one uses the frames of its page: the same cards, columns and proportions.', [['overview', '/'], ['apps', '/apps'], ['instance', '/apps/api-gateway'], ['services', '/services'], ['vps', '/vps'], ['domains', '/domains'], ['mail', '/email'], ['billing', '/billing'], ['invoices', '/invoices'], ['support', '/support'], ['catalog', '/catalog'], ['account', '/account'], ['notifications', '/notifications'], ['builder', '/builder']]],
  ['Admin', 'Dashboards, lists, detail pages, the desk, the catalogue studio and editors.', [['adminDash', '/admin'], ['adminList', '/admin/customers'], ['adminDetail', '/admin/customers/cus_2041'], ['adminDesk', '/admin/support'], ['adminCatalog', '/admin/products'], ['adminForm', '/admin/pricing']]],
  ['Public site', 'Marketing pages keep their header and footer; only the page itself is replaced.', [['home', '/site'], ['products', '/site/products'], ['product', '/site/products/vps'], ['appsCatalog', '/site/apps'], ['blog', '/site/blog'], ['post', '/site/blog/november-changelog'], ['docs', '/site/docs'], ['status', '/site/status'], ['changelog', '/site/changelog'], ['contact', '/site/contact'], ['legal', '/site/legal/terms'], ['auth', '/site/login']]],
]

function Card({ kind, to }) {
  const nav = useNavigate()
  const [label] = SKELETONS[kind]
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-3"><span className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">{label}</span><button onClick={() => nav(to)} className="link-grow inline-flex items-center gap-1 text-[12px] text-mute hover:text-fg">Open the page<ArrowRight className="size-3" /></button></div>
      <div className={cn('relative h-[330px] overflow-hidden rounded-xl border border-line bg-bg')}>
        <div className="pointer-events-none origin-top-left p-4 [transform:scale(.62)] [width:161%]"><div className="space-y-6"><Sk kind={kind} /></div></div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg to-transparent" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <Doc title="Loading screens" lead="What a page shows while its data is on its way. Each page has a skeleton built from its own frames, in the same dot-matrix language as the type: a faint grid, dots that pop with a flash of red, and a glitch now and then. When the page arrives it settles into the places the blocks held. They are shown here at 62%; open the page to see the real transition (it waits about 0.7 seconds on purpose)." sections={[
      { id: 'parts', title: 'The two building blocks', node: <div className="grid gap-5 md:grid-cols-2"><div className="space-y-3 rounded-xl border border-line bg-card p-5"><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Skeleton</div><Skeleton className="h-4 w-1/3" /><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-4/5" /><Skeleton className="size-16 rounded-full" /></div><div className="rounded-xl border border-line bg-card"><div className="px-5 pt-5 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Matrix loader</div><MatrixLoader label="Loading servers" /></div></div> },
      ...GROUPS.map(([title, note, items]) => ({ id: title.toLowerCase().replace(/\W+/g, '-'), title, note, node: <div className="grid gap-6 lg:grid-cols-2">{items.map(([k, to]) => <Card key={k} kind={k} to={to} />)}</div> })),
    ]} />
  )
}
