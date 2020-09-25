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

function getAlbumMatches(chart, week, store) {
  return query(`
    SELECT ranking, id
    FROM albumChart c
    LEFT JOIN albumChartMatch m
    ON c.entry = m.entry
    WHERE c.chart=${chart}
    AND c.week='${week}'
    AND m.store='${store}'
    ORDER BY ranking`);
}

function getSingleMatches(chart, week, store) {
  return query(`
    SELECT ranking, track, id
    FROM singleChart c
    LEFT JOIN singleChartMatch m
    ON c.entry = m.entry
    WHERE c.chart=${chart}
    AND c.week='${week}'
    AND m.store='${store}'
    ORDER BY ranking, track`);
}

function getNonMatches(table, chart, week, store) {
  return query(`
    SELECT ranking, artist, title, entry
    FROM ${table}Chart c
    LEFT JOIN ${table}ChartEntry e
    ON c.entry = e.id
    WHERE c.chart=${chart}
    AND c.week='${week}'
    AND NOT EXISTS (SELECT m.entry
                    FROM ${table}ChartMatch m
                    WHERE c.entry = m.entry
                    AND m.store='${store}')
    ORDER BY ranking`);
}

function getAlbumNonMatches(chart, week, store) {
  return getNonMatches('album', chart, week, store);
}

function getSingleNonMatches(chart, week, store) {
  return getNonMatches('single', chart, week, store);
}

function getLatestWeeks(table) {
  return query(`
    SELECT MAX(week) week, chart
    FROM ${table}
    GROUP BY chart
    ORDER BY chart`);
}

function getLatestAlbumWeeks() {
  return getLatestWeeks('albumChart');
}

function getLatestSingleWeeks() {
  return getLatestWeeks('singleChart');
}

const ids = {
  us: 0,
  jp: 1,
  gb: 2,
  de: 3,
  fr: 4,
  kr: 5,
};

module.exports = {
  ids,
  addAlbums,
  addSingles,
  getRawAlbums,
  getRawSingles,
  getAlbumMatches,
  getSingleMatches,
  getAlbumNonMatches,
  getSingleNonMatches,
  getLatestAlbumWeeks,
  getLatestSingleWeeks,
};
