# bm3 — Blipmade design system & UI showcase

Design-only workspace for the Blipmade hosting platform. Everything is **simulated with local mock data**; nothing here talks to a backend or touches production.

## Run

```bash
npm install
npm run dev      # http://localhost:5180/  (hash routes)
npm run build
```

## What is in here

- `src/` — React + Vite + Tailwind v4 + Radix UI + cmdk + sonner.
  - **Workspace top bar** with 8 sections: Foundations · Components · Patterns · Product · Customer app · Admin · Public site · States & mobile (`#/ds/*`, `#/`, `#/admin/*`, `#/site/*`).
  - `components/` — primitives (`ui.jsx`, `ui2.jsx`, `ui3.jsx`), dot-matrix viz (`DotViz.jsx`), hosting product components (`product.jsx`), layout models (`layouts.jsx`: ResizablePanel, ScrollContainer, DetailLayout).
  - `pages/` — customer app (overview, deploy, apps, VPS, domains + DNS, email/webmail, billing, support + live chat, notifications, account) and the AI **Site builder**.
  - `admin/` — admin shell with 24 sections (dashboard, customers + inspector, orders, products + editor, support console, infrastructure, incidents, operations, staff, audit, and data-driven list pages).
  - `site/` — public marketing site (home, products, auth, docs, status, legal, 404).
  - `lib/mock.js`, `lib/store.jsx` — deterministic mock data.
- `prototypes/` — earlier standalone HTML prototypes (chat concepts, billing panel, Klinch replica) that share `blip-fx.*` and `blip-ui.*`. Serve the folder over HTTP to open them.
- `PROGRESS.md` — coverage, known gaps and QA notes.

## Design language

Near-black surfaces (`#0d0d0f` / `#141416`), hairline borders, Inter + Geist Mono, dot-matrix type for the logo, hero headings and key numerals, one red accent used only for active state, an orb for assistant moments.

> Status: design workspace, not a production implementation.
