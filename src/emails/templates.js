/* The Blipmade email set. Two families that share the identity (dot-matrix wordmark, hairlines, mono numerals, one red accent)
   but not the layout:
   - SYSTEM mail (orders, payments, alerts, security): quiet and exact. Left aligned, one card, mono figures, no imagery, one action.
   - MARKETING mail (launches, digests, offers): louder and editorial. Centred hero with a big dot headline and a Blip,
     numbered feature rows, bigger spacing, an unsubscribe footer. */
import { BRAND, FONT, MONO, T, blip, bar, button, card, chip, dot, eyebrow, footerMarketing, footerSystem, h1, kv, logoBar, p, rule, shell, small, spacer } from './kit.js'

const D = T.dark
const row = (inner) => `<tr><td>${inner}</td></tr>`
const gap = (n) => `<tr><td style="height:${n}px;line-height:${n}px;font-size:1px">&nbsp;</td></tr>`
const mono = (t, size = 13, color = D.fg, c = 'fg') => `<span class="${c}" style="font-family:${MONO};font-size:${size}px;color:${color}">${t}</span>`

/* ============================== SYSTEM ============================== */

const orderConfirmation = () => {
  const steps = [['Order placed', 'ok', 'done'], ['Payment confirmed', 'ok', 'done'], ['Provisioning your server', 'fg', 'now'], ['Ready to use', 'dim', 'next']]
  const timeline = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${steps.map(([l, tone, st]) => `<tr>
<td width="22" valign="top" style="padding:2px 0 8px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="10" height="10" style="width:10px;height:10px;border-radius:5px;background-color:${st === 'next' ? D.line2 : st === 'now' ? BRAND : D.ok};font-size:1px;line-height:10px">&nbsp;</td></tr></table></td>
<td valign="top" style="padding:0 0 8px 0;font-family:${FONT};font-size:13.5px;color:${st === 'next' ? D.dim : D.fg}" class="${st === 'next' ? 'di' : 'fg'}">${l}${st === 'now' ? ` <span class="di" style="font-family:${MONO};font-size:11px;color:${D.dim}">· about 40 s</span>` : ''}</td></tr>`).join('')}</table>`
  const items = [['VPS Pro · fra-1', '1 × $12.00', '$12.00'], ['Managed PostgreSQL 16', '1 × $29.00', '$29.00'], ['IPv4 address', '1 × $2.00', '$2.00']]
  const receipt = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items.map(([a, b, c], i) => `<tr><td class="${'fg bd'}" style="padding:11px 0;${i ? `border-top:1px solid ${D.line};` : ''}font-family:${FONT};font-size:13.5px;color:${D.fg}">${a}<br><span class="di" style="font-family:${MONO};font-size:11px;color:${D.dim}">${b}</span></td><td align="right" valign="top" class="fg bd" style="padding:11px 0;${i ? `border-top:1px solid ${D.line};` : ''}font-family:${MONO};font-size:13px;color:${D.fg}">${c}</td></tr>`).join('')}
<tr><td colspan="2" style="padding:6px 0 0 0">${kv([['Subtotal', '$43.00'], ['Tax (19% VAT)', '$8.17'], ['Total paid', '$51.17']])}</td></tr></table>`
  return {
    subject: 'Order ORD-20418 confirmed', preheader: 'Your VPS Pro and database are being set up now.',
    body: logoBar('ORD-20418') + card(
      eyebrow('Order confirmed') + h1('Thanks, {{first_name}}. Your order is in.') + p('We charged your card and started building your services. Most are ready in under a minute; we will email you again only if something needs your attention.') +
      rule(24) + timeline + rule(24) + eyebrow('Receipt') + spacer(8) + receipt + spacer(26) + button('Open your server', '#')
    ) + gap(14) + card(kv([['Payment method', 'Visa ending 6411'], ['Billing period', 'Nov 09 to Dec 09'], ['Invoice', 'INV-1048']]) , 22) + footerSystem(),
    text: 'Order ORD-20418 confirmed\n\nThanks, {{first_name}}. Your order is in.\n\nVPS Pro (fra-1)  $12.00\nManaged PostgreSQL 16  $29.00\nIPv4 address  $2.00\nTotal paid  $51.17 (incl. $8.17 VAT)\n\nOpen your server: https://blipmade.cloud/services\n',
  }
}

