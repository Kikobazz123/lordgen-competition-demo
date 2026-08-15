---
name: execution-plan
description: Populate the predefined LordGen execution-plan template (docs/execution-plan-template.md) from data/proposal.json. Use after proposal-generator has produced data/proposal.json.
---

# Execution Plan

## Purpose

Turn the approved proposal into the one predefined execution-plan template — never a bespoke format per business (`CLAUDE.md` §13). This is where the automation gets specified concretely enough for `automation-builder` (Phase 6) to build from, without yet building anything itself.

## Input

`data/proposal.json` (problem, opportunity, proposed_solution, workflow_concept, risks, confidence_caveat) and `docs/architecture.md` (what services/integrations are actually approved/connected).

## Rule: surface integration gaps, don't paper over them

If the proposed workflow needs a capability that isn't in the approved architecture (e.g. a customer-notification channel, when Gmail was cut in Phase 1), the execution plan must say so explicitly under Integrations/Error Handling — as an open dependency to resolve at `automation-builder` or `Integrations` phase — rather than silently assuming it exists or quietly building around it. This is the same "don't upgrade confidence silently" discipline as Phases 2-4, applied to architecture instead of evidence.

## Required Output

Two artifacts:

1. **`data/execution-plan.json`** — structured, for `automation-builder` (Phase 6) to consume:
```json
{
  "objective": "", "problem": "", "proposed_solution": "", "trigger": "",
  "inputs": [""], "ai_processing": "", "workflow_steps": [""],
  "integrations": [{"name": "", "status": "connected|not_connected|to_decide", "note": ""}],
  "data_requirements": [""], "human_approval_points": [""], "outputs": [""],
  "error_handling": [{"case": "", "handling": ""}],
  "testing_plan": [{"category": "", "test": ""}],
  "deployment": "", "success_criteria": [""],
  "open_dependencies": [""], "confidence_caveat": ""
}
```
2. **`execution-plan.md`** (repo root) — filled version of `docs/execution-plan-template.md`, human-readable, matching the structured data exactly.

## Validation (run before reporting results)

- Every section of `docs/execution-plan-template.md` has a corresponding, non-empty section in `execution-plan.md`.
- `problem` and `proposed_solution` are consistent with `data/proposal.json` (not re-litigated or reworded into something stronger than the proposal supports).
- `confidence_caveat` from the proposal is carried forward, not dropped.
- The required `CLAUDE.md` §15 test categories (happy path, missing input, external failure, AI failure, duplicate execution, approval gate, configuration) all appear in `testing_plan`.
- Every `integrations` entry not already `connected` per `docs/architecture.md` appears in `open_dependencies` too.

## Out of Scope

This skill does not build the workflow — that's `automation-builder` (Phase 6). It also does not resolve open integration dependencies; it documents them for a human decision.
