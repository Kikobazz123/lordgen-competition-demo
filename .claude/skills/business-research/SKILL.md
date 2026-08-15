---
name: business-research
description: Research a target business using public web sources and produce structured, evidence-graded findings — verified facts, inference, and confidence kept separate. Use when researching the locked LordGen demo business or a candidate business.
---

# Business Research

## Purpose

Research a target business and produce structured findings that a human can trust: what's actually known, what's a reasoned guess, and how confident each claim is. Never present inference as verified fact (`CLAUDE.md` §11).

## Method

Use Claude Code's built-in `WebSearch` and `WebFetch` tools only — no external research MCP server (per the approved architecture, `docs/architecture.md`). Prioritize, in order:

1. The business's own website — services, hours, service area, stated policies/claims.
2. Regulatory/accreditation sources (e.g. BBB) — rating, accreditation status, complaint patterns.
3. Independent review aggregators (Google, Yelp, Trustpilot, industry-specific sites) — ratings, review counts, recurring themes.

Some sources (Yelp, Trustpilot, and similar) commonly block automated `WebFetch` access (HTTP 403). When that happens, in order:
1. Retry with `firecrawl_scrape` (`proxy: "stealth"` or `"enhanced"`) — approved 2026-08-13 specifically for this fallback case (`docs/architecture.md`). This gets past most bot-blocks and returns primary-source content, not a summary.
2. If firecrawl also fails (e.g. still 403, or the content is behind client-side JS pagination that doesn't render), fall back to `WebSearch` result summaries as a last resort.
3. Never fabricate page content.

Mark facts sourced via `WebSearch` summary (rather than a direct page read, by either tool) with `"confidence": "low"` and a `"caveat"` explaining why. Facts read directly (via `WebFetch` or `firecrawl_scrape`) can carry `"confidence": "high"` for the fact's existence/text — but a single review/account being real and directly-read is not the same as it being representative; that judgment still belongs in `confidence` on the `pain_points`/`automation_opportunities` entries that cite it, not in inflating the underlying fact.

## Required Output

Write `data/research.json` with this structure:

```json
{
  "business": { "name": "", "category": "", "founded": "", "address": "", "phone": "", "service_area": "", "hours": "" },
  "research_date": "YYYY-MM-DD",
  "facts": [
    { "fact": "", "type": "verified|inference", "source": "", "source_url": "", "confidence": "high|medium|low", "caveat": "" }
  ],
  "pain_points": [
    { "description": "", "type": "verified|inference", "evidence": "", "confidence": "high|medium|low", "supporting_fact_refs": [] }
  ],
  "automation_opportunities": [
    { "opportunity": "", "rationale": "", "confidence": "high|medium|low", "supporting_fact_refs": [] }
  ],
  "data_caveats": [""],
  "overall_confidence": "high|medium|low"
}
```

Rules:
- Every `fact` and `pain_point` must carry a `source_url` (or `"source_url": null` with an explanation if genuinely unsourceable) and a `type` of `verified` or `inference` — never omit `type`.
- `automation_opportunities` are candidate opportunities only. Scoring/ranking them is the `opportunity-score` skill's job (Phase 3), not this one.
- If a source is unreachable, record that as a data caveat rather than silently dropping it or guessing at its content.
- `overall_confidence` reflects the weakest link, not the average — e.g. if the core pain-point evidence is only "low," overall confidence should not read "high."

## Out of Scope

This skill only researches and writes `data/research.json`. It does not score opportunities, write proposals, or take any external action.
