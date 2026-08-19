# LordGen AI — Interactive Demo Website

A single self-contained static page (no build step, no framework, no backend) demonstrating that LordGen AI's workflow adapts across businesses without being rebuilt.

## Run it

Just open `index.html` in a browser — no server required. If you'd rather serve it (e.g. for a cleaner URL during the live demo):

```
python -m http.server 8000 --directory website
```

then visit `http://localhost:8000`.

## What this is (and isn't)

This page is a **client-side simulation**. Selecting a business, submitting the intake form, and everything in the AI Analysis panel / workflow visualization / activity feed / dashboard runs entirely in the browser using rule-based JavaScript (`app.js`) — there are no network calls, no API keys, and nothing is actually sent anywhere. Click "What does this simulate?" under the intake form on the live page for the same explanation shown to visitors.

It reproduces the *shape* of the real automation already built and tested for an actual local plumbing & HVAC business as a working n8n workflow (`workflows/competition-demo.json`, AI draft → human approval gate → send → log) — it does not call that workflow live. Wiring a public webpage directly to a real webhook that sends real approval emails would be a reliability and abuse risk for no benefit to the demo story.

## Presets

Three businesses, one engine — see `BUSINESS_PRESETS` in `app.js`:

- **Plumbing** — Ridgeline Plumbing & Air (illustrative name, fully simulated — renamed 2026-08-18 so the public demo never uses a real, identifiable business as the addressee of a visitor-submitted inquiry form). The real automation this preset's shape is modeled on was built and tested for an actual local plumbing & HVAC business; that business's identity and detailed research stay local/private (see the repo root `.gitignore`) and aren't reproduced here.
- **Real Estate** — Harborview Realty Group (illustrative name, fully simulated).
- **Salon** — Luxe Studio Salon & Beauty (illustrative name, fully simulated).

These are independent of the backend `data/professions/` registry (`docs/professions.md`), which covers a different pair (law firm intake, dental clinic) at `seeded` research depth. The two layers serve different purposes — see `docs/architecture.md`.

Adding a new business here means adding one object to `BUSINESS_PRESETS` (name, industry, services, intake fields, a `classify()` rule, a `responseTemplate()`) — no other code changes.

## 3D & motion (added 2026-08-18)

The hero has a small, bounded WebGL scene (`hero3d.js`) rendering the logo mark's own 5-bar rhythm as a slowly rotating, pointer-reactive geometric cluster — not a generic sphere/particle system. `motion.js` (separate file, so a WebGL failure can never take it down) adds event-driven card tilt on `.panel`, a magnetic-hover effect on the two hero CTAs, and scroll-reveal via `IntersectionObserver`. Both are classic `<script defer>` files, plain vanilla JS — no bundler, no build step added.

**One vendored dependency**: `vendor/three.min.js`, pinned at **three@0.160.0** specifically — not the latest release. three.js dropped its global/UMD build starting r161 (ES modules only from there), and `<script type="module">` is blocked by CORS when this page is opened via `file://` (this repo's primary, documented run mode above) — confirmed live during implementation. r160 is the last release with a working classic-script build, so `hero3d.js` can use `window.THREE` with zero server requirement, exactly like `app.js` already does. Full rationale and the license (MIT) are in `vendor/THREE_LICENSE.txt` — read that before ever upgrading this file.

Both `hero3d.js` and `motion.js` bail out cleanly (no console errors, no partial state) when: `prefers-reduced-motion: reduce` is set, the viewport is mobile-width (≤860px), WebGL is unsupported, or the pointer is coarse/touch (parallax and tilt only, not the whole scene) — in every case the already-existing CSS hero background is the entire fallback visual, not a separate thing that was built.

## Brand

Uses LordGen's actual, established identity (not invented for this page) — see `../../Lordgen AI Skill builder/references/brand.md` for the pointer and full source guideline. Ink/Graphite/Regal Gold/Leaf/Brass/Bone/Slate palette, Archivo typeface (embedded locally in `archivo-fontface.css`, no external font CDN — same asset already built and tested for `lordgen-pitch`'s PDF pipeline), zero border-radius/square containers everywhere, flush-left text always, and the real logo mark (inlined SVG in `index.html`'s header, sourced from `../../Newsletter Demo/lordgen-ai-logo.svg`).

**Not brand-ratified**: the four `--state-*` colors in `styles.css` (used for HOT LEAD / priority indicators) are this page's own proposal within the palette — the guideline explicitly flags UI state colors as not yet covered. Confirm before treating them as permanent.

Also **not brand-ratified**: the hero's backdrop treatment (a faint Brass hairline column grid over a Graphite→Ink gradient, at the end of `styles.css`). It is derived from the logo mark's own five vertical members rather than an imported motif, and keeps the zero-radius/flush-left discipline, but the guideline says nothing about background texture. Confirm before treating it as permanent — deleting that one block returns the hero to a flat field with no other effect.
