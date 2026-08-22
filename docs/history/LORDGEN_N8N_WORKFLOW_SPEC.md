# LordGen n8n LIVE WORKFLOW

CLIENT/JUDGE
-> Vercel intake
-> n8n research
-> three-category diagnostic
-> return results
-> user selection
-> approval
-> builder dispatch
-> build/validate
-> developer review if needed
-> README/handover
-> email
-> WhatsApp optional

Inspect existing workflows first. Reuse useful nodes and credentials.

Research must return real provider output and safe errors. Partial failure must be visible.
Approval must be idempotent.
Builder must not run twice for the same approval.
Simple builds may auto-complete; complex builds become DEVELOPER_REVIEW.
Handover must never contain secret values.

Keep request IDs and non-secret execution status through every stage.
Do not change existing n8n credentials simply because n8n masks their stored values.
