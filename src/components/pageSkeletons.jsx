/* Page-shaped loading screens. Each one is built from the same frames as the page it stands in for (the same cards, grids, columns and
   proportions), with dot-matrix blocks where the content will be, so when the page arrives it settles into the places the blocks held.
   `SKELETONS` lists every one with a label, and the three `*Kind` helpers pick the right one for a route. */
import { Card, CardBody, CardHeader } from './ui.jsx'
import { Skeleton as B } from './loaders.jsx'
import { cn } from '../lib/utils'

/* ------------------------------ building blocks ------------------------------ */
const Head = ({ sub = true, action = true, w = 'w-64', h = 'h-9' }) => (
  <div className="flex flex-wrap items-end justify-between gap-4"><div className="space-y-3"><B className={cn(h, w)} />{sub && <B className="h-3.5 w-72 max-w-full" />}</div>{action && <B className="h-9 w-28 rounded-lg" />}</div>
)
const Chips = ({ n = 4, search = true }) => (
  <div className="flex flex-wrap items-center gap-2">{Array.from({ length: n }, (_, i) => <B key={i} className="h-8 w-20 rounded-full" />)}{search && <B className="ml-auto h-8 w-52 max-w-full rounded-lg" />}</div>
)
const Stats = ({ n = 4 }) => (
  <div className={cn('grid gap-4 sm:grid-cols-2', n === 4 ? 'xl:grid-cols-4' : n === 3 ? 'xl:grid-cols-3' : '')}>{Array.from({ length: n }, (_, i) => <Card key={i}><CardBody className="space-y-3"><B className="h-3 w-24" /><B className="h-8 w-28" /><B className="h-3 w-32" /></CardBody></Card>)}</div>
)
const Panel = ({ title = true, children, className, pad = true }) => (
  <Card className={cn('overflow-hidden', className)}>{title && <CardHeader><B className="h-3 w-36" /></CardHeader>}<div className={cn(title && 'mt-4', pad && 'px-5 pb-5')}>{children}</div></Card>
)
const Rows = ({ n = 5, h = 'h-4', gap = 'space-y-4' }) => <div className={gap}>{Array.from({ length: n }, (_, i) => <div key={i} className="flex items-center gap-4"><B className={cn(h, 'w-1/3')} /><B className={cn(h, 'w-1/5')} /><B className={cn(h, 'ml-auto w-16')} /></div>)}</div>
const Table = ({ rows = 6, cols = 4 }) => (
  <div>
    <div className="flex gap-6 border-b border-line px-5 py-3">{Array.from({ length: cols }, (_, i) => <B key={i} className={cn('h-2.5', i === 0 ? 'w-24' : 'w-16')} />)}</div>
    {Array.from({ length: rows }, (_, r) => <div key={r} className="flex items-center gap-6 border-b border-line/50 px-5 py-3.5 last:border-b-0">{Array.from({ length: cols }, (_, i) => <B key={i} className={cn('h-4', i === 0 ? 'w-36' : i === cols - 1 ? 'ml-auto w-14' : 'w-20')} />)}</div>)}
  </div>
)
const Tabs = ({ n = 6 }) => <div className="flex gap-6 border-b border-line pb-3">{Array.from({ length: n }, (_, i) => <B key={i} className="h-4 w-16" />)}</div>
const Cards = ({ n = 6, cols = 'sm:grid-cols-2 lg:grid-cols-3', h = 'h-40' }) => <div className={cn('grid gap-4', cols)}>{Array.from({ length: n }, (_, i) => <Card key={i}><CardBody className="space-y-4"><div className="flex items-center gap-3"><B className="size-9 rounded-lg" /><div className="flex-1 space-y-2"><B className="h-4 w-2/3" /><B className="h-3 w-1/3" /></div></div><B className={h} /><div className="flex gap-2"><B className="h-3 w-16" /><B className="h-3 w-12" /></div></CardBody></Card>)}</div>
const Lines = ({ n = 5, last = 'w-2/3' }) => <div className="space-y-3">{Array.from({ length: n }, (_, i) => <B key={i} className={cn('h-4', i === n - 1 ? last : 'w-full')} />)}</div>

