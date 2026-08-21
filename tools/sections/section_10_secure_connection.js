// §10 -- Secure Connection. Spec §10, BUILD.md §8 §10.
// Source: connection.services[]. G5: never instruct a client to send
// passwords or credentials by ordinary email.
//
// Must NOT contain service-by-service technical setup detail (BUILD.md:
// "the client does not need to understand what is being connected, only
// that it will be done safely") -- this builder lists service NAMES only,
// never `connection.services[].method` or `.what_we_need`, which are
// internal/developer detail rendered instead by section_11.

const { esc, section } = require('./_util');

const COMMITMENT = 'We will never ask you to send passwords through ordinary email. If a service needs to be connected, we will provide a secure connection method or secure form appropriate to that service.';

function build(brief) {
  const services = (brief.connection && brief.connection.services) || [];
  const names = services.map(function (s) { return s.service; }).filter(Boolean);

  let body = '<p>' + esc(COMMITMENT) + '</p>';
  if (names.length) {
    body += '<p>Services this involves: ' + names.map(esc).join(', ') + '.</p>';
  }

  return section('sec-10', 'Secure Connection', body);
}

module.exports = { build, COMMITMENT };
