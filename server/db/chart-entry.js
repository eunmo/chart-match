const { dml, query } = require('@eunmo/mysql');
const { escape } = require('./util');

function addMissing(table, chart, entries) {
  const values = entries.map(
    ({ artist, title }) => `(${chart}, '${escape(artist)}', '${escape(title)}')`
  );

  return dml(`
    INSERT IGNORE INTO ${table} (chart, artist, title)
    VALUES ${values.join(',')}`);
}

function getIds(table, chart, entries) {
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

async function getFullAlbum(chart, entry, store) {
  const rows = await query(`
    SELECT m.id, artist, title
    FROM albumChartEntry e
    LEFT JOIN (SELECT * FROM albumChartMatch WHERE store='${store}') m
    ON e.id = m.entry
    WHERE e.chart=${chart}
    AND e.id=${entry}`);
  return rows.length > 0 ? rows[0] : undefined;
}

function getFullSingle(chart, entry, store) {
  return query(`
    SELECT track, m.id, artist, title
    FROM singleChartEntry e
    LEFT JOIN (SELECT * FROM singleChartMatch WHERE store='${store}') m
    ON e.id = m.entry
    WHERE e.chart=${chart}
    AND e.id=${entry}
    ORDER BY track`);
}

module.exports = {
  addMissingAlbums,
  getAlbumIds,
  addMissingSingles,
  getSingleIds,
  getFullAlbum,
  getFullSingle,
};
