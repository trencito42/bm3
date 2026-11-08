import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import * as DialogP from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import {
  LayoutDashboard, Server, Receipt, ShoppingCart, Globe, LifeBuoy, Rocket, Boxes, Mail, Cloud, UserCog, Search, Bell, Plus, Wand2, ChevronDown, FolderOpen, PanelLeft, Menu as MenuIcon, LogOut, Settings, User, CreditCard,
} from 'lucide-react'
import { StoreProvider, useStore } from './lib/store.jsx'
import { Avatar, Menu, MenuContent, MenuItem, MenuLabel, MenuSep, MenuTrigger } from './components/ui.jsx'
import { cn, money } from './lib/utils'
import { AddFundsDialog } from './components/AddFunds.jsx'
import { DotNum } from './components/DotViz.jsx'
import { DotField, DotText, Orb } from './builder/FxBits.jsx'
import Overview from './pages/Overview.jsx'
import Services from './pages/Services.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import Invoices from './pages/Invoices.jsx'
import Order from './pages/Order.jsx'
import Domains from './pages/Domains.jsx'
import Support from './pages/Support.jsx'
import Builder from './pages/Builder.jsx'
import { Catalog, Apps, AppDetail, VpsList, VpsDetail, EmailPage, BillingPage, NotificationsPage, AccountPage } from './pages/app/More.jsx'
import WorkspaceBar from './workspace/Bar.jsx'
import Foundations from './workspace/Foundations.jsx'
import Components from './workspace/Components.jsx'
import Patterns from './workspace/Patterns.jsx'
import Product from './workspace/Product.jsx'
import States from './workspace/States.jsx'
import AdminApp from './admin/AdminApp.jsx'
import SiteApp from './site/SiteApp.jsx'

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/catalog', label: 'Deploy', icon: Rocket },
  { to: '/apps', label: 'Apps & DBs', icon: Boxes },
  { to: '/vps', label: 'VPS', icon: Cloud },
  { to: '/services', label: 'All services', icon: Server },
  { to: '/domains', label: 'Domains', icon: Globe },
  { to: '/email', label: 'Email', icon: Mail },
  { to: '/billing', label: 'Billing', icon: Receipt, count: (s) => s.invoices.filter((i) => i.status !== 'paid').length },
  { to: '/support', label: 'Support', icon: LifeBuoy, count: (s) => s.tickets.filter((t) => t.status === 'open').length },
]
const TITLES = { '': ['Overview', LayoutDashboard], catalog: ['Deploy', Rocket], apps: ['Apps & databases', Boxes], vps: ['VPS', Cloud], services: ['Services', Server], invoices: ['Invoices', Receipt], order: ['Order', ShoppingCart], domains: ['Domains', Globe], email: ['Email hosting', Mail], billing: ['Billing', Receipt], notifications: ['Notifications', Bell], account: ['Account', UserCog], support: ['Support', LifeBuoy], builder: ['Site builder', Wand2] }

/* nav row in the Klinch style: 36px, radius 10, red icon when active */
function Item({ to, end, icon: Icon, label, count, rail, onNavigate }) {
  return (
    <NavLink to={to} end={end} onClick={onNavigate} title={rail ? label : undefined} className={({ isActive }) => cn('flex h-9 items-center gap-3 rounded-[10px] px-2.5 text-[13.5px] font-medium transition-colors', rail && 'justify-center px-0', isActive ? 'bg-white/[0.08] text-fg' : 'text-fg/70 hover:bg-hover hover:text-fg')}>
      {({ isActive }) => (
        <>
          <Icon className={cn('size-[17px] shrink-0 transition-colors', isActive && 'text-[var(--brand)]')} />
          {!rail && label}
          {!rail && count > 0 && <span className="ml-auto rounded-full border border-line-2 px-1.5 font-mono text-[10.5px] text-mute">{count}</span>}
        </>
      )}
    </NavLink>
  )
}

