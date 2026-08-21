// Run with: node --test tests/validate_client_brief.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateClientBrief } = require('../tools/validate_client_brief');

const gigFixture = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'briefs', 'examples', 'gig-logistics.json'), 'utf8'));

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

test('the real GIG Logistics fixture validates clean', () => {
  const result = validateClientBrief(gigFixture);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test('rejects a brief claiming an untested scenario as passed without evidence', () => {
  const brief = clone(gigFixture);
  brief.tests.push({ scenario: 'Something we never actually ran', result: 'passed', plain_english: 'It worked.', run_at: '', evidence_ref: '' });
  const result = validateClientBrief(brief);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.field === 'tests[' + (brief.tests.length - 1) + ']' && e.message.includes('H1')));
});

test('rejects an approval record while state is "requested" (H4 -- the defect that shipped in v1.0)', () => {
  const brief = clone(gigFixture);
  brief.approval.state = 'requested';
  // decided_at/decided_by are still populated from the received-state fixture -- exactly
  // the v1.0 defect: a document asking for approval that already claims to have it.
  const result = validateClientBrief(brief);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.field === 'approval' && e.message.includes('H4')));
});

test('rejects a research finding lacking evidence', () => {
  const brief = clone(gigFixture);
  brief.research.findings.push({ issue: 'Something we noticed', evidence: '', impact: '', opportunity: '' });
  const result = validateClientBrief(brief);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.field.startsWith('research.findings[')));
});

test('rejects category_opportunities with fewer than 3 rows', () => {
  const brief = clone(gigFixture);
  brief.category_opportunities = brief.category_opportunities.slice(0, 2);
  const result = validateClientBrief(brief);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.field === 'category_opportunities'));
});

test('rejects a Tier A claim that fails even one A1-A7 condition', () => {
  const brief = clone(gigFixture);
  brief.delivery.tier = 'A';
  brief.delivery.template_id = 'dispatch-confirm-v1';
  brief.delivery.template_version = '1.0.0';
  brief.delivery.custom_mapping = false;
  brief.delivery.outbound_ships_disabled = true;
  brief.delivery.smoke_test_id = 'smoke-001';
  brief.delivery.kill_switch = true;
  // customised is still true (from the fixture) -- A1 fails, everything else passes.
  const result = validateClientBrief(brief);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.field === 'delivery.tier' && e.message.includes('A1')));
});

test('rejects an empty example_flow.stages with empty automation.actions', () => {
  const brief = clone(gigFixture);
  brief.example_flow.stages = [];
  brief.automation.actions = [];
  const result = validateClientBrief(brief);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.field === 'example_flow.stages'));
});

test('reports every missing required field at once, not just the first', () => {
  const brief = { meta: {}, client: {} };
  const result = validateClientBrief(brief);
  assert.equal(result.valid, false);
  const fields = result.errors.map((e) => e.field);
  assert.ok(fields.includes('meta.ref'));
  assert.ok(fields.includes('client.business_name'));
  assert.ok(fields.includes('business'));
  assert.ok(fields.includes('workflow'));
  assert.ok(result.errors.length >= 5, 'expected many errors reported in one pass, not a fail-fast single error');
});

test('golive.production_launch cannot be "complete" unless every system is connected', () => {
  const brief = clone(gigFixture);
  brief.golive.production_launch = 'complete';
  const result = validateClientBrief(brief);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.field === 'golive.production_launch'));
});
