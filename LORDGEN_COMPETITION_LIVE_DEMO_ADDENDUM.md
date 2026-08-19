# LORDGEN AI — COMPETITION LIVE DEMO ADDENDUM
## Read this AFTER the existing project instructions

## 1. PURPOSE

This file is a competition/demo scope override for the LordGen AI project.

The competition is on Saturday. The goal is to make the existing product demonstrate a REAL, end-to-end automation chain during the presentation without turning the project into a large production platform.

This addendum does NOT replace the existing architecture or project rules.

It only overrides conflicting demo-scope decisions where explicitly stated below.

### Priority

1. Existing project safety/security/architecture rules remain in force.
2. This addendum overrides previous "demo only / no live workflow trigger" decisions ONLY for the controlled competition demonstration.
3. Do not rebuild the application from scratch.
4. Do not introduce unnecessary infrastructure.
5. Do not create a public, unauthenticated webhook.
6. Do not deploy arbitrary generated automations to production.

---

# 2. COMPETITION OBJECTIVE

The judges must be able to see this real chain:

CLIENT / JUDGE
→ WEBSITE OR DEMO CHAT
→ APPROVAL
→ n8n TRIGGER
→ RESEARCH AUTOMATION
→ STRUCTURED RESEARCH RESULT
→ AUTOMATION-BUILDER WORKFLOW
→ GENERATED AUTOMATION SPEC / DEVELOPER BRIEF
→ WEBSITE RESULT
→ PDF / REPORT OUTPUT

The important point is that the n8n workflow actually executes.

Do not merely animate fake workflow steps on the website.

The website animation should reflect actual state returned by the backend/demo orchestration.

---

# 3. WHAT "LIVE" MEANS FOR THE COMPETITION

For this competition, LIVE means:

- The judge's action creates a real request.
- The request reaches the controlled n8n workflow.
- n8n executes the research workflow.
- The research workflow produces structured output.
- That output triggers the automation-builder step.
- The automation-builder produces a structured automation specification and developer handoff.
- The website receives/displays the resulting status and output.

LIVE does NOT mean:

- Public production deployment.
- Real client credentials.
- Automatic deployment of arbitrary workflows.
- Sending unsolicited emails.
- Exposing a public webhook without protection.
- Allowing an LLM to freely modify production infrastructure.

---

# 4. DO NOT REBUILD THE PRODUCT

Claude Code must first inspect:

- CLAUDE.md
- Existing architecture documentation
- Existing workflow documentation
- Existing website
- Existing n8n/workflow files
- Existing skills/MCP configuration
- Existing demo instructions
- Existing upgrade specifications

Resolve conflicts before coding.

Do not automatically implement every feature from an older master file if the repository explicitly rejected that scope.

The competition addendum is deliberately narrower.

---

# 5. COMPETITION DEMO FLOW

The website should have a polished "Try Demo" path.

The judge should:

1. Click TRY DEMO.
2. Choose:
   - Plumbing
   - Property
   - Salon
3. The demo business information automatically loads.
4. The judge sees the business problem and special request.
5. The judge clicks RUN DIAGNOSTIC.
6. Website shows:
   - New Inquiry
   - AI Analysis
   - Research
7. The real controlled n8n workflow is triggered.
8. n8n performs the demo research.
9. Research results return.
10. Website displays the three categories.
11. Website displays recommended automation agents.
12. Judge selects one or more solutions.
13. Judge clicks APPROVE.
14. Approval triggers the next n8n workflow.
15. The automation-builder workflow generates an automation specification.
16. Website displays:
   - Automation generated
   - Developer brief
   - Required integrations
   - Required information
   - Expected output
17. Generate/show the report/PDF if the existing project supports it.
18. Website shows final status.

---

# 6. THE THREE CATEGORIES

The categories remain:

## CATEGORY 1 — STANDARD BUSINESS NEEDS

Normal business/operational improvements.

Examples:
- Lead capture
- CRM
- Booking
- Follow-up
- Customer communication
- Reporting

## CATEGORY 2 — RESEARCH DISCOVERIES

