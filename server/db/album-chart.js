const { add: addBase } = require('./chart');

function add(chart, week, entries) {
  return addBase('albumChart', chart, week, entries);
}

module.exports = { add };
