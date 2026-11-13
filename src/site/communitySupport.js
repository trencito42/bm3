export const SUPPORT_PROFILE = {
  slug: 'northwind', name: 'Northwind SMP', owner: 'trencito', game: 'minecraft',
  story: 'A little world built by a good group of people. Your support helps us keep it online, make room for new adventures, and save a place for everyone at spawn.',
  goalCents: 10000, goalLabel: 'Our next month online', showGoal: true, showSupporters: true, accepting: true,
}
export const SUPPORT_GAMES = [['minecraft', 'Minecraft'], ['cs2', 'Counter-Strike 2'], ['rust', 'Rust']]
export const validSupportSlug = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{2,29}$/.test(value)

// Parse decimal text into cents. No floating point arithmetic in the contribution.
export function supportAmount(text, maximum = 100000) {
  if (!/^(0|[1-9]\d{0,4})(\.\d{1,2})?$/.test(String(text).trim())) return null
  const [whole, fraction = ''] = String(text).trim().split('.')
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return cents >= 100 && cents <= maximum ? cents : null
}
export function supportProfileError(profile) {
  if (!validSupportSlug(profile.slug)) return 'Use 3–30 lowercase letters, numbers or hyphens for your link.'
  if (profile.slug === 'preview') return 'Choose a different page handle; preview is reserved for the workspace.'
  if (!profile.name.trim() || profile.name.length > 48) return 'Give your server a name, up to 48 characters.'
  if (profile.story.length > 480) return 'Keep your introduction within 480 characters.'
  if (!SUPPORT_GAMES.some(([id]) => id === profile.game)) return 'Choose a supported game.'
  if (!Number.isInteger(profile.goalCents) || profile.goalCents < 100 || profile.goalCents > 1000000) return 'Choose a goal between $1 and $10,000.'
  if (!profile.goalLabel.trim() || profile.goalLabel.length > 60) return 'Give your goal a short name, up to 60 characters.'
  return ''
}
export function readSupportProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem('blip-support-page-demo') || 'null')
    if (!saved) return SUPPORT_PROFILE
    const clean = Object.fromEntries(Object.keys(SUPPORT_PROFILE).map(key => [key, saved[key] ?? SUPPORT_PROFILE[key]]))
    if (['showGoal', 'showSupporters', 'accepting'].some(k => typeof clean[k] !== 'boolean')) return SUPPORT_PROFILE
    return supportProfileError(clean) ? SUPPORT_PROFILE : clean
  } catch { return SUPPORT_PROFILE }
}
export function saveSupportProfile(profile) {
  try { localStorage.setItem('blip-support-page-demo', JSON.stringify(profile)) } catch { /* in-memory demo still works */ }
}
export const supportTotal = entries => entries.reduce((sum, entry) => sum + entry.amountCents, 0)
