// Server-side relay for a client's own connected Tally form.
//
// The client pastes a public /connect/<token> URL (rewritten to this
// endpoint, see vercel.json) into their own Tally account's webhook
// settings -- Tally calls this endpoint directly, on the client's own
// account, with no LordGen credential involved on their side at all. This
// function reads the connection token from the URL and Tally's own POST
// body, then forwards both to n8n with the shared header-auth token
// attached server-side -- same relay pattern as trigger-demo.js/decision.js/
// connect.js, the 7th instance of it in this repo, not a new one.
//
// See the "LordGen Demo -- Tier A Intake" n8n workflow for what actually
// validates the token and processes the submission; this file has zero
// business logic of its own, by design, matching every other relay here.

const N8N_URL_ENV = 'N8N_INTAKE_WEBHOOK_URL';
const N8N_TOKEN_ENV = 'N8N_INTAKE_WEBHOOK_TOKEN';
const HEADER_NAME = 'X-LordGen-Demo-Token';
const UPSTREAM_TIMEOUT_MS = 20000;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const connectionToken = req.query && req.query.token;
  if (!connectionToken) {
    res.status(400).json({ error: 'Missing connection token in the request URL.' });
    return;
  }

  const webhookUrl = process.env[N8N_URL_ENV];
  const webhookToken = process.env[N8N_TOKEN_ENV];
  if (!webhookUrl || !webhookToken) {
    res.status(503).json({ error: 'This connection endpoint is not configured on this deployment.' });
    return;
  }

  const tally = req.body && typeof req.body === 'object' ? req.body : {};

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
      body: JSON.stringify({ connectionToken: connectionToken, tally: tally }),
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
    res.status(502).json({ error: 'Could not reach the connection workflow.' });
  }
};
