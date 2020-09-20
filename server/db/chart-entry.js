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

function addMissingAlbums(chart, entries) {
  return addMissing('albumChartEntry', chart, entries);
}

function getAlbumIds(chart, entries) {
  return getIds('albumChartEntry', chart, entries);
}

function addMissingSingles(chart, entries) {
  return addMissing('singleChartEntry', chart, entries);
}

function getSingleIds(chart, entries) {
  return getIds('singleChartEntry', chart, entries);
}

module.exports = {
  addMissingAlbums,
  getAlbumIds,
  addMissingSingles,
  getSingleIds,
};
