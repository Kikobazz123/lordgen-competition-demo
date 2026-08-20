# LORDGEN Competition Build — Skills, Tools, MCP & References

## 1. Purpose

This document is the technical reference for building the LordGen competition demo and the underlying automation system with Claude Code.

The goal is not to connect every possible tool.

The goal is to give Claude Code the right capabilities to:

**Research → Analyze → Score → Propose → Plan → Build → Test → Hand off**

Use the minimum reliable toolset for the competition, then add optional integrations only when they materially improve the demo.

---

# 2. Recommended Architecture

## AI / Development Layer

### Claude Code
Primary coding agent and orchestration environment.

Use it to:
- Understand the repository
- Plan architecture
- Write and modify code
- Create reusable Skills
- Connect to MCP servers
- Run tests
- Debug
- Inspect workflow definitions
- Iterate on the build

Claude Code supports built-in coding tools plus MCP, Skills, subagents, hooks, and plugins.

Reference:
https://code.claude.com/docs/en/features-overview

---

# 3. Required Claude Code Skills

Create these under:

`.claude/skills/`

Each skill should have its own directory containing `SKILL.md`.

Claude Code Skills are reusable instructions/workflows that can be invoked directly or loaded automatically when relevant.

Reference:
https://code.claude.com/docs/en/skills

## Skill 01 — Business Research

Suggested name:

`business-research`

Purpose:
- Research a target business
- Extract useful business facts
- Identify operational problems
- Separate evidence from assumptions
- Produce structured research

Expected output:
- Company overview
- Business model
- Processes
- Pain points
- Evidence
- Automation opportunities
- Confidence level

---

## Skill 02 — Opportunity Scoring

Suggested name:

`opportunity-score`

Purpose:
Turn research into a ranked AI/automation opportunity.

Score:
- Business impact
- Automation potential
- Feasibility
- Implementation complexity
- Time savings
- Revenue/customer impact
- Data availability
- Risk

Expected output:
- Overall score
- Score breakdown
- Top opportunity
- Reasoning
- Risks
- Recommendation

---

## Skill 03 — Proposal Generator

Suggested name:

`proposal-generator`

Purpose:
Turn the selected opportunity into a concise business proposal.

Expected output:
- Problem
- Current-state impact
- Proposed AI solution
- Workflow concept
- Expected benefits
- Implementation approach
- Next step

---

## Skill 04 — Execution Planner

Suggested name:

`execution-plan`

Purpose:
Populate the predefined LordGen execution-plan template.

Expected output:
- Objective
- Trigger
- Inputs
- AI processing
- Workflow steps
- Integrations
- Data structures
- Human approval points
- Outputs
- Error handling
- Testing plan
- Deployment plan
- Success criteria

Important:
The AI should populate a controlled template rather than inventing a completely different project structure every time.

---

## Skill 05 — Automation Builder

Suggested name:

`automation-builder`

Purpose:
Translate an approved execution plan into a starter automation.

Responsibilities:
- Inspect the execution plan
- Identify required services
- Create workflow structure
- Generate configuration
- Generate code where appropriate
- Connect workflow steps
- Add validation
- Add logging
- Add error handling
- Preserve human approval gates

---

## Skill 06 — Workflow QA

Suggested name:

`workflow-qa`

Purpose:
Test the generated automation.

Check:
- Missing credentials/configuration
- Invalid inputs
- Failed API calls
- Empty research results
- Bad AI output
- Duplicate task creation
- Email safety
- Retry behavior
- Logging
- Error handling
- Idempotency

---

## Skill 07 — Competition Demo

Suggested name:

`competition-demo`

Purpose:
Prepare the build for the judges.

It should:
- Verify the demo path
- Verify the selected business
- Verify all outputs
- Verify the workflow
- Verify the execution plan
- Verify the GitHub repository
- Verify that no secrets are exposed
- Prepare a clean demonstration sequence

---

# 4. MCP — What It Is Doing

