// Step 4 -- HTML template + brand CSS. LORDGEN_HANDOVER_GENERATOR_BUILD.md
// §12 (tokens/rendering rules), §15 Step 4 ("Renders as HTML, brand rules
// respected"), §7 (document order), §4 rule 4 ("two outputs, one source").
//
// Assembles tools/sections' 13 builder outputs plus a cover into one full
// HTML document. Deterministic: never reads the system clock -- every date
// comes from a brief field (meta.issued_date), so the same brief always
// produces byte-identical HTML (§4 rule 3).
//
// BRAND DIRECTION -- confirmed with the developer 2026-08-21: keep the
// light-page style already shipped and tested in the live n8n pipeline (dark
// ink header/footer band, light bone body, gold/brass as thin accents,
// Georgia serif body / Helvetica labels) rather than BUILD.md §12's literal
// "ink ~80% of any surface, Archivo throughout" reading, which would invert
// the whole document to a near-black background. This module formalises
// that already-proven CSS into one place instead of the 3 duplicated inline
// copies in the live n8n Code nodes (Issue Proposal's Build Proposal
// Content, Handover's Build Ready Email / Build Developer Review Email) --
// it does not yet replace those inline copies, since n8n's sandbox can't
// require() this file (same constraint noted in tools/gates/*.js).
//
// Two deliberate brand-rule fixes applied here that the live copies don't
// have, since "brand rules respected" is this step's own commit criterion:
// - The flow diagram (§3) is left-aligned, not centred -- §12: "type flush
//   left, never centred or justified."
// - Headings and tables carry break-avoid rules -- §12: "headings never
//   orphaned from their content · tables never split across pages."
// Not applied: the Archivo font family and its 800/600/400 weight system.
// Kept Helvetica/Georgia to stay maximally consistent with what's already
// shipped, per the developer's stated direction -- flagging this explicitly
// so it's a visible, correctable simplification rather than a silent one.
//
// UPDATE from Step 5: local rendering is confirmed (Playwright/Chromium,
// tools/render_pdf.js), and the CSS Paged Media @page margin-box syntax this
// module originally used for the footer's page counter turned out to be
// dead in Chromium -- confirmed by rendering a real PDF and inspecting it,
// not a guess. Chromium's print engine doesn't implement @top-*/@bottom-*
// margin-box content (only Prince/WeasyPrint do). The "page n of m" footer
// (BUILD.md §12) is implemented in tools/render_pdf.js instead, via
// Playwright's own displayHeaderFooter/footerTemplate option, which runs on
// every page -- the renderer's job, not the HTML template's, per the
// service-boundary rule above. This module no longer renders any footer of
// its own (a static one here plus a real per-page one from the renderer
// would duplicate meta.ref on the last page -- BUILD.md's own D4 territory).
//
// PDF text-layer extractability: satisfied by construction (this is plain
// HTML text, never a rasterised image) -- confirmed for real in Step 5.

const { esc, humanDate } = require('./sections/_util');

const TOKENS = {
  ink: '#0A0A09',
  graphite: '#141312',
  gold: '#C9A24B',
  leaf: '#F0E2BC',
  brass: '#8A6A24',
  bone: '#E8E6E1',
  slate: '#8C8A85'
};

const SANS = 'Helvetica, Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

