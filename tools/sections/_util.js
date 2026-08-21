// Shared helpers for the section builders (LORDGEN_HANDOVER_GENERATOR_BUILD.md
// §8). Unlike the n8n inline Code nodes elsewhere in this repo, these modules
// run in plain Node and CAN require() each other -- no need to duplicate esc()
// per file the way the live workflows have to.

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function humanDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}

// Derives a plain-text rendering from an HTML fragment, for gate-checking
// (checkPlainEnglish/checkHonesty operate on text, not markup -- an unstripped
// tag wouldn't trip a banned-term match, but would corrupt sentence/word
// splitting). Good enough for the fragment shapes these builders emit
// (headings, paragraphs, list items, table cells); not a general HTML parser.
function stripTags(html) {
  return String(html || '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|li|tr|td|th|div|h[1-6])>/gi, '. ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/(\.\s*){2,}/g, '. ')
    .trim();
}

function section(id, heading, bodyHtml) {
  const html = '<div class="section" id="' + esc(id) + '"><h2>' + esc(heading) + '</h2>' + bodyHtml + '</div>';
  return { id: id, heading: heading, html: html, text: (heading + '. ' + stripTags(bodyHtml)).trim() };
}

module.exports = { esc, humanDate, stripTags, section };
