# Prompt for Claude: implement the redesigned list pages 1:1 in `blipmade-hosting`

Paste everything below the line into Claude, in the `trencito42/blipmade-hosting` workspace.

---

Implement the redesigned **Apps & databases**, **Servers** and **Domains** pages of the customer app exactly as designed in `trencito42/bm3`. This is a port of a finished design, not a redesign: match it 1:1 on desktop and on phones. Keep every existing API call, route and behaviour; only the presentation changes.

## Source of truth

- Repo `trencito42/bm3`, branch `main`, commit `268f309` or later. Pull it first.
- The design: `src/studio/Lists.jsx` (`InstancesList`, `ServersList`, `DomainsList` and their shared pieces: `Summary`, `Toolbar`, `Chips`, `Sheet`, `SheetItem`, `Actions`, `Group`, `Status`, `Tile`, `Meter`, `NoMatch`, `Failed`, `usePower`).
- Shell changes that belong to it: `src/App.jsx` (`SHELL_ACTION`, the chat button in the bar on phones), `src/chat/ChatWidget.jsx` (floating launcher hidden on phones inside the app), `src/index.css` (`.list-sheet`, `.no-bar`), `src/components/pageSkeletons.jsx` (`SumLine`, `ListRows`, `Apps`, `Vps`, `Domains`).
- Run it: `npm install && npm run dev`, port 5180. Open `#/ds/lists`: each page is in a frame with a Phone / Desktop switch and its states. The table "What changed and why" on that page is the checklist. Direct routes: `#/apps`, `#/vps`, `#/domains`, with `?s=empty`, `?s=loading`, `?s=error` (and `?s=one` for servers).
- bm3 is mock data. Port the layout, the components, the states and the motion. Never port the mock rows or the simulated timers.

## Where it goes

| Design | Production |
|---|---|
| `InstancesList` | `/app/instances` (`web/src/app/Instances.tsx` and what it renders) |
| `ServersList` | `/app/vps` (`VpsList` in `web/src/app/Vps.tsx`) |
| `DomainsList` | `/app/domains` (`web/src/app/Domains.tsx`) |
| `SHELL_ACTION` | `contextAction` / `ShellAction` in `web/src/routes.tsx` (it already exists: keep it as the only primary action) |
| chat button in the bar on phones | the customer shell (`CustomerBm3Chrome`) and `web/src/app/ChatWidget.tsx` |

Before you write code, read those files and tell me in a short table what each page fetches today and which field feeds which part of the new row. If the design shows something the API does not return (live CPU and RAM per instance, uptime, DNS state of a domain), say so and ask; do not invent it and do not fake it.

## What "1:1" means here

**All three pages**
- No page title: the shell bar already has it. The page opens with the summary line (counts, what needs attention in amber, monthly total on the right).
- One primary action, in the shell bar (icon-only plus on phones). Remove the page-level "Deploy" / "New VPS" buttons and the "…" button next to them. "Access code" becomes the quiet line under the list and a link in the empty state.
- Toolbar: search, one row of chips with counts, one sort control. On phones the chips scroll sideways with no scrollbar and sort opens a bottom sheet. Remove the three dropdowns.
- Red is only for live or broken. Addresses are quiet mono text. Prices are small mono numerals, right-aligned. No dot-matrix prices in rows.
- Row menu: a dropdown from `md` up, a bottom sheet with 48 px rows below it. Same items in both.
- Four states each: content, empty (Blip, dot-matrix word, next step), loading (the page-shaped skeleton), error ("your things are fine, this page cannot show them").

**Apps & databases**
- Row order: tile with status dot, name and kind · address with copy on hover · CPU and RAM meters (from `lg`) · status and size · price · Restart (or a visible Start when stopped) · menu.
- A "Needs you" group on top for stopped and failed instances, then "Running".
- Phone row: three lines (name + status, kind + size, address + price), whole row opens the instance, 44 px menu button.

**Servers**
- A card per server, not a table: name, plan, system, region, status, Console and Restart (or Start), the full SSH command in a copy field (never truncated), CPU / RAM / disk, size, uptime, price. On phones the two buttons are full width at the bottom of the card.
- A dashed "Add a server" tile under the cards.

**Domains**
- First block: "Connect a domain" (one field, one button), with the "Search and register" link under it.
- Rows: domain, what it points to, DNS and HTTPS state, renewal with the auto-renew switch for domains registered with us. A domain waiting for DNS is expanded by default and shows the record to add (three copy fields) and "Check now". An expiring one gets its own line with "Turn on auto-renew" on phones.

**Shell on phones**
- The floating chat launcher is hidden inside the app; chat opens from a button in the bar. Nothing floats over the rows.
- Inputs are 16 px so the browser does not zoom. The toolbar sticks under the bar while scrolling. Lists leave room for the bottom navigation.

## Rules

- Reuse the components the repo already has (the bm3 port under `web/src/bm3-port`, `ui-app`, icons, router). Do not add a UI library or a second styling system. If a bm3 primitive is missing in the port, port that primitive, do not approximate it.
- TypeScript, existing lint and test setup. Keep tests green; update the ones that assert the old markup.
- Do not change API contracts, auth, billing or provisioning. Power actions call the existing endpoints; show the in-between state ("restarting") from the real response, not from a timer.
- Accessibility: every control reachable by keyboard, visible focus, the menu and the sheet close with Esc and return focus, `aria-pressed` on chips, `aria-label` on icon buttons, respects `prefers-reduced-motion`.
- No horizontal scroll at 320, 390, 768, 1024, 1280, 1440 and 1920 px.
- Work on a branch, small commits, one page per commit. Deploy to staging first. **Do not deploy to production until I say so.**

## How to report

For each page: a screenshot of bm3 and of your result side by side at 390 px and at 1440 px, the list of fields you could not fill from the API, and what you verified by hand (menu, sheet, search, chips, sort, Restart, copy, each of the four states). Do not tell me it matches unless you opened both and compared them.
