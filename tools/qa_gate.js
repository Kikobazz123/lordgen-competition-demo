// Step 6 -- QA gate wired as a hard pre-emit block.
// LORDGEN_HANDOVER_GENERATOR_BUILD.md §13 (16 checks), §15 Step 6
// ("QA gate wired as a hard pre-emit block | Bad brief cannot produce a
// PDF"), G10 ("The generator refuses to emit a PDF if the QA gate fails.
// Failing loudly is correct; shipping a broken client document is not.").
//
// This module doesn't invent new rules -- it wires together the pieces
// Steps 1-5 already built (schema validator, plain-English gate, honesty
// gate, section builders, HTML template, PDF renderer) into one checkpoint,
// plus the handful of §13 checks that don't belong to any single earlier
// step (duplicate-block detection, placeholder/secret scanning, brand-CSS
// regression checks, PDF-output checks).
//
// Two phases, because §13's own checks split naturally into two kinds:
//   - PRE-RENDER: checks on the brief/sections/HTML strings. Fast, no
//     browser. If any of these fail, renderPdf/renderBothPdfs is never
//     called at all -- "bad brief cannot produce a PDF" is true by
//     construction, not by discarding a PDF after the fact.
//   - POST-RENDER: checks that can only be asked of the actual PDF bytes
//     (watermark absence, "does it open"). These run after rendering but
//     before generateHandoverPdfs() returns anything to its caller -- a
//     failure here still means no PDF is ever emitted to whoever asked.
//
// Two of the 16 checks (§13 items 14-16 concern delivery.tier copy
// consistency across the website bubble / approval email / PDF) are only
// partially checkable today. Tier classification itself (`classify_delivery()`,
// build order Step 9) and the shared copy constants (Step 10) don't exist
// yet -- tools/gates/honesty.js's own header comment already flags this
// ("H8-H10 ... out of scope until delivery-tier classification is built").
// Item 14's data-shape half (delivery.tier present, Tier A only if A1-A7 all
// true) IS already enforced, by validateClientBrief. Items 15-16 (cross-surface
// copy equality, Tier-A install-pack safety) are listed in DEFERRED_CHECKS
// rather than faked -- an honest "not yet built" per G8, not a silent gap.

const { validateClientBrief } = require('./validate_client_brief');
const { checkPlainEnglish } = require('./gates/plain_english');
const { checkHonesty, isProductionReady } = require('./gates/honesty');
const { buildAllSections } = require('./sections');
const { renderDocument, brandCss, TOKENS } = require('./render_document');
const { stripTags } = require('./sections/_util');

const DEFERRED_CHECKS = [
  { rule: 'qa-15', reason: 'tier copy cross-surface equality test -- needs Step 10 (shared copy constants in src/delivery/copy.py-equivalent), not built yet' },
  { rule: 'qa-16', reason: 'Tier A install-pack safety scan -- needs Step 9 (classify_delivery()); every brief is Tier B by construction until then' }
];

const PLACEHOLDER_RE = /\[BUSINESS NAME\]|\[CATEGORY\]|\bTBD\b|\blorem\b|\bnull\b|\bundefined\b/i;
const ISO_TIMESTAMP_RE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const EMPTY_TD_RE = /<td[^>]*>(\s|&nbsp;)*<\/td>/i;
// Long opaque token-shaped string -- a conservative, generic backstop behind
// the concrete check (the real approval.token, below). 32+ contiguous
// alnum/dash/underscore chars is well above meta.ref's own shape
// (LG-YYYYMMDD-CLIENTSLUG-NN, ~27 chars) so it doesn't false-positive on
// the document's own reference number.
const SECRET_SHAPED_RE = /\b[A-Za-z0-9_-]{32,}\b/;
// 12 matches gates/plain_english.js's own GLOSS_MIN_WORDS -- the same
// "long enough to be a real prose claim, not a short factual clause"
// judgment call already accepted elsewhere in this codebase. Confirmed
// against the real GIG fixture: §3 and §5 both legitimately say "The order
// is logged in your dispatch record." (8 words) -- one fact, stated the
// same way from two clearly-labelled angles (a simple flow diagram vs. a
// structured recommendation breakdown), not the D4/D16 defect (the same
// paragraph padded into the same area twice). A lower floor would flag
// that as a duplicate; 12 does not, while still catching the D4 example
// itself (15+ words).
const MIN_DUPLICATE_BLOCK_WORDS = 12;
const DUPLICATE_SIMILARITY_THRESHOLD = 0.9;

