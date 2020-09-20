const { dml } = require('@eunmo/mysql');

function add(table, chart, week, entries) {
  const values = entries.map(
    ({ id }, index) => `(${chart}, '${week}', ${index}, ${id})`
  );

  return dml(`
    INSERT INTO ${table} (chart, week, ranking, entry)
    VALUES ${values.join(',')}`);
}

module.exports = { add };
