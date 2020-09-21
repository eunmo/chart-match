const express = require('express');
const fetch = require('node-fetch');
const config = require('config');
const { chart, chartMatch } = require('../../db');
const { chartIds } = require('./constants');
const { refDateYMD } = require('./util');

const token = config.get('appleMusicToken');
const router = express.Router();

async function queryAppleMusic(url) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

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

async function querySong(store, chartId, artist, title) {
  let query = artist.split(' ').concat(title.split(' ')).join('+');
  query = query.replace(/&/g, '%26');
  query = query.replace(/\+FT\+/g, '+Feat+');
  query = `term=${query}&types=artists,songs`;
  const url = `https://api.music.apple.com/v1/catalog/${store}/search?${query}`;
  const { results } = await queryAppleMusic(url);
  const song = results.songs?.data.find(
    ({ attributes: { contentRating } }) =>
      contentRating === undefined || contentRating === 'explicit'
  );

  if (song === undefined) {
    return [];
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
        toAdd.push({ entry, track, id: song.id, url: song.attributes.url });
      });
    }
  });

  await chartMatch.addSingles(store, toAdd);
  res.sendStatus(200);
});

async function queryAlbum(store, chartId, artist, title) {
  let query = artist.split(' ').concat(title.split(' ')).join('+');
  query = query.replace(/&/g, '%26');
  query = `term=${query}&types=artists,albums`;
  const url = `https://api.music.apple.com/v1/catalog/${store}/search?${query}`;
  const { results } = await queryAppleMusic(url);
  // find non-deluxe explicit albums
  return results?.albums?.data.find(
    ({ attributes: { contentRating, name } }) =>
      name.match(/deluxe/i) === null &&
      (contentRating === undefined || contentRating === 'explicit')
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
    toAdd.push({ entry, id: album.id, url: album.attributes.url });
  });

  await chartMatch.addAlbums(store, toAdd);
  res.sendStatus(200);
});

module.exports = router;
