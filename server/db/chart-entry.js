const { dml, query } = require('@eunmo/mysql');

function addMissing(table, chart, entries) {
  const values = entries.map(
    ({ artist, title }) => `(${chart}, '${artist}', '${title}')`
  );

  return dml(`
    INSERT IGNORE INTO ${table} (chart, artist, title)
    VALUES ${values.join(',')}`);
}

function getIds(table, chart, entries) {
  const temp = entries
    .map(
      ({ artist, title }) =>
        `SELECT ${chart} as chart, '${artist}' as artist, '${title}' as title`
    )
    .join(' UNION ');

  return query(`
    SELECT id
    FROM (${temp}) t
    LEFT JOIN ${table} s
    ON t.chart = s.chart
    AND t.artist = s.artist
    AND t.title = s.title`);
}

module.exports = { addMissing, getIds };