function pushViolation(list, rule, message) {
  list.push({ rule, message });
}

// --- §13 item 3: duplicate-block detection (catches D4/D16) ---
// Dependency-free string similarity: Sorensen-Dice coefficient over
// character bigrams. Order-sensitive (unlike bag-of-words), so two
// sentences sharing vocabulary but saying different things score low.

function bigrams(s) {
  const norm = s.toLowerCase().replace(/\s+/g, ' ').trim();
  const grams = [];
  for (let i = 0; i < norm.length - 1; i++) grams.push(norm.substring(i, i + 2));
  return grams;
}

function diceCoefficient(a, b) {
  const ag = bigrams(a);
  const bg = bigrams(b);
  if (ag.length === 0 || bg.length === 0) return ag.length === bg.length ? 1 : 0;
  const bCounts = new Map();
  bg.forEach(function (g) { bCounts.set(g, (bCounts.get(g) || 0) + 1); });
  let matches = 0;
  ag.forEach(function (g) {
    const count = bCounts.get(g) || 0;
    if (count > 0) { matches++; bCounts.set(g, count - 1); }
  });
  return (2 * matches) / (ag.length + bg.length);
}

function splitBlocks(text) {
  return String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map(function (s) { return s.trim(); })
    .filter(function (s) { return s && s.split(/\s+/).filter(Boolean).length >= MIN_DUPLICATE_BLOCK_WORDS; });
}

function checkDuplicateBlocks(sectionResults) {
  const violations = [];
  const blocks = [];
  (sectionResults || []).forEach(function (s) {
    splitBlocks(s && s.text).forEach(function (block) {
      blocks.push({ sectionId: s.id, block: block });
    });
  });
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const sim = diceCoefficient(blocks[i].block, blocks[j].block);
      if (sim > DUPLICATE_SIMILARITY_THRESHOLD) {
        pushViolation(violations, 'qa-3',
          'near-duplicate text (similarity ' + sim.toFixed(2) + ') between "' + blocks[i].sectionId + '" and "' + blocks[j].sectionId + '": "' + blocks[i].block + '"');
      }
    }
  }
  return violations;
}

// --- §13 item 1: all 13 sections present, in order, exactly one internal ---

function checkSectionCompleteness(sectionResults) {
  const violations = [];
  if (!Array.isArray(sectionResults) || sectionResults.length !== 13) {
    pushViolation(violations, 'qa-1', 'expected exactly 13 sections (BUILD.md §7), got ' + (Array.isArray(sectionResults) ? sectionResults.length : typeof sectionResults));
    return violations;
  }
  sectionResults.forEach(function (s, i) {
    if (!s || typeof s.html !== 'string' || !s.html) pushViolation(violations, 'qa-1', 'section at index ' + i + ' has no rendered html');
    if (!s || typeof s.id !== 'string' || !s.id) pushViolation(violations, 'qa-1', 'section at index ' + i + ' has no id');
  });
  const internalSections = sectionResults.filter(function (s) { return s && s.internal; });
  if (internalSections.length !== 1) {
    pushViolation(violations, 'qa-1', 'expected exactly 1 internal section (Developer Wiring Checklist), found ' + internalSections.length);
  } else if (!sectionResults[10] || !sectionResults[10].internal) {
    pushViolation(violations, 'qa-1', 'the internal section must be at position 11 (index 10) per BUILD.md §7 document order');
  }
  return violations;
}

// --- §13 item 2: plain-English gate on client-facing sections only ---

