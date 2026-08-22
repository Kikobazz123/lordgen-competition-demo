# LORDGEN LIVE PRODUCT SPEC

## Frontend state machine
INQUIRY
RESEARCHING
RESEARCH_COMPLETE
AWAITING_APPROVAL
BUILDING
BUILD_COMPLETE
DEVELOPER_REVIEW
HANDOVER_READY
HANDOVER_SENT
FAILED

The page should transform between these states instead of stacking interfaces.

## Inquiry
Business name is required. Optional contact email and WhatsApp. Primary CTA: Run Diagnostic.

## Research
Use the canonical three research categories already present in the project/workflows. Do not invent replacements if the existing implementation defines them. Return concise findings, opportunity and recommended automation for each category.

## Approval
Three selectable opportunity cards. User can select 1/2/3/All, then Approve & Build. Persist request ID, selection, approval timestamp and status.

## Builder
Receive business, research, selected opportunities, approval and contact context. Validate inputs. Use automation templates where possible. Auto-complete simple builds. Route complex builds to developer review with all context preserved.

## Handover
Generate README with automation name, purpose, trigger, inputs, actions, services, configuration steps, required environment-variable NAMES only, install/deploy, test/run, troubleshooting, owner/contact and version/date. Never include secret values.

## Reliability
Every stage has request/build ID, status, safe validation, structured non-secret errors, retry and idempotency.

## API
Adapt to the existing framework. Prefer server-side routes/actions for private n8n communication. Do not expose private webhook authentication in browser code.

## UX
Show only the next useful information. Use progress transitions, compact status, clean result cards and a clear next action. Avoid giant dashboards.
