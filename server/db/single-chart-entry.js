const {
  addMissing: addMissingBase,
  getIds: getIdsBase,
} = require('./chart-entry');

function addMissing(chart, entries) {
  return addMissingBase('singleChartEntry', chart, entries);
}

function getIds(chart, entries) {
  return getIdsBase('singleChartEntry', chart, entries);
}

module.exports = { addMissing, getIds };