const paymentReceived = () => ({
  subject: 'Payment received: $51.17', preheader: 'Receipt for invoice INV-1048.',
  body: logoBar('INV-1048') + card(
    eyebrow('Payment received', D.ok, 'ok') +
    `<div style="margin:14px 0 0 0;font-family:${MONO};font-size:44px;line-height:48px;letter-spacing:-.03em" class="fg"><span style="color:${D.fg}">$51.17</span></div>` +
    p('Paid on Nov 09, 2026 with Visa ending 6411. Thank you, {{first_name}}.', 'margin-top:6px') + rule(22) +
    kv([['Invoice', 'INV-1048'], ['Date', 'Nov 09, 2026'], ['Description', 'VPS Pro, PostgreSQL, IPv4'], ['Subtotal', '$43.00'], ['VAT 19%', '$8.17'], ['Amount paid', '$51.17', 'ok']]) + spacer(26) +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right:8px">${button('Download invoice (PDF)', '#')}</td><td>${button('View in billing', '#', { ghost: true })}</td></tr></table>`
  ) + footerSystem(),
  text: 'Payment received: $51.17\n\nInvoice INV-1048 · Nov 09, 2026 · Visa ending 6411\nSubtotal $43.00, VAT 19% $8.17, paid $51.17\n\nInvoice PDF: https://blipmade.cloud/invoices/INV-1048\n',
})

const paymentFailed = () => ({
  subject: 'Action needed: payment for INV-1049 failed', preheader: 'Update your card by Nov 16 to keep your services running.',
  body: logoBar('INV-1049') +
    card(
      eyebrow('Payment failed', D.bad, 'bad') + h1('We could not charge your card') +
      p('Your bank declined the payment for <b class="fg" style="color:' + D.fg + '">INV-1049 ($38.00)</b>. Nothing is wrong with your services yet. We will try again on Nov 12 and Nov 14.') + rule(22) +
      kv([['Card', 'Visa ending 6411'], ['Reason', 'Insufficient funds'], ['Next attempt', 'Nov 12, 2026'], ['Services suspended on', 'Nov 16, 2026', 'warn']]) + spacer(24) +
      `<div class="bgi" style="background-color:#1a1a1d;border-radius:10px;padding:14px 16px">${eyebrow('What you can do')}<div style="height:8px;line-height:8px;font-size:1px">&nbsp;</div><div class="mu" style="font-family:${FONT};font-size:13.5px;line-height:22px;color:${D.mute}">1. Add or switch to another card.<br>2. Top up your credit balance.<br>3. Reply to this email if you need more time.</div></div>` + spacer(26) +
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right:8px">${button('Update payment method', '#')}</td><td>${button('Pay with credit', '#', { ghost: true })}</td></tr></table>`
    , 28, 'rgba(248,113,113,.55)') + footerSystem(),
  text: 'Action needed: payment for INV-1049 failed\n\nYour bank declined $38.00 on Visa ending 6411 (insufficient funds). We retry on Nov 12 and Nov 14. Services are suspended on Nov 16 if unpaid.\n\nUpdate payment method: https://blipmade.cloud/billing\n',
})

