// §5 -- The Automation We Recommend. Spec §5, BUILD.md §8 §5.
// Source: automation.*. Must describe the actual proposed automation, never
// a generic capability claim ("AI-powered", "fully automated end-to-end")
// that isn't backed by a field -- trivially satisfied here since every
// sentence renders directly from a brief field, nothing is invented.

const { esc, section } = require('./_util');

function build(brief) {
  const a = brief.automation;

  const parts = [];
  if (a.trigger) parts.push('<p><strong>What starts it:</strong> ' + esc(a.trigger) + '</p>');
  if ((a.information_received || []).length) {
    parts.push('<p><strong>What information is received:</strong> ' + a.information_received.map(esc).join(', ') + '</p>');
  }
  if ((a.checks || []).length) {
    parts.push('<p><strong>What is checked:</strong></p><ul>' + a.checks.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>');
  }
  if ((a.actions || []).length) {
    parts.push('<p><strong>What happens:</strong></p><ul>' + a.actions.map(function (act) { return '<li>' + esc(act) + '</li>'; }).join('') + '</ul>');
  }
  if ((a.recipients || []).length) {
    parts.push('<p><strong>Who receives the result:</strong> ' + a.recipients.map(esc).join(', ') + '</p>');
  }
  if (a.customer_receives) {
    parts.push('<p><strong>What the customer receives:</strong> ' + esc(a.customer_receives) + '</p>');
  }
  if ((a.recorded || []).length) {
    parts.push('<p><strong>What gets recorded:</strong> ' + a.recorded.map(esc).join(', ') + '</p>');
  }

  const body = parts.join('');

  return section('sec-5', 'The Automation We Recommend', body);
}

module.exports = { build };