function checkPlainEnglishAcrossSections(sectionResults, brief) {
  const violations = [];
  const allowWithGloss = (brief && brief.allow_with_gloss) || [];
  (sectionResults || []).filter(function (s) { return s && !s.internal; }).forEach(function (s) {
    const result = checkPlainEnglish(s.text, { allowWithGloss: allowWithGloss });
    result.violations.forEach(function (v) {
      pushViolation(violations, 'qa-2', 'section "' + s.id + '": ' + v.message);
    });
  });
  return violations;
}

// --- §13 items 4-6, 9 (data half): reuse the schema validator + H2 data check ---
// H1 (test evidence), H4 (approval state machine), and the golive/systems
// cross-checks are already enforced inside validateClientBrief -- a brief
// that fails them never reaches this gate's later checks. What validateClientBrief
// does NOT check is whether build.status itself is honest against the same
// facts (a brief can set status="production_ready" while every system is
// still "not_connected" -- nothing in the schema forbids that combination),
// so that one data-level piece of H2 is added here.

function checkBriefValidity(brief) {
  const result = validateClientBrief(brief);
  return result.errors.map(function (e) {
    return { rule: 'qa-4-5-6-brief-schema', message: e.field + ' -- ' + e.message };
  });
}

function checkStatusConsistency(brief) {
  const violations = [];
  const build = (brief && brief.build) || {};
  if (build.status === 'production_ready' && !isProductionReady(brief)) {
    pushViolation(violations, 'qa-5',
      'build.status is "production_ready" but not every system is connected and every golive item complete (H2 data-level consistency)');
  }
  return violations;
}

// --- honesty gate (H2 prose / H6 numeric claims) against rendered client prose ---

function checkHonestyAcrossSections(sectionResults, brief) {
  const violations = [];
  (sectionResults || []).filter(function (s) { return s && !s.internal; }).forEach(function (s) {
    const result = checkHonesty(s.text, brief);
    result.violations.forEach(function (v) {
      pushViolation(violations, 'qa-6-honesty-' + v.rule, 'section "' + s.id + '": ' + v.message);
    });
  });
  return violations;
}

// --- §13 item 7: no ISO timestamp in CLIENT copy specifically ---
// (BUILD.md D7's fix is "human date format, ISO only in internal section" --
// an ISO stamp in the internal pack is correct, not a defect, so this must
// not run against fullHtml/the internal section.)

function checkNoIsoTimestampInClientCopy(clientHtml) {
  const violations = [];
  const match = String(clientHtml || '').match(ISO_TIMESTAMP_RE);
  if (match) {
    pushViolation(violations, 'qa-7', 'ISO timestamp "' + match[0] + '" found in client-facing copy (D7) -- ISO stamps belong in the internal pack only');
  }
  return violations;
}

// --- §13 item 9: no unresolved placeholders, in either document ---

function checkNoUnresolvedPlaceholders(html, label) {
  const violations = [];
  const match = String(html || '').match(PLACEHOLDER_RE);
  if (match) {
    pushViolation(violations, 'qa-9', 'unresolved placeholder "' + match[0] + '" found in ' + label);
  }
  return violations;
}

// --- §13 item 10: no empty table cells ---

function checkNoEmptyTableCells(html, label) {
  const violations = [];
  if (EMPTY_TD_RE.test(String(html || ''))) {
    pushViolation(violations, 'qa-10', 'an empty <td> cell was found in ' + label);
  }
  return violations;
}

// --- §13 item 11: no gold background behind body text; no centred/justified body type ---
// Runs against the shared brand stylesheet, not per-brief -- it's a
// regression guard on tools/render_document.js's brandCss(), which is
// identical for every client. Scoped to selectors that actually carry body
// TEXT (body/p/li/td) rather than a blanket CSS-wide scan -- a short,
// centred, all-caps banner LABEL (.internal-banner, a section divider) is
// a normal, common design element, not "body copy" in the §12 sense the
// rule exists to police. Confirmed against the real brandCss() output: an
// unscoped scan false-positives on exactly that banner.

