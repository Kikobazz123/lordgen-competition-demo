// Plain-English gate — LORDGEN_HANDOVER_GENERATOR_BUILD.md §9.
// Runs on client-facing text. Fails on any unglossed banned term, an ISO
// timestamp, or a sentence over 25 words. The "gloss exception" (a banned
// term is allowed if the same sentence explains it in plain English, and the
// brief explicitly allows that term) is a real but inherently fuzzy check --
// implemented as a length/marker heuristic, not true language understanding.
// Treat a pass under the gloss exception as a hint to double check by eye,
// not a guarantee.

const CORE_BANNED = ['api', 'webhook', 'n8n', 'node', 'json', 'credentials', 'database', 'oauth', 'endpoint'];
const OBSERVED_BANNED = [
  'stubbed', 'payload', 'schema', 'parse', 'deploy', 'repo', 'sandbox', 'staging', 'instance',
  'sync', 'backend', 'integration', 'workflow json', 'credential owner',
  'vercel', 'supabase', 'pdfshift', 'make.com', 'zapier', 'hubspot'
];
const ALL_BANNED = CORE_BANNED.concat(OBSERVED_BANNED);

const ISO_TIMESTAMP_RE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const MAX_SENTENCE_WORDS = 25;
// A sentence "glosses" a term if it's long enough to plausibly contain an
// explanation, or contains an explicit explanation marker. This is a
// deliberately narrow heuristic -- it is not proof the explanation is any good.
const GLOSS_MARKER_RE = /\b(meaning|in other words|that is|i\.e\.|which means)\b/i;
const GLOSS_MIN_WORDS = 12;

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}
function wordCount(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
function wordBoundaryRegex(term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b' + escaped + '\\b', 'i');
}

/**
 * @param {string} text - client-facing text to check (may be multiple sentences)
 * @param {object} [options]
 * @param {string[]} [options.allowWithGloss] - terms from ALL_BANNED that may
 *   appear if their sentence looks glossed (see GLOSS_MARKER_RE/GLOSS_MIN_WORDS)
 * @returns {{ pass: boolean, violations: Array<{type: string, term?: string, sentence?: string, message: string}> }}
 */
function checkPlainEnglish(text, options) {
  const opts = options || {};
  const allowWithGloss = opts.allowWithGloss || [];
  const violations = [];

  if (typeof text !== 'string' || text.trim() === '') {
    return { pass: true, violations: [] };
  }

  const sentences = splitSentences(text);

  for (const sentence of sentences) {
    for (const term of ALL_BANNED) {
      if (!wordBoundaryRegex(term).test(sentence)) continue;

      const isAllowedTerm = allowWithGloss.some(function (t) { return t.toLowerCase() === term; });
      const looksGlossed = isAllowedTerm && (GLOSS_MARKER_RE.test(sentence) || wordCount(sentence) >= GLOSS_MIN_WORDS);

      if (!looksGlossed) {
        violations.push({
          type: 'banned_term',
          term: term,
          sentence: sentence,
          message: 'banned term "' + term + '" in: "' + sentence + '"' + (isAllowedTerm ? ' (allowed with gloss, but this sentence does not read as glossed)' : '')
        });
      }
    }

    if (ISO_TIMESTAMP_RE.test(sentence)) {
      violations.push({ type: 'iso_timestamp', sentence: sentence, message: 'ISO timestamp in client copy: "' + sentence + '"' });
    }

    const wc = wordCount(sentence);
    if (wc > MAX_SENTENCE_WORDS) {
      violations.push({ type: 'long_sentence', sentence: sentence, message: 'sentence is ' + wc + ' words (max ' + MAX_SENTENCE_WORDS + '): "' + sentence + '"' });
    }
  }

  return { pass: violations.length === 0, violations: violations };
}

module.exports = { checkPlainEnglish, ALL_BANNED, CORE_BANNED, OBSERVED_BANNED };
