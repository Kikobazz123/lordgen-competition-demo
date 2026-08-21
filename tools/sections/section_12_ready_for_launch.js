// §12 -- Ready for Launch. Spec §13 ("Final Go-Live Status"), BUILD.md §8 §12.
// Source: golive.*. The cross-checks that make "Complete" trustworthy
// (client_approval requires approval.state === received; production_launch
// requires every build.systems[] entry connected) are already enforced at
// validation time by validate_client_brief.js -- this builder trusts a
// schema-valid brief and just renders the six rows.

const { esc, section } = require('./_util');

const GOLIVE_LABELS = [
  ['automation_design', 'Automation design'],
  ['client_approval', 'Client approval'],
  ['secure_connections', 'Secure connections'],
  ['developer_wiring', 'Developer wiring'],
  ['final_testing', 'Final testing'],
  ['production_launch', 'Production launch']
];

const STATE_LABELS = { complete: 'Complete', pending: 'Pending' };

function build(brief) {
  const golive = brief.golive;

  const rows = GOLIVE_LABELS.map(function (pair) {
    const key = pair[0], label = pair[1];
    return '<tr><td>' + esc(label) + '</td><td>' + esc(STATE_LABELS[golive[key]] || golive[key]) + '</td></tr>';
  }).join('');

  const body = '<table><tr><th>Item</th><th>Status</th></tr>' + rows + '</table>';

  return section('sec-12', 'Ready for Launch', body);
}

module.exports = { build, GOLIVE_LABELS };
