/* eslint no-constant-condition: ["error", { "checkLoops": false }] */
const express = require('express');
const { chart, chartMatch } = require('../../db');
const { formQuery, queryAppleMusic } = require('../../apple');
const { refDateYMD } = require('./util');

const router = express.Router();
const { ids: chartIds } = chart;

// eslint-disable-next-line no-unused-vars
async function queryAllAppleMusic(url, path) {
  let candidates = [];
  let next = url;
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { results } = await queryAppleMusic(next);
    if (results?.[path]?.data === undefined) {
      break;
    }
    candidates = candidates.concat(results[path].data);
    if (results.songs.next) {
      next = `https://api.music.apple.com${results[path].next}`;
    } else {
      break;
    }
  }

  return candidates;
}

function findExplicitSong(results) {
  return results.songs?.data.find(
    ({ attributes: { contentRating } }) =>
      contentRating === undefined || contentRating === 'explicit'
  );
}

async function queryNormalizedKoreanSong(store, artist, title) {
  const artistNorm = artist.replace(/\(.*\)/g, '').trim();
  const titleNorm = title.replace(/\(.*\)/g, '').trim();
  if (artistNorm !== artist || titleNorm !== title) {
    const url = formQuery(store, `${artistNorm} ${titleNorm}`, 'songs');
    const { results } = await queryAppleMusic(url);
    const song = findExplicitSong(results);

    if (song === undefined) {
      return [];
    }

    return [song];
  }

  return [];
}

async function querySong(store, chartId, artist, title) {
  const url = formQuery(
    store,
    `${artist} ${title}`,
    'songs',
    chartId === chartIds.gb
  );
  const { results } = await queryAppleMusic(url);
  const song = findExplicitSong(results);

  if (song === undefined) {
    if (chartId === chartIds.kr) {
      return queryNormalizedKoreanSong(store, artist, title);
    }

    return [];
  }

  if (chartId === chartIds.jp && title.split('/').length > 1) {
    const songUrl = song.attributes.url;
    const found = songUrl.match(/\/(\d+)\?i/);
    const albumId = found[1];
    const albumUrl = `https://api.music.apple.com/v1/catalog/${store}/albums/${albumId}/tracks`;
    const albumResponse = await queryAppleMusic(albumUrl);
    const songCount = title.split('/').length;
    if (albumResponse.data.length >= songCount) {
      return albumResponse.data.slice(0, songCount);
    }
  }

  return [song];
}

async function matchSingle(chartId, date, store) {
  const week = refDateYMD(date, 0, 6);

  let raw = await chart.getNonMatches('single', chartId, week, store);
  raw = raw.filter(({ ranking }) => ranking <= 10);
  if (raw.length === 0) {
    return;
  }

  const promises = raw.map(({ artist, title }) =>
    querySong(store, chartId, artist, title)
  );
  const response = await Promise.all(promises);

  const toAdd = [];
  response.forEach((songs, index) => {
    const { entry } = raw[index];
    if (songs.length === 0) {
      toAdd.push({ entry, idx: 0 });
    } else {
      songs.forEach((song, idx) => {
        toAdd.push({ entry, idx, id: song.id });
      });
    }
  });

  await chartMatch.add('single', store, toAdd);
}

router.get('/single/:chartName/:date/:store', async (req, res) => {
  const { chartName, date, store } = req.params;
  const chartId = chartIds[chartName];
  if (chartId === undefined) {
    res.sendStatus(200);
    return;
  }

  await matchSingle(chartId, date, store);
  res.sendStatus(200);
});

async function queryAlbum(store, chartId, artist, title) {
  const url = formQuery(store, `${artist} ${title}`, 'albums');
  const { results } = await queryAppleMusic(url);
  const data = results.albums?.data;
  if (data === undefined) {
    return undefined;
  }

  // find non-deluxe explicit albums
  const album = data.find(
    ({ attributes: { contentRating, name } }) =>
      name.match(/deluxe/i) === null &&
      (contentRating === undefined || contentRating === 'explicit')
  );

  if (album) {
    return album;
  }

  return data.find(
    ({ attributes: { contentRating } }) =>
      contentRating === undefined || contentRating === 'explicit'
  );
}

async function matchAlbum(chartId, date, store) {
  const week = refDateYMD(date, 0, 6);

  let raw = await chart.getNonMatches('album', chartId, week, store);
  raw = raw.filter(({ ranking }) => ranking <= 10);
  if (raw.length === 0) {
    return;
  }

  const promises = raw.map(({ artist, title }) =>
    queryAlbum(store, chartId, artist, title)
  );
  const response = await Promise.all(promises);

  const toAdd = [];
  response.forEach((album, index) => {
    const { entry } = raw[index];
    if (album) {
      toAdd.push({ entry, idx: 0, id: album.id });
    } else {
      toAdd.push({ entry, idx: 0 });
    }
  });

  await chartMatch.add('album', store, toAdd);
}

router.get('/album/:chartName/:date/:store', async (req, res) => {
  const { chartName, date, store } = req.params;
  const chartId = chartIds[chartName];
  if (chartId === undefined) {
    res.sendStatus(200);
    return;
  }

  await matchAlbum(chartId, date, store);
  res.sendStatus(200);
});

module.exports = { matchSingle, matchAlbum, router };
