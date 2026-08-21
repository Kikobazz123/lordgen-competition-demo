// Validates a client_brief object against schema/client_brief.schema.json's
// contract (LORDGEN_HANDOVER_GENERATOR_BUILD.md §6). Hand-rolled rather than
// an ajv-style schema engine -- this repo has no package.json/npm install
// step, and a JSON Schema library would be the first dependency in it. Keep
// this in sync with the .json schema by hand if either changes.
//
// Returns every error at once ("Validation failure lists every missing
// required field at once, so the intake gap gets fixed in one pass" -- §6),
// not fail-fast on the first problem.

const VALID_CATEGORY_SOURCES = ['intake', 'client_call', 'public_information'];
const VALID_BUILD_STATUSES = ['starter_build', 'demo_test_build', 'ready_for_connection', 'production_ready'];
const VALID_SYSTEM_STATES = ['connected', 'not_connected'];
const VALID_TEST_RESULTS = ['passed', 'failed', 'not_tested'];
const VALID_APPROVAL_STATES = ['not_requested', 'requested', 'received'];
const VALID_CONNECTION_METHODS = ['account_authorisation', 'secure_form_client_key', 'secure_form', 'manual'];
const VALID_GOLIVE_STATES = ['complete', 'pending'];
const VALID_DATA_CLASSES = ['standard', 'regulated'];
const REF_PATTERN = /^LG-\d{8}-[A-Z0-9]+-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}
function isString(v) {
  return typeof v === 'string';
}
function isBoolean(v) {
  return typeof v === 'boolean';
}
function isArray(v) {
  return Array.isArray(v);
}
function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function pushError(errors, field, message) {
  errors.push({ field, message });
}

/**
 * @param {object} brief
 * @returns {{ valid: boolean, errors: Array<{field: string, message: string}> }}
 */
