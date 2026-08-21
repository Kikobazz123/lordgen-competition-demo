// Shared helpers for the section builders (LORDGEN_HANDOVER_GENERATOR_BUILD.md
// §8). Unlike the n8n inline Code nodes elsewhere in this repo, these modules
// run in plain Node and CAN require() each other -- no need to duplicate esc()
// per file the way the live workflows have to.

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function humanDate(iso) {
  if (!iso) return '';

  // A bare YYYY-MM-DD (e.g. meta.issued_date) has no timezone of its own.
  // Routing it through `new Date(iso)` parses it as UTC midnight per the
  // ISO-8601 date-only rule, then .getDate()/.getMonth() read it back in the
  // MACHINE'S local timezone -- west of UTC, that silently shifts the date
  // back a day. It also makes rendering non-deterministic across machines in
  // different timezones, which breaks §4 rule 3 ("same brief in, byte-
  // identical HTML out"). Read the calendar digits directly instead; no
  // Date object, no timezone involved. Full datetimes with their own offset
  // (e.g. approval.decided_at) are unambiguous and keep the Date path below.
  const dateOnly = DATE_ONLY_RE.exec(iso);
  if (dateOnly) {
    return Number(dateOnly[3]) + ' ' + MONTHS[Number(dateOnly[2]) - 1] + ' ' + dateOnly[1];
  }

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
