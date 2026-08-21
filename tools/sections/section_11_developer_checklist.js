// §11 -- Developer Wiring Checklist (INTERNAL). Spec §11-12, BUILD.md §8 §11.
// Source: developer.*, build.systems[], connection.services[].
//
// Technical language is correct here -- this section never ships in
// handover-client.pdf (BUILD.md §7's page-break/INTERNAL-banner separation,
// G6). It is excluded from the plain-English gate for that reason (BUILD.md
// §9: "Runs on client-facing sections only (§1-§10, §12-§13)").
//
// G5/QA-gate-12 still applies even here: "credentials, tokens, or secrets.
// Ever. Reference where they live, never their values." This builder renders
// connection.services[].method and .what_we_need (what's needed, and how --
// e.g. "account_authorisation"), never approval.token or any credential
// value, because none of those live in this brief in the first place.

const { esc, section } = require('./_util');

const CHECKLIST_LABELS = {
  automation_approved: 'Automation approved',
  connection_info_received: 'Client connection information received',
  workflow_imported: 'Workflow imported/configured',
  error_handling_checked: 'Error handling checked',
  duplicate_handling_checked: 'Duplicate handling checked',
  notifications_checked: 'Notifications checked',
  final_test_completed: 'Final test completed',
  golive_approved: 'Go-live approved'
};

function build(brief) {
  const dev = brief.developer;
  const systems = brief.build.systems || [];
  const services = (brief.connection && brief.connection.services) || [];

  const checklistRows = Object.keys(CHECKLIST_LABELS).map(function (key) {
    return '<tr><td>' + esc(CHECKLIST_LABELS[key]) + '</td><td>' + (dev[key] ? 'Yes' : 'No') + '</td></tr>';
  }).join('');

  const systemRows = systems.map(function (s) {
    return '<tr><td>' + esc(s.name) + '</td><td>' + esc(s.state) + '</td><td>' + esc(s.owner) + '</td></tr>';
  }).join('');

  const serviceRows = services.map(function (s) {
    return '<tr><td>' + esc(s.service) + '</td><td>' + esc(s.method) + '</td><td>' + esc(s.what_we_need) + '</td></tr>';
  }).join('');

  const body =
    '<table><tr><th>Item</th><th>Status</th></tr>' + checklistRows + '</table>' +
    (systemRows ? ('<h3>Systems</h3><table><tr><th>System</th><th>State</th><th>Owner</th></tr>' + systemRows + '</table>') : '') +
    (serviceRows ? ('<h3>Required connections</h3><table><tr><th>Service</th><th>Method</th><th>What we need</th></tr>' + serviceRows + '</table>') : '') +
    '<p>A human approval point remains before production activation -- this checklist assists the developer, it does not authorise go-live on its own.</p>';

  return section('sec-11', 'Developer Wiring Checklist', body);
}

module.exports = { build, CHECKLIST_LABELS };
