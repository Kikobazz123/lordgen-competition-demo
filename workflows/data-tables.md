# n8n Data Tables — schema reference

Schemas only, pulled directly via `search_data_tables` on 2026-08-21. Row *contents* are not backed up here on purpose — both tables log transient, per-run pipeline state (idempotency checks, in-flight approval records), the same category of thing `.gitignore` already excludes for local `data/*` artifacts. Recreating a fresh instance needs the shape below, not the historical rows.

## `LordGen Demo Requests` (`QWBIWlMUtN2KCQEj`)

Idempotency + rate-limit log shared by all 5 live workflows (Diagnostic, Issue Proposal, Approval Decision, Approve, Handover) — every one inserts a row at the start of a request and updates it on completion, keyed by `request_id`.

| Column | Type |
|---|---|
| `request_id` | string |
| `stage` | string (`diagnostic` / `approve` / `handover`, etc. — which workflow logged this row) |
| `category` | string |
| `business_name` | string |
| `client_ip` | string |
| `status` | string (`processing` / `complete`) |
| `response_json` | string (full JSON of the final response, used to serve cached/duplicate requests) |
| `created_at` | date |
| `updated_at` | date |

## `LordGen Approvals` (`qR88lsLUiZszF5Jf`)

One row per issued proposal. Created by Issue Proposal, read/updated by Approval Decision (token lookup, expiry, recording the client's decision).

| Column | Type |
|---|---|
| `approval_id` | string |
| `proposal_ref` | string |
| `category` | string |
| `business_name` | string |
| `contact_email` | string |
| `token` | string (the tokenized link in the proposal email/website panel) |
| `status` | string (`awaiting_approval` / `approved` / `changes_requested` / `expired`) |
| `channel` | string (`email` / `website` — which surface recorded the decision) |
| `decided_at` | string |
| `decided_by` | string |
| `change_notes` | string |
| `proposal_json` | string (the full proposal payload, replayed into Approve/Handover on approval) |
| `expires_at` | string (14 days from issue) |

## Recreating in a fresh instance

Both tables need to exist with these exact column names before importing `workflows/live-*.json` — every node above references its table by ID, so after import each `dataTable` node's table reference needs repointing to the new table's ID (same column names, different ID). Not a code change, just a resource-locator update per `dataTable` node.
