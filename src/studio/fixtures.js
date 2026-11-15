/* Fixtures for the refined screens.
   Every number, name, address and price in this file is invented for the design. Nothing
   here is connected to a Blipmade account, a node, an invoice or a ticket, and nothing in
   the screens may present these values as live. The screens label themselves as
   simulated wherever a figure could be mistaken for a measurement. */

export const eur = (n) => '€' + Number(n).toFixed(2)

export const ACCOUNT = {
  name: 'Stefan',
  fullName: 'Stefan Ionescu-Petrescu',
  email: 'stefan10xdd@gmail.com',
  plan: 'Blipmade Pro',
  credit: 42.5,
}

/* One inventory, used by both the overview (30) and the apps screen (31), so the numbers
   on the overview are the same numbers the list shows.
   status: running | stopped | failed | provisioning | suspended | cancelled
   stoppedByUser marks a service the customer stopped on purpose: it is never "attention". */
export const INVENTORY = [
  { id: 'bm3-web', name: 'bm3-web', kind: 'app', product: 'Node.js 22', type: 'Application', status: 'running', host: 'bm3-web.apps.blipmade.com', plan: 'Pro', spec: '2 vCPU · 4 GB · 80 GB', cpu: 12, ram: 38, disk: 22, price: 12, endpoint: 'https://bm3-web.apps.blipmade.com' },
  { id: 'api-gateway', name: 'api-gateway', kind: 'app', product: 'Node.js 22', type: 'Application', status: 'running', host: 'api-gateway.apps.blipmade.com', plan: 'Pro', spec: '2 vCPU · 4 GB · 80 GB', cpu: 41, ram: 63, disk: 34, price: 12, endpoint: 'https://api-gateway.apps.blipmade.com' },
  { id: 'portfolio-site', name: 'portfolio-site', kind: 'app', product: 'WordPress', type: 'Application', status: 'running', host: 'portfolio.blipmade.app', plan: 'Nano', spec: '1 vCPU · 2 GB · 40 GB', cpu: 8, ram: 22, disk: 9, price: 4, endpoint: 'https://portfolio.blipmade.app' },
  { id: 'metrics-app', name: 'metrics-app', kind: 'app', product: 'Node.js 22', type: 'Application', status: 'running', host: 'metrics.apps.blipmade.com', plan: 'Nano', spec: '1 vCPU · 2 GB · 40 GB', cpu: 6, ram: 31, disk: 14, price: 6, endpoint: 'https://metrics.apps.blipmade.com' },
  { id: 'mail-relay', name: 'mail-relay', kind: 'app', product: 'Go 1.23', type: 'Application', status: 'running', host: 'mail-relay.apps.blipmade.com', plan: 'Nano', spec: '1 vCPU · 1 GB · 20 GB', cpu: 5, ram: 18, disk: 6, price: 3, endpoint: 'smtp://mail-relay.apps.blipmade.com:587' },
  { id: 'staging-web', name: 'staging-web', kind: 'app', product: 'WordPress', type: 'Application', status: 'stopped', stoppedByUser: true, host: 'staging.blipmade.app', plan: 'Nano', spec: '1 vCPU · 2 GB · 40 GB', cpu: 0, ram: 0, disk: 12, price: 4, endpoint: 'https://staging.blipmade.app' },
  { id: 'discord-bot', name: 'discord-bot', kind: 'bot', product: 'Node.js 22', type: 'Application', status: 'running', host: 'discord-bot.apps.blipmade.com', plan: 'Nano', spec: '1 vCPU · 1 GB · 20 GB', cpu: 3, ram: 29, disk: 4, price: 4.49, endpoint: 'discord-bot.apps.blipmade.com' },
  { id: 'code-server', name: 'code-server', kind: 'code', product: 'Code Server', type: 'Application', status: 'running', host: 'code-server.apps.blipmade.com', plan: 'Free', spec: '1 vCPU · 2 GB · 20 GB', cpu: 3, ram: 29, disk: 7, price: 0, endpoint: 'https://code-server.apps.blipmade.com' },
  { id: 'pg-primary', name: 'pg-primary', kind: 'db', product: 'PostgreSQL 17', type: 'Database', status: 'running', host: 'pg-primary.db.blipmade.com', plan: 'Max', spec: '4 vCPU · 8 GB · 160 GB', cpu: 72, ram: 88, disk: 61, price: 29, endpoint: 'postgresql://blipmade:••••@pg-primary.db.blipmade.com:5432/blipmade' },
  { id: 'pg-replica', name: 'pg-replica', kind: 'db', product: 'PostgreSQL 17', type: 'Database', status: 'running', host: 'pg-replica.db.blipmade.com', plan: 'Pro', spec: '2 vCPU · 4 GB · 80 GB', cpu: 31, ram: 54, disk: 28, price: 14, endpoint: 'postgresql://blipmade:••••@pg-replica.db.blipmade.com:5432/blipmade' },
  { id: 'mysql-analytics', name: 'mysql-analytics', kind: 'db', product: 'MySQL 8.4', type: 'Database', status: 'failed', host: 'mysql-analytics.db.blipmade.com', plan: 'Pro', spec: '2 vCPU · 4 GB · 100 GB', cpu: 0, ram: 0, disk: 0, price: 12, endpoint: 'mysql://blipmade:••••@mysql-analytics.db.blipmade.com:3306/analytics', failure: 'Migration 0042 failed on the analytics schema' },
  { id: 'cs2-eu', name: 'cs2-eu', kind: 'game', product: 'Counter-Strike 2', type: 'Game server', status: 'provisioning', host: 'cs2-eu.games.blipmade.com', plan: 'Max', spec: '4 vCPU · 8 GB · 80 GB', cpu: 0, ram: 0, disk: 12, price: 12, endpoint: 'cs2-eu.games.blipmade.com:27015' },
  { id: 'minecraft-survival', name: 'minecraft-survival', kind: 'game', product: 'Minecraft Paper', type: 'Game server', status: 'stopped', stoppedByUser: true, host: 'minecraft-survival.games.blipmade.com', plan: 'Pro', spec: '3 vCPU · 6 GB · 40 GB', cpu: 0, ram: 0, disk: 31, price: 9, endpoint: 'minecraft-survival.games.blipmade.com:25565' },
]

