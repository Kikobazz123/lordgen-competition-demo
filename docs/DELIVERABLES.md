# Competition deliverables — status

The eight artifacts listed in `LORDGEN_competition_demo.md` §"Competition Deliverables",
with where each one actually lives. Checked 2026-09-30.

| # | Deliverable | Where | Status |
|---|---|---|---|
| 1 | Working demo automation | `workflows/live-diagnostic.json`, `live-issue-proposal.json`, `live-approve.json`, `live-approval-decision.json`, `live-handover.json` — running on n8n Cloud | **Done** |
| 2 | Execution-plan template | `docs/execution-plan-template.md` | **Done** |
| 3 | Completed execution plan | `execution-plan.md` (repo root) | **Done** |
| 4 | Starter / generated workflow | `workflows/competition-demo.json` (n8n `055TNXGtfItIgqf1`) | **Done** |
| 5 | GitHub repository | `github.com/Kikobazz123/lordgen-competition-demo` | **Done** |
| 6 | **Workflow diagram** | `docs/workflow-diagram.png` · source `docs/workflow-diagram.mmd` · detailed variant `docs/workflow-diagram-detailed.png` | **Done 2026-09-30** |
| 7 | **Short slide deck** | https://claude.ai/artifact/Eh863vcqKMARMAnRBWbroH — 10 slides, exports to PPTX or PDF from the page's Share ▸ Export menu | **Done 2026-09-30** |
| 8 | Demo script | `docs/demo-script.md` | **Done** |

---

## 6 — Workflow diagram

Two renders from one source, `docs/workflow-diagram.mmd`. Edit the source, re-render,
commit both.

- **`workflow-diagram.png`** — landscape, the one for the deck and for a slide.
- **`workflow-diagram-detailed.png`** — the same chain vertically, carrying the security
  and idempotency notes. Too tall for a slide, right for the repo.

It documents **what actually runs**, not the aspirational design: stage names come from
`website/app.js:64-65`, the endpoints are the real Vercel functions under `website/api/`.
The human approval gate is the only gold-filled node on the canvas, because it is the one
thing that distinguishes this system from an autonomous one.

A service-topology layout was tried first — subgraphs per layer, browser through n8n to the
AI services. Mermaid's auto-layout turned it into crossing edges with a third of the canvas
empty. The content was right and the composition was not, so it was replaced by the linear
chain: one story to follow, with the technology annotated on each step instead of boxed by
layer.

## 7 — Slide deck

Ten slides: cover, the six shared problems, what the engine is, the chain, live research,
the three finding buckets, the approval gate, **what is real today**, the live-demo walk,
and the close. Speaker notes on every slide.

Built in the LordGen palette (ink / graphite / gold / leaf / bone) in Archivo, the brand
face. The approval-gate slide is the only full-gold slide in the deck — the deck has
exactly one moment of visual emphasis and it is spent there.

**The "what is real today" slide is deliberate and should not be cut.** It states plainly
that there are no paying clients, no revenue figures, no case studies and no testimonials,
because there are none. `CLAUDE.md` §26.2.4 forbids inventing them, and a judge who catches
one fabricated number discounts everything else on the page. The entry that states its own
limits is the one they believe about everything else.

**Sharing:** the deck is private. Others cannot open the link until it is shared from the
page's Share menu. For submission, export it to PPTX or PDF from Share ▸ Export and attach
the file rather than the link.

---

## Still open, unrelated to deliverables

- **Before the demo**, delete the 5 tagged `QA-TEST-*` rows from the live n8n "LordGen
  Estimate Summary Log" Data Table. No MCP tool can do this; it needs a manual n8n UI
  action. (`architecture.md`, workflow-qa gap #4.)
- `website/README.md` is stale — it still describes the retired three-preset simulated demo
  rather than the four live Nigeria-focused categories.
