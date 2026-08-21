// Step 5 -- renderer adapter. LORDGEN_HANDOVER_GENERATOR_BUILD.md §15 Step 5
// ("Renderer adapter, env-configured, no watermark | Both PDFs emit"), §12
// ("must not stamp the output"), §4 ("HTML→PDF rendering is a service
// boundary: one adapter module, swappable, configured by env var. Do not
// couple section building to the renderer.").
//
// Local rendering via Playwright/Chromium -- confirmed with the developer
// 2026-08-21 in preference to the live pipeline's PDFShift free tier, which
// BUILD.md D8 flags as a defect (its watermark prints on every client PDF).
// This is this repo's first npm dependency: schema validation, gates,
// section builders, and the HTML template are all hand-rolled specifically
// to avoid one (see tools/validate_client_brief.js's own header comment);
// Playwright is the one thing genuinely irreplaceable for local,
// watermark-free HTML->PDF rendering with real CSS support. Nothing in
// tools/sections/ or tools/render_document.js imports this module or
// Playwright -- the service-boundary rule above holds.
//
// §12's "Configure via PDF_RENDER_URL / PDF_API_KEY from env" was written
// for an HTTP-service renderer (PDFShift's own pattern: a URL + API key).
// Local rendering has no external endpoint or credential at all -- Chromium
// runs as a local subprocess -- so those two env vars don't apply here.
// Deliberate, not a silently dropped requirement.
//
// The "page n of m" footer (§12) does NOT come from tools/render_document.js
// -- confirmed by actually rendering a PDF and inspecting it, Chromium's
// print engine doesn't implement the CSS Paged Media @page margin-box syntax
// that would need (only Prince/WeasyPrint do). It's implemented here instead
// via Playwright's own displayHeaderFooter/footerTemplate option, which
// Chromium DOES support and which repeats on every page for real.

const { chromium } = require('playwright');
const { TOKENS } = require('./render_document');

const FOOTER_STYLE = 'font-family: Helvetica, Arial, sans-serif; font-size: 8px; color: ' + TOKENS.slate + '; width: 100%; text-align: center; padding: 0 56px; -webkit-print-color-adjust: exact;';

function escFooter(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * The running footer template. Exported on its own so its content can be
 * unit-tested directly -- asserting on real PDF page-footer text would
 * require a PDF text-extraction dependency this repo doesn't otherwise
 * need, so the contract tested is "this HTML string names the ref and uses
 * Playwright's own pageNumber/totalPages classes," which is what Chromium
 * actually reads.
 *
 * @param {string} ref - meta.ref.
 * @returns {string} an HTML fragment for Playwright's footerTemplate option.
 */
function footerTemplate(ref) {
  return '<div style="' + FOOTER_STYLE + '">' +
    (ref ? ('Ref ' + escFooter(ref) + ' &middot; ') : '') +
    'Page <span class="pageNumber"></span> of <span class="totalPages"></span>' +
    '</div>';
}

/**
 * Renders one complete HTML document (from tools/render_document.js's
 * renderDocument()) to PDF bytes.
 *
 * @param {string} html - a complete document.
 * @param {object} [options]
 * @param {string} [options.ref] - meta.ref, shown in the running footer.
 * @returns {Promise<Buffer>} PDF file bytes.
 */
async function renderPdf(html, options) {
  const ref = (options && options.ref) || '';
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>', // empty -- the brief's own cover already carries the header band
      footerTemplate: footerTemplate(ref),
      margin: { top: '0', bottom: '30px', left: '0', right: '0' }
    });
  } finally {
    await browser.close();
  }
}

/**
 * Renders both outputs from one brief and one section-builder result --
 * "two outputs, one source" (§4 rule 4), never a separately maintained
 * document, now true at the PDF layer as well as the HTML layer.
 *
 * @param {object} brief - a client_brief already validated against
 *   schema/client_brief.schema.json.
 * @param {Array<object>} sectionResults - from
 *   tools/sections.buildAllSections(brief).
 * @returns {Promise<{client: Buffer, full: Buffer}>}
 */
async function renderBothPdfs(brief, sectionResults) {
  const { renderDocument } = require('./render_document');
  const ref = brief.meta.ref;
  const clientHtml = renderDocument(brief, sectionResults, { internal: false });
  const fullHtml = renderDocument(brief, sectionResults, { internal: true });
  const [client, full] = await Promise.all([
    renderPdf(clientHtml, { ref: ref }),
    renderPdf(fullHtml, { ref: ref })
  ]);
  return { client: client, full: full };
}

module.exports = { renderPdf, renderBothPdfs, footerTemplate };
