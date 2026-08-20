---
name: lordgen-site-upgrade
description: Upgrade and QA the LordGen AI website without destroying the existing brand, demos, integrations, or business logic. Use for homepage redesigns, conversion improvements, diagnostic UX, premium UI polish, accessibility, SEO, responsive behavior, and production QA.
---

# LordGen Site Upgrade Skill

## Purpose

Use this skill whenever changing the LordGen AI website.

The goal is not a generic redesign. The goal is to make the existing LordGen product experience clearer, more premium, more trustworthy, and more conversion-oriented.

## Workflow

### 1. Inspect Before Editing

Inspect:
- package.json
- framework
- app/router structure
- public assets
- global styles
- component system
- existing homepage
- diagnostic components
- workflow/demo components
- forms
- environment-variable references
- Vercel configuration
- tests and scripts.

Never assume the framework or file structure.

### 2. Identify the Existing Design System

Find existing:
- colors
- typography
- spacing
- borders
- buttons
- cards
- animation conventions.

Reuse them.

### 3. Protect Business Logic

Separate:
- visual changes
- copy/content changes
- business logic
- API calls
- authentication
- webhook logic.

A visual upgrade should not silently rewrite backend or integration logic.

### 4. Upgrade in Layers

Preferred order:

Layer 1: hierarchy
Layer 2: messaging
Layer 3: CTA path
Layer 4: diagnostic UX
Layer 5: solution cards
Layer 6: proof presentation
Layer 7: motion
Layer 8: accessibility/SEO
Layer 9: performance
Layer 10: final QA.

### 5. Diagnostic Rules

The diagnostic must never feel like a dashboard shown only to technical users.

It should communicate:
- what is wrong
- what can be automated
- what LordGen recommends
- why it matters
- what the visitor can do next.

Keep technical details available in expandable sections.

### 6. Motion Rules

Motion should communicate hierarchy or system behavior.

Use:
- fade
- slide
- scale
- workflow path progression
- staggered card entrance.

Avoid:
- continuous attention-grabbing animation
- excessive parallax
- bouncing UI
- animation on every element.

Honor prefers-reduced-motion.

### 7. Responsive Rules

Test:
- 1440px+
- 1024px
- 768px
- 390px
- 360px.

No horizontal scrolling.

Touch controls must be comfortably tappable.

### 8. Accessibility Rules

Check:
- keyboard navigation
- focus
- labels
- contrast
- semantic headings
- dialog behavior
- aria only where needed
- reduced motion.

### 9. SEO Rules

Keep one clear H1.

Use descriptive page title and meta description.

Ensure links and buttons communicate destination/action.

### 10. QA Rules

Run available:
- lint
- typecheck
- unit tests
- integration tests
- production build.

Then manually test:
- homepage
- diagnostic
- CTA buttons
- forms
- mobile menu
- workflow interaction
- all important navigation
- error/loading states.

### 11. Security Rules

Never:
- commit .env
- print API keys
- hardcode secrets
- display webhook tokens
- expose n8n credentials
- put secret values into client-side source.

If an integration appears broken, inspect it and report the exact dependency rather than guessing.

### 12. Completion Standard

Do not say "done" merely because the page renders.

Done means:
- business proposition is clear
- diagnostic is useful
- CTA path is obvious
- UI is polished
- mobile works
- accessibility is reasonable
- production build passes
- existing integrations remain intact.
