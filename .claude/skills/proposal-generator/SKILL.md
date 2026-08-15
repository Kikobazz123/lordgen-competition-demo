---
name: proposal-generator
description: Turn score.json's top_opportunity into a concise business proposal, keeping the confidence caveats from research/scoring visible rather than smoothing them over. Use after opportunity-score has produced data/score.json.
---

# Proposal Generator

## Purpose

Turn the top-scored opportunity into a concise, judge/client-readable proposal: problem, proposed AI solution, expected impact, why it matters, recommended next step (`LORDGEN_competition_demo.md` §4). Structured data first, prose second — the prose must not say anything the structured data doesn't support.

## Input

`data/score.json` → `top_opportunity`, plus its matching entry in `scores` for `reasoning`/`risks`/`research_confidence`. Cross-reference `data/research.json` for the supporting facts and `docs/demo-business.md` for the locked business identity.

## Rule

**Do not upgrade confidence.** If `research_confidence` on the top opportunity is `low`, the proposal must say so explicitly — e.g. "evidence-suggested, not confirmed" — rather than writing persuasive copy that reads as if the problem were proven. This is the same rule as Phase 2/3 (`CLAUDE.md` §11): inference stays labeled as inference all the way downstream.

## Required Output

Two artifacts:

1. **`data/proposal.json`** — structured, for the `execution-plan` skill (Phase 5) to consume without re-parsing prose:
```json
{
  "company": "",
  "problem": "",
  "evidence": [""],
  "opportunity": "",
  "score": 0,
  "tier": "",
  "reasoning": "",
  "proposed_solution": "",
  "workflow_concept": "",
  "expected_benefits": [""],
  "implementation_approach": "",
  "risks": [""],
  "confidence_caveat": "",
  "recommended_next_step": "",
  "approval_required": true
}
```
`approval_required` is `true` here — not because writing the document is consequential, but because *presenting or sending it externally* is, and that gate must stay visible in the artifact itself, not just in process.

2. **`proposal.md`** (repo root, per `docs/architecture.md`'s repo structure) — the human-readable version of the same content, for judges/handoff. Must include a visible confidence/evidence note; must not contradict `data/proposal.json`.

## Validation (run before reporting results)

- `proposal.json.opportunity` and `.score` exactly match `score.json.top_opportunity`.
- `proposal.json.company` matches the locked business in `docs/demo-business.md`.
- `confidence_caveat` is non-empty whenever `research_confidence` on the source opportunity was `low` or `medium`.
- `proposal.md` does not contain overstatement language ("confirmed", "proven", "guaranteed") applied to the problem/evidence — scan for it.

## Out of Scope

This skill does not populate the execution-plan template — that's `execution-plan` (Phase 5), which takes `data/proposal.json` as input.
