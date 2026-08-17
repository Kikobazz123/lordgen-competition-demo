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

It reproduces the *shape* of the real automation already built and tested for Nick's Plumbing & Air Conditioning as a working n8n workflow (`workflows/competition-demo.json`, AI draft → human approval gate → send → log) — it does not call that workflow live. Wiring a public webpage directly to a real webhook that sends real approval emails would be a reliability and abuse risk for no benefit to the demo story.

## Presets

Three businesses, one engine — see `BUSINESS_PRESETS` in `app.js`:

- **Plumbing** — Nick's Plumbing & Air Conditioning. Business name and service categories only; the detailed research behind the real automation stays local/private (see the repo root `.gitignore`) and isn't reproduced here.
- **Real Estate** — Harborview Realty Group (illustrative name, fully simulated).
- **Salon** — Luxe Studio Salon & Beauty (illustrative name, fully simulated).

These are independent of the backend `data/professions/` registry (`docs/professions.md`), which covers a different pair (law firm intake, dental clinic) at `seeded` research depth. The two layers serve different purposes — see `docs/architecture.md`.

Adding a new business here means adding one object to `BUSINESS_PRESETS` (name, industry, services, intake fields, a `classify()` rule, a `responseTemplate()`) — no other code changes.

## Brand

Uses LordGen's actual, established identity (not invented for this page) — see `../../Lordgen AI Skill builder/references/brand.md` for the pointer and full source guideline. Ink/Graphite/Regal Gold/Leaf/Brass/Bone/Slate palette, Archivo typeface (embedded locally in `archivo-fontface.css`, no external font CDN — same asset already built and tested for `lordgen-pitch`'s PDF pipeline), zero border-radius/square containers everywhere, flush-left text always, and the real logo mark (inlined SVG in `index.html`'s header, sourced from `../../Newsletter Demo/lordgen-ai-logo.svg`).

**Not brand-ratified**: the four `--state-*` colors in `styles.css` (used for HOT LEAD / priority indicators) are this page's own proposal within the palette — the guideline explicitly flags UI state colors as not yet covered. Confirm before treating them as permanent.
