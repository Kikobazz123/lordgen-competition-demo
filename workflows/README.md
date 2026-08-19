# workflows/

Generated n8n workflow exports land here, written by the `automation-builder` skill.

`competition-demo.json` — Nick's Plumbing & Air Conditioning starter automation (n8n workflow ID `055TNXGtfItIgqf1`, unpublished). Built and tested in Phase 6 against `data/execution-plan.json`. Credentials (OpenAI, Gmail) are placeholders — not production-ready as generated, per `CLAUDE.md` §14.

**Updated 2026-08-19** to fix two gaps `workflow-qa` found (`tests/workflow-qa/qa-report.md`): both Gmail nodes now route send failures to dedicated log nodes instead of losing them silently, and an `approved_by` column (Data Table + workflow) records who the approval request was addressed to — explicitly labeled as not identity-verified, since n8n's approval link requires no login. Both fixes were applied live via the n8n MCP `update_workflow` tool and verified with a fresh `test_workflow` happy-path run before this file was re-exported to match.