MCP (Model Context Protocol) allows Claude Code to connect to external systems and use their tools/data rather than relying on copied information.

Official MCP documentation:
https://modelcontextprotocol.io/

Claude Code MCP documentation:
https://code.claude.com/docs/en/mcp

For the competition, MCP is especially valuable because it demonstrates that the AI is not merely generating text — it can interact with actual systems.

---

# 5. Recommended MCP Servers

## A. n8n MCP — HIGH PRIORITY IF n8n IS THE DEMO AUTOMATION ENGINE

n8n has a built-in MCP server that can allow an AI client such as Claude Code to create, edit, and run workflows.

This is potentially one of the strongest pieces of the competition demo.

Use it to demonstrate:

**Execution Plan → AI-generated n8n Workflow**

Official n8n MCP documentation:
https://docs.n8n.io/build/ways-of-building-workflows/connect-to-n8n-mcp-server

n8n's current documentation describes creating and editing workflows through MCP and iterating by running and testing them.

Important:
Verify the exact n8n version and MCP permissions before the competition.

---

## B. Trigger.dev MCP — HIGH PRIORITY IF Trigger.dev IS USED

Trigger.dev provides an official MCP server for AI-assisted development.

It can allow Claude Code to:
- Search Trigger.dev documentation
- Initialize projects
- Create/manage tasks
- Trigger tasks
- Inspect runs
- Debug runs
- Deploy
- Monitor deployments

Official documentation:
https://trigger.dev/docs/mcp-introduction

Installation:
`npx trigger.dev@latest install-mcp --client claude-code`

Trigger.dev also supports a read-only mode and development-only/project-scoped configuration, which can be useful while building safely.

---

## C. ClickUp MCP — HIGH PRIORITY

Use ClickUp as the execution-management layer.

The official ClickUp MCP server allows AI assistants to interact with ClickUp tasks, Lists, Spaces, Docs and related work data.

Use it to demonstrate:

**Execution Plan → Implementation Tasks**

Examples:
- Create build task
- Assign task
- Set priority
- Set due date
- Add implementation notes
- Create follow-up tasks

Official ClickUp MCP:
https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server

Official MCP endpoint:
https://mcp.clickup.com/mcp

Claude Code setup:
`claude mcp add --transport http clickup https://mcp.clickup.com/mcp`

Authentication is handled through the ClickUp authorization flow.

---

## D. GitHub MCP — RECOMMENDED

Use GitHub as the code/version-control layer.

Purpose:
- Inspect repository
- Create/update files
- Review issues/PRs where appropriate
- Provide repository context
- Help demonstrate that the generated build is real code

Official GitHub MCP documentation:
https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp-in-your-ide/set-up-the-github-mcp-server

Do not expose secrets or private credentials in the repository.

---

## E. Gmail API — RECOMMENDED FOR THE OUTREACH STAGE

Gmail does not need to be an MCP server for the system to use it.

The Gmail API can:
- Create drafts
- Send messages
- Manage threads
- Read authorized mailbox data

Official Gmail API:
https://developers.google.com/workspace/gmail/api/guides

Sending:
https://developers.google.com/workspace/gmail/api/guides/sending

For the competition, use:

**AI-generated email → Draft → Human approval → Send**

Do not automatically send consequential outreach during the live demo without an explicit approval gate.

---

# 6. Research Tools

The research layer should use reliable sources and preserve source information.

Recommended capabilities:
- Web search
- Website retrieval
- Structured extraction
- Source URLs
- Evidence snippets
- Date/source metadata where appropriate

The research skill should never present assumptions as facts.

Recommended output fields:

```text
source
source_url
fact
evidence
confidence
business_implication
```

---

# 7. Data / Storage

For the competition demo, keep storage simple.

Possible options:

### SQLite
Good for:
- Local demo
- Small structured datasets
- Fast setup
- Reproducibility

### PostgreSQL
Good for:
- Production-style architecture
- Structured application data
- Larger future system

### n8n Data Tables
Useful when n8n is the central workflow platform.

