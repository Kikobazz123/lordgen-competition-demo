# CLAUDE CODE — LORDGEN AI DEMO UPGRADE EXECUTION INSTRUCTIONS

You are upgrading an existing LordGen AI repository.

## 1. READ BEFORE TOUCHING CODE

First read:

- `CLAUDE.md`
- `LORDGEN_UPGRADE_SPEC.md`
- any existing `LORDGEN_*` architecture/specification files
- README and project documentation

Then inspect the entire repository structure.

Do NOT start coding immediately.

---

## 2. FIRST ACTION: AUDIT

Create a concise implementation audit containing:

1. Current stack.
2. Current application entry points.
3. Existing pages/routes.
4. Existing components.
5. Existing backend/API routes.
6. Existing AI/workflow logic.
7. Existing data models.
8. Existing webhook functionality.
9. Existing PDF functionality.
10. Existing email functionality.
11. Existing ClickUp functionality.
12. Existing environment variables.
13. Existing tests.
14. What is already complete.
15. What must be changed.
16. What can be reused.
17. What is missing.

Then map the audit to `LORDGEN_UPGRADE_SPEC.md`.

---

## 3. DO NOT REBUILD THE PROJECT

This is an upgrade.

Never:

- delete working features without justification;
- replace the framework because you prefer another one;
- replace the database unnecessarily;
- create duplicate services;
- create a second competing architecture;
- rewrite the whole frontend;
- rewrite the whole backend;
- install unnecessary dependencies.

If you believe a major architectural replacement is necessary, STOP and explain:

- why;
- what breaks if we don't;
- what alternatives were considered;
- migration impact.

Wait for approval before performing a destructive architectural change.

---

## 4. IMPLEMENTATION STRATEGY

Work in controlled phases.

### Phase 1 — Audit

Do not modify application code.

### Phase 2 — Profession configuration

Create/reuse a scalable configuration model.

### Phase 3 — Adaptive intake

Implement:

- profession-specific questions;
- Guided/Recommended mode;
- Custom/Technical mode;
- conditional questions;
- custom fields.

### Phase 4 — Three-layer diagnostic

Implement:

- standard business needs;
- research/review pain points;
- client-stated problems.

Keep their provenance distinct.

### Phase 5 — Recommendation engine

Produce recommendations based on all three layers.

### Phase 6 — Website research/reference layer

For website-related requests, use researched sites as inspiration/reference only.

Never directly copy proprietary content, assets, branding, or source code.

### Phase 7 — Webhook

Connect the structured intake to the existing processing workflow.

### Phase 8 — PDF

Generate the branded LordGen AI report.

### Phase 9 — Email

Send the report to the supplied email when configured.

### Phase 10 — ClickUp

Create/update the appropriate ClickUp record when configured.

### Phase 11 — QA

Run automated and manual tests.

### Phase 12 — Documentation

Update setup and demo instructions.

---

## 5. ASK FOR CREDENTIALS — DO NOT GUESS

If implementation reaches a dependency requiring credentials, do not invent anything.

Use this exact structure:

```text
DEPENDENCY REQUIRED

Provider:
Purpose:
Required for:
Credential type:
Environment variable:
OAuth required:
Webhook URL required:
Where to obtain it:
Can DEMO_MODE run without it:
Security notes:
```

Continue implementing everything that does not depend on that credential.

Do not block the entire project unnecessarily.

---

## 6. MCP POLICY

MCPs are development aids, not automatically production dependencies.

Before installing any MCP:

1. Determine whether the existing task can be completed without it.
2. Prefer official/maintained sources.
3. Check the current documentation.
4. Explain what the MCP provides.
5. Explain whether an API key is required.
6. Keep MCP credentials out of source control.

Preferred candidates only when useful:

- Playwright for browser testing/automation.
- Context7 for current library/API documentation.
- Official ClickUp MCP when useful for ClickUp development/testing.

Do not install random GitHub MCP servers just because they appear in search results.

---

## 7. CONTEXT7 RULE

When implementing or configuring a library/API where version-specific behavior matters:

- consult current official documentation;
- use Context7 if available;
- verify the actual installed package version;
- do not blindly copy examples for another version.

If Context7 requires a key, ask for it only when necessary.

---

## 8. PLAYWRIGHT RULE

Use Playwright for end-to-end validation where appropriate.

Test the actual user journey:

```text
Landing
→ Profession
→ Mode
→ Questions
→ Custom specifications
→ Submit
→ Diagnostic
→ PDF
→ Email/ClickUp integration status
```

Do not consider a build complete because unit tests alone pass.

---

## 9. DEMO MODE

The judge demo must be reliable.

Support:

```text
DEMO_MODE=true
```

When demo mode is active:

