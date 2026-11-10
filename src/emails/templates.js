/* The Blipmade email set. Two families that share the identity (dot-matrix wordmark, hairlines, mono numerals, one red accent)
   but not the layout:
   - SYSTEM mail (account, orders, payments, alerts, security): quiet and exact. Left aligned, one card, mono figures, one action.
   - MARKETING mail (launches, digests, offers): louder and editorial. Centred hero with a big dot headline and a Blip,
     feature rows, bigger spacing, an unsubscribe footer.
   Every name, amount and date is sample data. Links are "#": the sender fills them in. */
import { BRAND, FONT, MONO, T, bar, blip, box, button, card, castRow, chip, code, dot, eyebrow, footerMarketing, footerSystem, h1, kv, logoBar, p, pair, rule, shell, signoff, small, spacer, tiles } from './kit.js'

const D = T.dark
const gap = (n) => `<tr><td style="height:${n}px;line-height:${n}px;font-size:1px">&nbsp;</td></tr>`
const b = (t) => `<b class="fg" style="color:${D.fg}">${t}</b>`
const note = (t) => `<div class="mu" style="font-family:${FONT};font-size:13.5px;line-height:22px;color:${D.mute}">${t}</div>`
const head = (label, tone, chipLabel, chipTone) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td>${eyebrow(label, D[tone], tone)}</td><td align="right">${chip(chipLabel, chipTone)}</td></tr></table>`
/* a Blip with a speech box next to it */
const says = (role, name, text, extra = '') => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="44" valign="top" style="padding-right:12px">${blip(36, role)}</td><td class="bgi" style="background-color:#1a1a1d;border-radius:10px;padding:14px 16px"><div class="fg" style="font-family:${FONT};font-size:13.5px;line-height:22px;color:${D.fg}"><b>${name}:</b> <span class="mu" style="color:${D.mute}">${text}</span></div>${extra}</td></tr></table>`

/* ============================== SYSTEM: ACCOUNT ============================== */

const verifyEmail = () => ({
  subject: 'Confirm your email address', preheader: 'One step left: your code is inside.',
  body: logoBar('WELCOME') + card(
    eyebrow('Welcome') + h1('Confirm your email, {{first_name}}') + p('Enter this code on the page you just left, or press the button. After that your account is ready.') + spacer(22) +
    code('482 913') + spacer(22) + button('Confirm my email') + spacer(18) +
    small('The code works for 30 minutes. If you did not create a Blipmade account, ignore this email and nothing happens.') +
    signoff('chat', 'Pip', 'I will be in the corner of the client area if you get stuck.')
  ) + footerSystem(),
  text: 'Confirm your email address\n\nYour code: 482 913 (works for 30 minutes)\nOr open: https://blipmade.cloud/verify\n\nIf you did not create an account, ignore this email.\n',
})

const passwordReset = () => ({
  subject: 'Reset your Blipmade password', preheader: 'The link works for one hour. If you did not ask, nothing changes.',
  body: logoBar('SECURITY') + card(
    eyebrow('Password reset') + h1('Choose a new password') + p('Someone asked to reset the password for this account. If it was you, press the button.') + spacer(24) +
    button('Choose a new password') + rule(24) +
    kv([['Requested from', 'Chrome on macOS'], ['Location', 'Frankfurt, Germany (approx.)'], ['Link works until', 'Nov 09 · 11:42 UTC']]) + spacer(20) +
    note(`If this ${b('was not you')}, do nothing: your password stays as it is. If it keeps happening, turn on two-factor sign-in.`)
  ) + footerSystem(),
  text: 'Reset your Blipmade password\n\nChoose a new password (link works for one hour): https://blipmade.cloud/reset\n\nIf you did not ask for this, do nothing. Your password stays as it is.\n',
})

const securityAlert = () => ({
  subject: 'New sign-in to your Blipmade account', preheader: 'Chrome on macOS, Frankfurt. If this was not you, secure your account.',
  body: logoBar('SECURITY') + card(
    eyebrow('Security') + h1('New sign-in from Frankfurt') + p('We noticed a sign-in to your account from a device we have not seen before. If it was you, there is nothing to do.') + rule(22) +
    kv([['Device', 'Chrome 131 on macOS'], ['Location', 'Frankfurt, Germany (approx.)'], ['IP address', '85.12.x.x'], ['Time', 'Nov 09, 2026 · 10:42 UTC']]) + spacer(26) +
    note(`If this ${b('was not you')}, change your password now. We will sign out every other session and ask for a new two-factor code.`) + spacer(22) +
    pair('Secure my account', 'This was me') +
    signoff('chat', 'Pip', 'I check every sign-in so you do not have to. This one looked new.')
  ) + footerSystem(),
  text: 'New sign-in to your Blipmade account\n\nChrome 131 on macOS, Frankfurt, Nov 09 10:42 UTC.\nNot you? Secure your account: https://blipmade.cloud/account/security\n',
})

