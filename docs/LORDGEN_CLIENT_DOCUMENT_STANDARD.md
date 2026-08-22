# LORDGEN — Client Document Standard

Authoritative spec for every client-facing document and approval surface.
Supersedes the ad-hoc PDF template that produced `LordGen-Handover-GIG-Logistics.pdf`.

---

## 1. The core error to fix first

One document is currently doing two jobs and failing both.

A **proposal** is issued *before* the build. It asks for a decision.
A **handover** is issued *after* the build. It transfers an asset.

They have different readers, different content, and different calls to action. Merging
them produces a document that describes nothing concrete and asks for nothing specific —
which is what happened.

| | Build Proposal | Handover Pack |
|---|---|---|
| Issued | After diagnostic, before build | After build, before go-live |
| Reader | The decision-maker | The person who operates or extends it |
| Answers | "Should we do this?" | "What did I get and how do I run it?" |
| Ends with | An approval decision | An access checklist and support terms |
| Contains pricing | Yes | No — already agreed |
| Contains test evidence | No | Yes — this is the point |

Build both. Never merge them.

---

## 2. Hard output rules

These are assertions, not style guidance. A document that violates any of them must fail
generation with a named error rather than render.

**Content integrity**

1. The opportunity named in the document must equal the opportunity built. The GIG PDF is
   titled *CRM Handoff* and lists *Automated Customer Support Chatbot* as the opportunity
   addressed. Assert equality between these fields before render.
2. No field may render empty, as a placeholder, or as a slash-alternative. `Data Table /
   CRM record` means the system does not know which one it wrote to. If a value is
   unknown, generation fails.
3. Internal and test strings must never reach a client render. Hard-block the tokens:
   `judge`, `competition`, `demo`, `test`, `preset`, `template`, `auto-generated`,
   `placeholder`, `lorem`. `Approved by Judge (competition demo)` in a client PDF is
   disqualifying in front of a real buyer.
4. Never disclose the document's own machinery. `Auto-generated from the CRM Handoff
   template` tells the client they received a form letter.

**Writing**

5. Every process step names a system and an action. `Record validated` is not a step.
   `n8n validates the payload against required fields and rejects incomplete orders` is.
6. Steps: between 4 and 8, each under 20 words, each with an actor performing a verb.
7. Banned words in client-facing text: `etc`, `various`, `as needed`, `TBD`, `simple`,
   `robust`, `seamless`, `leverage`, `solution` used as a noun for the thing you built.
8. Write the summary in the client's vocabulary, not yours. GIG Logistics says *dispatch*,
   *waybill*, *consignment*. Use their words.
9. One disclaimer, once, in a fixed position. The GIG PDF says the same thing twice in
   adjacent lines.

**Presentation**

10. Numbering is owned by exactly one layer. `1. 1. Order/dispatch details received` is a
    manually numbered string inside an auto-numbered list. Strip the manual numbers at the
    data layer.
11. Every document carries: reference number, issue date, validity or version date,
    named preparer with contact, and version number.
12. No vendor footer. `Created via PDFShift` is removed at the render step.
13. `Integrations` lists systems the automation touches on the client's side. n8n is the
    runtime, not an integration — it belongs in a `Built on` field.

---

## 3. Required sections

### 3.1 Build Proposal

1. **Header block** — ref, date issued, valid until, prepared for (name + role), prepared
   by (name + contact), version.
2. **Summary** — three sentences: the problem, what will be built, the expected change.
3. **What we found** — the diagnostic finding, with its evidence and source. Quantified
   where the diagnostic produced a number.
4. **What we will build** — the automation name, whether it is a library build or a custom
   build, and a plain-English paragraph a non-technical reader can repeat to a colleague.
5. **How it works** — trigger, then the steps, per rules 5 and 6.
6. **What we need from you** — table of item, reason, owner, due date. Non-negotiable
   section. Its absence is why the current PDF cannot be acted on.
7. **In scope / Not in scope** — explicit exclusions. Prevents scope disputes later.
8. **Timeline** — milestones with dates, starting from approval, not from issue.
9. **Investment** — cost, what it covers, what recurs.
10. **Assumptions and risks** — at least the dependency risks from section 6.
11. **Your decision** — the two options, what each triggers, and the response deadline.

### 3.2 Handover Pack

1. **Header block** — as above, plus build completion date.
2. **What was built** — final automation name and one-paragraph description.
3. **Live status** — a per-integration table: system, connected or stubbed, credential
   owner. The client must know exactly what is real.
4. **How to run it** — trigger conditions and what a normal successful run looks like.
5. **Test evidence** — the scenarios run and their results. Reuse the fixture set already
   in `tests/workflow-qa/`: happy path, missing input, AI failure, approval rejected.
   This section is the strongest part of the document. Do not omit it.
6. **What happens when it fails** — each failure branch, what the automation does, who is
   notified.
7. **Handover to your developer** — where the workflow lives, how to export it, which
   environment variables it reads, what a developer must connect for production.
8. **Support and next steps** — what is covered, for how long, and the named contact.

---

## 4. Approval flow

### 4.1 States

```
inquiry_received → diagnostic_running → diagnostic_complete → proposal_issued
    → awaiting_approval → approved       → building → built → handed_over
                        → changes_requested → diagnostic_running
                        → expired
```

### 4.2 One record, two channels

Email and website must read and write the same approval record. If they can disagree, they
will, and the client will approve twice or see a stale page.

```
approval:
  id, proposal_ref, client_name, contact_email,
  token, expires_at,
  status, channel, decided_at, decided_by, change_notes
