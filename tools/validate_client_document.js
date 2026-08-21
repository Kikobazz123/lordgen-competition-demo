// Enforces docs/LORDGEN_CLIENT_DOCUMENT_STANDARD.md §2 as code: a client-facing
// document (Build Proposal or Handover Pack) must pass this before it renders.
// Failing generation is correct behaviour -- a document that renders with a
// defect is worse than no document. Every check returns a named field/rule so
// a failure is actionable, not just "invalid".

const BLOCKED_TOKENS = ['judge', 'competition', 'preset', 'auto-generated', 'placeholder', 'lorem'];
// 'demo' is blocked too (no legitimate client-facing use), handled below with
// its own check. 'test' was blocked here too in an earlier version, with a
// narrow exception for the exact phrase "test evidence" -- that didn't survive
// contact with the real spec: LORDGEN_UNIVERSAL_HANDOVER_SPEC.md §7 requires a
// "What We Tested" section, §5's worked example says "tested before", and §9's
// own honest disclaimer needs phrases like "tested again" and "before it goes
// live". The ordinary English verb "to test" is exactly what an honest
// build-status document needs to use. What the original defect actually was
// (internal fixture IDs like "QA-TEST-01", "test mode") is covered by more
// targeted patterns, not a blanket ban on the word.
const BANNED_WRITING_WORDS = ['etc', 'various', 'as needed', 'tbd', 'simple', 'robust', 'seamless', 'leverage'];
const VENDOR_FOOTER_PATTERNS = [/pdfshift/i, /created via/i, /powered by/i, /this email was sent automatically with n8n/i];
const REQUIRED_HEADER_FIELDS = ['referenceNumber', 'issueDate', 'preparedBy', 'preparedByContact', 'version'];
const SLASH_ALTERNATIVE_RE = /\s\/\s/; // e.g. "Data Table / CRM record" -- two systems named because the real one is unknown
const LEADING_MANUAL_NUMBER_RE = /^\s*\d+[.)]\s/; // a step string that brings its own "1. " into an auto-numbered <ol>

function wordBoundaryRegex(token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b' + escaped + '\\b', 'i');
}

function pushError(errors, field, rule, message) {
  errors.push({ field, rule, message });
}

/**
 * @param {object} doc
 * @param {'proposal'|'handover'} doc.documentType
 * @param {string} doc.opportunityNamed - the opportunity named in the document's title/header
 * @param {string} doc.opportunityBuilt - the opportunity actually selected/built
 * @param {string[]} doc.steps - process step strings, meant for an auto-numbered <ol>
 * @param {string[]} doc.integrations - system names the automation touches on the client's side
 * @param {string} doc.builtOn - the runtime (e.g. "n8n") -- must be separate from integrations, per rule 13
 * @param {object} doc.header - { referenceNumber, issueDate, preparedBy, preparedByContact, version }
 * @param {string} doc.disclaimer - the single disclaimer text (rule 9)
 * @param {string} doc.fullText - the complete rendered text/HTML, for token/footer/disclaimer-repeat scanning
 * @returns {{ valid: boolean, errors: Array<{field: string, rule: string, message: string}> }}
 */
