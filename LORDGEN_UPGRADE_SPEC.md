# LORDGEN AI — DEMO UPGRADE SPECIFICATION

**Document type:** Repository upgrade specification  
**Purpose:** Extend the existing LordGen AI demo without rebuilding or breaking the current implementation.  
**Primary agent:** Claude Code  
**Status:** Implementation-ready specification  
**Scope:** Demo now; architecture should be extensible toward the full LordGen AI platform.

---

## 1. NON-NEGOTIABLE RULE

This is an **upgrade to the existing repository**, not a greenfield rebuild.

Before changing anything:

1. Read `CLAUDE.md` and every project instruction file already present.
2. Inspect the current repository structure, routes, components, APIs, data models, workflows, environment variables, tests, and existing demo behavior.
3. Identify what is already implemented.
4. Map each requirement in this document to the existing implementation.
5. Preserve working functionality.
6. Reuse existing architecture where practical.
7. Do not replace the stack, framework, database, authentication, or workflow engine without proving the existing implementation cannot support the requirement.
8. Do not install MCPs or external services merely because they are available.
9. If a requirement needs credentials, an API, webhook URL, OAuth connection, MCP, external service, or infrastructure change, STOP at the dependency boundary and report exactly what is required before inventing values.

---

# 2. DEMO OBJECTIVE

The demo should communicate one core idea:

> **LordGen AI researches a business, understands its needs and pain points, asks the right questions in plain language, translates those answers into technical requirements, recommends solutions, and produces a professional deliverable.**

The experience must be understandable to:

- non-technical business owners;
- technical users;
- judges/evaluators;
- potential consulting clients.

The interface should feel like a polished consulting intake and diagnostic platform, not an AI laboratory.

---

# 3. HIGH-LEVEL USER JOURNEY

The intended flow is:

1. Visitor lands on the LordGen AI website.
2. Visitor selects a profession/business type.
3. Visitor can select an existing business or a generic business scenario where supported by the demo.
4. The system presents a tailored diagnostic experience.
5. The system explains the business's likely standard needs.
6. The system presents research-derived pain points where demo data exists.
7. The user states the problem(s) they want solved.
8. The system asks business-specific questions.
9. User chooses between:
   - **Recommended / Guided**
   - **Custom / Technical**
10. Guided users receive simple questions and recommendations.
11. Technical users can provide more precise specifications.
12. The form supports both predefined choices and custom specifications.
13. Submission goes through the webhook/backend workflow.
14. AI processes the structured intake.
15. AI produces a diagnostic and recommended solution.
16. A branded LordGen AI PDF is generated.
17. The result can be sent to the provided email address.
18. The submission can create/update a ClickUp task with the diagnostic information.
19. The UI displays a clean completion/result state.

---

# 4. BRANDED WEBSITE

Create or upgrade the public-facing LordGen AI website.

## Requirements

- LordGen AI branding.
- Professional consulting/technology positioning.
- Extremely clear calls to action.
- Non-technical language on the public interface.
- Responsive design.
- Accessible forms and controls.
- No unnecessary technical jargon.
- The website should make the workflow understandable without explaining AI internals.

## Suggested primary CTA

Examples:

- Start Your Business Diagnostic
- Discover What Your Business Needs
- Get Your Business Assessment

Do not hard-code a CTA if the existing project already has an appropriate one.

---

# 5. PROFESSION SELECTOR

The demo must support multiple professions/business categories.

The architecture must NOT hard-code the entire application around plumbing.

The current plumbing example may remain as a seed/demo scenario, but the system must make it straightforward to add more professions.

## Demo target

Prepare at least 3–4 representative professions/business types.

One can be the existing plumbing example.

Each profession should have its own configuration rather than duplicated UI code.

Example conceptual structure:

```text
profession
├── identity
├── standard_needs
├── common_systems
├── common_pain_points
├── diagnostic_questions
├── recommended_services
├── technical_questions
├── branding_questions
└── output_rules
```

The exact schema must follow the existing project's architecture if one already exists.

---

# 6. THREE-LAYER BUSINESS DIAGNOSTIC MODEL

The diagnostic engine must distinguish three sources of need.

## Layer A — STANDARD BUSINESS NEEDS