```

Rules:

- Email buttons and the website button POST to the same endpoint with the same token.
- Idempotent: a second approval returns the first outcome and does not trigger a second
  build.
- Tokens expire in 14 days and move the record to `expired`.
- Every transition is logged with channel and timestamp.
- The website panel renders its status from the record, so approving by email updates the
  page on next load.

### 4.3 The approval email

Subject: `Your automation build is ready for approval — {client_name} ({proposal_ref})`

Body, in order:

1. One sentence naming what will be built.
2. The three-sentence summary from the proposal.
3. The `What we need from you` items — the client should see the cost of saying yes before
   they say it.
4. Two buttons: **Approve and start the build** / **Request changes**.
5. The response deadline and what happens if it passes.
6. Named human contact with a real reply address.

Attach the proposal PDF. Include a plain-text fallback. Do not send an email whose only
content is a link.

### 4.4 The website panel

Rendered directly beneath the diagnostic result, as the next-phase step.

- Shows the same fields as the proposal: what will be built, trigger, steps, integrations,
  what we need from you.
- Primary button: **Approve and start the build**. Secondary: **Request changes**, opening
  a free-text field that writes to `change_notes`.
- A status line bound to the approval record: awaiting approval / approved on {date} via
  {channel} / changes requested.
- After approval, the panel is replaced by build progress, not left in place greyed out.

---

## 5. Library build vs custom build

The decision is made after the diagnostic and stated plainly in the proposal.

**Library build** — the top opportunity maps to an existing automation in the library and
the client's required fields are covered by it. Faster, already tested, lower cost.

**Custom build** — no library match, or the client's process needs steps the library
automation does not have.

State which one and why. A library build is a selling point — say *this is a build we have
tested and run before*, never *this is a preset*. The client is buying a working outcome,
and proven beats novel. But never claim a custom build when a library one was used.

---

## 6. Worked example — the GIG Logistics proposal, rewritten

> Every figure below must come from an actual diagnostic run. They are shown filled in to
> demonstrate the standard. Never ship an unverified number to a client.

---

**BUILD PROPOSAL**
**Reference** LG-2026-0820-GIG-01 · **Issued** 20 August 2026 · **Valid until** 3 September 2026
**Prepared for** GIG Logistics — {contact name}, {role}
**Prepared by** Mark, LordGen AI — {email} · **Version** 1.0

**Summary**

Every new dispatch is re-keyed into your CRM by hand after it is captured, and customer
confirmations wait on that manual step. We will build an automation that takes each order
at the point of capture, validates it, writes it to your dispatch record, and sends the
customer a confirmation without anyone touching it. Confirmations move from same-day to
under a minute, and no order can be lost between capture and CRM.

**What we found**

Order capture and CRM entry are separate manual actions performed by the same dispatch
staff. Confirmation timing therefore depends on staff availability rather than on order
volume, which is why confirmations cluster at the end of shifts.
*Source: {diagnostic finding reference}.*

**What we will build**

**Dispatch Capture and Confirmation** — a library build, adapted to your dispatch fields.
This automation has been built and tested before; we are fitting it to your order form and
record structure rather than designing it from scratch.

When a new dispatch is captured, the automation checks it has everything needed to act on,
writes it to your dispatch record, and confirms to the customer immediately. Incomplete
orders are held and flagged to a named person instead of failing silently.

**How it works**

Trigger: a new dispatch is submitted through your order form.

1. n8n receives the dispatch payload from your order form.
2. n8n checks required fields are present and flags incomplete records to dispatch.
3. n8n writes the validated dispatch to your CRM record.
4. n8n sends the customer a confirmation with their reference and expected timeline.
5. n8n logs the outcome so every run is auditable.

**Built on** n8n · **Connects to** your order form, your CRM, your email sender

**What we need from you**

| Item | Why | Owner | Due |
|---|---|---|---|
| CRM access for a service account | To write dispatch records | {IT contact} | Within 3 days of approval |
| Two sample dispatch records | To map your fields correctly | {Ops contact} | Within 3 days of approval |
| Sending email address and sender name | Customer confirmations must come from you | {Ops contact} | Before go-live |
| A named person for flagged orders | Incomplete records need a human owner | {Ops lead} | Before go-live |

**In scope** — capture, validation, CRM write, customer confirmation, run logging.
**Not in scope** — changes to your order form, CRM data cleanup, SMS or WhatsApp
confirmation, driver assignment or routing.

**Timeline** — Day 0 approval · Day 3 access confirmed · Day 5 build complete and tested ·
Day 7 handover and go-live decision.

**Investment** — {amount}, covering build, testing, and handover. No recurring fee from
LordGen; your n8n and email-sending costs remain yours.

**Assumptions and risks**

- Your CRM exposes an API or accepts an integration write. If it does not, we adjust to a
  file or table drop and reissue this proposal.
- Access arriving later than Day 3 moves every subsequent date by the same amount.
- Confirmation wording is yours to approve before go-live.

**Your decision**

**Approve and start the build** — we request access the same day and begin.
**Request changes** — tell us what to alter and we reissue within two working days.

Please respond by 3 September 2026. After that this proposal expires and pricing is
re-quoted.

---

## 7. Note on real company names

`PREPARED FOR GIG Logistics` on a document describing their internal operations reads as a
live engagement. For competition or portfolio use, either obtain permission or use a named
fictional company. A leaked demo document implying a client relationship that does not
exist is a real problem, not a cosmetic one.
