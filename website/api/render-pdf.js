// Free, self-hosted replacement for PDFShift (website/api/render-pdf.js).
//
// PDFShift's free tier stamps a watermark on every rendered PDF -- confirmed
// live on both the Proposal and Handover Packs. Paying for a PDFShift plan
// was explicitly ruled out. n8n has no native HTML->PDF node (confirmed via
// search_nodes), so the fix has to be a small renderer of our own.
//
// Reuses the exact rendering approach already built and verified watermark-
// free this session in tools/render_pdf.js (page-by-page PDF inspection),
// adapted for Vercel's serverless environment: `playwright-core` (no bundled
// browser -- too large for serverless deploy limits) driving the Chromium
// binary `@sparticuz/chromium` packages specifically for AWS Lambda/Vercel.
//
// Same relay pattern as trigger-demo.js/decision.js: n8n's HTTP Request
// nodes call this same-origin-to-Vercel endpoint with a header-auth token
// (PDF_RENDER_TOKEN), server-side only, never exposed to a browser.

// Real, live failure confirmed on this deployment (not guessed): Chromium
// exited with "libnss3.so: cannot open shared object file". Read
// node_modules/@sparticuz/chromium/build/index.js and helper.js directly to
// find why: the package only inflates its bundled shared-library tarball
// (al2023.tar.br, which contains libnss3.so and friends) and sets
// LD_LIBRARY_PATH when isRunningInAwsLambda()/isRunningInAwsLambdaNode20()
// detects AWS_EXECUTION_ENV or AWS_LAMBDA_JS_RUNTIME -- checked once, at
// module load. Vercel's Node runtime sets neither, so on Vercel that
// extraction never runs and the .so files never reach disk at all; setting
// LD_LIBRARY_PATH from inside the handler (this file's first attempt at this
// fix) pointed at a directory that was always empty. This line must run
// BEFORE the require() below, since the detection is a top-level check that
// only runs once at first import.
process.env.AWS_LAMBDA_JS_RUNTIME ??= 'nodejs20.x';

const chromium = require('@sparticuz/chromium');
const { chromium: playwrightChromium } = require('playwright-core');

const HEADER_NAME = 'x-lordgen-demo-token';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const expectedToken = process.env.PDF_RENDER_TOKEN;
  const providedToken = req.headers[HEADER_NAME];
  if (!expectedToken || providedToken !== expectedToken) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const html = typeof body.source === 'string' ? body.source : (typeof body.html === 'string' ? body.html : '');
  if (!html) {
    res.status(400).json({ error: 'source (HTML string) is required' });
    return;
  }

  let browser;
  try {
    browser = await playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).end(pdf);
  } catch (err) {
    res.status(502).json({ error: 'PDF rendering failed', detail: String((err && err.message) || err) });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
