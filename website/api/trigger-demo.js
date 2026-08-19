// Server-side relay for the competition live-demo trigger (P0).
//
// The browser never sees an n8n webhook URL or auth token -- it calls this
// same-origin endpoint, and this function attaches the header-auth token
// server-side before forwarding. Real URL/token values live only in this
// Vercel project's Environment Variables (set by the developer in the
// dashboard, never committed) -- see .env.example for the variable names
// and docs/architecture.md's "Pending: Competition Live-Demo Trigger (P0)"
// section for the full design.
//
// Only the plumbing preset has a live n8n workflow behind these webhooks;
// the other two presets never call this endpoint (see website/app.js).

const TARGETS = {
  diagnostic: {
    urlEnv: 'N8N_DIAGNOSTIC_WEBHOOK_URL',
    tokenEnv: 'N8N_DIAGNOSTIC_WEBHOOK_TOKEN'
  },
  approve: {
    urlEnv: 'N8N_APPROVE_WEBHOOK_URL',
    tokenEnv: 'N8N_APPROVE_WEBHOOK_TOKEN'
  }
};

// Must match the header name configured in each n8n workflow's Header Auth
// credential (see docs/architecture.md). The token value itself is separate
// per target (diagnostic vs approve), read from its own env var above.
const HEADER_NAME = 'X-LordGen-Demo-Token';

const UPSTREAM_TIMEOUT_MS = 15000;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const target = body.target;

  if (target !== 'diagnostic' && target !== 'approve') {
    res.status(400).json({ error: 'target must be "diagnostic" or "approve"' });
    return;
  }

  const config = TARGETS[target];
  const webhookUrl = process.env[config.urlEnv];
  const webhookToken = process.env[config.tokenEnv];

  if (!webhookUrl || !webhookToken) {
    res.status(503).json({
      error: 'Live diagnostic trigger is not configured on this deployment.',
      demo: true
    });
    return;
  }

  const payload = {};
  Object.keys(body).forEach(function forwardField(key) {
    if (key !== 'target') payload[key] = body[key];
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(function abortUpstream() {
    controller.abort();
  }, UPSTREAM_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [HEADER_NAME]: webhookToken
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = upstreamResponse.headers.get('content-type') || '';
    const upstreamBody = contentType.indexOf('application/json') !== -1
      ? await upstreamResponse.json()
      : await upstreamResponse.text();

    res.status(upstreamResponse.status).json(
      typeof upstreamBody === 'string' ? { error: upstreamBody } : upstreamBody
    );
  } catch (err) {
    clearTimeout(timeoutId);
    res.status(502).json({
      error: 'Could not reach the live diagnostic workflow. Please try again.',
      demo: true
    });
  }
};