function checkBrandTypography(css) {
  const violations = [];
  const textSelectorBlockRe = /(^|\})\s*([^{}]*\b(body|p|li|td)\b[^{}]*)\{([^}]*)\}/gi;
  let m;
  while ((m = textSelectorBlockRe.exec(css))) {
    const selector = m[2].trim();
    const declarations = m[4];
    if (/text-align:\s*(center|justify)/i.test(declarations)) {
      pushViolation(violations, 'qa-11', 'selector "' + selector + '" centres or justifies body text (§12: type flush left, never centred or justified)');
    }
    if (new RegExp(TOKENS.gold, 'i').test(declarations) && /background/i.test(declarations)) {
      pushViolation(violations, 'qa-11', 'selector "' + selector + '" sets a gold background behind body text (§12: gold is never a background for body copy)');
    }
  }
  return violations;
}

// --- §13 item 12: zero credentials, tokens, or secret-shaped strings in EITHER document ---
// (§11's own rule -- "Must not contain: credentials, tokens, or secrets.
// Ever." -- applies to the internal pack too, not just the client copy.)

function checkNoSecretsInCopy(html, brief, label) {
  const violations = [];
  const token = brief && brief.approval && brief.approval.token;
  const raw = String(html || '');
  if (token && raw.includes(token)) {
    pushViolation(violations, 'qa-12', 'the approval token appears in ' + label + ' (G5)');
  }
  const stripped = stripTags(raw);
  const match = stripped.match(SECRET_SHAPED_RE);
  if (match) {
    pushViolation(violations, 'qa-12', 'a long opaque token-shaped string was found in ' + label + ': "' + match[0].slice(0, 12) + '..."');
  }
  return violations;
}

// --- §13 item 14 (data half): delivery.tier present and Tier A only if A1-A7 all hold ---
// Already enforced inside validateClientBrief (checkBriefValidity covers
// this); kept as its own named function so the 16-item mapping stays
// legible from this file's exports rather than buried inside one generic
// schema dump.

function checkDeliveryTier(brief) {
  const result = validateClientBrief(brief);
  return result.errors
    .filter(function (e) { return e.field.indexOf('delivery') === 0; })
    .map(function (e) { return { rule: 'qa-14', message: e.field + ' -- ' + e.message }; });
}

// --- PRE-RENDER: everything above, run before any PDF rendering starts ---

function runPreRenderChecks(brief, sectionResults, htmlDocs) {
  const clientHtml = htmlDocs.clientHtml;
  const fullHtml = htmlDocs.fullHtml;
  return [].concat(
    checkSectionCompleteness(sectionResults),
    checkPlainEnglishAcrossSections(sectionResults, brief),
    checkHonestyAcrossSections(sectionResults, brief),
    checkDuplicateBlocks(sectionResults),
    checkBriefValidity(brief),
    checkStatusConsistency(brief),
    checkDeliveryTier(brief),
    checkNoIsoTimestampInClientCopy(clientHtml),
    checkNoUnresolvedPlaceholders(clientHtml, 'the client document'),
    checkNoUnresolvedPlaceholders(fullHtml, 'the full (internal) document'),
    checkNoEmptyTableCells(clientHtml, 'the client document'),
    checkNoEmptyTableCells(fullHtml, 'the full (internal) document'),
    checkBrandTypography(brandCss()),
    checkNoSecretsInCopy(clientHtml, brief, 'the client document'),
    checkNoSecretsInCopy(fullHtml, brief, 'the full (internal) document')
  );
}

// --- POST-RENDER: §13 items 8 and 13, only askable of real PDF bytes ---

function isPdfBuffer(buf) {
  return Buffer.isBuffer(buf) && buf.subarray(0, 5).toString('ascii') === '%PDF-';
}

function checkPdfWatermarkAbsent(pdfBuffer, label) {
  const violations = [];
  const text = pdfBuffer.toString('latin1');
  const patterns = [/pdfshift/i, /created via/i, /powered by/i];
  patterns.forEach(function (p) {
    if (p.test(text)) pushViolation(violations, 'qa-8', label + ' matches vendor watermark pattern ' + p + ' (D8)');
  });
  return violations;
}

