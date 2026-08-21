// Run with: node --test tests/gates_plain_english.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { checkPlainEnglish } = require('../tools/gates/plain_english');

test('BUILD.md §9 worked example: the banned-vocabulary sentence fails', () => {
  const result = checkPlainEnglish('n8n receives the dispatch details from the order form.');
  assert.equal(result.pass, false);
  assert.ok(result.violations.some((v) => v.type === 'banned_term' && v.term === 'n8n'));
});

test('BUILD.md §9 worked example: the plain-English rewrite passes', () => {
  const result = checkPlainEnglish('Your order form sends us the details automatically.');
  assert.equal(result.pass, true);
  assert.deepEqual(result.violations, []);
});

test('flags each core banned term (§9 exact list)', () => {
  const terms = ['API', 'webhook', 'n8n', 'node', 'JSON', 'credentials', 'database', 'OAuth', 'endpoint'];
  for (const term of terms) {
    const result = checkPlainEnglish('This uses ' + term + ' to work.');
    assert.equal(result.pass, false, term + ' should be banned');
  }
});

test('flags observed-defect terms: stubbed, credential owner, vendor names', () => {
  assert.equal(checkPlainEnglish('This system is stubbed for now.').pass, false);
  assert.equal(checkPlainEnglish('See the credential owner column.').pass, false);
  assert.equal(checkPlainEnglish('Rendered via PDFShift.').pass, false);
  assert.equal(checkPlainEnglish('Built on Zapier.').pass, false);
});

test('does not ban the bare word "workflow" (required by spec §3 heading)', () => {
  const result = checkPlainEnglish('Simple Example Workflow: here is how your automation works.');
  assert.equal(result.pass, true);
});

test('flags an ISO timestamp in client copy (D7)', () => {
  const result = checkPlainEnglish('Approved at 2026-08-20T16:49:44.391Z by the client.');
  assert.equal(result.pass, false);
  assert.ok(result.violations.some((v) => v.type === 'iso_timestamp'));
});

test('flags a sentence over 25 words', () => {
  const longSentence = 'This is a sentence that keeps going and going and going with many extra words added purely to push the count well past the twenty five word limit set by the gate.';
  const result = checkPlainEnglish(longSentence);
  assert.equal(result.pass, false);
  assert.ok(result.violations.some((v) => v.type === 'long_sentence'));
});

test('a short, plain sentence with no banned terms passes cleanly', () => {
  const result = checkPlainEnglish('We will never ask you to send passwords by email.');
  assert.equal(result.pass, true);
  assert.deepEqual(result.violations, []);
});

test('gloss exception: a short mention without a gloss still fails', () => {
  const result = checkPlainEnglish('We use an API for this.', { allowWithGloss: ['api'] });
  assert.equal(result.pass, false);
});

test('gloss exception: a long, explained sentence with an allow-listed term passes', () => {
  const text = 'We use a secure API, meaning a private technical connection between two systems that only authorised software can use, to move your order details safely.';
  const result = checkPlainEnglish(text, { allowWithGloss: ['api'] });
  assert.equal(result.pass, true);
});
