/* Workspace pages for the composed product screens. Each page is a Doc with the real screen in a window
   (desktop inline, mobile in an iframe) plus a short list of what the screen covers. */
import { Doc } from './Doc.jsx'
import { ScreenFrame } from '../studio/kit.jsx'
import { Screen } from '../studio/screens.jsx'

const Covers = ({ items }) => <ul className="grid gap-x-8 gap-y-2 text-[13.5px] text-mute sm:grid-cols-2">{items.map((i) => <li key={i} className="flex gap-2.5"><i className="mt-2 size-1 shrink-0 rounded-full bg-dim" />{i}</li>)}</ul>
const page = (title, lead, id, label, covers, height = 820) => function Page() {
  return <Doc title={title} lead={lead} sections={[{ id: 'screen', title: 'The screen', node: <ScreenFrame id={id} label={label} height={height}><Screen id={id} /></ScreenFrame> }, { id: 'covers', title: 'What it covers', node: <Covers items={covers} /> }]} />
}

export const VpsPage = page('VPS management', 'The list with its empty, loading and error states, then one server. Open a server, power it off and on, replay the boot in the remote console, mount an image, boot into rescue, reinstall.', 'vps', 'VPS', [
  'List with filters, search, bulk actions and a mobile-friendly row', 'Remote console with keyboard capture and a boot replay', 'Power controls with a calm powered-off state', 'Networking: addresses, reverse DNS, private network',
  'Firewall rules and SSH keys', 'Snapshots with a real async operation', 'ISO mount and rescue mode', 'Reinstall behind a four-step destructive dialog', 'Resource editor that checks node capacity', 'Billing: subscription, usage this month, cancel at period end'])
export const MailPage = page('Email hosting', 'Several domains, one place. Pick a domain on the left (a row of chips on phones): its DNS health changes what the Overview asks you to do. Try adding a domain, creating a mailbox, changing the plan.', 'mail', 'Email', [
  'Domain switcher with live health', 'Mailboxes with quotas, bulk actions and one-time passwords', 'Aliases that deliver to several mailboxes', 'DNS verification with copyable records and re-check',
  'IMAP and SMTP settings with per-client steps', 'Deliverability: reputation, bounces, allow and block lists', 'Subscription, usage and plan change with proration', 'Webmail with an account switcher', 'Add-domain wizard: domain, DNS, verify'], 880)
export const BillingStudioPage = page('Billing', 'The whole subscription lifecycle: active, past due, ending, cancelled. Open the past-due subscription and retry the payment; cancel one through the reason, offer and timing steps; top up credit; change a plan with proration.', 'billing', 'Billing', [
  'Subscription list with state badges and a lifecycle timeline per subscription', 'Payment failure with retry and what happens next', 'Cancellation in three steps: why, when, confirmation', 'Resume before the end date',
  'Invoice list with filters and bulk download, invoice document with print and PDF', 'Payment methods, add card, billing address with VAT ID', 'Account credit: balance, history, top-up with a result moment', 'Plan change with the price of the days left'])
export const AdminStudioPage = page('Admin studio', 'Every administrative workflow, each with its list, detail, editor and dialogs: catalogue family studio, product and variant editor, pricing and promotions with a cart simulator, customers, orders and refunds, services, infrastructure, operations, backups, incidents, abuse, staff permissions, support desk, bots and automations, mail administration, email wording, reports, audit and integrations. The same screens are mounted in the real admin at #/admin.', 'adminstudio', 'Admin', [
  'Catalogue: families, variants with ordering, presets, add-ons, live customer preview', 'Product editor with validation, availability and a sticky save bar', 'Pricing: rate card, promotion builder and a cart simulator', 'Customer detail: overview, services, billing, security actions, notes, credit and impersonation dialogs',
  'Orders: timeline, failed delivery, full and partial refund', 'Services: limits editor against node capacity, placement, suspension', 'Infrastructure: node heat, drain flow', 'Queues: job detail with timeline, payload diff and worker log',
  'Backups: restore points and a restore test', 'Incidents: three-step declare flow, updates, resolve', 'Abuse: evidence, notify, enforce with two acknowledgements', 'Staff: permission matrix with role presets',
  'Support: desk with assign and escalate, bot builder, rule editor with a plain-words summary, analytics', 'Email wording editor with variable checks, diff and live preview', 'Reports, audit inspector and integrations'], 900)
export const InstancePage = page('Instance management', 'Everything a customer does with a running app, game server or database. Switch the kind to see how the tabs change. Try stopping it, editing a startup variable (a restart banner appears), opening a file, restoring a backup, deleting it.', 'instance', 'Instance', [
  'Overview with live resources, health and activity', 'Console with level and source filters, search, pause, history', 'File explorer, editor with live diff, permissions dialog', 'Git: deployments, rollback, failed build log, webhook secret',
  'Startup command and environment with a diff of pending changes', 'Schedules with a cron helper and task chains', 'Backups with storage meter, lock, restore flow and automatic policy', 'Databases: credentials, rotation, TLS, allowed addresses',
  'Network: ports and firewall', 'Access: people, role presets and a permission matrix', 'Game controls: Glitch advice, players, whitelist, server.properties', 'Settings: SFTP, resources, reinstall, transfer, delete'])