/* ============================== SYSTEM: ORDERS AND BILLING ============================== */

const orderConfirmation = () => {
  const steps = [['Order placed', 'done'], ['Payment confirmed', 'done'], ['Setting up your server', 'now'], ['Ready to use', 'next']]
  const timeline = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${steps.map(([l, st]) => `<tr>
<td width="22" valign="top" style="padding:5px 0 8px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="10" height="10" ${st === 'next' ? 'class="bgn" ' : ''}style="width:10px;height:10px;border-radius:5px;background-color:${st === 'next' ? D.line2 : st === 'now' ? BRAND : D.ok};font-size:1px;line-height:10px">&nbsp;</td></tr></table></td>
<td valign="top" style="padding:0 0 8px 0;font-family:${FONT};font-size:13.5px;line-height:20px;color:${st === 'next' ? D.dim : D.fg}" class="${st === 'next' ? 'di' : 'fg'}">${l}${st === 'now' ? ` <span class="di" style="font-family:${MONO};font-size:11px;color:${D.dim}">· about 40 s</span>` : ''}</td></tr>`).join('')}</table>`
  const items = [['VPS Pro · Frankfurt', '1 × $12.00', '$12.00'], ['Managed PostgreSQL 16', '1 × $29.00', '$29.00'], ['IPv4 address', '1 × $2.00', '$2.00']]
  const receipt = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items.map(([a, c, d], i) => `<tr><td class="fg bd" style="padding:11px 0;${i ? `border-top:1px solid ${D.line};` : ''}font-family:${FONT};font-size:13.5px;line-height:20px;color:${D.fg}">${a}<br><span class="di" style="font-family:${MONO};font-size:11px;color:${D.dim}">${c}</span></td><td align="right" valign="top" class="fg bd" style="padding:11px 0;${i ? `border-top:1px solid ${D.line};` : ''}font-family:${MONO};font-size:13px;color:${D.fg}">${d}</td></tr>`).join('')}
<tr><td colspan="2" class="bd" style="padding:6px 0 0 0;border-top:1px solid ${D.line}">${kv([['Subtotal', '$43.00'], ['Tax (19% VAT)', '$8.17'], ['Total paid', '$51.17']])}</td></tr></table>`
  return {
    subject: 'Order ORD-20418 confirmed', preheader: 'Your VPS Pro and database are being set up now.',
    body: logoBar('ORD-20418') + card(
      eyebrow('Order confirmed') + h1('Thanks, {{first_name}}. Your order is in.') + p('We charged your card and started setting up your services. Most are ready in under a minute; we will email you again only if something needs your attention.') +
      rule(24) + timeline + rule(24) + eyebrow('Receipt') + spacer(8) + receipt + spacer(26) + button('Open your server', '#') + signoff('chat', 'Pip', 'is watching the setup and will tell you the moment anything stalls.')
    ) + gap(14) + card(kv([['Payment method', 'Visa ending 6411'], ['Billing period', 'Nov 09 to Dec 09'], ['Invoice', 'INV-1048']]), 22) + footerSystem(),
    text: 'Order ORD-20418 confirmed\n\nThanks, {{first_name}}. Your order is in.\n\nVPS Pro (Frankfurt)  $12.00\nManaged PostgreSQL 16  $29.00\nIPv4 address  $2.00\nTotal paid  $51.17 (incl. $8.17 VAT)\n\nOpen your server: https://blipmade.cloud/services\n',
  }
}

const serviceReady = () => ({
  subject: 'web-01 is ready', preheader: 'Your server is running. Here is how to get in.',
  body: logoBar('READY · web-01') + card(
    head('Server ready', 'ok', 'Running', 'ok') + h1('web-01 is up') + p('It took 38 seconds. The server is running and reachable at the address below.') + spacer(22) +
    kv([['Name', 'web-01'], ['Plan', 'VPS Pro · 4 vCPU · 8 GB'], ['Region', 'Frankfurt'], ['IPv4', '45.83.12.9'], ['User', 'root']]) + spacer(22) +
    box(note(`${b('We never send passwords by email.')} Add an SSH key or set a password from the client area, then connect.`)) + spacer(24) +
    pair('Open web-01', 'How to connect') +
    signoff('chat', 'Pip', 'First server? Ask me and I will walk you through the first sign-in.')
  ) + footerSystem(),
  text: 'web-01 is ready\n\nVPS Pro, Frankfurt, 45.83.12.9, user root.\nWe never send passwords by email: add an SSH key or set a password in the client area.\n\nOpen web-01: https://blipmade.cloud/services/web-01\n',
})

