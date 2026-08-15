# LordGen — Profession Config Model

**Added 2026-08-15**, merged from `LORDGEN_UPGRADE_SPEC.md` (developer-provided upgrade spec) at reduced scope — see `docs/architecture.md` for the full merge/exclusion decision. This proves the pipeline's skills generalize across professions without rebuilding them as a multi-profession web platform, and without touching Nick's Plumbing's already-working, already-tested build.

## Model

A profession is one of two depths:

- **`full`** — real business, real research, scored, proposed, execution-planned, and automated. Currently: **plumbing_hvac / Nick's Plumbing & Air Conditioning only.** Its files stay exactly where they already are (`data/research.json`, `data/score.json`, `data/proposal.json`, `data/execution-plan.json`, `execution-plan.md`, `proposal.md`, live n8n workflow `055TNXGtfItIgqf1`) — nothing about this profession's location or content changed by adding this layer.
- **`seeded`** — a generic, industry-level profile (not a specific named business), scored and proposed against publicly-sourced industry statistics gathered during the original candidate-business research (`data/professions/<profession>/profile.json` cites the same sources found back when Nick's Plumbing was selected). No execution plan, no automation build. Clearly labeled as generic throughout — never presented as if it were a specific researched business, per `CLAUDE.md` §11.

## Registry

| Profession | Depth | Location |
|---|---|---|
| Plumbing / HVAC (Nick's Plumbing & Air Conditioning) | `full` | `data/research.json`, `data/score.json`, `data/proposal.json`, `data/execution-plan.json` (root, unchanged) |
| Law firm intake | `seeded` | `data/professions/law_firm_intake/` |
| Dental clinic | `seeded` | `data/professions/dental_clinic/` |

## Why this scope, not the full upgrade spec

`LORDGEN_UPGRADE_SPEC.md` describes a multi-profession web application: profession selector UI, adaptive Guided/Technical intake forms, branded public website, PDF reports, 3-4 fully-built professions. That directly conflicts with `LORDGEN_competition_demo.md`'s core principle — one practiced business, frozen for the live demo, not a platform. What's merged here is narrower: proof that the *skills* (not a new UI) are profession-configurable, using industry data already gathered, at essentially zero additional research cost. The website/UI question is being asked about separately, not assumed.
