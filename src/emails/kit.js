/* Email kit: table-based, inline-styled HTML that survives Gmail / Outlook / Apple Mail.
   Dark is the base look. A <style> block flips it to light for clients that report prefers-color-scheme: light (and for the
   preview's "Light" switch via the .force-light class on <html>). Images are the PNG files in public/email; the sender
   replaces {{assets}} with the public address of that folder, and the preview points it at the local copy. */

export const T = {
  dark: { page: '#0d0d0f', card: '#141416', line: '#1c1c20', line2: '#2a2a2f', fg: '#f2f2f3', mute: '#8e8e94', dim: '#6b6b72', ok: '#4ade80', bad: '#f87171', warn: '#fbbf24', info: '#60a5fa', btn: '#ffffff', btnText: '#0d0d0f' },
  light: { page: '#f1f1ee', card: '#ffffff', line: '#e8e8e4', line2: '#d9d9d4', fg: '#0d0d0f', mute: '#55555c', dim: '#85858c', ok: '#16a34a', bad: '#dc2626', warn: '#b45309', info: '#2563eb', btn: '#0d0d0f', btnText: '#ffffff' },
}
export const BRAND = '#ff2d36'
const D = T.dark
export const FONT = "Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"
export const MONO = "'Geist Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"

/* each helper returns a class (for the light override) plus the dark inline style */
const cls = (c, css) => `class="${c}" style="${css}"`

const LIGHT_CSS = (sel) => {
  const L = T.light
  return `${sel} .bgp{background-color:${L.page}!important}${sel} .bgc{background-color:${L.card}!important}${sel} .fg{color:${L.fg}!important}${sel} .mu{color:${L.mute}!important}${sel} .di{color:${L.dim}!important}` +
    `${sel} .bd{border-color:${L.line}!important}${sel} .bd2{border-color:${L.line2}!important}${sel} .bgl{background-color:${L.line}!important}${sel} .ok{color:${L.ok}!important}${sel} .bad{color:${L.bad}!important}${sel} .warn{color:${L.warn}!important}` +
    `${sel} .fgb{background-color:${L.fg}!important}${sel} .dk{display:none!important;max-height:0!important;overflow:hidden!important}${sel} .lt{display:block!important;max-height:none!important}${sel} .btn{background-color:${L.btn}!important}${sel} .btnt{color:${L.btnText}!important}${sel} .bgi{background-color:#ebebe7!important}${sel} .bdf{border-color:${L.fg}!important}${sel} .bgn{background-color:${L.line2}!important}${sel} .info{color:${L.info}!important}`
}

