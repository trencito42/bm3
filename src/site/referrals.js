/* URL-only attribution for the prototype. No cookies, storage or tracking calls.
   A real affiliate id must be verified by the backend before awarding commission. */
export const REFERRAL_INTENTS = ['all', 'games', 'apps', 'sites']
export const validReferral = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{2,23}$/.test(value)
export function readReferral(search = '', outerSearch = '') {
  const local = new URLSearchParams(search), outer = new URLSearchParams(outerSearch)
  const handle = local.has('ref') ? local.get('ref') : outer.get('ref')
  if (!validReferral(handle)) return null
  const intent = local.get('for') || outer.get('for') || 'all'
  return { handle, intent: REFERRAL_INTENTS.includes(intent) ? intent : 'all' }
}
export function referralPath(path, referral) {
  if (!referral || !validReferral(referral.handle)) return path
  const [pathname, query = ''] = path.split('?')
  const params = new URLSearchParams(query)
  params.set('ref', referral.handle)
  if (referral.intent && referral.intent !== 'all') params.set('for', referral.intent)
  else params.delete('for')
  return `${pathname}?${params}`
}
export function referralUrl(handle) {
  return `https://blipmade.com/${referralPath('', { handle, intent: 'all' })}`
}
