const { query } = require('@eunmo/mysql');

function songQuery(store) {
  return `
    SELECT c.chart, c.week, ranking, track, id
    FROM singleChart c
    INNER JOIN singleChartMatch m
    ON c.entry = m.entry
    INNER JOIN (
      SELECT MAX(week) week, chart
      FROM singleChart
      GROUP BY chart) w
    ON c.week = w.week and c.chart = w.chart
    WHERE m.store = '${store}'
    AND id IS NOT NULL`;
}

function getSongs(store) {
  return query(songQuery(store));
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

  rows.forEach(({ chart, ranking, track, id }) => {
    if (songMap[id] === undefined) {
      songMap[id] = { id, ranks: [] };
    }

    songMap[id].ranks.push({ ranking, track, chart });
  });

  const songs = Object.values(songMap).map((song) => {
    song.ranks.sort(compareRanks);
    return song;
  });

  songs.sort(compareSongs);
  return songs;
}

function albumQuery(store) {
  return `
    SELECT c.chart, c.week, ranking, id
    FROM albumChart c
    INNER JOIN albumChartMatch m
    ON c.entry = m.entry
    INNER JOIN (
      SELECT MAX(week) week, chart
      FROM albumChart
      GROUP BY chart) w
    ON c.week = w.week and c.chart = w.chart
    WHERE m.store = '${store}'
    AND id IS NOT NULL`;
}

function getAlbums(store) {
  return query(albumQuery(store));
}

function compareAlbums(a, b) {
  const minSize = Math.min(a.ranks.length, b.ranks.length);
  for (let i = 0; i < minSize; i += 1) {
    if (a.ranks[i].ranking !== b.ranks[i].ranking) {
      return a.ranks[i].ranking - b.ranks[i].ranking;
    }
  }

  if (a.ranks.length === b.ranks.length) {
    return a.ranks[0] - b.ranks[0];
  }

  return b.ranks.length - a.ranks.length;
}

async function getSortedAlbums(store) {
  const rows = await getAlbums(store);
  const albumMap = {};

  rows.forEach(({ chart, ranking, id }) => {
    if (albumMap[id] === undefined) {
      albumMap[id] = { id, ranks: [] };
    }

    albumMap[id].ranks.push({ ranking, chart });
  });

  const albums = Object.values(albumMap).map((album) => {
    album.ranks.sort((a, b) => a.ranking - b.ranking);
    return album;
  });

  albums.sort(compareAlbums);
  return albums;
}

function getTops(store) {
  return Promise.all([
    query(`
      WITH t AS (
        SELECT chart, week, ranking, track, id,
        RANK() OVER (PARTITION BY chart ORDER BY ranking, track) as song_rank
        FROM (${songQuery(store)}) t
      )
      SELECT * FROM t
      WHERE song_rank = 1`),
    query(`
      WITH t AS (
        SELECT chart, week, ranking, id,
          RANK() OVER (PARTITION BY chart ORDER BY ranking) album_rank
        FROM (${albumQuery(store)}) t
      )
      SELECT * FROM t
      WHERE album_rank = 1`),
  ]);
}

module.exports = { getSortedSongs, getSortedAlbums, getTops };
