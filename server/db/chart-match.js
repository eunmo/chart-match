const { dml } = require('@eunmo/mysql');
const { format } = require('./util');

function add(type, store, entries) {
  const values = entries.map(
    ({ entry, idx, id }) => `(${entry}, '${store}', ${idx}, ${format(id)})`
  );

  return dml(`
    INSERT INTO ${type}ChartMatch (entry, store, idx, id)
    VALUES ${values.join(',')}`);
}

function remove(type, store, entry) {
  return dml(`
    DELETE FROM ${type}ChartMatch
    WHERE store='${store}'
    AND entry=${entry}`);
}

module.exports = {
  add,
  remove,
};
