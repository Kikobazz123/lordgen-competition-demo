# LordGen AI — Client Handover Generator

**Build instructions for Claude Code**
Version 1.0 · Companion to `LORDGEN_UNIVERSAL_HANDOVER_SPEC.md`

---

## 0. How to use this file

Place this file and `LORDGEN_UNIVERSAL_HANDOVER_SPEC.md` in the repo root (or `docs/`), then start Claude Code with:

> Read `LORDGEN_UNIVERSAL_HANDOVER_SPEC.md` and `LORDGEN_HANDOVER_GENERATOR_BUILD.md`. Work through §15 Build Order. Stop at each commit point and show me the diff.

**Source of truth:** `LORDGEN_UNIVERSAL_HANDOVER_SPEC.md`.
This file is the implementation of that spec — it adds structure, contracts, and gates. It adds no client-facing requirements of its own. **Where the two disagree, the spec wins.** Anything in here marked `[NEEDS RULING]` must be answered by the project owner before it is coded, not guessed.

---

## 1. Mission

Build a **generator**, not a document.

Input: one structured brief per client, populated from the website intake/diagnostic answers.
Output: a handover pack that a non-technical business owner can read, understand, and approve — plus a separate internal section the developer can wire from.

The generator must work identically for a logistics company, a dental clinic, a law firm, or a poultry supplier. **Nothing about any industry may be hard-coded.** If a section can only be produced by knowing "this is logistics", the section is built wrong.

The commercial reality this exists to serve: this document is often the first thing a client sees that they didn't pay for yet. It either reads like a consultancy or it reads like a template with a logo on it.

---

## 2. Ground rules (non-negotiable)

| # | Rule | Source |
|---|---|---|
| G1 | Never state that something was built, tested, connected, or approved unless the input data records it. | Spec §6, §7, §13 |
| G2 | Never call an automation production-live unless real systems are connected and confirmed. | Spec §6 |
| G3 | Never invent research findings. If research wasn't done, say so. | Spec §4 |
| G4 | No technical vocabulary in client-facing sections unless genuinely necessary **and** explained in plain English on first use. | Spec §1 |
| G5 | Never instruct a client to send passwords or sensitive credentials by ordinary email. | Spec §10 |
| G6 | Client content and developer content are visually separated. | Spec §11, §15 |
| G7 | No invented numbers. No percentages, hours saved, or money figures unless supplied in the input with a source. | Spec §4 ("only present research findings that can actually be supported") |
| G8 | Missing data produces a declared empty state, never filler and never a guess. | Spec §4, §15 |
| G9 | No hardcoded localhost or absolute environment URLs anywhere — templates, README, examples, or config. Use relative paths and configurable variables (`BASE_URL`, `PDF_RENDER_URL`). | Project standing rule |
| G10 | The generator refuses to emit a PDF if the QA gate (§13) fails. Failing loudly is correct; shipping a broken client document is not. | Spec §15 |

---

## 3. Defect register — what is wrong with the current output

This is the regression list. The rebuild is not done until every row is closed. Evidence is from `LordGen-Handover-GIG-Logistics.pdf` (Ref LG-20260820-GIGLOGISTICS-01, v1.0).

| # | Defect | Evidence in v1.0 | Spec clause | Required fix |
|---|---|---|---|---|
| D1 | Five client sections missing entirely. The document opens at "What was built". | No opportunity section, no category education, no example flow, no research, no recommended-automation narrative | §1–§5, flow 1–5 | Generate all twelve flow sections |
| D2 | Internal tool names in client copy | "n8n receives the dispatch details", "n8n checks required fields", "runs in n8n", "export it as JSON" | §1 | Plain-English gate (§9) |
| D3 | Developer jargon presented as client status | "Stubbed — needs your real system connected", column header "CREDENTIAL OWNER" | §1, §6 | Status enum + plain-English labels |
| D4 | Duplicated paragraph | "Handover to your developer" states the same instruction twice in near-identical wording | §15 (visually clean) | Duplicate-block check (§13) |
| D5 | No approval instruction anywhere | The document never tells the client how to approve | §8 | Mandatory approval block with exact phrase |
| D6 | Contradictory approval record | Footer reads "Approved by Chidi Okafor, Operations Manager at …" on a document that never asked for approval, and which also says it is not production-live | §8, §15 (honesty) | Approval state machine (§10) |
| D7 | Machine timestamp in client copy | `2026-08-20T16:49:44.391Z` | §15 (client-friendly) | Human date format, ISO only in internal section |
| D8 | Third-party watermark, printed twice, once mid-document | "Created via PDFShift" | §15 (visually clean) | Renderer must not stamp output (§12) |
| D9 | No secure-connection statement | Nothing about how credentials will be handled | §10 | Mandatory paragraph, verbatim intent |
| D10 | No post-approval explanation | Client cannot tell what happens after they say yes | §9 | Nine-step sequence |
| D11 | No go-live status summary | — | §13 | Status table, six rows |
| D12 | Developer instructions sit inside the client flow with no separation | "HANDOVER TO YOUR DEVELOPER" appears between client sections | §11, §15 | Internal page, banner, suppressible output |
| D13 | Industry hard-coding | Whole document is logistics-shaped; no category-level education | §2 | Category-driven generation |
| D14 | Misleading section heading | "LIVE STATUS" on a build that is not live | §6, §13 | Rename per status enum |
| D15 | Support terms stated but not sourced from project data | 14-day defect window is written inline | §14 | Populate from `support` input |
| D16 | Two different voices for the same fact | Same handover instruction written once addressed to "your developer" and once to "a developer" | §15 | One voice, one statement |

