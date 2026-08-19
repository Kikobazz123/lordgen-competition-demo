# LordGen Demo Script

Rehearsal script for the live competition demo, walking `LORDGEN_competition_demo.md`'s 8-step Core Demo Flow against this build's actual, current artifacts — not a generic template. Written by the `competition-demo` skill (Phase 9 pre-flight), 2026-08-19.

**Business used throughout the internal pipeline (research → score → proposal → execution plan → workflow → ClickUp):** Nick's Plumbing & Air Conditioning — real, researched. **Business shown on the public `website/` demo:** Ridgeline Plumbing & Air — illustrative, renamed 2026-08-18 so the public page never uses a real business as the addressee of a visitor-submitted form (see `website/README.md`). Keep these straight while narrating: the *pipeline* story is about the real business; the *public interactive demo* is a fictionalized stand-in for the same automation shape.

---

## 1. Enter the Business

Say: "We're going to walk one business — Nick's Plumbing & Air Conditioning, a real local plumbing and HVAC company — all the way from a public review to a working automation."

Show: `data/research.json`'s `business` block (name, category, service area) — local file, not committed to the public repo (kept private, see step 8 note).

## 2. Research

Show: `data/research.json`'s `facts[]` and `pain_points[]`. Narrate the confidence discipline — every fact is tagged `verified` or `inference`, with a source or an explicit caveat. Lead with the anchor finding: a directly-verified BBB review describing a technician-tablet estimate of ~$1,600 that became a $7,000 bill, with pricing terms shown too small to read.

## 3. Opportunity Score

Show: `data/score.json`. Point at `top_opportunity` and its `overall_score`/`tier` — say the score comes from an explicit 8-factor rubric (`.claude/skills/opportunity-score/SKILL.md`), not a vibe.

## 4. Proposal

Show: `proposal.md` (open the local file directly — **not on GitHub**, see step 8). Walk problem → proposed solution → expected benefits → the confidence caveat carried forward verbatim from research, not smoothed over.

## 5. Execution Plan

Show: `execution-plan.md` (also local-only). Point out it's the *one* predefined template (`docs/execution-plan-template.md`), not invented per business — Objective through Success Criteria, all populated. If asked about the "who approved it" logging line: it's implemented as an honest proxy (who the approval request was addressed to), not verified clicker identity — n8n's approval mechanism has no login. Say so plainly if it comes up; don't oversell it.

## 6. Starter Automation

Show: the live n8n workflow (`https://lordgenai.app.n8n.cloud/workflow/055TNXGtfItIgqf1`) or the exported `workflows/competition-demo.json`. Trace the pipeline live: webhook trigger → normalize → required-fields check → dedup check → AI draft → validity check → dispatcher approval (human-in-the-loop gate) → approved/rejected branch → send → log. Point out the two failure-logging branches (`Log: Delivery Failed (...)`, added 2026-08-19) as evidence this isn't a happy-path-only toy.

## 7. Live Build Moment

Make one small, visible, low-risk edit live. Recommended, given what's already built: **add a due-date or an assignee to one of the two open ClickUp handoff tasks** (list "Lordgen competition demo", https://app.clickup.com/90152669034/v/l/li/901525174910) via the ClickUp MCP, narrating it as "the plan already generated real implementation tasks — watch me adjust one live." This is safer than editing the n8n workflow live (which is already fully built and QA'd — an in-demo edit risks visibly breaking something rehearsed). If an n8n edit is preferred instead, the safest option is adding a new no-op/log node off an existing branch, mirroring the instruction doc's own suggested examples — never touch credentials or flip `active` live.

## 8. Final Handoff

Show, in order: `data/research.json` → `data/score.json` → `proposal.md` → `execution-plan.md` → the n8n workflow → the two ClickUp tasks → the GitHub repo (https://github.com/Kikobazz123/lordgen-competition-demo, public).

**Say explicitly:** the research, proposal, and execution plan for this specific real business are deliberately **not** pushed to the public GitHub repo — the repo's `.gitignore` excludes them so a real business's private review/complaint research and pricing detail aren't published (`docs/architecture.md`'s exclusion policy). What judges see on GitHub is the *engine* (skills, template, workflow export, website), not the specific business file. If they want to see the actual filled-in documents, show them live/local, as in steps 4-5 above — don't imply they're retrievable from the repo afterward.

Close with: *"LordGen turns a business problem into an actionable AI opportunity, then takes that opportunity all the way to a concrete execution plan and a working automation starting point — with a human in the loop before deployment."*

---

## Known state going into the demo (be ready for these questions)

- **`workflow-qa`'s gap #4**: five `QA-TEST-*` rows are in the live "LordGen Estimate Summary Log" Data Table from testing. **Delete these in the n8n UI before the demo** — no MCP tool exists to do it automatically (confirmed).
- **External failure handling** (delivery-channel-down case) is structurally implemented (`onError: continueErrorOutput` + dedicated log nodes) but was never live-verified — pin-data testing can't simulate a real send failure on a credentialed node. If asked "have you tested that," the honest answer is "structurally yes, live no — same limitation for anyone testing against a real email API without deliberately breaking credentials."
- **Not yet built**: a standalone workflow diagram image and a slide deck, both named in `LORDGEN_competition_demo.md`'s deliverables list but outside this skill's own Skill 07 scope. Flagging so this isn't assumed done.
- **Real credentials** (OpenAI, Gmail) on the n8n nodes are still placeholders — the workflow has never actually sent a real email or called a real LLM outside test/pin-data runs. Say this plainly if asked whether it's "really working end to end" — it's tested and structurally complete, not yet connected to live services (by design, per `CLAUDE.md` §14).