const serviceAlert = () => ({
  subject: 'pg-main is running out of memory', preheader: 'Memory has stayed above 85% for 10 minutes.',
  body: logoBar('ALERT · fra-1') + card(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td>${eyebrow('Service alert', D.warn, 'warn')}</td><td align="right">${chip('Warning', 'warn')}</td></tr></table>` +
    h1('High memory on pg-main') + p('Memory on your PostgreSQL service has stayed above 85% for 10 minutes. Queries are still running, but the database may start swapping or restart under pressure.') + spacer(22) +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="stack" width="33%" valign="top" style="padding-right:8px"><div class="bgi" style="background-color:#1a1a1d;border-radius:10px;padding:14px">${eyebrow('Memory')}<div class="fg" style="margin-top:8px;font-family:${MONO};font-size:22px;color:${D.fg}">91%</div><div style="margin-top:10px">${bar(91, 'warn')}</div></div></td>
<td class="stack" width="33%" valign="top" style="padding:0 4px"><div class="bgi" style="background-color:#1a1a1d;border-radius:10px;padding:14px">${eyebrow('CPU')}<div class="fg" style="margin-top:8px;font-family:${MONO};font-size:22px;color:${D.fg}">44%</div><div style="margin-top:10px">${bar(44)}</div></div></td>
<td class="stack" width="33%" valign="top" style="padding-left:8px"><div class="bgi" style="background-color:#1a1a1d;border-radius:10px;padding:14px">${eyebrow('Disk')}<div class="fg" style="margin-top:8px;font-family:${MONO};font-size:22px;color:${D.fg}">63%</div><div style="margin-top:10px">${bar(63)}</div></div></td></tr></table>` + spacer(22) +
    kv([['Service', 'pg-main · PostgreSQL 16'], ['Region', 'Frankfurt (fra-1)'], ['First seen', 'Today 14:02 UTC'], ['Current size', '4 GB · $12.00 / mo']]) + spacer(24) +
    `<div class="mu" style="font-family:${FONT};font-size:13.5px;line-height:22px;color:${D.mute}"><b class="fg" style="color:${D.fg}">Suggested:</b> resize to 8 GB (about $24.00 / mo, billed from the moment you resize), or ask the Blip to find the heaviest queries.</div>` + spacer(24) +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right:8px">${button('Resize pg-main', '#')}</td><td>${button('Open metrics', '#', { ghost: true })}</td></tr></table>`
  ) + footerSystem(),
  text: 'pg-main is running out of memory\n\nMemory above 85% for 10 minutes (now 91%). CPU 44%, disk 63%.\nSuggested: resize to 8 GB.\n\nOpen metrics: https://blipmade.cloud/services/pg-main\n',
})

const securityAlert = () => ({
  subject: 'New sign-in to your Blipmade account', preheader: 'Chrome on macOS, Frankfurt. If this was not you, secure your account.',
  body: logoBar('SECURITY') + card(
    eyebrow('Security') + h1('New sign-in from Frankfurt') + p('We noticed a sign-in to your account from a device we have not seen before. If it was you, there is nothing to do.') + rule(22) +
    kv([['Device', 'Chrome 131 on macOS'], ['Location', 'Frankfurt, Germany (approx.)'], ['IP address', '85.12.x.x'], ['Time', 'Nov 09, 2026 · 10:42 UTC']]) + spacer(26) +
    `<div class="mu" style="font-family:${FONT};font-size:13.5px;line-height:22px;color:${D.mute}">If this <b class="fg" style="color:${D.fg}">was not you</b>, change your password now. We will sign out every other session and ask for a new two-factor code.</div>` + spacer(22) +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right:8px">${button('Secure my account', '#')}</td><td>${button('This was me', '#', { ghost: true })}</td></tr></table>`
  ) + footerSystem(),
  text: 'New sign-in to your Blipmade account\n\nChrome 131 on macOS, Frankfurt, Nov 09 10:42 UTC.\nNot you? Secure your account: https://blipmade.cloud/account/security\n',
})

/* ============================== MARKETING ============================== */

const marketingTop = () => `<tr><td align="center" style="padding:0 0 22px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td>${dot('wordmark', 'BLIPMADE', 120, 14, D.fg)}</td></tr></table></td></tr>`

const heroCard = ({ chipText, headline, hw, hh, sub, ctaLabel, role }) => `<tr><td ${'class="bgc bd" style="background-color:' + D.card + ';border:1px solid ' + D.line + ';border-radius:20px"'}>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" class="pad" style="padding:44px 40px 42px 40px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">${blip(88, role)}</td></tr></table>
<div style="height:22px;line-height:22px;font-size:1px">&nbsp;</div>
<div ${'class="bd2" style="display:inline-block;padding:4px 11px;border:1px solid ' + D.line2 + ';border-radius:999px;font-family:' + MONO + ';font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:' + D.mute + '"'}><span class="mu" style="color:${D.mute}"><span style="color:${BRAND}">●</span>&nbsp; ${chipText}</span></div>
<div style="height:20px;line-height:20px;font-size:1px">&nbsp;</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">${dot('h-' + headline.replace(/\W+/g, '').toLowerCase().slice(0, 12), headline, hw, hh, D.fg)}</td></tr></table>
<div style="height:22px;line-height:22px;font-size:1px">&nbsp;</div>
<p class="mu" style="margin:0 auto;max-width:420px;font-family:${FONT};font-size:16px;line-height:26px;color:${D.mute}">${sub}</p>
<div style="height:28px;line-height:28px;font-size:1px">&nbsp;</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" class="btn" style="background-color:${D.btn};border-radius:999px"><a href="#" class="btnt" style="display:block;padding:14px 28px;font-family:${FONT};font-size:15px;font-weight:600;color:${D.btnText}">${ctaLabel} &nbsp;→</a></td></tr></table>
</td></tr></table></td></tr>`