**Outside the spec — owner's call, not defects:** the sender identity is a personal Gmail address (`zaxellimited360@gmail.com`). For a first paying client, a domain address on the LordGen domain is worth the twenty minutes. Flagged, not assumed. See §16.

---

## 4. Architecture

```
intake answers (website diagnostic)
        │
        ▼
  client_brief.json ──────► validate against schema ──► fail fast, list missing fields
        │
        ▼
  section builders (§8, one per spec section)
        │
        ▼
  plain-English gate (§9)  +  honesty gate (§10)
        │
        ▼
  HTML template (brand tokens, §12)
        │
        ├──► handover-client.pdf     (client sections only)
        └──► handover-full.pdf       (client sections + INTERNAL developer pack)
```

Four rules about this pipeline:

1. **The brief is the only variable input.** No section builder may reach out to the web, the workflow file, or the operator's memory for facts. If a fact isn't in the brief, it isn't in the document.
2. **Gates run before rendering, not after.** A banned term must never reach the PDF stage.
3. **Rendering is deterministic.** Same brief in, byte-identical HTML out. This makes review and diffing possible.
4. **Two outputs, one source.** The client copy is the full pack minus the internal pack — never a separately maintained document.

**Stack:** follow the repo's settled stack (Python 3.12, `uv`, `ruff`, `pytest`, `mypy`) unless the project root `CLAUDE.md` says otherwise — it wins. HTML→PDF rendering is a service boundary: one adapter module, swappable, configured by env var. Do not couple section building to the renderer.

---

## 5. Repository layout

```
handover/
├── spec/
│   └── LORDGEN_UNIVERSAL_HANDOVER_SPEC.md    # read-only source of truth
├── schema/
│   └── client_brief.schema.json
├── briefs/
│   └── examples/gig-logistics.json           # regression fixture (§14)
├── templates/
│   ├── handover.html.j2
│   ├── partials/*.html.j2                    # one partial per spec section
│   └── brand.css
├── src/
│   ├── build_brief.py                        # intake answers → client_brief.json
│   ├── sections/                             # one builder per spec section
│   ├── gates/
│   │   ├── plain_english.py
│   │   ├── honesty.py
│   │   └── quality.py
│   ├── render_pdf.py                         # renderer adapter
│   └── generate.py                           # entrypoint
├── tests/
│   ├── test_gates_*.py
│   ├── test_sections_*.py
│   └── test_regression_gig.py
├── out/                                      # gitignored
└── .env.example                              # no real keys, no localhost defaults
```

Naming follows project convention: `verb_noun.py` for tools, `snake_case` for functions, `test_<module>.py` for tests.

---

## 6. The input contract

`schema/client_brief.schema.json` defines the only thing that varies between clients. Build the schema first — every later decision depends on it.