function brandCss() {
  return '' +
    '@page { size: A4; margin: 0; }' +
    'body { margin:0; font-family: ' + SERIF + '; color:' + TOKENS.graphite + '; background:' + TOKENS.bone + '; }' +
    '.wrap { padding: 40px 56px; }' +
    '.header { background:' + TOKENS.ink + '; color:' + TOKENS.bone + '; padding:32px 56px; }' +
    '.brand { font-family: ' + SANS + '; letter-spacing: 3px; font-size: 12px; text-transform: uppercase; color:' + TOKENS.gold + '; margin:0 0 12px 0; }' +
    '.title { font-size: 22px; margin:0; color:' + TOKENS.leaf + '; }' +
    '.docmeta { font-family: ' + SANS + '; font-size: 10px; color:' + TOKENS.slate + '; margin-top:10px; }' +
    '.rule { height:2px; background:' + TOKENS.gold + '; margin:0; }' +
    '.section { margin: 20px 0; break-inside: auto; }' +
    '.section h2 { font-family: ' + SANS + '; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color:' + TOKENS.brass + '; border-bottom: 1px solid ' + TOKENS.gold + '; padding-bottom: 6px; margin-bottom: 10px;' +
    '  break-after: avoid-page; page-break-after: avoid;' +
    '  break-inside: avoid; page-break-inside: avoid; }' +
    '.section p, .section li, .section td { font-size: 12.5px; line-height: 1.6; color:' + TOKENS.graphite + '; text-align: left; }' +
    // §12: "type flush left, never centred or justified" -- the live n8n
    // template centres this element; fixed here.
    '.flow { font-size: 13px; line-height: 2; text-align: left; padding: 12px; background: ' + TOKENS.leaf + '; border-left: 3px solid ' + TOKENS.brass + '; }' +
    'table { width:100%; border-collapse: collapse; font-family: ' + SANS + ';' +
    '  break-inside: avoid; page-break-inside: avoid; }' + // §12: "tables never split across pages"
    'th { text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:' + TOKENS.brass + '; border-bottom:1px solid ' + TOKENS.gold + '; padding:5px 6px; }' +
    'td { border-bottom:1px solid ' + TOKENS.slate + '; padding:5px 6px; font-size:11.5px; text-align: left; }' +
    '.approved { background:' + TOKENS.graphite + '; color:' + TOKENS.bone + '; padding:12px 20px; border-left:4px solid ' + TOKENS.gold + '; font-family: ' + SANS + '; font-size: 12.5px; }' +
    '.internal-banner { background:' + TOKENS.brass + '; color:' + TOKENS.ink + '; font-family: ' + SANS + '; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; text-align:center; padding: 10px; page-break-before: always; break-before: page; }' +
    '.internal .section td, .internal .section li, .internal .section p { font-family: ' + SANS + '; }';
}

function renderCover(brief) {
  const meta = brief.meta;
  const client = brief.client;
  const title = brief.build.what_was_created;

  const preparedFor = esc(client.business_name) +
    (client.contact_name ? (' -- ' + esc(client.contact_name) + (client.contact_role ? (', ' + esc(client.contact_role)) : '')) : '');

  return '' +
    '<div class="header">' +
    '<p class="brand">LordGen AI -- Handover Pack</p>' +
    '<h1 class="title">' + esc(title) + '</h1>' +
    '<div class="docmeta">Ref ' + esc(meta.ref) + ' &nbsp;&middot;&nbsp; Issued ' + esc(humanDate(meta.issued_date)) + ' &nbsp;&middot;&nbsp; Version ' + esc(meta.version) + '<br>' +
    'Prepared for ' + preparedFor + ' &nbsp;&middot;&nbsp; Prepared by ' + esc(meta.prepared_by) + ', ' + esc(meta.reply_to) +
    '</div></div><div class="rule"></div>';
}

/**
 * @param {object} brief - a client_brief already validated against
 *   schema/client_brief.schema.json.
 * @param {Array<object>} sectionResults - the array from
 *   tools/sections.buildAllSections(brief).
 * @param {object} [options]
 * @param {boolean} [options.internal] - true for handover-full.html (client
 *   sections + the internal developer pack behind a page-break/banner);
 *   false or omitted for handover-client.html (client sections only). Both
 *   read the exact same sectionResults array -- "two outputs, one source"
 *   (§4 rule 4), never a separately maintained document.
 * @returns {string} a complete, self-contained HTML document.
 */
function renderDocument(brief, sectionResults, options) {
  const includeInternal = !!(options && options.internal);

  const clientHtml = sectionResults.filter((s) => !s.internal).map((s) => s.html).join('');
  const internalSection = sectionResults.find((s) => s.internal);

  const internalHtml = (includeInternal && internalSection)
    ? '<div class="internal-banner">Internal &mdash; For Your Developer</div><div class="wrap internal">' + internalSection.html + '</div>'
    : '';

  return '' +
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<title>' + esc(brief.meta.ref) + '</title>' +
    '<style>' + brandCss() + '</style>' +
    '</head><body>' +
    renderCover(brief) +
    '<div class="wrap">' + clientHtml + '</div>' +
    internalHtml +
    '</body></html>';
}

module.exports = { renderDocument, renderCover, brandCss, TOKENS };
