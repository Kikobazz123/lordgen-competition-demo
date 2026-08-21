// §2 -- Standard Automation Opportunities for [CATEGORY]. Spec §2, BUILD.md §8 §2.
// Source: business.category_label, category_opportunities[] (schema-enforced
// to be exactly 3 rows -- BUILD.md's "empty state: fewer than 3 rows ->
// validation failure" is enforced upstream, this builder trusts the input).
//
// Must NOT describe the automation actually built (that's §5) -- this section
// only renders what the brief supplies as category education, never anything
// derived from `automation.*`.

const { esc, section } = require('./_util');

function build(brief) {
  const business = brief.business;
  const opps = brief.category_opportunities;

  const rows = opps.map(function (o) {
    return '<tr><td>' + esc(o.current_activity) + '</td><td>' + esc(o.how_automation_helps) + '</td><td>' + esc(o.business_benefit) + '</td></tr>';
  }).join('');

  const body = '<table><tr><th>Current business activity</th><th>How automation can help</th><th>Business benefit</th></tr>' + rows + '</table>';

  return section('sec-2', 'Standard Automation Opportunities for ' + business.category_label, body);
}

module.exports = { build };
