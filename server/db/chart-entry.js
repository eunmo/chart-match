const { dml, query } = require('@eunmo/mysql');

function addMissing(type, chart, entries) {
  const values = entries.map(({ artist, title }) => [chart, artist, title]);

  return dml(
    `
    INSERT IGNORE INTO ${type}ChartEntry (chart, artist, title)
    VALUES ?`,
    [values]
  );
}

function getIds(type, chart, entries) {
  const temp = entries
    .map(() => `SELECT ? as chart, ? as artist, ? as title`)
    .join(' UNION ');
  const values = entries
    .map(({ artist, title }) => [chart, artist, title])
    .flat();

  return query(
    `
    SELECT id
    FROM (${temp}) t
    LEFT JOIN ${type}ChartEntry s
    ON t.chart = s.chart
    AND t.artist = s.artist
    AND t.title = s.title`,
    values
  );
}

function getFull(type, chart, entry, store) {
  return query(
    `
    SELECT idx, m.id, artist, title
    FROM ${type}ChartEntry e
    LEFT JOIN (SELECT * FROM ${type}ChartMatch WHERE store= ?) m
    ON e.id = m.entry
    WHERE e.chart = ?
    AND e.id = ?
    ORDER BY idx`,
    [store, chart, entry]
  );
}

module.exports = {
  addMissing,
  getIds,
  getFull,
};
