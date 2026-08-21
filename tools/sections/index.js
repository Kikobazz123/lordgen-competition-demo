// Assembles all thirteen section builders in the document order settled by
// LORDGEN_HANDOVER_GENERATOR_BUILD.md §7. That order is this repo's own
// resolution of two [NEEDS RULING] points in the build doc (§9 placement,
// developer-checklist placement) -- still open per §17, not re-litigated
// here. Section 11 (Developer Wiring Checklist) is INTERNAL: `clientOnly`
// filters it out for handover-client.pdf; the full pack keeps it in place,
// on its own page, behind the page-break/INTERNAL-banner boundary that
// Step 4 (HTML template) is responsible for rendering -- this module only
// orders and flags, it doesn't lay out pages.

const sec01 = require('./section_01_opportunity');
const sec02 = require('./section_02_category');
const sec03 = require('./section_03_example_flow');
const sec04 = require('./section_04_findings');
const sec05 = require('./section_05_recommendation');
const sec06 = require('./section_06_built');
const sec07 = require('./section_07_tested');
const sec08 = require('./section_08_approval');
const sec09 = require('./section_09_next_steps');
const sec10 = require('./section_10_secure_connection');
const sec11 = require('./section_11_developer_checklist');
const sec12 = require('./section_12_ready_for_launch');
const sec13 = require('./section_13_support');

// Order matches BUILD.md §7 exactly. `internal: true` marks section 11 as
// excluded from handover-client.pdf and from the plain-English gate
// (BUILD.md §9: gate runs on §1-§10, §12-§13 only).
const BUILDERS = [
  { module: sec01, internal: false },
  { module: sec02, internal: false },
  { module: sec03, internal: false },
  { module: sec04, internal: false },
  { module: sec05, internal: false },
  { module: sec06, internal: false },
  { module: sec07, internal: false },
  { module: sec08, internal: false },
  { module: sec09, internal: false },
  { module: sec10, internal: false },
  { module: sec11, internal: true },
  { module: sec12, internal: false },
  { module: sec13, internal: false }
];

/**
 * @param {object} brief - a client_brief already validated against
 *   schema/client_brief.schema.json (validateClientBrief(brief).valid must
 *   be true -- no section builder re-checks the schema itself).
 * @returns {Array<object>} one result per section, in document order, each
 *   annotated with `internal` (whether it ships in handover-client.pdf).
 */
function buildAllSections(brief) {
  return BUILDERS.map(function (b) {
    const result = b.module.build(brief);
    result.internal = b.internal;
    return result;
  });
}

module.exports = {
  buildAllSections,
  sections: {
    section_01_opportunity: sec01,
    section_02_category: sec02,
    section_03_example_flow: sec03,
    section_04_findings: sec04,
    section_05_recommendation: sec05,
    section_06_built: sec06,
    section_07_tested: sec07,
    section_08_approval: sec08,
    section_09_next_steps: sec09,
    section_10_secure_connection: sec10,
    section_11_developer_checklist: sec11,
    section_12_ready_for_launch: sec12,
    section_13_support: sec13
  }
};
