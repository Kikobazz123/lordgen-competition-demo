// §6 -- What We Built for You. Spec §6, BUILD.md §8 §6.
// Source: build.*.
//
// System table wording is fixed by BUILD.md §8 §6: `not_connected` renders
// as "Not yet connected to your live system", never "Stubbed" (D3). The
// "Credential owner" column is dropped from client copy entirely (D3) --
// `systems[].owner` is internal-pack-only, read by section_11, never here.
//
// The heading itself never says "live" (it's the fixed spec heading), and
// this builder never asserts production-live status in body text either --
// H2 (build.status must be production_ready AND every system connected AND
// every golive item complete) is enforced centrally by the honesty gate
// against whatever prose exists, not duplicated here.

const { esc, section } = require('./_util');

const STATUS_LABELS = {
  starter_build: 'Starter Build',
  demo_test_build: 'Demo / Test Build',
  ready_for_connection: 'Ready for Connection',
  production_ready: 'Production Ready'
};

const SYSTEM_STATE_LABELS = {
  connected: 'Connected and working',
  not_connected: 'Not yet connected to your live system'
};

function build(brief) {
  const b = brief.build;
  const statusLabel = STATUS_LABELS[b.status] || b.status;

  const rows = (b.systems || []).map(function (s) {
    return '<tr><td>' + esc(s.name) + '</td><td>' + esc(SYSTEM_STATE_LABELS[s.state] || s.state) + '</td></tr>';
  }).join('');

  const body =
    '<p><strong>' + esc(b.what_was_created) + '</strong> &mdash; ' + esc(statusLabel) + '.</p>' +
    (rows ? ('<table><tr><th>System</th><th>Status</th></tr>' + rows + '</table>') : '');

  return section('sec-6', 'What We Built for You', body);
}

module.exports = { build, STATUS_LABELS, SYSTEM_STATE_LABELS };
