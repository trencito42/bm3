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