- use deterministic seeded profession data;
- use seeded research examples;
- do not depend on live review scraping;
- do not require production credentials for core demonstration;
- simulate optional integrations only when explicitly labeled as simulated;
- never present simulated reviews as genuine reviews.

---

## 10. UI RULES

The interface must be:

- simple;
- polished;
- responsive;
- accessible;
- professional;
- non-technical by default.

Avoid technical wording in Guided mode.

Technical wording is acceptable in Custom/Technical mode.

The system should translate:

```text
CLIENT LANGUAGE
        ↓
BUSINESS REQUIREMENTS
        ↓
TECHNICAL REQUIREMENTS
        ↓
IMPLEMENTATION RECOMMENDATION
```

---

## 11. FORM RULES

Do not create one huge form.

Questions must be contextual.

Use:

```text
Profession
→ Business context
→ Need/problem
→ Relevant follow-up
→ Guided OR Technical
→ Final specifications
```

Every important configurable area should support:

- Recommended;
- Custom/Other.

---

## 12. DATA PROVENANCE

Never merge different information sources without labeling them internally.

Maintain clear distinctions between:

```text
STANDARD_NEEDS
RESEARCH_FINDINGS
CLIENT_STATED_PROBLEMS
AI_INFERRED_NEEDS
USER_CUSTOM_SPECIFICATIONS
```

AI-inferred information must not be presented as if the client explicitly stated it.

---

## 13. WEBSITE RESEARCH RULE

If website construction is recommended:

1. Identify relevant high-quality reference sites.
2. Analyze patterns.
3. Extract design/conversion insights.
4. Generate an original design direction.
5. Adapt it to the selected business.

Do not directly clone:

- source code;
- copyrighted text;
- proprietary graphics;
- logos;
- unique branding;
- protected assets.

---

## 14. PRIVACY

Treat submitted email conversations and business information as potentially sensitive.

Do not:

- log full private conversations unnecessarily;
- expose them in public UI;
- place secrets in reports;
- include private customer data in demo output;
- commit sample credentials.

Use sanitized demo conversations.

---

## 15. ENVIRONMENT VARIABLES

Maintain `.env.example`.

Only add variables actually used.

Potential examples:

```text
AI_API_KEY=
EMAIL_PROVIDER_API_KEY=
CLICKUP_API_KEY=
CLICKUP_LIST_ID=
CLICKUP_SPACE_ID=
CONTEXT7_API_KEY=
WEBHOOK_URL=
```

Do not add placeholders for services that are not implemented.

Never commit `.env`.

---

## 16. TESTING GATE

Before declaring a phase complete:

- run relevant tests;
- verify the application starts;
- verify the changed user flow;
- inspect errors/logs;
- inspect the git diff;
- verify no secrets were introduced.

If a test fails, fix it before moving on unless the failure is clearly unrelated.

---

## 17. STOP CONDITIONS

STOP and ask for user input if:

- a destructive migration is required;
- an existing feature must be removed;
- a paid service is mandatory for the demo;
- a credential is required and unavailable;
- a business requirement conflicts with existing architecture;
- a legal/compliance-sensitive scraping requirement cannot be safely implemented;
- the intended behavior is genuinely ambiguous.

Do not silently make major assumptions.

---

## 18. FINAL VALIDATION

At the end, execute the complete demo path.

Verify:

- multiple professions;
- profession-specific questions;
- Guided mode;
- Custom/Technical mode;
- custom specifications;
- three-layer diagnostic;
- recommendations;
- webhook;
- PDF;
- email;
- ClickUp;
- missing-credential behavior;
- DEMO_MODE;
- responsive layout.

---

## 19. FINAL REPORT FORMAT

Your final response MUST contain:

### IMPLEMENTED
Exact features completed.

### FILES CHANGED
Created/modified/deleted files.

### DEPENDENCIES
Packages/services added.

### CREDENTIALS REQUIRED
Every required credential, API key, OAuth connection, or webhook.

### MCPs
MCPs installed or recommended, with purpose.

### TESTS
Tests run and results.

### DEMO
Exact startup command and URL.

### LIMITATIONS
Anything still incomplete.

### NEXT ACTION
One most important action for the user.

---

## 20. FIRST COMMAND

After reading the files, do NOT immediately modify code.

First respond with:

> "AUDIT COMPLETE — I have mapped the existing repository against LORDGEN_UPGRADE_SPEC.md. I will now present the implementation plan and dependency/credential checklist before making changes."

Then provide:

1. current architecture;
2. requirements mapping;
3. files likely to change;
4. new files likely required;
5. dependencies;
6. credentials;
7. MCP requirements;
8. implementation phases;
9. risks;
10. test plan.

Only after that should implementation begin.