These are needs that are generally expected for the selected profession.

Examples:

- website;
- CRM;
- ERP;
- lead management;
- appointment/booking system;
- customer communication;
- reporting;
- workflow automation;
- payment systems;
- inventory;
- scheduling;
- document management;
- customer follow-up;
- analytics.

Do not assume every profession needs every system.

The profession configuration determines which standard needs apply.

---

## Layer B — RESEARCH / REVIEW-BASED PAIN POINTS

Where data is available, the system should identify pain points from public business/customer feedback.

Potential sources may include:

- Google reviews;
- Yelp;
- Facebook;
- Instagram;
- other publicly available review/discussion sources where legally and technically appropriate.

For the demo, this data may be **preloaded/mock research data**.

The demo should clearly distinguish:

- research-derived information;
- simulated/demo information;
- user-provided information.

Do not fabricate real reviews and present them as real.

If live scraping/research is implemented later, respect website terms, robots rules, authentication requirements, rate limits, and applicable law.

---

## Layer C — CLIENT-STATED PROBLEMS

The user must be able to tell LordGen AI what they personally want fixed.

Examples:

- "I need more customers."
- "Customers don't follow up after getting quotes."
- "I want my staff to stop using spreadsheets."
- "I need a better booking process."
- "I want a new website."
- "I want my CRM organized."
- "I want to automate customer responses."

There must always be an **Other / Custom** path.

---

# 7. RESEARCH + WEBSITE DESIGN RECOMMENDATIONS

If the proposed solution requires a website, the workflow should research strong websites in the same or closely related industry and use them as **design/reference inspiration**.

Important:

### Do NOT directly clone copyrighted/proprietary websites.

Instead:

1. Identify high-quality reference websites.
2. Analyze useful patterns:
   - information architecture;
   - page hierarchy;
   - CTA placement;
   - navigation;
   - service presentation;
   - trust signals;
   - forms;
   - conversion patterns;
   - visual direction;
   - responsive behavior.
3. Propose a design direction appropriate for the client's business.
4. Create an original implementation adapted to the client's brand and requirements.

The output should say **inspired by researched patterns**, not "copy this website."

For the demo, reference websites may be preloaded to avoid unreliable live research during a judge presentation.

---

# 8. ADAPTIVE QUESTIONNAIRE ENGINE

This is one of the most important upgrades.

The form must NOT be one giant generic questionnaire.

Questions should be selected according to:

- profession;
- business type;
- business maturity;
- selected problem;
- requested service;
- user mode;
- previous answers;
- whether a website/CRM/ERP/automation/brand/etc. is required.

The architecture should support conditional questions.

Conceptually:

```text
Profession
   ↓
Business context
   ↓
Detected/selected needs
   ↓
Relevant questions
   ↓
Follow-up questions
   ↓
Technical/custom questions if requested
   ↓
Final diagnostic
```

---

# 9. USER MODES

The form must have two paths.

## MODE A — RECOMMENDED / GUIDED

Designed for non-technical users.

The user should see questions like:

- What would you like to improve?
- Which style feels closest to your business?
- How would you like customers to contact you?
- What is your biggest frustration right now?
- Would you prefer something simple or more advanced?
- Which option feels closest to what you want?

Avoid exposing technical terminology unless necessary.

The AI translates these answers into technical requirements internally.

---

## MODE B — CUSTOM / TECHNICAL

Designed for users who know exactly what they want.

Allow more precise specifications.

Examples:

- preferred framework/platform;
- CRM;
- integrations;
- API requirements;
- database requirements;
- hosting;
- authentication;
- automation;
- webhook requirements;
- brand hex values;
- typography;
- preferred technical architecture;
- specific functionality.

The technical mode must still be organized and user-friendly.

---

# 10. RECOMMENDED VS CUSTOM SETTINGS

This applies beyond colors.

For configurable requirements, support:

### Recommended

The AI/business configuration proposes sensible defaults.

### Custom

The user overrides the recommendation.

This pattern should be reusable for:

- branding;
- colors;
- typography;
- website style;
- CRM;
- integrations;
- automation;
- communication tone;
- workflow behavior;
- technical architecture;
- reporting;
- user roles;
- notification preferences;
- other profession-specific requirements.