function checkPdfOpensAndHasText(pdfBuffer, label) {
  const violations = [];
  if (!isPdfBuffer(pdfBuffer)) {
    pushViolation(violations, 'qa-13', label + ' does not start with a valid %PDF- header');
    return violations;
  }
  if (pdfBuffer.length < 1000) {
    pushViolation(violations, 'qa-13', label + ' is suspiciously small (' + pdfBuffer.length + ' bytes) -- likely not a real rendered document');
  }
  // Text-layer extractability is guaranteed structurally, not re-verified
  // here: the template renders plain HTML text, never a rasterised image
  // (render_document.js's own header comment), and Chromium's PDF export
  // preserves a text layer for real text content by construction. A
  // per-glyph extraction check would need a PDF-parsing dependency this
  // repo deliberately doesn't have -- the same boundary render_pdf.test.js
  // already draws for footer-text assertions.
  return violations;
}

function runPostRenderChecks(clientPdf, fullPdf) {
  return [].concat(
    checkPdfWatermarkAbsent(clientPdf, 'handover-client.pdf'),
    checkPdfWatermarkAbsent(fullPdf, 'handover-full.pdf'),
    checkPdfOpensAndHasText(clientPdf, 'handover-client.pdf'),
    checkPdfOpensAndHasText(fullPdf, 'handover-full.pdf')
  );
}

/**
 * The hard pre-emit block. Validates, builds, and renders a client_brief
 * end to end, refusing to return a PDF if any QA-gate check fails (G10).
 *
 * @param {object} brief - a client_brief (schema/client_brief.schema.json shape).
 * @returns {Promise<
 *   { ok: true, clientPdf: Buffer, fullPdf: Buffer, clientHtml: string, fullHtml: string, deferredChecks: Array } |
 *   { ok: false, stage: 'brief'|'pre-render'|'post-render', failures: Array<{rule: string, message: string}>, deferredChecks: Array }
 * >}
 */
async function generateHandoverPdfs(brief) {
  const briefCheck = validateClientBrief(brief);
  if (!briefCheck.valid) {
    return {
      ok: false,
      stage: 'brief',
      failures: briefCheck.errors.map(function (e) { return { rule: 'schema', message: e.field + ' -- ' + e.message }; }),
      deferredChecks: DEFERRED_CHECKS
    };
  }

  const sectionResults = buildAllSections(brief);
  const clientHtml = renderDocument(brief, sectionResults, { internal: false });
  const fullHtml = renderDocument(brief, sectionResults, { internal: true });

  const preRenderFailures = runPreRenderChecks(brief, sectionResults, { clientHtml: clientHtml, fullHtml: fullHtml });
  if (preRenderFailures.length > 0) {
    return { ok: false, stage: 'pre-render', failures: preRenderFailures, deferredChecks: DEFERRED_CHECKS };
  }

  const { renderBothPdfs } = require('./render_pdf');
  const { client, full } = await renderBothPdfs(brief, sectionResults);

  const postRenderFailures = runPostRenderChecks(client, full);
  if (postRenderFailures.length > 0) {
    return { ok: false, stage: 'post-render', failures: postRenderFailures, deferredChecks: DEFERRED_CHECKS };
  }

  return { ok: true, clientPdf: client, fullPdf: full, clientHtml: clientHtml, fullHtml: fullHtml, deferredChecks: DEFERRED_CHECKS };
}

module.exports = {
  generateHandoverPdfs,
  runPreRenderChecks,
  runPostRenderChecks,
  checkSectionCompleteness,
  checkPlainEnglishAcrossSections,
  checkHonestyAcrossSections,
  checkDuplicateBlocks,
  checkBriefValidity,
  checkStatusConsistency,
  checkDeliveryTier,
  checkNoIsoTimestampInClientCopy,
  checkNoUnresolvedPlaceholders,
  checkNoEmptyTableCells,
  checkBrandTypography,
  checkNoSecretsInCopy,
  checkPdfWatermarkAbsent,
  checkPdfOpensAndHasText,
  diceCoefficient,
  DEFERRED_CHECKS
};
