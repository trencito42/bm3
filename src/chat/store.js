/* Chat store: one conversation shared by the launcher, the panel and the rest of the app (external store, no provider).
   Mock engine only: Blips answer from small canned scripts, "operators" are timers. Nothing leaves the browser. */
import { useSyncExternalStore } from 'react'

const KEY = 'blipmade-chat-v1'
const clock = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

export const AGENTS = {
  chat: { name: 'Pip', role: 'Blip · answers', line: 'Answers in seconds' },
  builder: { name: 'Forge', role: 'Blip · websites', line: 'Builds your site' },
  dev: { name: 'Byte', role: 'Blip · code', line: 'Reads your code' },
  game: { name: 'Glitch', role: 'Blip · game servers', line: 'Debugs your server' },
  operator: { name: 'Maria', role: 'Support L2', line: 'Human · online' },
}
export const QUICK = ['Why is my bill higher?', 'Point a domain', 'My Minecraft server lags', 'Talk to a person']

let nextId = 1
const fresh = () => ({
  open: false, phase: 'chat', who: 'chat', op: { status: 'none', pos: 0 }, typing: null, unread: 0, draft: '', ending: false, rating: { stars: 0, tags: [], comment: '', sent: false },
  msgs: [{ id: nextId++, from: 'chat', kind: 'text', text: 'Hi Stefan, I am Pip. Ask me anything about your servers, billing or domains. If you would rather talk to a person, I can bring one in.', t: clock(), quick: true }],
})
function load() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw)
    nextId = Math.max(1, ...v.msgs.map((m) => m.id)) + 1
    /* a half-finished queue or a streaming reply cannot be resumed after a reload */
    v.msgs = v.msgs.map((m) => ({ ...m, streaming: false }))
    if (v.op.status === 'queued') { v.op = { status: 'none', pos: 0 }; v.msgs = v.msgs.filter((m) => m.kind !== 'queue') }
    return { ...fresh(), ...v, open: false, typing: null, unread: 0, ending: false }
  } catch { return null }
}
let s = (typeof sessionStorage !== 'undefined' && load()) || fresh()
const subs = new Set()
let timers = []
const save = () => { try { const { open, typing, unread, ending, ...keep } = s; sessionStorage.setItem(KEY, JSON.stringify(keep)) } catch {} }
const set = (patch) => { s = { ...s, ...(typeof patch === 'function' ? patch(s) : patch) }; save(); subs.forEach((f) => f()) }
const later = (ms, f) => { const t = setTimeout(f, ms); timers.push(t); return t }
const clearTimers = () => { timers.forEach(clearTimeout); timers = [] }
const push = (m) => { const msg = { id: nextId++, t: clock(), kind: 'text', ...m }; set((o) => ({ msgs: [...o.msgs, msg], unread: !o.open && msg.from !== 'me' && msg.from !== 'system' ? o.unread + 1 : o.unread })); return msg.id }
const patchMsg = (id, p) => set((o) => ({ msgs: o.msgs.map((m) => (m.id === id ? { ...m, ...p } : m)) }))

/* ------------------------------------------------------------------ scripts ------------------------------------------------------------------ */
const ROUTES = [
  ['game', /(lag|tick|minecraft|rust|cs2|crash|plugin|world|players)/i],
  ['dev', /(error|bug|stack|trace|deploy fail|build|repo|code|exception|500|git)/i],
  ['builder', /(website|site|page|landing|builder|design|logo|booking)/i],
]

const REPLIES = {
  chat: (t) => {
    if (/(bill|invoice|price|charge|cost|higher|paid|payment)/i.test(t)) return { text: 'You resized pg-main to 8 GB on Nov 05, so it is billed at the new size from that day. The open invoice is below.', card: { type: 'invoice', id: 'INV-1048', amount: '$38.00', due: 'Nov 16', status: 'Unpaid' } }
    if (/(domain|dns|record|ssl|https)/i.test(t)) return { text: 'Add one A record that points to your server, then press Verify in Domains. Most records are visible within a few minutes.', card: { type: 'code', lines: ['Type  Name  Value        TTL', 'A     @     45.83.12.9   300'] } }
    if (/(password|login|2fa|account)/i.test(t)) return { text: 'You can reset your password from Account, Security. I can also sign out every other session if you think someone else has access.' }
    if (/(thank|thanks|great|perfect)/i.test(t)) return { text: 'Glad it helped. If anything else comes up, I am right here.' }
    return { text: 'Got it. Can you tell me a bit more: which service is it about, and what did you expect to happen? I can also bring in a person if you prefer.' }
  },
  game: () => ({ text: 'Glitch here. Lag like that usually comes from one plugin, not from RAM. I sampled the server thread for two minutes:', card: { type: 'code', lines: ['41.2%  DynmapRenderer.renderTile', '18.0%  MobStacker.mergeEntities', ' 9.4%  ChunkLoader.preload'] }, after: 'I would lower the Dynmap render rate first. Want me to prepare that config change for you to approve?' }),
  dev: () => ({ text: 'Byte here. Send me the stack trace or the failing build link and I will find the line. If you connect the repository I can open a pull request with the fix.' }),
  builder: () => ({ text: 'Forge here. Tell me what the site is for in one sentence, and who it is for. I will draft the pages and you can change anything by chatting.' }),
  operator: [
    'Thanks for waiting, I have read the conversation with Pip. Let me look at your account.',
    'I can see the service now. Give me a moment while I check the logs.',
    'Found it. I have made the change on my side. Could you try again and tell me if it works?',
    'Happy to help. Is there anything else I can do for you today?',
  ],
}

