---
name: opportunity-score
description: Score the automation opportunities found in data/research.json and rank them, honestly reflecting the confidence of the underlying evidence. Use after business-research has produced data/research.json.
---

# Opportunity Score

## Purpose

Turn `data/research.json`'s `automation_opportunities` into a ranked, scored shortlist — not a generic report. Never let a low-evidence opportunity score as if it were well-supported (`CLAUDE.md` §11, §12).

## Input

`data/research.json`, specifically the `automation_opportunities` array and each opportunity's `confidence` and `supporting_fact_refs`.

## Rubric

Score each opportunity on 8 factors, 1–5 each, where **5 is always the favorable end** (so "risk" and "implementation complexity" are scored inverted — 5 means *low* risk / *low* complexity):

| Factor | 5 means |
|---|---|
| `business_impact` | Would matter a lot to the business if it worked |
| `automation_potential` | Well suited to AI/automation vs. needing human judgment |
| `feasibility` | Buildable within this project's architecture (Claude Code + n8n + ClickUp, human approval gate) |
| `implementation_simplicity` | Simple to build (inverse of complexity) |
| `time_savings` | Meaningful time saved if it works |
| `revenue_customer_impact` | Meaningful revenue or customer-experience effect |
| `data_availability` | **Must track the opportunity's `confidence` in research.json** — low research confidence caps this low, regardless of how good the idea sounds |
| `risk_level` | Low risk if wrong (inverse of risk) |

`overall_score = round(average(8 factors) * 20)` → 0–100 scale, all factors equally weighted (no factor is allowed to dominate — keeps the rubric auditable).

Tiers: 80–100 High · 60–79 Medium · 40–59 Low · <40 Not recommended.

**Rule**: `data_availability` may never be scored higher than the source opportunity's `confidence` justifies (`low` confidence → `data_availability` ≤ 2). This is the mechanism that stops weak research from producing an inflated score.

## Required Output

Write `data/score.json`:

```json
{
  "input_source": "data/research.json",
  "scoring_date": "YYYY-MM-DD",
  "scores": [
    { "opportunity": "", "factor_scores": { "...8 factors...": 1-5 }, "overall_score": 0-100, "tier": "", "reasoning": "", "risks": [""], "research_confidence": "low|medium|high" }
  ],
  "top_opportunity": { "opportunity": "", "overall_score": 0, "tier": "", "reasoning": "" },
  "recommendation": "",
  "limitations": [""],
  "approval_required": false
}
```

`approval_required` is `false` here — scoring is internal reasoning, not a consequential action. It exists in the schema for consistency with `CLAUDE.md` §12's suggested output fields; the real approval gate is the developer sign-off between build phases.

## Validation (must run before reporting results)

Before this skill's output is considered done, verify programmatically:
- Every `factor_scores` object has all 8 factors, each 1–5.
- `overall_score` matches `round(average(factor_scores) * 20)` — recompute, don't trust the written value.
- `data_availability` is consistent with the source opportunity's `confidence` (low confidence → data_availability ≤ 2).
- `top_opportunity` actually is the max-scoring entry in `scores`.

## Out of Scope

This skill only scores and ranks. It does not write the proposal — that's `proposal-generator` (Phase 4), which should treat `top_opportunity` as an input, not re-litigate the ranking.
