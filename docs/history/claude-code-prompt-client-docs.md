# Claude Code prompt — client documents and approval flow

Paste below the line into Claude Code from the repo root, with
`LORDGEN_CLIENT_DOCUMENT_STANDARD.md` placed at `docs/`.

---

The client-facing PDF the pipeline currently produces is not usable in front of a buyer.
Read `docs/LORDGEN_CLIENT_DOCUMENT_STANDARD.md` in full before writing any code — it is
now the authoritative spec for every client-facing document and approval surface, and it
supersedes the existing PDF template.

Do not start until you have read it and can tell me, in your own words, why the current
document fails. If your explanation is only "it looks unprofessional," read it again.

## Context

The flow is: client makes an inquiry → we run a diagnostic → we show the result → the
client approves → we build a library or custom automation for their business → we hand it
over. Two of those steps are currently broken: the client is never actually asked to
approve anything, and the document they receive describes nothing specific.

## Task 1 — Split the document into two

Build **Build Proposal** (pre-approval) and **Handover Pack** (post-build) as separate
templates with the section lists in §3 of the standard. They are different documents for
different readers. Do not produce one template with conditional sections.

Both read from the diagnostic and build records. Neither may invent content — if a
required value is missing, generation fails with a named error identifying the field.

## Task 2 — Enforce the output rules as code

The rules in §2 of the standard are assertions, not guidance. Write
`tools/validate_client_document.js` (or the repo's existing tools convention) that runs
before any render and hard-fails on:

- the named opportunity not matching the built opportunity
- any empty field, placeholder, or slash-alternative value
- any blocked internal token: judge, competition, demo, test, preset, template,
  auto-generated, placeholder, lorem
- any banned word from rule 7
- any step over 20 words, or a step count outside 4–8
- a missing reference number, issue date, preparer, or version
- duplicate numbering in an ordered list
- the PDFShift footer, or any vendor footer

Failing generation is correct behaviour. A document that renders with a defect is worse
than no document.

Write tests for the validator using the current GIG Logistics PDF content as a fixture. It
must fail on at least: the CRM Handoff / Chatbot mismatch, the `1. 1.` double numbering,
`Data Table / CRM record`, `Auto-generated from the CRM Handoff template`, and
`Approved by Judge (competition demo)`.

## Task 3 — Build the approval flow

Implement §4 of the standard: one approval record, two channels.

- An n8n workflow that issues the proposal email with Approve and Request Changes buttons.
- A website panel rendered directly under the diagnostic result showing the same fields as
  the proposal, with the same two actions.
- Both channels POST to the same tokenised endpoint through the existing
  `website/api/trigger-demo.js` relay pattern. Do not expose an n8n webhook URL to the
  browser.
- Approval is idempotent. A second approval returns the first outcome and does not start a
  second build.
- Tokens expire in 14 days.
- The website status line reads from the approval record, so approving by email is
  reflected on the page.

Ask me before wiring any live email sending.

## Task 4 — Make the library/custom decision explicit

After the diagnostic, decide whether the top opportunity maps to an existing library
automation or needs a custom build, per §5. The proposal must state which and why. Never
use the word "preset" in client-facing text — describe a library build as an automation we
have built and tested before.

## Output quality bar

The current PDF failed because it was assembled from fields without anyone asking whether
the result said anything. Before any document renders, it must pass this test: **a reader
who knows nothing about this project should be able to tell what is being built, for whom,
what it will change, and what they must do next.**

The worked example in §6 of the standard is the bar. Match its specificity — every step
naming a system and an action, a real dependency table with owners and dates, explicit
exclusions, a dated decision. Do not match its exact wording, and do not carry over its
illustrative figures; every number in a real document comes from the diagnostic run.

## Constraints

- No hardcoded hostnames or localhost URLs anywhere, including in generated documents and
  their examples. Environment variables only, documented in `.env.example`.
- Follow the existing repo conventions in `CLAUDE.md`.
- This work replaces existing document code. Delete what it supersedes rather than leaving
  both. The repo already carries roughly three lines of instruction docs for every line of
  website code — do not widen that ratio.

## Report back

At each task boundary, tell me what changed, what you deleted, and what the validator now
rejects. Do not report a task complete until its tests pass.
