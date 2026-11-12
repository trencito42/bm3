/* All pages: one index of every screen in the workspace, so nothing is reachable only by knowing its address. */
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge } from '../components/ui.jsx'
import { Doc } from './Doc.jsx'
import { openCookieSettings } from '../site/CookieConsent.jsx'

const FILE = import.meta.env.BASE_URL + 'deploying.html'
/* [name, route, what it is, 'new' when added in the latest pass] */
const SITE = [
  ['Home', '/site', 'Hero with the rotating headline, products, Blips, pricing, FAQ.'],
  ['Products', '/site/products', 'Category grid.'],
  ['Product and plans', '/site/products/vps', 'Plan cards, monthly or yearly, compare table.'],
  ['App catalogue', '/site/apps', 'One-click apps, games and databases.'],
  ['App page', '/site/apps/minecraft', 'A single app with its plans.'],
  ['Game hosting', '/site/games', 'Full-surface particle worlds, compact game list and a button that expands into configuration.', 'new'],
  ['Minecraft hosting', '/site/games/minecraft', 'Minecraft editions, resources, region and live price summary.', 'new'],
  ['Counter-Strike 2 hosting', '/site/games/cs2', 'Dedicated CS2 server configuration.', 'new'],
  ['Counter-Strike 1.6 hosting', '/site/games/cs', 'Classic Counter-Strike server configuration.', 'new'],
  ['Blog', '/site/blog', 'Index with filters, search and dot covers.'],
  ['Blog article', '/site/blog/november-changelog', 'Reading progress, contents, related posts.'],
  ['Changelog', '/site/changelog', 'Monthly releases, filter by kind of change.', 'new'],
  ['Status', '/site/status', '90-day history per system, open incidents with updates, maintenance.', 'new'],
  ['Contact', '/site/contact', 'Topic, validated form, sending and sent states.', 'new'],
  ['Legal documents', '/site/legal/terms', 'Six documents, numbered sections, contents, print.', 'new'],
  ['Cookie policy', '/site/legal/cookies', 'Category table and the button that reopens the choice.', 'new'],
  ['Docs', '/site/docs', 'Quick start, SSH, DNS, API. Still a stub.'],
  ['Log in', '/site/login', 'Password, then the two-factor step.'],
  ['Register', '/site/register', 'Sign-up with inline validation.'],
  ['Reset password', '/site/recover', 'Request and confirmation.'],
  ['Not found', '/site/nowhere', 'The 404 with the Blip as the zero.'],
]
const APP = [
  ['Overview', '/', 'What is running, what needs attention.'], ['Deploy', '/catalog', 'Pick something to launch.'], ['Apps and databases', '/apps', 'Inventory and detail tabs.'], ['VPS', '/vps', 'Servers and their detail.'],
  ['All services', '/services', 'Everything in one table.'], ['Domains', '/domains', 'Search, DNS records.'], ['Email', '/email', 'Mailboxes and aliases.'], ['Billing', '/billing', 'Balance, invoices, payment methods.'],
  ['Support', '/support', 'Tickets and live chat.'], ['Notifications', '/notifications', 'What we tell you about, and where.'], ['Account', '/account', 'Profile, security, sessions.'], ['Site builder', '/builder', 'Describe a site and watch it assemble.'], ['Order', '/order', 'Configure and pay.'],
]
const ADMIN = [['Dashboard', '/admin', 'Operations at a glance.'], ['Customers', '/admin/customers', 'Accounts with the inspector.'], ['Orders', '/admin/orders', 'Recent purchases.']]
const DS = [['Coming soon and pre-register', '/ds/soon', 'The page, the button that becomes the form, check-your-inbox, the email, choose a password, you are in.', 'new'], ['Loading screens', '/ds/loading', 'A page-shaped dot-matrix skeleton for every page of the customer app, admin and public site.', 'new'], ['Deploy Studio', '/ds/deploy', 'One flow for app, bot, game, database, website, VPS and email, with declined-card and no-capacity paths.', 'new'], ['Instance management', '/ds/instance', 'Console, files, Git, startup, schedules, backups, databases, network, access, game, settings.', 'new'], ['VPS management', '/ds/vps', 'List, remote console, networking, firewall, snapshots, ISO and rescue, reinstall, billing.', 'new'], ['Email hosting', '/ds/mail', 'Multi-domain: mailboxes, aliases, DNS, connect, deliverability, plan, webmail.', 'new'], ['Billing', '/ds/billing', 'Subscription lifecycle, invoices, payment failure, credit, plan change, cancellation.', 'new'], ['Admin studio', '/ds/adminstudio', 'Twenty-one admin workflows with list, detail, editor and dialogs.', 'new'], ['Advanced patterns', '/ds/advanced', 'Log viewer, timeline, diff, config editor, allocator, permission matrix, audit inspector, destructive dialog.', 'new'], ['System pages', '/ds/system', 'Deploying, maintenance, error, offline: seven states of one file.'], ['Email', '/ds/emails', 'Twenty-five templates, dark and light, desktop and mobile.'], ['States and mobile', '/ds/states', 'Loading, empty and error for every list.']]

