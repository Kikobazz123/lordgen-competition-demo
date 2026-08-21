// §8 -- Your Approval. Spec §8, BUILD.md §8 §8, adapted per the confirmed
// project decision recorded in schema/client_brief.schema.json's `approval`
// description: this project's real approval mechanism is a tokenized
// Approve/Request-changes link (the live "LordGen Demo -- Approval Decision"
// n8n workflow), not the spec's literal "reply with the exact phrase I
// APPROVE THIS AUTOMATION" email-parsing design. Describing a mechanism that
// was never built would itself be a G1/G3 violation -- inventing a fact the
// input data (and the actual system) doesn't back up.
//
// H4 is the rule that matters most here (BUILD.md §10, "the defect that
// shipped in v1.0"): no approval record may render anywhere unless
// approval.state === 'received', and once received, the request block is
// replaced entirely by a confirmation -- never both at once.
//
// This builder never renders `approval.token` -- a secret-shaped string,
// banned from client copy by QA gate item 12 regardless of section.

const { esc, humanDate, section } = require('./_util');

function build(brief) {
  const approval = brief.approval;
  const businessName = brief.client.business_name;

  let body;
  if (approval.state === 'received') {
    const when = humanDate(approval.decided_at);
    body = '<p>Approved by <strong>' + esc(approval.decided_by) + '</strong> on ' + esc(when) + '. Thank you &mdash; this means you are happy for us to proceed to the secure connection and implementation stage.</p>';
  } else {
    body = '<p>To approve the automation described in this document for ' + esc(businessName) +
      ', use the Approve link in the email that sent you this proposal. This tells us you are happy for us to proceed to the secure connection and implementation stage.</p>';
  }

  const result = section('sec-8', 'Your Approval', body);
  result.approved = approval.state === 'received';
  return result;
}

module.exports = { build };