---

# 11. BRANDING QUESTIONS

If branding is relevant, ask business-friendly questions.

Examples:

### Color

"Which direction feels right for your brand?"

- Gold
- Green
- Blue
- Black
- Neutral
- Other / Custom

Then provide custom specification where appropriate.

Example:

> "I want gold, but slightly darker and mixed with a warm brown."

The system should preserve that nuance rather than forcing the user into a fixed palette.

### Tone of voice

Examples:

- Professional
- Friendly
- Premium
- Bold
- Traditional
- Modern
- Technical
- Casual
- Other / Custom

### Customer communication style

The system should support learning from examples supplied by the client.

---

# 12. CLIENT COMMUNICATION / TONE ANALYSIS

Where relevant, provide an optional input area where the client can supply several previous email/message conversations.

Purpose:

- identify communication style;
- identify tone;
- identify preferred terminology;
- identify how the business responds to customers;
- help generate future communication requirements.

The system should NOT automatically expose private customer information in reports.

Implement appropriate privacy handling, validation, and redaction where practical.

The demo can use sanitized/sample conversations.

---

# 13. GOOGLE-FORMS-LIKE EXPERIENCE

The intake should feel as easy as Google Forms.

The requirement is the **experience**, not a dependency on Google Forms itself.

Preferred demo behavior:

- simple multi-step pages;
- progress indicator;
- one logical question group at a time;
- clear buttons;
- save/continue behavior where practical;
- mobile-friendly;
- plain-language questions;
- required-field validation;
- "Other / Custom" input;
- Recommended and Custom paths.

If the existing project already uses a form system, extend it instead of replacing it.

---

# 14. WEBHOOK ARCHITECTURE

The website/form is the front door.

The webhook/backend is the transport layer into the AI workflow.

Conceptual flow:

```text
Website
  ↓
Profession Selection
  ↓
Adaptive Intake
  ↓
Structured Submission
  ↓
Webhook/API
  ↓
AI Diagnostic Workflow
  ↓
Recommendation Engine
  ↓
Report Generator
  ├── PDF
  ├── Email
  └── ClickUp
```

The webhook payload should be structured JSON.

It should contain enough information to reproduce the diagnostic.

At minimum, conceptually:

```text
submission_id
profession
business
user_mode
business_context
standard_needs
research_pain_points
client_problems
answers
branding_preferences
technical_preferences
communication_preferences
requested_services
email
metadata
```

Use the existing project's schema where available.

---

# 15. AI DIAGNOSTIC OUTPUT

The AI should reconcile the three layers:

1. Standard business needs.
2. Research/review-derived pain points.
3. Client-stated problems.

Then determine:

- confirmed needs;
- likely needs;
- optional improvements;
- recommended services;
- recommended systems;
- automation opportunities;
- website requirements if applicable;
- CRM requirements if applicable;
- ERP requirements if applicable;
- branding requirements if applicable;
- next steps.

The AI must distinguish facts from assumptions.

---

# 16. BRANDED PDF REPORT

At the end of the diagnostic workflow, generate a professional LordGen AI branded PDF.

The PDF should be suitable for:

- sending to the client;
- internal review;
- email attachment;
- ClickUp record;
- judge demonstration.

Suggested sections:

1. LordGen AI branding.
2. Business overview.
3. Selected profession.
4. Diagnostic summary.
5. Standard business needs.
6. Research/review-based findings.
7. Client-stated problems.
8. Recommended solution.
9. Recommended systems/services.
10. Website/design recommendations if applicable.
11. Branding recommendations if applicable.
12. Technical requirements if supplied.
13. Priority recommendations.
14. Proposed next steps.
15. Demo disclaimer/data-source note where appropriate.

The PDF should be clean and professional, not an AI transcript.

---

# 17. EMAIL DELIVERY

After successful submission:

1. Generate the PDF.
2. Send the PDF to the user's supplied email address.
3. Use a professional LordGen AI email format.
4. Do not expose internal prompts, system instructions, secrets, API keys, or private workflow details.

Email delivery must be implemented behind a provider abstraction if the current architecture supports it.

Do not hard-code credentials.

---

# 18. CLICKUP INTEGRATION