const paymentReceived = () => ({
  subject: 'Payment received: $51.17', preheader: 'Receipt for invoice INV-1048.',
  body: logoBar('INV-1048') + card(
    eyebrow('Payment received', D.ok, 'ok') +
    `<div style="margin:14px 0 0 0;font-family:${MONO};font-size:44px;line-height:48px;letter-spacing:-.03em" class="fg"><span style="color:${D.fg}">$51.17</span></div>` +
    p('Paid on Nov 09, 2026 with Visa ending 6411. Thank you, {{first_name}}.', 'margin-top:6px') + rule(22) +
    kv([['Invoice', 'INV-1048'], ['Date', 'Nov 09, 2026'], ['Description', 'VPS Pro, PostgreSQL, IPv4'], ['Subtotal', '$43.00'], ['VAT 19%', '$8.17'], ['Amount paid', '$51.17', 'ok']]) + spacer(26) +
    pair('Download invoice (PDF)', 'View in billing') +
    signoff('chat', 'Pip', 'Need this in another format for accounting? Reply and I will send it.')
  ) + footerSystem(),
  text: 'Payment received: $51.17\n\nInvoice INV-1048 · Nov 09, 2026 · Visa ending 6411\nSubtotal $43.00, VAT 19% $8.17, paid $51.17\n\nInvoice PDF: https://blipmade.cloud/invoices/INV-1048\n',
})

const renewalReminder = () => ({
  subject: 'VPS Pro renews on Nov 23 for $12.00', preheader: 'Nothing to do if the card on file is still right.',
  body: logoBar('RENEWAL') + card(
    eyebrow('Upcoming renewal') + h1('web-01 renews in 14 days') + p('We will charge the card on file on the renewal date. If everything below is right, there is nothing to do.') + rule(22) +
    kv([['Service', 'web-01 · VPS Pro'], ['Renews on', 'Nov 23, 2026'], ['Amount', '$12.00 + VAT'], ['Card', 'Visa ending 6411']]) + spacer(24) +
    pair('Review billing', 'Change plan') + spacer(18) +
    small('Do not want to renew? Cancel from the client area before Nov 23 and you will not be charged.')
  ) + footerSystem(),
  text: 'VPS Pro renews on Nov 23 for $12.00\n\nweb-01 renews on Nov 23, 2026. We charge Visa ending 6411. Cancel before that date and you are not charged.\n\nBilling: https://blipmade.cloud/billing\n',
})

const paymentFailed = () => ({
  subject: 'Action needed: payment for INV-1049 failed', preheader: 'Update your card by Nov 16 to keep your services running.',
  body: logoBar('INV-1049') +
    card(
      eyebrow('Payment failed', D.bad, 'bad') + h1('We could not charge your card') +
      p(`Your bank declined the payment for ${b('INV-1049 ($38.00)')}. Nothing is wrong with your services yet. We will try again on Nov 12 and Nov 14.`) + rule(22) +
      kv([['Card', 'Visa ending 6411'], ['Reason', 'Insufficient funds'], ['Next attempt', 'Nov 12, 2026'], ['Services suspended on', 'Nov 16, 2026', 'warn']]) + spacer(24) +
      box(`${eyebrow('What you can do')}<div style="height:8px;line-height:8px;font-size:1px">&nbsp;</div>${note('1. Add or switch to another card.<br>2. Top up your credit balance.<br>3. Reply to this email if you need more time.')}`) + spacer(26) +
      pair('Update payment method', 'Pay with credit') +
      signoff('chat', 'Pip', 'Reply to this email and I will help you sort the card out.')
    , 28, 'rgba(248,113,113,.55)') + footerSystem(),
  text: 'Action needed: payment for INV-1049 failed\n\nYour bank declined $38.00 on Visa ending 6411 (insufficient funds). We retry on Nov 12 and Nov 14. Services are suspended on Nov 16 if unpaid.\n\nUpdate payment method: https://blipmade.cloud/billing\n',
})

