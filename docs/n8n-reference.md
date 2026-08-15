# n8n MCP Reference

Source of truth for what `automation-builder` (Phase 6) can actually do once n8n's MCP server is connected. Tool names and descriptions below are taken directly from n8n's own documentation ([MCP server tools reference](https://docs.n8n.io/connect/connect-to-n8n-mcp-server/mcp-server-tools-reference), fetched 2026-08-14) — not guessed. **Reconfirm via `ToolSearch` once actually connected**, since exact availability can vary by n8n version/plan (`CLAUDE.md` §8: never assume an MCP tool exists).

Connection status: **not connected**. See root `README.md` / `.env.example` for setup steps.

## Tool catalog

### Workflow management
| Tool | What it does |
|---|---|
| `search_workflows` | Search existing workflows with filters, returns a preview of each |
| `get_workflow_details` | Full detail on one workflow, including trigger info |
| `execute_workflow` | Trigger a real execution, returns an execution ID immediately |
| `test_workflow` | Run using **pin data**, bypassing external services |
| `prepare_workflow_pin_data` | Generate sample-data schemas for nodes that need pin data |
| `publish_workflow` / `unpublish_workflow` | Activate/deactivate for production execution |
| `search_projects`, `search_folders`, `list_workflow_tags` | Organizational lookups |

### Execution management
| Tool | What it does |
|---|---|
| `get_workflow_execution` | Details for one execution by ID |
| `search_workflow_executions` | Search past executions with filters |

### Credential management
| Tool | What it does |
|---|---|
| `list_credentials` | List credentials the current user can access (read-only listing, not creation) |

### Workflow builder
| Tool | What it does |
|---|---|
| `get_workflow_sdk_reference` | n8n Workflow SDK docs — patterns and functions |
| `search_nodes` | Find nodes by service, trigger type, or utility function |
| `get_node_types` | TypeScript type definitions for nodes |
| `get_workflow_best_practices` | Best-practice guidance for a specific technique |
| `explore_node_resources` | Resolve real values behind a node's resource locator/dropdown |
| `validate_workflow` | Validate SDK code for syntax/structure errors |
| `validate_node_config` | Validate individual node configs against schemas |
| `create_workflow_from_code` | Create a workflow from validated SDK code |
| `update_workflow` | Targeted partial updates to an existing workflow |
| `archive_workflow` | Archive a workflow by ID |

### Agent management
Tools also exist for n8n's own AI-agent features (`create_agent`, `publish_agent`, `update_agent_integration`, etc.) — **not used by this project**. LordGen's agents are Claude Code Skills, not n8n-native agents; listed here only so this reference stays complete and nothing gets assumed or fabricated later.

## Productivity playbook (how to use this well, not just correctly)

1. **Search before building.** `search_workflows` first — don't recreate something that already exists in the instance.
2. **Look up before guessing.** `search_nodes` + `get_node_types` before writing SDK code by memory — node names/params drift across n8n versions.
3. **Pull best practices per technique, not once per project.** `get_workflow_best_practices` is scoped to a technique (e.g. "webhook trigger," "error handling") — call it for each pattern actually used, not just at the start.
4. **Validate twice: whole workflow, then each node.** `validate_workflow` catches structural issues; `validate_node_config` catches per-node config issues `validate_workflow` can miss. Both, every time, before `create_workflow_from_code`.
5. **Build unpublished, always.** A workflow created via `create_workflow_from_code` is not live until `publish_workflow` runs. Treat "created" and "published" as two separate, separately-approved steps — never collapse them.
6. **Test with pin data, not real execution.** `test_workflow` + `prepare_workflow_pin_data` is the only way to exercise a workflow without touching real external services (real customer emails, real ClickUp tasks, etc.). This is the mechanism, not a manual "just don't click run."
7. **`execute_workflow` and `publish_workflow` are the two genuinely consequential tools here.** Everything else in this catalog is safe to call freely during development. These two are gated behind explicit human approval every time, no exceptions — this is where `CLAUDE.md` §10 actually bites in n8n terms.
8. **Update, don't recreate, when iterating.** Once a workflow exists, use `update_workflow` for changes (this is also what makes the demo's "Live Build Moment" — one small live modification — clean to perform).

## Open items

- Exact `claude mcp add` invocation is instance-specific (n8n's own UI generates it) — not reproduced here, see root `README.md`.
- Whether n8n MCP tool names above match what actually gets exposed once connected in this project is unverified until connection happens.
