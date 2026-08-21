// Honesty gate — LORDGEN_HANDOVER_GENERATOR_BUILD.md §10.
// Checks rendered client-facing text against the (already schema-validated,
// see tools/validate_client_brief.js) brief it was generated from. Most of
// H1/H3/H4/H5/H7 are brief-level cross-checks and already enforced at
// validation time -- a brief that fails them never reaches rendering. What's
// left to check here is specifically about the RENDERED PROSE: does it claim
// more than the data backs up. H8-H10 (tier-copy cross-surface consistency)
// are out of scope until delivery-tier classification is built (currently
// every brief is Tier B by construction -- see schema/client_brief.schema.json).

// Deliberately narrow: catches assertive present-tense claims ("is live",
// "in production"), not honest future/negated phrasing the spec itself
// requires -- §9's disclaimer needs to say approval "does not automatically
// mean the automation immediately goes live" and step 7 needs "tested again
// ... before it goes live". Matching bare "live" or "goes live" would reject
// that required honest language, not the dishonest claim H2 exists to catch.
const PRODUCTION_LANGUAGE_RE = /\b(is\s+now\s+live|is\s+live|currently\s+live|in\s+production|go-live\s+complete|production-ready|production\s+ready)\b/i;
const NUMERIC_CLAIM_RE = /(\d+(\.\d+)?\s?%|[$£€]\s?\d+(\.\d+)?|\b\d+\s*(hours?|minutes?|days?|weeks?))/gi;

function isProductionReady(brief) {
  const build = brief.build || {};
  const systems = build.systems || [];
  const golive = brief.golive || {};
  return build.status === 'production_ready'
    && systems.length > 0
    && systems.every(function (s) { return s.state === 'connected'; })
    && Object.keys(golive).every(function (k) { return golive[k] === 'complete'; });
}

/**
 * @param {string} text - rendered client-facing text to check
 * @param {object} brief - the client_brief this text was generated from (schema-valid)
 * @returns {{ pass: boolean, violations: Array<{rule: string, message: string}> }}
 */
function checkHonesty(text, brief) {
  const violations = [];
  if (typeof text !== 'string' || text.trim() === '') {
    return { pass: true, violations: [] };
  }
  if (!brief || typeof brief !== 'object') {
    return { pass: false, violations: [{ rule: 'input', message: 'no brief supplied to check claims against' }] };
  }

  // H2: production language requires build.status production_ready AND every
  // system connected AND every golive item complete.
  if (PRODUCTION_LANGUAGE_RE.test(text) && !isProductionReady(brief)) {
    const match = text.match(PRODUCTION_LANGUAGE_RE);
    violations.push({ rule: 'H2', message: 'text says "' + match[0] + '" but build.status/systems/golive do not all confirm production-ready' });
  }

  // H6: no numeric claim (%, hours, currency) without a matching value
  // somewhere in the brief's own data. A number invented for the prose,
  // rather than sourced from a field, has nothing in the brief to match.
  const briefJson = JSON.stringify(brief);
  const seen = new Set();
  let match;
  NUMERIC_CLAIM_RE.lastIndex = 0;
  while ((match = NUMERIC_CLAIM_RE.exec(text))) {
    const claim = match[0];
    if (seen.has(claim)) continue;
    seen.add(claim);
    const bareNumber = claim.match(/\d+(\.\d+)?/)[0];
    if (!briefJson.includes(claim) && !briefJson.includes(bareNumber)) {
      violations.push({ rule: 'H6', message: 'numeric claim "' + claim + '" does not trace to any field in the brief' });
    }
  }

  return { pass: violations.length === 0, violations: violations };
}

module.exports = { checkHonesty, isProductionReady };