const serviceSuspended = () => ({
  subject: 'web-01 has been suspended', preheader: 'Your data is safe until Nov 30. Pay the open invoice and it is back in minutes.',
  body: logoBar('SUSPENDED · web-01') +
    card(
      head('Service suspended', 'bad', 'Offline', 'bad') + h1('web-01 is offline') +
      p(`We could not collect ${b('INV-1049 ($38.00)')} after three attempts, so the server was stopped today. ${b('Nothing has been deleted.')}`) + rule(22) +
      kv([['Service', 'web-01 · VPS Pro'], ['Open invoice', 'INV-1049 · $38.00'], ['Suspended on', 'Nov 16, 2026'], ['Data kept until', 'Nov 30, 2026', 'warn']]) + spacer(22) +
      box(note('Pay the invoice and the server starts again by itself, usually within a few minutes, with the same address and the same data.')) + spacer(24) +
      pair('Pay $38.00 now', 'Talk to us') +
      signoff('chat', 'Pip', 'Need a few more days? Reply here before Nov 30 and a person will sort it out with you.')
    , 28, 'rgba(248,113,113,.55)') + footerSystem(),
  text: 'web-01 has been suspended\n\nINV-1049 ($38.00) is unpaid. The server was stopped on Nov 16. Nothing has been deleted; data is kept until Nov 30.\n\nPay now: https://blipmade.cloud/billing\n',
})

const domainExpiring = () => ({
  subject: 'example-studio.com expires in 14 days', preheader: 'Auto-renew is off. Renew now so the site and email keep working.',
  body: logoBar('DOMAIN') + card(
    head('Domain expiring', 'warn', '14 days left', 'warn') + h1('example-studio.com expires on Nov 23') +
    p('Auto-renew is off for this domain. If it expires, the website and every mailbox on it stop working.') + rule(22) +
    kv([['Domain', 'example-studio.com'], ['Expires on', 'Nov 23, 2026', 'warn'], ['Renewal', '1 year · $14.00'], ['Auto-renew', 'Off']]) + spacer(24) +
    pair('Renew for $14.00', 'Turn on auto-renew')
  ) + footerSystem(),
  text: 'example-studio.com expires in 14 days\n\nExpires Nov 23, 2026. Auto-renew is off. Renewal is $14.00 for one year.\n\nRenew: https://blipmade.cloud/domains\n',
})

/* ============================== SYSTEM: SERVICES ============================== */

const serviceAlert = () => ({
  subject: 'pg-main is running out of memory', preheader: 'Memory has stayed above 85% for 10 minutes.',
  body: logoBar('ALERT · pg-main') + card(
    head('Service alert', 'warn', 'Warning', 'warn') +
    h1('High memory on pg-main') + p('Memory on your PostgreSQL service has stayed above 85% for 10 minutes. Queries are still running, but the database may slow down or restart under pressure.') + spacer(22) +
    tiles([['Memory', '91%', null, 91, 'warn'], ['CPU', '44%', null, 44], ['Disk', '63%', null, 63]]) + spacer(22) +
    kv([['Service', 'pg-main · PostgreSQL 16'], ['Region', 'Frankfurt'], ['First seen', 'Today 14:02 UTC'], ['Current size', '4 GB · $12.00 / mo']]) + spacer(24) +
    note(`${b('Suggested:')} resize to 8 GB (about $24.00 / mo, billed from the moment you resize), or ask Byte to find the heaviest queries.`) + spacer(24) +
    pair('Resize pg-main', 'Open metrics') +
    signoff('dev', 'Byte', 'I can find the three heaviest queries for you. Open the metrics and press “Ask Byte”.')
  ) + footerSystem(),
  text: 'pg-main is running out of memory\n\nMemory above 85% for 10 minutes (now 91%). CPU 44%, disk 63%.\nSuggested: resize to 8 GB.\n\nOpen metrics: https://blipmade.cloud/services/pg-main\n',
})

const buildFailed = () => ({
  subject: 'Build failed on api-gateway (main · 3f9a1c2)', preheader: 'Byte found the cause and has a fix ready to review.',
  body: logoBar('BUILD · api-gateway') + card(
    head('Build failed', 'bad', 'main · 3f9a1c2', 'info') +
    h1('The build stopped at step 3 of 5') + p(`Your push to ${b('main')} did not go live. The running version is untouched, so nothing is down.`) + spacer(20) +
    box(`<div style="font-family:${MONO};font-size:12px;line-height:20px"><div class="di" style="color:${D.dim}">› Installing dependencies… ok<br>› Compiling TypeScript…</div><div class="bad" style="color:${D.bad}">src/orders.ts(42,18): error TS2532: Object is possibly 'undefined'.</div><div class="di" style="color:${D.dim}">✕ Build exited with code 2 after 38 s</div></div>`, { bg: '#0a0a0c', border: true }) + spacer(22) +
    says('dev', 'Byte', 'the cart can be empty on this path. One optional chain fixes it, and I checked that the three tests still pass.', `<div class="ok" style="margin-top:8px;font-family:${MONO};font-size:12px;color:${D.ok}">+ const total = cart?.total ?? 0</div>`) + spacer(24) +
    pair('Open the pull request', 'See the full log')
  ) + footerSystem(),
  text: 'Build failed on api-gateway\n\nsrc/orders.ts(42,18): error TS2532 at step 3 of 5. The running version is untouched.\nByte prepared a one-line fix (cart?.total ?? 0): https://blipmade.cloud/services/api-gateway/builds/482\n',
})

