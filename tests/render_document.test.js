// Step 4 (LORDGEN_HANDOVER_GENERATOR_BUILD.md §15): HTML template + brand
// CSS. Commit-point criteria: "Renders as HTML, brand rules respected."

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { buildAllSections } = require('../tools/sections');
const { renderDocument, TOKENS } = require('../tools/render_document');

const FIXTURE_PATH = path.join(__dirname, '..', 'briefs', 'examples', 'gig-logistics.json');

function loadFixture() {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
}

// --- structure ---

test('renderDocument produces a complete, self-contained HTML document', () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const html = renderDocument(brief, sections);
  assert.match(html, /^<!DOCTYPE html>/);
  assert.match(html, /<html>/);
  assert.match(html, /<style>/);
  assert.match(html, /<\/html>$/);
});

test('rendering is deterministic: the same brief and sections produce byte-identical HTML on repeat calls', () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const a = renderDocument(brief, sections, { internal: true });
  const b = renderDocument(brief, sections, { internal: true });
  assert.equal(a, b);
});

// --- two outputs, one source (§4 rule 4) ---

test('client mode (default) excludes the internal banner and the developer checklist content', () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const html = renderDocument(brief, sections);
  assert.doesNotMatch(html, /Internal &mdash; For Your Developer/);
  assert.doesNotMatch(html, /human approval point remains before production activation/);
});

test('full mode includes the internal banner and the developer checklist content, behind a page-break', () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const html = renderDocument(brief, sections, { internal: true });
  assert.match(html, /Internal &mdash; For Your Developer/);
  assert.match(html, /human approval point remains before production activation/);
  const bannerIndex = html.indexOf('internal-banner');
  const cssIndex = html.indexOf('.internal-banner {');
  assert.ok(bannerIndex > -1 && cssIndex > -1);
  assert.match(html, /\.internal-banner\s*\{[^}]*page-break-before:\s*always/);
});

test('client and full mode share the exact same client-facing section HTML (never a separately maintained document)', () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const clientHtml = renderDocument(brief, sections);
  const fullHtml = renderDocument(brief, sections, { internal: true });
  assert.equal(fullHtml.startsWith(clientHtml.replace('</body></html>', '')), true);
});

// --- brand rules (§12) ---

test('brand CSS uses the confirmed token values', () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const html = renderDocument(brief, sections);
  assert.match(html, new RegExp(TOKENS.ink));
  assert.match(html, new RegExp(TOKENS.graphite));
  assert.match(html, new RegExp(TOKENS.gold));
  assert.match(html, new RegExp(TOKENS.leaf));
  assert.match(html, new RegExp(TOKENS.brass));
});

test('the flow diagram is left-aligned, not centred (§12: "never centred or justified" -- fixed vs. the live n8n template)', () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const html = renderDocument(brief, sections);
  const flowRule = html.match(/\.flow\s*\{[^}]*\}/)[0];
  assert.match(flowRule, /text-align:\s*left/);
  assert.doesNotMatch(flowRule, /text-align:\s*center/);
});

test('print discipline: headings and tables carry break-avoid rules (§12: never orphaned / never split across pages)', () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const html = renderDocument(brief, sections);
  assert.match(html, /\.section h2\s*\{[^}]*break-after:\s*avoid-page/);
  assert.match(html, /table\s*\{[^}]*break-inside:\s*avoid/);
});

// --- cover ---

test('cover renders ref, human-readable issued date, version, business name, contact, and preparer', () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const html = renderDocument(brief, sections);
  assert.match(html, /LG-20260821-GIGLOGISTICS-01/);
  assert.match(html, /21 August 2026/); // humanDate(meta.issued_date), never the raw ISO
  assert.doesNotMatch(html, /2026-08-21/); // raw ISO must not leak into the cover
  assert.match(html, /Dispatch Capture and Confirmation -- GIG Logistics/); // build.what_was_created
  assert.match(html, /Chidi Okafor/);
  assert.match(html, /Operations Manager/);
  assert.match(html, /zaxellimited360@gmail\.com/);
});

// --- footer ---

test('footer carries meta.ref', () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  const html = renderDocument(brief, sections);
  const footer = html.match(/<div class="footer">[\s\S]*?<\/div>/)[0];
  assert.match(footer, /LG-20260821-GIGLOGISTICS-01/);
});

// --- security (G5/QA-gate-12) ---

test('the approval token never appears in either output mode', () => {
  const brief = loadFixture();
  const sections = buildAllSections(brief);
  assert.equal(renderDocument(brief, sections).includes(brief.approval.token), false);
  assert.equal(renderDocument(brief, sections, { internal: true }).includes(brief.approval.token), false);
});
