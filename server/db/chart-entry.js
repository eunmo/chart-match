const { dml, query } = require('@eunmo/mysql');
const { escape } = require('./util');

function addMissing(type, chart, entries) {
  const values = entries.map(
    ({ artist, title }) => `(${chart}, '${escape(artist)}', '${escape(title)}')`
  );

  return dml(`
    INSERT IGNORE INTO ${type}ChartEntry (chart, artist, title)
    VALUES ${values.join(',')}`);
}

function getIds(type, chart, entries) {
  const temp = entries
    .map(
      ({ artist, title }) =>
        `SELECT ${chart} as chart, '${escape(artist)}' as artist, '${escape(
          title
        )}' as title`
    )
    .join(' UNION ');

  return query(`
    SELECT id
    FROM (${temp}) t
    LEFT JOIN ${type}ChartEntry s
    ON t.chart = s.chart
    AND t.artist = s.artist
    AND t.title = s.title`);
}

function getFull(type, chart, entry, store) {
  return query(`
    SELECT idx, m.id, artist, title
    FROM ${type}ChartEntry e
    LEFT JOIN (SELECT * FROM ${type}ChartMatch WHERE store='${store}') m
    ON e.id = m.entry
    WHERE e.chart=${chart}
    AND e.id=${entry}
    ORDER BY idx`);
}

module.exports = {
  addMissing,
  getIds,
  getFull,
};
