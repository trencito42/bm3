# Prompt for Antigravity: Blipmade homepage — design research & art direction, rooted in Petal

Paste everything below the line into Antigravity. This is a research and creative-direction task. **Do not write code, change any repository, or deploy anything.**

---

## Before Phase 1: which design system is the base

Three design references exist and must not be confused with each other:

1. **Petal** (sometimes called "Păun Panel" in its own files) — a flat, calm, Apple-like admin design system: no borders, no shadows, no gradients, hierarchy built only from background-color steps, confident heavy type, pill/rounded-rect controls, one user-selectable accent, light and dark as equal citizens. This is the design language the owner wants the Blipmade **homepage** to be rooted in.
2. **BM3** — the design system currently implemented in the authenticated, dark, dot-matrix, Blip-character style that lives in the `blipmade-hosting` repo today (customer app, admin, and the current public site).
3. **Graphical's homepage** and its **Alloy theme** — external references for composition, kinetic typography, motion craft and component polish (used in the original brief).

**Your job changes as follows: treat Petal as the primary existing design language to extend for the new homepage, not BM3.** Read Petal's specification first:

- `petal-design/PROMPT-design-system.md` — the full token set (color light/dark, type scale, radius, spacing, motion easing/durations, icon rules), the five laws (no borders, no shadows, no gradients, color-block hierarchy, light/dark parity), and the component inventory.
- `petal-design/DESIGN-BRIEF-hosting-panel.md` — the same system written as a brief for building a **hosting control panel** in this exact visual language. Read this closely: it is the closest thing that already exists to "Petal applied to a hosting product."
- `petal-design/landing/petal-landing.html` (and `petal-design/landing/body.html`, `style.css`, `app.js` if present) — an existing landing page already built in the Petal visual language. Open and screenshot it the same way you'll screenshot Graphical: above-the-fold composition, scroll behavior, motion, mobile adaptation. This is your closest first-party precedent for "Petal as a marketing page," not just an admin panel.
- `petal-design/paun-panel.html` (or `petal-design/out.html` if that's the current build) — the full component gallery, as the single source of truth for every control's states (default/hover/focus/active/disabled/loading/error/empty, light/dark, phone width). Render it in a browser; don't just read the HTML.

Still read the BM3 files from the original brief (`AGENTS.md`, `docs/CURRENT_STATE.md`, `docs/AI-OPERATING-RULES.md`, `web/src/site/Home.tsx`, `web/src/site/content.ts`/`siteContent.ts`, `web/src/site/catalog.ts`, the current site `ui.tsx` equivalent, `docs/design/homepage-2026/DIRECTION.md` if it exists) — but read them for two narrower reasons, not as the design base:
- to understand what the homepage must actually say and sell (real products, real routes, real pricing/configurator logic, real copy constraints) — this part of the original brief is unchanged;
- to understand what currently exists so you can name, explicitly, every place where a Petal-based public homepage would visually diverge from the authenticated BM3 app the visitor lands in right after signing up (color temperature, light-vs-dark default, type family, iconography, motion language, the Blip characters). **This divergence is a real risk and must be addressed, not ignored.** In Phase 3 and Phase 6 (below) you must explicitly evaluate and recommend one of: (a) a full brand unification toward Petal, with a migration note for BM3, (b) a deliberate two-layer brand (Petal-calm marketing shell around a BM3-flavored product, with a short, explicit "why this is intentional and where the seam is" explanation and a transition moment designed for the first post-signup screen), or (c) carrying a restrained, specific piece of BM3's identity (e.g. the dot-matrix wordmark treatment only, or the Blip mascot only in small, infrequent moments) into an otherwise Petal page. Do not default to keeping BM3's dark dot-matrix sci-fi identity for the homepage — the owner's direction is toward Petal's quieter, flatter, more confident language; treat that as the premise to design from, not one option among equals.

If any Petal file listed above is missing from the repo you're given, say so explicitly and ask for it rather than guessing at its tokens from this prompt's paraphrase — the exact hex values, scale and component inventory live in those two markdown files and must be read in full, not approximated.

Everything else below is the original brief, unchanged except where it said "BM3" as the thing to preserve — read those spots as "Petal, checked against what BM3/the live site can realistically absorb without breaking the authenticated product."

---

## YOUR ROLE

Act as a world-class Creative Director, Digital Product Designer, Motion Designer, UX Strategist, Conversion Designer and Frontend Art Director.

You are researching and designing the next visual direction for Blipmade, a modern cloud hosting platform.

This is NOT a request to generate another generic SaaS landing page.

Your goal is to research outstanding visual design references, deeply understand Blipmade's actual products, and create a complete, implementation-ready creative direction for Claude Sonnet.

DO NOT IMPLEMENT CODE YET. THIS IS A RESEARCH, CREATIVE DIRECTION AND DESIGN SPECIFICATION TASK.

Produce your explanations in Romanian, but the proposed website copy should be in natural, polished English.

## PHASE 1 — RESEARCH THE VISUAL REFERENCES

### Reference A: Petal (your primary base — see "Before Phase 1" above)

Render `petal-design/landing/petal-landing.html` and `petal-design/paun-panel.html` in a real browser with screenshots and interaction testing. Study:

- The five laws in practice: where color-block hierarchy alone (no borders, no shadows) actually creates clear separation, and where it strains on a marketing page that needs more visual drama than an admin panel.
- Typography at display sizes (the 32–40px, weight 800, −0.04em scale was specified for app headings; a homepage hero will push larger — figure out, by looking at `petal-landing.html`, how far this type system already stretches, and how far it can stretch before it needs new rules).
- The accent-color system, pill/rounded-rect controls, motion easing (`cubic-bezier(.2,.8,.2,1)`, 200–450ms enters, 150ms hover/press, `scale(.97)` pressed) — and how/whether `petal-landing.html` already uses bigger, slower, more cinematic motion for a marketing context versus the admin panel's snappier interaction motion.
- Light vs. dark: Petal treats both as equal citizens. Decide, from what you see, whether the Blipmade homepage should default to light, dark, or follow system preference, and why.

### Reference B: Graphical homepage

https://www.graphicalui.com/

Analyze the actual rendered website, not only its HTML or marketing descriptions. Use a real browser with screenshots and interaction testing when possible. Study the complete homepage:

- Above-the-fold composition and navigation.
- Typography, proportions, line breaks and optical alignment.
- Layout grids, vertical spacing and visual rhythm.
- Color distribution and surface hierarchy.
- Overlapping, floating and rotated component compositions.
- Kinetic typography and changing inline words/icons.
- Scroll-triggered effects and reveal sequences.
- Hover, press, focus and transition behaviors.
- Component entrances, exits and choreography.
- Background treatment, depth and layering.
- Mobile adaptations.
- Footer and closing sections.

Study HOW the page communicates quality through pacing, restraint and visual hierarchy. Distinguish actual observed behavior from assumptions. Record screenshots at important scroll positions and during meaningful interactions. For animations, capture before, during and after states rather than relying on a single screenshot.

### Reference C: Graphical Alloy theme

https://www.graphicalui.com/marketing/preview?theme=alloy&tab=components

Important: this refers to the Alloy theme inside Graphical, NOT the unrelated Alloy AI prototyping product. The owner particularly likes this theme.

Inspect both light and dark examples, if available. Analyze:

- Typography and font character.
- Font sizes, weights, tracking and line heights.
- Background, surface and border colors.
- Contrast relationships.
- Spacing scale.
- Corner radii and component geometry.
- Button styling and interactive states.
- Dropdowns, menus, tooltips and dialogs.
- Inputs, selects, tabs and navigation.
- Cards, data displays, icons and badges.
- Hover, focus, pressed, disabled and loading states.
- Motion language, easing and timing.
- Visual density and alignment.

Extract a reusable design language, not just a list of CSS values. Do not invent exact hex colors, dimensions, fonts or transitions without visual or code evidence. If exact values are unavailable, provide clearly labeled visual estimates.

**Cross-reference Alloy against Petal explicitly**: Alloy uses borders/shadows in places Petal's laws forbid. Every time you'd borrow an Alloy pattern, state whether it survives translation into Petal's border-less, shadow-less, color-block system, and how.

### Reference D: Current Blipmade

https://blipmade.com/

Repository: https://github.com/trencito42/blipmade-hosting

Read the actual current implementation. Start with:

- `AGENTS.md`
- `docs/CURRENT_STATE.md`
- `docs/AI-OPERATING-RULES.md`
- `web/src/site/Home.tsx`
- `web/src/site/content.ts`
- `web/src/site/siteContent.ts`
- `web/src/site/catalog.ts`
- `web/src/site/ui.tsx` or the current equivalent
- `docs/design/homepage-2026/DIRECTION.md`, if it exists
- Relevant BM3 design components and tokens

Check the latest Git HEAD first. The project has an established BM3 design language in its authenticated app — read it to know what exists and what the homepage will hand visitors into, per the divergence question raised in "Before Phase 1." Check the actual deployed website alongside the repository. If the repository is private and inaccessible, report the limitation explicitly and identify the minimum files needed. Do not pretend to have inspected private code.

## PHASE 2 — LEARN THE BUSINESS

Blipmade is not simply a VPS seller. It is a unified hosting platform for multiple workloads, including supported applications, game servers, Discord bots, databases, VPS, email hosting and deployment tools.

Discover the real product architecture and commercial positioning. Investigate:

1. What products are currently available and genuinely orderable?
2. Who are the primary customer segments?
3. What problems does Blipmade solve?
4. What differentiates the platform from generic game hosting and VPS providers?
5. What does the actual deployment journey look like?
6. What can customers genuinely manage in the dashboard?
7. Which product capabilities would be most impressive to demonstrate visually?
8. What creates trust for a new hosting brand?
9. What objections could stop a visitor from purchasing?
10. How should Blipmade position itself without inventing enterprise-level capabilities?

Inspect actual catalog data, routes, pricing sources, documentation and product readiness. Do not invent SLA figures, uptime statistics, customer counts, worldwide locations, reviews, performance benchmarks, data-center locations or unavailable features. Never show fake prices or market unavailable products as available. Identify which elements should use live catalog data rather than hardcoded content. Understand the existing pricing/configurator model before proposing a redesigned version. Study relevant competitors for positioning and usability, but do not copy their designs.

## PHASE 3 — DEVELOP THREE DISTINCT CREATIVE DIRECTIONS

Create three premium visual directions, **each one rooted in Petal's visual language** (flat, no borders/shadows/gradients, color-block hierarchy, confident heavy type, pill/rounded-rect controls, one accent, light/dark parity), each blending in what earns its place from Graphical's composition and Alloy's polish, while remaining recognizably Blipmade. Do not limit yourself to labels like "Editorial Minimalism", "Kinetic Typography" or "Spatial UI Collage." Consider the entire visual system:

- Composition.
- Art direction.
- Information hierarchy.
- Interaction philosophy.
- Storytelling.
- Brand personality.
- Visual rhythm.
- Product demonstrations.
- Motion.
- Responsive layouts.
- Commercial clarity.

For each direction explain:

- Central visual concept.
- Why it fits Blipmade's audience.
- Relationship to Petal's five laws and token system (what it uses as-is, what it stretches, what it would need to add and why that addition doesn't break the laws).
- Relationship to Graphical's homepage.
- Relationship to Graphical's Alloy theme.
- Its answer to the Petal/BM3 divergence question from "Before Phase 1" (full unification, two-layer brand, or restrained BM3 accents — pick one per direction and justify it).
- What the homepage hero would look like.
- What the rest of the homepage would look like.
- How navigation and CTAs behave.
- Where motion adds meaning.
- Risks and compromises.

