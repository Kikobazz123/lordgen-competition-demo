---
name: automation-builder
description: Translate data/execution-plan.json into a real, tested n8n workflow using n8n's MCP server, without ever activating or executing it against live services without explicit human approval. Use after execution-plan has produced data/execution-plan.json AND n8n MCP is connected.
---

# Automation Builder

## Purpose

Turn the execution plan into a real starter automation in n8n — not a hand-written JSON guess at what n8n workflows look like. This skill only works once n8n's MCP server is connected (`docs/architecture.md`); it must not fabricate n8n tool calls or workflow structure if the server isn't available.

## Precondition check (do this first, every time)

1. Confirm n8n MCP tools are actually available (e.g. via `ToolSearch`). If not connected, **stop and say so** — do not simulate what the workflow "would" look like as if it were built; that's `execution-plan.md`'s job, already done.
2. Read `data/execution-plan.json` in full, especially `open_dependencies` — do not build around a dependency that's still unresolved (e.g. an unidentified source system) without flagging it.

## Method (n8n's own documented MCP tools — see `docs/n8n-reference.md` for the full list and source)

Build in this order, using n8n's Workflow Builder tools:

1. `search_nodes` — find the actual nodes needed (trigger type, HTTP/webhook, AI/LLM node, notification node) rather than guessing node names.
2. `get_workflow_best_practices` — pull n8n's own guidance for the relevant technique (e.g. webhook triggers, error handling) before writing SDK code.
3. Draft the workflow as n8n Workflow SDK code, matching `data/execution-plan.json`'s `workflow_steps` one-to-one — every step in the plan should be a traceable node or node group, and vice versa (no extra nodes the plan didn't ask for, no missing steps).
4. `validate_workflow` (and `validate_node_config` for individual nodes) — fix errors before creating anything in n8n.
5. `create_workflow_from_code` — create the workflow in n8n, **left unpublished/deactivated**.
6. `prepare_workflow_pin_data` + `test_workflow` — test using pin data, which bypasses real external services (per n8n's own docs). This is how "Testing" in the execution plan actually gets exercised, not simulated.
7. Export/describe the result into `workflows/competition-demo.json` and report it for human review.

## Hard rules

- **Never call `publish_workflow` or `execute_workflow` against real external services without the developer's explicit, in-the-moment approval.** `test_workflow` with pin data is the only execution mode this skill may use autonomously — it's specifically designed not to touch live services. This mirrors `CLAUDE.md` §10 and the Human Approval Point already written into `execution-plan.md`.
- **Never silently substitute a different node/service than what `execution-plan.md` specifies.** If the right node doesn't exist or the plan's approach isn't buildable as described, stop and report the discrepancy (`CLAUDE.md` §8) rather than quietly building something adjacent.
- **The Gmail send step stays a draft, not a send**, consistent with the Gmail MCP connector available in this environment (`create_draft` only, no send tool) — the workflow should produce a draft for a human to send, or clearly mark where a real send capability would need to be added and approved.
- Every node the plan calls for as an error-handling or validation step must actually exist in the built workflow — cross-check against `data/execution-plan.json.error_handling` before calling this skill done.

## Required Output

- The workflow created in n8n (unpublished)
- `workflows/competition-demo.json` — exported/described workflow, for the repo and for Phase 8 (Integrations/handoff)
- A short build report: which execution-plan steps map to which nodes, what was tested (with pin data) and the result, and any plan items that couldn't be built as specified

## Out of Scope

This skill does not connect ClickUp or decide human-approval UX beyond what's already in `execution-plan.md` — those are Phase 7 (Integrations). It does not activate the workflow for production use under any circumstance.