```jsonc
{
  "meta": {
    "ref": "LG-YYYYMMDD-CLIENTSLUG-NN",
    "issued_date": "2026-08-20",          // rendered human-readable
    "version": "1.0",
    "prepared_for": "GIG Logistics",
    "prepared_by": "LordGen AI",
    "reply_to": "<from env, not hardcoded>"
  },

  "client":   { "business_name": "", "contact_name": "", "contact_role": "" },

  "business": {
    "category": "logistics",              // free text, drives §2 — never switch on it in code
    "category_label": "logistics and delivery businesses",
    "what_they_do": "",                   // plain English, from intake
    "source": "intake|client_call|public_information",
    "evidence": []                        // quotes/answers backing the above
  },

  "workflow": {
    "name": "",
    "current_manual_steps": [],
    "pain_points": [ { "point": "", "evidence": "" } ]
  },

  "category_opportunities": [             // spec §2 table, exactly 3 rows
    { "current_activity": "", "how_automation_helps": "", "business_benefit": "" }
  ],

  "example_flow": {
    "stages": [],                         // spec §3, dynamic, 5–7 stages
    "agent_role": null                    // plain-English sentence, or null
  },

  "research": {
    "performed": false,
    "method": null,                       // e.g. "public reviews, 40 samples, Jan–Aug 2026"
    "findings": [ { "issue": "", "evidence": "", "impact": "", "opportunity": "" } ]
  },

  "automation": {
    "trigger": "",
    "information_received": [],
    "checks": [],
    "actions": [],
    "recipients": [],
    "customer_receives": "",
    "recorded": []
  },

  "build": {
    "status": "starter_build",            // enum, spec §6
    "what_was_created": "",
    "systems": [ { "name": "Order form", "state": "not_connected", "owner": "" } ]
  },

  "delivery": {                           // see §16 — computed, never hand-entered
    "tier": "B",                          // "A" | "B"
    "reasons": [],                        // which conditions failed, for the internal pack
    "template_id": null, "template_version": null,
    "customised": true, "custom_mapping": true,
    "outbound_to_end_customers": true, "outbound_ships_disabled": false,
    "smoke_test_id": null, "kill_switch": false,
    "data_class": "standard",             // "standard" | "regulated"
    "classified_at": null, "classified_by": "classify_delivery@<version>",
    "shown_to_client_as": null            // tier the client has already been told (§16.6)
  },

  "tests": [
    { "scenario": "", "result": "passed|failed|not_tested",
      "plain_english": "", "run_at": "", "evidence_ref": "" }
  ],

  "approval": {
    "state": "not_requested|requested|received",
    "phrase": "I APPROVE THIS AUTOMATION",
    "received_at": null, "received_from": null, "received_role": null
  },

  "connection": {
    "services": [ { "service": "",
                    "method": "account_authorisation|secure_form_client_key|secure_form|manual",
                    "what_we_need": "" } ]
  },

  "developer": { /* spec §11 checklist, all booleans, default false */ },

  "golive": {
    "automation_design": "pending", "client_approval": "pending",
    "secure_connections": "pending", "developer_wiring": "pending",
    "final_testing": "pending", "production_launch": "pending"
  },

  "support": { "window_days": 14, "covers": "", "excludes": "", "contact": "" }
}
```

**Contract rules:**

- `null` and `[]` are legitimate values with defined rendering. They are never treated as "fill this in yourself".
- No field may be derived from another. Tests are not inferable from `automation`. Connection state is not inferable from `build.status`.
- `business.category` is data passed into prose. **Never branch on it in code.** A `if category == "logistics"` anywhere is a spec violation.
- Validation failure lists every missing required field at once, so the intake gap gets fixed in one pass.

---

## 7. Document order

Render in the spec's own recommended flow:

```
Cover
 1. How Automation Can Help [BUSINESS NAME]              (spec §1)
 2. Standard Automation Opportunities for [CATEGORY]     (spec §2)
 3. Simple Example Workflow                              (spec §3)
 4. What We Found                                        (spec §4)
 5. The Automation We Recommend                          (spec §5)
 6. What We Built for You                                (spec §6)
 7. What We Tested                                       (spec §7)
 8. Your Approval                                        (spec §8)
 9. What Happens Next                                    (spec §9)
10. Secure Connection                                    (spec §10)
─────────── page break · INTERNAL banner ───────────
11. Developer Wiring Checklist                           (spec §11–§12)
─────────── end internal ───────────
12. Ready for Launch                                     (spec §13)
13. Support and Handover                                 (spec §14)
```

`[NEEDS RULING]` Two points where the spec leaves room:

- **§9 placement.** The spec body puts "What Happens After Approval" immediately after approval; the flow list at the end doesn't name it separately. Default above follows the spec body. Confirm.
- **Does the developer checklist ship to the client?** The flow list places it inside the document; §11 and §15 require presentation separation. Default: it stays in position but on its own page with an INTERNAL banner, and `handover-client.pdf` omits it. Confirm.

Headings 1, 2, 4, 5, 6, 7, 8, 9, 10, 12 use the spec's exact wording. Heading 3 and 13 are not fixed by the spec; the labels above come from the spec's own flow list. Do not invent alternatives.

---

## 8. Section rules