function validateClientBrief(brief) {
  const errors = [];

  if (!isPlainObject(brief)) {
    return { valid: false, errors: [{ field: '(root)', message: 'brief must be an object' }] };
  }

  // --- meta ---
  const meta = brief.meta;
  if (!isPlainObject(meta)) {
    pushError(errors, 'meta', 'required object is missing');
  } else {
    if (!isNonEmptyString(meta.ref) || !REF_PATTERN.test(meta.ref)) pushError(errors, 'meta.ref', 'required, must match LG-YYYYMMDD-CLIENTSLUG-NN');
    if (!isNonEmptyString(meta.issued_date) || !DATE_PATTERN.test(meta.issued_date)) pushError(errors, 'meta.issued_date', 'required, must be YYYY-MM-DD');
    if (!isNonEmptyString(meta.version)) pushError(errors, 'meta.version', 'required');
    if (!isNonEmptyString(meta.prepared_for)) pushError(errors, 'meta.prepared_for', 'required');
    if (!isNonEmptyString(meta.prepared_by)) pushError(errors, 'meta.prepared_by', 'required');
    if (!isNonEmptyString(meta.reply_to) || !EMAIL_PATTERN.test(meta.reply_to)) pushError(errors, 'meta.reply_to', 'required, must be a valid email');
  }

  // --- client ---
  const client = brief.client;
  if (!isPlainObject(client)) {
    pushError(errors, 'client', 'required object is missing');
  } else {
    if (!isNonEmptyString(client.business_name)) pushError(errors, 'client.business_name', 'required');
    if (!isString(client.contact_name)) pushError(errors, 'client.contact_name', 'required (may be empty string, not undefined)');
    if (!isString(client.contact_role)) pushError(errors, 'client.contact_role', 'required (may be empty string, not undefined)');
  }

  // --- business ---
  const business = brief.business;
  if (!isPlainObject(business)) {
    pushError(errors, 'business', 'required object is missing');
  } else {
    if (!isNonEmptyString(business.category)) pushError(errors, 'business.category', 'required');
    if (!isNonEmptyString(business.category_label)) pushError(errors, 'business.category_label', 'required');
    if (!isNonEmptyString(business.what_they_do)) pushError(errors, 'business.what_they_do', 'required -- §1 empty state is "fail validation", not "render nothing"');
    if (!VALID_CATEGORY_SOURCES.includes(business.source)) pushError(errors, 'business.source', 'required, one of ' + VALID_CATEGORY_SOURCES.join('|'));
    if (!isArray(business.evidence)) pushError(errors, 'business.evidence', 'required array (may be empty)');
  }

  // --- workflow ---
  const workflow = brief.workflow;
  if (!isPlainObject(workflow)) {
    pushError(errors, 'workflow', 'required object is missing');
  } else {
    if (!isString(workflow.name)) pushError(errors, 'workflow.name', 'required string');
    if (!isArray(workflow.current_manual_steps)) pushError(errors, 'workflow.current_manual_steps', 'required array');
    if (!isArray(workflow.pain_points)) {
      pushError(errors, 'workflow.pain_points', 'required array');
    } else {
      workflow.pain_points.forEach(function (p, i) {
        if (!isPlainObject(p) || !isString(p.point) || !isString(p.evidence)) pushError(errors, 'workflow.pain_points[' + i + ']', 'must be { point, evidence }');
      });
    }
  }

  // --- category_opportunities: exactly 3 rows (spec §2) ---
  const opps = brief.category_opportunities;
  if (!isArray(opps)) {
    pushError(errors, 'category_opportunities', 'required array');
  } else if (opps.length !== 3) {
    pushError(errors, 'category_opportunities', 'must have exactly 3 rows (spec §2), got ' + opps.length);
  } else {
    opps.forEach(function (row, i) {
      if (!isPlainObject(row) || !isNonEmptyString(row.current_activity) || !isNonEmptyString(row.how_automation_helps) || !isNonEmptyString(row.business_benefit)) {
        pushError(errors, 'category_opportunities[' + i + ']', 'must have non-empty current_activity, how_automation_helps, business_benefit');
      }
    });
  }

  // --- example_flow ---
  const exampleFlow = brief.example_flow;
  if (!isPlainObject(exampleFlow)) {
    pushError(errors, 'example_flow', 'required object is missing');
  } else {
    if (!isArray(exampleFlow.stages)) pushError(errors, 'example_flow.stages', 'required array (may be empty; derived from automation.actions if so)');
    if (exampleFlow.agent_role !== null && !isString(exampleFlow.agent_role)) pushError(errors, 'example_flow.agent_role', 'must be a string or null');
  }

  // --- research ---
  const research = brief.research;
  if (!isPlainObject(research)) {
    pushError(errors, 'research', 'required object is missing');
  } else {
    if (!isBoolean(research.performed)) pushError(errors, 'research.performed', 'required boolean -- never omit; false is a legitimate, honest value');
    if (research.method !== null && !isString(research.method)) pushError(errors, 'research.method', 'must be a string or null');
    if (!isArray(research.findings)) {
      pushError(errors, 'research.findings', 'required array (may be empty)');
    } else {
      research.findings.forEach(function (f, i) {
        if (!isPlainObject(f) || !isNonEmptyString(f.issue) || !isNonEmptyString(f.evidence)) {
          pushError(errors, 'research.findings[' + i + ']', 'every finding requires non-empty issue and evidence (H3) -- a finding without evidence must not exist in the brief, not just be dropped downstream');
        }
      });
      if (research.performed === false && research.findings.length > 0) {
        pushError(errors, 'research.findings', 'research.performed is false but findings is non-empty -- contradictory input (G3/H3)');
      }
    }
  }

  // --- automation ---
  const automation = brief.automation;
  if (!isPlainObject(automation)) {
    pushError(errors, 'automation', 'required object is missing');
  } else {
    if (!isNonEmptyString(automation.trigger)) pushError(errors, 'automation.trigger', 'required');
    if (!isNonEmptyString(automation.customer_receives)) pushError(errors, 'automation.customer_receives', 'required');
    ['information_received', 'checks', 'actions', 'recipients', 'recorded'].forEach(function (f) {
      if (!isArray(automation[f])) pushError(errors, 'automation.' + f, 'required array');
    });
  }

  // Cross-field (§8 example_flow empty state): stages OR automation.actions must be non-empty.
  if (isPlainObject(exampleFlow) && isArray(exampleFlow.stages) && isPlainObject(automation) && isArray(automation.actions)) {
    if (exampleFlow.stages.length === 0 && automation.actions.length === 0) {
      pushError(errors, 'example_flow.stages', 'both example_flow.stages and automation.actions are empty -- §3 has nothing to derive a flow from, fail validation instead of rendering an empty diagram');
    }
  }

  // --- build ---
  const build = brief.build;
  if (!isPlainObject(build)) {
    pushError(errors, 'build', 'required object is missing');
  } else {
    if (!VALID_BUILD_STATUSES.includes(build.status)) pushError(errors, 'build.status', 'required, one of ' + VALID_BUILD_STATUSES.join('|'));
    if (!isNonEmptyString(build.what_was_created)) pushError(errors, 'build.what_was_created', 'required');
    if (!isArray(build.systems)) {
      pushError(errors, 'build.systems', 'required array');
    } else {
      build.systems.forEach(function (s, i) {
        if (!isPlainObject(s) || !isNonEmptyString(s.name) || !VALID_SYSTEM_STATES.includes(s.state) || !isString(s.owner)) {
          pushError(errors, 'build.systems[' + i + ']', 'must be { name, state: connected|not_connected, owner }');
        }
      });
    }
  }

  // --- delivery (Tier A/B, §16) ---
  const delivery = brief.delivery;
  if (!isPlainObject(delivery)) {
    pushError(errors, 'delivery', 'required object is missing');
  } else {
    if (!['A', 'B'].includes(delivery.tier)) pushError(errors, 'delivery.tier', 'required, one of A|B');
    if (!isArray(delivery.reasons)) pushError(errors, 'delivery.reasons', 'required array');
    if (!VALID_DATA_CLASSES.includes(delivery.data_class)) pushError(errors, 'delivery.data_class', 'required, one of ' + VALID_DATA_CLASSES.join('|'));
    ['customised', 'custom_mapping', 'outbound_to_end_customers', 'outbound_ships_disabled', 'kill_switch'].forEach(function (f) {
      if (!isBoolean(delivery[f])) pushError(errors, 'delivery.' + f, 'required boolean');
    });
    if (delivery.tier === 'A') {
      // §16.1 A1-A7, all seven required simultaneously -- any single miss is Tier B.
      const a = [];
      if (!isNonEmptyString(delivery.template_id) || !isNonEmptyString(delivery.template_version) || delivery.customised !== false) a.push('A1 (unmodified published template)');
      const services = isPlainObject(brief.connection) && isArray(brief.connection.services) ? brief.connection.services : [];
      if (services.length === 0 || !services.every(function (s) { return VALID_CONNECTION_METHODS.slice(0, 2).includes(s.method); })) a.push('A2 (all services self-serve connectable)');
      if (delivery.custom_mapping !== false) a.push('A3 (no bespoke field mapping)');
      if (!(delivery.outbound_to_end_customers === false || delivery.outbound_ships_disabled === true)) a.push('A4 (no live outbound on install, or shipped disabled)');
      if (!isNonEmptyString(delivery.smoke_test_id)) a.push('A5 (automated smoke test)');
      if (delivery.kill_switch !== true) a.push('A6 (client kill switch)');
      if (delivery.data_class !== 'standard') a.push('A7 (no regulated data)');
      if (a.length > 0) pushError(errors, 'delivery.tier', 'tier is "A" but fails: ' + a.join(', ') + ' -- any single miss must route to Tier B, not a partial A');
    }
  }

  // --- tests ---
  if (!isArray(brief.tests)) {
    pushError(errors, 'tests', 'required array (may be empty)');
  } else {
    brief.tests.forEach(function (t, i) {
      if (!isPlainObject(t) || !isNonEmptyString(t.scenario) || !VALID_TEST_RESULTS.includes(t.result)) {
        pushError(errors, 'tests[' + i + ']', 'must have non-empty scenario and result in ' + VALID_TEST_RESULTS.join('|'));
        return;
      }
      if ((t.result === 'passed' || t.result === 'failed') && !isNonEmptyString(t.evidence_ref)) {
        pushError(errors, 'tests[' + i + ']', 'result is "' + t.result + '" but evidence_ref is empty -- a claimed test result must trace to something real (H1); use "not_tested" if it wasn\'t actually run');
      }
    });
  }

  // --- approval (H4: no record unless state === 'received') ---
  const approval = brief.approval;
  if (!isPlainObject(approval)) {
    pushError(errors, 'approval', 'required object is missing');
  } else if (!VALID_APPROVAL_STATES.includes(approval.state)) {
    pushError(errors, 'approval.state', 'required, one of ' + VALID_APPROVAL_STATES.join('|'));
  } else if (approval.state === 'received') {
    if (approval.decided_at === null || approval.decided_by === null || approval.channel === null) {
      pushError(errors, 'approval', 'state is "received" but decided_at/decided_by/channel is null -- an approval must have a real record (H4)');
    }
  } else {
    if (approval.decided_at !== null || approval.decided_by !== null) {
      pushError(errors, 'approval', 'state is "' + approval.state + '" but decided_at/decided_by is set -- no approval record may exist before state is "received" (H4, the defect that shipped in v1.0)');
    }
  }

  // --- connection ---
  if (!isPlainObject(brief.connection) || !isArray(brief.connection.services)) {
    pushError(errors, 'connection.services', 'required array');
  } else {
    brief.connection.services.forEach(function (s, i) {
      if (!isPlainObject(s) || !isNonEmptyString(s.service) || !VALID_CONNECTION_METHODS.includes(s.method)) {
        pushError(errors, 'connection.services[' + i + ']', 'must have non-empty service and a valid method');
      }
    });
  }

  // --- developer (internal checklist, all booleans) ---
  const developer = brief.developer;
  const devFields = ['automation_approved', 'connection_info_received', 'workflow_imported', 'error_handling_checked', 'duplicate_handling_checked', 'notifications_checked', 'final_test_completed', 'golive_approved'];
  if (!isPlainObject(developer)) {
    pushError(errors, 'developer', 'required object is missing');
  } else {
    devFields.forEach(function (f) {
      if (!isBoolean(developer[f])) pushError(errors, 'developer.' + f, 'required boolean');
    });
  }

  // --- golive ---
  const golive = brief.golive;
  const goliveFields = ['automation_design', 'client_approval', 'secure_connections', 'developer_wiring', 'final_testing', 'production_launch'];
  if (!isPlainObject(golive)) {
    pushError(errors, 'golive', 'required object is missing');
  } else {
    goliveFields.forEach(function (f) {
      if (!VALID_GOLIVE_STATES.includes(golive[f])) pushError(errors, 'golive.' + f, 'required, one of ' + VALID_GOLIVE_STATES.join('|'));
    });
    // §13 cross-check: client_approval cannot be complete unless approval.state === received.
    if (golive.client_approval === 'complete' && isPlainObject(approval) && approval.state !== 'received') {
      pushError(errors, 'golive.client_approval', 'marked "complete" but approval.state is not "received" (§13 cross-check)');
    }
    // production_launch cannot be complete unless every system is connected.
    if (golive.production_launch === 'complete' && isPlainObject(build) && isArray(build.systems)) {
      const allConnected = build.systems.length > 0 && build.systems.every(function (s) { return s.state === 'connected'; });
      if (!allConnected) pushError(errors, 'golive.production_launch', 'marked "complete" but not every build.systems[] entry is "connected" (§13 cross-check)');
    }
  }

  // --- support ---
  const support = brief.support;
  if (!isPlainObject(support)) {
    pushError(errors, 'support', 'required object is missing');
  } else {
    if (typeof support.window_days !== 'number' || support.window_days < 0) pushError(errors, 'support.window_days', 'required non-negative number');
    if (!isString(support.covers)) pushError(errors, 'support.covers', 'required string');
    if (!isString(support.excludes)) pushError(errors, 'support.excludes', 'required string');
    if (!isString(support.contact)) pushError(errors, 'support.contact', 'required string');
  }

  return { valid: errors.length === 0, errors: errors };
}

module.exports = { validateClientBrief };