const gameCrash = () => ({
  subject: 'mc-survival crashed and was restarted', preheader: 'Glitch read the crash log: a plugin ran out of memory. Back online in 38 s.',
  body: logoBar('GAME · mc-survival') + card(
    head('Server crashed', 'bad', 'Back online', 'ok') +
    h1('mc-survival went down at 21:07') + p(`The server stopped responding, so we restarted it. It was back after ${b('38 seconds')} and 14 players reconnected.`) + spacer(20) +
    tiles([['Downtime', '38 s'], ['Players', '14 / 40'], ['Memory at crash', '100%', 'bad']]) + spacer(22) +
    says('game', 'Glitch', `I think <span class="fg" style="color:${D.fg};font-family:${MONO}">DynmapRenderer</span> caused it: it used 41% of tick time and kept growing for 6 hours, until the server ran out of memory.`) + spacer(18) +
    kv([['Server', 'mc-survival · Paper 1.21'], ['Region', 'Frankfurt'], ['Crash time', 'Nov 09 · 21:07 UTC'], ['Suspect', 'DynmapRenderer 3.7', 'warn']]) + spacer(24) +
    pair('Open the crash report', 'Raise memory to 8 GB')
  ) + footerSystem(),
  text: 'mc-survival crashed and was restarted\n\nDown for 38 s at 21:07 UTC, 14 players reconnected. Glitch suspects DynmapRenderer (41% of tick time, memory ran out).\nCrash report: https://blipmade.cloud/services/mc-survival/crashes\n',
})

const maintenance = () => ({
  subject: 'Planned maintenance in Helsinki on Nov 18', preheader: 'Two hours at night, no downtime expected. Nothing for you to do.',
  body: logoBar('MAINTENANCE') + card(
    head('Planned maintenance', 'info', 'Scheduled', 'info') + h1('Network upgrade in Helsinki') +
    p('We are upgrading the network in Helsinki. Your services stay online; connections may be slower for a few seconds while traffic moves over.') + rule(22) +
    kv([['Starts', 'Nov 18, 2026 · 02:00 UTC'], ['Ends', 'Nov 18, 2026 · 04:00 UTC'], ['Expected impact', 'None'], ['Your services there', 'hel-db-2, hel-web-1']]) + spacer(22) +
    box(note(`${b('Nothing to do.')} We will email you only if the plan changes. Progress is on the status page while the work runs.`)) + spacer(24) +
    button('Open the status page', '#', { ghost: true })
  ) + footerSystem(),
  text: 'Planned maintenance in Helsinki on Nov 18\n\nNov 18, 02:00 to 04:00 UTC. No downtime expected. Affects hel-db-2, hel-web-1. Nothing to do.\n\nStatus: https://blipmade.cloud/status\n',
})

/* ============================== SYSTEM: SUPPORT ============================== */

const ticketReply = () => ({
  subject: 'Re: Domain not pointing to my site [#4821]', preheader: 'Maria replied: the record was pointing at the old address. Fixed.',
  body: logoBar('TICKET #4821') + card(
    eyebrow('Support replied') + h1('Maria answered your ticket') + spacer(18) +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="44" valign="top" style="padding-right:12px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="36" height="36" align="center" class="fgb btnt" style="width:36px;height:36px;border-radius:18px;background-color:${D.fg};font-family:${FONT};font-size:14px;font-weight:600;color:${D.btnText}">M</td></tr></table></td><td class="bgi" style="background-color:#1a1a1d;border-radius:10px;padding:14px 16px"><div class="fg" style="font-family:${FONT};font-size:14px;line-height:23px;color:${D.fg}">Hi {{first_name}}, the A record was still pointing at your old server. I changed it to the new address, and the site is answering from the right place now. It can take up to an hour to reach every network.</div><div class="di" style="margin-top:10px;font-family:${MONO};font-size:11px;color:${D.dim}">Maria · Support · 10:58 UTC</div></td></tr></table>` + spacer(24) +
    pair('Reply in the client area', 'Mark as solved') + spacer(18) +
    small('You can also just reply to this email. Your answer goes straight into the ticket.')
  ) + footerSystem(),
  text: 'Re: Domain not pointing to my site [#4821]\n\nMaria (Support): The A record was still pointing at your old server. I changed it; the site answers from the right place now. It can take up to an hour to reach every network.\n\nReply to this email, or open the ticket: https://blipmade.cloud/support/4821\n',
})

