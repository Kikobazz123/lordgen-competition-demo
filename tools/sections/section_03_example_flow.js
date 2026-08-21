// §3 -- Simple Example Workflow. Spec §3, BUILD.md §8 §3.
// Source: example_flow.stages[], example_flow.agent_role; falls back to
// automation.* when stages is empty.
//
// Two things this builder is responsible for that the schema validator only
// partially covers:
//
// 1. Derivation: validate_client_brief.js only checks that stages and
//    automation.actions aren't BOTH empty -- deriving the actual stages from
//    automation.* when example_flow.stages is empty is this builder's job
//    (per the schema's own comment: "the section builder derives stages from
//    automation.actions/checks instead").
//
// 2. H5 (spec/BUILD.md §10): "every example_flow stage maps to an entry in
//    automation.actions or automation.checks... a stage with no corresponding
//    action is a hallucination." When stages are DERIVED (case 1), this is
//    true by construction. When stages are hand-authored -- the normal case,
//    including the GIG fixture -- true semantic matching against differently-
//    worded automation fields isn't something a deterministic string check
//    can do reliably. This builder runs a best-effort keyword-overlap check
//    and returns non-fatal `warnings`, the same honesty-heuristic posture
//    already accepted for the plain-English gate's gloss exception: a useful
//    signal, not proof.

const { esc, section, stripTags } = require('./_util');

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'or', 'to', 'of', 'for', 'is', 'are', 'their', 'your', 'with', 'that', 'this', 'it', 'its', 'as', 'on', 'in', 'at', 'be', 'by', 'if', 'we', 'you', 'they', 'them', 'from', 'into']);

function significantWords(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(function (w) { return w.length > 2 && !STOPWORDS.has(w); });
}

function deriveStages(automation) {
  const stages = [];
  if (automation.trigger) stages.push(automation.trigger);
  (automation.checks || []).forEach(function (c) { stages.push(c); });
  (automation.actions || []).forEach(function (a) { stages.push(a); });
  if (automation.customer_receives) stages.push('The customer receives ' + automation.customer_receives.replace(/^a\s+/i, ''));
  if ((automation.recorded || []).length) stages.push('This is recorded for your reference');
  return stages;
}

// Best-effort only -- see file header. A stage "maps" if it shares at least
// one significant word with the automation's own vocabulary.
function checkStageMapping(stages, automation) {
  const vocab = significantWords([automation.trigger].concat(automation.checks || [], automation.actions || [], [automation.customer_receives]).join(' '));
  const vocabSet = new Set(vocab);
  const warnings = [];
  stages.forEach(function (stage, i) {
    const words = significantWords(stage);
    const overlap = words.some(function (w) { return vocabSet.has(w); });
    if (!overlap) {
      warnings.push('stage ' + (i + 1) + ' ("' + stage + '") shares no vocabulary with automation.trigger/checks/actions/customer_receives -- possible H5 hallucination, review by eye');
    }
  });
  return warnings;
}

function build(brief) {
  const exampleFlow = brief.example_flow;
  const automation = brief.automation;

  const derived = !exampleFlow.stages || exampleFlow.stages.length === 0;
  const stages = derived ? deriveStages(automation) : exampleFlow.stages;
  const warnings = derived ? [] : checkStageMapping(stages, automation);

  let body = '<div class="flow">' + stages.map(esc).join(' &rarr; ') + '</div>';

  if (exampleFlow.agent_role) {
    body += '<p>' + esc(exampleFlow.agent_role) + '</p>';
  }

  // BUILD.md §7: heading 3 isn't fixed by the spec body; the exact label
  // comes from the spec's own flow list ("Simple Example Workflow"), not
  // an invented per-business variant.
  const result = section('sec-3', 'Simple Example Workflow', body);

  // Override the shared helper's text derivation: the flow diagram joins
  // stages with arrows, not sentence punctuation, so stripTags() on the HTML
  // would read the whole diagram as one run-on "sentence" and false-positive
  // the plain-English gate's 25-word cap. Each stage is its own sentence for
  // gate-checking purposes even though it reads as one connected diagram
  // visually.
  result.text = 'Simple Example Workflow. ' + stages.map(function (s) { return stripTags(s).replace(/\.?$/, '.'); }).join(' ') +
    (exampleFlow.agent_role ? (' ' + stripTags(exampleFlow.agent_role).replace(/\.?$/, '.')) : '');

  result.warnings = warnings;
  result.derived = derived;
  return result;
}

module.exports = { build, deriveStages, checkStageMapping };
