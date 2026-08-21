// Step 5 (LORDGEN_HANDOVER_GENERATOR_BUILD.md §15): renderer adapter.
// Commit-point criteria: "Both PDFs emit." Uses the real Playwright/Chromium
// renderer (this repo's first npm dependency) -- these tests actually launch
// a browser and produce real PDF bytes, not a mock. Slower than the rest of
// the suite for that reason; still fast enough (a few seconds) to run every
// time, not worth a separate opt-in flag.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { buildAllSections } = require('../tools/sections');
const { renderDocument } = require('../tools/render_document');
const { renderPdf, renderBothPdfs, footerTemplate } = require('../tools/render_pdf');

const FIXTURE_PATH = path.join(__dirname, '..', 'briefs', 'examples', 'gig-logistics.json');

function loadFixture() {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
}

function isPdf(buf) {
  return Buffer.isBuffer(buf) && buf.subarray(0, 5).toString('ascii') === '%PDF-';
}

// --- footerTemplate: the page-n-of-m fix, unit-tested directly ---
// (Asserting on real PDF page-footer TEXT would need a PDF text-extraction
// dependency this repo doesn't otherwise need. What's actually testable
// without one is the contract Playwright reads: does the template name the
// ref, and does it use Playwright's own pageNumber/totalPages classes.)

test('footerTemplate names the ref and uses Playwright\'s pageNumber/totalPages classes', () => {
  const html = footerTemplate('LG-20260821-GIGLOGISTICS-01');
  assert.match(html, /LG-20260821-GIGLOGISTICS-01/);
  assert.match(html, /class="pageNumber"/);
  assert.match(html, /class="totalPages"/);
});

test('footerTemplate degrades safely with no ref', () => {
  const html = footerTemplate('');
  assert.match(html, /class="pageNumber"/);
  assert.doesNotMatch(html, /Ref\s*&middot;/); // no dangling "Ref ·" with nothing after it
});

// --- renderPdf: real PDF bytes, no watermark, no external service ---

test('renderPdf produces real PDF bytes from a rendered document', async () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const html = renderDocument(brief, sections, { internal: true });
  const pdf = await renderPdf(html, { ref: brief.meta.ref });
  assert.equal(isPdf(pdf), true);
  assert.ok(pdf.length > 10000, 'expected a non-trivial PDF, got ' + pdf.length + ' bytes');
});

test('renderPdf output carries no vendor watermark string (BUILD.md D8 -- PDFShift free tier stamps "Created via PDFShift")', async () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const html = renderDocument(brief, sections, { internal: true });
  const pdf = await renderPdf(html, { ref: brief.meta.ref });
  const text = pdf.toString('latin1');
  assert.doesNotMatch(text, /pdfshift/i);
  assert.doesNotMatch(text, /created via/i);
  assert.doesNotMatch(text, /powered by/i);
});

test('renderPdf output never carries the approval token, even at the PDF-bytes level (G5/QA-gate-12)', async () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const html = renderDocument(brief, sections, { internal: true });
  const pdf = await renderPdf(html, { ref: brief.meta.ref });
  assert.equal(pdf.toString('latin1').includes(brief.approval.token), false);
});

// --- renderBothPdfs: two outputs, one source, now true at the PDF layer too ---

test('renderBothPdfs emits two distinct, valid PDFs from the same brief and sections (§4 rule 4)', async () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const { client, full } = await renderBothPdfs(brief, sections);
  assert.equal(isPdf(client), true);
  assert.equal(isPdf(full), true);
  // full has an extra internal page behind a forced page-break -- it must
  // be meaningfully larger, not byte-identical to client.
  assert.ok(full.length > client.length, 'expected full.pdf (' + full.length + ' bytes) > client.pdf (' + client.length + ' bytes)');
});
