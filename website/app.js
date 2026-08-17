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
    business_name: "Nick's Plumbing & Air Conditioning",
    industry: 'Plumbing & HVAC',
    tagline: 'Emergency & scheduled plumbing / HVAC services',
    services: ['Emergency plumbing', 'Leak repair', 'Drain cleaning', 'Water heater', 'Pipe repair', 'Installation'],
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
      return `Hi ${data.name}, thanks for reaching out to Nick's Plumbing & Air Conditioning about ${data.service.toLowerCase()}. `
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
  metrics: { newLeads: 0, qualifiedLeads: 0, followUps: 0, appointments: 0, conversionOpportunity: 0 }
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

function fieldHtml(field) {
  const req = field.required ? 'required' : '';
  if (field.type === 'select') {
    const opts = field.options.map((o) => `<option value="${o}">${o}</option>`).join('');
    return `<select id="f_${field.id}" name="${field.id}" ${req}><option value="">Select...</option>${opts}</select>`;
  }
  if (field.type === 'textarea') {
    return `<textarea id="f_${field.id}" name="${field.id}" ${req}></textarea>`;
  }
  return `<input type="${field.type}" id="f_${field.id}" name="${field.id}" ${req}>`;
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

function renderWorkflowViz(activeIndex) {
  const el = document.getElementById('workflowViz');
  el.innerHTML = '';
  WORKFLOW_STEPS.forEach((step, i) => {
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
}

document.addEventListener('DOMContentLoaded', init);
