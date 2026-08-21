// Run with: node --test tests/gates_honesty.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { checkHonesty } = require('../tools/gates/honesty');

const gigFixture = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'briefs', 'examples', 'gig-logistics.json'), 'utf8'));

test('H2: rejects "live"/"production" language when the brief is not production-ready', () => {
  // gig-logistics.json is build.status: "starter_build" with not_connected systems.
  const result = checkHonesty('Your automation is now live and ready to use.', gigFixture);
  assert.equal(result.pass, false);
  assert.ok(result.violations.some((v) => v.rule === 'H2'));
});

test('H2: allows "live" language when every condition is genuinely met', () => {
  const brief = JSON.parse(JSON.stringify(gigFixture));
  brief.build.status = 'production_ready';
  brief.build.systems.forEach((s) => { s.state = 'connected'; });
  Object.keys(brief.golive).forEach((k) => { brief.golive[k] = 'complete'; });
  const result = checkHonesty('Your automation is now live.', brief);
  assert.equal(result.pass, true);
});

test('H6: rejects a numeric claim with no matching field in the brief', () => {
  const result = checkHonesty('This saves you 40% of your time every week.', gigFixture);
  assert.equal(result.pass, false);
  assert.ok(result.violations.some((v) => v.rule === 'H6'));
});

test('H6: allows a numeric claim that traces to a real brief field (support.window_days = 14)', () => {
  const result = checkHonesty('LordGen covers this build for 14 days after handover.', gigFixture);
  assert.equal(result.pass, true);
});

test('clean client-facing text with no numeric or production claims passes', () => {
  const result = checkHonesty('Your order form sends us the details automatically, and we record every run for your reference.', gigFixture);
  assert.equal(result.pass, true);
  assert.deepEqual(result.violations, []);
});
