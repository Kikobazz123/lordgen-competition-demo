// Server-side landing endpoint for an approval decision. Two channels reach
// this file: the proposal email's Approve/Request-changes links (GET, since
// email can't POST) and the website panel's buttons (POST, JSON). Both
// resolve to the same n8n "Approval Decision" webhook via the same relay
// pattern as trigger-demo.js -- the browser and email client never see the
// n8n URL or its auth token. See docs/LORDGEN_CLIENT_DOCUMENT_STANDARD.md §4.

const N8N_URL_ENV = 'N8N_DECISION_WEBHOOK_URL';
const N8N_TOKEN_ENV = 'N8N_DECISION_WEBHOOK_TOKEN';
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

async function callDecisionWebhook(payload) {
  const webhookUrl = process.env[N8N_URL_ENV];
  const webhookToken = process.env[N8N_TOKEN_ENV];
  if (!webhookUrl || !webhookToken) {
    return { ok: false, status: 503, body: { error: 'The approval flow is not configured on this deployment.' } };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(function abortUpstream() { controller.abort(); }, UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [HEADER_NAME]: webhookToken },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const contentType = upstream.headers.get('content-type') || '';
    const body = contentType.indexOf('application/json') !== -1 ? await upstream.json() : await upstream.text();
    return { ok: upstream.ok, status: upstream.status, body: body };
  } catch (err) {
    clearTimeout(timeoutId);
    return { ok: false, status: 502, body: { error: 'Could not reach the approval workflow. Please try again.' } };
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const token = req.query.token;
    const decision = req.query.decision;
    if (!token || (decision !== 'approved' && decision !== 'changes_requested')) {
      res.status(400).send(renderStatusPage('Invalid link', 'This approval link is missing information or has been altered.'));
      return;
    }

    const result = await callDecisionWebhook({ token: token, decision: decision, channel: 'email' });
    if (!result.ok) {
      res.status(result.status).send(renderStatusPage('Something went wrong', (result.body && result.body.error) || 'Please try again or contact us directly.'));
      return;
    }

    const outcome = result.body || {};
    const titles = { approved: 'Build started', changes_requested: 'Changes requested', expired: 'Link expired' };
    const title = titles[outcome.status] || 'Received';
    res.status(200).send(renderStatusPage(title, outcome.message || 'Thank you -- we have recorded your decision.'));
    return;
  }

  if (req.method === 'POST') {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    if (!body.token || (body.decision !== 'approved' && body.decision !== 'changes_requested')) {
      res.status(400).json({ error: 'token and decision ("approved" or "changes_requested") are required' });
      return;
    }
    const result = await callDecisionWebhook({
      token: body.token,
      decision: body.decision,
      channel: 'website',
      changeNotes: body.changeNotes || ''
    });
    res.status(result.status).json(result.body);
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
};
