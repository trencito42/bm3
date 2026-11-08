/* Deterministic MOCK data for the design workspace. Nothing here is real. */
export const APPS = [
  { id: 'app-01', name: 'api-gateway', kind: 'Node.js', ver: '22 LTS', status: 'running', cpu: 31, ram: 54, disk: 22, region: 'Frankfurt', port: 3000, git: 'main · 3f9a1c2' },
  { id: 'app-02', name: 'shop-frontend', kind: 'Next.js', ver: '15', status: 'running', cpu: 12, ram: 41, disk: 18, region: 'Frankfurt', port: 3001, git: 'main · a81b0de' },
  { id: 'app-03', name: 'discord-bot', kind: 'Python', ver: '3.12', status: 'stopped', cpu: 0, ram: 0, disk: 6, region: 'Amsterdam', port: 8080, git: 'dev · 77c1e90' },
  { id: 'app-04', name: 'pg-main', kind: 'PostgreSQL', ver: '16', status: 'running', cpu: 44, ram: 72, disk: 63, region: 'Frankfurt', port: 5432, git: '—' },
]
export const FILES = [
  { n: 'src', t: 'dir', s: '—', m: 'Nov 08 10:12', p: 'drwxr-xr-x' },
  { n: 'node_modules', t: 'dir', s: '—', m: 'Nov 07 22:40', p: 'drwxr-xr-x' },
  { n: 'logs', t: 'dir', s: '—', m: 'Nov 08 11:02', p: 'drwxr-xr-x' },
  { n: '.env', t: 'file', s: '412 B', m: 'Nov 06 09:30', p: '-rw-------' },
  { n: 'package.json', t: 'file', s: '1.8 KB', m: 'Nov 08 10:12', p: '-rw-r--r--' },
  { n: 'server.js', t: 'file', s: '6.4 KB', m: 'Nov 08 10:11', p: '-rw-r--r--' },
  { n: 'README.md', t: 'file', s: '2.1 KB', m: 'Oct 29 17:55', p: '-rw-r--r--' },
  { n: 'backup-2026-11-07.tar.gz', t: 'file', s: '48.2 MB', m: 'Nov 07 03:00', p: '-rw-r--r--' },
]
export const LOGS = [
  ['12:04:11', 'info', 'Server listening on :3000'],
  ['12:04:12', 'info', 'Connected to pg-main (16.2)'],
  ['12:05:40', 'info', 'GET /v1/products 200 18ms'],
  ['12:05:41', 'info', 'GET /v1/cart 200 9ms'],
  ['12:07:02', 'warn', 'Slow query: orders.list took 812ms'],
  ['12:07:58', 'info', 'POST /v1/checkout 201 142ms'],
  ['12:09:13', 'error', 'ECONNRESET while calling payments-sandbox'],
  ['12:09:14', 'info', 'Retry 1/3 succeeded'],
]
export const SNAPSHOTS = [
  { id: 's1', name: 'nightly-2026-11-08', size: '2.4 GB', when: 'Today 03:00', kind: 'auto' },
  { id: 's2', name: 'before-upgrade', size: '2.3 GB', when: 'Nov 05 18:21', kind: 'manual' },
  { id: 's3', name: 'nightly-2026-11-07', size: '2.4 GB', when: 'Yesterday 03:00', kind: 'auto' },
]
export const SSH_KEYS = [
  { id: 'k1', name: 'stefan-laptop', fp: 'SHA256:9fQ2…Lk7A', added: 'Aug 12, 2026', used: '2 h ago' },
  { id: 'k2', name: 'ci-deploy', fp: 'SHA256:Zx1p…0cVd', added: 'Sep 30, 2026', used: 'Today' },
]
export const FIREWALL = [
  { id: 'f1', dir: 'in', proto: 'TCP', port: '22', src: '203.0.113.0/24', act: 'allow', note: 'Office SSH' },
  { id: 'f2', dir: 'in', proto: 'TCP', port: '80,443', src: 'Anywhere', act: 'allow', note: 'Web' },
  { id: 'f3', dir: 'in', proto: 'TCP', port: '5432', src: '10.0.0.0/16', act: 'allow', note: 'Private DB' },
  { id: 'f4', dir: 'in', proto: 'Any', port: '*', src: 'Anywhere', act: 'deny', note: 'Default deny' },
]
export const DNS = [
  { id: 'd1', type: 'A', name: '@', value: '45.83.12.9', ttl: '300', ok: true },
  { id: 'd2', type: 'CNAME', name: 'www', value: 'blipmade.app', ttl: '3600', ok: true },
  { id: 'd3', type: 'MX', name: '@', value: 'mx1.blipmade.mail (10)', ttl: '3600', ok: true },
  { id: 'd4', type: 'TXT', name: '@', value: 'v=spf1 include:_spf.blipmade.mail ~all', ttl: '3600', ok: true },
  { id: 'd5', type: 'TXT', name: '_dmarc', value: 'v=DMARC1; p=none', ttl: '3600', ok: false },
]
export const MAILBOXES = [
  { id: 'm1', addr: 'stefan@blipmade.app', used: 3.2, quota: 10, status: 'active', aliases: 2 },
  { id: 'm2', addr: 'support@blipmade.app', used: 8.9, quota: 10, status: 'active', aliases: 1 },
  { id: 'm3', addr: 'billing@blipmade.app', used: 0.4, quota: 5, status: 'suspended', aliases: 0 },
]
export const MESSAGES = [
  { id: 1, from: 'Maya Chen', mail: 'maya@northwind.io', subj: 'Re: Migration window for Friday', prev: 'Thanks, Friday 02:00 UTC works for us. Can you confirm the DNS TTL…', time: '10:42', unread: true, body: 'Hi Stefan,\n\nThanks, Friday 02:00 UTC works for us. Can you confirm the DNS TTL has been lowered to 300 before then?\n\nWe will keep the old servers up for 48 hours after cutover.\n\nBest,\nMaya', att: ['migration-plan.pdf'] },
  { id: 2, from: 'Blipmade Billing', mail: 'billing@blipmade.cloud', subj: 'Invoice INV-1048 is ready', prev: 'Your invoice for $38.00 is due on Nov 16. Pay now from the client area…', time: '09:15', unread: true, body: 'Your invoice INV-1048 for $38.00 is ready.\n\nDue date: Nov 16, 2026.\nPay from Billing → Invoices.\n\n(This is a simulated message.)', att: [] },
  { id: 3, from: 'Jonas Weber', mail: 'jonas@weber.dev', subj: 'Staging credentials', prev: 'Sending the staging DB credentials as discussed. Please rotate after use…', time: 'Yesterday', unread: false, body: 'Sending the staging DB credentials as discussed. Please rotate after use.\n\n— Jonas', att: ['staging.env.txt'] },
  { id: 4, from: 'GitHub', mail: 'noreply@github.com', subj: '[blipmade] Deployment succeeded', prev: 'Deployment #482 to production succeeded in 41s.', time: 'Mon', unread: false, body: 'Deployment #482 to production succeeded in 41s.', att: [] },
]
export const SUBS = [
  { id: 'sub1', name: 'VPS Pro · blipmade-prod', price: 12, cycle: 'Monthly', next: 'Dec 02', status: 'active' },
  { id: 'sub2', name: 'Managed Database · pg-cluster', price: 29, cycle: 'Monthly', next: 'Dec 14', status: 'active' },
  { id: 'sub3', name: 'Domain · blipmade.app', price: 14, cycle: 'Yearly', next: 'Aug 18, 2027', status: 'active' },
  { id: 'sub4', name: 'Game Server · mc-survival', price: 9, cycle: 'Monthly', next: 'Cancelled', status: 'cancelled' },
]
export const NOTIFS = [
  { id: 1, kind: 'bad', t: 'Invoice INV-1047 is overdue', d: '$9.00 · 4 days late', when: '2 h ago', unread: true },
  { id: 2, kind: 'ok', t: 'Backup completed', d: 'blipmade-prod · 2.4 GB', when: 'Today 03:00', unread: true },
  { id: 3, kind: 'warn', t: 'High memory on pg-cluster', d: '88% for 15 minutes', when: 'Yesterday', unread: false },
  { id: 4, kind: 'info', t: 'Maintenance Nov 12, 02:00 UTC', d: 'Frankfurt node fra-2 · ~10 min', when: 'Nov 06', unread: false },
]
export const CUSTOMERS = [
  { id: 'c1', name: 'Maya Chen', mail: 'maya@northwind.io', plan: 'Business', mrr: 142, services: 7, status: 'active', country: 'DE', since: 'Jan 2025', risk: 'low' },
  { id: 'c2', name: 'Jonas Weber', mail: 'jonas@weber.dev', plan: 'Pro', mrr: 41, services: 3, status: 'active', country: 'AT', since: 'Mar 2025', risk: 'low' },
  { id: 'c3', name: 'Ana Popescu', mail: 'ana@studio-ap.ro', plan: 'Starter', mrr: 8, services: 1, status: 'past_due', country: 'RO', since: 'Jul 2026', risk: 'medium' },
  { id: 'c4', name: 'Kofi Mensah', mail: 'kofi@mensah.co', plan: 'Pro', mrr: 58, services: 4, status: 'active', country: 'GB', since: 'Sep 2025', risk: 'low' },
  { id: 'c5', name: 'Liu Wei', mail: 'liu@wei.cn', plan: 'Starter', mrr: 12, services: 2, status: 'suspended', country: 'SG', since: 'Oct 2026', risk: 'high' },
  { id: 'c6', name: 'Elena Rossi', mail: 'elena@rossi.it', plan: 'Business', mrr: 203, services: 11, status: 'active', country: 'IT', since: 'Nov 2024', risk: 'low' },
]
export const ORDERS = [
  { id: 'ORD-20418', customer: 'Maya Chen', item: 'VPS Pro × 2', total: 24, status: 'provisioning', when: '4 min ago' },
  { id: 'ORD-20417', customer: 'Jonas Weber', item: 'Domain · weber.dev', total: 13, status: 'completed', when: '1 h ago' },
  { id: 'ORD-20416', customer: 'Ana Popescu', item: 'Web Hosting Nano', total: 4, status: 'pending', when: '3 h ago' },
  { id: 'ORD-20415', customer: 'Elena Rossi', item: 'Managed DB Max', total: 29, status: 'completed', when: 'Yesterday' },
  { id: 'ORD-20414', customer: 'Liu Wei', item: 'VPS Nano', total: 4, status: 'failed', when: 'Yesterday' },
]
export const NODES = [
  { id: 'fra-1', region: 'Frankfurt', cpu: 62, ram: 71, disk: 48, vms: 84, status: 'healthy' },
  { id: 'fra-2', region: 'Frankfurt', cpu: 88, ram: 82, disk: 61, vms: 97, status: 'degraded' },
  { id: 'ams-1', region: 'Amsterdam', cpu: 41, ram: 55, disk: 37, vms: 52, status: 'healthy' },
  { id: 'hel-1', region: 'Helsinki', cpu: 29, ram: 38, disk: 22, vms: 31, status: 'healthy' },
  { id: 'ash-1', region: 'Ashburn', cpu: 0, ram: 0, disk: 0, vms: 0, status: 'offline' },
]
export const INCIDENTS = [
  { id: 'INC-112', t: 'Elevated latency on fra-2', sev: 'minor', status: 'monitoring', when: '35 min ago', updates: ['Investigating packet loss on uplink B.', 'Traffic rerouted, monitoring.'] },
  { id: 'INC-111', t: 'ash-1 unreachable', sev: 'major', status: 'investigating', when: '2 h ago', updates: ['Provider reports power event at the facility.'] },
]
export const AUDIT = [
  { id: 'a1', actor: 'stefan', act: 'product.price.update', target: 'VPS Pro', ip: '85.12.x.x', when: '10:42', diff: '$11.00 → $12.00' },
  { id: 'a2', actor: 'system', act: 'invoice.generated', target: 'INV-1048', ip: '—', when: '10:00', diff: '' },
  { id: 'a3', actor: 'maria', act: 'customer.suspend', target: 'Liu Wei', ip: '91.4.x.x', when: '09:31', diff: 'active → suspended' },
  { id: 'a4', actor: 'stefan', act: 'staff.role.grant', target: 'andrei · Support L2', ip: '85.12.x.x', when: 'Yesterday', diff: '' },
  { id: 'a5', actor: 'system', act: 'node.alert', target: 'fra-2', ip: '—', when: 'Yesterday', diff: 'cpu > 85%' },
]
export const STAFF = [
  { id: 's1', name: 'Stefan', role: 'Owner', mail: 'stefan10xdd@gmail.com', perms: { customers: 'rw', billing: 'rw', infra: 'rw', support: 'rw', settings: 'rw' } },
  { id: 's2', name: 'Maria Ionescu', role: 'Support L2', mail: 'maria@blipmade.cloud', perms: { customers: 'rw', billing: 'r', infra: '', support: 'rw', settings: '' } },
  { id: 's3', name: 'Andrei Pop', role: 'Infra', mail: 'andrei@blipmade.cloud', perms: { customers: 'r', billing: '', infra: 'rw', support: 'r', settings: '' } },
]
export const QUEUE = [
  { id: 'T-5521', subj: 'Cannot reach VPS over SSH', cust: 'Maya Chen', pri: 'high', sla: '12m', agent: 'Maria', status: 'open' },
  { id: 'T-5520', subj: 'Refund request for INV-1031', cust: 'Kofi Mensah', pri: 'normal', sla: '1h 40m', agent: '—', status: 'open' },
  { id: 'T-5518', subj: 'DNS not propagating', cust: 'Jonas Weber', pri: 'normal', sla: '2h', agent: 'Andrei', status: 'pending' },
  { id: 'T-5512', subj: 'Abuse report: spam from 45.83.x.x', cust: 'Liu Wei', pri: 'urgent', sla: 'Overdue', agent: 'Maria', status: 'open' },
]
export const JOBS = [
  { id: 'j1', name: 'billing.generate-invoices', state: 'running', rate: '312/min', last: 'now', fail: 0 },
  { id: 'j2', name: 'provision.vps', state: 'running', rate: '14/min', last: '4s', fail: 1 },
  { id: 'j3', name: 'backup.nightly', state: 'idle', rate: '—', last: '03:00', fail: 0 },
  { id: 'j4', name: 'mail.deliver', state: 'running', rate: '1.2k/min', last: 'now', fail: 3 },
  { id: 'j5', name: 'dns.verify', state: 'failed', rate: '—', last: '2m', fail: 12 },
]
export const CATALOG = [
  { id: 'web', name: 'Web hosting', from: 4, blurb: 'Managed PHP, static and Node sites with free SSL.', tag: 'Popular' },
  { id: 'vps', name: 'VPS', from: 4, blurb: 'NVMe virtual servers with root access, from 1 vCPU.', tag: '' },
  { id: 'game', name: 'Game servers', from: 9, blurb: 'Minecraft, Rust, CS2 and more with one-click install.', tag: '' },
  { id: 'db', name: 'Databases', from: 12, blurb: 'Managed PostgreSQL, MySQL and Redis with backups.', tag: 'New' },
  { id: 'mail', name: 'Email hosting', from: 3, blurb: 'Business mailboxes on your own domain.', tag: '' },
  { id: 'dom', name: 'Domains', from: 3, blurb: 'Register and transfer domains with free WHOIS privacy.', tag: '' },
]
export const REVENUE = [18, 22, 21, 27, 31, 29, 36, 41, 39, 46, 52, 58]
