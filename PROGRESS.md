# Blipmade design workspace — progress record

Run: `cd dashboard && npm run dev` → http://localhost:5180/ (hash routes). Everything is simulated, mock data only (`src/lib/mock.js`).

## Scope notes
- **Repo `trencito42/blipmade-hosting` was NOT accessible** (gh not authenticated). Information architecture (routes, nav) is taken from the brief and session context and is **unverified** against `nav.ts` / `routes.tsx`.
- Visual direction preserved from this session: Klinch-derived dark UI (#0d0d0f / #141416 / #1c1c20), Inter + Geist Mono, hairline borders, dot-matrix type for logo / hero / key numerals, single red accent for active state, orb for assistant moments. The older flat "Petal" brief files in the repo folder are a different project and were not used.

## Workspace map (top bar, 8 sections)
| # | Section | Route | Status |
|---|---|---|---|
| 01 | Foundations | `#/ds/foundations` | color, type, spacing/radius/elevation, icons, motion, a11y+density, grids — done |
| 02 | Components | `#/ds/components` | A–F done (see coverage) |
| 03 | Patterns | `#/ds/patterns` | tables/filters/saved views, forms, wizard, confirmation scale, responsive — done |
| 04 | Product | `#/ds/product` | servers, console, files, VPS, commerce, domains/DNS, mail, billing, support, admin — done (subset, see gaps) |
| 05 | Customer app | `#/` | 26-screen list mostly covered, see below |
| 06 | Admin | `#/admin/*` | 26 sections; 13 full, rest compact list pages |
| 07 | Public site | `#/site/*` | home, products, product detail, login/register/recover/2FA, docs, status, legal, 404 |
| 08 | States & mobile | `#/ds/states` | 5 phone compositions, 8-state selector, breakpoint preview |

## Customer app coverage (brief item → route)
1 Overview `/` · 2 Deploy catalog `/catalog` (step 0) · 3 Configurator `/catalog` (step 1) · 4 Checkout/review `/catalog` (steps 2–3 + provisioning) · 5 Apps & DB inventory `/apps` · 6 Instance overview `/apps/:id` · 7 Console (tab) · 8 File manager (tab) · 9 Databases (tab) · 10 Backups (tab) · 11 Startup (tab) · 12 Network (tab) · 13 Git & deploy (tab) · 14 VPS inventory `/vps` · 15 VPS management `/vps/:id` · 16 Domains `/domains` · 17 Email hosting `/email` · 18 Mailbox mgmt (Email → Mailboxes) · 19 Webmail (Email → Webmail) · 20–22 Billing / Invoices / Subscriptions `/billing` tabs · 23 Support tickets `/support` · 25 Notifications `/notifications` · 26 Account & security `/account`
Plus (existing): Services `/services`, Site builder `/builder` (flashy AI generator).
**Missing:** 24 Live chat as a full screen (component exists: `LiveChatWidget`, shown in Product → Support); Domains page has no DNS editor tab yet (DNSRecordTable exists in Email → DNS and Product).

## Admin coverage
Full: Dashboard, Customers (+inspector), Orders (+detail drawer), Products (+editor with sticky save bar), Pricing, Reports, Support console (3-pane), Infrastructure, Incidents, Operations (jobs), Staff & roles (matrix), Audit log.
Compact list pages only: Services, VPS, Promotions, CRM, Automations, Knowledge base, Abuse, Backups, Mail hosting, Email templates, Notifications, Settings & integrations.

## Component coverage vs brief
Done (interactive where it matters): Button/IconButton/ButtonGroup/SplitButton/LinkButton/FAB/CopyButton/BulkActionToolbar/Confirm; TextField, Textarea, Select, Combobox, MultiSelect, Checkbox, Radio, Switch, Segmented, Slider, NumberStepper, OTP, Money, Password, TagInput, KeyValueEditor, DomainInput, CIDR, SSHKey, DNSRecordEditor, Dropzone, FormField, ValidationSummary, UnsavedChanges; Sidebar (rail/full), Topbar, Breadcrumbs, PageHeader, Tabs, VerticalTabs, MobileBottomNav, MobileDrawer, CommandPalette, SearchResults, Pagination, Stepper, WizardNav; Dialog, AlertDialog, Drawer, BottomSheet, Popover, DropdownMenu, ContextMenu, Tooltip, HoverCard, NotificationDropdown; DataTable (sort/select/columns), ListRow, MetricCard, StatusBadge/Indicator, Avatar/Group, Progress/Ring/UsageMeter, Timeline, AuditEvent, Empty/Error/Loading/Skeleton, InlineAlert, Toast, CopyableValue, CodeBlock, Charts+Tooltip, FilterBar/FilterBuilder/SavedViews/ColumnPicker; Shells, Panel, Card, SplitView, ResizablePanel, StickyActionFooter.
Not built as dedicated demos: AsyncCombobox, UnitStepper, DatePicker / DateRangePicker / DateTimePicker, PercentInput, AvatarGroup overflow states, DataGrid (spreadsheet-style), HoverCard on tables, ChartTooltip variants, DetailLayout, ScrollContainer.
Product components not built: CPU/Memory/Disk as separate components (combined in `ResourceUsage`), AccessPermissions, ServerActivity, ConsoleSearch (filter field exists), FolderTree, FilePermissions editor, CodeEditor (preview only), SnapshotPreview, SoftwareVersionSelector, PresetSelector, AddonSelector (switch only), PlanComparison (public site table only), AliasManager, MessageReader/Compose as separate (inside Webmail), SupportRating (basic), NewConversation, AttachmentPreview, BillingTimeline, CRMActivity, ProvisioningStatus (timeline only).

## Known inconsistencies / debt
- Two table styles coexist: older pages (Domains/Support/ServiceDetail) use `Table/Th/Td`, newer ones use `DataTable`. Should be migrated to `DataTable`.
- Older customer pages (`Order`, `Services` detail) predate the product components and duplicate some UI (Order ≈ Catalog configurator).
- Product gallery uses a few emoji (support rating); replace with icons.
- Mobile compositions are static frames; the live app is not fully responsive below 768px on every page (sidebar is hidden, no bottom nav wired yet in the real shell).
- Bundle is one 800 kB chunk; code-split by section if this ships.

## QA pass (adaptive) — latest
Automated audit (`window.__audit` style script, run in-browser) over 37 routes: horizontal overflow, unintended horizontal scroll, runtime errors, text clipped inside fixed-height controls.
- **Widths run:** 390, 320, 768, 1024, 1920 → 0 findings after fixes. (1440 and short-height 1280×520 not run yet.)
- **Fixed:** Overview heading overflowed at 390 (dot text now scales to its container); Stepper overflowed (labels collapse to the active step on phones); Tabs overflowed (scrollable); PageHeader actions overflowed (wrap); grids blowing out from wide children (`.grid > *{min-width:0}`, Card `min-w-0`); Webmail picks its layout from its *container* width; OTP boxes shrink on 320px; Firewall/DNS tables scroll inside their card; small DotGauge numerals no longer overlap the ring.
- **New:** customer app now has a mobile drawer + 5-tab bottom bar; header collapses (hamburger, avatar only); Site builder has a Chat/Preview toggle on phones and jumps to the preview when generation starts; animated price (`AnimatedPrice`) re-assembles only the changed digits with a floating delta, used in the homepage configurator, Order summary and PriceBreakdown; homepage terminal/teaser reserve their height (no more page growing).
- **Regression caught & fixed:** `max-width:100%` on auto-width dot SVGs collapsed numerals to 0 px.
- **Not verified:** the builder generation flow on a phone (timers were throttled while the pane was hidden), real-device keyboard/safe-area behaviour, short viewports (< 600 px tall), pixel-level visual review of every page at every width.

## Update — gap closing pass
**Added components** (`src/components/ui3.jsx`, shown in Components → B2 and Product → More): DatePicker, DateRangePicker (with presets), DateTimePicker, AsyncCombobox (simulated latency), UnitStepper, PercentInput, DataGrid (editable cells, keyboard nav), FolderTree, CodeEditor (editable, line numbers, dirty/save/revert), AccessPermissions, FilePermissions (octal), SoftwareVersionSelector, PresetSelector, AddonSelector, PlanComparison, AliasManager, BillingTimeline, ServerActivity, CRMActivity, NewConversation, AttachmentPreview.
**Added screens:** Live chat (Support → Live chat: presence, typing, end chat, rating, new chat); DNS & SSL section in Domains (select a domain, SSL states, DNS editor with validation).
**Admin:** the 12 former stub pages (Services, VPS, Promotions, CRM, Automations, Knowledge base, Abuse, Backups, Mail, Templates, Notifications, Settings) are now real list pages: KPI strip, search, filter chips with counts, sortable table, row selection + bulk bar, detail drawer.
**Consistency:** Overview, Invoices and Domains tables now use `DataTable` (one table style on all data pages).
**Bugs fixed this pass:** price slider drag (component defined inside component remounted every tick; same class fixed in AdminApp), AnimatedPrice now pops dots in ~0.4 s so a number is never unreadable while dragging.
**QA (automated + screenshots):** 66 routes × widths 320, 390, 768, 1024(earlier), 1280×520, 1440, 1920(earlier) → no horizontal overflow, no runtime errors, no collapsed dot numerals. Builder generation verified on a 390 px viewport (preview opens automatically).
**Still open:** real-device keyboard/safe-area behaviour; pixel-level visual review of every page at every width (only spot-checked); mouse drag on sliders not automatable here (keyboard verified); remaining brief items not built as dedicated demos: ResizablePanel with a drag handle (slider stand-in), ScrollContainer, DetailLayout as a named pattern, Customer app "Live chat" is a tab of Support (not a separate route); repo `trencito42/blipmade-hosting` still not inspected (no access).

---
## Craft pass 1 (microinteractions & motion system)
Approach: fix behaviour first, verify in the running app (sampling real frames / computed styles), then commit.

**Motion system** (`src/index.css`): one vocabulary of tokens (`--ease-out/in/std`, 120 / 180 / 150 / 240 / 280 ms). Popper surfaces (menu, select, popover, hover card, tooltip) grow from the trigger's own origin (`--radix-popper-transform-origin`) and now have exit animations (they used to vanish). Dialogs 240 in / 150 out; side sheets travel their full width, 280 in / 200 out; scrims fade. Route/tab content is opacity-only (no rise on every navigation). Global reduced-motion rule. `touch-action: manipulation` and no tap flash on controls.
- **Real bug fixed:** dialog entrance applied `translate(-50%, -48%)` on top of Tailwind's centring, so every dialog drifted in from the top-left. Verified now: centre stays at (640, 450) for the whole animation, rising 8 px.
**Buttons:** tonal hover/press states (no scale), `loading` prop swaps the label for a spinner with identical width/height (verified 119 → 119 px), unified focus ring. **Fields:** one `fieldBase` (hover lift, focus border + soft ring, placeholder recedes, invalid, disabled, read-only) shared by `Input`, `Textarea` and `inputCls`. `PasswordInput` whose eye never steals focus (verified caret/focus kept). **Copy button:** icon crossfade on the button itself, no toast. **Switch:** thumb stretches while pressed. **Slider:** grab cursor, hover/active ring. **RadioCard:** check badge pops in.
**Tabs / Segmented / DetailLayout:** a single indicator that glides between items (`useSlideIndicator`), re-measures on resize/state change, and scrolls an off-screen active tab into view on phones. Verified: indicator x goes 480 → 396 → 268 → 235 → 200 → 185 → 179 → 177 → 176 in ~220 ms (ease-out), keyboard arrows move selection.
**Mobile sheet:** shared `MobileSheet` (customer app + admin) stays mounted for its exit, closes on Escape, locks body scroll, honours the safe area. Verified slide-in frames −300 → −235 → −173 → −122 at 16–17 ms per frame; rapid open/close/open ends in the right state.
**DataTable:** selected rows get a 2 px left marker; sortable headers show a faint affordance on hover; `aria-sort`.
**AnimatedPrice (signature):** digits swap instantly while the value is moving (verified min dot opacity 1 on every frame of a 5-step drag), then one settle pulse on the digits that changed and a single net delta (+$12.50) after 220 ms of stillness. Stat numerals no longer play the red entrance flash on every navigation (`DotNum` is static by default).
**DotBars:** hover has no stagger delay after the reveal (was up to 500 ms late); tooltip snaps to the hovered column's top dot (verified x equal) and glides between columns.
**Orb lab:** 10 selectable styles with shared face, states and cursor-follow; plasma rebuilt darker so eyes stay legible; mercury uses dark eyes.
**Deploy:** step content cross-fades (summary card stays mounted). Webmail compose grows out of its docked corner.

**QA:** overflow/error/collapsed-numeral audit over 70 routes at 390 px and 1280 px after all changes: 0 findings.

**Not verified / remaining**
- Focus-ring appearance under real keyboard modality (`:focus-visible` cannot be triggered by script); Select / Popover / ContextMenu exits were verified indirectly (same CSS as the dropdown that was sampled).
- Pointer-leave of the chart tooltip (synthetic events do not exercise React's leave); real hover on touch devices.
- Chart crosshair / dataset transitions, orb state-to-state transitions, toast timing, file-manager and webmail interaction details, Site builder choreography are untouched in this batch.
- Virtual keyboard and safe-area behaviour on real devices.

---
## Craft pass 2 (orbs, state transitions, product interactions)
**Orbs:** removed Gimbal (thin rings read as technical, not as a character). Added Nebula, Bubble, Halo, Goo (SVG metaballs), Jelly, Moon (matte pearl with a drifting light via `@property`), Eclipse (corona). The lab now has 16 styles; each shares the face, the six states and cursor-follow. Goo enlarged after the first render looked small; plasma/mercury legibility fixed earlier. **State changes:** every orb now does a 280 ms soft pulse when its state changes (`usePulse`), verified (`data-pulse` set, cleared after ~320 ms) and honours reduced motion; lab has a "Cycle states" mode to watch the transitions. Selecting an orb applies it app-wide (verified in the Site builder, and reverts).
**Site builder:** the thread no longer shakes while text streams. Smooth-scroll was being re-triggered every ~16 ms; now it writes `scrollTop` directly and only while the reader is at the bottom; wheel/touch up releases the follow immediately. Verified at 380 px height: the gap stays 0 while streaming; after scrolling up the thread stays put while content keeps growing (gap 292).
**File manager:** arrow keys move selection, Shift+arrow extends, Space toggles, Esc clears, Ctrl/Cmd+A selects all, selected row scrolls into view (all verified). **Webmail:** arrow keys move through messages and focus follows; compose focuses "To" and Esc closes it; in a narrow container the inbox now opens on the list (not on a pre-selected message); the unread dot fades instead of vanishing.
**Charts:** hovering a column dims the others (acts as the crosshair). **Toasts:** 2.8 s, max 3 visible, mobile offset clears the bottom bar.
**QA:** 70-route overflow/error/numeral audit at 390 px and 1280 px after these changes: 0 findings.

**Still open (honest list)**
- Real keyboard-modality focus ring check; real pointer-leave and touch behaviour on charts; chart dataset-to-dataset transition is still a full re-reveal.
- Toast progress/loading variants, copy-confirmation inside tables, inline validation timing.
- File manager rename/upload choreography, drag-and-drop; webmail folders/toolbars (not built), compose attachments.
- Site builder panel-to-panel continuity on resize, publish dialog choreography.
- Virtual keyboard / safe-area on real devices; the preview pane intermittently throttles animations while hidden, so frame-timing numbers were taken with it awake.

---
## Craft pass 3 (more orbs, chart transitions, file manager, webmail)
**Orbs:** +4 (Prism, Sonar, Cloud, Marble) -> 20 styles, same face/6 states/cursor-follow/pulse contract. **Charts:** `DotBars` cross-fades between datasets (old layer fades out while the new one fades in lit; height constant at 215 px; layers collapse to one after ~260 ms); `live` streams (homepage throughput) update in place.
**File manager:** inline rename (F2 / double-click / menu, extension excluded from selection, duplicate and slash validation keeps editing), delete with Undo (restores original index), new folder opens in rename, upload button + drag-and-drop with progress and "(1)" de-duplication.
**Webmail:** Inbox/Starred/Sent/Archive/Trash with counts, search + empty state, archive/trash/delete-forever/unread/star with Undo, compose validation and Sent copy, shortcuts e # s u c, arrows, Esc. Layout by container width: 3 panes / chip row + 2 panes / single pane with Back. Fixed in single-pane: focus now stays in the widget so Esc returns to the list; shortcut hint no longer wraps at mid widths.
**QA:** 23-route overflow/error audit at 390 px and 1280 px: 0 findings. Webmail checked at 960 / 760 / 390 px.

**Still open**
- Real keyboard-modality focus ring; real pointer-leave/touch on charts; toast progress variants; site-builder panel continuity and publish choreography; virtual keyboard/safe-area on devices; attachments in compose.

---
## Craft pass 4 (fix, don't add: no new components or orbs)
**Fixed**
- **Clipboard:** `CopyButton` now awaits `navigator.clipboard`, falls back to a hidden-textarea `execCommand`, and shows a distinct failure state (red icon, "Copy failed" in a polite live region) instead of always claiming success.
- **Mobile sheet:** focus moves in on open (to the active nav item), Tab/Shift+Tab are trapped, Esc closes, focus returns to the opener on close; the panel is labelled. (`onClose` identity no longer re-runs the effect.)
- **Chart pointer:** `pointerenter` per column only (no per-`pointermove` measuring/re-render), columns are memoised so a column change re-renders 2 columns instead of all dots, tooltip closes on scroll/resize. Also removed a React warning (shorthand `transition` mixed with `transitionDelay`).
- **Upload timers:** intervals/timeouts tracked per file, cleared on unmount and when an uploading file is deleted; ids come from a counter (two uploads in the same millisecond used to collide); "Uploaded N files" now fires when the last file *finishes*, not when the last-listed one does.
- **File manager:** after a rename ends (Enter/Esc) focus returns to the list; before, it fell to `<body>` and F2/arrows/Delete stopped working.
- **Webmail:** shortcuts no longer hijack Ctrl/Cmd/Alt chords (Ctrl+C used to open Compose and block copy); sent-message ids from a counter.
- **Orbs:** a shared `useLive` hook (IntersectionObserver + page visibility) stops the JS-driven bodies (dot sphere canvas loop, LED and waveform interval re-renders) when off-screen or the tab is hidden.

**Verified in the browser (390 and 1280 px)**
- Copy: fallback path with a rejecting clipboard (execCommand called, success state), double failure -> failure state + live text, 5 rapid clicks stable. The real clipboard is blocked in this embedded preview, so the *native* success path was not observed.
- Upload: 3 files / 2 batches in one tick -> unique names + ids; 2 running intervals -> 0 after navigating away; no console errors.
- Chart: 0 DOM mutations for moves inside a column; 168 -> 16 mutations column-to-column; tooltip inline opacity 0 after resize.
- Sheet: initial focus on "Overview", body scroll locked, Tab wraps both directions and recaptures focus from outside, Esc closes, focus back on "Open menu".
- Orbs: 5 visible LED/wave orbs of 10 -> exactly 5 live intervals; hidden tab -> 0; scrolling swaps which ones run.
- Webmail: Ctrl/Cmd+C no longer opens Compose; 6 rapid `e` archive 4 -> 0 inbox, Archive 2 -> 6, 3 visible toasts.
- File manager: 6 F2 -> Esc/Enter cycles keep focus on the list; 4 delete/undo cycles leave 8 rows, unique ids.
- Reduced motion (JS only): with `matchMedia` forced to reduce, LED/wave start 0 intervals.
- 23-route overflow/error audit at 390 and 1280 px: 0 findings, 0 console errors.

**Not verified / assumptions**
- Native clipboard success; real touch/pointer-leave on charts; real keyboard-modality focus rings; CSS `prefers-reduced-motion` rules (only the JS paths were forced, the media query itself cannot be emulated here); safe-area/virtual keyboard on devices.
- The preview pane reports `document.hidden = true` and throttles rAF/transitions, so timing-dependent checks used state/inline styles rather than computed values.
- Builder / More / Product mock timeouts (status restarts, orb idle resets) are not cancelled on unmount; harmless in React 18 but untidy.

---
## Public site chrome: mega menu + mega footer (`src/site/Chrome.jsx`)
**Header (desktop):** Radix NavigationMenu, three mega panels (Products, Solutions, Developers) with two link columns, a feature card and a status/compare strip; hover-intent and skip-delay between panels, directional slide, height-animated shared viewport, Esc/Enter/Arrow keys. **Header (mobile):** toggle morphs menu/close, full-width panel with Collapsible accordion sections (one open at a time), sticky Log in / Get started, Esc closes and returns focus, page behind stops scrolling, closes on navigation and when resized to desktop.
**Footer:** CTA band (skipped on the home page, which has its own), brand + newsletter (inline validation) + status pill, five link columns, legal bar, and an oversized dot-matrix wordmark spanning the full width and cropped so only its top half shows (fading out at the bottom edge).
**Fixed on the way:** NavLink's className callback passed through Radix `Slot` is stringified (links rendered without active/hover colours); footer collapsed to 1 px inside the flex column (`shrink-0`).
**Verified:** 1280 px hover open + keyboard (Enter opens, ArrowRight moves, switching closes the previous, Esc closes and keeps focus on the trigger); 390 px accordion, navigation closes panel, Esc + focus return, scroll lock released; 11 site routes at 1280 and 9 at 390: no overflow, footer present, no console errors.
**Not verified:** touch interaction on a real device; the 768-1024 px range was only checked at 1034 px; menu links are mock (several point at the same page).

---
## Products pages polish
- Plan prices use `AnimatedPrice` (digit swap, settle pop, floating delta); the "billed monthly / $X billed yearly" line cross-fades in a reserved-height slot; "2 months free" slides in next to the switch.
- Plan cards: staggered rise-in (`.anim-rise`, `--i` delay), lift + border on hover, arrow reveals on the CTA; hovering a plan lights its compare-table column. Category cards: lift, arrow reveal, tag badge. Switching category re-runs the page-in.
- `BackLink` (ui.jsx) replaces the three text-arrow back buttons (Products, Admin product, Builder "Chat") with an icon that nudges on hover/press.
- Verified at 1280/390 px: prices 4.00 -> 3.20 etc. with deltas, billed line opacity swap, no arrow characters left in back buttons, no overflow, all rise animations end at opacity 1.
- Not verified: reduced-motion CSS for the new classes (added to the media rule, not emulated), real touch.

---
## Homepage microinteractions
- Scroll reveal: section headers (`Reveal`), bento and testimonial grids (`RevealGrid`, CSS-staggered), FAQ card; a throttled scroll check backs up IntersectionObserver so a fast scrollbar drag cannot leave content invisible (verified: jump-scroll through the page, 0 unrevealed).
- Stats numerals assemble when scrolled into view; labels fade in after them.
- FAQ opens with a real height animation (`anim-collapse`), hover/focus/press states, chevron colour; one open at a time.
- Tickers (deploy terminal x2, live metrics x2, builder teaser) now run only while on screen and the tab is visible; verified: 0 intervals at the footer, metrics + builder resume when scrolled to.
- Hero badge is a real button with hover; marquee pauses on hover, fades at the edges, and is off under reduced motion.
- Not verified: reduced-motion CSS (not emulable), real touch/scroll feel; preview pane throttles animations when hidden so timing was checked through state, not frame rates.

---
## Public site: app catalog + app page (`/site/apps`, `/site/apps/:id`)
Redesign of the staging catalog pages in the bm3 style (mock data in `src/site/appsData.js`, pages in `src/site/AppsPages.jsx`; nothing in blipmade-hosting was touched).
- **Catalog:** 24 mock apps in 4 categories, sticky filter bar with live counts, search (`/` focuses, Esc clears, clear button), grouped grids with staggered rise-in, "Coming soon" state, empty state with the waiting orb, "Running something else?" band. Header menu gets an "Apps" link; the Products feature card points here.
- **App page (Minecraft + all others):** edition cards (Paper/Forge/Vanilla/Bedrock/Folia, per-edition memory minimum, note cross-fades), size presets, memory/storage sliders, region select with latency, sticky order summary with `AnimatedPrice`, billing switch, line items, simulated deploy (loading -> toast), included list, FAQ with height animation, related apps; on phones the summary becomes a sticky bottom bar. Unknown id -> friendly not-found, "coming soon" apps get Notify me.
- **Verified:** 1280 px filters, search, empty state, `/`, Esc; edition switching and min memory (Forge 4, Vanilla 2, Folia 4); keyboard slider with real key presses (5 -> 8, focus kept); billing and deploy flow; 390 px: no overflow on 6 routes, no console errors.
- **Not verified:** real touch; reduced-motion CSS; tablet widths between 640 and 1024 only seen via the responsive grid classes.

## Mega menu motion pass
Open: clip-path reveal + soft rise instead of a pop; page behind dims (`.mega-dim`). Switching: shared viewport height eases over 340 ms while the old panel slides/fades out and the new one in (28 px, overlapping). Links inside a panel rise in one after another. Close: faster fade-up with a partial clip. Hover intent 110 ms, 450 ms grace between triggers. Verified through real pointer hovers: viewport `mega-in` on open, `to-start`/`from-end` motions on switch, `closed` state after leave, stagger delays 50/76/102/128 ms. Frame-by-frame smoothness not measured (the preview pane throttles animation when hidden).

## Mega menu v3: one shared panel, dot-matrix wave
The menu is now a single floating panel (Stripe-style) instead of full-width sheets: it sits under the active trigger with a notch, **glides** sideways and **resizes** (width and height ease over 360 ms) when you move to another menu while the content slides/fades inside it. The panel surface is a faint 14 px dot grid; on every open/switch a **ring of light travels across that grid** from the notch (`DotWash`, canvas, 640 ms, skipped for reduced motion), lighting the dots that are already there. Links still stagger in. Verified: notch/panel glide flag set only when switching (not on first open), canvas lit then cleared, content motions to-start/from-end, crossing the gap to the panel keeps it open, Esc closes all three menus, 4 site routes without overflow or console errors. Not verified: the look of the wave mid-flight (preview throttles animations; only sampled pixels), real trackpad feel.

## Footer in the same language as the header
Dot grid (16 px) behind the footer: the pointer lights it like a torch, a ring of light sweeps in from the lower left the first time the footer is seen, and another leaves the Subscribe button when it succeeds. Columns and the CTA band assemble with staggered rise-in; links get a growing underline and a small nudge; the status pill pings and reveals an arrow; a "Top" button scrolls the page up smoothly. Newsletter: invalid -> sending (button spinner) -> "Done" (check, green, field locked) -> resets after 2.6 s. The canvas idles when the footer is off screen or the tab is hidden and is static under reduced motion. Verified at 1280/390: spotlight visible under a real hover, subscribe flow states, Top scrolls to 0, 5 routes without overflow or console errors. Not verified: smoothness of the sweep frame by frame, touch.

## Footer wordmark, animated
The oversized BLIPMADE is now drawn on a canvas from the same dot glyphs (read from a hidden DotText svg): letters rise out of the bottom edge column by column when the footer is first seen, a soft band of light passes through every 9 s, and the pointer pushes dots apart while the nearest ones turn brand red (single-accent rule). Loop is idle until the footer has been seen and off-screen/hidden-tab; static under reduced motion. Verified: 129 dots drawn at 1280 and 390, red pixels present under a real hover, 3 routes without overflow or console errors. Not verified: how the rise/band look frame by frame.

Footer wordmark: pointer reaction (push + red) removed on request, it was too much. It keeps the rise-in and the passing light band.

## Homepage verification pass (found and fixed)
- **Header overflowed at 768 px** (six nav links + buttons did not fit; the whole site scrolled sideways by 42 px). The desktop header now starts at 1024 px; below it the hamburger panel is used. Re-checked 8 site routes at 768 and 4 at 1024: 0 overflow, no console errors.
- **"<40S" stat** rendered as "405": the dot font has no "<" glyph. Now "40S".
- **Reveal robustness:** the fallback scroll check used requestAnimationFrame, which does not run in background tabs; it is a timeout now. Reveal also starts slightly before an element enters the viewport (12% margin), so a fast scroll does not show an empty screen.
- Real scroll inputs at 1280 and 390 px through every homepage section (hero, bento, configurator, stats, testimonials, FAQ, footer): layout fine. Sliders change the price, FAQ opens one at a time, all CTAs present, no console errors.
- Still not verified: real touch, reduced-motion CSS, frame-by-frame smoothness.

## QA pass on /ds/components, /ds/patterns, /ds/product, /, /admin, /site, /ds/states
Method: overflow + console audit of all 7 routes at 1280, 768 and 390 px; a text-wrap detector (short labels that break onto two lines) at 800/1280/390; visual checks of every page; patterns table interactions (filter, search, empty, sort, pagination).
Found and fixed: BulkActionToolbar "3 selected" wrapping in narrow cards; server cards truncating names to "api-g..." (header now wraps, grid is auto-fill 230 px); "/ mo" price suffix wrapping under the dot price (Order, plans, apps, menu feature card); staff permission matrices squeezing names to 58 px on phones (narrower tick columns); admin "Recent orders" scrolling sideways on phones (customer folded under the order id, `className` on DataTable columns now applies to cells too); snapshot list kind badge hidden on phones; "blipmade-prod · live" label wrapping.
Result: 0 overflow and 0 console errors on all 7 routes at 1280/768/390.
Not verified: reduced-motion CSS, real touch, every Radix overlay re-opened in this pass (covered in earlier passes).

## Homepage: the header/footer language, without the cost
- **Dot torch on cards** (`.torch`): hero console window, all bento cards, the configurator and its price panel, testimonials, FAQ. A dot grid that exists only under the pointer, revealed through a radial CSS mask plus a faint spotlight. No canvas, no animation loop: one delegated `pointermove` listener (rAF-coalesced) writes `--mx/--my` on the card under the pointer. Disabled on touch (`hover: hover`) and for reduced motion.
- **Dot rules** between stats / testimonials / FAQ: a row of dots a ring of light crosses once when first seen (CSS only, 1.5 s, then nothing runs).
- Measured: 400 synthetic pointermoves cost 6.8 ms in total; 0 requestAnimationFrame calls while idle; 13 torch cards, 3 rules; 0 overflow and 0 console errors at 390 px.
- Not verified: how it feels frame by frame (preview throttles), real touch devices.

## 404 + the missing pieces (components)
- **404 scene** (`components/NotFound.jsx`): the zero of "404" is the assistant (selected orb style): it looks at the cursor, thinks on hover, laughs it off on click; dot-matrix 4s assemble, the requested path in a mono chip, Back / Go back, three real destinations per shell. Used by the public site, the client area (new catch-all route), the admin (unknown sections used to show the dashboard) and design-system routes. Shared `lib/useTorch.js`.
- **Charts** (`components/Charts.jsx`): `LineChart` (hairline grid, flat strokes, no gradient; draws in once; hover/touch-drag crosshair with tooltip; arrow keys, Home/End, Esc), `Sparkline`, `DotDonut` (ring of dots, legend and ring isolate segments together). Showcased in Components, section E.
- **Notification center** (`components/NotificationCenter.jsx`): the header bell is now a real popover (All / Unread with counts, mark read, dismiss with height collapse, mark all read, empty states with the orb, "View all"); a small external store keeps bell, popover and demo in sync; the bell rings when something arrives. Replaces the static demo.
- **Accordion** primitive in `ui.jsx` (single / multiple, animated height); the homepage and app-page FAQs now use it instead of two hand-written copies.
- Drawer and bottom sheet already existed (`DialogContent side`), so they were not rebuilt.
- **Verified:** 404 on all four shells (orb states, buttons, no overflow); chart hover, keyboard (End, Left, Left -> Oct), donut isolation; notification flows (3 unread -> read one -> dismiss -> mark all -> empty state -> bell clears; click item navigates and closes); accordion single/multiple; 12 routes + bell popover at 390 px: 0 overflow, 0 console errors.
- **Not verified:** frame-by-frame smoothness, real touch (chart touch-drag), reduced-motion CSS.

## Blips (the assistant orbs, renamed and rebuilt)
Product direction: Blipmade becomes agentic cloud hosting (AI for development, a website builder, game hosting with debugging); the assistant orbs are now **Blips**. Scope of this pass: the Blip only.
- **The Blip** (`components/blip.css`, new default): original construction, not one of the experiments: dark disc with a one-device-pixel rim and a soft top light; a faint dot grid that rises while it works (dot-matrix identity); a radar **ping** ring that leaves the disc (name origin; faster when busy, red and double on error); a red **signal** dot only while working (red = active, the single accent); a face whose eye width/height/gap are snapped to whole device pixels and placed from the centre. `--snap` = 1/devicePixelRatio, so it also holds under page zoom.
- **Roles:** `role="builder|dev|game"` adds a small chip (wand, code, gamepad) from 28 px; chat has none. Exports: `Blip`, `BlipX`, `BLIPS`, `useBlipId`, `ROLES` (the `Orb*` names still work).
- **Small sizes:** below 21 px no ping/dot grid/signal; below 33 px no glow; eyes never thinner than 2 device px; the whole face no longer floats (a moving face is never pixel-aligned).
- **Blip lab** (was Orb lab): stage (6 states x 4 roles, light/dark), pixel ladder 16-128 px, roles, in-context (chat, builder, dev crash, game-server debug), the 20 old constructions as optional **skins**, spec.
- **Verified:** measured eye geometry at 17 sizes (16 to 200 px) at dpr 1: every width/height/position is an integer and both eyes mirror the centre exactly (offset 0); looked at stage, ladder, roles, in-context and the 404; 8 routes at 390 px: 0 overflow, 0 console errors.
- **Not verified:** devicePixelRatio 2 or fractional zoom (formula is dpr-agnostic, not observed), frame-by-frame motion, touch.

## Email design (`/ds/emails`, `src/emails/`)
Eight emails in two families that share the identity (dot-matrix wordmark and headlines, hairlines, mono figures, one red accent) but not the layout:
- **System** (order confirmation, payment received, payment failed, service alert, new sign-in): quiet and exact. Left-aligned compact header, one card, key/value rows in mono, a receipt and a provisioning timeline, metric tiles with bars, no imagery beyond the wordmark, one primary action (+ one ghost), a service footer without unsubscribe.
- **Marketing** (product launch, monthly digest, upgrade offer): louder and editorial. Centred hero with a Blip image and a big dot headline, numbered feature rows, a quote, stats row, a changelog list with tags, usage bar and plan comparison, a dashed promo-code block, pill buttons, unsubscribe / preferences / postal-address footer.
- **Kit** (`kit.js`): table layout, inline styles, 600 px column, bulletproof buttons, hidden preheader, plain-text alternative, mobile stacking under 620 px; dark base, light via `prefers-color-scheme` (and a `.force-light` switch for the preview) with two dot-image copies (`.dk` / `.lt`). Images are tokens in the HTML (hosted PNGs in production); the preview draws the same dots as inline SVG and fills merge tags.
- **Email lab:** family + template picker, subject/preheader, Desktop/Mobile, Dark/Light, Preview/HTML/Text, copy HTML, a system-vs-marketing comparison and the technical rules.
- **Verified:** all 8 templates render in the preview with no unresolved tags and no broken images; dark and light swap backgrounds, text colour and the wordmark image; mobile width fits 375 px after fixing the 600 px table (added a `.wrap` rule); HTML and text views work; page has 0 overflow at 390 px; looked at order confirmation, payment failed, product launch (hero, features, quote) and upgrade offer.
- **Not verified:** real mail clients (Gmail, Outlook, Apple Mail), dark-mode inversion behaviour in those clients, image hosting; the Outlook button shape is table-based but not tested in Outlook.

## Blips v2: a cast of four characters (replaces the single-disc Blip)
Feedback: the previous Blip was one style with an icon changed per role. Now there are four different characters, taken from the best-made constructions so that no two share a colour, silhouette or temperament:
- **Pip** (chat): matte pearl. **Forge** (builder): faceted gem. **Byte** (dev): blue glass. **Glitch** (game): green gel. `CAST` in `components/orbs.jsx`; `<Orb role="builder" />` resolves to the character when the default selection ("cast") is active; picking a skin in the lab replaces all of them, "Back to the cast" restores.
- **BlipCast** (`components/BlipCast.jsx`, Muse-inspired): the four Blips in a row, pick one and the headline becomes its own ("Forge, the AI that builds your site") in dot-matrix type. The old words dissolve (blur + fade), the new ones assemble from loose dots, the inline avatar is the real character at 1:1, the role tile follows. Auto-rotates only while on screen, in a visible tab, and until the visitor chooses; arrow keys; adapts the type size to the width (verified at 390 px).
- **Pixel-snapped face for every character** (`snap.css`): eye width/height/gap in whole device pixels, placed from the centre, no face float. Measured earlier at 17 sizes: all integers, mirror offset 0 (dpr 1).
- The flagship dark-disc Blip was removed (`blip.css` deleted). The site builder now uses Forge; chat uses Pip.
- **Blip lab:** the cast, characters (states, light/dark, sizes), pixel ladder per character, in context (chat, builder, dev crash, game debug), the 20 other skins, spec.
- **Emails** now carry the cast: each system mail is signed by the relevant Blip (Pip for orders, payments, sign-ins; Byte for alerts and builds; Glitch for game servers), two new system mails (**Build failed** with Byte's fix, **Server crashed** with Glitch's diagnosis), the launch mail shows all four Blips and uses them as feature-row avatars, the digest has a note from Forge. Ten emails in total. Preview draws the four characters as SVG; production uses exported PNGs.
- **Verified:** cast hero interactions with a real click (Glitch), headline reassembles; all 10 emails x dark/light: no unresolved tags or broken images; 7 routes at 390 px: 0 overflow, 0 console errors.
- **Not verified:** real mail clients; devicePixelRatio 2; motion frame by frame. Known: the Mercury skin shows a square corner artifact at its top right (not part of the cast, not fixed).
