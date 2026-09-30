# Third-party assets

Mirrors the `vendor/THREE_LICENSE.txt` precedent: everything bundled into this
site that someone else made, and the licence it arrived under.

## Icons — Iconify "Solar" (bold-duotone)

- **Set:** `solar` — Solar Icon Set
- **Author:** 480 Design
- **Licence:** CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/
- **Source:** https://icon-sets.iconify.design/solar/
- **Delivery:** fetched once from the Iconify API at build time and inlined
  into `index.html` as an `<svg id="icon-sprite">` `<symbol>` sprite. No runtime
  CDN call, no external request, and no network dependency at page load.

**Why inline rather than an external file.** An external `<use href="file.svg#id">`
is blocked at an opaque `file://` origin, and `README.md` documents opening the
page straight off disk as the primary run mode. Inlining is what keeps the icons
working there.

Symbols in use: `i-automation`, `i-agents`, `i-workflow`, `i-crm`, `i-api`,
`i-bi`, `i-missed`, `i-slow`, `i-repetitive`, `i-disconnected`, `i-manual`,
`i-inconsistent`, `i-lead`, `i-support`, `i-operations`, `i-reporting`,
`i-chevron`, `i-arrow`.

CC BY 4.0 requires attribution. This file is that attribution; keep it in the
repository and do not strip the comment at the top of the sprite in `index.html`.

## 3D — three.js

See `vendor/THREE_LICENSE.txt`. Pinned at r160 because r161+ dropped the UMD
global build, which is what makes `file://` work.

## Fonts — Archivo

Embedded locally via `archivo-fontface.css` (no CDN). Archivo is licensed under
the SIL Open Font License 1.1.
