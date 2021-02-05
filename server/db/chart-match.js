const { dml } = require('@eunmo/mysql');

function add(type, store, entries) {
  const values = entries.map(({ entry, idx, id }) => [entry, store, idx, id]);

  return dml(
    `
    INSERT INTO ${type}ChartMatch (entry, store, idx, id)
    VALUES ?`,
    [values]
  );
}

function remove(type, store, entry) {
  return dml(
    `
    DELETE FROM ${type}ChartMatch
    WHERE store = ?
    AND entry = ?`,
    [store, entry]
  );
}

module.exports = {
  add,
  remove,
};
