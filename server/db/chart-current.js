const { query } = require('@eunmo/mysql');
const { ids } = require('./chart');

function getSongs(store) {
  return query(`
    SELECT c.chart, ranking, track, id
    FROM singleChart c
    LEFT JOIN singleChartMatch m
    ON c.entry = m.entry
    INNER JOIN (
      SELECT MAX(week) week, chart
      FROM singleChart
      GROUP BY chart) w
    ON c.week = w.week and c.chart = w.chart
    WHERE m.store = '${store}'`);
}

function compareRanks(a, b) {
  return a.ranking === b.ranking ? a.chart - b.chart : a.ranking - b.ranking;
}

function compareSongs(a, b) {
  const minSize = Math.min(a.ranks.length, b.ranks.length);
  for (let i = 0; i < minSize; i += 1) {
    if (a.ranks[i].ranking !== b.ranks[i].ranking) {
      return a.ranks[i].ranking - b.ranks[i].ranking;
    }
  }

  if (a.ranks.length === b.ranks.length) {
    const [topA, topB] = [a.ranks[0], b.ranks[0]];
    if (topA.chart === topB.chart) {
      return topA.track - topB.track;
    }
    return topA.chart - topB.chart;
  }

  return b.ranks.length - a.ranks.length;
}

async function getSortedSongs(store) {
  const rows = await getSongs(store);
  const songMap = {};

  rows.forEach(({ chart: chartName, ranking, track, id }) => {
    if (id === null) {
      return;
    }

    if (songMap[id] === undefined) {
      songMap[id] = { id, ranks: [] };
    }

    songMap[id].ranks.push({ ranking, track, chartId: ids[chartName] });
  });

  const songs = Object.values(songMap).map((song) => {
    song.ranks.sort(compareRanks);
    return song;
  });

  songs.sort(compareSongs);
  return songs;
}

module.exports = { getSortedSongs };
