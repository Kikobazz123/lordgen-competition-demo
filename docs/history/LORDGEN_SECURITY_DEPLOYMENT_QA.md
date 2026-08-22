# SECURITY + DEPLOYMENT + QA

Never expose API keys, n8n tokens or private environment variables. Never put secrets in client-side code or NEXT_PUBLIC_ variables. Sanitize external research before rendering.

Verify Vercel production variables, server routes, deployment build and webhook configuration.
Verify n8n production webhook URLs, credential bindings, active workflows, retries, timeouts and error handling.

Controlled end-to-end test:
1. Enter a real searchable test business.
2. Confirm research actually runs.
3. Confirm all three categories return.
4. Select one.
5. Approve.
6. Confirm builder fires once.
7. Confirm build status.
8. Confirm README generation.
9. Confirm delivery.
10. Confirm no secret appears in browser, logs or handover.

Also test provider failure, partial failure, retry, duplicate clicks, refresh, mobile and accessibility.
Do not call the system production-ready until the complete chain succeeds on the deployed system.
