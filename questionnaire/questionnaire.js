(function () {
  'use strict';

  var STORAGE_KEY = 'trip-companion-questionnaire-v1';
  var form = document.getElementById('trip-questionnaire');
  if (!form) return;
  var steps = Array.prototype.slice.call(form.querySelectorAll('.form-step'));
  var current = 0;
  var previous = document.getElementById('previous-step');
  var next = document.getElementById('next-step');
  var progressLabel = document.getElementById('progress-label');
  var progressBar = document.getElementById('progress-bar');
  var saveState = document.getElementById('save-state');
  var error = document.getElementById('form-error');
  var review = document.getElementById('review-summary');
  var comparison = document.getElementById('traveler-comparison');
  var saveTimer;

  function clean(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function lines(value) {
    return clean(value).split(/\n|,/).map(function (item) { return item.trim(); }).filter(Boolean);
  }

  function checked(group) {
    return Array.prototype.slice.call(form.querySelectorAll('[data-choice="' + group + '"] input:checked')).map(function (input) { return input.value; });
  }

  function value(name) {
    var field = form.elements.namedItem(name);
    if (!field) return '';
    if (field.type === 'checkbox') return field.checked;
    return clean(field.value);
  }

  function draft() {
    var values = {};
    Array.prototype.slice.call(form.elements).forEach(function (field) {
      if (!field.name || field.type === 'checkbox' || field.type === 'button') return;
      values[field.name] = field.value;
    });
    values.publicGuideAllowed = value('publicGuideAllowed');
    values.privacyConfirmed = value('privacyConfirmed');
    values.splurgePriorities = checked('splurgePriorities');
    values.interests = checked('interests');
    return { version: 1, savedAt: new Date().toISOString(), currentStep: current, values: values };
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft()));
      saveState.textContent = 'Saved on this device';
    } catch (saveError) {
      saveState.textContent = 'Could not save on this device';
    }
  }

  function scheduleSave() {
    saveState.textContent = 'Saving…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 250);
  }

  function setChoice(group, values) {
    var selected = Array.isArray(values) ? values : [];
    Array.prototype.slice.call(form.querySelectorAll('[data-choice="' + group + '"] input')).forEach(function (input) {
      input.checked = selected.indexOf(input.value) > -1;
    });
  }

  function restore() {
    try {
      var stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored || stored.version !== 1 || !stored.values) return;
      Object.keys(stored.values).forEach(function (name) {
        if (name === 'splurgePriorities' || name === 'interests') return;
        var field = form.elements.namedItem(name);
        if (!field) return;
        if (field.type === 'checkbox') field.checked = Boolean(stored.values[name]);
        else field.value = stored.values[name];
      });
      setChoice('splurgePriorities', stored.values.splurgePriorities);
      setChoice('interests', stored.values.interests);
      current = Math.max(0, Math.min(steps.length - 1, Number(stored.currentStep) || 0));
      saveState.textContent = 'Draft resumed on this device';
    } catch (restoreError) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function updateComparison() {
    var count = Number(value('travelerCount')) || 1;
    comparison.hidden = count < 2;
  }

  function show(index) {
    current = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach(function (step, stepIndex) {
      var active = stepIndex === current;
      step.hidden = !active;
      step.classList.toggle('active', active);
    });
    progressLabel.textContent = 'Step ' + (current + 1) + ' of ' + steps.length;
    progressBar.style.width = (((current + 1) / steps.length) * 100) + '%';
    previous.disabled = current === 0;
    next.hidden = current === steps.length - 1;
    error.hidden = true;
    if (current === steps.length - 1) renderReview();
    updateComparison();
    scheduleSave();
    steps[current].focus({ preventScroll: true });
    window.scrollTo({ top: document.querySelector('.progress-shell').offsetTop, behavior: 'smooth' });
  }

  function validateStep() {
    error.hidden = true;
    if (current === 0) {
      if (!value('destinations')) return fail('Add at least one destination idea before continuing.');
      if (!value('startDate') || !value('endDate')) return fail('Add the earliest departure and latest return dates before continuing.');
      if (value('startDate') && value('endDate') && value('startDate') > value('endDate')) return fail('The return date must be after the departure date.');
    }
    if (current === 1) {
      var count = Number(value('travelerCount'));
      if (!Number.isFinite(count) || count < 1 || count > 20) return fail('Enter between 1 and 20 travelers.');
    }
    return true;
  }

  function fail(message) {
    error.textContent = message;
    error.hidden = false;
    error.scrollIntoView({ block: 'center' });
    return false;
  }

  function summaryCard(title, entries) {
    var card = document.createElement('section');
    card.className = 'review-card';
    var heading = document.createElement('h3');
    heading.textContent = title;
    card.appendChild(heading);
    entries.filter(function (entry) { return entry[1] && (!Array.isArray(entry[1]) || entry[1].length); }).forEach(function (entry) {
      var line = document.createElement('p');
      var strong = document.createElement('strong');
      strong.textContent = entry[0] + ': ';
      line.appendChild(strong);
      line.appendChild(document.createTextNode(Array.isArray(entry[1]) ? entry[1].join(', ') : String(entry[1])));
      card.appendChild(line);
    });
    return card;
  }

  function renderReview() {
    review.replaceChildren(
      summaryCard('Trip', [['Destination', value('destinations')], ['Dates', [value('startDate'), value('endDate')].filter(Boolean).join(' to ')], ['Origin', value('origin')]]),
      summaryCard('Travelers', [['Group', value('travelerCount') + ' · ' + value('groupType')], ['Accessibility', value('accessibilityNeeds')], ['Traveler 1 priorities', value('travelerOnePriorities')], ['Traveler 2 priorities', value('travelerTwoPriorities')]]),
      summaryCard('Budget and style', [['Total budget', value('totalBudget') ? value('currency') + ' ' + value('totalBudget') : ''], ['Lodging', value('lodgingLevel')], ['Pace', value('pace')], ['Structure', value('structure')], ['Splurges', checked('splurgePriorities')]]),
      summaryCard('Interests and food', [['Top interests', value('rankedInterests')], ['Selected interests', checked('interests')], ['Must try', value('mustTry')], ['Dietary needs', value('dietaryNeeds')], ['Allergies', value('allergies')]]),
      summaryCard('Priorities', [['Must do', value('mustDo')], ['Maybe', value('maybe')], ['Avoid', value('avoid')], ['Dream trip', value('dreamTripDescription')]])
    );
  }

  function handoff() {
    var count = Number(value('travelerCount')) || 1;
    var comparisonData = [];
    if (count > 1 && (value('travelerOnePriorities') || value('travelerTwoPriorities'))) {
      comparisonData.push({ travelerLabel: 'Traveler 1', priorities: lines(value('travelerOnePriorities')) });
      comparisonData.push({ travelerLabel: 'Traveler 2', priorities: lines(value('travelerTwoPriorities')) });
    }
    return {
      schemaVersion: 2,
      generatedAt: new Date().toISOString(),
      trip: {
        workingTitle: value('workingTitle'), destinations: lines(value('destinations')), startDate: value('startDate'), endDate: value('endDate'), dateFlexibility: value('dateFlexibility'), origin: value('origin')
      },
      travelers: {
        count: count, groupType: value('groupType'), agesOrLifeStages: lines(value('agesOrLifeStages')), accessibilityNeeds: lines(value('accessibilityNeeds')), preferenceComparison: comparisonData
      },
      budget: {
        total: value('totalBudget') ? Number(value('totalBudget')) : null, currency: value('currency') || 'USD', lodgingLevel: value('lodgingLevel'), dailyComfortRange: value('dailyComfortRange'), splurgePriorities: checked('splurgePriorities')
      },
      style: {
        pace: value('pace'), structure: value('structure'), famousVsHidden: value('famousVsHidden'), localVsSightseeing: value('localVsSightseeing'), morningPreference: value('morningPreference'), eveningPreference: value('eveningPreference'), walkingTolerance: value('walkingTolerance'), transitComfort: value('transitComfort')
      },
      interests: {
        ranked: lines(value('rankedInterests')), selected: checked('interests'), specialInterests: lines(value('specialInterests'))
      },
      food: {
        dietaryNeeds: lines(value('dietaryNeeds')), allergies: lines(value('allergies')), adventurousness: value('adventurousness'), mustTry: lines(value('mustTry')), avoid: lines(value('foodAvoid')), mealBudgetNotes: value('mealBudgetNotes')
      },
      priorities: {
        mustDo: lines(value('mustDo')), maybe: lines(value('maybe')), avoid: lines(value('avoid')), specialOccasions: lines(value('specialOccasions')), dreamTripDescription: value('dreamTripDescription')
      },
      planning: { confirmedFlights: [], confirmedLodging: [], confirmedReservations: [], researchLinks: [], openQuestions: [] },
      privacy: {
        publicGuideAllowed: value('publicGuideAllowed'), sensitiveFieldsProvided: false, travelerSpecificVisibilityRules: comparisonData.length ? ['Review traveler preference differences before creating shared recommendations.'] : []
      }
    };
  }

  function safeFilename() {
    var base = value('workingTitle') || value('destinations') || 'new-trip';
    return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) + '-questionnaire-handoff.json';
  }

  function containsSensitiveData() {
    var answers = Array.prototype.slice.call(form.elements).filter(function (field) {
      return field && typeof field.value === 'string';
    }).map(function (field) { return field.value; });
    var combined = answers.join(' ');
    return /\b(?:passport|credit\s*card|card\s*number|confirmation\s*(?:number|no\.?|#)|booking\s*(?:number|no\.?|#)|ticket\s*barcode)\b/i.test(combined) || answers.some(function (answer) {
      return /\b(?:\d[ -]?){13,19}\b/.test(answer);
    });
  }

  function readableSummary(data) {
    return [
      'TRIP COMPANION PLANNING BRIEF',
      '',
      'Trip: ' + (data.trip.workingTitle || data.trip.destinations.join(', ')),
      'Destinations: ' + data.trip.destinations.join(', '),
      'Dates: ' + [data.trip.startDate, data.trip.endDate].filter(Boolean).join(' to '),
      'Travelers: ' + data.travelers.count + ' · ' + data.travelers.groupType,
      'Budget: ' + (data.budget.total === null ? 'Not specified' : data.budget.currency + ' ' + data.budget.total),
      'Pace: ' + data.style.pace + ' · Structure: ' + data.style.structure,
      'Interests: ' + data.interests.selected.join(', '),
      'Must do: ' + data.priorities.mustDo.join(', '),
      'Avoid: ' + data.priorities.avoid.join(', '),
      'Dream trip: ' + data.priorities.dreamTripDescription
    ].join('\n');
  }

  previous.addEventListener('click', function () { show(current - 1); });
  next.addEventListener('click', function () { if (validateStep()) show(current + 1); });
  form.addEventListener('input', scheduleSave);
  form.addEventListener('change', function () { updateComparison(); scheduleSave(); });
  window.addEventListener('pagehide', save);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });

  document.getElementById('download-handoff').addEventListener('click', function () {
    if (!value('privacyConfirmed')) return fail('Confirm the privacy check before downloading the planning brief.');
    if (containsSensitiveData()) return fail('Possible sensitive information was detected. Remove passport, payment, confirmation-number, booking-number, or ticket-barcode details before downloading.');
    var blob = new Blob([JSON.stringify(handoff(), null, 2) + '\n'], { type: 'application/json' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = safeFilename();
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    saveState.textContent = 'Planning brief downloaded';
  });

  document.getElementById('copy-summary').addEventListener('click', function () {
    navigator.clipboard.writeText(readableSummary(handoff())).then(function () { saveState.textContent = 'Summary copied'; }).catch(function () { fail('Copy was unavailable. Download the planning brief instead.'); });
  });

  document.getElementById('clear-draft').addEventListener('click', function () {
    if (!window.confirm('Clear all questionnaire answers saved on this device?')) return;
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    current = 0;
    saveState.textContent = 'Draft cleared';
    show(0);
  });

  restore();
  show(current);
}());
