/* Mock catalog for the public site's /site/apps pages. Prices are simulated and computed in the browser; nothing here is real. */
import { Bot, Code2, Database, Gamepad2 } from 'lucide-react'

export const APP_CATEGORIES = [
  { id: 'games', label: 'Games', icon: Gamepad2, blurb: 'Servers for the games you play with friends.' },
  { id: 'dev', label: 'Developer tools', icon: Code2, blurb: 'Runtimes and self-hosted tools, ready to deploy.' },
  { id: 'db', label: 'Databases', icon: Database, blurb: 'Managed engines with daily backups.' },
  { id: 'bots', label: 'Bots', icon: Bot, blurb: 'Always-on bots that restart themselves.' },
]

/* ram: [min, max, default] in GB. rate: price per GB of memory per month; base: fixed part. */
const mk = (id, name, category, tagline, from, extra = {}) => ({ id, name, category, tagline, from, ram: [1, 16, 2], rate: from / 2, base: 0, ...extra })

export const EDITIONS = [
  { id: 'paper', label: 'Paper', note: 'Fast Java server with plugin support. The usual choice.', tags: ['Java', 'Plugins', 'Best performance'] },
  { id: 'forge', label: 'Forge', note: 'Mod loader for large modpacks. Needs more memory.', tags: ['Java', 'Mods'], ramMin: 4 },
  { id: 'vanilla', label: 'Vanilla', note: 'The unmodified server from Mojang.', tags: ['Java', 'Unmodified'] },
  { id: 'bedrock', label: 'Bedrock', note: 'For phones, consoles and Windows 10 players.', tags: ['Bedrock', 'Cross-play'] },
  { id: 'folia', label: 'Folia', note: 'Regionised multithreading for very large player counts.', tags: ['Java', 'Multithreaded'], ramMin: 4 },
]

export const APPS = [
  mk('minecraft', 'Minecraft', 'games', 'Choose Paper, Forge, Vanilla, Bedrock or Folia.', 6.24, { ram: [2, 32, 4], rate: 1.56, editions: true, slots: 6 }),
  mk('cs2', 'Counter-Strike 2', 'games', 'Dedicated server with RCON and workshop maps.', 9.5, { ram: [4, 16, 4], rate: 2.4, slots: 5 }),
  mk('cs', 'Counter-Strike 1.6', 'games', 'Classic Counter-Strike with AMX Mod X and custom maps.', 3, { ram: [1, 8, 2], rate: 1.5, slots: 12 }),
  mk('rust', 'Rust', 'games', 'Vanilla or Oxide, with wipe schedules.', 14, { ram: [8, 32, 8], rate: 1.8, slots: 12 }),
  mk('valheim', 'Valheim', 'games', 'Persistent worlds with automatic backups.', 7.5, { ram: [2, 8, 4], rate: 1.9, slots: 4 }),
  mk('terraria', 'Terraria', 'games', 'tModLoader ready, one-click world upload.', 4.2, { ram: [1, 8, 2], rate: 2.1, slots: 8 }),
  mk('ark', 'ARK: Survival Ascended', 'games', 'Heavy world, fast NVMe. Cluster ready.', 18, { ram: [12, 32, 16], rate: 1.5, slots: 10 }),
  mk('factorio', 'Factorio', 'games', 'Headless server with mod portal sync.', 5.4, { ram: [2, 8, 2], rate: 2.7, slots: 6 }),
  mk('palworld', 'Palworld', 'games', 'Dedicated server with auto-restart on crash.', 11, { ram: [8, 32, 8], rate: 1.4, slots: 8, soon: true }),
  mk('node', 'Node.js app', 'dev', 'Deploy from git or a folder. HTTPS included.', 3.9, { ram: [1, 8, 1], rate: 3.9 }),
  mk('python', 'Python app', 'dev', 'Gunicorn or ASGI, virtualenv handled for you.', 3.9, { ram: [1, 8, 1], rate: 3.9 }),
  mk('php', 'PHP app', 'dev', 'PHP 8.4 with Composer and opcache tuned.', 3.5, { ram: [1, 8, 1], rate: 3.5 }),
  mk('go', 'Go service', 'dev', 'Static binary, graceful restarts, zero config.', 3.2, { ram: [1, 8, 1], rate: 3.2 }),
  mk('docker', 'Docker container', 'dev', 'Run any public image with a volume attached.', 4.5, { ram: [1, 16, 2], rate: 2.25 }),
  mk('n8n', 'n8n', 'dev', 'Workflow automation with persistent storage.', 5.8, { ram: [2, 8, 2], rate: 2.9 }),
  mk('gitea', 'Gitea', 'dev', 'Self-hosted git with CI runners.', 4.9, { ram: [1, 8, 2], rate: 2.45 }),
  mk('postgres', 'PostgreSQL', 'db', 'Managed PostgreSQL 17 with point-in-time restore.', 12, { ram: [1, 32, 2], rate: 6 }),
  mk('mysql', 'MySQL', 'db', 'MySQL 8 with automatic daily backups.', 10, { ram: [1, 32, 2], rate: 5 }),
  mk('redis', 'Redis', 'db', 'In-memory store with optional persistence.', 8, { ram: [1, 16, 1], rate: 8 }),
  mk('mongo', 'MongoDB', 'db', 'Replica-set ready document database.', 13, { ram: [2, 32, 2], rate: 6.5 }),
  mk('mariadb', 'MariaDB', 'db', 'Drop-in MySQL replacement, tuned defaults.', 9, { ram: [1, 32, 2], rate: 4.5 }),
  mk('discord-node', 'Discord bot (Node.js)', 'bots', 'discord.js bot with environment secrets.', 2.4, { ram: [1, 4, 1], rate: 2.4 }),
  mk('discord-py', 'Discord bot (Python)', 'bots', 'discord.py bot, restarts on failure.', 2.4, { ram: [1, 4, 1], rate: 2.4 }),
  mk('telegram', 'Telegram bot', 'bots', 'Webhook or polling, TLS handled for you.', 2.2, { ram: [1, 4, 1], rate: 2.2 }),
  mk('twitch', 'Twitch bot', 'bots', 'Chat bot with persistent token storage.', 2.2, { ram: [1, 4, 1], rate: 2.2, soon: true }),
]

export const REGIONS = [['fra', 'Frankfurt', 14], ['ams', 'Amsterdam', 18], ['hel', 'Helsinki', 31], ['ash', 'Ashburn', 96]]

/* the price of a size: memory is the driver, disk is a small add-on, backups are included */
export const priceOf = (app, ram, disk, yearly) => (app.base + ram * app.rate + (disk - 10) * 0.02) * (yearly ? 0.8 : 1)
