# LordGen Agent Library — Specifications

**Status**: Phase A (specification) complete 2026-08-21. Nothing in this document is built yet
except LG-A3, which already exists. No n8n changes were made to produce this file.

## What this is

Seven starter automations ("agents") that address pain points common to essentially every small
and mid-sized business, regardless of industry. They exist so the website's Builder stage can hand
a client a **real, inspectable, tested automation** instead of a specification document
(`docs/architecture.md`'s "Builder scope stays spec-generation, not live deployment" — superseded
by this initiative, approved by the developer 2026-08-21).

Every agent below is populated through `docs/execution-plan-template.md`. That is deliberate:
`CLAUDE.md` §13 requires one predefined template, not a new format invented per automation.

## Honesty boundary — read before quoting any of this to a client

The "Problem" section of each agent describes a **pattern-level** pain point: something widely
observed across businesses. It is **not** research evidence about any specific named business, and
must never be presented as though it were. Grounding an agent in a *particular* client's reality is
the job of the Diagnostic stage's live research (`et0jJOu7W7LUM12s`), which produces sourced,
confidence-tagged findings per `CLAUDE.md` §11. This library supplies the machinery; research
supplies the evidence that a given client actually needs it.

Likewise, no success criterion here is a promised result. They are the measurements that would show
the automation worked, once a client is actually running it.

---

## Shared design (applies to all seven)

These conventions exist so that seven agents are seven instances of one proven pattern rather than
seven bespoke builds — cheaper to test, cheaper to hand over, and consistent for a developer
reading them cold.

### Trigger patterns

