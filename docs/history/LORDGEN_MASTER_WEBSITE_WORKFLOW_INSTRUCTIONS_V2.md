# LORDGEN AI — MASTER WEBSITE, DEMO, DIAGNOSTIC & AUTOMATION IMPLEMENTATION INSTRUCTIONS V2

## 0. IMPORTANT — READ THIS FIRST

This is the master implementation specification for the existing LordGen AI project.

The objective is NOT to create another pretty mockup.

The objective is to turn the existing website into a convincing, functional demonstration of an end-to-end LordGen AI business diagnostic and automation system:

CLIENT / JUDGE
→ BUSINESS INQUIRY
→ AI ANALYSIS
→ RESEARCH
→ THREE DIAGNOSTIC CATEGORIES
→ SOLUTION / AGENT SELECTION
→ CLIENT APPROVAL
→ REQUIRED INFORMATION
→ PRE-BUILT AUTOMATION TEMPLATE
→ DEVELOPER HANDOFF
→ GENERATED OUTPUT
→ PDF REPORT
→ STATUS / RESULT

IMPORTANT:
- Inspect the existing repository before changing anything.
- Do not rebuild the project from scratch.
- Preserve working functionality.
- Reuse existing components and architecture wherever practical.
- Do not delete working integrations without a replacement.
- Do not invent live research, live integrations, approvals, emails, workflow executions, or credentials.
- Demo functionality must work without external credentials wherever possible.
- Clearly distinguish LIVE, DEMO, MOCK, PENDING, and NOT CONNECTED states.
- Never expose API keys, passwords, tokens, or secrets.
- Do not turn the application into a fake static presentation. The demo must produce real structured outputs, even when those outputs are generated from deterministic demo fixtures.

---

# 1. CORE PRODUCT EXPERIENCE

LordGen AI should feel like an AI-powered business improvement and automation system.

The website should guide the user through a simple experience:

1. Try a demo OR start a real inquiry.
2. Choose a business.
3. The business information is automatically prepared in demo mode.
4. Submit the inquiry.
5. Watch the diagnostic workflow progress.
6. AI analysis runs.
7. Research runs or clearly displays demo research.
8. Findings are organized into three categories.
9. Recommended automation agents/fixes appear.
10. User selects one, several, or all solutions.
11. User approves the selected solutions.
12. The system determines what additional information is required.
13. A friendly requirements form appears.
14. The selected pre-built automation template is loaded.
15. A developer-ready implementation output is generated.
16. A polished PDF report is generated.
17. The website shows the result and implementation status.
18. Email/handoff integrations are shown as LIVE only if actually connected.

The user should always understand:
- Where they are.
- What LordGen is doing.
- What was discovered.
- What is being proposed.
- What they need to approve.
- What information is still required.
- What the developer will receive.
- What output has been produced.

---

# 2. TWO ENTRY MODES

## A. TRY DEMO

The Try Demo experience is primarily for judges, reviewers, and demonstrations.

DO NOT make the judge start by filling out a blank form.

The current "New Inquiry / Try Demo" area should be redesigned so that the judge can immediately understand and run the product.

### Recommended layout

Show:

## Try LordGen AI

"See how LordGen turns a business problem into actionable automation."

Then show three business cards:

### Plumbing
Nick's Plumbing

### Property
Demo Property Group

### Salon
Demo Beauty Studio

Each card should have:
- Business name
- Industry
- Short business description
- Small icon/image/visual
- "Try this business" button

Clicking a business should automatically load its demo context.

The judge should NOT have to type:
- Business name
- Industry
- Website
- Problem
- Special request

unless they choose to edit the demo.

Instead, display a compact preview:

Business
Industry
Primary Problem
Special Request
Available Demo Automations

Then:

"Run Diagnostic"

This makes the demo fast and understandable.

---

# 3. DEMO DATA MUST BE STRUCTURED

Do not hard-code scattered text directly into UI components.

Create structured demo business objects.

Example conceptual shape:

{
  id,
  name,
  industry,
  description,
  website,
  problem,
  specialRequest,
  researchSummary,
  standardOpportunities,
  researchOpportunities,
  clientRequestedOpportunities,
  automationTemplates
}

The exact implementation should follow the existing project's architecture.

This allows new demo businesses to be added later without rebuilding the UI.

---

# 4. DEFAULT DEMO BUSINESS #1 — PLUMBING

Example:

Business:
Nick's Plumbing

Industry:
Plumbing / Home Services

Problem:
"Leads are coming through the website and WhatsApp, but follow-up is inconsistent and appointments are being missed."

Special request:
"Create a system that responds to new leads, follows up automatically, and helps the business book appointments."

Possible standard opportunities:
- Website lead capture
- CRM lead creation
- Lead status tracking
- Appointment scheduling
- Follow-up reminders

Possible research opportunities:
- Website conversion improvements
- Faster response opportunity
- Lead journey gaps
- Customer communication gaps
- Missed follow-up opportunities

Possible client-requested opportunities:
- WhatsApp lead response
- Automated follow-up
- Appointment automation
- Sales agent

Demo automation templates:
- Lead Capture Agent
- Sales Follow-Up Agent
- WhatsApp Response Agent
- Appointment Agent
- CRM Handoff Workflow

---

# 5. DEFAULT DEMO BUSINESS #2 — PROPERTY / REAL ESTATE

Example:

Business:
Demo Property Group

Industry:
Real Estate / Property

Problem:
"Property inquiries arrive from different channels and agents struggle to follow up consistently."

Special request:
"Create a system that captures inquiries, qualifies leads, follows up, and helps schedule property viewings."

Possible standard opportunities:
- Lead capture
- CRM pipeline
- Lead qualification
- Viewing scheduling
- Follow-up tracking

Possible research opportunities:
- Inquiry response gap
- Website conversion opportunity
- Lead qualification opportunity
- Customer journey friction

Possible client-requested opportunities:
- Lead qualification agent
- Property inquiry agent
- Viewing scheduling
- Follow-up automation

Demo automation templates:
- Property Lead Agent
- Lead Qualification Agent
- Viewing Scheduler
- Follow-Up Agent
- CRM Handoff Workflow

---

# 6. DEFAULT DEMO BUSINESS #3 — SALON / BEAUTY

Example:

Business:
Demo Beauty Studio

Industry:
Salon / Beauty

Problem:
"Customers message the salon to book appointments, but reminders and follow-ups are mostly manual."

Special request:
"Create an automated booking and customer follow-up system."

Possible standard opportunities:
- Booking workflow
- Customer records
- Appointment reminders
- Follow-up
- Retention

Possible research opportunities:
- Booking friction
- Customer response gap
- Retention opportunity
- Communication opportunity

Possible client-requested opportunities:
- WhatsApp booking assistant
- Appointment agent
- Reminder automation
- Customer follow-up agent

Demo automation templates:
- Booking Agent
- WhatsApp Customer Agent
- Reminder Agent
- Retention Agent
- CRM Handoff Workflow

---

# 7. REAL BUSINESS MODE

The second entry option should be:

"Start a Real Inquiry"

This should open a guided intake experience.

Collect:
- Business name
- Industry
- Website
- Location/market if relevant
- Main service/product
- Current tools
- Main problem
- Desired outcome
- Optional additional context

The form should be progressive, not overwhelming.

The most important field remains:

"What would you like LordGen AI to fix, improve, or automate?"

Allow natural-language answers.

The real inquiry path must remain separate from the demo path.

---

# 8. NEW INQUIRY UI

The New Inquiry area should NOT look like a generic form sitting on the page.

Make it feel like the beginning of an intelligent workflow.

Suggested presentation:

[ New Inquiry ]

"Tell LordGen what you want to improve."

Then:
- Demo / Real toggle
- Business selection for demo
- Problem input for real mode
- Optional context
- Submit / Analyze button

Use a clear progress indicator.

Do not put a huge technical workflow diagram beside the form.