Each builder declares: source fields → must contain → must not contain → empty state. If the empty state triggers, it prints; it never omits the section silently.

### §1 — How Automation Can Help [BUSINESS NAME]
- **Source:** `business.*`, `workflow.*`
- **Must contain:** what kind of business this is · what they appear to do · which workflow could benefit · what is currently manual, repetitive, slow, inconsistent, or hard to track · what could be improved · the practical benefit.
- **Must not contain:** any banned term (§9); any promise of a specific saving or percentage; anything not traceable to `business.evidence` or `workflow.pain_points`.
- **Empty state:** if `business.what_they_do` is null the document does not render at all — this is a required field. Fail validation instead.
- **Voice:** write from the client's side of the screen. Name things by what they control and recognise ("the order form on your website"), never by how the system is built.

### §2 — Standard Automation Opportunities for [CATEGORY]
- **Source:** `business.category_label`, `category_opportunities[]`
- **Must contain:** the three-column table, exactly as specified: *Current business activity · How automation can help · Business benefit*. Three rows. Short sentences.
- **Must not contain:** description of the automation that was actually built — this section educates about the category first. Overlap with §5 is a defect.
- **Empty state:** fewer than three rows → validation failure, not a shorter table.

### §3 — Simple Example Workflow
- **Source:** `example_flow.stages[]`, `example_flow.agent_role`
- **Must contain:** one clean linear flow, 5–7 stages, generated from this client's workflow. Text-based arrows are fine and preferred over decorative graphics.
- **If `agent_role` present:** one ordinary-language sentence describing what the agent does.
- **Must not contain:** any capability the automation was not designed and tested to perform (spec §3, explicit). Cross-check every stage against `automation.actions` — a stage with no corresponding action is a hallucination.
- **Empty state:** derive stages from `automation` if `example_flow.stages` is empty; if both are empty, fail validation.

### §4 — What We Found
- **Source:** `research.*`
- **If `research.performed == true`:** the four-column table — *Issue detected · What customers are experiencing · Possible business impact · Automation opportunity*. Findings must be patterns, not a dump of complaints. Every row needs `evidence`; rows without it are dropped.
- **If `research.performed == false` or no findings survive:** print the declared empty state and nothing else, e.g. *"We have not yet completed a review of public customer feedback for [BUSINESS NAME]. The recommendations in this document are based on the information you provided."* **Never fabricate a finding to fill the table.**
- This is the single easiest section to fake and the fastest way to lose a client who knows their own reviews.

### §5 — The Automation We Recommend
- **Source:** `automation.*`
- **Must contain, in plain English:** what starts it · what information arrives · what is checked · what action is taken · who receives the result · what the customer or staff member sees · what is recorded.
- **Must not contain:** generic capability claims ("AI-powered", "fully automated end-to-end") that aren't in the fields.

### §6 — What We Built for You
- **Source:** `build.*`
- **Must contain:** what was created · the status label from the enum (*Starter Build · Demo / Test Build · Ready for Connection · Production Ready*) · a system table in client language.
- **System table wording:** `not_connected` renders as *"Not yet connected to your live system"*, never "Stubbed". Drop the "Credential owner" column from the client copy; it belongs in the internal pack.
- **Must not contain:** the word "live" in any heading unless `build.status == production_ready` **and** every system is `connected`.
- Honesty gate H2 applies (§10).

### §7 — What We Tested
- **Source:** `tests[]`
- **Must contain:** one row per test actually run, formatted *Passed — [plain-English explanation]*.
- **Must not contain:** any scenario not present in `tests[]` with a result other than `not_tested`. Failed tests are shown as failed, not hidden — a client who later finds a hidden failure is gone.
- **Empty state:** *"No test scenarios have been run yet."* An empty table is better than an invented one.

### §8 — Your Approval
- **Source:** `approval.*`, `meta.reply_to`
- **Must contain:** one instruction and one instruction only — reply to the email that sent this handover with the exact line **I APPROVE THIS AUTOMATION**, plus one sentence explaining that this means proceeding to the secure connection and implementation stage.
- The phrase is a constant. It is never reworded, translated, or personalised — the automation matches on it.
- **Must not contain:** any competing call to action, alternative wording, or approval record. See H4.

### §9 — What Happens Next
- **Source:** static nine-step sequence from spec §9, plus `connection.services` for step 4 wording.
- **Must contain:** the explicit statement that approval does not mean the automation goes live immediately.

### §10 — Secure Connection
- **Source:** `connection.services[]`
- **Must contain:** the commitment that passwords will never be requested by ordinary email, and that a secure connection method or secure form will be provided for each service.
- **Must not contain:** service-by-service technical setup detail. The client does not need to understand what is being connected, only that it will be done safely.