const numbered = (items) => `<tr><td style="padding:10px 4px 0 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items.map(([n, t, d], i) => `<tr><td ${i ? `class="bd" style="border-top:1px solid ${D.line};padding:22px 0"` : 'style="padding:22px 0"'}><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="56" valign="top" class="di" style="font-family:${MONO};font-size:13px;letter-spacing:.06em;color:${D.dim};padding-top:3px">${n}</td>
<td valign="top"><div class="fg" style="font-family:${FONT};font-size:18px;line-height:24px;font-weight:600;letter-spacing:-.01em;color:${D.fg}">${t}</div><div class="mu" style="margin-top:6px;font-family:${FONT};font-size:14.5px;line-height:23px;color:${D.mute}">${d}</div></td></tr></table></td></tr>`).join('')}</table></td></tr>`

const launch = () => ({
  subject: 'Meet your Blips: AI that builds, codes and debugs', preheader: 'A chat assistant, a site builder, a dev agent and a game-server debugger, included in your plan.',
  body: marketingTop() + heroCard({ chipText: 'New · Blips', headline: 'MEET THE BLIPS', hw: 430, hh: 38, sub: 'AI agents that live inside your hosting. They build your site, read your code and debug your game server, so you do not have to.', ctaLabel: 'Meet your Blips', role: '' }) + gap(26) +
    numbered([['01', 'Builder', 'Describe a bakery in Porto with online booking. Watch the site assemble, then keep editing it by chatting. It ships to your own server.'], ['02', 'Dev', 'Connect a repository. The Dev Blip reads the stack trace, finds the line, writes the fix and opens a pull request for you to review.'], ['03', 'Game', 'Tick lag at 9 pm? The Game Blip reads the profiler, names the plugin that is eating the server, and proposes a safe config.']]) + gap(18) +
    `<tr><td ${'class="bgc bd" style="background-color:' + D.card + ';border:1px solid ' + D.line + ';border-radius:16px"'}><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="pad" style="padding:30px 36px" align="center">
<div class="fg" style="font-family:${FONT};font-size:19px;line-height:30px;letter-spacing:-.01em;color:${D.fg}">“It found a memory leak that three of us had missed for a month. Fix and PR were ready before the call ended.”</div>
<div class="mu" style="margin-top:14px;font-family:${MONO};font-size:11.5px;letter-spacing:.06em;color:${D.mute}">MAYA CHEN · CTO, NORTHWIND</div></td></tr></table></td></tr>` + gap(24) +
    `<tr><td align="center">${`<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" class="bd2" style="border:1px solid ${D.line2};border-radius:999px"><a href="#" class="fg" style="display:block;padding:12px 24px;font-family:${FONT};font-size:14px;font-weight:600;color:${D.fg}">Read how Blips work</a></td></tr></table>`}</td></tr>` + footerMarketing(),
  text: 'Meet your Blips\n\nAI agents that live inside your hosting: Builder, Dev and Game.\n\nMeet your Blips: https://blipmade.cloud/blips\n\nUnsubscribe: https://blipmade.cloud/unsubscribe\n',
})

