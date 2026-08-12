(function () {
  'use strict';

  var root = document.querySelector('[data-structured-trip]');
  if (!root) return;

  var source = root.getAttribute('data-trip-data');
  var audience = root.getAttribute('data-audience') || 'public';
  var status = root.querySelector('[data-trip-status]');
  var daysNode = root.querySelector('[data-trip-days]');

  function text(value, fallback) {
    return typeof value === 'string' && value.trim() ? value.trim() : (fallback || '');
  }

  function element(tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }

  function visible(item) {
    if (!item || !Array.isArray(item.audiences) || item.audiences.length === 0) return true;
    return item.audiences.indexOf('all') > -1 || item.audiences.indexOf(audience) > -1;
  }

  function formatDate(dateValue, fallback) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text(dateValue))) return fallback;
    var parts = dateValue.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
    }).format(new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])));
  }

  function addLinks(container, links) {
    var safeLinks = Array.isArray(links) ? links.filter(function (link) {
      return link && /^https:\/\//.test(text(link.url));
    }) : [];
    if (!safeLinks.length) return;
    var row = element('div', 'trip-link-row');
    safeLinks.forEach(function (link) {
      var anchor = element('a', 'trip-link', text(link.label, 'Open link'));
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      row.appendChild(anchor);
    });
    container.appendChild(row);
  }

  function renderActivities(section, activities) {
    var items = (Array.isArray(activities) ? activities : []).filter(visible);
    if (!items.length) return;
    var block = element('section', 'trip-section');
    block.appendChild(element('h3', '', 'Today’s itinerary'));
    var list = element('div', 'trip-activity-list');
    items.forEach(function (activity) {
      var card = element('article', 'trip-activity');
      card.appendChild(element('div', 'trip-time', text(activity.timeLabel, 'Flexible')));
      var content = element('div');
      content.appendChild(element('h4', '', text(activity.title, 'Planned activity')));
      if (text(activity.description)) content.appendChild(element('p', '', activity.description));
      var tags = Array.isArray(activity.tags) ? activity.tags.filter(Boolean) : [];
      if (tags.length) {
        var tagRow = element('div', 'trip-tags');
        tags.forEach(function (tag) { tagRow.appendChild(element('span', 'trip-tag', String(tag))); });
        content.appendChild(tagRow);
      }
      addLinks(content, activity.links);
      card.appendChild(content);
      list.appendChild(card);
    });
    block.appendChild(list);
    section.appendChild(block);
  }

  function renderReservations(section, reservations) {
    var items = (Array.isArray(reservations) ? reservations : []).filter(visible);
    if (!items.length) return;
    var block = element('section', 'trip-section');
    block.appendChild(element('h3', '', 'Tickets and reservations'));
    items.forEach(function (reservation) {
      var card = element('div', 'trip-reservation');
      card.appendChild(element('strong', '', text(reservation.title, 'Confirmed plan')));
      if (text(reservation.publicDetail)) card.appendChild(element('div', '', reservation.publicDetail));
      addLinks(card, reservation.links);
      block.appendChild(card);
    });
    section.appendChild(block);
  }

  function renderNotes(section, notes) {
    var items = (Array.isArray(notes) ? notes : []).filter(visible);
    if (!items.length) return;
    var block = element('section', 'trip-section');
    block.appendChild(element('h3', '', 'Travel guidance'));
    items.forEach(function (note) {
      block.appendChild(element('div', 'trip-note', text(note.text, '')));
    });
    section.appendChild(block);
  }

  function renderDay(day) {
    var article = element('article', 'trip-day');
    var header = element('header', 'trip-day-header');
    header.appendChild(element('p', 'trip-day-date', formatDate(day.date, text(day.dateLabel, 'Trip day'))));
    header.appendChild(element('h2', '', text(day.title, 'Trip day')));
    article.appendChild(header);
    var body = element('div', 'trip-day-body');
    if (text(day.summary)) body.appendChild(element('p', 'trip-muted', day.summary));
    renderReservations(body, day.reservations);
    renderActivities(body, day.activities);
    renderNotes(body, day.notes);
    article.appendChild(body);
    return article;
  }

  function validate(data) {
    if (!data || data.schemaVersion !== 2 || !data.trip || !Array.isArray(data.days)) return false;
    if (!text(data.trip.id) || !text(data.trip.title)) return false;
    return data.days.every(function (day) {
      return day && text(day.id) && /^\d{4}-\d{2}-\d{2}$/.test(text(day.date)) && text(day.title) && Array.isArray(day.activities);
    });
  }

  function render(data) {
    if (!validate(data)) throw new Error('This trip data does not match the supported format.');
    document.title = text(data.trip.title, 'Trip Companion') + ' — Structured Preview';
    var setters = [
      ['[data-trip-title]', data.trip.title, 'Personalized trip'],
      ['[data-trip-dates]', data.trip.dateLabel, 'Dates to be confirmed'],
      ['[data-trip-travelers]', data.trip.travelerLabel, 'Traveler profile pending'],
      ['[data-trip-summary]', data.trip.summary, 'Structured trip preview']
    ];
    setters.forEach(function (entry) {
      var node = root.querySelector(entry[0]);
      if (node) node.textContent = text(entry[1], entry[2]);
    });
    daysNode.replaceChildren();
    var days = data.days.filter(visible);
    if (!days.length) daysNode.appendChild(element('div', 'trip-empty', 'No itinerary days have been added yet.'));
    days.forEach(function (day) { daysNode.appendChild(renderDay(day)); });
    status.textContent = days.length + (days.length === 1 ? ' structured day loaded.' : ' structured days loaded.');
    status.dataset.state = 'ready';
  }

  if (!source) {
    status.textContent = 'Trip data source is missing.';
    status.dataset.state = 'error';
    return;
  }

  fetch(source, { credentials: 'same-origin' })
    .then(function (response) {
      if (!response.ok) throw new Error('Trip data could not be loaded.');
      return response.json();
    })
    .then(render)
    .catch(function (error) {
      status.textContent = error.message || 'Trip data could not be loaded.';
      status.dataset.state = 'error';
      daysNode.replaceChildren(element('div', 'trip-empty', 'The original production guide is unaffected. Check the trip data file and try again.'));
    });
}());
