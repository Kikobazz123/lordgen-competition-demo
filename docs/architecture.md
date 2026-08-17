# LORDGEN — Approved Architecture

Status: approved by the developer for the 7-day competition build. This is the durable record of the architecture decided in the initial planning session — see `LORDGEN_competition_demo.md` and `LORDGEN_competition_tools_skills_mcp_references.md` for the source requirements this is built from.

## Pipeline

```
TARGET BUSINESS
      |
RESEARCH            -> business-research skill, Claude Code's built-in WebSearch/WebFetch
      |                writes data/research.json
OPPORTUNITY SCORE   -> opportunity-score skill, reasoning over research.json
      |                writes data/score.json
PROPOSAL            -> proposal-generator skill -> proposal.md
      |
EXECUTION PLAN      -> execution-plan skill, fills the ONE predefined template
      |                writes execution-plan.md
STARTER AUTOMATION  -> automation-builder skill -> n8n MCP
      |                writes workflows/competition-demo.json (n8n export)
HUMAN APPROVAL      -> explicit, visible manual gate before anything external happens
      |
HANDOFF             -> ClickUp MCP (implementation task) + GitHub repo (git/gh CLI)
```

## Services in use (four, total)

1. **Claude Code** — orchestrator and the seven Skills.
2. **n8n MCP** — the only way to get a real, live-editable running workflow for the Starter Automation stage and the demo's required live-modification moment. Not connected yet; requires an approved `claude mcp add` with an n8n instance URL + API key (Phase 5).
3. **ClickUp MCP** — satisfies the Handoff artifact the demo doc explicitly names ("ClickUp implementation tasks"). Already connected/authenticated in this Claude Code environment.
4. **git / gh CLI** — satisfies the GitHub-repository deliverable. Already available; no GitHub MCP server is added.
5. **firecrawl MCP** — approved 2026-08-13, scoped narrowly: a fallback inside `business-research` only, used when `WebFetch` is bot-blocked (HTTP 403) on a source that matters (e.g. review sites). Not a general-purpose replacement for `WebSearch`/`WebFetch` — those remain the default. See `.claude/skills/business-research/SKILL.md`.
6. **Gmail MCP** — reinstated 2026-08-13, scoped narrowly: the customer-notification channel for the locked opportunity's one workflow (sending the plain-language estimate summary), not general outreach. Already connected/authenticated in this Claude Code environment. The Human Approval gate in `execution-plan.md` still sits before any send — reinstating the channel doesn't reinstate unattended sending. `automation-builder` (Phase 6) should use it for this one send step only, per `data/execution-plan.json`.

## Deliberately not used, and why

| Cut | Why |
| Perplexity MCP | Not connected in this environment; would need the developer to set it up in a separate interactive session with their own API key. Not pursued once `firecrawl` alone was sufficient to get past the Yelp/Trustpilot block. |
| Tavily, SerpApi, and other search/scrape APIs | Considered when firecrawl's result was still uncertain; not needed once firecrawl got past the block on the sources that mattered. Not added "just in case." |
| SQLite / any database | Single frozen, non-concurrent demo business — no query workload that needs a database. Plain JSON/Markdown files per stage are simpler, need no schema/driver, and double as judge-readable artifacts. |
| Trigger.dev MCP | n8n was chosen as the automation engine instead. |
| Semrush, Ahrefs, other connected-but-unused connectors | Available in the environment but never justified by any pipeline stage. |

## Storage

Flat files only, written by each Skill as it runs:

- `data/research.json` — sources, evidence, confidence (gitignored; regenerated per demo run)
- `data/score.json` — opportunity score breakdown
- `proposal.md`
- `execution-plan.md` — filled from `docs/execution-plan-template.md`
- `workflows/competition-demo.json` — n8n workflow export

## Skills (`.claude/skills/`)

One skill per pipeline stage. Build phases as actually executed (one skill per phase, per the developer's phase plan — finer-grained than the reference doc's original 8-phase build order):