const digest = () => {
  const stat = (n, l) => `<td class="stack" width="33%" align="center" valign="top" style="padding:6px 4px"><div class="fg" style="font-family:${MONO};font-size:34px;line-height:38px;letter-spacing:-.03em;color:${D.fg}">${n}</div><div class="di" style="margin-top:4px;font-family:${MONO};font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:${D.dim}">${l}</div></td>`
  const item = ([tag, tone, t, d]) => `<tr><td class="bd" style="padding:16px 0;border-top:1px solid ${D.line}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="64" valign="top" style="padding-top:2px">${chip(tag, tone)}</td><td valign="top"><div class="fg" style="font-family:${FONT};font-size:15.5px;line-height:22px;font-weight:600;color:${D.fg}">${t}</div><div class="mu" style="margin-top:4px;font-family:${FONT};font-size:14px;line-height:22px;color:${D.mute}">${d}</div></td></tr></table></td></tr>`
  return {
    subject: 'November on Blipmade: 4 new regions of capacity, faster deploys', preheader: 'Deploys are 38% faster, the site builder learned bookings, and a new status page.',
    body: marketingTop() + `<tr><td ${'class="bgc bd" style="background-color:' + D.card + ';border:1px solid ' + D.line + ';border-radius:20px"'}><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="pad" style="padding:36px 36px 8px 36px">
${eyebrow('The monthly digest · November 2026')}
<h1 class="h1 fg" style="margin:12px 0 0 0;font-family:${FONT};font-size:34px;line-height:40px;font-weight:600;letter-spacing:-.03em;color:${D.fg}">What shipped,<br>in five minutes.</h1>
<p class="mu" style="margin:14px 0 0 0;font-family:${FONT};font-size:15.5px;line-height:25px;color:${D.mute}">Hi {{first_name}}, here is everything we released this month, and what is coming next.</p>
${spacer(26)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bd" style="border-top:1px solid ${D.line};border-bottom:1px solid ${D.line}"><tr>${stat('38%', 'Faster deploys')}${stat('4', 'Regions')}${stat('99.98%', 'Uptime')}</tr></table>
${spacer(10)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${[['New', 'ok', 'Bookings in the site builder', 'Describe a table reservation flow and the Builder wires up a real form, emails and a calendar.'], ['New', 'ok', 'Status page 2.0', 'Per-region history, incident updates by email and an RSS feed.'], ['Faster', 'info', 'Deploys in about 40 seconds', 'Image layers are now cached per region. Median deploy dropped from 65 s to 40 s.'], ['Fix', 'warn', 'DNS verification retries', 'A verification that failed once no longer needs a manual retry.']].map(item).join('')}</table>
${spacer(22)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td ${'class="btn" style="background-color:' + D.btn + ';border-radius:999px"'}><a href="#" class="btnt" style="display:block;padding:13px 26px;font-family:${FONT};font-size:14.5px;font-weight:600;color:${D.btnText}">Read the full changelog &nbsp;→</a></td></tr></table>
${spacer(30)}
</td></tr></table></td></tr>` + footerMarketing(),
    text: 'November on Blipmade\n\n38% faster deploys · 4 regions · 99.98% uptime\n- New: bookings in the site builder\n- New: status page 2.0\n- Faster: deploys in about 40 s\n- Fix: DNS verification retries\n\nChangelog: https://blipmade.cloud/changelog\n\nUnsubscribe: https://blipmade.cloud/unsubscribe\n',
  }
}

