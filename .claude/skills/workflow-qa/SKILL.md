---
name: workflow-qa
description: Test workflows/competition-demo.json against the CLAUDE.md §15 test categories and data/execution-plan.json's testing_plan, using static inspection of the workflow JSON plus n8n's test_workflow (pin data only) where safe. Use after automation-builder has produced workflows/competition-demo.json.
---

# Workflow QA

## Purpose

Actually test the generated starter automation against the 7 required categories (`CLAUDE.md` §15) — not just check the plan says it will be tested. Report what was verified and how; never claim a pass that wasn't actually checked.

## Input

- `data/execution-plan.json` — specifically `testing_plan[]` (the intended test per category) and `error_handling[]` (what each failure case should do)
- `workflows/competition-demo.json` — the actual workflow to test

## Precondition check (do this first, every time)

1. Read both inputs in full. If either is missing, stop and report (`CLAUDE.md` §19) — there is nothing to test against.
2. `ToolSearch` for n8n MCP tools this skill needs (`test_workflow`, `prepare_workflow_pin_data`, `list_credentials`, `get_node_types`, `validate_node_config`). Unlike `automation-builder`, do **not** hard-stop if unreachable — static analysis of the workflow JSON needs no MCP call. If unreachable (or only partially available), run the static-only checks and mark every category that needed a live check as `status: "not_verified_mcp_unreachable"`. Never fabricate a pass/fail for something that wasn't actually run.

## Method

Static = read `workflows/competition-demo.json`'s `nodes`/`connections` directly, no MCP call needed. Live = `test_workflow` + `prepare_workflow_pin_data`, pin data only — this is what makes autonomous execution safe (it bypasses real external services per `docs/n8n-reference.md`). `execute_workflow` and `publish_workflow` are never called by this skill, for any category.

| Category | Method | What gets checked |
|---|---|---|
| Happy path | static + live | Trace `Estimate Submitted (Webhook)` → `Normalize Input` → `Required Fields Present?` (true) → `Skip If Already Logged` → `Draft Estimate Summary` → `AI Output Valid?` (true) → `Request Dispatcher Approval` → `Dispatcher Approved?` (true) → `Send Summary To Customer` → `Log: Approved & Sent`, against `execution-plan.json.workflow_steps`. Live: a full valid fixture through `test_workflow`, confirm the execution reaches `Log: Approved & Sent`. |
| Missing input | static + live | Confirm `Required Fields Present?`'s three `notEmpty` conditions cover `customerContact`/`scope`/`price`; false branch → `Log: Missing Input` → `End (Missing Input)`, with no path into `Draft Estimate Summary`. Live: one field blank in the fixture, confirm that branch actually fires. |
| External failure | static only | Check whether either Gmail node (`Request Dispatcher Approval`, `Send Summary To Customer`) has an error-output connection to any logging/alerting node. If not connected, this is a genuine gap — report `status: "fail"` with the missing routing named as evidence, not something to test around. Live pin-data testing bypasses the very external service this category is about, so it can't substitute for the static check either way. |
| AI failure | static + live | `AI Output Valid?` checks `$json.output` for `notEmpty`; false branch → `Log: AI Failed` → `End (AI Failed)`, no path to `Request Dispatcher Approval`. Live: pin `Draft Estimate Summary`'s output to empty, confirm the branch is taken. |
| Duplicate execution | **static only** | Confirm `Skip If Already Logged` sits before `Draft Estimate Summary`, keyed on `job_id`, with no path that bypasses it. If MCP is reachable, use `get_node_types`/`validate_node_config` to confirm what the `dataTable` node's `rowNotExists` operation actually does on a match vs. no-match — the connections graph has only one outbound edge, so confirm this rather than assume it silently drops duplicates. **Do not live-test this category** — `test_workflow` would write a real row into the live "LordGen Estimate Summary Log" Data Table, and there is no MCP tool to delete it afterward. Report `method_used: "static"` and note why live testing was skipped. |
| Approval gate | static + live | Confirm `Send Summary To Customer` has exactly one inbound connection, from `Dispatcher Approved?`'s true branch only. Live: fixture with `data.approved: false`, confirm `Send Summary To Customer` never executes (check the execution's node list, not just the final output). |
| Configuration | static (+ optional read-only live) | Confirm `OpenAI Model`, `Request Dispatcher Approval`, and `Send Summary To Customer` each reference a credential (a placeholder is fine) and that no real secret is committed anywhere in the file. Optional: `list_credentials` (read-only, non-consequential) to confirm referenced credential names exist in the instance. |

## Hard rules

- Never call `execute_workflow` or `publish_workflow`, under any category, for any reason.
- `test_workflow` with pin data is the only autonomous execution mode this skill may use.
- Never live-test the duplicate-execution category — it is static-only, always, because there is no way to clean up the real Data Table row it would create.
- Report gaps found in the workflow honestly; do not edit `workflows/competition-demo.json` to fix them. Remediation is a separate, human-approved `automation-builder` change.

## Required Output

`data/qa-report.json`:

```json
{
  "input_sources": ["data/execution-plan.json", "workflows/competition-demo.json"],
  "qa_date": "YYYY-MM-DD",
  "n8n_mcp_reachable": true,
  "results": [
    { "category": "", "method_used": "static|live|static+live",
      "status": "pass|fail|not_verified_mcp_unreachable",
      "evidence": "", "notes": "" }
  ],
  "known_gaps": [""],
  "approval_required": false
}
```

`approval_required` is `false` — running QA is read-only reasoning plus pin-data test calls, not a consequential action itself.

Also write:
- `tests/workflow-qa/qa-report.md` — human/judge-readable twin of the same results, committed to the repo.
- `tests/workflow-qa/fixtures/*.json` — the actual pin-data payloads used for each live-tested category, so results are reproducible and inspectable.

## Validation (must run before reporting results)

- All 7 `CLAUDE.md` §15 categories appear in `results`, each with an honest `method_used` and `status` — a category checked only statically must never be reported as live-verified.
- Every `status: "fail"` or `"not_verified_mcp_unreachable"` also appears in `known_gaps` with a one-line reason.
- Every node name cited in `evidence` actually exists in `workflows/competition-demo.json` — no invented node names.
- No live call ever reached `execute_workflow`/`publish_workflow`, and duplicate-execution was never live-tested.
- If `qa-report.json` and `qa-report.md` disagree on any result, that's a bug in this skill's own output — fix before reporting done.

## Out of Scope

This skill does not modify `workflows/competition-demo.json` and does not decide production-readiness. It does not re-test `business-research`, `opportunity-score`, `proposal-generator`, or `execution-plan`'s own internal correctness — only the built workflow those stages fed into.
