# Prompt for Antigravity: implement the Blip-told health checks in `blipmade-hosting`

Paste everything below the line into Antigravity, in the `trencito42/blipmade-hosting` workspace.

---

Implement the two health-check panels designed in `trencito42/bm3` for real: "Cannot connect?" on a VPS, told by Byte, and "Is the server lagging?" on a Minecraft instance, told by Glitch. This replaces the existing static checklist and the existing lag-measurement panel with the same idea, run against real data: the Blip runs the checks one at a time as a log, then gives one sentence of verdict and a next step. Match the design; the data and the actions must be real.

## Source of truth

- Repo `trencito42/bm3`, branch `main`, commit `80a7156` or later. Pull it first.
- The component: `src/studio/BlipCheck.jsx` — `BlipCheck` (the shared shell), `VpsCheck` (Byte, four steps: account active, machine running, load, SSH reachable from our network), `LagCheck` (Glitch, four steps: server answered, ticks per second with 1/5/15-minute history bars, memory, processor).
- Run it: `npm install && npm run dev`, port 5180. `#/ds/advanced` → "A check told by a Blip" shows both, each with a working/problem scenario switch and a "Run the check" button that plays the log. `src/studio/Vps.jsx` (server Overview tab) and `src/studio/Instance.jsx` (Game tab) show where each is mounted.
- bm3 is mock data and simulated timing. Port the design, the motion and the behaviour; never port the mock step results or the fixed 950 ms-per-line delay — run each step against the real check and show its real result the moment it answers.

## What exists today (from the screenshots that drove this design)

- A static checklist with four red checkmarks ("The server is active on your account", "The machine is running", "The load is normal", "SSH answers on our network") and a "Check again" button.
- A separate "Is the server lagging?" panel with a "Measure now" button, showing ticks/sec over 1/5/15 minutes, memory and CPU, and one line of plain-language verdict.

Find these in the repo (likely under `web/src/app/instance/` — `ConsoleTab`/`HelpPanel`/`UptimeTab` for the VPS checklist, `MinecraftTab` for the lag panel; confirm by searching for the strings above) and tell me their current file paths, what each step actually queries today (API endpoint, metrics source), and whether the four VPS checks and the four lag checks already exist as separate real checks I can wire up, or whether some need a new endpoint. Do not invent a check that doesn't exist; ask if a step's real data source is unclear.

## What changes

**Shared shell (`BlipCheck` in the design)**
- A Blip avatar (Byte for the VPS check, Glitch for the lag check) and a title. The button says "Run the check"; while running it shows a spinner and the heading cross-fades to "<step>…" for whichever step is in flight.
- The steps render as a log: each one appears, shows a brief "doing…" label while its own request is in flight, then settles into its row (icon, label, detail text, optional small history bars, a right-aligned value) once that request answers. Run steps one after another, each starting only once the previous one has resolved — real time, not a fixed per-line delay. If a step's check depends on an earlier one having succeeded (e.g. don't bother pinging SSH if the machine isn't even running), skip it and mark it "skipped", not run it anyway.
- Icons/tone: green check for fine, amber triangle for "worth a look", red X only for an actual failure. Never red for success — the current live page uses red for a passing check, which is backwards and must be fixed.
- After the last step, one footer line in the Blip's voice: a plain-language verdict synthesized from which steps failed or warned (use the `say` strings in `VPS_RUNS`/`MC_RUNS` in bm3 as the tone and content to match, but generate the real sentence from the real results — e.g. if only SSH failed, say that specifically; if everything passed, say connection trouble is likely on the visitor's end and name the concrete things to check, as bm3's `ok` case does). Below it, 1–3 buttons for the next step (open console, check firewall, open a support ticket, apply a suggested fix, raise memory, watch for an hour) — only the ones that make sense for what was actually found, wired to the real actions (navigate to the console tab, open the firewall tab, open a new ticket pre-filled with the check's findings, etc.).
- "Check again" / "Run the check" re-runs every step for real.
- Respects `prefers-reduced-motion` (skip the step-by-step reveal, show the finished log immediately on completion).

**VPS check (Byte) — four real checks**
1. Server is active on the account and its subscription is in order.
2. The underlying machine/VM is actually running (ask the host/hypervisor, not just our DB state), with real uptime.
3. Load: real CPU and memory usage right now; mark "normal" vs. a tone of concern at whatever thresholds the team already uses elsewhere (reuse them; don't invent new ones).
4. SSH reachable from our side: an actual TCP/SSH-banner probe from our network to the server's real address and port, with real latency or a real timeout/error. Must run from our infrastructure, not from the visitor's browser.

**Lag check (Glitch) — four real checks**
1. The running game server answers (RCON or whatever the panel already uses to query a live Minecraft server) — real edition/version and real player count.
2. Real ticks-per-second, with real 1/5/15-minute history if the server already tracks it (if it doesn't, say so and propose the smallest addition that gets it, rather than faking history).
3. Real memory used of real allocated memory.
4. Real CPU.

Where "is this a Minecraft/game instance" or "is this a VPS" already route to different detail pages, mount `VpsCheck`'s equivalent on the VPS overview tab and `LagCheck`'s equivalent on the Minecraft/game tab, same placement as in bm3 (`Vps.jsx` overview, `Instance.jsx` game tab).

## Rules

- Reuse existing components/primitives from the bm3 port already in this repo; do not add a new UI library. If a primitive BlipCheck needs (the stepped reveal, the dot-matrix-style decode-in text, the Blip avatar states) isn't ported yet, port it rather than approximating with something else.
- All four checks run server-side (or via existing authenticated endpoints) — never expose raw infrastructure probing to the browser, never let the visitor's own network conditions be reported as "our" SSH check.
- No new false claims: every number and every "fine/not fine" must come from a real measurement. If a metric isn't available yet, mark that step as unavailable rather than guessing or hardcoding a placeholder.
- Don't change unrelated behavior of the instance/VPS detail pages. Keep existing tests green; update any test asserting the old red-checkmark markup or the old "Measure now" panel.
- TypeScript, existing lint setup, small commits, one panel per commit. Staging first. **Do not deploy to production until told to.**

## How to report

For each of the two checks: which real endpoint/metric backs each step (or what's missing and your proposed fix), a screenshot of the running log and the finished state side by side with bm3's `#/ds/advanced` reference, and what you tested by hand — a passing run, and a run against a server you deliberately broke or stopped, to confirm the failure/warning paths and the verdict sentence actually reflect reality.