/* doc shell: preheader, outer wrapper, 600 px column */
export function shell({ subject, preheader, body, width = 600 }) {
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light">
<title>${subject}</title>
<style>
body{margin:0;padding:0;-webkit-text-size-adjust:100%}
a{text-decoration:none}
img{border:0;display:block;max-width:100%;height:auto}
@media (max-width:620px){.wrap{width:100%!important}.col{width:100%!important;display:block!important}.pad{padding-left:20px!important;padding-right:20px!important}.hide{display:none!important}.h1{font-size:24px!important;line-height:30px!important}.stack{display:block!important;width:100%!important;padding:0 0 10px 0!important;box-sizing:border-box}.btns,.btns table{width:100%!important}}
@media (prefers-color-scheme:light){${LIGHT_CSS('')}}
${LIGHT_CSS('.force-light')}
</style>
</head>
<body ${cls('bgp', `margin:0;padding:0;background-color:${D.page};font-family:${FONT}`)}>
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px">${preheader}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ${cls('bgp', `background-color:${D.page}`)}>
<tr><td align="center" style="padding:28px 12px">
<table role="presentation" class="wrap" width="${width}" cellpadding="0" cellspacing="0" border="0" style="width:${width}px;max-width:100%">
${body}
</table>
</td></tr></table>
</body></html>`
}

/* ---------- primitives ---------- */
/* two variants: a light-ink PNG for dark mode and a dark-ink PNG shown instead in light mode (.dk / .lt flip in the style block) */
/* Images are real files in public/email (PNG at 3x, drawn from the dot font). {{assets}} is the folder they are served from.
   width + max-width:100% + height:auto: the picture keeps its proportions when a narrow phone squeezes it. */
export const dot = (slug, text, w, h) => {
  const base = `width="${w}" height="${h}" alt="${text}"`
  const dk = `<img class="dk" src="{{assets}}/dot-${slug}.png" ${base} style="display:block;border:0;width:${w}px;max-width:100%;height:auto">`
  const lt = `<img class="lt" src="{{assets}}/dot-${slug}-light.png" ${base} style="display:none;max-height:0;overflow:hidden;border:0;width:${w}px;max-width:100%;height:auto">`
  return dk + lt
}
const BLIP_NAME = { chat: 'Pip', builder: 'Forge', dev: 'Byte', game: 'Glitch' }
export const blip = (size, role = '') => `<img src="{{assets}}/blip-${BLIP_NAME[role] ? role : 'chat'}.png" width="${size}" height="${size}" alt="${BLIP_NAME[role] || 'Pip'}" style="display:block;border:0;width:${size}px;height:${size}px">`

export const logoBar = (right = '') => `<tr><td style="padding:0 4px 18px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="left">${dot('wordmark', 'BLIPMADE', 84, 13)}</td>
<td align="right" ${cls('di', `font-family:${MONO};font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${D.dim}`)}>${right}</td></tr></table></td></tr>`

export const card = (inner, pad = 28, accent) => `<tr><td ${cls(accent ? 'bgc' : 'bgc bd', `background-color:${D.card};border:1px solid ${accent || D.line};border-radius:14px`)}><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="pad" style="padding:${pad}px">${inner}</td></tr></table></td></tr>`

export const eyebrow = (t, color = D.dim, c = 'di') => `<div ${cls(c, `font-family:${MONO};font-size:11px;line-height:16px;letter-spacing:.08em;text-transform:uppercase;color:${color}`)}>${t}</div>`
export const h1 = (t, size = 24) => `<h1 class="h1 fg" style="margin:10px 0 0 0;font-family:${FONT};font-size:${size}px;line-height:${size + 6}px;font-weight:600;letter-spacing:-.02em;color:${D.fg}">${t}</h1>`
export const p = (t, extra = '') => `<p ${cls('mu', `margin:14px 0 0 0;font-family:${FONT};font-size:14.5px;line-height:23px;color:${D.mute};${extra}`)}>${t}</p>`
export const small = (t, extra = '') => `<p ${cls('di', `margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:${D.dim};${extra}`)}>${t}</p>`
export const spacer = (n) => `<div style="height:${n}px;line-height:${n}px;font-size:1px">&nbsp;</div>`
export const rule = (m = 22) => `<div ${cls('bgl', `height:1px;line-height:1px;font-size:1px;background-color:${D.line};margin:${m}px 0`)}>&nbsp;</div>`

/* bulletproof button: a table cell with padding, so Outlook keeps its shape */
export const button = (label, href = '#', { ghost = false, full = false } = {}) => ghost
  ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${full ? ' width="100%"' : ''}><tr><td align="center" ${cls('bd2', `border:1px solid ${D.line2};border-radius:10px`)}><a href="${href}" ${cls('fg', `display:block;padding:11px 20px;font-family:${FONT};font-size:14px;font-weight:600;color:${D.fg}`)}>${label}</a></td></tr></table>`
  : `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${full ? ' width="100%"' : ''}><tr><td align="center" ${cls('btn', `background-color:${D.btn};border-radius:10px`)}><a href="${href}" ${cls('btnt', `display:block;padding:12px 22px;font-family:${FONT};font-size:14px;font-weight:600;color:${D.btnText}`)}>${label}</a></td></tr></table>`

/* a primary and a quiet button side by side; on a phone they stack and both go full width */
export const pair = (a, b) => `<table role="presentation" class="btns" cellpadding="0" cellspacing="0" border="0"><tr><td class="stack" style="padding-right:8px">${button(a)}</td><td class="stack">${button(b, '#', { ghost: true })}</td></tr></table>`

/* tinted box. The padding sits on a table cell, because Outlook ignores padding on a div */
export const box = (inner, { bg = '#1a1a1d', pad = '14px 16px', border = '' } = {}) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td ${cls('bgi' + (border ? ' bd' : ''), `background-color:${bg};${border ? `border:1px solid ${D.line};` : ''}border-radius:10px;padding:${pad}`)}>${inner}</td></tr></table>`

/* up to three figures in a row: [label, value, tone?, bar %?, bar tone?] */
export const tiles = (items) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${items.map(([l, v, tone, pct, btone], i) => `<td class="stack" width="${Math.floor(100 / items.length)}%" valign="top" style="padding:0 ${i < items.length - 1 ? 8 : 0}px 0 0">${box(`${eyebrow(l)}<div ${cls(tone || 'fg', `margin-top:8px;font-family:${MONO};font-size:22px;line-height:26px;color:${tone ? D[tone] : D.fg}`)}>${v}</div>${pct != null ? `<div style="margin-top:10px">${bar(pct, btone)}</div>` : ''}`, { pad: '14px' })}</td>`).join('')}</tr></table>`

/* one big code, for a sign-in or a verification */
export const code = (digits) => box(`<div ${cls('fg', `font-family:${MONO};font-size:30px;line-height:36px;letter-spacing:.32em;color:${D.fg};text-align:center`)}>${digits}</div>`, { pad: '18px 16px' })

/* key / value rows in mono */
export const kv = (rows) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.map(([k, v, tone], i) => `<tr><td ${cls('di bd', `padding:9px 0;${i ? `border-top:1px solid ${D.line};` : ''}font-family:${FONT};font-size:13px;color:${D.dim}`)}>${k}</td><td align="right" ${cls((tone || 'fg') + ' bd', `padding:9px 0;${i ? `border-top:1px solid ${D.line};` : ''}font-family:${MONO};font-size:13px;color:${tone ? D[tone] : D.fg}`)}>${v}</td></tr>`).join('')}</table>`

export const chip = (label, tone = 'ok') => `<span ${cls(tone, `display:inline-block;padding:3px 9px;border:1px solid ${D[tone]};border-radius:999px;font-family:${MONO};font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:${D[tone]}`)}>${label}</span>`

/* tiny progress bar made of table cells (no CSS width tricks Outlook would drop) */
export const bar = (pct, tone = 'fg') => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ${cls('bgl', `background-color:${D.line};border-radius:3px`)}><tr><td width="${pct}%" height="6" ${cls(tone === 'fg' ? 'fgb' : '', `background-color:${tone === 'fg' ? D.fg : D[tone] || BRAND};border-radius:3px;font-size:1px;line-height:6px`)}>&nbsp;</td><td height="6" style="font-size:1px;line-height:6px">&nbsp;</td></tr></table>`

