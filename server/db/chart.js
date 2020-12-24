const { dml, query } = require('@eunmo/mysql');

function add(type, chart, week, entryIds) {
  const values = entryIds.map(
    ({ id }, index) => `(${chart}, '${week}', ${index + 1}, ${id})`
  );

  return dml(`
    INSERT INTO ${type}Chart (chart, week, ranking, entry)
    VALUES ${values.join(',')}`);
}

function getRaw(type, chart, week) {
  return query(`
    SELECT ranking, artist, title
    FROM ${type}Chart c
    LEFT JOIN ${type}ChartEntry e
    ON c.entry = e.id
    WHERE c.chart=${chart}
    AND c.week='${week}'
    ORDER BY ranking`);
}

function getWeek(type, chart, week, store) {
  return query(`
    SELECT ranking, c.entry, idx, m.id, artist, title
    FROM ${type}Chart c
    LEFT JOIN (SELECT * FROM ${type}ChartMatch WHERE store='${store}') m
    ON c.entry = m.entry
    INNER JOIN ${type}ChartEntry e
    ON c.entry = e.id
    WHERE c.chart=${chart}
    AND c.week='${week}'
    ORDER BY ranking`);
}

function getYear1(type, chart, year, store) {
  return query(`
    SELECT ranking, c.entry, idx, m.id, artist, title
    FROM ${type}Chart c
    LEFT JOIN (SELECT * FROM ${type}ChartMatch WHERE store='${store}') m
    ON c.entry = m.entry
    INNER JOIN ${type}ChartEntry e
    ON c.entry = e.id
    WHERE c.chart = ${chart}
    AND YEAR(c.week) = ${year}
    AND ranking = 1
    ORDER BY week`);
}

function getYear10(type, chart, year, store) {
  return query(`
    SELECT ranking, c.entry, idx, m.id, artist, title
    FROM (
        SELECT min(week) as week, min(ranking) as ranking, entry
        FROM ${type}Chart
        WHERE chart = ${chart}
        AND ranking <= 10
        GROUP BY entry
    ) c
    LEFT JOIN (SELECT * FROM ${type}ChartMatch WHERE store='${store}') m
    ON c.entry = m.entry
    INNER JOIN ${type}ChartEntry e
    ON c.entry = e.id
    WHERE YEAR(c.week) = ${year}
    ORDER BY week, ranking`);
}

function getWeeks(type, store, weeks) {
  return query(`
    SELECT DISTINCT m.id
    FROM ${type}Chart c
    INNER JOIN ${type}ChartMatch m
    ON c.entry = m.entry
    WHERE m.store = '${store}'
    AND m.id IS NOT NULL
    AND c.week in ('${weeks.join("','")}')
    AND c.ranking <= 10`);
}

function getMatches(type, chart, week, store) {
  return query(`
    SELECT ranking, idx, id
    FROM ${type}Chart c
    LEFT JOIN ${type}ChartMatch m
    ON c.entry = m.entry
    WHERE c.chart=${chart}
    AND c.week='${week}'
    AND m.store in (null, '${store}')
    ORDER BY ranking, idx`);
}

function getNonMatches(type, chart, week, store) {
  return query(`
    SELECT ranking, artist, title, entry
    FROM ${type}Chart c
    LEFT JOIN ${type}ChartEntry e
    ON c.entry = e.id
    WHERE c.chart=${chart}
    AND c.week='${week}'
    AND NOT EXISTS (SELECT m.entry
                    FROM ${type}ChartMatch m
                    WHERE c.entry = m.entry
                    AND m.store='${store}')
    ORDER BY ranking`);
}

function getLatestWeeks(type) {
  return query(`
    SELECT MAX(week) week, chart
    FROM ${type}Chart
    GROUP BY chart
    ORDER BY chart`);
}

function getFirstWeeks(type, entries) {
  if (entries.length === 0) {
    return [];
  }

  return query(`
    SELECT min(week) as week, entry
    FROM ${type}Chart
    WHERE entry in (${entries.join(',')})
    AND ranking <= 10
    GROUP BY entry`);
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
  add,
  getRaw,
  getWeek,
  getYear1,
  getYear10,
  getWeeks,
  getMatches,
  getNonMatches,
  getLatestWeeks,
  getFirstWeeks,
};