function SideBody({ rail, setRail, openPalette, onNavigate = () => {} }) {
  const store = useStore()
  const nav = useNavigate()
  const [funds, setFunds] = useState(false)
  const [open, setOpen] = useState(true)
  const sites = store.services.filter((s) => /web/i.test(s.type))
  const go = (p) => { nav(p); onNavigate() }
  return (
    <>
      <div className={cn('flex h-14 shrink-0 items-center border-b border-line', rail ? 'justify-center' : 'gap-1 pl-5 pr-2.5')}>
        {rail ? <button onClick={() => setRail(false)} aria-label="Expand sidebar" className="grid size-8 place-items-center rounded-md text-mute hover:bg-hover hover:text-fg"><PanelLeft className="size-4" /></button> : (
          <>
            <NavLink to="/" onClick={onNavigate} className="mr-auto flex items-center"><DotText text="BLIPMADE" height={13} /></NavLink>
            <button onClick={() => { openPalette(); onNavigate() }} aria-label="Search" className="grid size-8 place-items-center rounded-md text-mute hover:bg-hover hover:text-fg"><Search className="size-4" /></button>
            {setRail && <button onClick={() => setRail(true)} aria-label="Collapse sidebar" className="hidden size-8 place-items-center rounded-md text-mute hover:bg-hover hover:text-fg md:grid"><PanelLeft className="size-4" /></button>}
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <button onClick={() => go('/builder')} title="New site" className={cn('mb-2 flex h-9 items-center gap-2.5 rounded-[10px] bg-fg text-[13.5px] font-medium text-black transition-colors hover:bg-white', rail ? 'justify-center' : 'px-2.5')}>
          <Orb size={20} className="shrink-0" />
          {!rail && 'New site'}
        </button>
        {NAV.map((n) => <Item key={n.to} {...n} count={n.count ? n.count(store) : 0} rail={rail} onNavigate={onNavigate} />)}
        <Item to="/builder" icon={Wand2} label="Site builder" rail={rail} onNavigate={onNavigate} />

        {!rail && (
          <>
            <div className="mt-4 flex items-center justify-between px-2.5 text-[12.5px] text-mute">
              <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 hover:text-fg">Sites <ChevronDown className={cn('size-3.5 transition-transform', !open && '-rotate-90')} /></button>
              <button onClick={() => go('/builder')} aria-label="New site" className="grid size-6 place-items-center rounded hover:bg-hover hover:text-fg"><Plus className="size-3.5" /></button>
            </div>
            {open && (
              <div className="flex flex-col gap-0.5">
                {sites.map((s) => <button key={s.id} onClick={() => go('/services/' + s.id)} className="flex h-8 items-center gap-3 rounded-[10px] px-2.5 text-left text-[13px] text-mute transition-colors hover:bg-hover hover:text-fg"><FolderOpen className="size-4 shrink-0" /><span className="truncate">{s.name}</span></button>)}
                <button onClick={() => go('/builder')} className="flex h-8 items-center gap-3 rounded-[10px] px-2.5 text-left text-[13px] text-mute transition-colors hover:bg-hover hover:text-fg"><FolderOpen className="size-4 shrink-0" />New site</button>
              </div>
            )}
          </>
        )}
      </div>

      <button onClick={() => setFunds(true)} title="Add funds" className={cn('shrink-0 border-t border-line text-left transition-colors hover:bg-white/[0.03]', rail ? 'grid place-items-center py-4' : 'px-5 py-4')}>
        {rail ? <CreditCard className="size-4 text-mute" /> : (
          <>
            <DotNum text={store.balance.toFixed(2)} height={30} animate={false} />
            <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Credit · add funds</div>
          </>
        )}
      </button>
      <AddFundsDialog open={funds} onOpenChange={setFunds} />
    </>
  )
}

function Sidebar({ rail, setRail, openPalette }) {
  return (
    <aside className={cn('hidden shrink-0 flex-col border-r border-line bg-[#0b0b0d] transition-[width] duration-300 md:flex', rail ? 'w-14' : 'w-64')}>
      <SideBody rail={rail} setRail={setRail} openPalette={openPalette} />
    </aside>
  )
}

/* mobile: slide-in drawer + bottom tab bar */
function MobileDrawer({ open, onClose, openPalette }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="anim-overlay absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="anim-slide absolute inset-y-0 left-0 flex w-[min(300px,85vw)] flex-col border-r border-line bg-[#0b0b0d]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <SideBody rail={false} openPalette={openPalette} onNavigate={onClose} />
      </aside>
    </div>
  )
}
function BottomNav({ onMore }) {
  const store = useStore()
  const items = [['/', 'Home', LayoutDashboard, true], ['/apps', 'Apps', Boxes], ['/vps', 'VPS', Cloud], ['/billing', 'Billing', Receipt]]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-[#0b0b0d]/95 backdrop-blur md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {items.map(([to, l, I, end]) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10.5px] transition-colors', isActive ? 'text-fg' : 'text-dim')}>
          {({ isActive }) => (<><I className={cn('size-5', isActive && 'text-[var(--brand)]')} />{l}{to === '/billing' && store.invoices.some((i) => i.status !== 'paid') && <i className="absolute right-[28%] top-2.5 size-1.5 rounded-full bg-[var(--brand)]" />}</>)}
        </NavLink>
      ))}
      <button onClick={onMore} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10.5px] text-dim"><MenuIcon className="size-5" />More</button>
    </nav>
  )
}

function Palette({ open, setOpen }) {
  const nav = useNavigate()
  const store = useStore()
  const go = (p) => { setOpen(false); nav(p) }
  return (
    <DialogP.Root open={open} onOpenChange={setOpen}>
      <DialogP.Portal>
        <DialogP.Overlay className="anim-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-[3px]" />
        <DialogP.Content className="anim-pop fixed left-1/2 top-[18%] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-line-2 bg-card shadow-2xl outline-none">
          <DialogP.Title className="sr-only">Command palette</DialogP.Title>
          <DialogP.Description className="sr-only">Search pages, services and actions</DialogP.Description>
          <Command>
            <Command.Input placeholder="Type a command or search…" autoFocus />
            <Command.List>
              <Command.Empty>No results.</Command.Empty>
              <Command.Group heading="Pages">
                {NAV.map((n) => <Command.Item key={n.to} onSelect={() => go(n.to)}><n.icon className="size-4" />{n.label}</Command.Item>)}
                <Command.Item onSelect={() => go('/builder')}><Wand2 className="size-4" />Site builder</Command.Item>
              </Command.Group>
              <Command.Group heading="Services">
                {store.services.map((s) => <Command.Item key={s.id} onSelect={() => go('/services/' + s.id)}><Server className="size-4" />{s.name}</Command.Item>)}
              </Command.Group>
              <Command.Group heading="Actions">
                <Command.Item onSelect={() => go('/order')}><Plus className="size-4" />Order a new server</Command.Item>
                <Command.Item onSelect={() => go('/invoices')}><Receipt className="size-4" />Pay outstanding invoices</Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </DialogP.Content>
      </DialogP.Portal>
    </DialogP.Root>
  )
}

