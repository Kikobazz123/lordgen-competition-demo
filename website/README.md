# LordGen AI — Interactive Demo Website

A single page with no build step and no framework — plain HTML, CSS and vanilla JS —
demonstrating that LordGen AI's workflow adapts across businesses without being rebuilt.

It is **not** backendless, despite what this line used to claim: the Business Diagnostic
calls Vercel serverless functions in `api/`, which call live n8n workflows. The page still
opens and renders straight off disk via `file://`; only the diagnostic needs the server.

## Run it

Just open `index.html` in a browser — no server required. If you'd rather serve it (e.g. for a cleaner URL during the live demo):

```
python -m http.server 8000 --directory website
```

then open `$BASE_URL` (default documented in the root `.env.example`).

## What this is (and isn't)

**Updated 2026-09-30 — the text this replaces was stale and said the opposite.**

The Business Diagnostic on this page is **live**. It calls real, running n8n workflows
through the Vercel serverless functions in `api/`: live web research on whatever business
name is entered, an AI-generated set of findings, a real proposal email to a real address,
and a human approval gate before anything consequential happens. Nothing on the page is
simulated, and the footer says as much.

The earlier description here — three hard-coded presets, rule-based JavaScript, "no network
calls, no API keys, and nothing is actually sent anywhere" — described a retired design.
That client-side simulation was replaced when the live chain was wired up. `app.js` now
holds the live flow; `docs/architecture.md` records the change.

**Categories** (`CATEGORIES` in `app.js`): Eatery / Restaurant, Law Firm, Salon & Beauty,
Logistics — Nigeria-focused, each with its own template inventory. Two modes: **Standard**
(autonomous research from the business name alone) and **Deep** (a short questionnaire
first, so the operator steers what the research goes looking for).

**The browser never holds an n8n URL or token.** Every call goes through a function in
`api/` that adds the credential server-side. Opening the page via `file://` still renders
everything; the diagnostic then shows its "could not reach the live workflow" message
rather than failing loudly, because those functions only resolve on Vercel.

## 3D & motion (added 2026-08-18)

The hero has a small, bounded WebGL scene (`hero3d.js`) rendering the logo mark's own 5-bar rhythm as a slowly rotating, pointer-reactive geometric cluster — not a generic sphere/particle system. `motion.js` (separate file, so a WebGL failure can never take it down) adds event-driven card tilt on `.panel`, a magnetic-hover effect on the two hero CTAs, and scroll-reveal via `IntersectionObserver`. Both are classic `<script defer>` files, plain vanilla JS — no bundler, no build step added.

**One vendored dependency**: `vendor/three.min.js`, pinned at **three@0.160.0** specifically — not the latest release. three.js dropped its global/UMD build starting r161 (ES modules only from there), and `<script type="module">` is blocked by CORS when this page is opened via `file://` (this repo's primary, documented run mode above) — confirmed live during implementation. r160 is the last release with a working classic-script build, so `hero3d.js` can use `window.THREE` with zero server requirement, exactly like `app.js` already does. Full rationale and the license (MIT) are in `vendor/THREE_LICENSE.txt` — read that before ever upgrading this file.

Both `hero3d.js` and `motion.js` bail out cleanly (no console errors, no partial state) when: `prefers-reduced-motion: reduce` is set, the viewport is mobile-width (≤860px), WebGL is unsupported, or the pointer is coarse/touch (parallax and tilt only, not the whole scene) — in every case the already-existing CSS hero background is the entire fallback visual, not a separate thing that was built.

## The spectacle layer (added 2026-09-30)

Three files, all additive: **`fx.css`** (every new style rule), **`gl-runtime.js`** (the
WebGL capability gate and the three.js loader), and the enriched hero scene in `hero3d.js`.
Deleting `fx.css` and `gl-runtime.js` plus three lines of `index.html` returns the site to
how it looked before.

**`three.min.js` is no longer loaded from `index.html`.** It was fetched unconditionally on
every visit — 670 KB, including the mobile and reduced-motion visits where `hero3d.js`
gates itself off and never touches `THREE`. `gl-runtime.js` now injects it only once the
gate passes, so those visitors download 670 KB *less* than before. Scenes call
`LordGenGL.whenReady()`, which resolves with `THREE` or with `null`; null is the ordinary
"this visitor gets no 3D" branch, not an error.

The hero is real PBR now: a PMREM environment built in code (RoomEnvironment lives in
`examples/jsm` and is **not** in the r160 UMD build), `MeshPhysicalMaterial`, chamfered
`ExtrudeGeometry` bars, a sprite halo standing in for bloom, and drifting dust.

**Light shafts are CSS, not WebGL, and that is deliberate.** They were built as additive GL
planes first and rendered as a dark quadrilateral over the mark: additive geometry on an
`alpha: true` canvas gives the canvas alpha wherever the glow draws, so a dim beam becomes
an opaque patch that hides the CSS hero glow behind it. `mix-blend-mode: screen` cannot
darken what is beneath it, which is the guarantee a light effect needs.

Two traps in `styles.css` that any further work here must respect:

- **`[hidden] { display: none !important }` is load-bearing.** `app.js` reveals the four
  diagnostic result panels by clearing `hidden`. Any rule giving `.panel` an explicit
  `display` outranks the UA sheet and renders every result panel before the diagnostic runs.
- **`.diag-connection-details { max-height: 260px }`** clips if anything is added inside it.
  `#diagSenderEmailInput` becomes unreachable, `#issueProposalBtn` never enables, and the
  demo dead-ends at the proposal step. Convert it to `grid-template-rows` if it must change.

Icons are Iconify "solar" **linear**, inlined as an `<svg><symbol>` sprite because an
external `<use href>` is blocked at an opaque `file://` origin. Licences: `assets/CREDITS.md`.

## Brand

Uses LordGen's actual, established identity (not invented for this page) — see `../../Lordgen AI Skill builder/references/brand.md` for the pointer and full source guideline. Ink/Graphite/Regal Gold/Leaf/Brass/Bone/Slate palette, Archivo typeface (embedded locally in `archivo-fontface.css`, no external font CDN — same asset already built and tested for `lordgen-pitch`'s PDF pipeline), zero border-radius/square containers everywhere, flush-left text always, and the real logo mark (inlined SVG in `index.html`'s header, sourced from `../../Newsletter Demo/lordgen-ai-logo.svg`).

**Not brand-ratified**: the four `--state-*` colors in `styles.css` (used for HOT LEAD / priority indicators) are this page's own proposal within the palette — the guideline explicitly flags UI state colors as not yet covered. Confirm before treating them as permanent.

Also **not brand-ratified**: the hero's backdrop treatment (a faint Brass hairline column grid over a Graphite→Ink gradient, at the end of `styles.css`). It is derived from the logo mark's own five vertical members rather than an imported motif, and keeps the zero-radius/flush-left discipline, but the guideline says nothing about background texture. Confirm before treating it as permanent — deleting that one block returns the hero to a flat field with no other effect.