const upgrade = () => ({
  subject: 'Your Nano is at 87% memory. Here is 20% off the next size', preheader: 'Upgrade to Pro before it fills up. Offer ends Nov 30.',
  body: marketingTop() + `<tr><td ${'class="bgc bd" style="background-color:' + D.card + ';border:1px solid ' + D.line + ';border-radius:20px"'}><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="pad" style="padding:38px 36px 36px 36px" align="center">
<div style="display:inline-block">${blip(64, 'dev')}</div>
${spacer(18)}
${eyebrow('A heads-up from your Dev Blip')}
<h1 class="h1 fg" style="margin:12px 0 0 0;font-family:${FONT};font-size:30px;line-height:36px;font-weight:600;letter-spacing:-.025em;color:${D.fg}">Your server is outgrowing Nano</h1>
<p class="mu" style="margin:12px auto 0 auto;max-width:430px;font-family:${FONT};font-size:15.5px;line-height:25px;color:${D.mute}">Memory on <b class="fg" style="color:${D.fg}">api-gateway</b> has averaged 87% this week. Move up a size before traffic does it for you.</p>
${spacer(26)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:420px"><tr><td align="left" class="di" style="font-family:${MONO};font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${D.dim};padding-bottom:8px">Memory · last 7 days</td><td align="right" class="warn" style="font-family:${MONO};font-size:13px;color:${D.warn};padding-bottom:8px">87%</td></tr><tr><td colspan="2">${bar(87, 'warn')}</td></tr></table>
${spacer(28)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="stack" width="50%" valign="top" style="padding-right:8px"><div class="bd" style="border:1px solid ${D.line};border-radius:14px;padding:20px;text-align:left"><div class="di" style="font-family:${MONO};font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:${D.dim}">Now · Nano</div><div class="fg" style="margin-top:10px;font-family:${MONO};font-size:26px;color:${D.fg}">$4<span class="di" style="font-size:12px;color:${D.dim}"> / mo</span></div><div class="mu" style="margin-top:10px;font-family:${FONT};font-size:13.5px;line-height:22px;color:${D.mute}">1 vCPU<br>1 GB memory<br>25 GB NVMe</div></div></td>
<td class="stack" width="50%" valign="top" style="padding-left:8px"><div class="bd2" style="border:1px solid ${D.fg};border-radius:14px;padding:20px;text-align:left"><div class="fg" style="font-family:${MONO};font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:${D.fg}">Recommended · Pro</div><div class="fg" style="margin-top:10px;font-family:${MONO};font-size:26px;color:${D.fg}">$9.60<span class="di" style="font-size:12px;color:${D.dim}"> / mo</span></div><div class="mu" style="margin-top:10px;font-family:${FONT};font-size:13.5px;line-height:22px;color:${D.mute}">4 vCPU<br>8 GB memory<br>100 GB NVMe</div></div></td></tr></table>
${spacer(26)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" class="bd2" style="border:1px dashed ${D.line2};border-radius:10px;padding:12px 22px"><span class="di" style="font-family:${FONT};font-size:12px;color:${D.dim}">Use code</span> &nbsp;<span class="fg" style="font-family:${MONO};font-size:18px;letter-spacing:.14em;color:${D.fg}">BLIP20</span> &nbsp;<span class="di" style="font-family:${FONT};font-size:12px;color:${D.dim}">· ends Nov 30</span></td></tr></table>
${spacer(24)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" class="btn" style="background-color:${D.btn};border-radius:999px"><a href="#" class="btnt" style="display:block;padding:14px 30px;font-family:${FONT};font-size:15px;font-weight:600;color:${D.btnText}">Upgrade to Pro &nbsp;→</a></td></tr></table>
${spacer(14)}
${small('Resize takes about a minute and you pay the new price only from that moment. You can go back any time.', 'text-align:center')}
</td></tr></table></td></tr>` + footerMarketing(),
  text: 'Your Nano is at 87% memory\n\napi-gateway averaged 87% memory this week. Pro (4 vCPU, 8 GB, 100 GB) is $9.60 / mo. Use code BLIP20 for 20% off until Nov 30.\n\nUpgrade: https://blipmade.cloud/services/api-gateway\n\nUnsubscribe: https://blipmade.cloud/unsubscribe\n',
})

export const EMAILS = [
  { id: 'order', kind: 'system', name: 'Order confirmation', build: orderConfirmation },
  { id: 'paid', kind: 'system', name: 'Payment received', build: paymentReceived },
  { id: 'failed', kind: 'system', name: 'Payment failed', build: paymentFailed },
  { id: 'alert', kind: 'system', name: 'Service alert', build: serviceAlert },
  { id: 'security', kind: 'system', name: 'New sign-in', build: securityAlert },
  { id: 'launch', kind: 'marketing', name: 'Product launch', build: launch },
  { id: 'digest', kind: 'marketing', name: 'Monthly digest', build: digest },
  { id: 'upgrade', kind: 'marketing', name: 'Upgrade offer', build: upgrade },
]

export const MOCK = { first_name: 'Stefan', email: 'stefan@example.com' }

/* build a full document for an email */
export function render(id) {
  const e = EMAILS.find((x) => x.id === id) || EMAILS[0]
  const t = e.build()
  return { ...e, ...t, html: shell({ subject: t.subject, preheader: t.preheader, body: t.body }) }
}