After successful processing, create or update a ClickUp task where configured.

The task should contain a concise but useful text summary.

Recommended content:

- business;
- profession;
- diagnostic status;
- primary problems;
- recommended solution;
- priority items;
- requested services;
- contact email;
- submission ID;
- report status.

Where the existing integration permits, attach or link the generated PDF.

Do not make ClickUp a hard dependency for the core diagnostic.

If ClickUp credentials are absent, the diagnostic should still work and the UI should show an appropriate integration status.

---

# 19. FAILURE-TOLERANT DEMO MODE

The judge-facing demo must not depend on unreliable live services.

Use a clear demo mode/configuration.

Recommended:

```text
DEMO_MODE=true
```

When demo mode is enabled:

- use seeded profession data;
- use seeded research examples;
- use deterministic AI fixtures where necessary;
- avoid live scraping;
- avoid mandatory external APIs;
- still demonstrate the full UI and workflow;
- clearly label simulated data where necessary.

Production integrations should remain architecturally possible.

---

# 20. PROFESSION CONFIGURATION

Do not scatter profession-specific questions throughout components.

Create a reusable configuration/data layer.

Each profession should be able to define:

- display name;
- description;
- standard needs;
- common pain points;
- research sources/data;
- questions;
- conditional questions;
- recommended services;
- optional services;
- technical questions;
- branding relevance;
- CRM relevance;
- ERP relevance;
- website relevance;
- automation relevance;
- output/report rules.

This is critical for scaling beyond the demo.

---

# 21. DEMO PROFESSIONS

Use 3–4 professions for the demo.

The existing plumbing scenario can be retained.

Add enough variety to prove that the engine adapts rather than simply changing labels.

Choose professions that demonstrate different needs.

For example:

- Plumbing/Home Services
- Dental Practice
- Real Estate
- Professional Consulting

If the existing demo already uses other professions, preserve those and extend the configuration.

---

# 22. SECURITY REQUIREMENTS

Never place secrets in:

- source code;
- frontend bundles;
- public JSON;
- markdown documentation;
- Git commits.

Use environment variables.

Create/update `.env.example` with variable names only.

Potential integration variables may include:

```text
AI_API_KEY
WEBHOOK_URL
EMAIL_PROVIDER_API_KEY
CLICKUP_API_KEY
CLICKUP_LIST_ID
CLICKUP_SPACE_ID
CONTEXT7_API_KEY
```

Only add variables actually required by the implementation.

Do not invent provider-specific credentials.

---

# 23. API / MCP DISCOVERY RULE

Claude Code must inspect the current implementation first.

For every external dependency, classify it as:

### Required now

Needed for the demo to work.

### Optional

Improves the system but demo can run without it.

### Production-only

Should not block the demo.

For every required dependency, report:

- provider;
- purpose;
- account needed?;
- API key needed?;
- OAuth needed?;
- webhook URL needed?;
- environment variable;
- setup steps;
- security implications;
- free/paid considerations if known.

Do not install a third-party MCP merely because it exists.

---

# 24. RECOMMENDED DEVELOPMENT TOOLS

Use official/maintained tools where they materially help.

### Playwright

Use for browser testing and end-to-end validation.

Microsoft documents Playwright MCP for AI browser control and also provides a CLI/skills route for coding agents. Prefer the least complex option that fits the existing project. citeturn0search0turn0search5

### Context7

Useful when Claude Code needs current, version-specific documentation for libraries/APIs. Context7 supports both MCP and CLI/skills approaches. An API key is optional for basic usage and recommended for higher limits/private repositories. citeturn0search4turn0search9

### ClickUp MCP

Use only if it materially helps development/validation of the ClickUp integration. ClickUp provides an official MCP server available across plans. citeturn0search6

### GitHub

Use the existing repository and Git workflow. Do not introduce an unofficial GitHub MCP if ordinary Git/CLI is sufficient.

---

# 25. DO NOT OVERBUILD

The demo is not the final LordGen AI platform.

Prioritize:

1. polished user journey;
2. profession adaptability;
3. diagnostic logic;
4. guided/custom intake;
5. believable research layer;
6. recommendation output;
7. PDF generation;
8. webhook architecture;
9. email delivery;
10. ClickUp integration;
11. tests;
12. documentation.

