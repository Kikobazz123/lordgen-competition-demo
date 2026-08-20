# LordGen AI — Claude Code Project Instructions

## Mission

Maintain and upgrade the LordGen AI website into a premium, conversion-focused AI automation consultancy site without destroying the existing LordGen identity, working integrations, demos, or business logic.

The current website already has a distinctive black/gold system, an interactive demo, a Business Diagnostic Demo, workflow views, and automation-oriented content. Treat that existing work as the foundation.

## Non-Negotiable Rules

1. DO NOT rebuild the site from scratch.
2. DO NOT remove the existing LordGen black/gold visual identity.
3. DO NOT replace working features merely because a different implementation looks cleaner.
4. DO NOT invent client counts, revenue, ROI, testimonials, case studies, or performance statistics.
5. Label demos/prototypes honestly as demos/prototypes until real client evidence exists.
6. DO NOT expose, print, commit, or hard-code secrets, webhook tokens, API keys, credentials, or environment-variable values.
7. DO NOT change n8n credentials, webhook authentication, or Vercel secrets unless explicitly instructed by the user in a separate integration task.
8. Preserve existing routes and public URLs unless a route change is required and verified.
9. Preserve accessibility, responsive behavior, SEO metadata, analytics, and existing integrations unless improving them.
10. Every major visual change must be tested at desktop, tablet, and mobile widths.
11. Prefer small, reversible changes over large rewrites.
12. Before editing, inspect the existing codebase, package manager, framework, routing, components, environment variables, and deployment configuration.
13. Reuse existing components and styles before introducing new dependencies.
14. Do not add a UI library just to make the site look more polished. Use existing project patterns where possible.
15. Use 21st.dev only as a quality benchmark for interaction and polish, not as a template to copy.

## Brand Direction

Brand: LordGen AI

Positioning:
AI automation, AI agents, workflow engineering, CRM automation, API integration, and business process transformation.

Visual language:
- Near-black / charcoal foundation
- Restrained gold/brass accent
- Editorial/technical premium feel
- Strong typography
- Thin borders and disciplined spacing
- Subtle motion rather than excessive effects
- No generic neon AI aesthetic
- No visual clutter

The current design tokens include:
--ink: #0A0A09
--graphite: #141312
--gold: #C9A24B
--leaf: #F0E2BC
--brass: #8A6A24
--bone: #E8E6E1
--slate: #8C8A85

Preserve these unless a documented reason exists to refine them.

## Primary Conversion Goal

The website must make this journey obvious:

Visitor
→ understands what LordGen does
→ identifies a business problem
→ runs the Business Diagnostic
→ receives a useful automation opportunity
→ sees a relevant workflow
→ starts a conversation / books a strategy call / sends a WhatsApp inquiry.

The site should sell outcomes, not technical jargon.

## Hero Message

Use the following direction unless the existing content is demonstrably stronger:

Headline:
"AI Automation Built Around Your Business"

Supporting message:
"Turn repetitive business operations into intelligent systems that capture, analyze, decide, and execute."

Primary CTA:
"Run My Business Diagnostic"

Secondary CTA:
"See a Live System"

Do not make the hero promise unsupported results.

## Homepage Architecture

Target structure:

1. Navigation
2. Hero
3. Trust/Capability strip
4. Interactive Business Diagnostic
5. Business pain/problem section
6. LordGen operating model
7. Solutions/outcomes
8. Live systems / demos
9. Proof / case studies
10. How it works
11. FAQ
12. Final CTA
13. Footer

The exact order may be adjusted after inspecting the existing UX, but the visitor must reach a clear CTA quickly.

## Diagnostic Is the Differentiator

Treat the Business Diagnostic as a central product experience.

A strong flow is:

Business / industry
→ current problem
→ diagnostic analysis
→ automation opportunity
→ recommended workflow
→ expected operational benefit
→ CTA to build or discuss.

Example display:

Detected opportunity
Lead capture → AI qualification → CRM → follow-up → booking

Possible benefits:
- Faster response
- Fewer missed leads
- Less manual follow-up
- Better pipeline visibility

Do not state quantified savings unless based on real evidence or clearly labeled as an estimate.

## Solutions

Prefer business-language categories:

- Lead Generation
- Customer Support
- CRM Automation
- Operations Automation
- AI Agents
- Reporting & Intelligence
- API / Tool Integration

Explain each category by outcome first and technology second.

## Proof

Until real client data exists:

Use "LordGen Demo", "Prototype", or "Example System" labels.

Show:
- what the workflow receives
- what it decides
- what it does
- which tools it connects
- what business problem it addresses.

Do not fabricate testimonials or metrics.

## Interaction Quality

Use the polish standard associated with modern component libraries such as 21st.dev:

- responsive interactive cards
- smooth but restrained transitions
- meaningful hover states
- animated workflow progression
- expandable details
- clear visual hierarchy
- polished buttons
- consistent motion timing
- good empty/loading/error states.

Do NOT turn the page into a flashy motion showcase.

## Technical Quality Gate

Before declaring the upgrade complete:

- run the project's lint command
- run the project's typecheck command if available
- run tests if present
- run a production build
- verify all major routes
- verify the diagnostic interaction
- verify CTAs
- verify forms
- verify mobile layout
- verify there are no console errors
- verify no secrets are exposed
- verify the build succeeds from a clean state when practical.

## Change Management

For every major change:
1. Inspect.
2. State the intended change internally.
3. Implement the smallest useful change.
4. Test.
5. Review for regressions.
6. Keep the change reversible.

## Definition of Done

The site is done only when:

- A first-time visitor understands LordGen within seconds.
- The Business Diagnostic feels like a real product, not a static mockup.
- The site clearly explains what LordGen builds.
- Every major section supports conversion.
- The visual quality feels premium and intentional.
- The site is responsive.
- Existing functionality still works.
- No unsupported claims were introduced.
- Production build passes.

Read these project documents before major website work:
- `LORDGEN_SITE_UPGRADE.md`
- `.claude/skills/lordgen-site-upgrade/SKILL.md`
- `LORDGEN_N8N_VERCEL_GUARDRAILS.md`
