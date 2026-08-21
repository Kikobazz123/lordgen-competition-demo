// §4 -- What We Found. Spec §4, BUILD.md §8 §4.
// Source: research.*.
//
// G3/H3: never fabricate a finding. If research.performed is false, or no
// row survives the evidence requirement, print the declared empty state and
// nothing else -- never a shorter table standing in for a real one.
// (The schema/validator already reject a finding missing `evidence`, so the
// per-row filter below is a defensive second check, not the primary gate.)

const { esc, section } = require('./_util');

const EMPTY_STATE = function (businessName) {
  return 'We have not yet completed a review of public customer feedback for ' + businessName + '. The recommendations in this document are based on the information you provided.';
};

function build(brief) {
  const research = brief.research;
  const businessName = brief.client.business_name;

  const rows = (research.performed ? (research.findings || []) : [])
    .filter(function (f) { return f.evidence && f.evidence.trim(); });

  let body;
  let empty;
  if (rows.length === 0) {
    body = '<p>' + esc(EMPTY_STATE(businessName)) + '</p>';
    empty = true;
  } else {
    const tableRows = rows.map(function (f) {
      return '<tr><td>' + esc(f.issue) + '</td><td>' + esc(f.evidence) + '</td><td>' + esc(f.impact) + '</td><td>' + esc(f.opportunity) + '</td></tr>';
    }).join('');
    body = '<table><tr><th>Issue detected</th><th>What customers are experiencing</th><th>Possible business impact</th><th>Automation opportunity</th></tr>' + tableRows + '</table>';
    empty = false;
  }

  const result = section('sec-4', 'What We Found', body);
  result.empty = empty;
  return result;
}

module.exports = { build, EMPTY_STATE };
