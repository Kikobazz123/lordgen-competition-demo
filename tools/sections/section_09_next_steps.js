// §9 -- What Happens Next. Spec §9 (static nine-step sequence, verbatim),
// BUILD.md §8 §9 (step 4 wording informed by connection.services) and
// BUILD.md §16.5(c) (the delivery-tier statement renders inside this
// section, from the same constant as the website bubble and approval email).
//
// classify_delivery() and the shared copy-constants module are Step 9/10
// work, not yet built -- every brief is Tier B today by construction
// (schema/client_brief.schema.json's `delivery` comment, BUILD.md §17.10:
// "that is the correct behaviour, not a bug"). The tier copy below is
// BUILD.md §16.5(b)'s own already-drafted wording, used verbatim so this
// section is spec-correct today; Step 10 centralises it into
// src/delivery/copy.py-equivalent shared constants so the bubble/email/PDF
// can't drift. BUILD.md §17.8 [NEEDS RULING]: whether "Tier A"/"Tier B"
// appear in client copy at all, or plain labels only -- the default below
// (plain label, code in parentheses on first mention) is BUILD.md's own
// stated default, not yet confirmed by the developer.

const { esc, section } = require('./_util');

const STEPS = [
  'You approve the automation.',
  'Your approval is recorded.',
  'You receive a secure connection/onboarding form.',
  null, // step 4, built dynamically below from connection.services
  'The developer receives a clear wiring checklist.',
  "The automation is connected to your real systems.",
  'The connected workflow is tested again.',
  'A final go-live check is completed.',
  'The automation is activated.'
];

const TIER_COPY = {
  A: "Self-install automation (Tier A). When you approve, we'll email it to you straight away with step-by-step setup instructions. You connect your own accounts -- we never see your passwords -- and run one test before switching it on.",
  B: "We connect this one for you (Tier B). It needs to be joined to systems that can't be set up automatically. After you approve, we'll arrange the connection with you and test it before anything goes live."
};

function build(brief) {
  const services = (brief.connection && brief.connection.services) || [];
  const serviceNames = services.map(function (s) { return s.service; }).filter(Boolean);
  const step4 = serviceNames.length
    ? ('We collect only the information required to connect ' + serviceNames.join(', ') + '.')
    : 'We collect only the information required to connect the approved services.';

  const steps = STEPS.map(function (s, i) { return i === 3 ? step4 : s; });

  const tier = (brief.delivery && brief.delivery.tier) || 'B';
  const tierLine = TIER_COPY[tier] || TIER_COPY.B;

  const body =
    '<ol>' + steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
    '<p>' + esc(tierLine) + '</p>' +
    '<p>Approving does not automatically mean the automation goes live immediately. The real systems above are connected and tested first, and we confirm with you before anything goes live.</p>';

  return section('sec-9', 'What Happens Next', body);
}

module.exports = { build, TIER_COPY };