Give each direction a distinct name. Score the three directions against brand recognition, distinctiveness, usability, conversion clarity, accessibility, motion performance and implementation complexity. Recommend ONE direction and explain the trade-offs. Do not automatically choose the most animated direction, and do not automatically choose the direction that most resembles BM3 out of habit — the recommendation should win on the merits against the scoring criteria, with Petal as the default visual home unless a direction makes an explicit, well-argued case to diverge from it.

## PHASE 4 — DESIGN THE ENTIRE HOMEPAGE EXPERIENCE

Create a section-by-section homepage blueprint based on the selected creative direction. For every section, provide:

1. Section objective.
2. Intended audience.
3. Exact English copy.
4. Heading and supporting text.
5. CTAs and destinations.
6. Desktop composition.
7. Mobile composition.
8. Visual assets or real product UI needed.
9. Animation and interaction behavior.
10. Performance and accessibility considerations.
11. Why this section deserves its place.

Consider, but do not blindly include:

**A. Navigation** — A refined navigation that balances brand identity, product discovery, pricing, documentation, account access and deployment. Analyze whether sticky positioning, compact transforms and dropdown interactions improve the experience.

**B. Hero** — A visually exceptional opening that communicates Blipmade's purpose immediately. Explore kinetic typography, spatial product compositions, a carefully controlled intro sequence and a meaningful primary action. The visitor must understand what Blipmade does without waiting for an animation.

