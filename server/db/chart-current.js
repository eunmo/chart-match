const { query } = require('@eunmo/mysql');

function buildQuery(type, store) {
  return `
    SELECT c.chart, c.week, ranking, idx, id
    FROM ${type}Chart c
    INNER JOIN ${type}ChartMatch m
    ON c.entry = m.entry
    INNER JOIN (
      SELECT MAX(week) week, chart
      FROM ${type}Chart
      GROUP BY chart) w
    ON c.week = w.week and c.chart = w.chart
    WHERE m.store = '${store}'
    AND id IS NOT NULL`;
}

function get(type, store) {
  return query(buildQuery(type, store));
}

function compareRanks(a, b) {
  return a.ranking === b.ranking ? a.chart - b.chart : a.ranking - b.ranking;
}

function compareMatches(a, b) {
  const minSize = Math.min(a.ranks.length, b.ranks.length);
  for (let i = 0; i < minSize; i += 1) {
    if (a.ranks[i].ranking !== b.ranks[i].ranking) {
      return a.ranks[i].ranking - b.ranks[i].ranking;
    }
  }

  if (a.ranks.length === b.ranks.length) {
    const [topA, topB] = [a.ranks[0], b.ranks[0]];
    if (topA.chart === topB.chart) {
      return topA.idx - topB.idx;
    }
    return topA.chart - topB.chart;
  }

  return b.ranks.length - a.ranks.length;
}

async function getSorted(type, store) {
  const rows = await get(type, store);
  const entryMap = {};

  rows.forEach(({ chart, ranking, idx, id }) => {
    if (entryMap[id] === undefined) {
      entryMap[id] = { id, ranks: [] };
    }

    entryMap[id].ranks.push({ ranking, idx, chart });
  });

  const entries = Object.values(entryMap).map((entry) => {
    entry.ranks.sort(compareRanks);
    return entry;
  });

  entries.sort(compareMatches);
  return entries;
}

function getTops(store) {
  return Promise.all(
    ['single', 'album'].map((type) =>
      query(`
      WITH t AS (
        SELECT chart, week, ranking, idx, id,
        RANK() OVER (PARTITION BY chart ORDER BY ranking, idx) as entry_rank
        FROM (${buildQuery(type, store)}) t
      )
      SELECT * FROM t
      WHERE entry_rank = 1`)
    )
  );
}

module.exports = { getSorted, getTops };