/* footer variants */
export const footerSystem = () => `<tr><td style="padding:20px 6px 0 6px">${small('Questions about this email? Reply to it, or open a ticket from the client area. A real person reads every reply.')}
<div style="height:10px;line-height:10px;font-size:1px">&nbsp;</div>
<p ${cls('di', `margin:0;font-family:${MONO};font-size:10.5px;line-height:17px;letter-spacing:.04em;color:${D.dim}`)}>BLIPMADE · Notification sent to {{email}}<br>You get service emails because you have an account. <a href="#" ${cls('mu', `color:${D.mute};text-decoration:underline`)}>Notification settings</a></p></td></tr>`

export const footerMarketing = () => `<tr><td align="center" style="padding:30px 12px 0 12px">
<p ${cls('mu', `margin:0;font-family:${FONT};font-size:12.5px;line-height:20px;color:${D.mute}`)}><a href="#" ${cls('mu', `color:${D.mute}`)}>Docs</a> &nbsp;·&nbsp; <a href="#" ${cls('mu', `color:${D.mute}`)}>Status</a> &nbsp;·&nbsp; <a href="#" ${cls('mu', `color:${D.mute}`)}>Changelog</a> &nbsp;·&nbsp; <a href="#" ${cls('mu', `color:${D.mute}`)}>Blog</a></p>
<div style="height:14px;line-height:14px;font-size:1px">&nbsp;</div>
<p ${cls('di', `margin:0;font-family:${FONT};font-size:11.5px;line-height:18px;color:${D.dim}`)}>You are receiving this because you signed up for product news at Blipmade.<br><a href="#" ${cls('di', `color:${D.dim};text-decoration:underline`)}>Unsubscribe</a> &nbsp;·&nbsp; <a href="#" ${cls('di', `color:${D.dim};text-decoration:underline`)}>Email preferences</a> &nbsp;·&nbsp; <a href="#" ${cls('di', `color:${D.dim};text-decoration:underline`)}>View in browser</a></p>
<div style="height:12px;line-height:12px;font-size:1px">&nbsp;</div>
<p ${cls('di', `margin:0;font-family:${MONO};font-size:10px;line-height:16px;letter-spacing:.04em;color:${D.dim}`)}>{{company_address}}</p></td></tr>`

/* the Blip that sent it: a small avatar and one line in its voice, at the foot of a system card */
export const signoff = (role, name, text) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px"><tr>
<td width="44" valign="top" style="padding-right:12px">${blip(32, role)}</td>
<td valign="middle" ${cls('mu', `font-family:${FONT};font-size:13px;line-height:20px;color:${D.mute}`)}><b ${cls('fg', `color:${D.fg}`)}>${name}</b> &nbsp;${text}</td></tr></table>`

/* all four Blips side by side (marketing hero) */
export const castRow = (size = 56) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${['chat', 'builder', 'dev', 'game'].map((r) => `<td style="padding:0 7px">${blip(size, r)}</td>`).join('')}</tr></table>`
