const {
  addMissing: addMissingBase,
  getIds: getIdsBase,
} = require('./chart-entry');

function addMissing(chart, entries) {
  return addMissingBase('albumChartEntry', chart, entries);
}

function getIds(chart, entries) {
  return getIdsBase('albumChartEntry', chart, entries);
}

module.exports = { addMissing, getIds };