/* ------------------------------------------------------------------ actions ------------------------------------------------------------------ */
const stream = (who, text, done) => {
  const id = push({ from: who, text: '', streaming: true })
  const words = text.split(' ')
  let i = 0
  const tick = () => {
    i = Math.min(words.length, i + 1 + (Math.random() > 0.7 ? 1 : 0))
    patchMsg(id, { text: words.slice(0, i).join(' '), streaming: i < words.length })
    if (i < words.length) later(28 + Math.random() * 26, tick); else done?.(id)
  }
  tick()
}
const agentReply = (who, userText) => {
  set({ typing: who })
  later(700 + Math.random() * 700, () => {
    set({ typing: null })
    const r = REPLIES[who](userText)
    stream(who, r.text, () => {
      if (r.card) push({ from: who, kind: 'card', card: r.card })
      if (r.after) { set({ typing: who }); later(900, () => { set({ typing: null }); stream(who, r.after) }) }
    })
  })
}
let opIdx = 0
const operatorReply = () => {
  set({ typing: 'operator' })
  later(1500 + Math.random() * 1000, () => { set({ typing: null }); stream('operator', REPLIES.operator[Math.min(opIdx++, REPLIES.operator.length - 1)]) })
}

export const chat = {
  open() { set({ open: true, unread: 0 }) },
  close() { set({ open: false, ending: false }) },
  toggle() { s.open ? chat.close() : chat.open() },
  setDraft(draft) { s.draft = draft; save() },
  send(raw, extra) {
    const text = (raw || '').trim()
    if (!text && !extra) return
    const id = push(extra ? { from: 'me', kind: 'file', file: extra, status: 'sending' } : { from: 'me', text, status: 'sending' })
    s.draft = ''
    later(260, () => patchMsg(id, { status: 'sent' }))
    later(950, () => patchMsg(id, { status: 'read' }))
    if (extra) { later(1200, () => { if (s.who === 'operator') operatorReply(); else agentReply(s.who, '') }); return }
    if (s.who === 'operator') {
      if (s.op.status === 'live') later(900, operatorReply)
      else if (s.op.status === 'queued') later(700, () => push({ from: 'system', text: 'You are in the queue. We will answer here as soon as someone joins.' }))
      return
    }
    if (/(person|human|operator|agent|someone)/i.test(text) && /(talk|speak|need|want|connect|bring|get)/i.test(text)) { later(600, chat.requestOperator); return }
    /* a Blip keeps the conversation unless the topic belongs to another one: then it hands over, and the avatar changes */
    const explicit = ROUTES.find(([, re]) => re.test(text))
    const target = explicit ? explicit[0] : s.who
    if (target !== s.who) {
      later(700, () => {
        push({ from: 'system', text: `${AGENTS[s.who].name} brought in ${AGENTS[target].name} (${AGENTS[target].role.replace('Blip · ', '')})` })
        set({ who: target })
        later(500, () => agentReply(target, text))
      })
    } else later(500, () => agentReply(s.who, text))
  },
  requestOperator() {
    if (s.op.status !== 'none' || s.who === 'operator') return
    clearTimers(); set({ typing: null })
    set({ op: { status: 'queued', pos: 3 } })
    push({ from: 'system', text: `Connecting you to a person. ${AGENTS[s.who].name} shared this conversation with them.` })
    const qid = push({ from: 'system', kind: 'queue' })
    later(1500, () => set({ op: { status: 'queued', pos: 2 } }))
    later(3100, () => set({ op: { status: 'queued', pos: 1 } }))
    later(4800, () => {
      set({ op: { status: 'live', pos: 0 }, who: 'operator', msgs: s.msgs.filter((m) => m.id !== qid) })
      push({ from: 'system', text: 'Maria joined · Support L2' })
      later(700, operatorReply)
    })
  },
  backToBlip() {
    clearTimers(); set({ typing: null, op: { status: 'none', pos: 0 }, who: 'chat', msgs: s.msgs.filter((m) => m.kind !== 'queue') })
    push({ from: 'system', text: 'You are back with Pip' })
  },
  askEnd(v = true) { set({ ending: v }) },
  end() { clearTimers(); set({ typing: null, ending: false, phase: 'rating' }) },
  rate(r) { set({ rating: { ...s.rating, ...r, sent: true }, phase: 'done' }) },
  setRating(r) { set({ rating: { ...s.rating, ...r } }) },
  restart() { clearTimers(); opIdx = 0; const o = s.open; s = { ...fresh(), open: o }; save(); subs.forEach((f) => f()) },
}

export const useChat = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => s)
