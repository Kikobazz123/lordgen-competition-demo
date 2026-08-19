/**
 * LordGen AI — Interactive Demo
 *
 * IMPORTANT: This is a client-side SIMULATION. No network calls are made to any
 * live service, no API keys exist here, and nothing is actually sent anywhere.
 * It reproduces the shape of the real, separately-built-and-tested n8n automation
 * (see workflows/competition-demo.json) so a judge can see the workflow story
 * without a public page being wired to a real webhook/email-sending system.
 *
 * Config-driven: each business is a BUSINESS_PRESETS entry (business_name,
 * industry, services, intake_fields, classify(), responseTemplate()).
 * Adding a new business = adding one preset object, no other code changes.
 */

const WORKFLOW_STEPS = [
  'NEW INQUIRY',
  'AI ANALYSIS',
  'LEAD QUALIFICATION',
  'RESPONSE GENERATED',
  'FOLLOW-UP ACTION',
  'CRM / TASK / APPOINTMENT'
];

const PROCESSING_MESSAGES = [
  'Receiving inquiry...',
  'Analyzing customer intent...',
  'Qualifying lead...',
  'Generating response...',
  'Creating recommended action...'
];

const URGENCY_KEYWORDS = ['emergency', 'urgent', 'asap', 'today', 'now', 'flooding', 'flooded', 'burst', 'immediately', 'no power', "can't wait"];

// Business Diagnostic Demo (P0 live trigger) -- see docs/architecture.md's
// "Pending: Competition Live-Demo Trigger" section. Real state transitions
// only, per LORDGEN_COMPETITION_LIVE_DEMO_ADDENDUM.md section 13: every label
// below is set at the moment of a real event (button click, fetch sent, fetch
// resolved) -- never on a timer.
const DIAGNOSTIC_STATUS_STEPS = [
  'RECEIVED', 'RESEARCH RUNNING', 'RESEARCH COMPLETE', 'DIAGNOSTIC READY',
  'AWAITING APPROVAL', 'APPROVED', 'BUILDING AUTOMATION', 'AUTOMATION SPEC READY', 'DEVELOPER BRIEF READY'
];

// Per-business template menu, addendum section 11. The automation-builder
// workflow turns the selected subset into a real specification.
const AUTOMATION_TEMPLATES = {
  plumbing: ['Lead Capture Agent', 'Sales Follow-Up Agent', 'WhatsApp Response Agent', 'Appointment Agent', 'CRM Handoff'],
  real_estate: ['Property Lead Agent', 'Lead Qualification Agent', 'Viewing Scheduler', 'Follow-Up Agent', 'CRM Handoff'],
  salon: ['Booking Agent', 'WhatsApp Customer Agent', 'Reminder Agent', 'Retention Agent', 'CRM Handoff']
};

function scanForUrgencyBoost(formData) {
  const text = Object.values(formData).join(' ').toLowerCase();
  return URGENCY_KEYWORDS.some((kw) => text.includes(kw));
}

function bumpPriority(priority) {
  if (priority === 'STANDARD') return 'MEDIUM';
  if (priority === 'MEDIUM') return 'HIGH';
  return priority;
}