/* ------------------------------ customer app ------------------------------ */
const Overview = () => (<>
  <Head w="w-72" h="h-10" />
  <Stats />
  <div className="grid gap-4 lg:grid-cols-3"><Panel className="lg:col-span-2"><B className="h-44" /></Panel><Panel><div className="grid grid-cols-2 place-items-center gap-4 py-2">{[0, 1, 2, 3].map((i) => <B key={i} className="size-24 rounded-full" />)}</div></Panel></div>
  <div className="grid gap-4 lg:grid-cols-5"><Panel className="lg:col-span-3" pad={false}><Table rows={5} /></Panel><Panel className="lg:col-span-2"><Rows n={5} /></Panel></div>
  <Panel><B className="h-12" /></Panel>
</>)
const Apps = () => (<><Head w="w-56" /><Chips n={3} /><Cards n={6} /></>)
const Instance = () => (<>
  <div className="flex flex-wrap items-center justify-between gap-4"><div className="space-y-3"><B className="h-8 w-56" /><B className="h-3.5 w-64 max-w-full" /></div><div className="flex gap-2"><B className="h-9 w-24 rounded-lg" /><B className="h-9 w-24 rounded-lg" /><B className="h-9 w-24 rounded-lg" /></div></div>
  <Tabs n={9} />
  <div className="grid gap-5 lg:grid-cols-3"><Panel className="lg:col-span-2"><div className="space-y-5"><B className="h-3 w-full" /><B className="h-3 w-full" /><B className="h-3 w-full" /><B className="h-40" /></div></Panel><Panel><div className="grid grid-cols-2 gap-2">{[0, 1, 2, 3].map((i) => <B key={i} className="h-20 rounded-lg" />)}</div></Panel></div>
</>)
const Services = () => (<><Head w="w-52" /><Chips n={4} /><Card className="overflow-hidden"><Table rows={8} cols={5} /></Card></>)
const Vps = () => (<><Head w="w-40" /><Chips n={3} /><Card className="overflow-hidden"><Table rows={5} cols={5} /></Card></>)
const Domains = () => (<><Head w="w-44" /><div className="grid gap-4 lg:grid-cols-3"><Panel className="lg:col-span-2" pad={false}><Table rows={6} cols={4} /></Panel><Panel><Lines n={4} /><B className="mt-5 h-9 w-full rounded-lg" /></Panel></div></>)
const Mail = () => (<><Head w="w-40" /><div className="grid items-start gap-5 lg:grid-cols-[230px_1fr]"><div className="flex gap-2 lg:flex-col">{[0, 1, 2].map((i) => <B key={i} className="h-14 w-44 shrink-0 rounded-xl lg:w-full" />)}</div><div className="space-y-5"><Tabs n={7} /><div className="grid gap-5 lg:grid-cols-3"><Panel className="lg:col-span-2"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <B key={i} className="h-16 rounded-lg" />)}</div></Panel><Panel><Lines n={3} /></Panel></div></div></div></>)
const Billing = () => (<><Head w="w-36" sub action={false} /><Tabs n={5} /><Card className="overflow-hidden"><div className="divide-y divide-line">{[0, 1, 2, 3].map((i) => <div key={i} className="flex items-center gap-4 px-5 py-4"><div className="flex-1 space-y-2"><B className="h-4 w-1/2" /><B className="h-3 w-1/4" /></div><B className="h-4 w-14" /><B className="h-6 w-20 rounded-full" /></div>)}</div></Card></>)
const Invoices = () => (<><Head w="w-40" /><Chips n={3} /><Card className="overflow-hidden"><Table rows={7} cols={4} /></Card></>)
const Support = () => (<><div className="flex gap-6"><B className="h-8 w-28" /><B className="h-8 w-28" /></div><div className="grid gap-4 lg:grid-cols-[300px_1fr]"><Card className="overflow-hidden"><div className="divide-y divide-line">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="space-y-2 p-4"><B className="h-3 w-24" /><B className="h-4 w-full" /></div>)}</div></Card><Panel title={false}><div className="space-y-4"><B className="h-12 w-2/3" /><B className="ml-auto h-12 w-1/2" /><B className="h-16 w-3/5" /><B className="h-10 w-full rounded-lg" /></div></Panel></div></>)
const Catalog = () => (<>
  <div className="flex flex-wrap gap-2">{Array.from({ length: 7 }, (_, i) => <B key={i} className="h-8 w-28 rounded-full" />)}</div>
  <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]"><div className="space-y-6"><div className="flex gap-3">{[0, 1, 2, 3, 4].map((i) => <B key={i} className="h-6 w-24 rounded-full" />)}</div><B className="h-6 w-64" /><div className="grid gap-3 sm:grid-cols-3">{[0, 1, 2].map((i) => <B key={i} className="h-32 rounded-xl" />)}</div><B className="h-24 rounded-xl" /></div><Panel title={false}><div className="space-y-4"><B className="h-3 w-20" /><B className="h-10 w-full" /><Lines n={3} /><B className="h-8 w-32" /></div></Panel></div>
