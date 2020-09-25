/* eslint no-constant-condition: ["error", { "checkLoops": false }] */
const express = require('express');
const { chart, chartMatch } = require('../../db');
const { queryAppleMusic, refDateYMD } = require('./util');

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

function formQuery(store, artist, title, type, replaceFT = false) {
  let query = artist.split(' ').concat(title.split(' ')).join('+');
  query = query.replace(/&/g, '%26');
  if (replaceFT) {
    query = query.replace(/\+FT\+/g, '+Feat+');
  }
  query = `term=${query}&types=artists,${type}`;
  return `https://api.music.apple.com/v1/catalog/${store}/search?${query}`;
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
    const url = formQuery(store, artistNorm, titleNorm, 'songs');
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
  const url = formQuery(store, artist, title, 'songs', chartId === chartIds.gb);
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

router.get('/single/:chartName/:date/:store', async (req, res) => {
  const { chartName, date, store } = req.params;
  const week = refDateYMD(date, 0, 6);

  const chartId = chartIds[chartName];
  if (chartId === undefined) {
    res.sendStatus(200);
    return;
  }

  let raw = await chart.getSingleNonMatches(chartId, week, store);
  raw = raw.filter(({ ranking }) => ranking <= 10);
  if (raw.length === 0) {
    res.sendStatus(200);
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
      toAdd.push({ entry, track: 0 });
    } else {
      songs.forEach((song, track) => {
        toAdd.push({ entry, track, id: song.id });
      });
    }
  });

  await chartMatch.addSingles(store, toAdd);
  res.sendStatus(200);
});

async function queryAlbum(store, chartId, artist, title) {
  const url = formQuery(store, artist, title, 'albums');
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

router.get('/album/:chartName/:date/:store', async (req, res) => {
  const { chartName, date, store } = req.params;
  const week = refDateYMD(date, 0, 6);

  const chartId = chartIds[chartName];
  if (chartId === undefined) {
    res.sendStatus(200);
    return;
  }

  let raw = await chart.getAlbumNonMatches(chartId, week, store);
  raw = raw.filter(({ ranking }) => ranking <= 10);
  if (raw.length === 0) {
    res.sendStatus(200);
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
      toAdd.push({ entry, id: album.id });
    } else {
      toAdd.push({ entry });
    }
  });

  await chartMatch.addAlbums(store, toAdd);
  res.sendStatus(200);
});

module.exports = router;
