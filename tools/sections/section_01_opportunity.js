// §1 -- How Automation Can Help [BUSINESS NAME]. Spec §1, BUILD.md §8 §1.
// Source: business.*, workflow.*. Client-facing.
//
// The schema already requires business.what_they_do to be non-empty
// (minLength: 1) -- BUILD.md's "empty state: fail validation instead" for
// this section is enforced upstream by validate_client_brief.js, so this
// builder can assume valid input and just render it.

const { esc, section } = require('./_util');

function build(brief) {
  const business = brief.business;
  const workflow = brief.workflow;
  const businessName = brief.client.business_name;

  const manualSteps = workflow.current_manual_steps || [];
  const painPoints = workflow.pain_points || [];

  let body = '<p>' + esc(business.what_they_do) + '</p>';

  if (workflow.name) {
    body += '<p>One workflow that could benefit from automation is <strong>' + esc(workflow.name) + '</strong>.</p>';
  }

  if (manualSteps.length) {
    body += '<p>Right now, this involves some manual work:</p><ul>' +
      manualSteps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
  }

  if (painPoints.length) {
    body += '<p>What could be improved:</p><ul>' +
      painPoints.map(function (p) { return '<li>' + esc(p.point) + '</li>'; }).join('') + '</ul>';
  }

  return section('sec-1', 'How Automation Can Help ' + businessName, body);
}

module.exports = { build };
