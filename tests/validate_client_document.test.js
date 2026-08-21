// Run with: node --test tests/validate_client_document.test.js
// No dependencies -- this repo has no package.json/test framework, so this
// uses Node's built-in test runner (Node 18+) rather than adding one.
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateClientDocument } = require('../tools/validate_client_document');

// The actual content of the first real Handover Pack this pipeline produced
// (LordGen-Handover-GIG-Logistics.pdf, 2026-08-20) -- reconstructed field-for-field
// from the workflow execution, not paraphrased. This is the fixture the developer
// asked for: "using the current GIG Logistics PDF content as a fixture."
const REAL_GIG_LOGISTICS_DEFECTS = {
  documentType: 'handover',
  opportunityNamed: 'CRM Handoff',
  opportunityBuilt: 'Automated Customer Support Chatbot',
  businessName: 'GIG Logistics',
  automationName: 'CRM Handoff -- GIG Logistics',
  trigger: 'New dispatch/order captured',
  builtOn: '',
  steps: [
    '1. Order/dispatch details received',
    '2. Record validated',
    '3. Logged to CRM/dispatch record',
    '4. Confirmation sent'
  ],
  integrations: ['n8n (connected)', 'Data Table / CRM record'],
  approvedBy: 'Judge (competition demo)',
  disclaimer: 'This is a starter build -- inspectable, testable, and ready for a developer to connect to your real systems. It is not yet production-live.',
  header: { referenceNumber: '', issueDate: '', preparedBy: '', preparedByContact: '', version: '' },
  fullText:
    'CRM Handoff -- GIG Logistics. Prepared For GIG Logistics. Trigger: New dispatch/order captured. ' +
    'Steps: 1. Order/dispatch details received, 2. Record validated, 3. Logged to CRM/dispatch record, 4. Confirmation sent. ' +
    'Integrations: n8n (connected), Data Table / CRM record. ' +
    'Selected Opportunities Addressed: Automated Customer Support Chatbot. ' +
    'Developer Notes: Auto-generated from the CRM Handoff template. Requires a developer to connect real business systems before any live use. ' +
    'This is a starter build -- inspectable, testable, and ready for a developer to connect to your real systems. It is not yet production-live. ' +
    'Approved by Judge (competition demo) at 2026-08-20T16:10:00.000Z.'
};

test('rejects the real GIG Logistics defects: opportunity mismatch', () => {
  const result = validateClientDocument(REAL_GIG_LOGISTICS_DEFECTS);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.rule === 'rule-1'), 'expected a rule-1 (opportunity mismatch) error');
});

test('rejects the real GIG Logistics defects: "1. 1." double numbering', () => {
  const result = validateClientDocument(REAL_GIG_LOGISTICS_DEFECTS);
  assert.ok(
    result.errors.some((e) => e.rule === 'rule-10' && e.field === 'steps[0]'),
    'expected a rule-10 (manual numbering inside auto-numbered list) error on steps[0]'
  );
});

test('rejects the real GIG Logistics defects: "Data Table / CRM record" slash-alternative', () => {
  const result = validateClientDocument(REAL_GIG_LOGISTICS_DEFECTS);
  assert.ok(
    result.errors.some((e) => e.rule === 'rule-2' && e.field === 'integrations[1]'),
    'expected a rule-2 (slash-alternative field) error on integrations[1]'
  );
});

test('rejects the real GIG Logistics defects: "Auto-generated from the CRM Handoff template"', () => {
  const result = validateClientDocument(REAL_GIG_LOGISTICS_DEFECTS);
  assert.ok(result.errors.some((e) => e.rule === 'rule-4'), 'expected a rule-4 (machinery disclosure) error');
  assert.ok(
    result.errors.some((e) => e.rule === 'rule-3' && e.message.includes('template')),
    'expected a rule-3 error for the blocked "template" token'
  );
});

