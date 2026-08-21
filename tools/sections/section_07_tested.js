// §7 -- What We Tested. Spec §7, BUILD.md §8 §7.
// Source: tests[].
//
// Every row renders its ACTUAL result -- passed, failed, or not_tested.
// Failed tests are shown as failed, never hidden (spec §7, "a client who
// later finds a hidden failure is gone"). `not_tested` rows are shown too --
// the "must not contain" rule in BUILD.md §8 §7 bans inventing a result for
// a scenario absent from tests[], not hiding a scenario that's honestly
// marked not_tested.
//
// Empty state: no tests[] entries at all -> declared empty state, not a
// missing section (the section still renders, per the "never omit the
// section silently" rule in BUILD.md §8's preamble).

const { esc, section } = require('./_util');

const RESULT_LABELS = { passed: 'Passed', failed: 'Failed', not_tested: 'Not yet tested' };

function build(brief) {
  const tests = brief.tests || [];

  let body;
  let empty;
  if (tests.length === 0) {
    body = '<p>No test scenarios have been run yet.</p>';
    empty = true;
  } else {
    const items = tests.map(function (t) {
      const label = RESULT_LABELS[t.result] || t.result;
      const detail = t.result === 'not_tested' ? t.scenario : (t.plain_english || t.scenario);
      return '<li>' + esc(label) + ' &mdash; ' + esc(detail) + '</li>';
    }).join('');
    body = '<ul>' + items + '</ul>';
    empty = false;
  }

  const result = section('sec-7', 'What We Tested', body);
  result.empty = empty;
  return result;
}

module.exports = { build, RESULT_LABELS };
