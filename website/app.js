/**
 * LordGen AI — Business Diagnostic Journey
 *
 * Phase 5 of the approved "Full Live Rebuild" (docs/architecture.md,
 * plan file i-just-uploaded-a-quizzical-pinwheel.md, approved 2026-08-20).
 * Retires the old plumbing/real_estate/salon simulated-only demo and the
 * old inline three-stage diagnostic in favour of one real, live journey:
 *
 *   Inquiry -> Research -> Results -> Approval -> Builder -> Handover
 *
 * Every step is a real network call to a real, published n8n workflow via
 * this repo's Vercel relays (website/api/trigger-demo.js, website/api/
 * decision.js) -- no simulation, no fixture data, no pre-baked business
 * name anywhere. Per the approved rebuild's confirmed decision: every
 * visitor (judge or real prospective client) types a real business name
 * and goes through the identical live-research path.
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// The 4 live categories (Nigeria-focused, per the approved rebuild). Icons
// and copy only -- never a specific business name (confirmed decision: no
// pre-baked example business anywhere in this rebuild).
const CATEGORIES = [
  { id: 'eatery', icon: '\u{1F37D}\u{FE0F}', label: 'Eatery / Restaurant', placeholder: 'e.g. your restaurant’s name' },
  { id: 'law_firm', icon: '⚖️', label: 'Law Firm', placeholder: 'e.g. your firm’s name' },
  { id: 'salon_beauty', icon: '\u{1F484}', label: 'Salon & Beauty', placeholder: 'e.g. your salon’s name' },
  { id: 'logistics', icon: '\u{1F69A}', label: 'Logistics', placeholder: 'e.g. your company’s name' }
];

// Standard mode is autonomous by design: contact info plus optional links
// for the AI to research from -- no self-reported "what's your problem"
// question. The AI finds the pain points itself (Research Agent, live
// Diagnostic workflow) rather than relying on the visitor to describe them.
const STANDARD_QUESTIONS = [
  { id: 'website', label: 'Business website (optional, helps our research)', required: false },
  { id: 'socialMedia', label: 'Social media / Instagram / Facebook page (optional)', required: false }
];

// Deep mode adds the fuller questionnaire fields the live workflows already
// accept (currentTools/scale/integrationNeeds), matching
// docs/execution-plan-template.md's depth, plus the same optional links.
const DEEP_QUESTIONS = STANDARD_QUESTIONS.concat([
  { id: 'currentTools', label: 'What tools or software do you currently use for this?', required: false },
  { id: 'scale', label: 'Roughly how many of these do you handle per week?', required: false },
  { id: 'integrationNeeds', label: 'Any specific systems this needs to connect to?', required: false }
]);

// LordGen's real ready-made automation inventory, one per category today --
// mirrors Issue Proposal's own TEMPLATE_LIBRARY (n8n workflow 9qzZd5vtRmNo2g4C)
// exactly, so the dropdown shown after diagnosis names a real, buildable
// automation, and currentSystemQuestion mirrors that same template's actual
// first requirement (what the business needs to provide to connect it).
const TEMPLATE_INVENTORY = {
  eatery: { name: 'Order and Reservation Confirmation', currentSystemQuestion: 'What do you currently use to take orders or reservations?' },
  law_firm: { name: 'Client Intake and Confirmation', currentSystemQuestion: 'What do you currently use to take client inquiries?' },
  salon_beauty: { name: 'Booking Confirmation', currentSystemQuestion: 'What do you currently use to take bookings?' },
  logistics: { name: 'Dispatch Capture and Confirmation', currentSystemQuestion: 'What do you currently use to capture orders or dispatches?' }
};

const JOURNEY_STEPS = [
  'RECEIVED', 'RESEARCHING', 'RESEARCH READY', 'PROPOSAL SENT',
  'AWAITING YOUR DECISION', 'APPROVED', 'BUILD STARTED', 'HANDOVER ON THE WAY'
];

const RESEARCH_STATUS_MESSAGES = {
  not_in_category: null, // uses the workflow's own message field
  rate_limited: null,
  no_credible_data: null,
  processing: 'This business is already being researched. Please wait a moment and try again.'
};

// The Research Agent's researchStatus field is LLM-generated JSON, not a
// strictly-typed backend enum -- observed live returning "research_complete"
// where the documented contract says "complete". A strict === 'complete'
// check is too brittle against that kind of natural output variability.
// Recognize the small set of genuinely-distinct non-success statuses
// explicitly; treat anything else as success IF real finding content came
// back -- the content is the actual signal, not the exact status string.
const INCOMPLETE_RESEARCH_STATUSES = ['not_in_category', 'rate_limited', 'no_credible_data', 'processing'];
function isResearchComplete(payload) {
  if (payload.researchStatus && INCOMPLETE_RESEARCH_STATUSES.indexOf(payload.researchStatus) !== -1) return false;
  return !!(payload.standard || payload.research || payload.clientRequested);
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

function newJourneyState() {
  return {
    category: null,
    mode: 'standard',
    requestId: null,
    form: {},
    diagnosticResult: null,
    selectedOpportunities: [],
    proposal: null,
    decision: null,
    stepIndex: -1
  };
}

const state = { journey: newJourneyState() };

// ---------------------------------------------------------------------------
// Sliding-card stepper
//
// Replaces the old flat, horizontally-overflowing row of chips. A fixed-
// width viewport shows exactly one card at a time; the track slides via a
// CSS transform as the active step advances. No scrollbar, no new JS
// dependency -- same hand-rolled-CSS convention as motion.js/hero3d.js,
// and gated by prefers-reduced-motion the same way those already are.
// ---------------------------------------------------------------------------

function renderStepViz(trackElId, dotsElId, steps, activeIndex) {
  const track = document.getElementById(trackElId);
  const clamped = Math.max(activeIndex, 0);

  track.innerHTML = steps.map((step, i) => {
    const cls = i === activeIndex ? 'active' : i < activeIndex ? 'done' : 'upcoming';
    return '<div class="stepper-card ' + cls + '">'
      + '<span class="stepper-index">Step ' + (i + 1) + ' of ' + steps.length + '</span>'
      + '<span class="stepper-label">' + step + '</span>'
      + '</div>';
  }).join('');
  track.style.transform = 'translateX(-' + (clamped * 100) + '%)';
  track.setAttribute('aria-live', 'polite');

  if (dotsElId) {
    const dotsEl = document.getElementById(dotsElId);
    dotsEl.innerHTML = steps.map((_, i) => {
      const cls = i === activeIndex ? 'active' : i < activeIndex ? 'done' : '';
      return '<span class="stepper-dot ' + cls + '"></span>';
    }).join('');
  }
}

function renderJourneyStatus(activeIndex) {
  state.journey.stepIndex = activeIndex;
  renderStepViz('diagStatusViz', 'diagStatusDots', JOURNEY_STEPS, activeIndex);
}

// ---------------------------------------------------------------------------
// Rendering — Inquiry form
// ---------------------------------------------------------------------------

function renderCategorySelector() {
  const el = document.getElementById('diagCategorySelector');
  el.innerHTML = '';
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'business-tab' + (cat.id === state.journey.category ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', cat.id === state.journey.category ? 'true' : 'false');
    btn.innerHTML = '<span class="tab-icon">' + cat.icon + '</span> ' + cat.label;
    btn.addEventListener('click', () => selectCategory(cat.id));
    el.appendChild(btn);
  });
}

function selectCategory(id) {
  state.journey.category = id;
  const cat = CATEGORIES.find((c) => c.id === id);
  document.getElementById('diagBusinessNameInput').placeholder = cat.placeholder;
  renderCategorySelector();
  validateInquiryForm();
}

function questionFieldHtml(q) {
  const req = q.required ? 'required' : '';
  return '<div class="field" data-field-id="' + q.id + '">'
    + '<label for="q_' + q.id + '">' + q.label + '</label>'
    + '<textarea id="q_' + q.id + '" name="' + q.id + '" ' + req + '></textarea>'
    + '<span class="field-error">This field is required.</span>'
    + '</div>';
}

function renderQuestionFields() {
  const questions = state.journey.mode === 'deep' ? DEEP_QUESTIONS : STANDARD_QUESTIONS;
  document.getElementById('diagQuestionFields').innerHTML = questions.map(questionFieldHtml).join('');
}

function showModeTooltip(mode) {
  const tip = document.getElementById('diagModeTooltip');
  if (mode === 'deep') {
    tip.textContent = 'This means a developer builds something custom beyond our ready-made templates. It takes a bit more detail up front, but nothing here goes beyond what you’re comfortable sharing.';
    tip.hidden = false;
  } else {
    tip.hidden = true;
  }
}

function validateInquiryForm() {
  const businessName = document.getElementById('diagBusinessNameInput').value.trim();
  const contactEmail = document.getElementById('diagContactEmailInput').value.trim();
  const valid = !!state.journey.category && !!businessName && !!contactEmail;
  document.getElementById('runDiagnosticBtn').disabled = !valid;
  return valid;
}

function collectInquiryData() {
  const questions = state.journey.mode === 'deep' ? DEEP_QUESTIONS : STANDARD_QUESTIONS;
  const data = {};
  questions.forEach((q) => {
    data[q.id] = document.getElementById('q_' + q.id).value.trim();
  });
  return {
    category: state.journey.category,
    businessName: document.getElementById('diagBusinessNameInput').value.trim(),
    contactName: document.getElementById('diagContactNameInput').value.trim(),
    contactRole: document.getElementById('diagContactRoleInput').value.trim(),
    contactEmail: document.getElementById('diagContactEmailInput').value.trim(),
    mode: state.journey.mode,
    website: data.website || '',
    socialMedia: data.socialMedia || '',
    problem: data.problem || '',
    specialRequest: data.specialRequest || '',
    currentTools: data.currentTools || '',
    scale: data.scale || '',
    integrationNeeds: data.integrationNeeds || ''
  };
}

// ---------------------------------------------------------------------------
// Rendering — results / proposal / decision panels
// ---------------------------------------------------------------------------

function resetResultPanels() {
  ['diagResultsPanel', 'diagOpportunityPanel', 'diagProposalPanel', 'diagFinalPanel'].forEach((id) => {
    document.getElementById(id).hidden = true;
  });
  document.getElementById('diagError').hidden = true;
}

function showDiagError(message) {
  const el = document.getElementById('diagError');
  el.innerHTML = '';
  el.textContent = message;
  el.hidden = false;
}

// The no_credible_data case specifically needs real links (mailto/WhatsApp),
// which plain textContent can't carry -- built via DOM nodes rather than
// innerHTML with string concatenation so the visitor-typed businessName
// (the one dynamic piece) can never be interpreted as markup.
function showDiagHonestEmptyState(businessName) {
  const el = document.getElementById('diagError');
  el.innerHTML = '';

  const intro = document.createElement('p');
  intro.textContent = 'We couldn’t find a public system or online presence for ' + businessName + ' to research automatically. This usually means one of two things:';
  el.appendChild(intro);

  const list = document.createElement('ul');

  const newBiz = document.createElement('li');
  newBiz.textContent = 'You’re a new business without an existing system yet — our developers can build you a management system first, before automation.';
  list.appendChild(newBiz);

  const noPresence = document.createElement('li');
  noPresence.append('You have a business we couldn’t find online — if you have a business page or social page, or would like to talk this through directly, please ');
  const mailLink = document.createElement('a');
  mailLink.href = 'mailto:zaxellimited360@gmail.com';
  mailLink.textContent = 'email us';
  noPresence.appendChild(mailLink);
  noPresence.append(' or ');
  const waLink = document.createElement('a');
  waLink.href = 'https://wa.me/qr/TPDAVEJOJ53QN1';
  waLink.target = '_blank';
  waLink.rel = 'noopener';
  waLink.textContent = 'reach us on WhatsApp';
  noPresence.appendChild(waLink);
  noPresence.append(' for further instruction.');
  list.appendChild(noPresence);

  el.appendChild(list);
  el.hidden = false;
}

function findingItemHtml(item) {
  const badge = item.tier || item.confidence || '';
  const body = item.description || item.reasoning || item.objective || '';
  const solution = item.proposedAutomation || item.proposedSolution || '';
  return '<li><div class="diag-finding-title">' + item.title + '</div>'
    + (badge ? ('<span class="diag-badge diag-badge-' + String(badge).toLowerCase() + '">' + badge + '</span>') : '')
    + (body ? ('<p>' + body + '</p>') : '')
    + (solution ? ('<p class="diag-finding-solution"><strong>Automation opportunity:</strong> ' + solution + '</p>') : '')
    + '</li>';
}

// Lives inside #diagResultsPanel (not a new panel) so it fades in with the
// rest of that panel's content via the site's existing [data-reveal]
// mechanism -- see renderResults() below, which is this block's only caller.
function renderRecommendation(data) {
  const wrap = document.getElementById('diagRecommendationBlock');
  const rec = data.recommendedTemplate;
  const inventory = TEMPLATE_INVENTORY[data.category];

  // recommendedTemplate is always {name, reasoning} from the backend, never
  // bare null -- a consistent shape is more reliable for the LLM's
  // schema-by-example structured output than a sometimes-object/sometimes-
  // null field. Empty name is how "no good fit" is represented.
  if (!rec || !rec.name || !inventory) {
    const reason = (rec && rec.reasoning) || 'This one goes beyond our ready-made automations -- a developer will design something custom for you.';
    wrap.innerHTML = '<p class="field-hint">' + reason + '</p>';
    wrap.hidden = false;
    return;
  }

  wrap.innerHTML = '<div class="field"><label for="diagRecommendedTemplateSelect">Recommended Automation</label>'
    + '<select id="diagRecommendedTemplateSelect"><option value="' + inventory.name + '" selected>' + inventory.name + '</option></select></div>'
    + (rec.reasoning ? ('<p class="field-hint">' + rec.reasoning + '</p>') : '');
  wrap.hidden = false;
}

function renderResults(data) {
  document.getElementById('diagResultsPanel').hidden = false;
  renderRecommendation(data);
  document.getElementById('diagStandardList').innerHTML = (data.standard || []).map(findingItemHtml).join('');
  document.getElementById('diagResearchList').innerHTML = (data.research || []).map(findingItemHtml).join('');
  document.getElementById('diagClientRequestedList').innerHTML = (data.clientRequested || []).map(findingItemHtml).join('');
  const sources = data.sources || [];
  document.getElementById('diagSources').textContent = sources.length ? ('Sources: ' + sources.map((s) => s.name || s.url).join(' · ')) : '';
}

function allFindings(data) {
  return [].concat(data.standard || [], data.research || [], data.clientRequested || []);
}

// Connection details are required, not optional -- a proposal built without
// them isn't actually buildable without another round of back-and-forth, so
// "Send Me a Proposal" stays disabled until both are filled, the same way it
// already stays disabled without a real research finding.
function updateIssueProposalButton() {
  const hasResearch = !!(state.journey.diagnosticResult && state.journey.diagnosticResult.research && state.journey.diagnosticResult.research.length);
  const currentSystem = document.getElementById('diagCurrentSystemInput').value.trim();
  const senderEmail = document.getElementById('diagSenderEmailInput').value.trim();
  const hasConnectionDetails = !!currentSystem && !!senderEmail;
  document.getElementById('issueProposalBtn').disabled = !hasResearch || state.journey.selectedOpportunities.length === 0 || !hasConnectionDetails;
}

function renderOpportunityPicker(data) {
  const el = document.getElementById('diagOpportunityList');
  el.innerHTML = '';
  const seen = new Set();
  const connectionDetails = document.getElementById('diagConnectionDetails');

  allFindings(data).forEach((item) => {
    if (!item.title || seen.has(item.title)) return;
    seen.add(item.title);
    const label = document.createElement('label');
    label.className = 'diag-agent-option';
    label.innerHTML = '<input type="checkbox" value="' + item.title + '"> ' + item.title;
    label.querySelector('input').addEventListener('change', (e) => {
      const selected = state.journey.selectedOpportunities;
      const idx = selected.indexOf(item.title);
      if (e.target.checked && idx === -1) selected.push(item.title);
      else if (!e.target.checked && idx > -1) selected.splice(idx, 1);
      // Progressive reveal within this same card, not a separate panel --
      // shows once the visitor has picked at least one opportunity.
      connectionDetails.classList.toggle('is-visible', selected.length > 0);
      updateIssueProposalButton();
    });
    el.appendChild(label);
  });

  const inventory = TEMPLATE_INVENTORY[data.category];
  document.getElementById('diagCurrentSystemLabel').textContent = inventory ? inventory.currentSystemQuestion : 'What do you currently use for this?';

  // A proposal needs a real research finding to back it (see issueProposal()).
  // Gated centrally in updateIssueProposalButton() so the checkbox handler
  // above can't accidentally re-enable submission when there isn't one.
  document.getElementById('diagNoResearchNote').hidden = !!(data.research && data.research.length);
  connectionDetails.classList.remove('is-visible');
  updateIssueProposalButton();
  document.getElementById('diagOpportunityPanel').hidden = false;
}

function renderProposalSent(data) {
  document.getElementById('diagProposalPanel').hidden = false;
  document.getElementById('diagProposalRef').textContent = data.proposalRef || '';
  document.getElementById('diagProposalEmailNote').hidden = !data.emailSent;
}

function renderFinal(message) {
  document.getElementById('diagFinalPanel').hidden = false;
  document.getElementById('diagFinalMessage').textContent = message;
}

// ---------------------------------------------------------------------------
// Fetch orchestration — every call here hits a real, published n8n workflow
// through a same-origin Vercel relay. No simulation.
// ---------------------------------------------------------------------------

async function postRelay(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const payload = await res.json();
  return { ok: res.ok, status: res.status, payload: payload };
}

async function runDiagnostic() {
  if (!validateInquiryForm()) return;

  resetResultPanels();
  state.journey = Object.assign(newJourneyState(), {
    category: state.journey.category,
    mode: state.journey.mode,
    requestId: crypto.randomUUID(),
    stepIndex: state.journey.stepIndex
  });

  const inquiry = collectInquiryData();
  state.journey.form = inquiry;

  renderJourneyStatus(1); // RECEIVED (done) -> RESEARCHING (active)
  document.getElementById('runDiagnosticBtn').disabled = true;

  try {
    const { ok, payload } = await postRelay('/api/trigger-demo', Object.assign(
      { target: 'diagnostic', requestId: state.journey.requestId }, inquiry
    ));

    if (!ok) {
      showDiagError(payload.error || 'That request could not be processed. Please check the form and try again.');
      renderJourneyStatus(0);
      return;
    }

    state.journey.diagnosticResult = payload;

    if (isResearchComplete(payload)) {
      renderJourneyStatus(2); // RESEARCH READY
      renderResults(payload);
      renderOpportunityPicker(payload);
    } else if (payload.researchStatus === 'no_credible_data') {
      showDiagHonestEmptyState(inquiry.businessName);
      renderJourneyStatus(0);
    } else if (payload.researchStatus === 'not_in_category' || payload.researchStatus === 'rate_limited') {
      showDiagError(payload.message || 'This request could not be researched right now.');
      renderJourneyStatus(0);
    } else {
      showDiagError(RESEARCH_STATUS_MESSAGES[payload.researchStatus] || payload.message || 'Please try again in a moment.');
      renderJourneyStatus(0);
    }
  } catch (err) {
    showDiagError('Could not reach the live diagnostic workflow. Please try again.');
    renderJourneyStatus(0);
  } finally {
    document.getElementById('runDiagnosticBtn').disabled = false;
  }
}

async function issueProposal() {
  const j = state.journey;
  if (!j.diagnosticResult || j.selectedOpportunities.length === 0) return;

  // Issue Proposal's own validation requires diagnosticFinding.description --
  // only research[] items have that shape (description/evidence/source).
  // standard[]/clientRequested[] items don't, regardless of which the visitor
  // selected as an opportunity to build. renderOpportunityPicker() already
  // keeps "Send Me a Proposal" disabled unless a real research finding exists.
  const finding = (j.diagnosticResult.research && j.diagnosticResult.research[0]) || null;
  if (!finding) {
    showDiagError('A proposal needs at least one research finding, which this business doesn’t have yet.');
    return;
  }

  const currentSystem = document.getElementById('diagCurrentSystemInput').value.trim();
  const senderEmail = document.getElementById('diagSenderEmailInput').value.trim();
  if (!currentSystem || !senderEmail) {
    showDiagError('Please answer both connection questions above so we know what your automation needs to connect to.');
    return;
  }

  document.getElementById('issueProposalBtn').disabled = true;
  renderJourneyStatus(3); // PROPOSAL SENT (about to be)

  try {
    const { ok, payload } = await postRelay('/api/trigger-demo', {
      target: 'proposal',
      requestId: j.requestId,
      category: j.category,
      businessName: j.form.businessName,
      contactName: j.form.contactName,
      contactRole: j.form.contactRole,
      contactEmail: j.form.contactEmail,
      mode: j.mode,
      selectedOpportunities: j.selectedOpportunities,
      diagnosticFinding: finding,
      currentTools: j.form.currentTools,
      scale: j.form.scale,
      integrationNeeds: j.form.integrationNeeds,
      currentSystem: currentSystem,
      senderEmail: senderEmail
    });

    if (!ok || payload.status !== 'proposal_issued') {
      showDiagError((payload && payload.error) || 'Could not issue the proposal. Please try again.');
      renderJourneyStatus(2);
      return;
    }

    j.proposal = payload;
    renderJourneyStatus(4); // AWAITING YOUR DECISION
    renderProposalSent(payload);
  } catch (err) {
    showDiagError('Could not reach the proposal workflow. Please try again.');
    renderJourneyStatus(2);
  } finally {
    document.getElementById('issueProposalBtn').disabled = false;
  }
}

async function decideNow(decision) {
  const j = state.journey;
  if (!j.proposal || !j.proposal.token) return;

  document.getElementById('approveNowBtn').disabled = true;
  document.getElementById('requestChangesBtn').disabled = true;

  try {
    const res = await fetch('/api/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: j.proposal.token, decision: decision })
    });
    const payload = await res.json();

    j.decision = payload;
    if (payload.status === 'approved') {
      renderJourneyStatus(6); // APPROVED -> BUILD STARTED
      renderFinal(payload.message || 'Thank you — your build has started. A handover pack will follow by email once it is ready.');
      renderJourneyStatus(7); // HANDOVER ON THE WAY
    } else if (payload.status === 'changes_requested') {
      renderFinal(payload.message || 'Thanks — we’ve recorded your requested changes. We’ll follow up directly.');
    } else {
      showDiagError(payload.message || 'This proposal could not be updated. Please contact us directly.');
    }
  } catch (err) {
    showDiagError('Could not reach the approval workflow. Please try again, or use the link in your email.');
  } finally {
    document.getElementById('approveNowBtn').disabled = false;
    document.getElementById('requestChangesBtn').disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

function init() {
  renderCategorySelector();
  renderQuestionFields();
  renderJourneyStatus(-1);

  document.getElementById('diagBusinessNameInput').addEventListener('input', validateInquiryForm);
  document.getElementById('diagContactEmailInput').addEventListener('input', validateInquiryForm);
  document.getElementById('diagCurrentSystemInput').addEventListener('input', updateIssueProposalButton);
  document.getElementById('diagSenderEmailInput').addEventListener('input', updateIssueProposalButton);

  document.getElementById('diagModeSelect').addEventListener('change', (e) => {
    state.journey.mode = e.target.value === 'deep' ? 'deep' : 'standard';
    showModeTooltip(state.journey.mode);
    renderQuestionFields();
  });

  document.getElementById('diagInquiryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    runDiagnostic();
  });
  document.getElementById('issueProposalBtn').addEventListener('click', (e) => {
    e.preventDefault();
    issueProposal();
  });
  document.getElementById('approveNowBtn').addEventListener('click', (e) => {
    e.preventDefault();
    decideNow('approved');
  });
  document.getElementById('requestChangesBtn').addEventListener('click', (e) => {
    e.preventDefault();
    decideNow('changes_requested');
  });
}

// The script is deferred and sits at the end of <body>, so the DOM is already
// parsed by the time this runs. Calling init() straight away paints the
// JS-populated containers before first paint instead of one tick after it.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