---

# 9. WORKFLOW UI — COMPLETE REDESIGN

The current workflow presentation is considered visually messy.

REMOVE:
- Bottom horizontal scrolling
- Wide workflow diagrams
- Dense node-based displays
- Technical workflow-editor appearance
- Large empty spaces
- Confusing nested cards
- Excessive text

REPLACE with a vertical / slide-based guided experience.

The user should progress through cards/slides such as:

### Slide 1 — New Inquiry
Business and problem received.

### Slide 2 — AI Analysis
LordGen interprets the business request.

### Slide 3 — Research
LordGen reviews available business/context information.

### Slide 4 — Diagnostic Findings
Three categories appear.

### Slide 5 — Recommended Agents
The automation/fix recommendations appear.

### Slide 6 — Select Solutions
User chooses what they want.

### Slide 7 — Approval
User approves selected solutions.

### Slide 8 — Required Information
System asks only for information needed to implement the approved automations.

### Slide 9 — Automation Template
A pre-built automation template is loaded.

### Slide 10 — Developer Handoff
Implementation brief is generated.

### Slide 11 — Output
PDF/report/workflow output is shown.

Use:
- Progress dots
- Step labels
- Next / Back
- Smooth transitions
- Clean cards
- Soft shadows
- Strong typography

Do not require horizontal scrolling.

---

# 10. DASHBOARD

Place a compact but informative dashboard near the top of the workflow/result experience.

The dashboard should feel like a real product control panel.

Possible metrics:

Business
Problems Identified
Solutions Available
Solutions Selected
Approval
Research
Automation
PDF
Developer Handoff

Example:

Business: Nick's Plumbing
Problems: 8
Categories: 3
Solutions Selected: 4
Approval: Pending
Research: DEMO
Automation: Ready
PDF: Ready
Handoff: Pending

Use actual application state.

Never manufacture fake live metrics.

---

# 11. LIVE / DEMO / PENDING STATUS

Add a small status table/panel.

Example:

| Component | Status |
|---|---|
| Business Diagnostic | LIVE |
| Demo Research | LIVE |
| PDF Generation | LIVE |
| Email Delivery | PENDING |
| WhatsApp Integration | PENDING CLIENT INFO |
| CRM Integration | DEMO |
| Developer Handoff | DEMO |

Only use statuses that accurately describe implementation.

This panel is useful because it makes the demo credible without pretending every external service is connected.

---

# 12. THREE DIAGNOSTIC CATEGORIES

The system must always organize the diagnosis into exactly three categories.

## CATEGORY 1 — STANDARD BUSINESS NEEDS

These are normal operational improvements identified from the business model and common business requirements.

Examples:
- Lead capture
- CRM
- Booking
- Customer follow-up
- Email
- Reporting
- Communication

This category should appear FIRST.

---

## CATEGORY 2 — RESEARCH DISCOVERIES

This is what LordGen identifies from available online/business research.

Possible sources may include:
- Business website
- Public business information
- Search
- Social profiles
- Industry context
- Website review
- Other permitted research sources

Do not claim live research occurred if no live provider was connected.

For demo mode, clearly use deterministic demo research.

---

## CATEGORY 3 — CLIENT REQUESTED FIXES

This is what the client explicitly asked LordGen to solve.

Keep the client's original request visible.

Then show the automation agents that can address it.

---

# 13. VISUAL PRESENTATION OF THE THREE CATEGORIES

This should NOT simply be three blocks of text.

Create an engaging visual presentation.

A recommended approach is three vertically stacked sections/cards:

### STANDARD
"Here's what the business normally needs."

Show agent/fix cards.

### RESEARCH
"Here's what LordGen discovered."

Show research opportunities and agent/fix cards.

### CLIENT REQUEST
"Here's what you specifically asked us to solve."

Show the requested problem and recommended agents.

Each section can have:
- Category icon
- Short explanation
- Number of findings
- Agent cards
- Impact
- Priority
- Select button

Use subtle animation as each category appears.