</>)
const Builder = () => (<div className="grid min-h-[60vh] gap-4 lg:grid-cols-[340px_1fr]"><Panel title={false}><div className="space-y-4"><B className="h-10 w-3/4" /><B className="ml-auto h-10 w-2/3" /><B className="h-16 w-4/5" /><B className="mt-10 h-10 w-full rounded-lg" /></div></Panel><B className="min-h-[50vh] rounded-xl" /></div>)
const Account = () => (<><Head w="w-64" action={false} /><div className="grid gap-4 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <Panel key={i}><div className="space-y-4"><B className="h-3 w-20" /><B className="h-9 w-full" /><B className="h-3 w-24" /><B className="h-9 w-full" /><B className="h-9 w-32 rounded-lg" /></div></Panel>)}</div></>)
const Notifications = () => (<><Head w="w-52" /><Chips n={2} search={false} /><Card className="overflow-hidden"><div className="divide-y divide-line">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="flex items-start gap-4 p-4"><B className="size-9 rounded-lg" /><div className="flex-1 space-y-2"><B className="h-4 w-2/3" /><B className="h-3 w-1/2" /></div><B className="h-3 w-12" /></div>)}</div></Card></>)
const Generic = () => (<><Head /><Panel><Lines n={6} /></Panel></>)

