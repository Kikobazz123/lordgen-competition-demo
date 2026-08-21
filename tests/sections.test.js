// Step 3 (LORDGEN_HANDOVER_GENERATOR_BUILD.md §15): section builders §1-§13,
// tested against the GIG Logistics fixture. Commit-point criteria: "Sections
// produce correct text and empty states."

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { validateClientBrief } = require('../tools/validate_client_brief');
const { checkPlainEnglish } = require('../tools/gates/plain_english');
const { checkHonesty } = require('../tools/gates/honesty');
const { buildAllSections, sections } = require('../tools/sections');

const FIXTURE_PATH = path.join(__dirname, '..', 'briefs', 'examples', 'gig-logistics.json');

function loadFixture() {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

test('fixture is schema-valid before anything is built from it', () => {
  const result = validateClientBrief(loadFixture());
  assert.equal(result.valid, true, 'gig-logistics.json fixture: ' + JSON.stringify(result.errors));
});

// --- document order and headings (BUILD.md §7) ---

test('buildAllSections returns all 13 sections in BUILD.md §7 order, section 11 flagged internal', () => {
  const brief = loadFixture();
  const result = buildAllSections(brief);
  assert.equal(result.length, 13);

  const expectedHeadings = [
    'How Automation Can Help GIG Logistics',
    'Standard Automation Opportunities for logistics and delivery businesses',
    'Simple Example Workflow',
    'What We Found',
    'The Automation We Recommend',
    'What We Built for You',
    'What We Tested',
    'Your Approval',
    'What Happens Next',
    'Secure Connection',
    'Developer Wiring Checklist',
    'Ready for Launch',
    'Support and Handover'
  ];
  assert.deepEqual(result.map((s) => s.heading), expectedHeadings);

  result.forEach((s, i) => {
    const expectInternal = i === 10; // section 11, zero-indexed
    assert.equal(s.internal, expectInternal, s.heading + ' internal flag');
  });
});

test('headings fixed by the spec use its exact wording (BUILD.md: "do not invent alternatives")', () => {
  const brief = loadFixture();
  assert.equal(sections.section_04_findings.build(brief).heading, 'What We Found');
  assert.equal(sections.section_05_recommendation.build(brief).heading, 'The Automation We Recommend');
  assert.equal(sections.section_06_built.build(brief).heading, 'What We Built for You');
  assert.equal(sections.section_07_tested.build(brief).heading, 'What We Tested');
  assert.equal(sections.section_08_approval.build(brief).heading, 'Your Approval');
  assert.equal(sections.section_09_next_steps.build(brief).heading, 'What Happens Next');
  assert.equal(sections.section_10_secure_connection.build(brief).heading, 'Secure Connection');
  assert.equal(sections.section_12_ready_for_launch.build(brief).heading, 'Ready for Launch');
});

// --- gate compliance against the real fixture ---

test('every client-facing section (§1-10, §12-13) passes the plain-English gate on the real fixture', () => {
  const brief = loadFixture();
  const all = buildAllSections(brief);
  all.filter((s) => !s.internal).forEach((s) => {
    const result = checkPlainEnglish(s.text);
    assert.equal(result.pass, true, s.heading + ': ' + JSON.stringify(result.violations));
  });
});

test('the internal section 11 is excluded from the plain-English gate (BUILD.md §9 scope)', () => {
  const brief = loadFixture();
  const internal = sections.section_11_developer_checklist.build(brief);
  // Included on purpose: "Workflow imported/configured" etc. are legitimate
  // technical labels here, unlike in client copy. Just documenting the scope
  // boundary, not asserting a pass/fail either way.
  assert.equal(typeof internal.text, 'string');
});

test('every section (including internal §11) passes the honesty gate against the real fixture', () => {
  const brief = loadFixture();
  const all = buildAllSections(brief);
  all.forEach((s) => {
    const result = checkHonesty(s.text, brief);
    assert.equal(result.pass, true, s.heading + ': ' + JSON.stringify(result.violations));
  });
});

test('no section ever renders the approval token (G5/QA-gate-12: no secret-shaped strings in client copy)', () => {
  const brief = loadFixture();
  const all = buildAllSections(brief);
  all.forEach((s) => {
    assert.equal(s.html.includes(brief.approval.token), false, s.heading + ' must never render approval.token');
    assert.equal(s.text.includes(brief.approval.token), false, s.heading + ' must never render approval.token');
  });
});

// --- §1 ---

test('§1 renders business.what_they_do, workflow name, manual steps, and pain points', () => {
  const brief = loadFixture();
  const result = sections.section_01_opportunity.build(brief);
  assert.match(result.html, /courier and logistics company/);
  assert.match(result.html, /Dispatch Capture and Confirmation/);
  assert.match(result.html, /Staff manually check and record the order/);
  assert.match(result.html, /inconsistent communication/);
});

// --- §2 ---

test('§2 renders exactly the 3 category_opportunities rows and the category label', () => {
  const brief = loadFixture();
  const result = sections.section_02_category.build(brief);
  const rowCount = (result.html.match(/<tr>/g) || []).length - 1; // minus header row
  assert.equal(rowCount, 3);
  assert.match(result.heading, /logistics and delivery businesses/);
});

// --- §3 ---

test('§3 renders the hand-authored stages as-is when example_flow.stages is populated', () => {
  const brief = loadFixture();
  const result = sections.section_03_example_flow.build(brief);
  assert.equal(result.derived, false);
  assert.match(result.html, /submits a new order or dispatch request/);
  assert.match(result.html, /&rarr;/);
});

test('§3 derives stages from automation.* when example_flow.stages is empty', () => {
  const brief = loadFixture();
  brief.example_flow.stages = [];
  const result = sections.section_03_example_flow.build(brief);
  assert.equal(result.derived, true);
  assert.match(result.html, new RegExp(brief.automation.trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('§3 H5 heuristic: the real fixture stages all share vocabulary with automation.* (zero warnings)', () => {
  const brief = loadFixture();
  const result = sections.section_03_example_flow.build(brief);
  assert.deepEqual(result.warnings, []);
});

test('§3 H5 heuristic: a stage with no shared vocabulary with automation.* is flagged', () => {
  const brief = loadFixture();
  brief.example_flow.stages = ['A wizard appears and grants three wishes instantly'];
  const result = sections.section_03_example_flow.build(brief);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /H5/);
});

// --- §4 ---

test('§4 renders the findings table when research.performed and evidence exist', () => {
  const brief = loadFixture();
  const result = sections.section_04_findings.build(brief);
  assert.equal(result.empty, false);
  assert.match(result.html, /Inconsistent customer communication/);
  assert.match(result.html, /Trustpilot/);
});

test('§4 prints the declared empty state when research.performed is false (G3: never fabricate a finding)', () => {
  const brief = loadFixture();
  brief.research = { performed: false, method: null, findings: [] };
  const result = sections.section_04_findings.build(brief);
  assert.equal(result.empty, true);
  assert.match(result.html, /have not yet completed a review of public customer feedback for GIG Logistics/);
  assert.doesNotMatch(result.html, /<table/);
});

test('§4 drops a finding with no evidence rather than rendering it (H3, defense in depth)', () => {
  const brief = loadFixture();
  brief.research.findings.push({ issue: 'invented', evidence: '', impact: '', opportunity: '' });
  const result = sections.section_04_findings.build(brief);
  assert.doesNotMatch(result.html, /invented/);
});

// --- §5 ---

test('§5 renders only what automation.* supplies, no generic capability claims', () => {
  const brief = loadFixture();
  const result = sections.section_05_recommendation.build(brief);
  assert.match(result.html, /order form/);
  assert.match(result.html, /confirmation is sent to the customer/);
  assert.doesNotMatch(result.html, /AI-powered/i);
  assert.doesNotMatch(result.html, /fully automated end-to-end/i);
});

// --- §6 ---

test('§6 uses client-language system status, never "Stubbed" or "Credential owner" (D3)', () => {
  const brief = loadFixture();
  const result = sections.section_06_built.build(brief);
  assert.match(result.html, /Not yet connected to your live system/);
  assert.match(result.html, /Connected and working/);
  assert.doesNotMatch(result.html, /Stubbed/i);
  assert.doesNotMatch(result.html, /Credential owner/i);
  assert.match(result.html, /Starter Build/);
});

// --- §7 ---

test('§7 shows passed, failed, and not_tested rows honestly, including a failed scenario', () => {
  const brief = loadFixture();
  brief.tests.push({ scenario: 'Something broke', result: 'failed', plain_english: 'This one did not work as expected.', run_at: '2026-08-21', evidence_ref: 'n8n execution 99' });
  const result = sections.section_07_tested.build(brief);
  assert.match(result.html, /Passed/);
  assert.match(result.html, /Not yet tested/);
  assert.match(result.html, /Failed/);
  assert.match(result.html, /did not work as expected/);
});

test('§7 prints the declared empty state when tests[] is empty', () => {
  const brief = loadFixture();
  brief.tests = [];
  const result = sections.section_07_tested.build(brief);
  assert.equal(result.empty, true);
  assert.match(result.html, /No test scenarios have been run yet/);
});

// --- §8 (H4: the defect that shipped in v1.0) ---

test('§8 renders a confirmation, no request block, when approval.state is received', () => {
  const brief = loadFixture(); // fixture is already state: received
  const result = sections.section_08_approval.build(brief);
  assert.equal(result.approved, true);
  assert.match(result.html, /Approved by/);
  assert.match(result.html, /Chidi Okafor/);
  assert.doesNotMatch(result.html, /use the Approve link/);
});

test('§8 renders the request instruction and NO approval record when state is not received (H4)', () => {
  const brief = loadFixture();
  brief.approval = { state: 'requested', token: brief.approval.token, decided_at: null, decided_by: null, channel: null };
  const result = sections.section_08_approval.build(brief);
  assert.equal(result.approved, false);
  assert.match(result.html, /use the Approve link/);
  assert.doesNotMatch(result.html, /Approved by/);
  assert.doesNotMatch(result.html, /Chidi Okafor/);
});

test('§8 never uses the spec\'s literal reply-phrase instruction (decision: adapted to the real token-link flow)', () => {
  const brief = loadFixture();
  brief.approval = { state: 'not_requested', token: null, decided_at: null, decided_by: null, channel: null };
  const result = sections.section_08_approval.build(brief);
  assert.doesNotMatch(result.html, /I APPROVE THIS AUTOMATION/);
});

// --- §9 ---

test('§9 includes all nine spec steps, the connected services in step 4, the honest go-live disclaimer, and the Tier B line for this fixture', () => {
  const brief = loadFixture(); // fixture delivery.tier is "B"
  const result = sections.section_09_next_steps.build(brief);
  assert.equal((result.html.match(/<li>/g) || []).length, 9);
  assert.match(result.html, /Order form/);
  assert.match(result.html, /does not automatically mean the automation goes live immediately/);
  assert.match(result.html, /We connect this one for you \(Tier B\)/);
});

// --- §10 ---

test('§10 states the no-passwords-by-email commitment and lists service names, never method/what_we_need detail', () => {
  const brief = loadFixture();
  const result = sections.section_10_secure_connection.build(brief);
  assert.match(result.html, /never ask you to send passwords through ordinary email/);
  assert.match(result.html, /Order form/);
  assert.doesNotMatch(result.html, /account_authorisation/);
  assert.doesNotMatch(result.html, /Access to connect your order form/); // that's .what_we_need, internal-pack detail
});

// --- §11 (internal) ---

test('§11 renders all 8 developer checklist items and never renders the approval token', () => {
  const brief = loadFixture();
  const result = sections.section_11_developer_checklist.build(brief);
  // §11 renders 3 tables (checklist, systems, services) -- scope the count to
  // the first (checklist) table only, not all <tr> in the section.
  const checklistTableHtml = result.html.split('</table>')[0];
  const checklistRowCount = (checklistTableHtml.match(/<tr>/g) || []).length - 1; // minus header
  assert.equal(checklistRowCount, 8);
  assert.match(result.html, /human approval point remains before production activation/);
  assert.equal(result.html.includes(brief.approval.token), false);
});

// --- §12 ---

test('§12 renders all six golive rows with Complete/Pending labels', () => {
  const brief = loadFixture();
  const result = sections.section_12_ready_for_launch.build(brief);
  const rowCount = (result.html.match(/<tr>/g) || []).length - 1;
  assert.equal(rowCount, 6);
  assert.match(result.html, /Complete/);
  assert.match(result.html, /Pending/);
});

// --- §13 ---

test('§13 sources the support window from support.window_days, never a hardcoded figure', () => {
  const brief = loadFixture();
  const result = sections.section_13_support.build(brief);
  assert.match(result.html, /14 days/);
  brief.support.window_days = 30;
  const result2 = sections.section_13_support.build(brief);
  assert.match(result2.html, /30 days/);
  assert.doesNotMatch(result2.html, /14 days/);
});