/* ============================== MARKETING ============================== */

const marketingTop = () => `<tr><td align="center" style="padding:0 0 22px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td>${dot('wordmark', 'BLIPMADE', 96, 15)}</td></tr></table></td></tr>`
const pill = (label, pad = '14px 28px', size = 15) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" class="btn" style="background-color:${D.btn};border-radius:999px"><a href="#" class="btnt" style="display:block;padding:${pad};font-family:${FONT};font-size:${size}px;font-weight:600;color:${D.btnText}">${label} &nbsp;→</a></td></tr></table>`
const shellCard = (inner, pad, align = '') => `<tr><td class="bgc bd" style="background-color:${D.card};border:1px solid ${D.line};border-radius:20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="pad" style="padding:${pad}"${align ? ` align="${align}"` : ''}>${inner}</td></tr></table></td></tr>`

const heroCard = ({ chipText, slug, headline, hw, hh, sub, ctaLabel, role, cast }) => shellCard(`
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">${cast ? castRow(60) : blip(88, role)}</td></tr></table>
${spacer(22)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td class="bd2 mu" style="padding:4px 11px;border:1px solid ${D.line2};border-radius:999px;font-family:${MONO};font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:${D.mute}"><span style="color:${BRAND}">●</span>&nbsp; ${chipText}</td></tr></table>
${spacer(20)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">${dot(slug, headline, hw, hh)}</td></tr></table>
${spacer(22)}
<p class="mu" style="margin:0 auto;max-width:420px;font-family:${FONT};font-size:16px;line-height:26px;color:${D.mute}">${sub}</p>
${spacer(28)}
${pill(ctaLabel)}`, '44px 40px 42px 40px', 'center')

const featureRows = (items) => `<tr><td style="padding:10px 4px 0 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items.map(([n, t, d], i) => `<tr><td ${i ? `class="bd" style="border-top:1px solid ${D.line};padding:22px 0"` : 'style="padding:22px 0"'}><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="64" valign="top" style="padding-top:1px">${blip(44, n)}</td>
<td valign="top"><div class="fg" style="font-family:${FONT};font-size:18px;line-height:24px;font-weight:600;letter-spacing:-.01em;color:${D.fg}">${t}</div><div class="mu" style="margin-top:6px;font-family:${FONT};font-size:14.5px;line-height:23px;color:${D.mute}">${d}</div></td></tr></table></td></tr>`).join('')}</table></td></tr>`

const launch = () => ({
  subject: 'Meet Pip, Forge, Byte and Glitch', preheader: 'A chat assistant, a site builder, a dev agent and a game-server debugger, inside your hosting.',
  body: marketingTop() + heroCard({ chipText: 'New · Blips', slug: 'meet-the-blips', headline: 'MEET THE BLIPS', hw: 396, hh: 36, sub: 'Four AI agents that live inside your hosting. They answer, build your site, read your code and debug your game server, so you do not have to.', ctaLabel: 'Meet your Blips', cast: true }) + gap(26) +
    featureRows([['chat', 'Pip answers', 'Ask why your bill changed, how to point a domain, or what a log line means. Pip knows your project and answers in your language.'], ['builder', 'Forge builds', 'Describe a bakery in Porto with online booking. Watch the site assemble, then keep editing it by chatting. It ships to your own server.'], ['dev', 'Byte fixes code', 'Connect a repository. Byte reads the stack trace, finds the line, writes the fix and opens a pull request for you to review.'], ['game', 'Glitch debugs servers', 'Lag at 9 pm? Glitch reads the profiler, names the plugin that is eating the server, and proposes a safe config.']]) + gap(14) +
    `<tr><td align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" class="bd2" style="border:1px solid ${D.line2};border-radius:999px"><a href="#" class="fg" style="display:block;padding:12px 24px;font-family:${FONT};font-size:14px;font-weight:600;color:${D.fg}">Read how Blips work</a></td></tr></table></td></tr>` + footerMarketing(),
  text: 'Meet the Blips\n\nFour AI agents that live inside your hosting:\n- Pip answers your questions\n- Forge builds your site\n- Byte fixes code\n- Glitch debugs game servers\n\nMeet your Blips: https://blipmade.cloud/blips\n\nUnsubscribe: https://blipmade.cloud/unsubscribe\n',
})

