(function () {
  'use strict';

  var config = window.TRIP_CONFIG || {};
  var text = function (value, fallback) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  };
  var setText = function (selector, value) {
    var node = document.querySelector(selector);
    if (node) node.textContent = value;
  };

  document.title = text(config.title, 'New Trip') + ' — Trip Companion';
  setText('[data-trip-title]', text(config.title, 'New personalized trip'));
  setText('[data-trip-dates]', text(config.dateLabel, 'Dates to be confirmed'));
  setText('[data-trip-travelers]', text(config.travelerLabel, 'Traveler profile pending'));
  setText('[data-trip-summary]', text(config.summary, 'Questionnaire answers will shape the itinerary, recommendations, pace, and budget.'));

  var status = document.querySelector('[data-readiness]');
  if (status) {
    var required = ['title', 'dateLabel', 'travelerLabel', 'summary'];
    var completed = required.filter(function (key) { return text(config[key], '') !== ''; }).length;
    status.textContent = completed === required.length
      ? 'Questionnaire handoff received. This trip is ready for research.'
      : 'Waiting for a completed questionnaire handoff.';
  }
}());