function validateClientDocument(doc) {
  const errors = [];
  const d = doc || {};

  // Rule 1 -- named opportunity must equal built opportunity
  if (String(d.opportunityNamed || '').trim() !== String(d.opportunityBuilt || '').trim()) {
    pushError(errors, 'opportunityNamed/opportunityBuilt', 'rule-1',
      'Named opportunity ("' + d.opportunityNamed + '") does not match the built opportunity ("' + d.opportunityBuilt + '").');
  }

  // Rule 2 -- no empty/placeholder/slash-alternative field values
  const requiredFields = { businessName: d.businessName, automationName: d.automationName, trigger: d.trigger, builtOn: d.builtOn };
  for (const [field, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || String(value).trim() === '') {
      pushError(errors, field, 'rule-2', 'Field "' + field + '" is empty. Generation must fail rather than render an empty field.');
    }
  }
  (d.integrations || []).forEach(function (value, i) {
    if (SLASH_ALTERNATIVE_RE.test(value)) {
      pushError(errors, 'integrations[' + i + ']', 'rule-2',
        '"' + value + '" names two possible systems separated by "/" -- the system is unknown. Resolve to one value before render.');
    }
  });

  // Rule 3 -- blocked internal/test tokens must never reach a client render
  const haystacks = [
    ['opportunityNamed', d.opportunityNamed], ['businessName', d.businessName],
    ['automationName', d.automationName], ['approvedBy', d.approvedBy],
    ['fullText', d.fullText]
  ];
  for (const [field, value] of haystacks) {
    if (!value) continue;
    for (const token of BLOCKED_TOKENS) {
      if (wordBoundaryRegex(token).test(value)) {
        pushError(errors, field, 'rule-3', 'Blocked internal token "' + token + '" found in ' + field + '.');
      }
    }
    if (/competition\s+demo/i.test(value)) {
      pushError(errors, field, 'rule-3', 'Blocked phrase "competition demo" found in ' + field + '.');
    }
    if (wordBoundaryRegex('template').test(value)) {
      pushError(errors, field, 'rule-3',
        'Blocked internal token "template" found in ' + field + ' -- describe a library build as "an automation we have built and tested before", never as a template.');
    }
    // "demo": no legitimate client-facing use anywhere in either document type.
    if (wordBoundaryRegex('demo').test(value)) {
      pushError(errors, field, 'rule-3', 'Blocked internal token "demo" found in ' + field + '.');
    }
    // Targeted internal-test-artifact patterns -- not the bare word "test"
    // (see the BLOCKED_TOKENS comment above for why that's not banned).
    if (/\bQA-TEST\b/i.test(value) || /\btest\s+mode\b/i.test(value) || /\bin\s+test\b/i.test(value)) {
      pushError(errors, field, 'rule-3',
        'Blocked internal token "test" found in ' + field + ' outside the approved "Test evidence" heading.');
    }
  }

  // Rule 4 -- never disclose the document's own generation machinery
  if (d.fullText && /auto-?generated from/i.test(d.fullText)) {
    pushError(errors, 'fullText', 'rule-4', 'Document discloses its own generation machinery ("auto-generated from...").');
  }

  // Rule 6 -- step count 4-8, each under 20 words
  const steps = d.steps || [];
  if (steps.length < 4 || steps.length > 8) {
    pushError(errors, 'steps', 'rule-6', 'Step count is ' + steps.length + '; must be between 4 and 8.');
  }
  steps.forEach(function (step, i) {
    const wordCount = String(step).trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 20) {
      pushError(errors, 'steps[' + i + ']', 'rule-6', 'Step is ' + wordCount + ' words; must be under 20.');
    }
  });

  // Rule 5 -- best-effort heuristic only: a step should read as an actor performing a verb,
  // not a bare process noun. This cannot be fully verified by regex; it flags likely
  // violations (too short, or no recognizable system name) for human review rather than
  // claiming semantic certainty.
  const KNOWN_SYSTEMS = /\b(n8n|crm|gmail|email|database|api|webhook|workflow|dispatch|form|agent|drive|sheet|calendar)\b/i;
  steps.forEach(function (step, i) {
    const wordCount = String(step).trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 4 || !KNOWN_SYSTEMS.test(step)) {
      pushError(errors, 'steps[' + i + ']', 'rule-5-heuristic',
        '"' + step + '" reads as a bare process noun, not a system performing an action. Review against the worked example in §6.');
    }
  });

  // Rule 7 -- banned vague words in client-facing text
  if (d.fullText) {
    for (const word of BANNED_WRITING_WORDS) {
      if (wordBoundaryRegex(word).test(d.fullText)) {
        pushError(errors, 'fullText', 'rule-7', 'Banned word "' + word + '" found in client-facing text.');
      }
    }
    if (/\bsolutions?\b/i.test(d.fullText.replace(/in scope|not in scope/gi, ''))) {
      pushError(errors, 'fullText', 'rule-7', 'Banned word "solution" (as a noun for the built thing) found in client-facing text.');
    }
  }

  // Rule 9 -- exactly one disclaimer, in a fixed position
  if (d.disclaimer && d.fullText) {
    const occurrences = d.fullText.split(d.disclaimer).length - 1;
    if (occurrences > 1) {
      pushError(errors, 'disclaimer', 'rule-9', 'Disclaimer text appears ' + occurrences + ' times; it must appear exactly once.');
    }
  }

  // Rule 10 -- numbering owned by exactly one layer
  steps.forEach(function (step, i) {
    if (LEADING_MANUAL_NUMBER_RE.test(step)) {
      pushError(errors, 'steps[' + i + ']', 'rule-10',
        '"' + step + '" carries its own manual number into an auto-numbered list, producing double numbering (e.g. "1. 1. ...").');
    }
  });

  // Rule 11 -- required header fields
  const header = d.header || {};
  for (const field of REQUIRED_HEADER_FIELDS) {
    if (!header[field] || String(header[field]).trim() === '') {
      pushError(errors, 'header.' + field, 'rule-11', 'Required header field "' + field + '" is missing or empty.');
    }
  }

  // Rule 12 -- no vendor footer
  if (d.fullText) {
    for (const pattern of VENDOR_FOOTER_PATTERNS) {
      if (pattern.test(d.fullText)) {
        pushError(errors, 'fullText', 'rule-12', 'Vendor footer/disclosure matching ' + pattern + ' found in rendered document.');
      }
    }
  }

  // Rule 13 -- n8n (the runtime) must not appear in the integrations list; it belongs in builtOn
  (d.integrations || []).forEach(function (value, i) {
    if (/\bn8n\b/i.test(value)) {
      pushError(errors, 'integrations[' + i + ']', 'rule-13', '"' + value + '" lists n8n as an integration -- n8n is the runtime, it belongs in the "builtOn" field.');
    }
  });
  if (!d.builtOn || String(d.builtOn).trim() === '') {
    pushError(errors, 'builtOn', 'rule-13', 'Required "builtOn" field is missing.');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateClientDocument, BLOCKED_TOKENS, BANNED_WRITING_WORDS };
