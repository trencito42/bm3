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