Do not spend the majority of the implementation on infrastructure that the judge will never see.

---

# 26. TESTING REQUIREMENTS

At minimum test:

- landing page;
- profession selection;
- each demo profession;
- guided mode;
- custom/technical mode;
- conditional questions;
- custom answer fields;
- submission validation;
- webhook payload;
- diagnostic generation;
- PDF generation;
- email path;
- ClickUp path;
- missing integration credentials;
- demo mode;
- mobile layout;
- error handling.

The application must degrade gracefully when an optional integration is unavailable.

---

# 27. ACCEPTANCE CRITERIA

The upgrade is successful when a judge can:

1. Open the LordGen AI website.
2. Understand what it does without technical knowledge.
3. Select a profession.
4. See profession-specific content.
5. Choose Guided or Custom/Technical.
6. Complete the relevant questions.
7. Provide custom specifications.
8. Submit the diagnostic.
9. See a useful AI-generated result.
10. Receive/preview a branded PDF.
11. Demonstrate the email output path.
12. Demonstrate the ClickUp output path.
13. See that different professions produce different questions/recommendations.
14. See that the system distinguishes standard needs, research-derived pain points, and client-stated problems.
15. See that website recommendations are research-inspired rather than direct clones.

---

# 28. IMPLEMENTATION ORDER

Claude Code should implement in this order unless repository constraints justify another sequence:

### Phase A — Audit

Inspect existing code and map requirements.

### Phase B — Architecture

Identify reusable components/services/data structures.

### Phase C — Profession engine

Implement scalable profession configuration.

### Phase D — Adaptive intake

Implement Guided + Custom/Technical modes.

### Phase E — Diagnostic engine

Implement the three-layer analysis.

### Phase F — Research/reference layer

Use seeded demo data first.

### Phase G — Website recommendation layer

Generate research-inspired recommendations where relevant.

### Phase H — Webhook/API

Connect structured submission to processing.

### Phase I — Report

Generate branded PDF.

### Phase J — Integrations

Email + ClickUp.

### Phase K — QA

Run full demo journey and tests.

### Phase L — Documentation

Update README, environment documentation, setup instructions, and architecture notes.

---

# 29. CHANGE CONTROL

Before modifying an existing file:

- understand its role;
- identify dependencies;
- preserve public interfaces unless change is necessary;
- avoid duplicate implementations;
- avoid dead code;
- avoid temporary hacks that become permanent architecture.

After each major phase:

1. run relevant tests;
2. inspect the diff;
3. verify existing functionality;
4. document new dependencies;
5. continue only when the phase is stable.

---

# 30. REQUIRED FINAL RESPONSE FROM CLAUDE CODE

At completion, Claude Code must report:

### Implemented

List exactly what changed.

### Files changed

List files created/modified/deleted.

### Dependencies

List packages/services added.

### Environment variables

List every new variable and why it is needed.

### External setup required

List APIs, OAuth, webhook URLs, MCPs, accounts, or credentials still needed.

### Tests

List tests run and their results.

### Known limitations

Be honest.

### Demo instructions

Give exact commands and exact browser URL(s) needed to demonstrate the finished workflow.

### Recommended next step

Give only the most important next step, not a large backlog.

---

# 31. DEFINITION OF DONE

Do not declare the project complete merely because the code compiles.

The upgrade is done only when:

- the existing application still works;
- the new adaptive workflow works;
- all demo professions work;
- both user modes work;
- the diagnostic combines the three need layers;
- custom specifications work;
- the webhook path works;
- the PDF is generated;
- email integration is functional or explicitly marked pending credentials;
- ClickUp integration is functional or explicitly marked pending credentials;
- the demo can run without live external research when `DEMO_MODE=true`;
- tests pass;
- documentation is updated;
- no secrets are committed.

---

## FINAL PRINCIPLE

**LordGen AI should feel simple on the outside and intelligent on the inside.**

The client should not need to understand AI, APIs, CRMs, ERPs, webhooks, MCPs, databases, or software architecture.

The system should do the technical translation behind the scenes while still allowing technically sophisticated users to take control through the Custom/Technical path.
