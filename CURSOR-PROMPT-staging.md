# Prompt for Cursor: bring the bm3 design to `blipmade-hosting` staging

Paste everything below the line into Cursor, in the `trencito42/blipmade-hosting` workspace.

---

You are implementing the **bm3 design direction** in `trencito42/blipmade-hosting`, on the **`staging`** branch only. The new design is partly in the repo already but is incomplete and inconsistent across the public homepage, the customer app and the admin. Your job is to finish it properly, to the standard of the reference, and deploy it to the staging environment.

## Source of truth

- Design reference: the `bm3` project (React + Vite + Tailwind v4 + Radix). GitHub: `trencito42/bm3`, branch `main`.
- Pull the latest `main` before you start. The most recent pass (everything after `a7a74d2`) changed these files, and they are the ones staging is furthest from:
  - `src/site/HomePage.jsx` (rewritten: the marketing homepage)
  - `src/site/homeContent.js` (new: every word, price and promise on the homepage)
  - `src/index.css` (motion tokens and the new classes: `--ease-expo`, `.anim-reveal`, `.reveal-grid`, `.stage*`, `.log-line`, `.lift`, `.draw-check`, `.slider-glide`, `.link-grow`)
  - `src/components/ui.jsx` (Button: arrow nudge on hover/press)
  - `src/builder/fx.js`, `src/builder/builder-fx.css` (dot-matrix type: new glyphs `< > = " * €`, and the assemble animation now lights up in reading order in about a second)
  - `src/chat/chat.css`, `src/chat/Thread.jsx`, `src/chat/Composer.jsx`, `src/chat/ChatWidget.jsx` (chat motion: messages arrive from their sender's side, wave typing dots, send-arrow exit, softer open and quicker close)
  - `src/components/cast.css` (new), `src/components/orbs.jsx` (the four Blips we ship: more depth, one "thinking" behaviour each, whole-character hop/breathe/speak, and eyes that close while a password or any `data-private` field has focus), `src/components/ui2.jsx` (`PasswordInput` carries `data-private`), `src/chat/Who.jsx` (human avatar)
  - `src/site/reveal.jsx` (small fix)
- Run the reference with `npm install && npm run dev` (port 5180, hash routes): `#/site` public site, `#/` customer app, `#/admin` admin, `#/ds/*` design system. `PROGRESS.md` in bm3 documents every component and why it behaves as it does. Read it.
- bm3 is mock data only. Port the **design, components and motion**, never the mock data, never the fake API.

## Step 0: look before you touch (report back, then wait for my OK)

1. Read the `blipmade-hosting` repo: framework, styling setup, routing, where the public site, customer app and admin live, how shared UI is organised, how staging is built and deployed.
2. Diff what exists against bm3 and give me a short table: area · what is already on the bm3 design · what is missing or wrong · files you will touch.
3. Tell me how you will map bm3 onto the repo's stack (if it is not React + Tailwind v4 + Radix, say how each piece translates). Do not add a second UI framework or a second styling system next to the existing one.
4. Stop and wait for my go-ahead on the plan.

## Hard rules

- Work only on `staging` (or short-lived branches merged into `staging`). Never push to `main` / production, never deploy to production, never change production config, DNS or data.
- Deploy to staging through the pipeline or scripts the repo already has. On the infrastructure you have access to: no new machines, no network or firewall changes, no restarts of anything that is not the staging app, no destructive commands. If staging needs something that is not already there, stop and ask.
- No destructive database operations, no schema changes for a visual task. No secrets in commits or logs.
- Do not change business logic, API contracts, auth, billing or provisioning behaviour. If a design needs data the backend does not expose, list it and ask; do not invent it.
- Small commits, one concern each, clear messages. Keep the app building and tests green at every commit.

## What to build, in this order

**1. Foundations (one shared layer for public site, app and admin)**
- Tokens from `bm3/src/index.css`: colours (`#0d0d0f` bg, `#141416` card, `#1c1c20` / `#2a2a2f` lines, `#f2f2f3` fg, `#8e8e94` mute, `#6b6b72` dim, single red accent `#ff2d36` used only for active/live state), Inter + Geist Mono, radii, focus ring.
- The motion system exactly as written in the `MOTION SYSTEM` block and below it: easing tokens (`--ease-out`, `--ease-in`, `--ease-std`, `--ease-expo`), durations, the rule that exits are shorter than entrances, popovers growing from their trigger, dialogs 240 in / 150 out, drawers travelling their full width, route changes opacity-only, the global reduced-motion rules. Do not approximate these with a library's defaults.
- Dot-matrix type (`builder/fx.js` `dotText`, `FxBits.jsx`, `DotViz.jsx`): logo, hero headlines, key numerals, prices (`AnimatedPrice`).

**2. Primitives** (`components/ui.jsx`, `ui2.jsx`, `ui3.jsx`, `layouts.jsx`, `Charts.jsx`, `NotificationCenter.jsx`)
Replace the repo's existing equivalents instead of adding parallel ones. Keep every state bm3 defines: hover, press, focus-visible, disabled, loading (Button keeps its width), invalid, empty, error, skeleton. Keep the sliding indicator on tabs and segmented controls, and the one `DataTable` style on every data page.

**3. Public homepage** (`site/HomePage.jsx` + `site/homeContent.js` + `site/Chrome.jsx` header/footer + `site/reveal.jsx` + `lib/useTorch.js` + `components/BlipCast.jsx`)
- Rebuild it section for section, and add nothing: hero (the headline's first line changes with the stage below it: "YOUR WEBSITE. / YOUR APP. / YOUR GAME SERVER. / YOUR SERVER." over a fixed "LIVE IN SECONDS."; one piece of state drives both; it auto-rotates until the visitor picks a tab, pauses on hover/focus and off-screen, driven by `animationend`, not timers), stack marquee, products as a price list (rows, not cards), Meet the Blips alone on its screen, three panel cards, pricing configurator with the included list under it, stats, free migration, FAQ, final CTA. The page is deliberately sparse: one idea per screen, generous vertical space, plain eyebrows with no numbering. If something new must go in, it replaces something.
- Keep content separate from layout as `homeContent.js` does.
- **Wire real data:** product names, "from" prices, plan sizes, configurator rates, regions and latencies must come from the real catalogue/config in the repo, not from the bm3 numbers. Every CTA goes to the real route (register, product pages, apps, docs, builder).
- **Every factual claim must be true before it ships.** Go through `homeContent.js` and give me a table: claim · source in the repo or "NOT VERIFIED". This covers uptime %, deploy time, support reply time, region list, free SSL, daily backups, DDoS protection, free migration, hourly billing, unmetered traffic, no-card trial, and what the Blips can actually do today. Anything not verified gets hidden behind a flag or reworded; ask me, do not guess.
- There is no testimonials section. Do not invent customer quotes or logos; it comes back only when I give you real, attributable ones.
- **Marketing voice:** we sell outcomes, like a confident hosting brand. Never name the virtualisation platform, hardware vendors, upstream providers, control-panel software or any internal tooling, anywhere a visitor can read it (copy, alt text, meta tags, comments in shipped HTML, error pages, response headers you control). "Fast NVMe hardware", "EU data centres", "always-on DDoS protection" is the level of detail.
- SEO and sharing: one real `<h1>` (the dot headline is decorative, the text is in the sr-only heading), title, meta description, Open Graph image, canonical. No layout shift from the hero stage (it reserves its height).

**4. Customer app** (`App.jsx`, `pages/*`, `components/product.jsx`, `chat/*`)
Shell (sidebar, top bar, mobile drawer + bottom bar), overview, deploy flow, apps/VPS inventory and detail tabs, domains + DNS, email, billing, support + chat launcher, notifications, account. Real data and real actions stay as they are; only the presentation changes. Every list needs its loading, empty and error state from the design.

**5. Admin** (`admin/AdminApp.jsx`, `admin/ListPage.jsx`)
Same tokens and primitives, denser. Dashboard, customers + inspector, orders, products + editor, support console, infrastructure, incidents, operations, staff, audit, and the data-driven list pages (KPI strip, search, filter chips, sortable table, bulk bar, detail drawer). Admin screens may show internal infrastructure detail; public pages may not.

## Quality bar (what "done" means)

- Side by side with bm3 at 1440, 1280, 1024, 768, 390 and 320 px: same spacing, type, borders, states and motion. No horizontal scroll at any width.
- Microinteractions behave like the reference, not "similar": button press is tonal with no scale, arrows nudge 2 px, tab indicators glide, prices swap digits instantly while dragging and settle once, cards lift 2 px, reveals are 16 px / 620 ms / expo-out and never leave content invisible (keep the scroll fallback in `useSeen`).
- Nothing animates while off-screen or in a hidden tab (`useLive`). `prefers-reduced-motion` turns decoration off and keeps state changes instant.
- Keyboard: everything reachable, visible focus ring, Esc closes overlays and returns focus, arrow keys on tabs/menus/sliders. Contrast and hit targets hold on mobile (inputs 16 px so iOS does not zoom).
- No console errors or warnings, no failing tests, Lighthouse on the staging homepage: performance and accessibility both 90+ on mobile. Code-split the marketing site from the app and admin.
- Do not add effects that are not in bm3: no gradients, glows, glassmorphism, emoji, extra accent colours or stock illustrations. When unsure, do less.

## How to report

After each numbered phase: what changed (files), screenshots at 1280 and 390 from staging, what you verified and how, what is not verified, and open questions. Deploy to staging after phases 3, 4 and 5 and give me the URL. Never tell me something works unless you opened it on staging and saw it work.

## Deploy page (do this first, it is small)

Today the site shows a gateway error while a deploy is running. `public/deploying.html` in bm3 replaces that: one self-contained file (inline CSS and JS, no requests) with the dot-matrix headline decoding out of noise, Pip waiting, and a script that polls the current URL and reloads the moment the site answers again.

- The page has seven states and picks one from the server's real answer: deploying (502/503/504), slow (still deploying after 3 minutes), maintenance (503 plus the header `X-Blip-State: maintenance`), busy (429), error (500 or any other failure), offline (no answer at all), back (first success, then it reloads). Preview them in bm3 at `#/ds/system`, or directly with `/deploying.html?state=error`. Map 500 to the same file as well, and add the maintenance header to whatever maintenance switch the proxy has.
- Find how staging is deployed (the GitHub workflow and whatever reverse proxy sits in front of the app) and make the proxy serve this file whenever the app is unreachable (502 / 503 / 504). Keep the error status, add `Retry-After` and `Cache-Control: no-store`. The file's header comment has an nginx example; translate it to the proxy actually in use.
- The file must live outside whatever the deploy replaces or restarts, otherwise it disappears exactly when it is needed.
- Never return it with status 200 on a real URL (it would be indexed, and it could not tell when the site is back).
- If the downtime comes from the deploy itself stopping the old version before the new one is healthy, say so and propose the fix (start new, health-check, then switch) as a separate change. The page is the fallback, not the cure.
- Prove it on staging: trigger a deploy, load the site during it, confirm the page shows with a 5xx status and that it returns to the site by itself afterwards.

## Round 2: what is wrong on staging today (fix these before anything new)

Looked at `staging.blipmade.com` on 2026-11-10.

1. **The homepage copy reads like a disclaimer.** Lines such as "The characters on this page illustrate the design, they are not autonomous agents", "This is not a multi-region marketplace map", "TLS on supported products", "Cancel per billing rules", "The animated strip below is an example, not a live deploy" must go. The rule was "do not claim what is not true". The fix for an untrue line is to **delete it or say the true thing plainly**, never to keep it and hedge it. A visitor must not be able to tell that a careful robot wrote the page.
2. **No dashes as punctuation** anywhere a visitor reads: no em dash, no en dash, no " - " between clauses. Use a full stop or a comma. Search the built HTML for the characters U+2014 and U+2013 and for " - " and remove every hit in copy.
3. **`/apps/minecraft` answers HTTP 404** (title "Page not found") while still rendering the Minecraft Paper page under the 404. Make the slug resolve (alias `minecraft` to the Paper edition, or redirect 301 to the real slug) and return 200. Check every catalogue slug the homepage, header and footer link to, the same way.
4. On that page the description is printed twice, "Good for" is empty and "Total per month" has no number in the HTML. Empty blocks are removed, not shown blank.
5. On the homepage the product rows show "/ mo" with no number for WordPress, Minecraft and PostgreSQL. Every row shows "from EUR x" from the catalogue, or "See plans" when there is no single starting price. Never a unit without a number.

### Homepage copy to use (replace what is there)

`src/site/homeContent.js` in bm3 now holds this text. It is written for what the product really is today: EU hosting in Germany, monthly billing, prices in euros, people answering support, Blips as characters and status indicators (not agents). If a line below is not true, tell me; do not rewrite it into a hedge.

- Headline: "YOUR WEBSITE. / YOUR APP. / YOUR GAME SERVER. / YOUR SERVER." over "ONLINE TODAY."
- Sub: "Pick what you need, set the size yourself, and run it from one panel that stays out of your way."
- Buttons: "Create account", "See pricing". Line under them: "Prices up front · Hosted in the EU · No contract"
- Products: one line each, from `PRODUCT_PITCH`.
- Meet the Blips: "Pip, Forge, Byte and Glitch live in your panel. They show you what your services are doing, so a glance is enough. When you need help, a person answers."
- Panel cards: "From a push to a running app." / "Connect a repository or upload a folder. We build it and switch on HTTPS." · "Hosted in the EU." / "Your data stays in data centres in Germany." (one region: show it as a fact, drop the multi-region map) · "Live, down to the dot." / "CPU, memory and disk as they happen."
- Pricing: "Build the server you need. Pay for exactly that." Under the price: "per month". Included list from `INCLUDED`.
- Stats strip: only numbers we measure and can show the source for. If there are fewer than three, remove the strip.
- Moving: "Switching hosts? We help you move." plus `MIGRATION.sub` and its four steps.
- FAQ: the five in `FAQ`.
- Final: "GO LIVE TODAY" / "Pick a product, set the size, launch it." / "Create account", "See products".

## Round 2: new in bm3 since the last prompt

- **Public pages** in `src/site/MorePages.jsx`: status (`/status`: 90-day history per system, open incidents with a timeline of updates, planned maintenance, past incidents, subscribe), changelog (`/changelog`: monthly releases, filter by kind), contact (`/contact`: topic, validated form, sending and sent states), legal (`/legal/:doc` for terms, privacy, aup, sla, dpa, cookies: document switcher, numbered sections, contents, print). Wire status to the real monitoring data and incidents; if there is no source yet, ship the page with real current state only and no invented history. Legal text comes from me, keep the "sample document" banner until it does.
- **Cookie choice** in `src/site/CookieConsent.jsx`: bottom left, does not block the page, "Only necessary" and "Accept all" are the same size and style on purpose, optional categories are off by default, the footer has "Cookie settings" to reopen it. List only the categories the site really sets, and do not load any optional script before consent.
- **Email**: 25 templates in `src/emails/` (account, billing, services, support, plus ten marketing: welcome, finish setup, product launch, teams, monthly digest, upgrade offer, seasonal sale, migration, refer a friend, win-back). Images are real PNG files in `public/email`; publish that folder at a stable public address and replace `{{assets}}` with it when sending. Every `href="#"` gets its real link. `{{company_address}}` is the registered company name and postal address. No email ever contains a password. Replace the transactional emails the app sends today with these, keep the plain-text part.
- **Workspace**: `#/ds/pages` lists every screen and the known gaps (about, careers, real docs, sharing image and icons, invoice PDF). Do not invent those.

Marketing mail rules: every email has one idea and one action, an unsubscribe footer and a plain-text part. Send only to people who opted in. The offers (sale code, referral credit, plan prices) are sample values: take real ones from the catalogue and the promotions we actually run, or do not send that email. Never put an invented quote or customer logo in any of them.
