const { dml, query } = require('@eunmo/mysql');

function add(table, chart, week, entryIds) {
  const values = entryIds.map(
    ({ id }, index) => `(${chart}, '${week}', ${index + 1}, ${id})`
  );

  return dml(`
    INSERT INTO ${table} (chart, week, ranking, entry)
    VALUES ${values.join(',')}`);
}

function getRaw(chartTable, entryTable, chart, week) {
  return query(`
    SELECT ranking, artist, title
    FROM ${chartTable} c
    LEFT JOIN ${entryTable} e
    ON c.entry = e.id
    WHERE c.chart=${chart}
    AND c.week='${week}'
    ORDER BY ranking`);
}

function addAlbums(chart, week, entries) {
  return add('albumChart', chart, week, entries);
}

function addSingles(chart, week, entries) {
  return add('singleChart', chart, week, entries);
}

function getRawAlbums(chart, week) {
  return getRaw('albumChart', 'albumChartEntry', chart, week);
}

function getRawSingles(chart, week) {
  return getRaw('singleChart', 'singleChartEntry', chart, week);
}

module.exports = { addAlbums, addSingles, getRawAlbums, getRawSingles };