test('rejects the real GIG Logistics defects: "Approved by Judge (competition demo)"', () => {
  const result = validateClientDocument(REAL_GIG_LOGISTICS_DEFECTS);
  assert.ok(
    result.errors.some((e) => e.rule === 'rule-3' && e.message.includes('judge')),
    'expected a rule-3 error for the blocked "judge" token'
  );
  assert.ok(
    result.errors.some((e) => e.rule === 'rule-3' && e.message.includes('competition demo')),
    'expected a rule-3 error for the blocked "competition demo" phrase'
  );
});

test('rejects "n8n" listed as an integration instead of builtOn', () => {
  const result = validateClientDocument(REAL_GIG_LOGISTICS_DEFECTS);
  assert.ok(result.errors.some((e) => e.rule === 'rule-13'), 'expected a rule-13 (n8n in integrations) error');
});

test('does not false-positive on the required "Test evidence" heading or the word "tested"', () => {
  const clean = {
    documentType: 'handover',
    opportunityNamed: 'Dispatch Capture and Confirmation',
    opportunityBuilt: 'Dispatch Capture and Confirmation',
    businessName: 'Example Logistics Co',
    automationName: 'Dispatch Capture and Confirmation',
    trigger: 'A new dispatch is submitted through the order form',
    builtOn: 'n8n',
    steps: [
      'n8n receives the dispatch payload from the order form',
      'n8n checks required fields are present and flags incomplete records to dispatch',
      'n8n writes the validated dispatch to the CRM record',
      'n8n sends the customer a confirmation with their reference and expected timeline'
    ],
    integrations: ['Order form', 'CRM', 'Email sender'],
    approvedBy: 'A. Operator',
    disclaimer: 'This automation has been built and tested before; we are fitting it to your dispatch fields.',
    header: { referenceNumber: 'LG-2026-0820-EX-01', issueDate: '2026-08-20', preparedBy: 'Mark', preparedByContact: 'mark@lordgen.ai', version: '1.0' },
    fullText:
      'Dispatch Capture and Confirmation. Test evidence: happy path, missing input, AI failure, approval rejected -- all passed. ' +
      'This automation has been built and tested before; we are fitting it to your dispatch fields.'
  };
  const result = validateClientDocument(clean);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test('rejects the bare word "test" outside the approved "Test evidence" heading', () => {
  const doc = {
    documentType: 'handover',
    opportunityNamed: 'X',
    opportunityBuilt: 'X',
    businessName: 'Y',
    automationName: 'X',
    trigger: 'T',
    builtOn: 'n8n',
    steps: ['n8n does the thing to the record', 'n8n does another thing to the record', 'n8n does a third thing to the record', 'n8n does a fourth thing to the record'],
    integrations: ['CRM'],
    header: { referenceNumber: '1', issueDate: '2026-08-20', preparedBy: 'A', preparedByContact: 'a@b.com', version: '1.0' },
    fullText: 'This is a test message that should never reach a client.'
  };
  const result = validateClientDocument(doc);
  assert.ok(result.errors.some((e) => e.rule === 'rule-3' && e.message.includes('"test"')));
});

test('rejects a step count outside 4-8 and a step over 20 words', () => {
  const doc = {
    documentType: 'handover',
    opportunityNamed: 'X',
    opportunityBuilt: 'X',
    businessName: 'Y',
    automationName: 'X',
    trigger: 'T',
    builtOn: 'n8n',
    steps: ['n8n does one very long thing to the record that goes on and on and on past the word limit for a single step'],
    integrations: ['CRM'],
    header: { referenceNumber: '1', issueDate: '2026-08-20', preparedBy: 'A', preparedByContact: 'a@b.com', version: '1.0' },
    fullText: ''
  };
  const result = validateClientDocument(doc);
  assert.ok(result.errors.some((e) => e.rule === 'rule-6' && e.field === 'steps'));
  assert.ok(result.errors.some((e) => e.rule === 'rule-6' && e.field === 'steps[0]'));
});