| Skill | Pipeline stage | Build phase | Status |
|---|---|---|---|
| `business-research` | Research | Phase 2 | Implemented |
| `opportunity-score` | Opportunity Score | Phase 3 | Implemented |
| `proposal-generator` | Proposal | Phase 4 | Implemented |
| `execution-plan` | Execution Plan | Phase 5 | Implemented |
| `automation-builder` | Starter Automation | Phase 6 | Implemented and tested — n8n workflow `055TNXGtfItIgqf1` (`workflows/competition-demo.json`), unpublished |
| `workflow-qa` | QA across all stages | Phase 8 | Scaffold only |
| `competition-demo` | Pre-flight / Handoff polish | Phase 9 | Scaffold only |

Phase 7 (Integrations — ClickUp, n8n, GitHub) sits between Automation Builder and QA, connecting the MCP servers the earlier phases only referenced.

## Profession config layer (added 2026-08-15)

`business-research`, `opportunity-score`, and `proposal-generator` are not hard-coded to plumbing — they operate on whichever profession/business profile they're pointed at. Only **plumbing_hvac (Nick's Plumbing & Air Conditioning)** is a `full` build (real research through automation); two more professions exist at `seeded` depth (generic industry profiles, no execution plan or automation) to demonstrate the skills generalize. Full detail: `docs/professions.md`. This was merged in at reduced scope from `LORDGEN_UPGRADE_SPEC.md` — see that doc's "Why this scope" section for what was deliberately *not* adopted (multi-profession web UI, adaptive forms, PDF reports) and why.

## Interactive demo website (added 2026-08-17, brand-corrected same day)

`website/` — a single static HTML/CSS/vanilla-JS page (no framework, no build step, no backend), simulating the same workflow shape client-side across three presets: Plumbing (Nick's Plumbing & Air Conditioning — name/services only, no private research reproduced), Real Estate (Harborview Realty Group, illustrative), Salon (Luxe Studio Salon & Beauty, illustrative). Does not call the real n8n webhook/OpenAI/Gmail — deliberately simulated, per `CLAUDE.md` §9/§16-17 and the site's own in-page disclosure ("What does this simulate?"). Independent of the `data/professions/` registry above — see `website/README.md` for why.

**Brand**: initially built with an invented generic blue/SaaS palette before LordGen's actual established brand identity was located (`Lordgen AI Skill builder/references/brand.md` → the newsletter brand guideline it points to). Rebuilt same-day to the real identity: Ink/Graphite/Regal Gold/Leaf/Brass/Bone/Slate palette, Archivo typeface, zero border-radius, flush-left text always, the real logo mark — see `website/README.md`'s Brand section for the full pointer chain. UI state colors (lead priority indicators) are this page's own proposal, not yet brand-ratified.

Tested via Playwright (headless Chromium) both before and after the brand rebuild: all three presets, empty-field validation, mobile viewport, zero console errors. Real bugs found and fixed: a `[hidden]`/CSS `display` cascade conflict on the info modal and the processing panel (both silently staying visible/interactive despite the `hidden` attribute), and a grid layout bug post-rebuild where an empty grid column revealed a solid brass background block.

## Known open items

- Target ClickUp workspace/list for implementation tasks (Phase 7 — next up, not yet started).
- `website/` deployed to Vercel (preview): `https://lordgen-ai-demo-zaxellimited360-1656s-projects.vercel.app`. **Open decision**: this preview URL is behind Vercel's default SSO wall — opens fine for the account owner, not for anyone else (e.g. judges). Asked whether to disable deployment protection (public link) or promote to a `production` deployment instead; not yet answered. The deployed copy also links Archivo from Google Fonts rather than embedding it (see `website/README.md` — the committed repo copy stays fully self-contained/offline-safe via `website/archivo-fontface.css`; only the hosted copy trades that for not pushing a 46KB blob through the deploy call).
- Developer said they'll come back to `website/` for further edits/iteration — no specific scope given yet, just a heads-up for future sessions.
- GitHub repo pushed and current through Phase 6 + the profession/website additions above — public, business-specific research excluded (see `.gitignore`).

## Resuming in a new session

Everything needed to continue lives on disk, not in any one conversation: this file, `README.md`, `data/`, `workflows/`, `website/`, and the memory files under this environment's memory system (auto-commit-to-GitHub preference, repo URL/exclusion policy). A fresh session should read `CLAUDE.md` + this file first (per `CLAUDE.md` §5's own initial-session rule), which is enough to re-orient: Phases 1–6 done for Nick's Plumbing, profession-config layer + website built and pushed, Phase 7 (ClickUp integration) next, plus the two open items directly above.