Do not over-animate.

---

# 14. AUTOMATION AGENTS

The system should present solutions as understandable agents/automation systems.

Examples:

## Sales Agent
Captures, qualifies, follows up with leads and moves them through the sales process.

## Marketing Agent
Helps manage campaigns, lead nurturing, content-related workflows, and follow-up.

## Customer Support Agent
Handles common customer questions and routes requests.

## Booking Agent
Helps customers schedule appointments.

## WhatsApp Agent
Handles WhatsApp-based customer communication when the appropriate integration is connected.

## CRM Agent
Moves customer/lead information into the appropriate CRM.

## Research Agent
Collects and organizes research information.

## Follow-Up Agent
Automatically follows up with leads/customers based on defined rules.

## Reporting Agent
Produces structured summaries and status reports.

Use client-friendly explanations.

Do not force clients to understand technical terms.

---

# 15. AGENT CARDS

Each agent card should contain:

Agent name
What it does
Problem it solves
Expected result
Required integrations
Status
Select button

Example:

Sales Agent

"Responds to new leads, qualifies them, and triggers follow-up."

Impact:
High

Requires:
CRM + messaging channel

Status:
Demo Ready

[ Select Agent ]

---

# 16. AUTOMATION TEMPLATE LIBRARY — IMPORTANT

This is a NEW CORE REQUIREMENT.

LordGen should not merely show what an automation could be.

For the demo, pre-build structured automation templates that represent the actual implementation.

The judge should be able to click an automation template and see a real structured output.

The templates can be deterministic/demo implementations, but they must produce useful artifacts.

Do not create only screenshots.

---

# 17. TEMPLATE LIBRARY STRUCTURE

Create a reusable template system.

Conceptual structure:

AutomationTemplate:
- id
- name
- description
- businessTypes
- trigger
- inputs
- steps
- tools
- integrations
- outputs
- developerNotes
- acceptanceCriteria
- demoStatus

The exact code should follow the project's architecture.

---

# 18. DEFAULT AUTOMATION TEMPLATES

At minimum create templates for:

## Plumbing

1. Lead Capture Agent
2. Sales Follow-Up Agent
3. WhatsApp Response Agent
4. Appointment Agent
5. CRM Handoff

## Property

1. Property Lead Agent
2. Lead Qualification Agent
3. Viewing Scheduler
4. Follow-Up Agent
5. CRM Handoff

## Salon

1. Booking Agent
2. WhatsApp Customer Agent
3. Reminder Agent
4. Retention Agent
5. CRM Handoff

---

# 19. AUTOMATION TEMPLATE OUTPUT

When a judge selects an automation, generate a structured implementation output.

For example:

Automation:
Sales Follow-Up Agent

Trigger:
New qualified lead

Inputs:
- Name
- Phone
- Email
- Service requested
- Lead source

Logic:
1. Receive lead.
2. Validate required information.
3. Create/update CRM record.
4. Send initial response.
5. Schedule follow-up.
6. Update lead status.
7. Notify team if lead requires human attention.

Integrations:
- CRM
- Messaging
- Email

Output:
- CRM record
- Customer message
- Follow-up task
- Status update

Developer notes:
Implementation details.

Acceptance criteria:
- New leads are captured.
- Lead is created in CRM.
- Customer receives response.
- Follow-up is scheduled.
- Failure is surfaced.

This is the kind of "real output" the demo must produce.

---

# 20. DEMO AUTOMATION EXECUTION

When the judge selects:

"Build this automation"

the system should NOT pretend it deployed a real workflow unless it actually did.

Instead, in demo mode:

1. Load the template.
2. Populate it with the selected business data.
3. Generate the workflow configuration.
4. Generate developer instructions.
5. Generate sample inputs/outputs.
6. Generate an implementation summary.
7. Show the resulting artifact.

Label it:

DEMO BUILD

or

DEMO OUTPUT

If a real workflow engine is connected, show the real status.

---

# 21. DEVELOPER OUTPUT

