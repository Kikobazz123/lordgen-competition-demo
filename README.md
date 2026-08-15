# LORDGEN

AI business-development and automation system, built with Claude Code for a 7-day competition demo.

## The Story

**Business → Research → Opportunity Score → Proposal → Execution Plan → Starter Automation → Human Approval → Handoff**

LordGen researches a real business, identifies and scores a genuine AI/automation opportunity, turns it into a proposal and a predefined execution plan, then generates a real starter automation from that plan — with a human approval gate before anything external happens.

See `docs/architecture.md` for the approved architecture and `docs/execution-plan-template.md` for the predefined template every execution plan must use.

## Reference Documents

- `LORDGEN_competition_demo.md` — demo flow, judge-facing story, definition of done.
- `LORDGEN_competition_tools_skills_mcp_references.md` — skills/tools/MCP reference and build order.
- `CLAUDE.md` — project constitution and process rules for the engineering agent.

## Repository Structure

```
.claude/skills/     Claude Code Skills, one per pipeline stage
docs/                architecture, execution-plan template, diagrams, demo script
prompts/             reusable prompts
workflows/           generated n8n workflow exports
data/                per-run pipeline artifacts (research.json, score.json, ...) — gitignored
tests/               tests for each pipeline stage
```

## Build Status

Phases 1–5 complete for the locked demo business (`docs/demo-business.md`: Nick's Plumbing & Air Conditioning) — research, opportunity score, proposal, and execution plan are all generated and validated (`data/`, `proposal.md`, `execution-plan.md`). Phase 6 (Automation Builder) methodology is written (`.claude/skills/automation-builder/SKILL.md`, `docs/n8n-reference.md`) but blocked on connecting n8n's MCP server — see Setup below.

## Setup

Copy `.env.example` to `.env` and fill in credentials as each integration is approved and connected. Never commit `.env`.

**n8n MCP** (needed for Phase 6): not yet connected. In your n8n instance, go to Settings → Instance-level MCP → Enable MCP access, then follow n8n's own generated setup command for Claude Code. Full tool catalog and usage guidance once connected: `docs/n8n-reference.md`.