**C. Product discovery** — A compelling way to explore supported apps, games, databases, VPS and email. Avoid a dull, repetitive card grid. Consider adaptive layouts, product spotlights, editorial compositions and meaningful interaction.

**D. Deployment experience** — Show the real process of configuring and deploying an application. Use actual Blipmade interactions where possible. This can be a more powerful selling point than abstract illustrations.

**E. Control panel showcase** — Present real dashboard screens, including useful examples of service management. Consider console, files, databases, resource configuration and domains, but only if those functions are genuinely available. Use real product UI rather than fictional dashboards. If the recommended direction treats the marketing site and the authenticated app as visually distinct (per the Phase 3 divergence answer), design this showcase as the deliberate bridge between the two: it is where a Petal-calm visitor first sees the BM3-flavored product, so stage that transition on purpose rather than let it be a jump cut.

**F. Pricing** — Present the real pricing logic. Make the pricing model understandable without overwhelming the visitor. Preserve links to the correct commercial system.

**G. Trust and transparency** — Propose trustworthy content appropriate for a young hosting platform. No fictional testimonials, fake statistics or unsupported guarantees.

**H. Closing sequence** — Design a strong final CTA and footer, consistent with the visual narrative.

Remove redundant marketing sections. A smaller number of exceptionally designed sections is preferable to a long, generic homepage.