The generated developer package should contain:

## Business Context
Business and industry.

## Client Request
Original problem.

## Diagnostic Findings
Three categories.

## Approved Solutions
Selected agents.

## Automation Template
Template used.

## Trigger
What starts the workflow.

## Inputs
Required data.

## Workflow Steps
Ordered implementation logic.

## Integrations
Required services.

## Missing Information
Anything still needed.

## Developer Notes
Technical implementation guidance.

## Acceptance Criteria
How the finished automation should be tested.

This is the bridge from client to developer.

---

# 22. SAMPLE WORKFLOW OUTPUT

For demo purposes, produce something that looks like a real implementation artifact.

For example:

LORDGEN AI
AUTOMATION BUILD BRIEF

Client:
Nick's Plumbing

Approved:
Sales Agent
WhatsApp Response Agent
Appointment Agent

Trigger:
New website/WhatsApp lead

Flow:
Lead received
→ Validate information
→ Create CRM record
→ Sales Agent responds
→ WhatsApp Agent follows up
→ Appointment Agent offers booking
→ CRM status updated
→ Human escalation if required

Required:
CRM
WhatsApp provider
Calendar

Status:
DEMO BUILD READY

This can be displayed in the website and included in the PDF.

---

# 23. OPTIONAL WORKFLOW VISUAL

If the project already supports workflow visualization, use a small visual representation of:

Trigger
↓
Agent
↓
Integration
↓
Action
↓
Output

Do NOT use a huge horizontal node editor.

Keep the client view simple.

A developer view can contain more technical detail.

---

# 24. POST-APPROVAL REQUIREMENTS

After the client approves selected solutions, calculate what information is required.

Show:

"Your automation plan is approved."

Then:

"Before we build it, we need a few details."

Only ask questions relevant to the approved solutions.

Example:

WhatsApp Agent selected:
- Business WhatsApp number
- Preferred communication style
- Business hours
- Existing WhatsApp provider

Booking Agent selected:
- Booking platform
- Appointment duration
- Business hours
- Reminder timing

CRM Agent selected:
- CRM platform
- Pipeline stages
- Required customer fields

Never ask for unnecessary information.

---

# 25. SECURE CREDENTIAL HANDLING

Do not ask clients to paste:
- API secrets
- Passwords
- Private keys
- Access tokens

into the normal website form.

Instead explain that secure connection/setup will be handled through an approved secure method.

The UI should distinguish:
"Information we need from you"
from
"Secure connection required."

---

# 26. PDF REPORT

Generate a polished LordGen AI PDF containing:

1. Business overview
2. Original request
3. Research/diagnostic summary
4. Three categories
5. Recommended agents
6. Selected solutions
7. Approval status
8. Required information
9. Automation template
10. Developer implementation brief
11. Expected outcome
12. Next steps

The website should show the same essential result.

Do not make the PDF the only output.

---

# 27. EMAIL DELIVERY

If email integration is actually connected:
- Send the PDF/report.
- Show sent status.

If not connected:
- Generate the report.
- Show "Email delivery pending connection."

Never claim the email was sent if it was not.

---

# 28. RESEARCH ARCHITECTURE

Keep research provider-agnostic.

Possible providers:
- Demo Research Provider
- Web Search
- Firecrawl
- Perplexity
- Other research APIs
- LLM provider
- MCP tools

Separate:
Research orchestration
→ Provider
→ Analysis
→ Diagnostic classification
→ Recommendation engine

The UI should not depend on one provider.

---

# 29. DEMO RESEARCH

For judge demos, use seeded research data.

This guarantees:
- No network dependency
- No broken demo
- Predictable results
- Fast execution

Clearly label the state as DEMO RESEARCH.

Do not fabricate citations that imply real web research.

If the project already has a real research provider, show actual sources.

---

# 30. RESULT ANIMATION

The result experience should feel alive without becoming distracting.

Suggested sequence:

