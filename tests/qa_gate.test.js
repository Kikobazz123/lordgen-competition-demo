// Step 6 (LORDGEN_HANDOVER_GENERATOR_BUILD.md §15): QA gate wired as a hard
// pre-emit block. Commit-point criteria: "Bad brief cannot produce a PDF."
// Most checks here are pure/sync and run against hand-built fixtures for
// precise control (matching the direct-unit-test style already used by
// tests/gates_*.test.js and tests/sections.test.js); the full
// generateHandoverPdfs() pipeline is exercised end to end against the real
// GIG Logistics fixture, same as tests/render_pdf.test.js -- slower (real
// Playwright/Chromium), still fast enough to run every time.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  generateHandoverPdfs,
  runPreRenderChecks,
  checkSectionCompleteness,
  checkDuplicateBlocks,
  checkNoIsoTimestampInClientCopy,
  checkNoUnresolvedPlaceholders,
  checkNoEmptyTableCells,
  checkBrandTypography,
  checkNoSecretsInCopy,
  checkPdfWatermarkAbsent,
  checkPdfOpensAndHasText,
  diceCoefficient,
  DEFERRED_CHECKS
} = require('../tools/qa_gate');
const { buildAllSections } = require('../tools/sections');
const { renderDocument, brandCss } = require('../tools/render_document');

const gigFixture = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'briefs', 'examples', 'gig-logistics.json'), 'utf8'));

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function fakeSection(id, text, internal) {
  return { id: id, heading: id, html: '<div>' + text + '</div>', text: text, internal: !!internal };
}

// --- honest self-reporting: this module states what it does NOT cover ---

test('DEFERRED_CHECKS names the two §13 items that need Steps 9/10, not built yet', () => {
  const rules = DEFERRED_CHECKS.map((d) => d.rule);
  assert.ok(rules.includes('qa-15'));
  assert.ok(rules.includes('qa-16'));
  DEFERRED_CHECKS.forEach((d) => assert.ok(d.reason && d.reason.length > 0));
});

// --- §13 item 1: section completeness ---

test('checkSectionCompleteness passes a well-formed 13-section, 1-internal set', () => {
  const sections = buildAllSections(gigFixture);
  assert.deepEqual(checkSectionCompleteness(sections), []);
});

test('checkSectionCompleteness rejects the wrong section count', () => {
  const violations = checkSectionCompleteness([fakeSection('only-one', 'Some text here that is long enough.')]);
  assert.ok(violations.some((v) => v.rule === 'qa-1' && v.message.includes('13')));
});

test('checkSectionCompleteness rejects an internal section in the wrong position', () => {
  const sections = buildAllSections(gigFixture).map((s) => Object.assign({}, s));
  sections[10].internal = false; // move internal off its required slot
  sections[0].internal = true;
  const violations = checkSectionCompleteness(sections);
  assert.ok(violations.some((v) => v.rule === 'qa-1' && v.message.includes('position 11')));
});

// --- §13 item 3: duplicate-block detection (D4/D16) ---

test('checkDuplicateBlocks flags a near-identical sentence repeated across two sections', () => {
  const sentence = 'Handover to your developer means sending the workflow export and the environment variables it needs.';
  const sections = [
    fakeSection('support', sentence),
    fakeSection('developer-checklist', sentence.replace('sending', 'sharing'), true)
  ];
  const violations = checkDuplicateBlocks(sections);
  assert.ok(violations.some((v) => v.rule === 'qa-3'));
});

test('checkDuplicateBlocks does not flag two unrelated long sentences', () => {
  const sections = [
    fakeSection('a', 'The dispatch form captures every new order the moment a customer submits it online.'),
    fakeSection('b', 'Support covers defects only, for fourteen days, starting from the day the build goes live.')
  ];
  assert.deepEqual(checkDuplicateBlocks(sections), []);
});

test('checkDuplicateBlocks ignores short boilerplate sentences below the word-count floor', () => {
  const sections = [fakeSection('a', 'Thank you.'), fakeSection('b', 'Thank you.')];
  assert.deepEqual(checkDuplicateBlocks(sections), []);
});

test('diceCoefficient scores an exact repeat at 1 and unrelated text well under the 0.9 gate threshold', () => {
  const s = 'This is a reasonably long sentence used only to test similarity.';
  assert.equal(diceCoefficient(s, s), 1);
  assert.ok(diceCoefficient(s, 'Completely different words about a totally separate topic here.') < 0.9);
});

// --- §13 item 7: ISO timestamps allowed internally, not in client copy (D7) ---

test('checkNoIsoTimestampInClientCopy rejects an ISO stamp in client HTML', () => {
  const violations = checkNoIsoTimestampInClientCopy('<p>Issued 2026-08-20T16:49:44.391Z</p>');
  assert.ok(violations.some((v) => v.rule === 'qa-7'));
});

test('checkNoIsoTimestampInClientCopy passes plain human-readable dates', () => {
  assert.deepEqual(checkNoIsoTimestampInClientCopy('<p>Issued 20 August 2026</p>'), []);
});

// --- §13 item 9: unresolved placeholders ---

test('checkNoUnresolvedPlaceholders catches each placeholder shape', () => {
  ['[BUSINESS NAME]', '[CATEGORY]', 'TBD', 'lorem ipsum', 'value is null', 'value is undefined'].forEach((bad) => {
    const violations = checkNoUnresolvedPlaceholders('<p>' + bad + '</p>', 'the document');
    assert.ok(violations.length > 0, 'expected a violation for: ' + bad);
  });
});