Findings produced by the research workflow from available business/public context.

Examples:
- Website conversion gaps
- Response-time opportunities
- Customer journey friction
- Competitive/process gaps

## CATEGORY 3 — CLIENT REQUESTED FIXES

The specific problem/request supplied by the client/demo business.

Examples:
- WhatsApp automation
- Sales agent
- Booking agent
- Follow-up agent

Category 1 must appear first.

---

# 7. N8N WORKFLOW ARCHITECTURE

Keep this intentionally simple.

## WORKFLOW A — INQUIRY / ORCHESTRATOR

Purpose:
Receive an approved demo request and start the process.

Input:

{
  "demo": true,
  "businessId": "...",
  "business": "...",
  "industry": "...",
  "problem": "...",
  "specialRequest": "...",
  "selectedSolutions": [],
  "requestId": "..."
}

Responsibilities:

1. Validate payload.
2. Create a request ID if missing.
3. Set status to RECEIVED.
4. Trigger the research workflow.
5. Return/update status.

---

# 8. WORKFLOW B — RESEARCH

Purpose:
Actually execute the research stage.

For competition reliability, use a controlled research source/fixture if live external research is not already stable.

The workflow should:

1. Receive business data.
2. Identify business context.
3. Produce structured research findings.
4. Separate findings from assumptions.
5. Return a structured research result.

Output should resemble:

{
  "requestId": "...",
  "researchStatus": "complete",
  "sources": [],
  "findings": [],
  "opportunities": [],
  "confidence": "...",
  "demo": true
}

If real external research is used, record actual sources.

Never fabricate sources.

---

# 9. WORKFLOW C — DIAGNOSTIC CLASSIFIER

The research result and original client request should be converted into:

{
  "standard": [],
  "research": [],
  "clientRequested": []
}

The website uses this structure to render the three categories.

---

# 10. WORKFLOW D — AUTOMATION BUILDER

This is the "automation builds an automation" part of the presentation.

IMPORTANT:

The automation-builder does NOT deploy arbitrary workflows.

Instead, it generates a structured automation specification from approved solutions.

Input:

- Business context
- Original request
- Research findings
- Selected category/fixes
- Selected agents
- Required information

Output:

{
  "automationName": "...",
  "trigger": "...",
  "inputs": [],
  "steps": [],
  "integrations": [],
  "outputs": [],
  "developerNotes": [],
  "acceptanceCriteria": [],
  "status": "demo-build-ready"
}

This is a real generated artifact, not just a visual animation.

---

# 11. PRE-BUILT AUTOMATION TEMPLATES

Use structured templates for the three demo businesses.

## PLUMBING

Templates:

- Lead Capture Agent
- Sales Follow-Up Agent
- WhatsApp Response Agent
- Appointment Agent
- CRM Handoff

## PROPERTY

Templates:

- Property Lead Agent
- Lead Qualification Agent
- Viewing Scheduler
- Follow-Up Agent
- CRM Handoff

## SALON

Templates:

- Booking Agent
- WhatsApp Customer Agent
- Reminder Agent
- Retention Agent
- CRM Handoff

The automation-builder should take a selected template and generate a business-specific implementation specification.

---

# 12. EXAMPLE "AUTOMATION BUILDS AUTOMATION" OUTPUT

For Nick's Plumbing:

Approved:

Sales Agent
WhatsApp Response Agent
Appointment Agent

Generated:

Automation:
Plumbing Lead-to-Appointment System

Trigger:
New lead received

Inputs:
- Customer name
- Phone
- Service requested
- Preferred appointment time

Steps:
1. Receive lead.
2. Validate information.
3. Create CRM record.
4. Sales Agent prepares response.
5. WhatsApp Agent sends response.
6. Appointment Agent offers available slots.
7. CRM status is updated.
8. Escalate to human if required.

Integrations:
- CRM
- WhatsApp provider
- Calendar

Output:
- CRM lead
- Customer response
- Appointment request
- Follow-up task
- Developer build brief

Status:
DEMO BUILD READY

---

# 13. WEBSITE MUST SHOW REAL EXECUTION STATUS

