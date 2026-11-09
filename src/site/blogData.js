/* Mock blog content for /site/blog. Authors and stories are invented. */
export const BLOG_CATEGORIES = [
  { id: 'product', label: 'Product' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'guides', label: 'Guides' },
  { id: 'changelog', label: 'Changelog' },
  { id: 'company', label: 'Company' },
]

export const AUTHORS = {
  maya: { name: 'Maya Chen', role: 'Co-founder, product', initial: 'M' },
  jonas: { name: 'Jonas Weber', role: 'Infrastructure engineer', initial: 'J' },
  elena: { name: 'Elena Rossi', role: 'Developer relations', initial: 'E' },
  andrei: { name: 'Andrei Pop', role: 'Support lead', initial: 'A' },
}

/* cover: the dot artwork (kind, seed). blip: the Blip that reviewed or co-wrote it (chat | builder | dev | game) */
export const POSTS = [
  {
    id: 'meet-the-blips', title: 'Meet the Blips: four AI agents that live inside your hosting', category: 'product', date: '2026-11-09', read: 6, author: 'maya', blip: 'chat', cover: { kind: 'cast', seed: 3 }, featured: true,
    excerpt: 'A chat assistant, a website builder, a developer agent and a game-server debugger. Why we built agents into the platform instead of next to it, and what they can and cannot do yet.',
    body: [
      ['p', 'Hosting is a strange product. When it works nobody notices it, and when it breaks you need an expert at 2 am. For years the answer was documentation and a support queue. Today we are adding a fourth option: an agent that already knows your project.'],
      ['h2', 'Four characters, four jobs'],
      ['p', 'We did not want one chatbot that pretends to do everything. Each Blip has a narrow job, its own tools and its own temperament, so you can tell at a glance who you are talking to.'],
      ['list', ['Pip answers questions about your account, your invoices and your services, in your language.', 'Forge designs and ships websites from a sentence, then keeps editing them with you.', 'Byte reads your repository and your stack traces, finds the line and opens a pull request.', 'Glitch watches game servers, reads crash logs and names the plugin that is eating your tick rate.']],
      ['quote', 'It found a memory leak that three of us had missed for a month. The fix and the pull request were ready before the call ended.', 'Maya Chen, CTO at Northwind (beta user)'],
      ['h2', 'What they are allowed to do'],
      ['p', 'A Blip never changes anything without you. It proposes, shows the exact diff or the exact command, and waits. Billing changes, deletions and anything that restarts a customer service always need a click from a human.'],
      ['callout', 'Everything is a preview for now', 'The Blips in this mock-up are a design study. Nothing here talks to a real model, and prices and limits are placeholders.', 'info'],
      ['h2', 'What comes next'],
      ['p', 'We will start with Pip and Forge in the client area, then bring Byte to repositories, and Glitch to the game-server panel. If you want to try one early, tell us which.'],
    ],
  },
  {
    id: 'faster-deploys', title: 'How we made deploys 38% faster without changing a line of your code', category: 'engineering', date: '2026-11-05', read: 8, author: 'jonas', blip: 'dev', cover: { kind: 'wave', seed: 7 },
    excerpt: 'Per-region layer caches, a smarter scheduler and one embarrassing DNS lookup. The median deploy dropped from 65 to 40 seconds.',
    body: [
      ['p', 'In September the median deploy took 65 seconds. Most of that was not building: it was waiting. Pulling layers from a registry in another country, waiting for a node with free capacity, and a DNS lookup that ran four times per deploy.'],
      ['h2', 'Layers stay where the node is'],
      ['p', 'Image layers are now cached per region. A layer that one customer pulled in Frankfurt is available to every other node in Frankfurt without leaving the datacentre.'],
      ['code', 'bash', 'blip deploy ./api --region fra\n› Packing source (4.2 MB)\n› Reusing 11 of 12 cached layers\n✓ Live at api-7f3a.blipmade.app in 38 s'],
      ['h2', 'The scheduler stopped guessing'],
      ['p', 'We used to place a new container on the emptiest node. Now we place it on the node that already holds most of its layers, as long as it has headroom. That single change removed 9 seconds from the median.'],
      ['callout', 'The embarrassing part', 'A health check resolved the service hostname four times in a row, each with a one-second timeout when the answer was not cached. It is now resolved once and reused.', 'warn'],
      ['h2', 'Results'],
      ['list', ['Median deploy: 65 s to 40 s.', 'p95 deploy: 140 s to 71 s.', 'Failed deploys caused by timeouts: down 72%.']],
      ['p', 'None of this needed a change on your side. If you deploy from git, your next push is already faster.'],
    ],
  },
  {
    id: 'move-minecraft-server', title: 'Moving a Minecraft server without kicking anyone', category: 'guides', date: '2026-11-02', read: 7, author: 'elena', blip: 'game', cover: { kind: 'grid', seed: 11 },
    excerpt: 'A step by step migration from another host, with a Friday cutover window, a world backup you can verify, and a rollback that takes a minute.',
    body: [
      ['p', 'Moving a world is mostly about trust. You want to know the copy is complete, that the old server stays untouched until the new one is proven, and that you can go back.'],
      ['h2', '1. Take a backup you can verify'],
      ['p', 'Stop saving first, then copy the world folder. Compare sizes and the number of region files before you trust it.'],
      ['code', 'bash', '/save-off\n/save-all flush\ntar czf world-backup.tgz world world_nether world_the_end\nsha256sum world-backup.tgz'],
      ['h2', '2. Create the new server'],
      ['p', 'Pick the same edition and version as the old one. Paper and Forge worlds are compatible across versions only upward, so do not downgrade.'],
      ['h2', '3. Upload and start in a quiet window'],
      ['list', ['Upload the archive from the file manager and extract it.', 'Start the server and watch the first minute of the log.', 'Join once yourself and check spawn, chests and one far chunk.']],
      ['callout', 'Keep the old server for a week', 'Leave it stopped, not deleted. If something looks wrong you can start it again and point players back by changing one DNS record.', 'info'],
      ['h2', '4. Switch the address'],
      ['p', 'Lower the TTL of your server record the day before. At cutover, change it to the new IP. Most players reconnect within a few minutes.'],
    ],
  },
  {
    id: 'november-changelog', title: 'November changelog: bookings, a new status page, faster deploys', category: 'changelog', date: '2026-11-01', read: 4, author: 'maya', cover: { kind: 'rings', seed: 5 },
    excerpt: 'Everything we shipped in November, in one place, with what is coming in December.',
    body: [
      ['p', 'A short list this month, because we spent a lot of it on foundations.'],
      ['h2', 'New'],
      ['list', ['Bookings in the website builder: describe a reservation flow and get a real form, emails and a calendar.', 'Status page 2.0 with per-region history, incident emails and an RSS feed.', 'Notification center in the client area with unread counts and mark all read.']],
      ['h2', 'Improved'],
      ['list', ['Deploys are about 38% faster.', 'The file manager can rename, upload by drag and drop, and undo a delete.', 'Webmail has folders, search and keyboard shortcuts.']],
      ['h2', 'Fixed'],
      ['list', ['A DNS verification that failed once no longer needs a manual retry.', 'Chart tooltips no longer stay open after the page scrolls.']],
      ['callout', 'Coming in December', 'Byte for repositories, hourly snapshots for databases, and a second region in Helsinki.', 'info'],
    ],
  },
  {
    id: 'why-hourly-billing', title: 'Why we bill by the hour, and cap it by the month', category: 'company', date: '2026-10-28', read: 5, author: 'maya', cover: { kind: 'wave', seed: 19 },
    excerpt: 'You should pay for the server you used, not for the month you did not. The thinking behind hourly billing with a monthly ceiling.',
    body: [
      ['p', 'A server you resize on the 9th should be billed at the new size from the 9th, not from the next invoice. That sounds obvious, and it is surprisingly rare.'],
      ['h2', 'Hourly, with a ceiling'],
      ['p', 'Every service is metered by the hour, but the monthly price is the ceiling. A server that runs all month costs exactly its list price. A test server you delete after two days costs two days.'],
      ['quote', 'The best pricing page is the one nobody needs to read twice.', 'Maya Chen'],
      ['h2', 'No surprises'],
      ['list', ['The price of any size is shown before you confirm it.', 'Upgrades and downgrades take effect immediately and are prorated to the hour.', 'Unused credit stays on your account.']],
      ['p', 'We also publish the card of rates in the docs, so you can compute any bill yourself.'],
    ],
  },
  {
    id: 'debug-tick-lag', title: 'Debugging tick lag: from 9 pm spikes to one misbehaving plugin', category: 'engineering', date: '2026-10-24', read: 9, author: 'jonas', blip: 'game', cover: { kind: 'sphere', seed: 2 },
    excerpt: 'How we trace server lag from the profiler to a single plugin, and how Glitch automates the boring half of it.',
    body: [
      ['p', 'Tick lag has a signature: it comes in waves, it correlates with something players do, and the average hides it. The first job is to stop looking at the average.'],
      ['h2', 'Start with the profiler, not the hardware'],
      ['p', 'Adding RAM is the reflex. It rarely helps, because tick lag is mostly one thread doing too much work. Sample the main thread for two minutes during the spike and sort by total time.'],
      ['code', 'text', 'Server thread, 120 s sample\n41.2%  DynmapRenderer.renderTile\n18.0%  MobStacker.mergeEntities\n 9.4%  ChunkLoader.preload\n 3.1%  net.minecraft.world.level.Level.tick'],
      ['h2', 'Then correlate'],
      ['p', 'A plugin that burns 41% of a tick is a suspect, not a verdict. Check what changed: a plugin update, a new world border, a farm that players built last week.'],
      ['callout', 'What Glitch does for you', 'Glitch takes the sample, groups frames by plugin, checks the plugin changelog for recent releases and proposes one change. It never edits a config without your approval.', 'info'],
      ['h2', 'Fix, measure, repeat'],
      ['p', 'Lower the render rate, cap the stacker radius, then sample again. If the plugin is still above 10% of a tick, replace it.'],
    ],
  },
  {
    id: 'point-a-domain', title: 'Point a domain at your server in five minutes', category: 'guides', date: '2026-10-20', read: 3, author: 'andrei', blip: 'chat', cover: { kind: 'grid', seed: 23 },
    excerpt: 'One A record, one check, and HTTPS arrives by itself. The shortest path from a new domain to a live site.',
    body: [
      ['p', 'You need two things: the IP address of your server and access to your domain registrar. Everything else is automatic.'],
      ['h2', 'Create the record'],
      ['code', 'text', 'Type  Name  Value        TTL\nA     @     45.83.12.9   300\nA     www   45.83.12.9   300'],
      ['h2', 'Wait, then verify'],
      ['p', 'Most records are visible within a few minutes. Open Domains in the client area and press Verify; we check from three regions and issue the certificate as soon as all three agree.'],
      ['callout', 'It says “not verified yet”?', 'That usually means the record has not reached our resolvers. Check the value for a trailing dot or a typo, and wait the length of the TTL before trying again.', 'warn'],
      ['p', 'If you would rather not touch DNS at all, transfer the domain to us and we will handle it.'],
    ],
  },
  {
    id: 'resize-without-reboot', title: 'Resizing a VPS without a reboot: what changes, what does not', category: 'product', date: '2026-10-15', read: 5, author: 'jonas', cover: { kind: 'rings', seed: 31 },
    excerpt: 'Memory and disk can grow while the machine runs. CPU needs a short restart. Here is the whole matrix, and what it costs.',
    body: [
      ['p', 'Not every resource is equally easy to change on a running machine. We tell you before you click which ones need a restart.'],
      ['h2', 'The matrix'],
      ['list', ['Memory: grows live, shrinks on the next restart.', 'Disk: grows live, cannot shrink.', 'vCPU: needs a restart of about 30 seconds.', 'IPv4: attach and detach live.']],
      ['h2', 'Billing follows the change'],
      ['p', 'The new price applies from the minute the change completes, prorated to the hour. If you grow for a launch day and shrink the next day, you pay for one day of the larger size.'],
      ['callout', 'Snapshots first', 'Before a disk change we take a snapshot automatically and keep it for seven days. You can restore it with one click.', 'info'],
    ],
  },
]

export const postById = (id) => POSTS.find((p) => p.id === id)
export const fmtDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
