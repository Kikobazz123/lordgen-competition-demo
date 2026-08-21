// §13 -- Support and Handover. Spec §14, BUILD.md §8 §13.
// Source: support.*. Spec is explicit: "This wording should be dynamically
// populated from the project's actual support terms rather than copied into
// every client document" -- so this builder never hardcodes "14 days" or any
// other project-specific figure; it only ever reads `support.window_days`.
// (This is also what H6/H7 check for centrally: a number in client copy
// must trace to a brief field, and support terms specifically must come
// from `support.*`, not the template.)

const { esc, section } = require('./_util');

function build(brief) {
  const support = brief.support;

  const days = support.window_days;
  const dayWord = days === 1 ? 'day' : 'days';

  let body = '<p>LordGen covers this build for ' + days + ' ' + dayWord + ' from handover';
  if (support.covers) body += ' for ' + esc(support.covers).toLowerCase();
  body += ', at no charge.</p>';

  if (support.excludes) {
    body += '<p>This does not include: ' + esc(support.excludes) + '.</p>';
  }
  if (support.contact) {
    body += '<p>For questions, contact ' + esc(support.contact) + '.</p>';
  }

  return section('sec-13', 'Support and Handover', body);
}

module.exports = { build };
