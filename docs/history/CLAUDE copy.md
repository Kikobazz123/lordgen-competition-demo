# LORDGEN AI — FULL LIVE REBUILD

Rebuild LordGen as one clean, live AI automation product: frontend + backend + n8n orchestration.

## Required user journey
1. Client/Judge enters a searchable business name, optionally contact email/WhatsApp.
2. Submit -> smooth phased transition.
3. Backend performs the existing three-category business research.
4. Results return in the same primary work surface.
5. User selects category 1, 2, 3, or All.
6. User approves.
7. Approval immediately dispatches the automation builder.
8. Simple automations can complete automatically; complex ones go to developer review.
9. Generate a README/handover explaining setup, configuration, installation, running and troubleshooting.
10. Send handover by email; WhatsApp is optional when configured.

## UX rule
ONE PAGE. ONE JOURNEY. Progressive disclosure only.
Inquiry -> Researching -> Results -> Approval -> Building -> Handover.
No dashboard explosion, duplicate diagnostics, fake demo pages, chat UI, competing forms, or unnecessary nested scrolling.

## Frontend
Keep LordGen's black/gold identity but make it minimal, premium and calm. Use strong typography, whitespace, restrained borders, precise hierarchy and subtle professional transitions. Do not copy other sites.

## Live means live
Do not fabricate research, success, client metrics or completed builds. If a provider/build fails, show the real state and provide retry.

## Backend
Inspect existing Vercel/server routes and n8n workflows first. Preserve useful scaffolding and credentials. Refactor instead of blindly duplicating workflows.

## Security
Never expose n8n tokens, API keys or private environment variables. Never use NEXT_PUBLIC_ for secrets. Never put secrets in README, browser responses, logs or source.

## Skills/research
Use only relevant skills: frontend design, senior frontend/Next.js, backend/fullstack architecture, webapp testing and security/review. AITMPL is a directory of reusable Claude Code configurations; select only what this job needs. Study 21st.dev plus up to four premium AI/automation sites for design principles only. Do not copy code, text, branding or exact layouts.

## QA
Before completion run lint, typecheck, tests, production build, browser/e2e tests where available, mobile checks, and a real end-to-end controlled production test. Verify inquiry -> research -> approval -> builder -> handover. Protect against duplicate submissions and duplicate builder dispatches.