function Layout() {
  const [pal, setPal] = useState(false)
  const [rail, setRail] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const loc = useLocation()
  const nav = useNavigate()
  const seg = loc.pathname.split('/')[1] || ''
  const [title, Icon] = TITLES[seg] || TITLES['']
  const builder = seg === 'builder'
  useEffect(() => {
    const k = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPal((o) => !o) } }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [])
  useEffect(() => { setRail(builder) }, [builder])
  return (
    <div className="flex h-full">
      <Sidebar rail={rail} setRail={setRail} openPalette={() => setPal(true)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-3 sm:gap-3 sm:px-5">
          <button onClick={() => setDrawer(true)} aria-label="Open menu" className="grid size-10 place-items-center rounded-lg text-mute transition-colors hover:bg-hover hover:text-fg md:hidden"><MenuIcon className="size-5" /></button>
          <span className="hidden size-8 place-items-center rounded-lg border border-line-2 bg-white/[0.04] text-mute sm:grid"><Icon className="size-4" /></span>
          <h2 className="min-w-0 truncate text-[15px] font-semibold tracking-tight">{title}</h2>
          <div className="flex-1" />
          <button onClick={() => nav('/notifications')} aria-label="Notifications" className="relative grid size-9 place-items-center rounded-lg text-mute transition-colors hover:bg-hover hover:text-fg">
            <Bell className="size-4" /><span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[var(--brand)]" />
          </button>
          <Menu>
            <MenuTrigger className="flex h-9 items-center gap-2 rounded-full border border-line-2 py-1 pl-1 pr-1 text-[13px] sm:pr-3 font-medium outline-none transition-colors hover:bg-hover">
              <Avatar name="Stefan" className="size-7" /><span className="hidden sm:inline">stefan</span>
              <ChevronDown className="hidden size-3.5 text-dim sm:block" />
            </MenuTrigger>
            <MenuContent>
              <MenuLabel>stefan10xdd@gmail.com</MenuLabel>
              <MenuItem onSelect={() => nav('/account')}><User />Account & security</MenuItem>
              <MenuItem onSelect={() => nav('/billing')}><CreditCard />Billing</MenuItem>
              <MenuItem onSelect={() => nav('/notifications')}><Settings />Notifications</MenuItem>
              <MenuSep />
              <MenuItem danger><LogOut />Log out</MenuItem>
            </MenuContent>
          </Menu>
        </header>
        <div className="relative min-h-0 flex-1">
          {!builder && <DotField className="pointer-events-none absolute inset-0 size-full" pitch={34} glyphs strength={0.5} />}
          <main className={cn('absolute inset-0', builder ? 'overflow-hidden' : 'overflow-y-auto')}>
            <div className={builder ? 'h-full' : 'anim-page mx-auto max-w-5xl space-y-6 p-4 pb-28 sm:p-6 sm:pb-28 md:p-8 md:pb-8'} key={loc.pathname}>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/order" element={<Order />} />
                <Route path="/domains" element={<Domains />} />
                <Route path="/support" element={<Support />} />
                <Route path="/builder" element={<Builder />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/apps" element={<Apps />} />
                <Route path="/apps/:id" element={<AppDetail />} />
                <Route path="/vps" element={<VpsList />} />
                <Route path="/vps/:id" element={<VpsDetail />} />
                <Route path="/email" element={<EmailPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/account" element={<AccountPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} openPalette={() => setPal(true)} />
      {!builder && <BottomNav onMore={() => setDrawer(true)} />}
      <Palette open={pal} setOpen={setPal} />
    </div>
  )
}

function Root() {
  const { pathname } = useLocation()
  const ds = pathname.startsWith('/ds/')
  const admin = pathname.startsWith('/admin')
  const site = pathname.startsWith('/site')
  return (
    <div className="flex h-dvh flex-col">
      <WorkspaceBar />
      <div className="min-h-0 flex-1">
        {ds ? (
          <Routes>
            <Route path="/ds/foundations" element={<Foundations />} />
            <Route path="/ds/components" element={<Components />} />
            <Route path="/ds/patterns" element={<Patterns />} />
            <Route path="/ds/product" element={<Product />} />
            <Route path="/ds/states" element={<States />} />
          </Routes>
        ) : admin ? <AdminApp /> : site ? <SiteApp /> : <Layout />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Root />
    </StoreProvider>
  )
}
