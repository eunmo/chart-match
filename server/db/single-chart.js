const { add: addBase } = require('./chart');

function add(chart, week, entries) {
  return addBase('singleChart', chart, week, entries);
}

module.exports = { add };
