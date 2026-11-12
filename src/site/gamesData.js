/* Game presentation metadata. Resource limits and prices stay in appsData.js. */
import { APPS } from './appsData.js'

export const GAME_GROUPS = ['All games', 'Sandbox', 'Survival', 'Competitive']
const meta = {
  minecraft: ['Sandbox', '#a8ca94', 'Build your little corner of the internet.', ['Java & Bedrock', 'Mods & plugins'], 'Your world. Your rules.', 'From a quiet survival world to a heavily modded community. Pick your edition, bring your friends, make it yours.'],
  cs2: ['Competitive', '#e5bb77', 'Less waiting. More “one more round”.', ['Workshop maps', 'RCON ready'], 'The next round is yours.', 'Practice with your team, host a community match, or just settle the score. Your maps, your settings, your server.'],
  cs: ['Competitive', '#b8bfd2', 'The original. Still worth staying up for.', ['Counter-Strike 1.6', 'AMX Mod X'], 'Some games never get old.', 'Dust2, a few friends and a server that feels like home. Keep the classic alive with your own maps and plugins.'],
  rust: ['Survival', '#d99885', 'A fresh wipe. A very long weekend.', ['Oxide / uMod', 'Wipe schedules'], 'Start with a rock. Build a community.', 'Set your wipe schedule, tune the world and choose your plugins. Make a home for your next very long weekend.'],
  valheim: ['Survival', '#a8bfd3', 'A home for your favourite Vikings.', ['Persistent worlds', 'World uploads'], 'Your saga stays online.', 'Explore, build and take on the next boss together. Your world keeps its place while the crew is away.'],
  terraria: ['Sandbox', '#a9c697', 'Dig deeper. Bring everyone along.', ['tModLoader', 'World uploads'], 'A small world. A big adventure.', 'Bring an existing world or start from the surface. There is always another cave to explore with friends.'],
  ark: ['Survival', '#9cc7c9', 'Big creatures. Bigger plans.', ['Cluster ready', 'Mod support'], 'Make room for something bigger.', 'Build your tribe a persistent home, tune the survival settings and take your next adventure across the island.'],
  factorio: ['Sandbox', '#d1b28c', 'The factory must grow. Together.', ['Mod portal sync', 'Headless server'], 'Keep the factory growing.', 'Bring your blueprints, sync your mods and let everyone work on the next wonderfully overcomplicated production line.'],
  palworld: ['Survival', '#b9abd4', 'Your next shared adventure.', ['Dedicated server', 'Auto-restart'], 'An adventure with room for everyone.', 'A dedicated home for your crew and your Pals. Join the waitlist while we finish preparing this server image.'],
}

export const GAMES = APPS.filter(a => a.category === 'games').map(a => {
  const [group, color, description, tags, headline, intro] = meta[a.id]
  return { ...a, group, color, description, tags, headline, intro }
})
export const FEATURED_GAMES = ['minecraft', 'cs2', 'rust'].map(id => GAMES.find(g => g.id === id))

export const GAME_FAQ = [
  ['Can I bring my existing world?', 'Yes. Upload your world and configuration through the file manager or SFTP. Take a backup at your old host first. If you need a hand planning the move, contact us.'],
  ['Can I install mods and plugins?', 'Yes, on the server editions that support them. Minecraft has Paper and Forge presets; Rust supports Oxide / uMod. You can manage your files from the same panel.'],
  ['How many friends can join?', 'It depends on the game, world size and mods. Each configuration shows an estimated player count. Choose enough memory for your world, and increase it later as your community grows.'],
  ['Can I change the plan later?', 'Yes. Adjust memory and storage from your client area. Your price follows the resources you select; there is no long-term contract.'],
  ['Is Palworld available yet?', 'Not yet. It is listed as coming soon. You can explore the configuration and use Notify me on its page.'],
]