test('checkNoUnresolvedPlaceholders passes clean resolved copy', () => {
  assert.deepEqual(checkNoUnresolvedPlaceholders('<p>GIG Logistics, Logistics and delivery</p>', 'the document'), []);
});

// --- §13 item 10: no empty table cells ---

test('checkNoEmptyTableCells catches an empty cell, including one with only &nbsp;', () => {
  assert.ok(checkNoEmptyTableCells('<table><tr><td></td></tr></table>', 'doc').length > 0);
  assert.ok(checkNoEmptyTableCells('<table><tr><td>&nbsp;</td></tr></table>', 'doc').length > 0);
});

test('checkNoEmptyTableCells passes a fully populated table', () => {
  assert.deepEqual(checkNoEmptyTableCells('<table><tr><td>Order form</td></tr></table>', 'doc'), []);
});

// --- §13 item 11: brand CSS regression guard ---

test('checkBrandTypography passes the real, shipped brand CSS', () => {
  assert.deepEqual(checkBrandTypography(brandCss()), []);
});

test('checkBrandTypography rejects centred body text', () => {
  const violations = checkBrandTypography('.section p { text-align: center; }');
  assert.ok(violations.some((v) => v.rule === 'qa-11'));
});

test('checkBrandTypography rejects a gold background behind body text', () => {
  const violations = checkBrandTypography('td { background: #C9A24B; }');
  assert.ok(violations.some((v) => v.rule === 'qa-11' && v.message.includes('gold background')));
});

// --- §13 item 12: no credentials/tokens/secret-shaped strings, in either document ---

test('checkNoSecretsInCopy flags the real approval token if it leaks into copy', () => {
  const brief = { approval: { token: 'tok_9f8e7d6c5b4a3210' } };
  const violations = checkNoSecretsInCopy('<p>Your link: tok_9f8e7d6c5b4a3210</p>', brief, 'the client document');
  assert.ok(violations.some((v) => v.rule === 'qa-12' && v.message.includes('approval token')));
});

test('checkNoSecretsInCopy flags a generic long opaque token even without a brief token field', () => {
  const violations = checkNoSecretsInCopy('<p>Key: aB3dE9fG2hJ5kL8mN1oP4qR7sT0uVwXyZabcdef</p>', {}, 'the client document');
  assert.ok(violations.some((v) => v.rule === 'qa-12'));
});

test('checkNoSecretsInCopy passes ordinary copy, including the document reference number', () => {
  const brief = { approval: { token: 'tok_9f8e7d6c5b4a3210' } };
  assert.deepEqual(checkNoSecretsInCopy('<p>Ref LG-20260820-GIGLOGISTICS-01</p>', brief, 'the client document'), []);
});

// --- §13 items 8, 13: PDF-level checks (unit-level, no real render needed) ---

test('checkPdfWatermarkAbsent flags the known PDFShift free-tier stamp (D8)', () => {
  const fakePdf = Buffer.from('%PDF-1.4 ... Created via PDFShift ...', 'latin1');
  const violations = checkPdfWatermarkAbsent(fakePdf, 'handover-client.pdf');
  assert.ok(violations.some((v) => v.rule === 'qa-8'));
});

test('checkPdfOpensAndHasText rejects a buffer with no %PDF- header', () => {
  const violations = checkPdfOpensAndHasText(Buffer.from('not a pdf'), 'handover-client.pdf');
  assert.ok(violations.some((v) => v.rule === 'qa-13'));
});

// --- runPreRenderChecks: the real GIG fixture end to end (still no Playwright) ---

test('runPreRenderChecks passes the real, valid GIG Logistics fixture with zero violations', () => {
  const sections = buildAllSections(gigFixture);
  const clientHtml = renderDocument(gigFixture, sections, { internal: false });
  const fullHtml = renderDocument(gigFixture, sections, { internal: true });
  const failures = runPreRenderChecks(gigFixture, sections, { clientHtml, fullHtml });
  assert.deepEqual(failures, []);
});

test('runPreRenderChecks fails when the underlying brief itself is invalid (schema errors surface through the gate too)', () => {
  const brief = clone(gigFixture);
  brief.approval.state = 'requested'; // H4 defect: decided_at/decided_by still populated
  const sections = buildAllSections(brief);
  const clientHtml = renderDocument(brief, sections, { internal: false });
  const fullHtml = renderDocument(brief, sections, { internal: true });
  const failures = runPreRenderChecks(brief, sections, { clientHtml, fullHtml });
  assert.ok(failures.some((f) => f.rule === 'qa-4-5-6-brief-schema' && f.message.includes('H4')));
});

// --- generateHandoverPdfs: the full hard pre-emit block ---

test('generateHandoverPdfs refuses to render anything for an invalid brief -- "bad brief cannot produce a PDF"', async () => {
  const brief = clone(gigFixture);
  delete brief.business.what_they_do; // required field, §1's empty state is "fail validation"
  const result = await generateHandoverPdfs(brief);
  assert.equal(result.ok, false);
  assert.equal(result.stage, 'brief');
  assert.equal('clientPdf' in result, false);
  assert.equal('fullPdf' in result, false);
});

test('generateHandoverPdfs produces both real, valid, watermark-free PDFs for the real GIG fixture', async () => {
  const result = await generateHandoverPdfs(gigFixture);
  assert.equal(result.ok, true);
  assert.equal(result.clientPdf.subarray(0, 5).toString('ascii'), '%PDF-');
  assert.equal(result.fullPdf.subarray(0, 5).toString('ascii'), '%PDF-');
  assert.doesNotMatch(result.clientPdf.toString('latin1'), /pdfshift/i);
  assert.ok(Array.isArray(result.deferredChecks) && result.deferredChecks.length > 0);
});
