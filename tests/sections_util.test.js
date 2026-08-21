// tools/sections/_util.js -- shared helpers used by every section builder
// and by tools/render_document.js. Direct regression coverage for humanDate,
// since its date-only path had a real timezone bug (see git history): a bare
// YYYY-MM-DD routed through `new Date(iso)` parses as UTC midnight, then
// .getDate() reads it back in the machine's local timezone -- west of UTC,
// that silently shifts the date back a day, and makes rendering
// non-deterministic across machines in different timezones (breaks §4 rule
// 3, "same brief in, byte-identical HTML out").

const test = require('node:test');
const assert = require('node:assert/strict');

const { humanDate, esc } = require('../tools/sections/_util');

test('humanDate: a bare YYYY-MM-DD renders as the same calendar date regardless of machine timezone', () => {
  // This is the exact case that broke: meta.issued_date is a date-only
  // string with no timezone of its own.
  assert.equal(humanDate('2026-08-21'), '21 August 2026');
  assert.equal(humanDate('2026-01-01'), '1 January 2026');
  assert.equal(humanDate('2026-12-31'), '31 December 2026');
});

test('humanDate: a full ISO datetime with an explicit offset still renders correctly', () => {
  // approval.decided_at always carries its own offset -- unambiguous, so
  // this path is unchanged from before the fix.
  assert.equal(humanDate('2026-08-20T21:07:11.539-04:00'), '20 August 2026');
});

test('humanDate: null/empty/garbage inputs degrade safely', () => {
  assert.equal(humanDate(null), '');
  assert.equal(humanDate(''), '');
  assert.equal(humanDate('not-a-date'), 'not-a-date');
});

test('esc: escapes the three characters that matter for HTML text nodes', () => {
  assert.equal(esc('<b>Tom & Jerry</b>'), '&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;');
  assert.equal(esc(null), '');
  assert.equal(esc(undefined), '');
});