Do not introduce a database merely to make the architecture look complicated.

---

# 8. Core Technical Skills Needed

The builder should be comfortable with:

## Claude Code
- CLAUDE.md
- Skills
- MCP
- Subagents
- Hooks
- Permissions
- Git workflow

## Programming
Recommended:
- TypeScript
- Node.js
- JSON
- REST APIs
- Webhooks
- Environment variables
- Error handling
- Async workflows

## Automation
- n8n workflow design
- Trigger.dev tasks
- Triggers
- Webhooks
- Retries
- Branching
- Human approval gates
- Logging

## AI Engineering
- Prompt design
- Structured outputs
- Tool calling
- Context management
- Evaluation
- Hallucination control
- Source grounding
- Confidence scoring

## API Integration
- OAuth
- API keys
- REST
- JSON
- Rate limits
- Pagination
- Retries
- Webhook security

## DevOps
- Git
- GitHub
- Environment variables
- `.env`
- `.gitignore`
- Deployment
- Logs
- Testing

---

# 9. Recommended Repository Structure

```text
lordgen/
│
├── CLAUDE.md
├── README.md
├── .env.example
├── .gitignore
├── .mcp.json
│
├── .claude/
│   └── skills/
│       ├── business-research/
│       │   ├── SKILL.md
│       │   ├── examples.md
│       │   └── reference.md
│       │
│       ├── opportunity-score/
│       │   └── SKILL.md
│       │
│       ├── proposal-generator/
│       │   └── SKILL.md
│       │
│       ├── execution-plan/
│       │   ├── SKILL.md
│       │   └── template.md
│       │
│       ├── automation-builder/
│       │   └── SKILL.md
│       │
│       ├── workflow-qa/
│       │   └── SKILL.md
│       │
│       └── competition-demo/
│           └── SKILL.md
│
├── docs/
│   ├── execution-plan-template.md
│   ├── architecture.md
│   ├── workflow-diagram.md
│   └── demo-script.md
│
├── prompts/
│   ├── 01-architect.md
│   ├── 02-research.md
│   ├── 03-score.md
│   ├── 04-proposal.md
│   ├── 05-execution-plan.md
│   ├── 06-build.md
│   ├── 07-test.md
│   └── 08-demo.md
│
├── workflows/
│   └── competition-demo.json
│
├── src/
│   ├── research/
│   ├── scoring/
│   ├── proposal/
│   ├── execution/
│   └── automation/
│
└── tests/
```

---

# 10. MCP Configuration Strategy

Do not connect every MCP server immediately.

Start with:

1. n8n MCP
2. ClickUp MCP
3. Trigger.dev MCP — if Trigger.dev is part of the build
4. GitHub MCP

Then add other integrations only when needed.

The reason is simple:

**Every additional tool creates another potential failure point during the competition.**

The winning demo should be sophisticated underneath but extremely controlled on stage.

---

# 11. Security Rules

Never place these in GitHub:

- API keys
- OAuth client secrets
- Access tokens
- Refresh tokens
- `.env`
- Private credentials

Use:

```text
.env
.env.local
.env.example
```

Commit only `.env.example`.

Use least-privilege permissions wherever possible.

Keep human approval before:
- Sending external email
- Deploying production changes
- Creating consequential external records
- Deleting data

MCP's own specification recommends human control over tool invocations for safety-sensitive actions.

Reference:
https://modelcontextprotocol.io/specification/2025-06-18/server/tools

---

# 12. The Competition "Wow" Architecture

The strongest visual story is:

```text
                 ┌──────────────────┐
                 │   TARGET BUSINESS │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │   AI RESEARCH    │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │ OPPORTUNITY SCORE│
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │    PROPOSAL      │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │ EXECUTION PLAN   │
                 └────────┬─────────┘
                          ↓
              ┌────────────────────────┐
              │ AI AUTOMATION BUILDER  │
              └───────────┬────────────┘
                          ↓
                 ┌──────────────────┐
                 │ STARTER WORKFLOW │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │ HUMAN APPROVAL   │
                 └──────┬─────┬─────┘
                        ↓       ↓
                  ┌────────┐ ┌────────┐
                  │ClickUp │ │ Gmail  │
                  │ Tasks  │ │ Draft  │
                  └────────┘ └────────┘
```