Do not simply run a timer that says:

"Researching..."

Instead use real state transitions.

Example:

RECEIVED
↓
ANALYSIS
↓
RESEARCH
↓
RESEARCH COMPLETE
↓
DIAGNOSTIC READY
↓
AWAITING APPROVAL
↓
APPROVED
↓
BUILDING AUTOMATION
↓
AUTOMATION SPEC READY
↓
DEVELOPER BRIEF READY

If the n8n workflow fails, the UI must show an error/retry state.

---

# 14. CONTROLLED WEBHOOK / TRIGGER

A live trigger is required for the competition demonstration, but it must be controlled.

Do NOT expose a public unauthenticated production webhook.

Use the safest approach already supported by the existing project, such as:

- Authenticated webhook
- Secret/token-protected endpoint
- Server-side proxy
- Local/private n8n endpoint
- Existing secure workflow trigger

The browser should not contain private webhook secrets.

The frontend should call the application's server-side trigger layer where appropriate.

---

# 15. NO REAL PRODUCTION DEPLOYMENT

The competition demo must not automatically deploy arbitrary generated automations.

The output is:

AUTOMATION SPECIFICATION
+
DEVELOPER BUILD BRIEF

This demonstrates the concept safely.

If an existing pre-built n8n template can be safely executed in demo mode, it may be executed.

Do not dynamically create or deploy arbitrary production credentials/workflows just for the presentation.

---

# 16. WEBSITE PRESENTATION

The website should make the end-to-end process visually obvious.

Use a polished vertical/slide workflow:

### 01 — New Inquiry
"Business request received."

### 02 — AI Analysis
"LordGen is understanding the problem."

### 03 — Research
"Research workflow is running."

### 04 — Three Findings
Standard / Research / Client Request.

### 05 — Recommended Agents
Sales / Marketing / Booking / WhatsApp / CRM / etc.

### 06 — Approval
"Select what you want us to build."

### 07 — Automation Builder
"Turning your approved solutions into an implementation."

### 08 — Developer Output
"Automation specification and build brief generated."

### 09 — Final Result
Report / PDF / implementation summary.

Do not use a giant horizontal n8n-style diagram for the client-facing interface.

---

# 17. DEMO CHAT / WHATSAPP EXPERIENCE

The website may also present a simulated WhatsApp-style intake.

This is especially useful for demonstrating the small-business model.

The simulated chat should feed the SAME inquiry object as the website form.

Example:

User:
"I run a laundry business and I need customers to book through WhatsApp."

LordGen:
"Got it. What would you like to improve?"

User:
"Booking and follow-up."

Then the workflow begins.

Clearly label this as:

DEMO WHATSAPP EXPERIENCE

unless a real WhatsApp API is actually connected.

The architecture should make a future real WhatsApp API integration possible without rebuilding the diagnostic system.

---

# 18. BIG BUSINESS VS SMALL BUSINESS STORY

The presentation should communicate two entry points into the same LordGen engine.

## Website
For businesses that prefer a full online diagnostic experience.

## WhatsApp
For smaller businesses that prefer conversational interaction.

Both should eventually feed:

ONE LORDGEN DIAGNOSTIC + AUTOMATION ENGINE.

Do not build two separate backends.

---

# 19. DEVELOPER HANDOFF

After the automation-builder runs, generate:

# LORDGEN AUTOMATION BUILD BRIEF

Business:
Industry:
Original request:

Diagnostic:
- Standard
- Research
- Client Requested

Approved solutions:

Automation:
Trigger:
Inputs:
Steps:
Integrations:
Outputs:
Error handling:
Security requirements:
Missing client information:
Acceptance criteria:

Status:
DEMO BUILD READY

This is what the "developer" receives.

---

# 20. WEBSITE RESULT

The website must show the developer output.

Do not hide the most important result inside the PDF.

Show:
- Automation name
- Trigger
- Steps
- Integrations
- Output
- Developer brief
- Status

Allow the user to expand technical detail.

---

# 21. PDF

If PDF generation already exists and is stable, include the generated report.

If it is not stable, do not block the competition demo on it.