export const INVOICES = {
  outstanding: [
    { id: 'INV-1048', date: 'Nov 02', due: 'Nov 16', amount: 41, status: 'unpaid', label: '4 services · until Nov 16' },
    { id: 'INV-1047', date: 'Oct 21', due: 'Nov 04', amount: 9, status: 'overdue', label: 'minecraft-survival · 12 days late' },
  ],
  paid: [
    { id: 'INV-1046', date: 'Oct 02', amount: 38, status: 'paid' },
    { id: 'INV-1045', date: 'Sep 14', amount: 8, status: 'paid' },
    { id: 'INV-1044', date: 'Sep 02', amount: 41, status: 'paid' },
  ],
}

export const TICKETS = [
  { id: 1, subject: 'Cannot reach my VPS over SSH', status: 'open', waiting: true, when: '12 min ago', dept: 'Technical', note: 'The agent replied. It waits for your answer.' },
  { id: 2, subject: 'Upgrade pg-cluster to 8 GB RAM', status: 'answered', waiting: false, when: '2 h ago', dept: 'Sales', note: 'Answered by us. Nothing to do.' },
  { id: 3, subject: 'Invoice INV-1047 question', status: 'closed', waiting: false, when: '3 days ago', dept: 'Billing', note: 'Closed.' },
]

export const ACTIVITY = [
  { id: 'a1', icon: 'restart', title: 'pg-primary restarted', note: 'Automatic restart after a node update', when: '09:12' },
  { id: 'a2', icon: 'invoice', title: 'Invoice INV-1046 paid', note: '€38.00 · card ending 4242', when: 'Yesterday' },
  { id: 'a3', icon: 'ticket', title: 'Ticket #2 answered', note: 'Upgrade pg-cluster to 8 GB RAM', when: 'Yesterday' },
  { id: 'a4', icon: 'deploy', title: 'cs2-eu is being prepared', note: 'Counter-Strike 2 · Germany', when: '2 days ago' },
  { id: 'a5', icon: 'domain', title: 'blipmade.app renewed', note: 'Until Aug 18, 2027', when: '4 days ago' },
  { id: 'a6', icon: 'user', title: 'staging-web stopped', note: 'Stopped by you · disk is kept', when: '5 days ago' },
]

/* the fleet, averaged over the running services */
export const FLEET = { cpu: 38, ram: 64, disk: 47, net: 88, count: 9, peakCpu: 'api-gateway 41%', peakRam: 'pg-primary 88%' }

/* platform uptime, 90 days. This is the platform, not your services. */
export const UPTIME = { value: '99.98%', days: 90, incidents: { 12: 'warn', 47: 'bad', 71: 'warn' }, degraded: 2, outages: 1 }

/* outbound traffic per day, in GB. A real week has quiet days: the curve has to be able
   to show a dip, otherwise the chart is a block of dots and says nothing. */
const wave = (n, seed) => Array.from({ length: n }, (_, i) => {
  const weekend = i % 7 === 5 || i % 7 === 6 ? 0.35 : 1
  const base = 26 + Math.sin((i + seed) / 1.7) * 14 + ((i * 29) % 17)
  const spike = i % 11 === 4 ? 21 : 0
  return Math.round(Math.max(3, (base * weekend + spike)) * 10) / 10
})
export const BANDWIDTH = {
  '14': wave(14, 0),
  '30': wave(30, 3),
  '60': wave(60, 7),
}
export const BANDWIDTH_TOTAL = { '14': 812.4, '30': 1240.8, '60': 2386.1 }

/* the helpers the screens share */
export const counts = {
  all: INVENTORY.length,
  apps: INVENTORY.filter((s) => s.type === 'Application').length,
  dbs: INVENTORY.filter((s) => s.type === 'Database').length,
  games: INVENTORY.filter((s) => s.type === 'Game server').length,
  running: INVENTORY.filter((s) => s.status === 'running').length,
  stopped: INVENTORY.filter((s) => s.status === 'stopped').length,
  failed: INVENTORY.filter((s) => s.status === 'failed').length,
  provisioning: INVENTORY.filter((s) => s.status === 'provisioning').length,
}
export const monthlyTotal = INVENTORY.reduce((a, s) => a + s.price, 0)