const digest = () => {
  const stat = (n, l) => `<td class="stack" width="33%" align="center" valign="top" style="padding:14px 4px"><div class="fg" style="font-family:${MONO};font-size:34px;line-height:38px;letter-spacing:-.03em;color:${D.fg}">${n}</div><div class="di" style="margin-top:4px;font-family:${MONO};font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:${D.dim}">${l}</div></td>`
  const item = ([tag, tone, t, d]) => `<tr><td class="bd" style="padding:16px 0;border-top:1px solid ${D.line}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="84" valign="top" style="padding-top:2px">${chip(tag, tone)}</td><td valign="top"><div class="fg" style="font-family:${FONT};font-size:15.5px;line-height:22px;font-weight:600;color:${D.fg}">${t}</div><div class="mu" style="margin-top:4px;font-family:${FONT};font-size:14px;line-height:22px;color:${D.mute}">${d}</div></td></tr></table></td></tr>`
  return {
    subject: 'November on Blipmade: bookings, a new status page, faster deploys', preheader: 'Deploys are 38% faster, the site builder learned bookings, and the status page keeps 90 days of history.',
    body: marketingTop() + shellCard(`
${eyebrow('The monthly digest · November 2026')}
<h1 class="h1 fg" style="margin:12px 0 0 0;font-family:${FONT};font-size:34px;line-height:40px;font-weight:600;letter-spacing:-.03em;color:${D.fg}">What shipped,<br>in five minutes.</h1>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px"><tr><td width="48" valign="top" style="padding-right:12px">${blip(40, 'builder')}</td><td valign="middle"><p class="mu" style="margin:0;font-family:${FONT};font-size:15.5px;line-height:25px;color:${D.mute}">Hi {{first_name}}, Forge here. This is everything we shipped this month.</p></td></tr></table>
${spacer(26)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bd" style="border-top:1px solid ${D.line}"><tr>${stat('38%', 'Faster deploys')}${stat('4', 'Regions')}${stat('99.98%', 'Uptime')}</tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${[['New', 'info', 'Bookings in the site builder', 'Describe a reservation flow and the builder sets up the form, the emails and the calendar.'], ['New', 'info', 'Status page with 90 days of history', 'Per-region history, incident updates by email and a feed.'], ['Improved', 'ok', 'Deploys in about 40 seconds', 'Down from about 65 seconds. Nothing to change on your side.'], ['Fixed', 'warn', 'DNS verification retries by itself', 'A check that failed once no longer needs a manual retry.']].map(item).join('')}</table>
${spacer(22)}
${pill('Read the full changelog', '13px 26px', 14.5)}
${spacer(30)}`, '36px 36px 8px 36px') + footerMarketing(),
    text: 'November on Blipmade\n\n38% faster deploys · 4 regions · 99.98% uptime\n- New: bookings in the site builder\n- New: status page with 90 days of history\n- Improved: deploys in about 40 s\n- Fixed: DNS verification retries by itself\n\nChangelog: https://blipmade.cloud/changelog\n\nUnsubscribe: https://blipmade.cloud/unsubscribe\n',
  }
}

