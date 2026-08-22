# workflows/

Generated n8n workflow exports land here.

## Current live system (5 workflows, all `active: true` as of 2026-08-21)

Full exports via `get_workflow_details`, re-importable into a fresh n8n instance. Each file's top-level shape is `{workflow: {...full definition...}, triggerInfo: "..."}`. Credential fields inside are references only (`{id, name}`) -- n8n never exports the underlying secret value, so every credential (Tavily, Gemini, Gmail, the 5 header-auth webhook tokens) must be re-created by hand in whatever instance these get imported into. See `.env.example` for the Vercel-side env var names these workflows' webhooks correspond to, and `data-tables.md` for the 2 Data Tables (`LordGen Demo Requests`, `LordGen Approvals`) they share.

| File | Workflow | n8n ID |
|---|---|---|
| `live-diagnostic.json` | LordGen Demo — Diagnostic | `et0jJOu7W7LUM12s` |
| `live-issue-proposal.json` | LordGen Demo — Issue Proposal | `9qzZd5vtRmNo2g4C` |
| `live-approval-decision.json` | LordGen Demo — Approval Decision | `d9VjPYl2YHrRNJmd` |
| `live-approve.json` | LordGen Demo — Automation Builder (Approve) | `ShrykM6oE65AvfuM` |
| `live-handover.json` | LordGen Demo — Handover | `ijF2Z5y4K5KaFIO9` |

Chain: Diagnostic -> (client picks findings) -> Issue Proposal (emails a tokenized Approve/Request-changes link) -> Approval Decision (idempotent, checks 14-day expiry) -> on approval, chains server-side into Approve -> Handover.

Two of these workflows' own internal `description` fields (Diagnostic, Approve) still read "Competition live-demo trigger, plumbing preset only" from before this system was rebuilt onto live research across 4 categories -- harmless leftover text, not corrected here per this pass's no-content-changes rule; worth a one-line fix in n8n directly whenever convenient.

## Superseded (Phase 6, kept for history)

`competition-demo.json` — Nick's Plumbing & Air Conditioning starter automation (n8n workflow ID `055TNXGtfItIgqf1`, unpublished, `active: false`). Built and tested in Phase 6 against `data/execution-plan.json`. Credentials (OpenAI, Gmail) are placeholders -- not production-ready as generated, per `CLAUDE.md` §14. From an earlier phase of the project, before the pivot to the 4-category live-research system above; kept as-is for historical reference, not part of the current live chain.

**Updated 2026-08-19** to fix two gaps `workflow-qa` found (`tests/workflow-qa/qa-report.md`): both Gmail nodes now route send failures to dedicated log nodes instead of losing them silently, and an `approved_by` column (Data Table + workflow) records who the approval request was addressed to -- explicitly labeled as not identity-verified, since n8n's approval link requires no login. Both fixes were applied live via the n8n MCP `update_workflow` tool and verified with a fresh `test_workflow` happy-path run before this file was re-exported to match.