### §11 — Developer Wiring Checklist *(internal)*
- **Source:** `developer.*`, `build.systems[]`, `connection.services[]`
- Technical language is correct here. Render the spec §11 checklist as checkboxes with current state, plus the §12 AI-assisted wiring notes: services to connect, authorisations required from the client, missing information, anything needing human confirmation.
- **Must contain:** an explicit human approval point before production activation (spec §12).
- **Must not contain:** credentials, tokens, or secrets. Ever. Reference where they live, never their values.

### §12 — Ready for Launch
- **Source:** `golive.*`
- Six-row status table, Complete / Pending only. An item is Complete only when the underlying action happened. Cross-check: `client_approval` cannot be Complete unless `approval.state == received`; `production_launch` cannot be Complete unless every system is `connected`.

### §13 — Support and Handover
- **Source:** `support.*` — populated per project, never hardcoded into the template.

---

## 9. Plain-English gate

Runs on client-facing sections only (§1–§10, §12–§13 of the document order). Fails the build on any unglossed hit.

**Banned (spec §1):** API · webhook · n8n · node · JSON · credentials · database · OAuth · endpoint

**Also banned (observed in v1.0 or equivalent):** stubbed · payload · schema · parse · deploy · repo · sandbox · staging · instance · sync · backend · integration · workflow JSON · credential owner · any internal vendor name (n8n, Vercel, Supabase, PDFShift, Make, Zapier, HubSpot unless it is the client's own system)

**Gloss exception (spec §1: "unless genuinely necessary and explained in plain English"):** a banned term passes only if the same sentence contains a plain-English explanation on first use, and the term appears in `allow_with_gloss` for that brief. Otherwise: rewrite.

**Also flagged:** ISO timestamps · sentences over 25 words · passive constructions describing what the client must do · any phrase naming how the system is built rather than what the client controls.

Ship the gate with tests. `"n8n receives the dispatch details from the order form"` must fail; `"Your order form sends us the details automatically"` must pass.

---

## 10. Honesty gate

| ID | Rule | Fails build when |
|---|---|---|
| H1 | Every test claim traces to a `tests[]` entry with `result != not_tested` | Document names a scenario the data doesn't record |
| H2 | Production language requires `build.status == production_ready` **and** all systems `connected` **and** all `golive` Complete | "Live", "in production", "go-live complete" appears otherwise |
| H3 | Research findings require `research.performed == true` and per-row `evidence` | Any finding without evidence |
| H4 | Approval state machine — `not_requested`/`requested`: the request block renders and **no approval record appears anywhere, including the footer**. `received`: the request block is removed and a confirmation line renders with name, role, and human date | Any approval record while state is not `received`; both blocks present at once |
| H5 | Every `example_flow` stage maps to an entry in `automation.actions` or `automation.checks` | A stage claims behaviour that doesn't exist |
| H6 | No numeric claim (%, hours, currency) without a matching source field | Any invented figure |
| H7 | Support terms come from `support.*` | Template contains a literal support window |
| H8 | The tier statement is identical on the website, in the email, and in the PDF — all three read `delivery.tier` and the shared copy constants (§16.7) | Any surface classifies or words the tier independently |
| H9 | Automatic delivery only when `delivery.tier == "A"` **and** every Tier A condition re-checked true at send time | Anything sends on a cached or stale classification |
| H10 | A tier the client has already been shown never changes silently | `delivery.tier != delivery.shown_to_client_as` without the notice in §16.6 |

H4 is the one that killed v1.0: a document asking for approval that already claimed to have it. Write the test for H4 first.

---

## 11. Approval contract

- **Exact phrase:** `I APPROVE THIS AUTOMATION`
- **Matching:** case-insensitive, whitespace-normalised, must appear on its own line in the reply body. Ignore quoted text below the reply separator so a forwarded thread can't self-approve.
- **Correlation:** `meta.ref` appears in the subject line and is required for the match to bind to a client.
- **On match:** record `approval.state = received`, `received_at`, `received_from`, `received_role`; set `golive.client_approval = complete`; trigger the secure onboarding form.
- **On near-miss** (approval intent without the phrase, e.g. "yes go ahead"): do **not** auto-approve. Flag for human handling. A wrongly recorded approval is worse than a slow one.
- The website approval button writes the same state through the same code path — one state machine, two entry points.

---

## 12. Rendering and brand

**Tokens** — from the LordGen Identity Standard, Vol. 01:

| Token | Value |
|---|---|
| Ink | `#0A0A09` |
| Graphite | `#141312` |
| Regal Gold | `[NEEDS RULING]` — primary gold, hex not recorded on the sheet. Do not guess it. |
| Leaf | `#F0E2BC` |
| Brass | `#8A6A24` |

**Rules:** ink ≈80% of any surface · gold under 15% · leaf and brass as trims only · **gold is never a background for body copy** · Archivo 800 display, 600 labels, 400 body · type flush left, never centred or justified · line length under 68 characters · mark in square containers, zero radius, no gradients, no rotation or stretching · minimum 24px mark, 96px lockup.

**Print:** A4 · consistent margins · headings never orphaned from their content · tables never split across pages · footer carries `meta.ref` and page *n* of *m* · PDF text layer must be extractable (a searchable PDF, not an image).

**Renderer:** must not stamp the output. `Created via PDFShift` in a client document is a free-tier watermark and reads as exactly that. Either move to a keyed plan or render locally (WeasyPrint or headless Chromium). Configure via `PDF_RENDER_URL` / `PDF_API_KEY` from env — **no hardcoded URLs, no localhost defaults, in code, templates, README, or `.env.example`.** Templates reference assets by relative path.

**Two outputs:** `handover-client.pdf` (client sections) and `handover-full.pdf` (client + internal). Filename: `LordGen-Handover-<ClientSlug>-<Ref>.pdf`.

---

## 13. QA gate

Runs before any PDF is emitted. Any failure aborts with a listed reason.

1. All thirteen document-order sections present, in order.
2. Plain-English gate: zero unglossed hits in client sections.
3. Duplicate-block check: no two text blocks above 0.9 normalised similarity (catches D4/D16).
4. Every test row traces to `tests[]` (H1).
5. Status label in enum and consistent with systems and go-live (H2).
6. Approval state machine consistent, footer included (H4).
7. No ISO timestamp in client copy (regex).
8. Renderer watermark string absent from the PDF text layer.
9. No unresolved placeholders: `[BUSINESS NAME]`, `[CATEGORY]`, `TBD`, `lorem`, `null`, `undefined`.
10. No empty table cells; no table rendered with fewer rows than the spec requires.
11. No gold background behind body text; no centred or justified body type.
12. Client copy contains zero credentials, tokens, or secret-shaped strings.
13. Both PDFs generate and open; text layer extractable.
14. `delivery.tier` is present and was produced by `classify_delivery()`; Tier A only where every condition A1–A7 is true (no partial pass).
15. Tier copy on all three surfaces resolves from the same constant — asserted by string equality, not by review.
16. A Tier A install pack contains no secrets, no hardcoded URLs, and ships with its outbound step disabled where §16.1 A4 applies.

---

## 14. Definition of done

1. `briefs/examples/gig-logistics.json` is populated from the **real intake answers** — not reverse-engineered from the v1.0 PDF, and not from a description of LordGen's own setup.
2. Regenerating GIG Logistics from that fixture closes every row D1–D16, verified line by line.
3. `test_regression_gig.py` asserts each closed defect and fails if one reopens.
4. A second fixture from an unrelated category (a dental clinic or similar) generates a coherent handover with no code change and no logistics vocabulary anywhere. This is the real proof the generator isn't hard-coded.
5. Gate tests pass, including deliberate failing cases: a brief claiming an untested scenario, a brief with an approval record while `state = requested`, a brief with a research finding lacking evidence. Each must be rejected.
6. `ruff check`, `ruff format`, `mypy .`, `pytest` clean.
7. Both PDFs reviewed by a human before anything reaches a client.
8. A Tier A fixture and a Tier B fixture each produce the correct bubble copy, email paragraph, and PDF line from the same constant. Flipping any single condition in the Tier A fixture reroutes it to Tier B on all three surfaces at once — no surface left saying "A".

---

## 15. Build order

Commit at each step. Show the diff; don't batch.

| Step | Work | Commit point |
|---|---|---|
| 1 | `schema/client_brief.schema.json` + validator with all-at-once error listing | Schema validates the GIG fixture |
| 2 | Gates first: `plain_english.py`, `honesty.py`, with tests including the failing cases in §14.5 | Gates reject bad input |
| 3 | Section builders §1–§13, one file each, tested against fixture | Sections produce correct text and empty states |
| 4 | HTML template + brand CSS from §12 tokens | Renders as HTML, brand rules respected |
| 5 | Renderer adapter, env-configured, no watermark | Both PDFs emit |
| 6 | QA gate wired as a hard pre-emit block | Bad brief cannot produce a PDF |
| 7 | Regression test against D1–D16 | GIG regenerates clean |
| 8 | Second-category fixture | Proves no hard-coding |
| 9 | `classify_delivery()` + the send-time re-check, with a test per single-condition failure | Any one condition failing routes to Tier B |
| 10 | Shared copy constants wired to bubble, email, and PDF; cross-surface equality test | The three surfaces cannot drift |

Do not start step 3 before steps 1 and 2 pass. The gates are the product; the prose is downstream of them.

---

## 16. Delivery routing — Tier A and Tier B

What happens after the client approves. One classification, computed once, stated in three places.

```
approval received
      │
      ▼
classify_delivery(brief) ──► delivery.tier
      │
      ├── "A" ─► re-check conditions at send time ─► install pack emailed automatically
      │                                              client connects own accounts
      │                                              smoke test must pass ─► client switches it on
      │
      └── "B" ─► secure connection stage ─► developer wiring ─► joint test ─► go-live
```

### 16.1 Classification

`delivery.tier` is produced by one function, `classify_delivery(brief)` in `src/delivery/classify.py`. Nothing else computes it. The website, the handover PDF, and the approval email all read the stored value.

**Tier A requires every one of these to be true:**

| # | Condition | Field |
|---|---|---|
| A1 | The automation is an unmodified library template at a published version | `template_id` and `template_version` set, `customised == false` |
| A2 | Every service connects by the client authorising their own account, or by a key the client generates themselves and enters in the secure form | all `connection.services[].method` in `{account_authorisation, secure_form_client_key}` |
| A3 | No bespoke field mapping — only the template's declared config fields | `custom_mapping == false` |
| A4 | Nothing reaches the client's own customers on install. Any outbound step ships switched off and requires a test send to the client first | `outbound_to_end_customers == false` **or** `outbound_ships_disabled == true` |
| A5 | The template has an automated smoke test | `smoke_test_id` present |
| A6 | The client can switch it off in one step | `kill_switch == true` |
| A7 | No regulated, health, financial, or payment data | `data_class == "standard"` |

**Any single miss is Tier B. Ambiguity is Tier B.** An operator may force a Tier A brief down to B; nothing may promote a B to A automatically.

**Automatic Tier B triggers** — a system with no connection method · LordGen has to hold or create a credential · the client asked for changes to the template · any mapping the AI inferred rather than read · writes to production records the client can't undo.

`delivery.reasons[]` records which conditions failed. It renders in the internal pack, never in client copy.

**GIG Logistics is Tier B**, on three counts: it emails the client's own customers, the order form and dispatch record have no connection method, and it isn't a published library template.

### 16.2 Automatic delivery is not automatic activation

Tier A sends the pack automatically. It does not switch anything on. Activation still requires the client to authorise their accounts and pass the smoke test.

This preserves the human approval point in spec §12 — it moves from LordGen's developer to the client's own activation step. `[NEEDS RULING]` **Spec §12 must be amended to say this explicitly**, or the spec and this file disagree about whether a human gate exists.

### 16.3 Preconditions before anything sends

Re-check at send time, not at design time — a classification made a week ago is not evidence about today:

1. `approval.state == received`
2. A1–A7 all true on the current brief
3. Template version published and its smoke test green on that version
4. Failure notifications route back to LordGen, not into silence
5. The send is logged with the tier, template version, and timestamp

Any failure downgrades to Tier B and triggers the notice in §16.6. It never sends anyway.

### 16.4 What the client receives

**Tier A install pack:** the importable automation file (config placeholders, no secrets, no hardcoded URLs) · a one-page setup guide in plain English · connect-your-accounts steps · a test step that must pass before it can be switched on · the off switch · where to get help.

**Tier B:** nothing to install. What happens next, what's needed from them, and when.

### 16.5 The three surfaces

**(a) Website info bubble.** Attached to the approval control under the diagnostic result.

- Opens on tap, click, or keyboard focus of a visible "i" affordance. Never hover-only.
- On a phone it must not cover the approval button. One bubble open at a time.
- `aria-expanded` and `aria-describedby` wired; dismissible by Escape and by tapping outside; respects reduced motion.
- Two states: **before approval** (what will happen if you approve) and **after approval** (what is happening now).
- The tier commitment also exists as static text on the page. A promise that lives only inside a dismissible bubble is a promise the client can miss.

Draft copy — before approval:

> **Tier A** — Self-install automation (Tier A). When you approve, we'll email it to you straight away with step-by-step setup instructions. You connect your own accounts — we never see your passwords — and run one test before switching it on.

> **Tier B** — We connect this one for you (Tier B). It needs to be joined to systems that can't be set up automatically, so after you approve we'll arrange the connection with you and test it before anything goes live.

After approval:

> **Tier A** — Approved. Your automation and setup guide are on their way by email. Nothing runs until you connect your accounts and the test passes.

> **Tier B** — Approved. Nothing for you to install. We'll come back to you with the secure connection steps and test everything with you before it goes live.

**(b) Approval email.** Both tiers state the tier in the body, above the fold:

> **Tier A** — *Self-install automation (Tier A).* Your automation is included with this email, along with a short setup guide. You'll connect your own accounts — we never ask for passwords by email — and run one test. It stays switched off until that test passes.

> **Tier B** — *We connect this one for you (Tier B).* Your automation needs to be joined to systems that can't be connected automatically, so there's nothing for you to install. We'll send the secure connection steps, do the wiring, and test it with you before anything goes live.

**(c) Handover PDF.** The tier statement renders inside §9 *What Happens Next*, from the same constant, so the document the client approved and the email they receive say the same thing.

### 16.6 If the tier changes after the client has seen it

Never silently. If `delivery.tier` no longer matches `delivery.shown_to_client_as`, the client gets a short plain-English message — what changed, why, what happens now — before any further step runs. Expectations set in public get corrected in public.

### 16.7 Copy constants

All tier copy lives in `src/delivery/copy.py`, keyed by `(tier, surface, state)`. The bubble, the email, and the PDF import from it. A cross-surface equality test asserts they match. Three surfaces maintaining their own wording is how a client ends up reading two different promises.

`[NEEDS RULING]` **Do the letter codes appear client-side at all?** Spec §1 bans internal vocabulary in client copy, and "Tier A" is internal vocabulary. Default above shows the plain label with the code in parentheses on first mention — *"Self-install automation (Tier A)"* — so the label explains the code rather than the code standing alone. Say the word and it becomes labels only.

---

## 17. Ask before building — do not guess

1. The Regal Gold hex (§12).
2. §9 placement and whether the developer checklist ships in the client copy (§7).
3. Was public review research actually performed for GIG Logistics? If not, §4 renders the honest empty state — confirm that's acceptable before it goes out.
4. Sender identity: personal Gmail or a LordGen domain address? This affects both the cover and the approval reply-to.
5. Renderer decision: keyed PDFShift plan or local rendering.
6. Real support terms per project — the 14-day defect window is currently written into the document rather than sourced from data.
7. Confirm the GIG contact's name and role for the approval record, since v1.0 printed an approval that had not been requested.
8. Do the letter codes appear in client copy, or plain labels only? (§16.7)
9. Confirm the spec §12 amendment — for Tier A the activation approval moves to the client. Until that's written into the spec, the two documents contradict each other. (§16.2)
10. Which library templates are published and smoke-tested today? Tier A cannot route to anything until at least one exists, so every client is Tier B until then. That is the correct behaviour, not a bug.

---

## Appendix A — status enums

- `build.status`: `starter_build` · `demo_test_build` · `ready_for_connection` · `production_ready`
- `build.systems[].state`: `connected` · `not_connected`
- `tests[].result`: `passed` · `failed` · `not_tested`
- `approval.state`: `not_requested` · `requested` · `received`
- `golive.*`: `complete` · `pending`
- `delivery.tier`: `A` · `B`
- `delivery.data_class`: `standard` · `regulated`
- `connection.services[].method`: `account_authorisation` · `secure_form_client_key` · `secure_form` · `manual`

## Appendix B — client-language mapping

| Internal term | Client copy |
|---|---|
| Stubbed | Not yet connected to your live system |
| Connected | Connected and working |
| n8n workflow | your automation |
| Export as JSON | hand the automation over to your developer |
| Credential owner | *(internal pack only)* |
| Webhook / endpoint | where your form sends the details |
| Log / audit record | a record of every run, kept for your reference |
| Duplicate submission handling | if the same request arrives twice |
| Tier A | Self-install automation — we email it to you with setup instructions |
| Tier B | We connect this one for you |
| Smoke test | one test run to check everything is working |
| Kill switch | the off switch |
| Account authorisation | you sign in to your own account and give permission |

Extend this table rather than loosening the banned list.

---

**Reminder for whoever is doing the work.** The client will never see the workflow, the tests, or the code. This document is the entire product as far as they're concerned. Every honesty gate here exists because the fastest way to lose a first client is not a bug — it's a document that claimed something the build couldn't back up.
