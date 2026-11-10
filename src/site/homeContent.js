/* Everything the homepage SAYS lives here, apart from how it looks (HomePage.jsx).
   Every number and promise in this file is a claim a visitor can hold us to: before it ships, each one is checked
   against the real catalogue, SLA and support data and replaced where it differs. Nothing here names a vendor or
   describes how the platform is built; the page sells outcomes, not the stack. */
import { Activity, ArrowLeftRight, AtSign, Clock, Code2, Database, DatabaseBackup, Gamepad2, Globe, KeyRound, Lock, Mail, Network, Server, ShieldCheck, Wand2 } from 'lucide-react'

/* The headline is one sentence with a moving part: "YOUR <thing>. LIVE IN SECONDS." The thing is whatever the stage below
   is showing, so the words and the product window always say the same thing. */
export const HERO = {
  fixed: 'LIVE IN SECONDS.',
  srTitle: 'Your website, app, game server or VPS, live in seconds',
  sub: 'Hosting for everything you put online, with an AI crew that builds, watches and fixes things with you.',
  primary: 'Start free',
  secondary: 'See pricing',
  trust: 'No card required · Free SSL and backups · Cancel any time',
}

/* the hero stage: `word` is the moving part of the headline, the rest drives the product window */
export const STAGE = [
  { id: 'site', word: 'YOUR WEBSITE.', label: 'Website', icon: Wand2, url: 'crumbandco.blipmade.site', from: 4, to: '/site/products/web', cta: 'Build a website' },
  { id: 'app', word: 'YOUR APP.', label: 'App', icon: Code2, url: 'console.blipmade.cloud', from: 3.2, to: '/site/apps', cta: 'Deploy an app' },
  { id: 'game', word: 'YOUR GAME SERVER.', label: 'Game', icon: Gamepad2, url: 'play.blipmade.gg', from: 6.24, to: '/site/apps/minecraft', cta: 'Start a game server' },
  { id: 'vps', word: 'YOUR SERVER.', label: 'VPS', icon: Server, url: 'vps-fra-01 · 45.83.12.9', from: 4, to: '/site/products/vps', cta: 'Configure a VPS' },
]

export const DEPLOY_LOG = [
  ['$ blip deploy ./api --region fra', 'cmd'],
  ['› Packing source (4.2 MB)', ''],
  ['› Building image node:22', ''],
  ['› Reserving capacity in Frankfurt', ''],
  ['› Attaching network · IPv4 + IPv6', ''],
  ['✓ Live at api-7f3a.blipmade.app', 'ok'],
]
export const GAME_LOG = [
  ['> start survival-smp', 'cmd'],
  ['[Server] Starting Paper 1.21 on :25565', ''],
  ['[Server] Preparing spawn area: 100%', ''],
  ['[Server] Done (3.2s)! Type "help" for help', 'ok'],
  ['[+] Mara joined the game', ''],
  ['[+] Tudor joined the game', ''],
]
export const VPS_SPEC = [['Plan', '4 vCPU · 8 GB'], ['Storage', '160 GB NVMe'], ['Image', 'Ubuntu 24.04'], ['Region', 'Frankfurt'], ['Network', 'IPv4 + IPv6']]

export const STACK = ['NODE.JS', 'PYTHON', 'PHP', 'GO', 'RUST', 'DOCKER', 'POSTGRES', 'REDIS', 'NEXT.JS', 'LARAVEL', 'WORDPRESS', 'MINECRAFT']

/* ids match CATALOG in lib/mock.js: name, blurb and "from" price come from the catalogue, not from here */
export const PRODUCT_ICONS = { web: Globe, vps: Server, game: Gamepad2, db: Database, mail: Mail, dom: AtSign }
export const PRODUCT_PITCH = {
  web: 'Your site online today, with SSL, email and backups already switched on.',
  vps: 'Root access, NVMe disks and the exact size you need. Resize whenever you like.',
  game: 'Minecraft, Rust, CS2 and more. One click to install, mods and backups included.',
  db: 'PostgreSQL, MySQL and Redis that back themselves up and restore to any minute.',
  mail: 'Professional mailboxes on your own domain, with webmail that is pleasant to use.',
  dom: 'Search, register and transfer. WHOIS privacy and DNS are free with every name.',
}

/* one quiet line under the price, not a section of its own */
export const INCLUDED = [[Lock, 'Free SSL'], [DatabaseBackup, 'Daily backups'], [ShieldCheck, 'DDoS protection'], [ArrowLeftRight, 'Free migration'], [Network, 'IPv4 and IPv6'], [Activity, 'Live monitoring'], [KeyRound, 'SSH and SFTP'], [Clock, 'Hourly billing']]

export const PRESETS = [
  { id: 'starter', label: 'Starter', hint: 'Blogs, bots, side projects', cpu: 1, ram: 2, disk: 40 },
  { id: 'growth', label: 'Growth', hint: 'Shops and busy apps', cpu: 4, ram: 8, disk: 160 },
  { id: 'scale', label: 'Scale', hint: 'Heavy traffic and big worlds', cpu: 8, ram: 32, disk: 400 },
]
export const RATES = { cpu: 2.5, ram: 1.25, disk: 0.03 }

export const STATS = [['99.98%', 'Uptime, last 90 days'], ['40S', 'Median deploy time'], ['6 MIN', 'Median first reply'], ['4', 'Regions, two continents']]

export const MIGRATION = {
  title: 'Switching hosts? We do the moving.',
  sub: 'Tell us where your sites live today. Our engineers copy everything across, test it, and switch you over when you are happy. No downtime, no charge.',
  cta: 'Start a free migration',
  steps: ['Share access to your old host', 'We copy sites, databases and mail', 'You check the preview', 'We switch you over'],
}

/* No testimonials section: it comes back when there are real, attributable customer quotes to put in it. */

export const FAQ = [
  ['Can I try it without a card?', 'Yes. New accounts start with demo credit and you do not need payment details to look around or launch your first project.'],
  ['Where are my servers located?', 'Frankfurt, Amsterdam, Helsinki and Ashburn. You choose the region when you deploy and can move later with a snapshot.'],
  ['What exactly do the Blips do?', 'They are AI teammates built into the panel. Pip answers questions, Forge builds websites, Byte reads errors and proposes fixes, Glitch watches game servers. They act only with your permission, and a human engineer is always one click away.'],
  ['How fast does support reply?', 'The median first reply is about six minutes, from engineers who can actually fix the problem.'],
  ['Is there a contract?', 'No. Billing is hourly or monthly, you can cancel any time, and unused credit stays on your account.'],
]

export const FINAL = { headline: 'GO LIVE TODAY', sub: 'Your first project is online in under a minute. No card required.', primary: 'Create free account', secondary: 'See products' }
