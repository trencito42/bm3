/* Everything the homepage SAYS lives here, apart from how it looks (HomePage.jsx).
   Every number and promise in this file is a claim a visitor can hold us to: before it ships, each one is checked
   against the real catalogue, SLA and support data and replaced where it differs. Nothing here names a vendor or
   describes how the platform is built; the page sells outcomes, not the stack. */
import { Activity, ArrowLeftRight, AtSign, Clock, Code2, Database, DatabaseBackup, Gamepad2, Globe, KeyRound, Lock, Mail, Network, Server, ShieldCheck, Wand2 } from 'lucide-react'

/* The headline is one sentence with a moving part: "YOUR <thing>. LIVE IN SECONDS." The thing is whatever the stage below
   is showing, so the words and the product window always say the same thing. */
export const HERO = {
  fixed: 'ONLINE TODAY.',
  srTitle: 'Your website, app, game server or VPS, online today',
  sub: 'Pick what you need, set the size yourself, and run it from one panel that stays out of your way.',
  primary: 'Create account',
  secondary: 'See pricing',
  trust: 'Prices up front · Hosted in the EU · No contract',
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
  web: 'WordPress or your own code, online with HTTPS and backups set up for you.',
  vps: 'Root access, NVMe disks and the exact size you need.',
  game: 'Minecraft and more. One click to install, a console in your browser.',
  db: 'PostgreSQL looked after for you, in the same panel as your apps.',
  mail: 'Mailboxes on your own domain, with webmail included.',
  dom: 'Find a name and connect it to your site in a few clicks.',
}

/* one quiet line under the price, not a section of its own. Only things that are true of every plan. */
export const INCLUDED = [[Lock, 'HTTPS certificates'], [DatabaseBackup, 'Backups'], [Network, 'IPv4 and IPv6'], [KeyRound, 'SSH and SFTP'], [Activity, 'Live monitoring'], [ShieldCheck, 'Hosted in the EU']]
export const PRESETS = [
  { id: 'starter', label: 'Starter', hint: 'Blogs, bots, side projects', cpu: 1, ram: 2, disk: 40 },
  { id: 'growth', label: 'Growth', hint: 'Shops and busy apps', cpu: 4, ram: 8, disk: 160 },
  { id: 'scale', label: 'Scale', hint: 'Heavy traffic and big worlds', cpu: 8, ram: 32, disk: 400 },
]
export const RATES = { cpu: 2.5, ram: 1.25, disk: 0.03 }

export const STATS = [['99.98%', 'Uptime, last 90 days'], ['40S', 'Median deploy time'], ['6 MIN', 'Median first reply'], ['4', 'Regions, two continents']]

export const MIGRATION = {
  title: 'Switching hosts? We help you move.',
  sub: 'Tell us what you run today. We plan the move with you, agree on a time that suits you, and nothing switches until you have checked the result.',
  cta: 'Plan my move',
  steps: ['Create your account', 'Tell us what you run today', 'We agree on a time', 'You check before anything switches'],
}

/* No testimonials section: it comes back when there are real, attributable customer quotes to put in it. */

/* Copy rules for this page: short sentences, no dashes used as punctuation, no disclaimers. If something is not true of
   the product, the line is removed; it is never kept and hedged ("where supported", "this is not a ..."). */
export const FAQ = [
  ['Can I see prices before I sign up?', 'Yes. Every plan and price is public. You only need an account when you are ready to launch something.'],
  ['Where is my data?', 'In the European Union, in data centres in Germany.'],
  ['Who answers when I need help?', 'People. Support engineers answer tickets and live chat, inside the same panel you work in.'],
  ['What are the Blips?', 'Pip, Forge, Byte and Glitch are the characters of Blipmade. They show you what your services are doing, so a glance is enough.'],
  ['Is there a contract?', 'No. Plans are billed monthly and you can cancel from your account.'],
]

export const FINAL = { headline: 'GO LIVE TODAY', sub: 'Pick a product, set the size, launch it.', primary: 'Create account', secondary: 'See products' }