const BUSINESS_PRESETS = {

  plumbing: {
    id: 'plumbing',
    icon: '\u{1F527}',
    business_name: "Ridgeline Plumbing & Air",
    industry: 'Plumbing & HVAC',
    tagline: 'Emergency & scheduled plumbing / HVAC services',
    services: ['Emergency plumbing', 'Leak repair', 'Drain cleaning', 'Water heater', 'Pipe repair', 'Installation'],
    problem: "A customer was shown one price on the technician's tablet and billed a different, higher amount later, with no easy way to get a readable copy of the terms.",
    specialRequest: '',
    hasRealResearch: true,
    intake_fields: [
      { id: 'name', label: 'Customer Name', type: 'text', required: true },
      { id: 'phone', label: 'Phone', type: 'tel', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
      { id: 'service', label: 'Service Required', type: 'select', options: null, required: true },
      { id: 'location', label: 'Property / Location', type: 'text', required: true },
      { id: 'urgency', label: 'Urgency', type: 'select', options: ['Emergency', 'Urgent', 'Routine'], required: true },
      { id: 'appointment', label: 'Preferred Appointment Time', type: 'text', required: false },
      { id: 'description', label: 'Description of the Problem', type: 'textarea', required: true }
    ],
    classify(data) {
      const boost = scanForUrgencyBoost(data);
      let status, intent, priority, action;
      if (data.urgency === 'Emergency') {
        status = 'HOT LEAD'; intent = 'Emergency Service Request'; priority = 'HIGH';
        action = 'Contact customer immediately';
      } else if (data.urgency === 'Urgent') {
        status = 'WARM LEAD'; intent = 'Time-Sensitive Service Request'; priority = 'MEDIUM';
        action = 'Schedule within 24 hours';
      } else {
        status = 'WARM LEAD'; intent = 'Scheduled Service Request'; priority = 'STANDARD';
        action = "Schedule at the customer's preferred time";
      }
      if (boost && priority !== 'HIGH') { priority = bumpPriority(priority); action = 'Escalate for same-day contact'; }
      return { status, intent, priority, action };
    },
    responseTemplate(data) {
      return `Hi ${data.name}, thanks for reaching out to Ridgeline Plumbing & Air about ${data.service.toLowerCase()}. `
        + `We've logged your request for ${data.location}${data.appointment ? ` and noted your preferred time (${data.appointment})` : ''}. `
        + `A technician will follow up shortly to confirm details before anything is scheduled or billed.`;
    }
  },

  real_estate: {
    id: 'real_estate',
    icon: '\u{1F3E1}',
    business_name: 'Harborview Realty Group',
    industry: 'Real Estate & Property Services',
    tagline: 'Buy, sell, rent, and property management inquiries',
    services: ['Buy', 'Sell', 'Rent', 'Property Management'],
    problem: 'Leads go cold in the gap between an initial inquiry and the first agent follow-up.',
    specialRequest: 'Faster, WhatsApp-style follow-up on new leads.',
    hasRealResearch: false,
    intake_fields: [
      { id: 'name', label: 'Name', type: 'text', required: true },
      { id: 'phone', label: 'Phone', type: 'tel', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
      { id: 'transactionType', label: 'I want to...', type: 'select', options: ['Buy', 'Sell', 'Rent', 'Property Management'], required: true },
      { id: 'propertyType', label: 'Preferred Property Type', type: 'select', options: ['Single-family home', 'Condo/Townhouse', 'Multi-family', 'Commercial', 'Land'], required: true },
      { id: 'location', label: 'Location', type: 'text', required: true },
      { id: 'budget', label: 'Budget', type: 'text', required: false },
      { id: 'bedrooms', label: 'Number of Bedrooms', type: 'select', options: ['Studio', '1', '2', '3', '4+'], required: false },
      { id: 'timeline', label: 'Timeline', type: 'select', options: ['Immediately (0-30 days)', '1-3 months', '3-6 months', 'Just researching'], required: true },
      { id: 'notes', label: 'Additional Requirements', type: 'textarea', required: false }
    ],
    classify(data) {
      const boost = scanForUrgencyBoost(data);
      let status, priority, action;
      if (data.timeline === 'Immediately (0-30 days)') { status = 'HOT LEAD'; priority = 'HIGH'; }
      else if (data.timeline === '1-3 months') { status = 'WARM LEAD'; priority = 'MEDIUM'; }
      else { status = 'NEW LEAD'; priority = 'STANDARD'; }
      const intentMap = {
        Buy: 'Active Buyer Inquiry', Sell: 'Seller / Listing Inquiry',
        Rent: 'Rental Inquiry', 'Property Management': 'Property Management Inquiry'
      };
      const actionMap = {
        Buy: 'Send matching listings and schedule a showing',
        Sell: 'Schedule a listing consultation',
        Rent: 'Send available rental options',
        'Property Management': 'Schedule a portfolio review call'
      };
      action = status === 'HOT LEAD' ? `${actionMap[data.transactionType]} — today` : actionMap[data.transactionType];
      if (boost && priority !== 'HIGH') priority = bumpPriority(priority);
      return { status, intent: intentMap[data.transactionType], priority, action };
    },
    responseTemplate(data) {
      return `Hi ${data.name}, thanks for reaching out to Harborview Realty Group. We understand you're looking to ${data.transactionType.toLowerCase()} `
        + `a ${data.propertyType.toLowerCase()} in ${data.location}${data.budget ? ` around ${data.budget}` : ''}. `
        + `An agent will follow up with options that match what you're looking for.`;
    }
  },

  salon: {
    id: 'salon',
    icon: '\u{1F484}',
    business_name: 'Luxe Studio Salon & Beauty',
    industry: 'Salon & Beauty',
    tagline: 'Hair, nails, makeup, and beauty consultations',
    services: ['Hair styling', 'Braids', 'Nails', 'Makeup', 'Facial', 'Beauty consultation'],
    problem: "New clients often book once and don't return, with no structured rebooking outreach.",
    specialRequest: 'Automatic reminders and a way to bring past clients back.',
    hasRealResearch: false,
    intake_fields: [
      { id: 'name', label: 'Name', type: 'text', required: true },
      { id: 'phone', label: 'Phone', type: 'tel', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
      { id: 'service', label: 'Service', type: 'select', options: null, required: true },
      { id: 'stylist', label: 'Preferred Stylist', type: 'text', required: false },
      { id: 'date', label: 'Preferred Date', type: 'text', required: true },
      { id: 'time', label: 'Preferred Time', type: 'text', required: false },
      { id: 'customerType', label: 'New or Returning Customer', type: 'select', options: ['New Customer', 'Returning Customer'], required: true },
      { id: 'request', label: 'Special Request', type: 'textarea', required: false }
    ],
    classify(data) {
      const boost = scanForUrgencyBoost(data);
      let status, intent, priority, action;
      if (data.customerType === 'New Customer') {
        status = 'NEW CLIENT LEAD'; intent = 'First-Time Booking Inquiry'; priority = 'MEDIUM';
        action = 'Send new-client welcome + booking confirmation';
      } else {
        status = 'REPEAT BOOKING'; intent = 'Returning Client Booking'; priority = 'STANDARD';
        action = `Confirm appointment${data.stylist ? ` with ${data.stylist}` : ''}`;
      }
      if (boost) { priority = 'HIGH'; action = 'Contact client directly to accommodate the request'; }
      return { status, intent, priority, action };
    },
    responseTemplate(data) {
      return `Hi ${data.name}, thanks for reaching out to Luxe Studio Salon & Beauty! We've got your request for ${data.service.toLowerCase()} `
        + `on ${data.date}${data.time ? ` around ${data.time}` : ''}${data.stylist ? ` with ${data.stylist}` : ''} noted. `
        + `We'll confirm your appointment shortly.`;
    }
  }
};

// Fill in select-with-null-options (i.e. "use this preset's services list") after definition
BUSINESS_PRESETS.plumbing.intake_fields.find((f) => f.id === 'service').options = BUSINESS_PRESETS.plumbing.services;
BUSINESS_PRESETS.salon.intake_fields.find((f) => f.id === 'service').options = BUSINESS_PRESETS.salon.services;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const state = {
  currentPresetId: 'plumbing',
  metrics: { newLeads: 0, qualifiedLeads: 0, followUps: 0, appointments: 0, conversionOpportunity: 0 },
  diagnostic: {
    presetId: 'plumbing',
    result: null,
    selectedAgents: [],
    buildResult: null
  }
};

const METRIC_DEFS = [
  { id: 'newLeads', label: 'New Leads' },
  { id: 'qualifiedLeads', label: 'Qualified Leads' },
  { id: 'followUps', label: 'Follow-ups' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'conversionOpportunity', label: 'Conversion Opportunity' }
];

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function currentPreset() { return BUSINESS_PRESETS[state.currentPresetId]; }

function renderBusinessSelector() {
  const el = document.getElementById('businessSelector');
  el.innerHTML = '';
  Object.values(BUSINESS_PRESETS).forEach((preset) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'business-tab' + (preset.id === state.currentPresetId ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', preset.id === state.currentPresetId ? 'true' : 'false');
    btn.innerHTML = `<span class="tab-icon">${preset.icon}</span> ${preset.industry}`;
    btn.addEventListener('click', () => selectBusiness(preset.id));
    el.appendChild(btn);
  });
}

function selectBusiness(id) {
  state.currentPresetId = id;
  renderBusinessSelector();
  renderIntakeForm();
  resetDemoPanels();
}

// Contact fields carry the same ids across all three presets, so browsers can
// autofill them. Without this Chrome reports the inputs as missing autocomplete.
const AUTOCOMPLETE = { name: 'name', phone: 'tel', email: 'email' };

function fieldHtml(field) {
  const req = field.required ? 'required' : '';
  const auto = AUTOCOMPLETE[field.id] ? ` autocomplete="${AUTOCOMPLETE[field.id]}"` : '';
  if (field.type === 'select') {
    const opts = field.options.map((o) => `<option value="${o}">${o}</option>`).join('');
    return `<select id="f_${field.id}" name="${field.id}" ${req}><option value="">Select...</option>${opts}</select>`;
  }
  if (field.type === 'textarea') {
    return `<textarea id="f_${field.id}" name="${field.id}" ${req}></textarea>`;
  }
  return `<input type="${field.type}" id="f_${field.id}" name="${field.id}"${auto} ${req}>`;
}

function renderIntakeForm() {
  const preset = currentPreset();
  document.getElementById('intakeBusinessName').textContent = preset.business_name;
  document.getElementById('intakeEyebrow').textContent = `New Inquiry — ${preset.industry}`;

  const wrap = document.getElementById('formFields');
  wrap.innerHTML = '';
  preset.intake_fields.forEach((field) => {
    const div = document.createElement('div');
    div.className = 'field';
    div.dataset.fieldId = field.id;
    div.innerHTML = `<label for="f_${field.id}">${field.label}${field.required ? ' *' : ''}</label>${fieldHtml(field)}<span class="field-error">This field is required.</span>`;
    wrap.appendChild(div);
  });

  renderWorkflowViz(-1);
}

function renderStepViz(elId, steps, activeIndex) {
  const el = document.getElementById(elId);
  el.innerHTML = '';
  steps.forEach((step, i) => {
    if (i > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'wf-arrow';
      arrow.textContent = '→';
      el.appendChild(arrow);
    }
    const chip = document.createElement('span');
    chip.className = 'wf-step' + (i === activeIndex ? ' active' : i < activeIndex ? ' done' : '');
    chip.textContent = step;
    el.appendChild(chip);
  });
}

function renderWorkflowViz(activeIndex) {
  renderStepViz('workflowViz', WORKFLOW_STEPS, activeIndex);
}

function renderDiagStatus(activeIndex) {
  renderStepViz('diagStatusViz', DIAGNOSTIC_STATUS_STEPS, activeIndex);
}

function pushActivityFeed(message) {
  const el = document.getElementById('activityFeed');
  const empty = el.querySelector('.feed-empty');
  if (empty) empty.remove();
  const li = document.createElement('li');
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  li.innerHTML = `<span class="feed-time">${hh}:${mm}</span><span>${message}</span>`;
  el.insertBefore(li, el.firstChild);
}

function renderDashboard() {
  const el = document.getElementById('dashboardMetrics');
  el.innerHTML = '';
  METRIC_DEFS.forEach((m) => {
    const tile = document.createElement('div');
    tile.className = 'metric-tile';
    tile.innerHTML = `<div class="metric-value" id="metric_${m.id}">${state.metrics[m.id]}</div><div class="metric-label">${m.label}</div>`;
    el.appendChild(tile);
  });
}

function bumpMetric(id) {
  state.metrics[id] += 1;
  const valueEl = document.getElementById(`metric_${id}`);
  if (valueEl) {
    valueEl.textContent = state.metrics[id];
    valueEl.classList.add('bump');
    setTimeout(() => valueEl.classList.remove('bump'), 500);
  }
}

// ---------------------------------------------------------------------------
// Form handling
// ---------------------------------------------------------------------------

function collectFormData(preset) {
  const data = {};
  let valid = true;
  preset.intake_fields.forEach((field) => {
    const input = document.getElementById(`f_${field.id}`);
    const value = input.value.trim();
    const fieldDiv = input.closest('.field');
    const isInvalid = field.required && !value;
    fieldDiv.classList.toggle('invalid', isInvalid);
    if (isInvalid) valid = false;
    data[field.id] = value;
  });
  return { data, valid };
}

function resetDemoPanels() {
  document.getElementById('intakeForm').hidden = false;
  document.getElementById('intakeForm').closest('.intake-panel').hidden = false;
  document.getElementById('processingPanel').hidden = true;
  document.getElementById('analysisPanel').hidden = true;
  document.getElementById('submitBtn').disabled = false;
  renderWorkflowViz(-1);
}

function runProcessing(preset, formData) {
  document.querySelector('.intake-panel').hidden = true;
  document.getElementById('processingPanel').hidden = false;

  const stepsEl = document.getElementById('processingSteps');
  stepsEl.innerHTML = PROCESSING_MESSAGES.map((msg) => `<li><span class="step-dot"></span><span>${msg}</span></li>`).join('');
  const liEls = Array.from(stepsEl.children);

  pushActivityFeed(`New inquiry received (${preset.business_name})`);
  renderWorkflowViz(0);
  bumpMetric('newLeads');

  let i = 0;
  const workflowMap = [1, 1, 2, 3, 4]; // maps processing step -> workflow viz index
  const interval = setInterval(() => {
    if (i > 0) liEls[i - 1].className = 'done';
    if (i < liEls.length) {
      liEls[i].className = 'active';
      renderWorkflowViz(workflowMap[i]);
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => finishProcessing(preset, formData), 400);
    }
  }, 550);
}

function finishProcessing(preset, formData) {
  const result = preset.classify(formData);
  const response = preset.responseTemplate(formData);

  document.getElementById('processingPanel').hidden = true;
  document.getElementById('analysisPanel').hidden = false;

  const statusEl = document.getElementById('leadStatus');
  statusEl.textContent = result.status;
  statusEl.className = 'tile-value ' + statusClass(result.status);

  document.getElementById('leadIntent').textContent = result.intent;

  const priorityEl = document.getElementById('leadPriority');
  priorityEl.textContent = result.priority;
  priorityEl.className = 'tile-value priority-' + result.priority.toLowerCase();

  document.getElementById('leadAction').textContent = result.action;
  document.getElementById('aiResponseText').textContent = response;

  pushActivityFeed(`AI classified lead as <strong>${result.priority} priority</strong>`);
  pushActivityFeed('Response generated');
  pushActivityFeed('Follow-up task created');
  pushActivityFeed('Lead added to CRM (simulated)');

  bumpMetric('qualifiedLeads');
  bumpMetric('followUps');
  if (result.priority === 'HIGH') bumpMetric('appointments');
  bumpMetric('conversionOpportunity');

  renderWorkflowViz(5);
}

function statusClass(status) {
  if (status.startsWith('HOT')) return 'status-hot';
  if (status.startsWith('WARM')) return 'status-warm';
  return 'status-new';
}

// ---------------------------------------------------------------------------
// Business Diagnostic Demo (P0 live trigger)
//
// Unlike the New Inquiry demo above, this section makes a real network call
// -- fetch('/api/trigger-demo') -- to a same-origin serverless relay that
// forwards to a live, running n8n workflow with the auth token attached
// server-side (see website/api/trigger-demo.js). Only the plumbing preset
// has a real workflow behind it; the other two presets are disabled here
// and point back to the fully-simulated New Inquiry demo above, per the P0
// plan's explicit instruction not to build a second live branch for them.
// ---------------------------------------------------------------------------

function diagCurrentPreset() { return BUSINESS_PRESETS[state.diagnostic.presetId]; }

function renderDiagBusinessSelector() {
  const el = document.getElementById('diagBusinessSelector');
  el.innerHTML = '';
  Object.values(BUSINESS_PRESETS).forEach((preset) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'business-tab' + (preset.id === state.diagnostic.presetId ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', preset.id === state.diagnostic.presetId ? 'true' : 'false');
    btn.innerHTML = `<span class="tab-icon">${preset.icon}</span> ${preset.industry}`;
    btn.addEventListener('click', () => selectDiagBusiness(preset.id));
    el.appendChild(btn);
  });
}

function selectDiagBusiness(id) {
  state.diagnostic.presetId = id;
  state.diagnostic.result = null;
  state.diagnostic.selectedAgents = [];
  state.diagnostic.buildResult = null;
  renderDiagBusinessSelector();
  renderDiagRequestReadout();
  resetDiagnosticResultPanels();
  renderDiagStatus(-1);
}

function renderDiagRequestReadout() {
  const preset = diagCurrentPreset();
  document.getElementById('diagBusinessName').textContent = preset.business_name;
  document.getElementById('diagProblem').textContent = preset.problem;
  document.getElementById('diagSpecialRequest').textContent = preset.specialRequest || '—';
  document.getElementById('diagNotLiveNote').hidden = preset.hasRealResearch;
  document.getElementById('runDiagnosticBtn').disabled = !preset.hasRealResearch;
}

function resetDiagnosticResultPanels() {
  document.getElementById('diagResultsPanel').hidden = true;
  document.getElementById('diagAgentsPanel').hidden = true;
  document.getElementById('diagSpecPanel').hidden = true;
  document.getElementById('diagError').hidden = true;
}

function showDiagError(message) {
  const el = document.getElementById('diagError');
  el.textContent = message;
  el.hidden = false;
}

function findingItemHtml(item) {
  const badge = item.tier || item.confidence || '';
  const body = item.description || item.reasoning || item.proposedSolution || item.objective || '';
  return `<li><div class="diag-finding-title">${item.title}</div>`
    + (badge ? `<span class="diag-badge diag-badge-${badge.toLowerCase()}">${badge}</span>` : '')
    + `<p>${body}</p></li>`;
}

function renderDiagResults(data) {
  document.getElementById('diagResultsPanel').hidden = false;
  document.getElementById('diagStandardList').innerHTML = data.standard.map(findingItemHtml).join('');
  document.getElementById('diagResearchList').innerHTML = data.research.map(findingItemHtml).join('');
  document.getElementById('diagClientRequestedList').innerHTML = data.clientRequested.map(findingItemHtml).join('');
  document.getElementById('diagSources').textContent = 'Sources: ' + data.sources.map((s) => s.name).join(' · ');
}

function renderDiagAgents() {
  const preset = diagCurrentPreset();
  const templates = AUTOMATION_TEMPLATES[preset.id] || [];
  const el = document.getElementById('diagAgentList');
  el.innerHTML = '';
  templates.forEach((name) => {
    const label = document.createElement('label');
    label.className = 'diag-agent-option';
    label.innerHTML = `<input type="checkbox" value="${name}"> ${name}`;
    label.querySelector('input').addEventListener('change', (e) => {
      const selected = state.diagnostic.selectedAgents;
      const idx = selected.indexOf(name);
      if (e.target.checked && idx === -1) selected.push(name);
      else if (!e.target.checked && idx > -1) selected.splice(idx, 1);
    });
    el.appendChild(label);
  });
  document.getElementById('diagAgentsPanel').hidden = false;
}

function renderDiagSpec(data) {
  document.getElementById('diagSpecPanel').hidden = false;
  document.getElementById('diagSpecName').textContent = data.automationName;
  document.getElementById('diagSpecTrigger').textContent = data.trigger;
  document.getElementById('diagSpecInputs').innerHTML = data.inputs.map((i) => `<li>${i}</li>`).join('');
  document.getElementById('diagSpecSteps').innerHTML = data.steps.map((s) => `<li>${s}</li>`).join('');
  document.getElementById('diagSpecIntegrations').innerHTML = data.integrations.map((i) => `<li>${i}</li>`).join('');
  document.getElementById('diagSpecNotes').innerHTML = data.developerNotes.map((n) => `<li>${n}</li>`).join('');
  document.getElementById('diagSpecStatus').textContent = 'Status: ' + data.status.toUpperCase();
}

async function runDiagnostic() {
  const preset = diagCurrentPreset();
  if (!preset.hasRealResearch) return;

  resetDiagnosticResultPanels();
  state.diagnostic.result = null;
  state.diagnostic.selectedAgents = [];
  state.diagnostic.buildResult = null;
  renderDiagStatus(1); // RECEIVED (done) -> RESEARCH RUNNING (active): real click + real fetch about to be sent
  document.getElementById('runDiagnosticBtn').disabled = true;

  try {
    const res = await fetch('/api/trigger-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'diagnostic', businessId: preset.id, problem: preset.problem, specialRequest: preset.specialRequest })
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Diagnostic request failed');

    state.diagnostic.result = payload;
    if (payload.hasRealResearch) {
      renderDiagStatus(4); // RESEARCH COMPLETE + DIAGNOSTIC READY (done) -> AWAITING APPROVAL (active): real response arrived
      renderDiagResults(payload);
      renderDiagAgents();
    } else {
      showDiagError(payload.message || 'Live diagnostic research is not connected for this business.');
    }
  } catch (err) {
    showDiagError('Could not reach the live diagnostic workflow. Please try again.');
  } finally {
    document.getElementById('runDiagnosticBtn').disabled = false;
  }
}

async function approveDiagnostic() {
  const preset = diagCurrentPreset();
  const selectedAgents = state.diagnostic.selectedAgents;

  document.getElementById('diagError').hidden = true;
  renderDiagStatus(6); // APPROVED (done) -> BUILDING AUTOMATION (active): real click + real fetch about to be sent
  document.getElementById('approveDiagnosticBtn').disabled = true;

  try {
    const res = await fetch('/api/trigger-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'approve', businessId: preset.id, selectedAgents: selectedAgents, approvedBy: 'Judge (competition demo)' })
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Automation build request failed');

    if (payload.status === 'demo-build-ready') {
      state.diagnostic.buildResult = payload;
      renderDiagStatus(8); // AUTOMATION SPEC READY + DEVELOPER BRIEF READY: real response arrived
      renderDiagSpec(payload);
    } else {
      showDiagError(payload.message || 'Automation build is not available for this business.');
    }
  } catch (err) {
    showDiagError('Could not reach the automation-builder workflow. Please try again.');
  } finally {
    document.getElementById('approveDiagnosticBtn').disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

function init() {
  renderBusinessSelector();
  renderIntakeForm();
  renderDashboard();

  document.getElementById('intakeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const preset = currentPreset();
    const { data, valid } = collectFormData(preset);
    if (!valid) return;
    document.getElementById('submitBtn').disabled = true;
    runProcessing(preset, data);
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('intakeForm').reset();
    resetDemoPanels();
  });

  document.getElementById('demoModeInfo').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('demoModeModal').hidden = false;
  });
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('demoModeModal').hidden = true;
  });

  renderDiagBusinessSelector();
  renderDiagRequestReadout();
  renderDiagStatus(-1);
  document.getElementById('runDiagnosticBtn').addEventListener('click', runDiagnostic);
  document.getElementById('approveDiagnosticBtn').addEventListener('click', approveDiagnostic);
}

// The script is deferred and sits at the end of <body>, so the DOM is already
// parsed by the time this runs. Calling init() straight away paints the
// JS-populated containers (selector, form, dashboard, workflow) before first
// paint instead of one tick after it, which is what caused the layout shift.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
