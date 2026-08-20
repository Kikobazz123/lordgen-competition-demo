# LordGen AI — n8n / Vercel Integration Guardrails

## Purpose

Protect the LordGen website while the n8n/Vercel connection is being repaired.

This file is intentionally conservative.

## Critical Rule

DO NOT modify the n8n credential named:

`Header Auth account`

unless the user explicitly asks for an integration change.

That credential is currently connected to:
- LordGen Demo — Diagnostic
- LordGen Demo — Automation Builder

## Credential Context

The credential uses:
- Header name: `X-LordGen-Demo-Token`
- Value: secret and masked by n8n
- Allowed HTTP Request Domains: All

Never print the secret value.

## Important Secret Handling

The masked dots shown by n8n are not the actual token.

Never:
- copy the masked dots into Vercel
- put the token into frontend code
- put the token into Git
- send the secret in chat
- commit an .env file.

## Four-Part Integration Contract

Before changing anything, identify and verify these four values separately:

1. n8n webhook URL
2. authentication header name
3. authentication secret/token
4. Vercel server-side environment variable / request configuration.

Do not assume they are correct merely because the field exists.

## Frontend Rule

The browser must not directly expose a private n8n authentication secret.

Preferred architecture:

Browser
→ LordGen server-side API route / server action
→ n8n webhook with secret header
→ workflow
→ response
→ browser

If the current implementation differs, document the difference before changing it.

## Vercel Environment Variables

Secrets belong in Vercel Environment Variables.

Use server-only variables for private tokens.

Never use a `NEXT_PUBLIC_` variable for a secret.

After changing a production environment variable, remember that a new deployment may be required for the running deployment to receive it.

## Testing

Use a non-destructive diagnostic endpoint/workflow first.

Test:
1. expected request succeeds
2. missing token fails
3. incorrect token fails
4. server responds safely
5. client receives only intended data.

Never test with production customer data.

## Failure Reporting

When the connection fails, report:
- HTTP status
- response body if non-secret
- request path
- whether the request reached Vercel
- whether Vercel reached n8n
- whether n8n received the correct header name
- whether the workflow executed.

Do not expose the secret.

## Separation of Work

Website UX work and integration credential work are separate tasks.

A visual redesign must not modify integration secrets.

An integration fix must not trigger an unrelated homepage redesign.