The key competitive idea is:

**The AI doesn't merely recommend an automation. It produces the structured plan that a developer can use to build the automation, and it can generate the starting workflow itself.**

---

# 13. Reference Links

## Claude Code

Claude Code overview/extensions:
https://code.claude.com/docs/en/features-overview

Claude Code Skills:
https://code.claude.com/docs/en/skills

Claude Code MCP:
https://code.claude.com/docs/en/mcp

Claude Code tools:
https://code.claude.com/docs/en/tools-reference

## Model Context Protocol

MCP:
https://modelcontextprotocol.io/

MCP tools specification:
https://modelcontextprotocol.io/specification/2025-06-18/server/tools

## n8n

n8n MCP:
https://docs.n8n.io/build/ways-of-building-workflows/connect-to-n8n-mcp-server

## Trigger.dev

Trigger.dev MCP:
https://trigger.dev/docs/mcp-introduction

## ClickUp

ClickUp MCP:
https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server

ClickUp MCP tools:
https://developer.clickup.com/docs/mcp-tools

## GitHub

GitHub MCP:
https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp-in-your-ide/set-up-the-github-mcp-server

## Gmail

Gmail API:
https://developers.google.com/workspace/gmail/api/guides

Gmail sending:
https://developers.google.com/workspace/gmail/api/guides/sending

---

# 14. Build Order

Do not start by connecting everything.

Use this order:

### Phase 1 — Foundation
- Create repository
- Create CLAUDE.md
- Create Skills
- Create execution-plan template
- Create `.env.example`
- Define architecture

### Phase 2 — Research
- Build research skill
- Test research output
- Add source/evidence handling

### Phase 3 — Intelligence
- Build opportunity scoring
- Build proposal generation

### Phase 4 — Execution
- Build execution-plan generator
- Validate against template

### Phase 5 — Automation
- Connect n8n or Trigger.dev
- Generate starter workflow
- Test workflow

### Phase 6 — Operations
- Connect ClickUp
- Generate implementation tasks
- Add Gmail draft

### Phase 7 — QA
- Test every stage
- Add failure handling
- Add approval gates

### Phase 8 — Competition Polish
- Freeze the demo business
- Freeze the demo path
- Prepare workflow diagram
- Prepare GitHub repo
- Rehearse live modification
- Rehearse recovery if a live service fails

---

# 15. Important Build Rule

Tell Claude Code:

> Do not build the entire system in one uncontrolled pass.

Instead:

1. Inspect
2. Plan
3. Build one layer
4. Test it
5. Commit
6. Continue
7. Integrate
8. Test the complete path

This gives us checkpoints and makes it much easier to recover during a seven-day competition build.

---

# 16. Definition of Done

The competition build is ready when:

- [ ] One business can be researched end-to-end
- [ ] Research contains evidence
- [ ] Opportunity is scored
- [ ] Proposal is generated
- [ ] Execution plan is generated from the template
- [ ] Starter automation is generated
- [ ] Automation executes successfully
- [ ] Human approval is visible
- [ ] ClickUp tasks can be generated
- [ ] Gmail draft can be generated
- [ ] Workflow can be modified live
- [ ] Tests pass
- [ ] GitHub repo is clean
- [ ] No credentials are committed
- [ ] Demo can be completed without improvising the core path

---

# 17. Final Architecture Principle

The competition should demonstrate three things simultaneously:

### Intelligence
LordGen understands the business problem.

### Agency
LordGen can use tools and systems to turn the decision into work.

### Engineering
LordGen can turn the plan into a real automation that a developer can inspect, test, modify, and deploy.

That combination is much stronger than simply demonstrating an AI research assistant.
