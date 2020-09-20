const { dml } = require('@eunmo/mysql');

function add(table, chart, week, entries) {
  const values = entries.map(
    ({ id }, index) => `(${chart}, '${week}', ${index}, ${id})`
  );

  return dml(`
    INSERT INTO ${table} (chart, week, ranking, entry)
    VALUES ${values.join(',')}`);
}

function addAlbums(chart, week, entries) {
  return add('albumChart', chart, week, entries);
}

function addSingles(chart, week, entries) {
  return add('singleChart', chart, week, entries);
}

module.exports = { addAlbums, addSingles };