New Inquiry
→ AI Analysis
→ Research
→ Standard Needs
→ Research Discoveries
→ Client Requests
→ Recommended Agents
→ Select Solutions
→ Approval
→ Build Requirements
→ Automation Template
→ Developer Output
→ PDF

Use:
- Progress animation
- Loading state
- Completion state
- Small transitions
- Status changes

Avoid:
- Constant spinning
- Excessive particle effects
- Long fake loading delays

Animation should communicate process, not hide the lack of functionality.

---

# 31. RESOURCE LINKS

Where actual resources exist, show useful links:
- GitHub
- Generated report
- Developer brief
- Workflow artifact
- Research source
- Project output

Do not create fake links.

---

# 32. VISUAL DESIGN

The final product should feel:
- Premium
- Modern
- AI-native
- Trustworthy
- Business-ready
- Consulting-grade

Avoid:
- Generic template appearance
- Excessive gradients
- Neon overload
- Huge empty cards
- Tiny text
- Dense technical diagrams
- Horizontal scroll
- Fake statistics
- Fake integrations

Use:
- Strong typography
- Consistent spacing
- Soft shadows
- Rounded cards
- Clean hierarchy
- Subtle animations
- Responsive layouts
- Accessible contrast

---

# 33. MOBILE

The entire flow must work on mobile.

Never require horizontal scrolling.

Stack cards vertically.

Make:
- Navigation
- Buttons
- Progress
- Forms
- Tables
- Results

easy to use on small screens.

---

# 34. STATE MODEL

The UI should be driven by application state.

At minimum support concepts equivalent to:

businessMode
business
problem
specialRequest
researchStatus
analysisStatus
diagnosticResults
selectedSolutions
approvalStatus
requiredInformation
automationTemplate
buildStatus
developerOutput
pdfStatus
emailStatus
handoffStatus

Use the existing project's preferred state-management architecture.

---

# 35. IMPORTANT STATE RULES

Never show:

"Approved"

until approval actually happens.

Never show:

"Research Complete"

if research did not actually complete.

Never show:

"Email Sent"

if email was not sent.

Never show:

"Automation Deployed"

if it was only generated as a demo.

Instead use:
- Demo Ready
- Demo Generated
- Pending Connection
- Ready for Build
- Build Generated
- Live
- Complete

---

# 36. REPOSITORY INSPECTION — REQUIRED

Before coding, inspect:

1. Repository structure
2. Frontend framework
3. Backend/API
4. Current New Inquiry area
5. Current Try Demo area
6. Current forms
7. Current demo data
8. Current workflow UI
9. Current research logic
10. Current PDF generation
11. Current email integration
12. Current automation/integration code
13. Existing design system
14. Reusable components
15. Tests
16. Environment variables

Then create a concise implementation plan.

Do not blindly overwrite files.

---

# 37. IMPLEMENTATION ORDER

## Phase 1 — Inspect
Understand the existing application.

## Phase 2 — Redesign Entry
Fix New Inquiry and Try Demo.

## Phase 3 — Workflow
Replace messy workflow with slide-based flow.

## Phase 4 — Dashboard
Add status/metrics.

## Phase 5 — Diagnostic
Implement three categories.

## Phase 6 — Agents
Implement recommended automation agent cards.

## Phase 7 — Selection
Allow one/multiple/all solution selection.

## Phase 8 — Approval
Implement real approval state.

## Phase 9 — Requirements
Generate dynamic information requests.

## Phase 10 — Template Library
Add pre-built automation templates.

## Phase 11 — Demo Build
Generate real structured demo outputs from templates.

## Phase 12 — Developer Handoff
Generate implementation brief.

## Phase 13 — PDF
Generate report.

## Phase 14 — Email
Connect if available, otherwise show pending state.

## Phase 15 — QA
Test every path.

---

# 38. ACCEPTANCE TEST — JUDGE DEMO

A judge should be able to complete this without typing much:

1. Open LordGen.
2. Click Try Demo.
3. Choose Plumbing.
4. See auto-filled business context.
5. Click Run Diagnostic.
6. See New Inquiry.
7. See AI Analysis.
8. See Research.
9. See Category 1: Standard.
10. See Category 2: Research.
11. See Category 3: Client Request.
12. See recommended agents.
13. Select several agents.
14. Click Continue.
15. Approve.
16. See required client information.
17. See pre-built automation template.
18. Click Generate Demo Build.
19. See generated automation output.
20. See developer implementation brief.
21. Generate PDF.
22. See PDF/report status.
23. See overall dashboard status.

This is the core demonstration.

---

# 39. ACCEPTANCE TEST — REAL CLIENT

A real client should be able to:

1. Click Start Real Inquiry.
2. Enter business details.
3. Describe their problem.
4. Submit.
5. Run available research.
6. See the three categories.
7. Review recommended solutions.
8. Select solutions.
9. Approve.
10. Provide required implementation information.
11. Receive a structured implementation summary.
12. Receive/view the PDF if connected.
13. Proceed to secure integration setup.

---

# 40. QA CHECKLIST

Verify:

- Try Demo works.
- Plumbing demo works.
- Property demo works.
- Salon demo works.
- Real inquiry works.
- No blank/confusing initial form.
- Demo data loads automatically.
- User can edit demo data if desired.
- New Inquiry looks professional.
- No bottom horizontal scroll.
- Workflow is slide-based.
- AI Analysis step works.
- Research step has honest status.
- Three categories appear in correct order.
- Agents appear.
- Agent selection works.
- Approval works.
- Required information is dynamic.
- Automation templates load.
- Demo build produces structured output.
- Developer brief is generated.
- PDF is generated.
- Email status is truthful.
- Dashboard reflects actual state.
- Links work.
- Mobile works.
- No console errors.
- No exposed secrets.

---

# 41. PERFORMANCE

Do not add unnecessary delays just to make the demo look like AI is working.

If a process is mocked/demo:
- Use a short, tasteful transition.
- Show meaningful progress.
- Complete quickly.

If live:
- Show real loading state.
- Handle errors.

---

# 42. DO NOT OVERENGINEER

Do not introduce unnecessary:
- Databases
- Microservices
- Queues
- Vector databases
- External SaaS
- AI providers
- MCP servers

unless the existing project actually requires them.

The first goal is a reliable end-to-end product experience.

---

# 43. FINAL QUALITY BAR

The result should answer this question immediately:

"Can I see how LordGen takes a business problem, researches it, identifies what should be fixed, gets the client to approve it, turns the approval into an automation plan, and produces something a developer can actually build?"

If the answer is not obviously YES, continue improving the flow.

The demo should not feel like:
"Here is a dashboard showing some fake AI cards."

It should feel like:
"Here is a working demonstration of LordGen's business-to-automation pipeline."

---

# 44. FINAL CLAUDE CODE REPORT

After implementation, provide:

## Completed
Major changes.

## Files Changed
All modified/created files.

## Dependencies
Only new dependencies.

## Integrations
For each:
- LIVE
- DEMO
- PENDING
- NOT CONNECTED

## Automation Templates
List templates implemented.

## Demo Businesses
List:
- Plumbing
- Property
- Salon

## Demo Instructions
Exact steps to run the judge demonstration.

## Environment Variables
Variable NAMES only.
Never expose values.

## Known Limitations
Only real limitations.

## Next Steps
Only useful next steps.

Do not claim functionality that was not actually implemented.

---

# 45. FINAL NON-NEGOTIABLE RULE

DO NOT turn this into a static visual prototype.

The UI can be polished and animated, but the important transitions must be backed by actual application state and structured data.

The demo must produce actual structured outputs:
- diagnostic results
- selected solutions
- approval state
- required information
- automation template
- generated workflow/build brief
- developer handoff
- PDF/report

Even where external integrations are unavailable, produce a deterministic DEMO output rather than an empty placeholder.

Inspect first.
Preserve what works.
Build incrementally.
Keep the experience clear.
Make the judge understand the product within seconds.
Make the end-to-end result tangible.
