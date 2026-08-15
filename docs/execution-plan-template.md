# LORDGEN Execution Plan Template

This is the one predefined template every execution plan must use (`CLAUDE.md` §13). The `execution-plan` skill (Phase 4) populates this from research, opportunity score, and proposal — it does not invent a new structure per business.

---

## Objective

[What this automation is meant to achieve, in one or two sentences.]

## Problem

[The operational bottleneck or pain point this addresses, carried forward from the research and proposal stages.]

## Proposed Solution

[The AI/automation approach being proposed.]

## Trigger

[What starts the workflow — schedule, webhook, manual, form submission, etc.]

## Inputs

[What data/documents/context the workflow needs to run.]

## AI Processing

[Which AI steps happen, what each one is responsible for, and what model/skill performs it.]

## Workflow Steps

[Ordered list of the automation's steps, end to end.]

## Integrations

[External systems/tools/MCP servers this workflow touches.]

## Data Requirements

[Data sources, formats, and any data the workflow reads or writes.]

## Human Approval Points

[Every point where a human must review/approve before the workflow continues — required, not optional, per `CLAUDE.md` §10.]

## Outputs

[What the workflow produces, and where it ends up.]

## Error Handling

[How failures are detected and handled at each step — missing input, external API failure, malformed AI output, etc.]

## Testing

[How this workflow will be tested before it's trusted — see `CLAUDE.md` §15 for the required test categories.]

## Deployment

[How/where this starter automation would be deployed if taken further than the demo.]

## Success Criteria

[How we know this automation actually solved the problem.]