## PHASE 5 — MOTION & MICROINTERACTION SYSTEM

This is a major priority. Create a complete motion specification, not vague statements such as "add smooth animations." Start from Petal's motion tokens (`cubic-bezier(.2,.8,.2,1)`, 200–450ms enters, 150ms hover/press, `scale(.97)` pressed, no bounce, no parallax) and extend them only where a marketing hero genuinely needs more — name every extension explicitly rather than quietly drifting from the base system.

Explore:

**Typography**
- Word and phrase transitions.
- Inline icon changes.
- Masked text reveals.
- Line and character entrances.
- Dynamic text without layout shifts.

**Spatial composition**
- Overlapping interface cards.
- Perspective and depth.
- Rotated arrangements.
- Controlled entrance choreography.
- Scroll-linked transformations.
- Stable layering and clipping.

**Controls**
- Button hover and press.
- Focus-visible.
- Tabs and segmented controls.
- Menus and dropdowns.
- Cards and product selectors.
- Tooltips.
- Navigation transitions.

**Product demonstrations**
- Interactive product preview.
- Configurator changes.
- Real pricing updates.
- Terminal/product UI presentation.
- Meaningful loading and transitions.

**Scrolling**
- Section reveals.
- Scroll progress.
- Sticky scenes where justified.
- Parallax only when useful.
- Transition between product sections.
- Mobile-specific alternatives.

For every major animation specify:

- Trigger.
- Initial state.
- Intermediate state.
- Final state.
- Duration range in milliseconds.
- Easing or spring parameters.
- Delay/stagger.
- Whether it runs once or repeats.
- What happens on rapid interaction.
- Reduced-motion fallback.
- Mobile behavior.
- Performance implications.

Favor compositor-friendly transforms and opacity. Avoid excessive animation libraries, layout thrashing, layout shifts, permanent GPU-heavy effects and decorative motion with no purpose. Motion should feel carefully directed and expensive, without making the site slow, and should read as a natural extension of Petal's calm motion language, not a different personality bolted on for the marketing pages.

## PHASE 6 — EXTEND THE ART DIRECTION BEYOND THE HOMEPAGE

Although the homepage is the primary task, identify where this creative direction could naturally extend to:

- `/apps`
- Product detail pages
- VPS storefront
- Email storefront
- Documentation landing page
- Changelog
- Public authentication and registration
- Onboarding

Do not redesign these pages now. Instead, define which visual primitives, navigation patterns, motion behaviors and typography treatments should be shared. For onboarding specifically: this is where your Phase 3 answer to the Petal/BM3 divergence question becomes concrete — describe, at least in outline, what the first authenticated screen should feel like coming from a Petal-rooted homepage, so the handoff is designed rather than accidental. Keep the authenticated BM3 application functionally coherent. Do not propose a careless global redesign that breaks operational interfaces — if full unification toward Petal is your Phase 3 recommendation, say explicitly that it is a separate, larger migration and scope it only at the level of "what would need to change and roughly how big is that," not as something this task implements.

## PHASE 7 — IMPLEMENTATION HANDOFF FOR CLAUDE SONNET

Produce a precise implementation specification for Claude Sonnet. Include:

**Design foundation**
- Color palette, with confidence levels — base it on Petal's exact token values (read from `PROMPT-design-system.md`/`DESIGN-BRIEF-hosting-panel.md`, both light and dark sets) and mark explicitly any new value the homepage needs that Petal doesn't already define (e.g. a hero-specific tint), with a rationale and a note that it should be added back into Petal's token set, not left as a one-off.
- Typography hierarchy, starting from Petal's type scale, extended upward for hero/display sizes as needed.
- Existing font integration — Petal currently specifies `-apple-system/SF Pro Display/Inter Tight/Helvetica Neue` plus `JetBrains Mono`, loaded with a system fallback. **IMPORTANT: verify what Blipmade's live site and repo actually load today** before deciding — a prior note says Blipmade has recently used "Allo" variable typography and "TT Interphases Pro Mono"; check the current `HEAD` of `blipmade-hosting` for the real, currently-shipping font stack, reconcile it explicitly against Petal's specified stack, and recommend one (switching the homepage to Petal's fonts is the default expectation unless there's a licensing or already-paid-for-asset reason not to — state which it is).
- Spacing and layout grid — Petal's 4-based spacing scale and gutters (28 desktop / 16 phone), adapted for a longer-scrolling marketing page.
- Surface treatment — color-block steps only (`--bg`/`--s1`/`--s2`/`--s3`/`--s4`), no shadows, no borders; say explicitly how a hero or product-showcase section achieves visual drama without either.
- Border and radius system — Petal's radius scale (10/14/18/24/28/99).
- Button and navigation variants — from Petal's inventory (solid ink, accent, secondary, tint, ghost, semantic), adapted for marketing CTAs.
- Motion tokens — from Phase 5.
- Responsive breakpoints.

**Component plan**

List every new component or composition required. For each component explain its responsibilities, props/data dependencies, states, responsive behavior and animation requirements. Favor reusable primitives from Petal's existing component inventory (`petal-design/PROMPT-design-system.md` §3) over duplicated implementations; name, for each new homepage component, the closest existing Petal component it extends or composes.

**Architecture**

Map the proposed homepage sections onto the actual React/Vite application in `blipmade-hosting`. Identify existing code that can be reused. Preserve catalog API calls, prices, authentication, routing, accessibility, SEO, SSR/prerendering, structured data and current application behavior.

**Responsive requirements**

Design and verify at:

- 320px
- 390px
- 768px
- 1440px
- 1920px

Mobile must be intentionally composed, not merely a scaled-down desktop layout. Avoid horizontal document overflow and oversized animations. Respect `prefers-reduced-motion`, keyboard access, touch interactions and reasonable performance budgets.

**QA**

Specify exact screenshot states and interaction tests. Include desktop/mobile visual comparison, loading behavior, navigation, reduced motion, CLS and performance validation. Clearly distinguish visual approval from technical build success.

## REQUIRED OUTPUT FORMAT

Deliver:

1. Reference Analysis: Petal (landing page + component gallery), Graphical homepage and Alloy theme, with visual evidence.
2. Blipmade Business & Audience Analysis: real products, positioning and customer needs.
3. Three Creative Directions, each rooted in Petal: compared and scored, each with an explicit answer to the Petal/BM3 divergence question.
4. Selected Direction: detailed rationale and design principles.
5. Homepage Creative Blueprint: every section, exact copy and layout.
6. Motion & Microinteraction Specification: implementation-level details.
7. Design Token & Component Specification: Petal's tokens and inventory as the base, with every extension named and justified.
8. Secondary Page Recommendations: where the system should extend, and the onboarding hand-off sketch.
9. Claude Sonnet Implementation Brief: self-contained, precise, production-oriented.
10. Missing Evidence / Unverified Assumptions: explicit limitations.

Provide a concise recommended homepage section order, plus a complete detailed specification. Attach screenshots, annotated references, a storyboard or a visual moodboard where your tools allow.

Do not merely restate what Petal, Graphical or Blipmade currently looks like. Your job is to make strong design decisions appropriate for Blipmade's actual business, with Petal as the visual home you are designing from.

## FINAL GOAL

Create a homepage with the art-direction quality, confidence, restraint and motion craft of exceptional independent design studios, in Blipmade's own voice but speaking Petal's calm, flat, color-block visual language — not a continuation of BM3's dark dot-matrix identity by default. It must look distinctive, feel alive, explain the product clearly and make it easy for a visitor to begin deploying.

This research will be handed directly to Claude Sonnet for implementation. Do not write code, change the repository or deploy anything during this research phase.
