// Server-side landing endpoint for the developer's "Mark Connected" link,
// sent only in the internal developer-brief email (never seen by a client).
// A clicked email link can't carry a custom auth header, so this relay adds
// the n8n webhook's header server-side -- same reasoning and pattern as
// decision.js's GET channel for the client's Approve/Request-changes links.
//
// Confirms the developer has actually connected the client's real systems
// before the client's Handover Pack is allowed to send -- see the "LordGen
// Demo -- Mark Connected" n8n workflow, which is what this actually calls.

const N8N_URL_ENV = 'N8N_CONNECT_WEBHOOK_URL';
const N8N_TOKEN_ENV = 'N8N_CONNECT_WEBHOOK_TOKEN';
const HEADER_NAME = 'X-LordGen-Demo-Token';
const UPSTREAM_TIMEOUT_MS = 15000;

function renderStatusPage(title, message) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + ' — LordGen AI</title>' +
    '<style>body{background:#0A0A09;color:#E8E6E1;font-family:Georgia,serif;display:flex;' +
    'align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center;}' +
    '.card{max-width:480px;}h1{color:#F0E2BC;font-family:Helvetica,Arial,sans-serif;font-size:20px;margin-bottom:12px;}' +
    'p{color:#8C8A85;line-height:1.6;}a{color:#C9A24B;}</style></head>' +
    '<body><div class="card"><h1>' + title + '</h1><p>' + message + '</p></div></body></html>';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = req.query.token;
  if (!token) {
    res.status(400).send(renderStatusPage('Invalid link', 'This connection link is missing information or has been altered.'));
    return;
  }

  const webhookUrl = process.env[N8N_URL_ENV];
  const webhookToken = process.env[N8N_TOKEN_ENV];
  if (!webhookUrl || !webhookToken) {
    res.status(503).send(renderStatusPage('Not configured', 'The connection-confirmation flow is not configured on this deployment.'));
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(function abortUpstream() { controller.abort(); }, UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [HEADER_NAME]: webhookToken },
      body: JSON.stringify({ connectionToken: token }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const contentType = upstream.headers.get('content-type') || '';
    const body = contentType.indexOf('application/json') !== -1 ? await upstream.json() : await upstream.text();

    if (!upstream.ok) {
      res.status(upstream.status).send(renderStatusPage('Something went wrong', (body && body.error) || 'Please try again.'));
      return;
    }

    const outcome = body || {};
    res.status(200).send(renderStatusPage('Marked as connected', outcome.message || 'The client\'s Handover Pack is on its way.'));
  } catch (err) {
    clearTimeout(timeoutId);
    res.status(502).send(renderStatusPage('Could not reach the workflow', 'Please try again.'));
  }
};