The live automation chain is more important than PDF delivery.

If PDF is generated:
- Show it on the website.
- Label it correctly.
- Do not claim it was emailed unless email is actually connected.

---

# 22. COMPETITION DASHBOARD

Show:

Business
Request ID
Workflow Status
Research Status
Diagnostic Status
Approval Status
Automation Builder
Developer Brief
Report

Example:

Business: Nick's Plumbing
Request: LG-2026-001
Research: COMPLETE
Diagnostics: READY
Approval: APPROVED
Automation Builder: COMPLETE
Developer Brief: READY
Report: READY

These values must come from actual application state.

---

# 23. WHAT MUST NOT HAPPEN

Do NOT:

- Rebuild the whole website.
- Create a new generic AI platform.
- Add unnecessary pipelines.
- Add a complex multi-agent framework just for appearance.
- Require the judge to type a long form for the demo.
- Use fake "live" workflow execution.
- Expose a public unauthenticated webhook.
- Expose API keys.
- Deploy arbitrary AI-generated workflows to production.
- Claim a real WhatsApp connection if it is simulated.
- Claim real research if demo fixtures are being used.
- Claim an email was sent when it was not.
- Replace the existing architecture without inspection.

---

# 24. COMPETITION PRIORITY ORDER

If time is limited, implement in this exact priority:

### P0 — MUST WORK
1. Try Demo business selection.
2. Automatic demo data.
3. Run Diagnostic.
4. Real controlled n8n trigger.
5. Research workflow.
6. Three-category results.
7. Solution selection.
8. Approval trigger.
9. Automation-builder workflow.
10. Generated automation specification.
11. Developer brief.
12. Website result.

### P1 — IMPORTANT
13. Beautiful slide animation.
14. Status dashboard.
15. Demo WhatsApp simulation.
16. PDF report.

### P2 — AFTER COMPETITION
17. Real WhatsApp API.
18. Real client onboarding.
19. Production CRM integrations.
20. Automatic deployment.
21. Advanced research providers.
22. Full credential management.

Do not sacrifice P0 functionality for P2 features.

---

# 25. ACCEPTANCE TEST

A judge must be able to watch this happen:

1. Choose Nick's Plumbing.
2. Click Run Diagnostic.
3. See the website create a request.
4. See the n8n trigger execute.
5. See Research execute.
6. See research complete.
7. See three categories.
8. Select Sales Agent + WhatsApp Agent + Appointment Agent.
9. Click Approve.
10. See approval trigger n8n.
11. See Automation Builder execute.
12. See generated automation specification.
13. See Developer Build Brief.
14. See final status.
15. Optionally open the generated report.

The important demonstration line is:

"One approval on the website triggered the research workflow, which produced structured findings that were then passed into an automation builder to generate the implementation."

That is the story.

---

# 26. IMPLEMENTATION RULE

Before changing code, Claude Code must:

1. Inspect the repository.
2. Read the existing project instructions.
3. Identify the current n8n/workflow setup.
4. Identify existing website trigger/state handling.
5. Identify what already exists for research.
6. Identify reusable demo data.
7. Identify existing skills/MCPs.
8. Identify the safest available trigger mechanism.

Then propose the smallest implementation needed to satisfy P0.

Do not start by rewriting the application.

---

# 27. FINAL REPORT

After implementation, report:

## What changed
## Existing functionality preserved
## New competition workflow
## n8n workflows used
## Demo businesses
## Automation templates
## Live vs demo components
## Files changed
## Environment variables required (names only)
## How to run the judge demo
## Known limitations
## Post-competition upgrades

Never expose secret values.

---

# FINAL PRINCIPLE

Build the smallest REAL end-to-end competition demonstration.

It should be:

REAL TRIGGER
+
REAL WORKFLOW EXECUTION
+
REAL STRUCTURED OUTPUT
+
REAL DEVELOPER HANDOFF

with controlled demo data where necessary.

The goal is not to prove that LordGen has already become a massive production platform.

The goal is to prove that LordGen can take a business request and move it through research, diagnosis, approval, and automation generation in one coherent system.