function Grid({ items }) {
  const nav = useNavigate()
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(([name, to, what, tag]) => (
        <button key={to} onClick={() => nav(to)} className="group flex items-start justify-between gap-3 rounded-xl border border-line bg-card p-4 text-left outline-none transition-[border-color,background-color,transform] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-line-2 hover:bg-[#161619] focus-visible:border-white/40 active:translate-y-0">
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-[14px] font-medium">{name}{tag && <Badge tone="info" dot={false}>New</Badge>}</span>
            <span className="mt-1 block text-[12.5px] leading-snug text-mute">{what}</span>
            <span className="mt-2 block truncate font-mono text-[10.5px] text-dim">{to}</span>
          </span>
          <ArrowRight className="mt-0.5 size-4 shrink-0 -translate-x-1 text-dim opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:text-fg group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" />
        </button>
      ))}
    </div>
  )
}

function Overlays() {
  const nav = useNavigate()
  const rows = [
    ['Cookie choice', 'Shows once on the public site, bottom left. Refusing is as easy as accepting.', 'Show it', () => { nav('/site'); setTimeout(openCookieSettings, 400) }],
    ['Chat', 'The launcher in the corner of the public site and the client area.', 'Open the site', () => nav('/site')],
    ['Deploying page', 'What visitors get while the site cannot answer. A file on its own, outside the app.', 'Open the file', () => window.open(FILE + '?state=deploying', '_blank', 'noopener')],
  ]
  return (
    <ul className="divide-y divide-line rounded-xl border border-line">
      {rows.map(([t, d, cta, go]) => (
        <li key={t} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0"><div className="text-[14px] font-medium">{t}</div><p className="mt-0.5 text-[12.5px] text-mute">{d}</p></div><button onClick={go} className="link-grow inline-flex shrink-0 items-center gap-1 text-[13px] text-fg outline-none">{cta}<ArrowRight className="size-3.5" /></button></li>
      ))}
    </ul>
  )
}

const Missing = () => (
  <ul className="space-y-3 text-[14px] leading-relaxed text-mute">
    <li><b className="font-medium text-fg">About and careers.</b> They need facts about the company and real people. No layout was invented for content that does not exist yet.</li>
    <li><b className="font-medium text-fg">Documentation.</b> The docs page is a four-entry stub. A real docs site (search, versions, sidebar tree) is a project of its own.</li>
    <li><b className="font-medium text-fg">Legal wording.</b> The six documents have their layout and the list of what each section must cover. The text is a lawyer&apos;s job.</li>
    <li><b className="font-medium text-fg">Sharing images and icons.</b> The link preview image, the favicon set and the app icons are not drawn yet.</li>
    <li><b className="font-medium text-fg">Invoice as PDF.</b> Emails link to it; the printed invoice itself has no design yet.</li>
  </ul>
)

export default function Pages() {
  return (
    <Doc
      title="All pages"
      lead="Every screen in the workspace, by area. Use it to check that nothing is missing before a release, and to reach pages that have no link of their own in the bar above."
      sections={[
        { id: 'site', title: 'Public site', note: `${SITE.length} pages`, node: <Grid items={SITE} /> },
        { id: 'overlays', title: 'Overlays and standalone files', node: <Overlays /> },
        { id: 'app', title: 'Customer app', note: `${APP.length} pages`, node: <Grid items={APP} /> },
        { id: 'admin', title: 'Admin', note: 'entry points; the rest is in its sidebar', node: <Grid items={ADMIN} /> },
        { id: 'ds', title: 'Outside the app', node: <Grid items={DS} /> },
        { id: 'missing', title: 'Not designed yet', note: 'known gaps, on purpose', node: <Missing /> },
      ]}
    />
  )
}