/* ------------------------------ admin ------------------------------ */
const AdminDash = () => (<><Head w="w-48" /><Stats /><div className="grid gap-4 lg:grid-cols-3"><Panel className="lg:col-span-2"><B className="h-44" /></Panel><Panel><Rows n={4} /></Panel></div><div className="grid gap-4 lg:grid-cols-2"><Panel pad={false}><Table rows={4} /></Panel><Panel><Rows n={4} /></Panel></div></>)
const AdminList = () => (<><Head w="w-48" /><div className="grid gap-3 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <B key={i} className="h-16 rounded-xl" />)}</div><Card className="overflow-hidden"><div className="flex flex-wrap items-center gap-2 border-b border-line p-3"><Chips n={4} /></div><Table rows={8} cols={5} /></Card></>)
const AdminDetail = () => (<><B className="h-3 w-24" /><div className="flex items-end justify-between gap-4"><div className="space-y-3"><B className="h-9 w-64" /><B className="h-3.5 w-48" /></div><B className="h-6 w-20 rounded-full" /></div><Tabs n={5} /><div className="grid gap-5 lg:grid-cols-3"><Panel className="lg:col-span-2"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <B key={i} className="h-16 rounded-lg" />)}</div><div className="mt-5 space-y-3"><B className="h-4 w-2/3" /><B className="h-4 w-1/2" /><B className="h-4 w-3/5" /></div></Panel><Panel><div className="space-y-2">{[0, 1, 2, 3].map((i) => <B key={i} className="h-9 w-full rounded-lg" />)}</div></Panel></div></>)
const AdminDesk = () => (<><Head w="w-44" action={false} /><div className="grid gap-4 xl:grid-cols-[280px_1fr_260px]"><Card className="overflow-hidden"><div className="divide-y divide-line">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="space-y-2 p-4"><B className="h-3 w-24" /><B className="h-4 w-full" /></div>)}</div></Card><Panel title={false}><div className="space-y-4"><B className="h-10 w-full" /><B className="h-14 w-2/3" /><B className="ml-auto h-14 w-1/2" /><B className="h-10 w-full rounded-lg" /></div></Panel><Panel><Lines n={4} /></Panel></div></>)
const AdminCatalog = () => (<><Head w="w-44" /><div className="grid items-start gap-5 lg:grid-cols-[220px_1fr]"><div className="flex gap-2 lg:flex-col">{[0, 1, 2, 3, 4].map((i) => <B key={i} className="h-12 w-40 shrink-0 rounded-xl lg:w-full" />)}</div><div className="space-y-5"><Tabs n={4} /><Card className="overflow-hidden"><div className="divide-y divide-line">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="flex items-center gap-4 px-4 py-3"><B className="size-5" /><div className="flex-1 space-y-2"><B className="h-4 w-1/3" /><B className="h-3 w-1/2" /></div><B className="h-6 w-14 rounded-full" /></div>)}</div></Card></div></div></>)
const AdminForm = () => (<><Head w="w-52" action={false} /><div className="grid gap-5 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <Panel key={i}><div className="space-y-4"><B className="h-3 w-24" /><B className="h-9 w-full" /><B className="h-3 w-20" /><B className="h-9 w-full" /><B className="h-9 w-28 rounded-lg" /></div></Panel>)}</div></>)

/* ------------------------------ public site ------------------------------ */
const Hero = () => (
  <div className="mx-auto max-w-6xl space-y-14 px-5 pb-24 pt-16 md:px-10 md:pt-24">
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center"><B className="h-3 w-40" /><B className="h-14 w-full max-w-[560px] md:h-20" /><B className="h-14 w-4/5 max-w-[460px] md:h-20" /><div className="w-full max-w-md space-y-2.5"><B className="h-4 w-full" /><B className="mx-auto h-4 w-2/3" /></div><div className="flex gap-3"><B className="h-11 w-36 rounded-full" /><B className="h-11 w-32 rounded-full" /></div><B className="h-3 w-72 max-w-full" /></div>
    <div className="mx-auto max-w-5xl space-y-4"><div className="flex justify-center gap-2">{[0, 1, 2, 3].map((i) => <B key={i} className="h-8 w-24 rounded-full" />)}</div><B className="h-[300px] rounded-2xl md:h-[400px]" /></div>
    <div className="flex gap-6 overflow-hidden">{Array.from({ length: 8 }, (_, i) => <B key={i} className="h-5 w-24 shrink-0" />)}</div>
    <div className="space-y-4"><B className="h-3 w-24" /><B className="h-9 w-80 max-w-full" />{Array.from({ length: 5 }, (_, i) => <div key={i} className="flex items-center gap-5 border-t border-line py-5"><B className="size-9 rounded-lg" /><B className="h-5 w-40" /><B className="hidden h-4 flex-1 md:block" /><B className="ml-auto h-6 w-24" /></div>)}</div>
  </div>
)
const Products = () => (<div className="mx-auto max-w-6xl space-y-8 px-5 py-14 md:px-10"><div className="space-y-3"><B className="h-10 w-56" /><B className="h-4 w-80 max-w-full" /></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <B key={i} className="h-44 rounded-xl" />)}</div></div>)
const Product = () => (<div className="mx-auto max-w-5xl space-y-10 px-5 py-14 md:px-10"><div className="space-y-3"><B className="h-3 w-20" /><B className="h-10 w-64" /><B className="h-4 w-96 max-w-full" /></div><div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <B key={i} className="h-72 rounded-2xl" />)}</div><B className="h-40 rounded-xl" /></div>)
const AppsCatalog = () => (<div className="mx-auto max-w-6xl space-y-8 px-5 py-14 md:px-10"><div className="space-y-3"><B className="h-10 w-56" /><B className="h-4 w-80 max-w-full" /></div><Chips n={5} /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <B key={i} className="h-36 rounded-xl" />)}</div></div>)
const Blog = () => (<div className="mx-auto max-w-6xl space-y-10 px-5 pb-20 pt-14 md:px-10 md:pt-20"><div className="space-y-5"><B className="h-3 w-32" /><B className="h-10 w-full max-w-[520px] md:h-11" /><B className="h-4 w-96 max-w-full" /></div><Chips n={6} /><B className="h-[260px] rounded-2xl" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="space-y-3 rounded-2xl border border-line p-3"><B className="aspect-[2/1] w-full rounded-lg" /><B className="h-3 w-1/2" /><B className="h-5 w-full" /><B className="h-4 w-4/5" /></div>)}</div></div>)
const Post = () => (<div className="mx-auto max-w-3xl space-y-8 px-5 pb-16 pt-10 md:px-10 md:pt-14"><B className="h-3 w-16" /><div className="space-y-4"><B className="h-3 w-48" /><B className="h-10 w-full" /><B className="h-10 w-2/3" /></div><B className="aspect-[2/1] w-full rounded-2xl" /><Lines n={6} /><B className="h-6 w-1/2" /><Lines n={5} /></div>)
const Docs = () => (<div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[200px_1fr] md:px-10"><div className="space-y-2">{[0, 1, 2, 3].map((i) => <B key={i} className="h-8 w-full rounded-lg" />)}</div><div className="max-w-2xl space-y-5"><B className="h-9 w-64" /><Lines n={3} /><B className="h-28 rounded-lg" /></div></div>)
const Status = () => (<div className="mx-auto max-w-4xl space-y-10 px-5 pb-24 pt-14 md:px-10 md:pt-20"><div className="space-y-4"><B className="h-3 w-28" /><B className="h-11 w-96 max-w-full" /><B className="h-4 w-80 max-w-full" /></div><B className="h-44 rounded-2xl" />{[0, 1, 2].map((i) => <div key={i} className="space-y-3 border-t border-line pt-5"><div className="flex justify-between"><B className="h-5 w-40" /><B className="h-4 w-14" /></div><B className="h-7 w-full" /></div>)}</div>)
const Changelog = () => (<div className="mx-auto max-w-4xl space-y-10 px-5 pb-24 pt-14 md:px-10 md:pt-20"><div className="space-y-5"><B className="h-3 w-24" /><B className="h-11 w-full max-w-[420px]" /></div><Chips n={4} search={false} />{[0, 1, 2].map((i) => <div key={i} className="grid gap-x-10 gap-y-4 border-t border-line pt-8 md:grid-cols-[150px_1fr]"><div className="space-y-2"><B className="h-4 w-20" /><B className="h-3 w-24" /></div><div className="space-y-4"><B className="h-7 w-2/3" /><Lines n={3} /></div></div>)}</div>)
const Contact = () => (<div className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 pt-14 md:px-10 md:pt-20 lg:grid-cols-[1fr_480px]"><div className="space-y-5"><B className="h-3 w-20" /><B className="h-12 w-72" /><B className="h-4 w-96 max-w-full" /><B className="mt-8 h-56 rounded-xl" /></div><B className="h-[460px] rounded-2xl" /></div>)
const Legal = () => (<div className="mx-auto grid max-w-6xl gap-14 px-5 pb-24 pt-12 md:px-10 lg:grid-cols-[210px_minmax(0,680px)]"><div className="hidden space-y-2 lg:block">{[0, 1, 2, 3, 4].map((i) => <B key={i} className="h-6 w-full" />)}</div><div className="space-y-6"><B className="h-11 w-2/3" /><B className="h-3 w-48" /><B className="h-14 rounded-lg" />{[0, 1].map((i) => <div key={i} className="space-y-3"><B className="h-6 w-1/3" /><Lines n={3} /></div>)}</div></div>)
const Auth = () => (<div className="grid min-h-[60vh] place-items-center px-5 py-12"><B className="h-[380px] w-full max-w-sm rounded-2xl" /></div>)
const SiteGeneric = () => (<div className="mx-auto max-w-4xl space-y-6 px-5 py-14 md:px-10"><B className="h-10 w-64" /><Lines n={6} /></div>)

/* ------------------------------ registry and route helpers ------------------------------ */
export const SKELETONS = {
  overview: ['Overview', Overview], apps: ['Apps and databases', Apps], instance: ['Instance', Instance], services: ['Services', Services], vps: ['VPS list', Vps], domains: ['Domains', Domains], mail: ['Email', Mail],
  billing: ['Billing', Billing], invoices: ['Invoices', Invoices], support: ['Support', Support], catalog: ['Deploy', Catalog], builder: ['Site builder', Builder], account: ['Account', Account], notifications: ['Notifications', Notifications], generic: ['Any page', Generic],
  adminDash: ['Admin dashboard', AdminDash], adminList: ['Admin list', AdminList], adminDetail: ['Admin detail', AdminDetail], adminDesk: ['Support desk', AdminDesk], adminCatalog: ['Catalogue studio', AdminCatalog], adminForm: ['Admin editor', AdminForm],
  home: ['Homepage', Hero], products: ['Products', Products], product: ['Product and plans', Product], appsCatalog: ['App catalogue', AppsCatalog], blog: ['Blog', Blog], post: ['Blog article', Post], docs: ['Docs', Docs], status: ['Status', Status], changelog: ['Changelog', Changelog], contact: ['Contact', Contact], legal: ['Legal', Legal], auth: ['Sign in', Auth], siteGeneric: ['Any public page', SiteGeneric],
}
export const Sk = ({ kind }) => { const C = (SKELETONS[kind] || SKELETONS.generic)[1]; return <C /> }

export const customerKind = (p) => {
  const seg = p.split('/')[1] || '', deep = p.split('/').length > 2
  if (seg === '') return 'overview'
  if (['apps', 'services', 'vps'].includes(seg)) return deep ? 'instance' : seg === 'apps' ? 'apps' : seg === 'vps' ? 'vps' : 'services'
  return { domains: 'domains', email: 'mail', billing: 'billing', invoices: 'invoices', support: 'support', catalog: 'catalog', builder: 'builder', account: 'account', notifications: 'notifications' }[seg] || 'generic'
}
export const adminKind = (seg, p) => {
  if (seg === '') return 'adminDash'
  if (seg === 'support') return 'adminDesk'
  if (seg === 'products') return 'adminCatalog'
  if (['editor', 'pricing', 'promotions', 'settings', 'templates', 'automations', 'bots'].includes(seg)) return 'adminForm'
  if (p.split('/').length > 3) return 'adminDetail'
  return 'adminList'
}
export const siteKind = (seg, arg) => {
  if (seg === '') return 'home'
  if (seg === 'products') return arg ? 'product' : 'products'
  if (seg === 'apps') return arg ? 'product' : 'appsCatalog'
  if (seg === 'games') return arg ? 'product' : 'home'
  if (seg === 'blog') return arg ? 'post' : 'blog'
  if (['login', 'register', 'recover'].includes(seg)) return 'auth'
  return { docs: 'docs', status: 'status', changelog: 'changelog', contact: 'contact', legal: 'legal' }[seg] || 'siteGeneric'
}
