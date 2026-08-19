---
name: competition-demo
description: Pre-flight checklist verifying the demo path, outputs, workflow, execution plan, GitHub repository, and secret hygiene are ready for judges, then prepares a clean demonstration sequence. Use after workflow-qa's findings are addressed (or deliberately accepted as known limitations), immediately before a competition rehearsal or live demo.
---

# Competition Demo (Phase 9 -- pre-flight)

## Purpose

Prepare the build for judges, per `LORDGEN_competition_tools_skills_mcp_references.md` Skill 07 and `LORDGEN_competition_demo.md`'s Core Demo Flow. This skill does not build new artifacts (research, score, proposal, execution plan, workflow) -- it verifies the ones already produced by the earlier pipeline stages are present, consistent, and safe to show, then writes a demo script walking through the actual, current state of the build (not a generic template).

## Input

Everything already on disk / live, read-only:
- `data/research.json`, `data/score.json`, `data/proposal.json`, `proposal.md`, `data/execution-plan.json`, `execution-plan.md`
- `workflows/competition-demo.json` + the live n8n workflow it mirrors (`get_workflow_details`)
- `tests/workflow-qa/qa-report.md`
- The git repository (status, log, tracked files, remote)
- `docs/architecture.md` (current phase/open-items record)
- The ClickUp handoff list (per `docs/architecture.md`'s "Known open items")

## Method -- the 7 verification checks (Skill 07)

1. **Demo path** -- confirm the pipeline actually runs end to end for the selected business: research -> score -> proposal -> execution plan -> workflow -> (ClickUp handoff). Not a re-run of every stage -- confirm each stage's output file exists, is non-empty, and cross-references the one before it (matching each stage's own `## Validation` convention), plus that the chain hasn't silently drifted (e.g. `score.json.top_opportunity` still matches what `proposal.json` and `execution-plan.json` were built from).
2. **Selected business** -- confirm business identity is used *consistently within each layer*, and that any intentional divergence between layers (e.g. the internal pipeline using the real business name vs. the public `website/` using an illustrative name, per the 2026-08-18 rename) is a documented, deliberate design choice -- not flag it as an inconsistency bug.
3. **All outputs exist** -- every artifact `LORDGEN_competition_demo.md`'s "Competition Deliverables" and "Final Handoff" sections name: research result, opportunity score, proposal, completed execution plan, starter/modified automation, ClickUp implementation tasks, GitHub repository. (Workflow diagram / slide deck are listed in that doc but are not part of this skill's own Skill 07 spec -- flag as not-yet-built rather than silently building them.)
4. **The workflow** -- `workflows/competition-demo.json` is valid JSON, matches the live n8n workflow (`get_workflow_details`), stays `active: false` pending human review (CLAUDE.md §10), and `tests/workflow-qa/qa-report.md`'s open gaps are either fixed or explicitly still-open-and-acceptable for a demo (not silently ignored).
5. **The execution plan** -- every `docs/execution-plan-template.md` section is populated in `execution-plan.md`, `testing_plan[]` still covers CLAUDE.md §15's 7 categories, `open_dependencies` still matches reality.
6. **The GitHub repository** -- working tree clean or explicable, recent commits reflect the actual current state, `.gitignore` still excludes what it should (private research/business detail per `docs/architecture.md`'s exclusion policy), remote reachable and public.
7. **No secrets exposed** -- grep the full tracked working tree (not just the latest diff) for credential patterns; separately grep `git log -p` for anything that ever appeared in history, since a secret removed from HEAD can still be exposed in history. Escalate immediately per CLAUDE.md §9/§19 if anything real is found -- do not just note it and move on.

## Then: prepare a clean demonstration sequence

Write a demo script (`docs/demo-script.md`) that walks the actual, current build through `LORDGEN_competition_demo.md`'s 8-step Core Demo Flow -- using the real artifact locations, the real (illustrative, per the website) or real (internal) business name depending on which surface is being shown, and a concrete suggestion for step 7's "Live Build Moment" that's realistic given what's already built (e.g. a small, safe, visibly-additive n8n edit). This is a script for a human to rehearse from, not a new pipeline stage.

## Required Output

- `data/competition-demo-report.json` -- structured, gitignored/regenerated per run (same convention as `data/qa-report.json`), one entry per of the 7 checks: `{ check, status: pass|fail|warning, evidence, notes }`.
- `tests/competition-demo/preflight-report.md` -- committed, human/judge-readable twin.
- `docs/demo-script.md` -- committed, the actual rehearsal script.

## Validation (run before reporting)

- Every one of the 7 checks has a status backed by real evidence gathered this run (a file read, a git command, a live tool call) -- never assumed from memory of a prior run.
- Any `fail`/`warning` is stated plainly, with what it means for the actual demo (not softened).
- The secret scan covers tracked-file content *and* git history, not just the working tree.
- The demo script only references artifacts that were confirmed to exist in this same run.

## Out of Scope

Does not re-run business-research/opportunity-score/proposal-generator/execution-plan/automation-builder -- only verifies their output. Does not fix problems it finds (that's a return to the relevant earlier-phase skill, human-approved, same as `workflow-qa`'s own boundary). Does not build a workflow diagram or slide deck -- those are named in `LORDGEN_competition_demo.md`'s deliverables list but not in this skill's Skill 07 spec; flag as open items instead.