const upgrade = () => {
  const plan = (label, strong, price, specs) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="${strong ? 'bdf' : 'bd'}" style="border:1px solid ${strong ? D.fg : D.line};border-radius:14px;padding:20px;text-align:left"><div class="${strong ? 'fg' : 'di'}" style="font-family:${MONO};font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:${strong ? D.fg : D.dim}">${label}</div><div class="fg" style="margin-top:10px;font-family:${MONO};font-size:26px;line-height:30px;color:${D.fg}">${price}<span class="di" style="font-size:12px;color:${D.dim}"> / mo</span></div><div class="mu" style="margin-top:10px;font-family:${FONT};font-size:13.5px;line-height:22px;color:${D.mute}">${specs}</div></td></tr></table>`
  return {
    subject: 'Your Nano is at 87% memory. Here is 20% off the next size', preheader: 'Upgrade to Pro before it fills up. Offer ends Nov 30.',
    body: marketingTop() + shellCard(`
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td>${blip(64, 'dev')}</td></tr></table>
${spacer(18)}
${eyebrow('A heads-up from Byte')}
<h1 class="h1 fg" style="margin:12px 0 0 0;font-family:${FONT};font-size:30px;line-height:36px;font-weight:600;letter-spacing:-.025em;color:${D.fg}">Your server is outgrowing Nano</h1>
<p class="mu" style="margin:12px auto 0 auto;max-width:430px;font-family:${FONT};font-size:15.5px;line-height:25px;color:${D.mute}">Memory on ${b('api-gateway')} has averaged 87% this week. Move up a size before traffic does it for you.</p>
${spacer(26)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:420px"><tr><td align="left" class="di" style="font-family:${MONO};font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${D.dim};padding-bottom:8px">Memory · last 7 days</td><td align="right" class="warn" style="font-family:${MONO};font-size:13px;color:${D.warn};padding-bottom:8px">87%</td></tr><tr><td colspan="2">${bar(87, 'warn')}</td></tr></table>
${spacer(28)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="stack" width="50%" valign="top" style="padding-right:8px">${plan('Now · Nano', false, '$4', '1 vCPU<br>1 GB memory<br>25 GB NVMe')}</td>
<td class="stack" width="50%" valign="top" style="padding-left:8px">${plan('Recommended · Pro', true, '$9.60', '4 vCPU<br>8 GB memory<br>100 GB NVMe')}</td></tr></table>
${spacer(26)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" class="bd2" style="border:1px dashed ${D.line2};border-radius:10px;padding:12px 22px"><span class="di" style="font-family:${FONT};font-size:12px;color:${D.dim}">Use code</span> &nbsp;<span class="fg" style="font-family:${MONO};font-size:18px;letter-spacing:.14em;color:${D.fg}">BLIP20</span> &nbsp;<span class="di" style="font-family:${FONT};font-size:12px;color:${D.dim}">· ends Nov 30</span></td></tr></table>
${spacer(24)}
${pill('Upgrade to Pro', '14px 30px')}
${spacer(14)}
${small('Resize takes about a minute and you pay the new price only from that moment. You can go back any time.', 'text-align:center')}`, '38px 36px 36px 36px', 'center') + footerMarketing(),
    text: 'Your Nano is at 87% memory\n\napi-gateway averaged 87% memory this week. Pro (4 vCPU, 8 GB, 100 GB) is $9.60 / mo. Use code BLIP20 for 20% off until Nov 30.\n\nUpgrade: https://blipmade.cloud/services/api-gateway\n\nUnsubscribe: https://blipmade.cloud/unsubscribe\n',
  }
}

export const EMAILS = [
  { id: 'verify', kind: 'system', group: 'Account', name: 'Confirm email', build: verifyEmail },
  { id: 'reset', kind: 'system', group: 'Account', name: 'Password reset', build: passwordReset },
  { id: 'security', kind: 'system', group: 'Account', name: 'New sign-in', build: securityAlert },
  { id: 'order', kind: 'system', group: 'Billing', name: 'Order confirmation', build: orderConfirmation },
  { id: 'paid', kind: 'system', group: 'Billing', name: 'Payment received', build: paymentReceived },
  { id: 'renewal', kind: 'system', group: 'Billing', name: 'Renewal reminder', build: renewalReminder },
  { id: 'failed', kind: 'system', group: 'Billing', name: 'Payment failed', build: paymentFailed },
  { id: 'suspended', kind: 'system', group: 'Billing', name: 'Service suspended', build: serviceSuspended },
  { id: 'domain', kind: 'system', group: 'Billing', name: 'Domain expiring', build: domainExpiring },
  { id: 'ready', kind: 'system', group: 'Services', name: 'Server ready', build: serviceReady },
  { id: 'alert', kind: 'system', group: 'Services', name: 'Service alert', build: serviceAlert },
  { id: 'build', kind: 'system', group: 'Services', name: 'Build failed', build: buildFailed },
  { id: 'crash', kind: 'system', group: 'Services', name: 'Server crashed', build: gameCrash },
  { id: 'maintenance', kind: 'system', group: 'Services', name: 'Maintenance', build: maintenance },
  { id: 'ticket', kind: 'system', group: 'Support', name: 'Ticket reply', build: ticketReply },
  { id: 'launch', kind: 'marketing', group: 'Marketing', name: 'Product launch', build: launch },
  { id: 'digest', kind: 'marketing', group: 'Marketing', name: 'Monthly digest', build: digest },
  { id: 'upgrade', kind: 'marketing', group: 'Marketing', name: 'Upgrade offer', build: upgrade },
]

export const MOCK = { first_name: 'Stefan', email: 'stefan@example.com', company_address: 'BLIPMADE · registered company name and postal address go here' }

/* build a full document for an email */
export function render(id) {
  const e = EMAILS.find((x) => x.id === id) || EMAILS[0]
  const t = e.build()
  return { ...e, ...t, html: shell({ subject: t.subject, preheader: t.preheader, body: t.body }) }
}
