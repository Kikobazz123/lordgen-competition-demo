# Submission runbook

Everything needed to submit, in the order to do it. Verified 2026-10-31.

**Seven of the eight deliverables need nothing from you.** One needs an export, and there
are three things to do before you demo live. Budget about 40 minutes, most of it the
dry run.

---

## Part 1 — Ready now, no action

Attach or link these as they are. `docs/DELIVERABLES.md` has the full index.

| # | Deliverable | Where it is |
|---|---|---|
| 1 | Working demo automation | `workflows/live-diagnostic.json`, `live-issue-proposal.json`, `live-approve.json`, `live-approval-decision.json`, `live-handover.json` — running on n8n Cloud |
| 2 | Execution-plan template | `docs/execution-plan-template.md` |
| 3 | Completed execution plan | `execution-plan.md` (repo root) |
| 4 | Starter / generated workflow | `workflows/competition-demo.json` (n8n `055TNXGtfItIgqf1`) |
| 5 | GitHub repository | `github.com/Kikobazz123/lordgen-competition-demo` — pushed, `master` current |
| 6 | Workflow diagram | `docs/workflow-diagram.png` (landscape) · `docs/workflow-diagram-detailed.png` (with the security and idempotency notes) |
| 8 | Demo script | `docs/demo-script.md` |

The live site is deployed and serving the current build — confirmed: `fx.css`,
`gl-runtime.js` and the icon sprite are all live, and `vendor/three.min.js` is no longer
in the page's script list, which is the point of the performance change.

---

## Part 2 — The one deliverable that needs an export

### Step 1 — Export the deck (5 min)

The deck is at **https://claude.ai/artifact/Eh863vcqKMARMAnRBWbroH** and it is **private**.
Nobody else can open that link, so do not submit the link on its own.

1. Open it.
2. **Share ▸ Export**.
3. Download **PDF** (safest — renders identically everywhere) and **PPTX** if the entry
   form wants an editable file.
4. Save into the repo as `docs/LordGen-deck.pdf`, commit, push. That way the deck ships
   with deliverable #5 and cannot go missing.

If you would rather submit a link, use **Share** to give access first, then test the link
in a private browsing window. A link you cannot open signed-out is a link the judges
cannot open either.

---

## Part 3 — Before you demo live

### Step 2 — Delete the QA test rows (5 min, must be manual)

Five rows tagged `QA-TEST-*` are sitting in the live n8n **"LordGen Estimate Summary Log"**
Data Table. If a judge looks at the log during the demo, those are the first thing they
see.

No MCP tool can delete them — it needs the n8n UI:

1. n8n Cloud ▸ **Data Tables** ▸ *LordGen Estimate Summary Log*.
2. Filter or sort for rows tagged `QA-TEST-`.
3. Delete all five.
4. Confirm the table is otherwise intact — do not clear the whole table.

### Step 3 — One full dry run on the live chain (20 min)

Run it **once**, end to end, on the real deployment. Not five times — these are real paid
AI calls and a real inbox.

1. Open **https://lordgen-ai-demo.vercel.app**
2. Category **Eatery / Restaurant**, a real business name, an email you can open.
3. **Run Diagnostic** → wait for findings. The wait is normal; it is doing live research.
4. Pick an opportunity → fill the connection details → **Send Me a Proposal**.
5. **Confirm the email actually arrives.** This is the step most likely to fail quietly.
6. **Approve**, and confirm the chain continues to the build/handover stage.
7. Switch category once and confirm the current-system label updates.

If the email does not arrive, that is a credential problem on the n8n side, not the site —
check the Gmail credential in the proposal workflow before anything else.

### Step 4 — Look at the site on a phone (5 min)

Open the live URL on your actual phone. At 390px there is no WebGL and no three.js
download by design, so what you should see is a clean static page — if the hero looks
broken rather than simply calmer, something regressed.

---

## Part 4 — During the demo

From `docs/LORDGEN_competition_demo.md`, the one thing to protect: **one complete chain,
not five shallow examples.**

Order that works:

1. Open on the finished site, not on a slide.
2. Deck slides 1–4 — the problem, what the engine is, the chain. Two minutes, no more.
3. **Run the live diagnostic.** Let the waiting happen; the waiting is the proof.
4. Stop on the approval gate and say why it exists. This is the argument.
5. Deck slide "What is real today" — state the limits yourself before anyone asks.
6. Close on the quote. Then stop talking.

**Have a second business name ready** in case the first returns thin research.

---

## If something goes wrong live

| Symptom | Cause | What to say / do |
|---|---|---|
| Diagnostic spins, then errors | n8n cold start or rate limit | Switch to the second business. Do not retry the same one twice in front of judges. |
| Email never arrives | Gmail credential on the proposal workflow | Skip to the approval step using the previous run; say the email is asynchronous. |
| Page looks plain, no 3D | Reduced-motion or a WebGL-less machine | This is intended. The static hero is a designed fallback, not a failure. |
| Site is slow to first paint | Cold Vercel function | Load the page once before you present. |

---

## What is deliberately not done

Say these plainly if asked, rather than letting a judge find them:

- **No paying clients, no revenue, no case studies, no testimonials.** Pre-launch. The
  deck's "What is real today" slide states this outright, which is the point.
- Credentials for a live client deployment are not connected.
- The starter workflow is generated and tested, not published to production.
- Phases 3–6 of the site's visual plan (the model-pipeline 3D scene, WebGL god-rays,
  diagnostic theatre) were not built. CSS covers the two that mattered; the rest is polish
  and was traded for finishing deliverables 6 and 7.
