(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CatalogueComparison = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function escape(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function render(options, rows) {
    var seen = Object.create(null);
    options = (options || []).filter(function (option) {
      if (!option || !option.id || seen[option.id]) return false;
      seen[option.id] = true; return true;
    });
    if (!options.length) return '<p class="comparison-empty">Select an option to compare.</p>';
    return '<div class="comparison-scroll" tabindex="0" role="region" aria-label="Lens option comparison">' +
      '<table class="comparison-table"><caption>Compare lens options</caption><thead><tr><th scope="col" class="row-heading">Feature</th>' +
      options.map(function (option) { return '<th scope="col" data-option-id="' + escape(option.id) + '">' + escape(option.name) + '</th>'; }).join('') +
      '</tr></thead><tbody>' + (rows || []).map(function (row) {
        return '<tr data-row-key="' + escape(row.key) + '"><th scope="row" class="row-heading">' + escape(row.label) + '</th>' +
          options.map(function (option) {
            var value = option.fields && option.fields[row.key];
            return '<td data-row-key="' + escape(row.key) + '" data-option-id="' + escape(option.id) + '">' +
              escape(value == null || value === '' ? 'Not specified' : value) + '</td>';
          }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }
  return { escape: escape, render: render };
});
