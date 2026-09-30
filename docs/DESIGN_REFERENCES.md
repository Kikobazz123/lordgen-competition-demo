# Design references — LordGen AI website

Where to get references for the competition site, and which ones each section is built
against. Companion to `~/.claude/skills/design-escalation/SKILL.md`, which explains the
method; this file is the material.

**Why named references at all.** Describing a design in prose produces the model's average
of that description. Building against a real screenshot produces something specific. Every
section below names its reference so the work can be scored against something rather than
against "better".

---

## 1. Where to browse

### General galleries

| Source | Best for |
|---|---|
| `land-book.com` | Landing pages, the strongest filtering of the free galleries |
| `lapa.ninja` | Landing pages, fast to skim |
| `recent.design` (formerly Godly) | Curated high-end, cutting-edge work |
| `siteinspire.com` | Editorial and minimal discipline |
| `onepagelove.com` | Single-page structure — closest to this site's shape |

### The award bar

| Source | Best for |
|---|---|
| `awwwards.com` | The standard a judge is unconsciously comparing against |
| `thefwa.com` | Interactive and experiential work |
| `cssdesignawards.com` | Technical execution |

### 3D / WebGL specifically — the ones that matter here

| Source | Best for |
|---|---|
| `refs.gallery/category/webgl` | WebGL sites filtered by technique |
| `mesh3d.gallery` | Hand-curated Three.js and real-time 3D |

### Not used: Mobbin

The source video's tool is Mobbin (~$2.50/week minimum, MCP-connected). Excluded on cost.
The substitute below does the same job free.

---

## 2. Getting a reference in front of the model

Mobbin's value is that its MCP lets an agent *see* the reference. That is reproducible at
zero cost with the `firecrawl` MCP, which is already installed:

```
firecrawl_scrape  url: "<gallery entry or live site>"  formats: ["screenshot"]
```

Hand the returned screenshot straight into the build. Same workflow, no subscription.

For a live site with scroll-triggered work, add `waitFor` so the page has settled before
the capture.

---

## 3. Free, commercially clean assets

All verified 2026-09-27. Everything here is safe for a monetised or judged build.

| Need | Source | Licence |
|---|---|---|
| PBR textures | `polyhaven.com`, `ambientcg.com`, `cgbookcase.com` | CC0 — no attribution required |
| HDRIs / environment lighting | `polyhaven.com` | CC0 |
| 3D models | `poly.pizza`, `quaternius.com`, `kenney.nl` | CC0 / public domain |
| Icons | `iconify.design` | Per set — check the specific set named |
| Photography | Pexels, Unsplash | Free commercial |

**Texture budget for this site: cap at 1024², compress, lazy-load per section.** Geometry
is cheap here because Three.js is already loaded; a few 4K maps would outweigh the entire
rest of the page.

**Record what you use.** `website/assets/CREDITS.md` lists Iconify set names and licences,
mirroring the existing `vendor/THREE_LICENSE.txt` precedent.

---

## 4. Per-section reference set

Built against these. Score each section against its own row, not against a general
impression.

| Section | References | What to take |
|---|---|---|
| **Hero** | `linear.app`, `stripe.com/sessions`, `basement.studio`, `igloo.inc` | Restraint at scale — one strong object, enormous negative space, light doing the work |
| **Trust strip** | `vercel.com` customer strip, `clerk.com` logo row | Quiet horizontal rhythm that does not compete with the hero |
| **Diagnostic** | `linear.app` product pages, `resend.com`, `retool.com` | Making a working tool look designed rather than administrative |
| **Problem** | `arc.net`, `raycast.com` feature grids | Dense grids that stay readable; hover as reward not decoration |
| **Model** | `stripe.com/payments` connected graphics, `n8n.io`, `temporal.io` | Process visualised as a real connected object, not four boxes |
| **Solutions** | `raycast.com`, `framer.com` feature cards | Card systems with genuine hierarchy between cards |
| **Proof** | `supabase.com`, `stripe.com/docs` | Technical credibility without inventing numbers |
| **How it works** | `apple.com` product scroll (restrained), `stripe.com/docs` sequencing | Scroll as pacing, not as spectacle |
| **FAQ** | `linear.app` FAQ, `vercel.com` pricing FAQ | Disclosure that feels effortless |
| **About** | `ramp.com`, editorial studio sites | Editorial two-column with a real pull-quote |
| **Final CTA** | `vercel.com` footer CTA, `tailwindcss.com` CTA, `lusion.co` | Light fields; ending on the page's strongest frame |

---

## 5. Two limits that override any reference

**Cloning boundary.** Rebuilding a reference's layout, spacing rhythm, type scale and
design language is the job. Copying its logo, wordmark, photography or marketing copy is
not.

**The honesty gate.** No reference justifies inventing content. This site must not gain
metrics, client counts, testimonials, case studies, or generated images of people who imply
a team or customers that do not exist — see `CLAUDE.md` §26.2.4. Several references above
carry exactly those elements; take their *composition*, supply our own true content, and
where a reference's impact depends on a logo wall we do not have, solve it with material
and light instead.