Two only:
- **Webhook** (header-auth, reached through the repo's Vercel relay — `website/api/trigger-demo.js`)
  for anything event-driven. The browser and the sender never see the n8n URL or token.
- **Schedule** for anything periodic.

### The log table

Every agent reads and writes one Data Table, `LordGen Agent Log`, with these columns:

| Column | Purpose |
|---|---|
| `request_id` | Idempotency key. Prevents duplicate execution (`CLAUDE.md` §15). |
| `agent_id` | Which agent wrote the row (`LG-A1` … `LG-A7`). |
| `business_name` | The client this instance serves. |
| `contact` | Customer/lead contact, where applicable. |
| `subject` | Short human-readable label for the item. |
| `status` | See status vocabulary below. |
| `ai_output` | The generated text, stored verbatim for audit. |
| `approved_by` | Identity of the human who approved an outbound action. Empty for unattended internal actions. |
| `created_at` | Row write time. |
| `notes` | Plain-language explanation of what happened, especially on failure paths. |

`approved_by` exists specifically because `data/qa-report.json` records a real gap in LG-A3 — the
approval log captured a generic notes string instead of who approved. Every agent in this library
captures the identity; LG-A3 gets retrofitted to match in Phase D.

### Status vocabulary

`approved_sent` · `rejected` · `flagged_missing_input` · `flagged_ai_failed` ·
`flagged_delivery_failed` · `escalated_to_human` · `skipped_duplicate` · `logged_internal`

### Human approval convention

Anything **customer-facing** passes through a Gmail approval step before it is sent, per
`CLAUDE.md` §10. Anything **internal-only and read-only** (an alert to the business owner, a digest
of the owner's own data) does not — it cannot reach a customer, cannot spend money, and cannot be
undone-by-being-seen. Where an agent takes that exemption, the agent's own Human Approval Points
section says so explicitly and justifies it. No agent may send to a customer unattended.

### Error handling convention

Every agent implements four failure branches, each terminating in its own log write and a NoOp end
node, so a developer can see in the n8n canvas exactly where a run died:

1. **Missing/invalid input** → `flagged_missing_input`, halts before any AI spend.
2. **Malformed AI output** → `flagged_ai_failed`, halts before any send.
3. **External delivery failure** → `flagged_delivery_failed`, reached via the node's **error
   output**, not just an IF branch. This closes the open **fail** in `data/qa-report.json`, where
   neither Gmail node on LG-A3 had error-output routing at all.
4. **Rejected at approval** → `rejected`, nothing sent.

### Credentials (identical for all seven, supplied per client)

- **OpenAI** — chat model for the AI step.
- **Gmail** — send and approval.

Neither is baked into an exported workflow. Each agent ships unpublished (`active: false`) with
placeholder credential references, exactly as LG-A3 does today. Attaching credentials and creating
the Data Table is the deploying developer's job and is documented in each agent's handover pack.

> **Known blocker (2026-08-21):** `list_credentials` reports **zero OpenAI credentials** in this
> n8n instance. Every agent below can be built, validated and pin-data tested without one, but the
> AI step cannot be proven against a live model until the developer creates that credential — n8n's
> API exposes no `create_credential` tool, so it cannot be done from a session.

### Build gotchas that apply to every agent

Carried forward from `docs/architecture.md`'s Phase 3 findings — these caused real bugs already:

1. `renameNode` does not change a node's type. Wrong-typed node → `removeNode` + `addNode`.
2. A `dataTable` "get" returning zero rows skips every downstream node. Fix: `setNodeSettings` with
   `{alwaysOutputData: true}`, issued as its own operation — it is silently ignored inline on `addNode`.
3. A node chained after a `dataTable` insert/update inherits raw snake_case row output, not the
   upstream camelCase context. Reference an earlier named node explicitly; never bare `$json` there.

---

# LG-A1 — Lead Response Agent

**Pain point: enquiries go cold because nobody replies fast enough.**

## Objective
Ensure every inbound enquiry receives a qualified, human-approved reply within minutes of arriving,
including outside working hours, without anyone having to watch an inbox.

## Problem
Inbound enquiries arrive at all hours and while staff are mid-task. The delay between an enquiry
landing and a human answering it is the point at which most enquiries are lost — the sender moves
on to whoever replied first. Pattern-level pain point; not a research finding about any named business.

## Proposed Solution
A webhook receives the enquiry. A scoped AI step qualifies it (intent, urgency, whether it is a fit)
and drafts a short reply grounded strictly in what the sender actually wrote. A human approves,
edits, or rejects. Only on approval is anything sent.

## Trigger
Webhook — website contact form, landing-page form, or a forwarded enquiry email. Header-auth,
reached through the Vercel relay.

## Inputs
Sender name; contact (email and/or phone); enquiry message text; source label; received timestamp;
optional business context string (what the business does, supplied once at deployment).

## AI Processing
One scoped step. Classifies `intent` (enquiry / quote request / complaint / spam / unclear) and
`urgency` (high / normal / low), then drafts a 3–5 sentence reply. The prompt forbids inventing
prices, availability, delivery times, or any commitment not present in the input or the business
context string. An unintelligible or empty message must be flagged as incomplete rather than
answered with a guess. Output is JSON, validated before use.

## Workflow Steps
1. Enquiry received (webhook).
2. Normalize payload; assign `request_id`.
3. Validate required fields (contact, message) — halt and flag if missing.
4. Duplicate check against the log table — skip if this `request_id` was already handled.
5. AI qualifies the enquiry and drafts the reply.
6. Validate AI output shape — halt and flag if malformed.
7. Route: `intent = spam` → log and stop, no human bothered, nothing sent.
8. Human reviews the draft and approves, edits, or rejects.
9. On approval: send the reply to the sender.
10. Log outcome, AI output, and approver identity.

## Integrations
n8n (workflow engine); OpenAI (drafting/classification); Gmail (approval + send); n8n Data Table
(log and idempotency). No new dependency beyond the approved stack.

## Data Requirements
Reads: the inbound enquiry payload; the business context string; prior rows in `LordGen Agent Log`
for the duplicate check. Writes: one row per enquiry.

## Human Approval Points
**Step 8, mandatory** — no reply reaches a sender without a human approving it. The spam branch at
step 7 sends nothing and therefore needs no approval.

## Outputs
An approved reply delivered to the enquirer; a log row carrying the qualification, the draft, the
approver, and the outcome.

## Error Handling
Missing contact or message → `flagged_missing_input`, before any AI spend. Malformed AI JSON →
`flagged_ai_failed`, nothing sent. Gmail failure on either the approval request or the customer
send → error output → `flagged_delivery_failed`. Rejected at approval → `rejected`. Repeat
`request_id` → `skipped_duplicate`.

## Testing
All seven `CLAUDE.md` §15 categories, pin data: happy path; missing contact; missing message;
Gmail unavailable (both nodes); malformed AI output; same `request_id` replayed; and a direct
attempt to reach the send node without passing approval.

## Deployment
Imported into the client's own n8n, credentials attached, Data Table created, webhook URL pointed at
the client's form. Published only by the client's developer after review.

## Success Criteria
Every enquiry produces either an approved reply or an explicitly flagged log row — no silent drops.
Zero sends without a recorded `approved_by`. Time from enquiry received to reply sent is measurable
from the log and is the number the client actually cares about.

---

# LG-A2 — Appointment Reminder Agent

**Pain point: no-shows and forgotten appointments.**

## Objective
Reduce no-shows by reliably reminding customers of upcoming appointments, and give the business a
record of who confirmed and who did not.

## Problem
Appointments booked days in advance are forgotten. Manual reminders get skipped when the day is
busy — which is exactly when the schedule is fullest and a no-show costs the most. Pattern-level
pain point.

## Proposed Solution
A scheduled run collects tomorrow's appointments, an AI step writes a short personalised reminder
per appointment, the whole batch is approved in one action, and reminders go out together.

## Trigger
Schedule — once daily at a configured hour, covering the next day's appointments.

## Inputs
Appointment records: customer name, contact, appointment datetime, service/purpose, location or
staff member. Sourced from the log table's booking rows in v1, or from whatever booking system the
client already runs, which is a per-client integration decision, not an assumption made here.

## AI Processing
One step per appointment: a 2–3 sentence reminder using only the fields supplied. The prompt forbids
inventing prices, durations, preparation instructions, or cancellation terms. Missing datetime or
contact → flag that record, continue with the rest of the batch.

## Workflow Steps
1. Schedule fires.
2. Fetch appointments in the target window.
3. Zero appointments → log `logged_internal`, end cleanly. (Explicit branch — an empty result must
   not silently skip the run.)
4. Per record: validate required fields.
5. AI drafts the reminder.
6. Validate AI output.
7. Assemble the batch into one approval digest.
8. Human approves the batch, or rejects it.
9. On approval: send each reminder.
10. Log every reminder individually — sent, failed, or skipped — with the approver identity.

## Integrations
n8n; OpenAI; Gmail (batch approval + sends); Data Table.

## Data Requirements
Reads appointment records and prior reminder rows (so the same appointment is not reminded twice).
Writes one row per reminder attempt.

## Human Approval Points
**Step 8, mandatory** — one approval covers the batch, because approving twenty reminders
individually is the kind of friction that gets an automation switched off. Nothing is sent before it.

## Outputs
Reminders delivered; a per-appointment log row; a batch record showing who approved and when.

## Error Handling
Empty window → clean logged end, not a failure. Missing contact/datetime on one record →
`flagged_missing_input` for that record only, batch continues. Malformed AI output for one record →
`flagged_ai_failed` for that record only. Gmail failure → error output → `flagged_delivery_failed`,
per record so a single bad address cannot lose the batch. Batch rejected → all rows `rejected`.

## Testing
Seven §15 categories plus two batch-specific cases: an empty window, and a batch where one record
is malformed and the rest must still send.

## Deployment
As LG-A1, plus connecting the appointment source. If the client's bookings live in a system LordGen
has not integrated, that is an **open dependency** to resolve at deployment — not something to
assume away.

## Success Criteria
Every appointment in the window is either reminded or explicitly flagged. No duplicate reminders for
one appointment. No-show rate before versus after is the client's own measurement.

---

# LG-A3 — Quote & Estimate Agent

**Pain point: quotes and estimates take days to reach the customer, in a form they cannot read.**

> **Already built.** n8n workflow `055TNXGtfItIgqf1`, 20 nodes, exported to
> `workflows/competition-demo.json`, live-tested (executions 9–12). Unpublished, placeholder
> credentials. Its full plan is `data/execution-plan.json` — the authoritative spec for this agent,
> not this summary. Phase D brings it up to the shared conventions above.

## Objective
Ensure every customer receives an independently readable, plain-language summary of their price
estimate at the same time it is presented to them, so an illegible on-device screen is never their
only record of what was quoted.

## Problem
Grounded in a directly-verified BBB review (Jim B, 2026-02-04) — shown ~$1,600 on a technician's
tablet, billed $7,000, terms in unreadable font. **Single account, n=1, verified but not established
as a company-wide pattern** (`data/proposal.json.confidence_caveat`). This is the one agent in the
library with real sourced evidence behind it, and that evidence is one review.

## Proposed Solution
On estimate submission, an AI step drafts a plain-language summary (scope, price, key terms) from
the structured estimate data, a human approves it, and it goes to the customer alongside whatever
is shown on-device.

## Trigger
Webhook — estimate submitted (job ID, price, scope, customer contact).

## Inputs
Job ID; customer contact; scope of work / line items; price or price range.

## AI Processing
One scoped step drafting a 2–4 sentence customer-facing summary strictly from the structured fields.
Forbidden from inventing numbers, services, or terms. Missing price or scope → flag incomplete rather
than guess.

## Workflow Steps
As `data/execution-plan.json.workflow_steps` 1–7, built node-for-node and verified in QA:
receive → validate → duplicate check → AI draft → validate output → dispatcher approval → send → log.

## Integrations
n8n; OpenAI; Gmail; Data Table (`LordGen Estimate Summary Log`).

## Data Requirements
Reads the estimate payload. Writes job_id, contact, scope, price, status, summary text, sent_at,
notes, approved_by.

## Human Approval Points
Dispatcher approval before any customer send — built and verified live (execution 12).

## Outputs
Approved plain-language summary sent to the customer; logged record of what was sent and by whose
approval.

## Error Handling
Missing input, AI failure, and rejection branches are built and tested. **Two open items, both
fixed in Phase D**: no error-output routing on either Gmail node (open **fail** in
`data/qa-report.json`), and `approved_by` was added to the table but the insert still writes a
generic notes string instead of the approver's identity.

## Testing
Happy path, missing input, AI failure, and approval gate all **pass live** (executions 9–12).
External failure **fails** pending the Phase D fix.

## Deployment
Unpublished. Requires the `LordGen Estimate Summary Log` Data Table and real OpenAI + Gmail
credentials. Four QA rows (ids 5–8) remain in the live table and need manual deletion before any
judged run — no MCP tool deletes Data Table rows.

## Success Criteria
Every estimate produces a customer-readable summary or an explicit flag. Zero customer sends without
recorded approval.

---

# LG-A4 — First-Response Support Agent

**Pain point: the same customer questions, answered by hand, over and over.**

## Objective
Answer the routine, repetitive questions automatically and correctly, and get everything else in
front of a human quickly — rather than letting a full inbox bury both kinds equally.

## Problem
A large share of inbound customer messages are the same handful of questions: opening hours,
location, pricing basics, whether you do X. Answering them by hand consumes the time needed for the
messages that genuinely require judgement. Pattern-level pain point.

## Proposed Solution
An inbound question is answered by an AI step working **only** from a bounded, client-supplied
knowledge set. A confidence gate decides what happens next: a confident answer becomes an approved
reply; anything uncertain is escalated to a human with the question intact.

## Trigger
Webhook — support form, forwarded support email, or website chat handoff.

## Inputs
Customer contact; question text; the client's knowledge set (a Data Table of question/answer and
policy entries, populated at deployment).

## AI Processing
One step. Answers strictly from the supplied knowledge entries, which are passed into the prompt.
The prompt forbids answering from general knowledge — if the knowledge set does not cover the
question, the correct output is an explicit "not covered", not a plausible-sounding guess. Returns
the answer plus a self-reported `confidence` and the knowledge entry IDs used, so a human can check
the reasoning.

> **Deliberate architectural limit.** v1 passes a bounded knowledge set directly into the prompt. It
> does **not** introduce a vector database or RAG stack — that is a new dependency requiring its own
> justification under `CLAUDE.md` §6. The consequence is real and must be stated in handover: this
> works well for a few dozen knowledge entries and degrades as that set grows. A client needing
> hundreds of entries needs a different design, and should be told so.

## Workflow Steps
1. Question received (webhook).
2. Normalize; assign `request_id`.
3. Validate contact and question present.
4. Duplicate check.
5. Load the knowledge set.
6. AI answers, with confidence and cited entry IDs.
7. Validate AI output.
8. Confidence gate: below threshold, or "not covered" → escalate to a human, log
   `escalated_to_human`, send nothing to the customer.
9. Above threshold → human approves the draft answer.
10. On approval: send. Log outcome, cited entries, and approver.

## Integrations
n8n; OpenAI; Gmail (approval, send, escalation); Data Table (knowledge set + log).

## Data Requirements
Reads the knowledge set and prior rows. Writes one row per question including which knowledge
entries were cited — this is what makes a wrong answer diagnosable later.

## Human Approval Points
**Step 9, mandatory** for every customer-facing answer, including high-confidence ones. Step 8's
escalation is itself a handoff to a human and sends nothing to the customer.

## Outputs
An approved answer, or an escalation to a human with the original question preserved. A log row
either way.

## Error Handling
Missing question/contact → `flagged_missing_input`. Empty knowledge set → escalate every question
rather than answer from thin air. Malformed AI output → `flagged_ai_failed`. Gmail failure → error
output → `flagged_delivery_failed`. Low confidence is **not** an error — it is the escalation path
working as designed.

## Testing
Seven §15 categories plus three agent-specific cases: a question the knowledge set covers well; a
question it does not cover at all (must escalate, must not invent); and an empty knowledge set.

## Deployment
As LG-A1, plus populating the knowledge set — the client's own words, not LordGen's summary of them.

## Success Criteria
No customer receives an answer that is not traceable to a cited knowledge entry. Uncovered questions
escalate rather than get guessed at. The share of questions handled without human drafting is the
client's measurement.

---

# LG-A5 — Follow-Up Agent

**Pain point: follow-up never actually happens.**

## Objective
Make sure no quoted, enquiring, or in-progress customer goes quiet simply because following up was
nobody's specific job that week.

## Problem
Follow-up is universally understood to matter and is the first thing dropped under load. The record
of who is owed a follow-up usually lives in someone's memory rather than in a system. Pattern-level
pain point.

## Proposed Solution
A scheduled run finds records that have had no contact for a configured number of days, an AI step
drafts a follow-up that references what actually happened previously, a human approves the batch,
and the follow-ups go out.

## Trigger
Schedule — configurable, weekly by default.

## Inputs
Log rows with a status indicating an open loop (quoted, enquired, awaiting decision);
days-since-last-contact threshold; the original interaction context stored on each row.

## AI Processing
One step per record. Drafts a short follow-up referencing the prior interaction using only what the
log row actually contains. Forbidden from inventing prior conversations, new offers, discounts, or
deadlines. A row with no usable context → flag, do not fabricate a pretext for contact.

## Workflow Steps
1. Schedule fires.
2. Query rows past the threshold with an open-loop status.
3. Zero matches → log `logged_internal`, clean end.
4. Per record: validate contact and context present.
5. AI drafts the follow-up.
6. Validate output.
7. Assemble the batch into one approval digest.
8. Human approves or rejects the batch.
9. On approval: send each follow-up.
10. Update each row's last-contact timestamp and log the send with the approver.

## Integrations
n8n; OpenAI; Gmail; Data Table.

## Data Requirements
Reads open-loop rows. Writes a follow-up row per send **and** updates last-contact on the original —
without that update, the same customer is followed up every single run, which is worse than no
follow-up at all.

## Human Approval Points
**Step 8, mandatory.** Follow-ups are unsolicited outbound contact and are exactly the category
`CLAUDE.md` §10 exists to gate.

## Outputs
Approved follow-ups sent; original rows updated; a log row per send.

## Error Handling
No matches → clean logged end. Missing contact/context → `flagged_missing_input` for that record.
Malformed AI output → `flagged_ai_failed` for that record. Gmail failure → error output →
`flagged_delivery_failed`. Batch rejected → all `rejected`, no timestamps touched.

## Testing
Seven §15 categories plus: no matching records; a record with contact but no usable context (must
flag, must not invent); and — critically — a **replay test** proving that a record followed up in
run 1 is not followed up again in run 2.

## Deployment
As LG-A1. The threshold and cadence are client decisions and belong in the handover pack, not
hard-coded silently.

## Success Criteria
No open-loop record ages past the threshold without either a follow-up or an explicit flag. No
customer receives two follow-ups for the same open loop. Zero sends without recorded approval.

---

# LG-A6 — Complaint Triage Agent

**Pain point: complaints slip through and escalate.**

## Objective
Make sure a serious complaint reaches a human immediately rather than sitting in a queue behind
routine mail, and that every complaint is acknowledged and recorded.

## Problem
Complaints arrive through the same channels as everything else and are triaged by whoever happens to
read them. A serious one waiting hours behind routine messages is how a recoverable problem becomes
a public review. Pattern-level pain point.

## Proposed Solution
An AI step classifies each inbound complaint by severity, category, and sentiment. Urgent ones
trigger an immediate internal alert to the owner. Routine ones get a drafted acknowledgement that a
human approves before it is sent. Everything is logged.

## Trigger
Webhook — complaint form, forwarded complaint email, or a routed message from LG-A1
(`intent = complaint`).

## Inputs
Complainant contact; complaint text; source; received timestamp; optional related job/order reference.

## AI Processing
One step. Returns `severity` (urgent / routine), `category`, `sentiment`, a one-line internal
summary, and — for routine complaints only — a drafted acknowledgement. The prompt forbids admitting
fault, offering refunds/compensation, or making any commitment; the acknowledgement confirms receipt
and states that a human is reviewing. **Ambiguous severity classifies as urgent.** Getting a serious
complaint wrong costs far more than an unnecessary alert.

## Workflow Steps
1. Complaint received.
2. Normalize; assign `request_id`.
3. Validate contact and complaint text present.
4. Duplicate check.
5. AI classifies and, if routine, drafts the acknowledgement.
6. Validate output.
7. Severity gate.
8. **Urgent** → immediate internal alert to the business owner with the complaint verbatim and the
   AI summary → log `escalated_to_human`. Nothing sent to the complainant automatically.
9. **Routine** → human approves the acknowledgement → send → log with approver.

## Integrations
n8n; OpenAI; Gmail (internal alert, approval, send); Data Table.

## Data Requirements
Reads the complaint payload. Writes one row per complaint with the classification, the verbatim
text, and the outcome. The verbatim text matters: a summary is not an adequate record of a complaint.

## Human Approval Points
**Step 9, mandatory**, for the customer-facing acknowledgement.

**Step 8 takes the internal-only exemption** defined in Shared Design: the urgent alert goes to the
business owner, contains only data the business already holds, reaches no customer, spends nothing,
and is reversible in the only sense that matters — the owner reads it and decides. Gating it behind
an approval would defeat its entire purpose, since the person who would approve it is the person it
is alerting. This is the sole unattended send in the library, and it is internal.

## Outputs
An urgent internal alert, or an approved acknowledgement to the complainant. A logged record either
way, with the original text preserved.

## Error Handling
Missing text/contact → `flagged_missing_input`. Malformed AI output → `flagged_ai_failed`, **and
the complaint is escalated to a human anyway** — an unclassifiable complaint is the last thing that
should be dropped. Gmail failure on the urgent alert → error output → `flagged_delivery_failed`,
which is a high-severity condition and must be visibly logged, not swallowed. Duplicate → skip.

## Testing
Seven §15 categories plus: an unambiguously urgent complaint; an unambiguously routine one; an
ambiguous one (must classify urgent); and malformed AI output (must still escalate).

## Deployment
As LG-A1, plus setting the owner's alert address. If LG-A1 is also deployed, its complaint branch
routes here rather than duplicating the classification logic.

## Success Criteria
Every complaint produces a logged row containing the original text. Every urgent complaint reaches a
human without waiting for an approval cycle. No acknowledgement is sent without approval, and no
acknowledgement ever admits fault.

---

# LG-A7 — Weekly Operations Digest Agent

**Pain point: the owner has no idea what actually happened this week.**

## Objective
Give the business owner one short, plain-English weekly summary of what the automations handled,
what needs attention, and what failed — without them having to open n8n or read a log table.

## Problem
Once automations are running, their activity becomes invisible. Failures accumulate silently, and
the owner's confidence in the system decays because there is no evidence it is working.
Pattern-level pain point, and the one most often left unsolved because it benefits nobody but the owner.

## Proposed Solution
A weekly scheduled run reads the last seven days from the log table, an AI step summarises it in
plain English organised around what needs the owner's attention, and it is emailed to the owner.

## Trigger
Schedule — weekly, at a configured day and hour.

## Inputs
All `LordGen Agent Log` rows from the last seven days, across every deployed agent.

## AI Processing
One step. Produces a plain-language summary: volumes handled per agent, items flagged or escalated,
anything that failed, and what needs the owner's attention. The prompt forbids inventing figures,
trends, or comparisons not derivable from the rows supplied, and forbids reassuring language about
weeks with failures in them. Counts are computed **before** the AI step, deterministically, and
passed in — an LLM is not asked to do arithmetic on a log table.

## Workflow Steps
1. Schedule fires.
2. Query the last seven days of rows.
3. Zero rows → send an honest "nothing ran this week" digest. That is itself information the owner
   needs, and is frequently the first sign something is broken.
4. Compute counts deterministically per agent and per status.
5. AI writes the plain-English summary from the rows and the computed counts.
6. Validate output.
7. Email the digest to the owner.
8. Log `logged_internal`.

## Integrations
n8n; OpenAI; Gmail (internal send); Data Table (read).

## Data Requirements
**Reads only.** Writes one row recording that the digest was sent. This agent modifies no business
data and touches no customer.

## Human Approval Points
**None, by design, and this is the second internal-only exemption.** The digest goes to the business
owner, contains only that business's own data, reaches no customer, spends nothing, and changes
nothing. Requiring the owner to approve a summary addressed to the owner is circular. Every other
agent's customer-facing action remains gated.

## Outputs
A weekly plain-English digest email; one log row confirming it was sent.

## Error Handling
Zero rows → honest empty digest, not a silent skip. Malformed AI output → `flagged_ai_failed` and
send the deterministic counts alone, without the AI narrative — a plain digest is far better than no
digest. Gmail failure → error output → `flagged_delivery_failed`, logged so the next run's digest
shows the previous failure.

## Testing
Seven §15 categories plus: a week with zero rows; a week containing failures (the summary must
surface them, not smooth them over); and malformed AI output (must still send the counts).

## Deployment
As LG-A1, plus setting the owner's address and the weekly schedule. Depends on at least one other
agent being deployed — it summarises their output.

## Success Criteria
The owner receives a digest every week without exception, including weeks where nothing happened or
things went wrong. Every failure logged during the week appears in that week's digest.

---

## Builder-stage mapping (the Phase E contract)

This replaces the single-`simple`-template table in `docs/architecture.md`. Matching is by **pain
point**, not by industry — that is the whole point of choosing these seven.

| Diagnostic finding resembles | Agent returned | Status |
|---|---|---|
| Slow/missed response to enquiries | LG-A1 Lead Response | `agent_available` |
| No-shows, missed appointments | LG-A2 Appointment Reminder | `agent_available` |
| Slow quotes/estimates, pricing confusion | LG-A3 Quote & Estimate | `agent_available` |
| Repetitive customer questions | LG-A4 First-Response Support | `agent_available` |
| Leads/quotes going quiet, no follow-up | LG-A5 Follow-Up | `agent_available` |
| Complaints mishandled or missed | LG-A6 Complaint Triage | `agent_available` |
| No visibility into operations | LG-A7 Weekly Digest | `agent_available` |
| Anything else, or Deep Diagnostic mode | — | `developer_review` |

`developer_review` is retained deliberately. A client whose need genuinely falls outside these seven
should be told that plainly and routed to a developer, exactly as today — presenting a near-miss
agent as a match would be the dishonest option, and would be the fastest way to lose the client's
trust in everything else the system said.

## Open dependencies

1. **OpenAI credential absent from n8n.** Blocks live proof of the AI step in six of seven agents.
   Developer action only.
2. **LG-A2's appointment source** is per-client. v1 reads the log table; a client with an existing
   booking system needs that integration scoped at deployment.
3. **LG-A4's knowledge-set ceiling.** Prompt-passed knowledge does not scale past a few dozen
   entries. A client needing more needs a different design and must be told before deployment, not after.
4. **Four QA rows (ids 5–8) still in the live `LordGen Estimate Summary Log`** need manual deletion
   in the n8n UI before any judged run. No MCP tool deletes Data Table rows.
