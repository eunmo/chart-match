const express = require('express');
const { chartCurrent } = require('../../db');
const { searchAppleCatalog } = require('./util');

const router = express.Router();

router.get('/single/:store', async (req, res) => {
  const { store } = req.params;
  const songs = await chartCurrent.getSorted('single', store);
  const shrinked = songs
    .map(({ id, ranks }) => ({ id, rank: ranks[0].ranking }))
    .filter(({ rank }) => rank <= 10);
  const ids = shrinked.map(({ id }) => id);
  const dataMap = await searchAppleCatalog('songs', store, ids);
  const merged = shrinked.map(({ id, rank }) => {
    const {
      attributes: { artistName, name },
    } = dataMap[id];
    return { id, rank, artist: artistName, name };
  });
  res.json(merged);
});

router.get('/album/:store', async (req, res) => {
  const { store } = req.params;
  const albums = await chartCurrent.getSorted('album', store);
  const shrinked = albums
    .map(({ id, ranks }) => ({ id, rank: ranks[0].ranking }))
    .filter(({ rank }) => rank <= 10);
  const ids = shrinked.map(({ id }) => id);
  const dataMap = await searchAppleCatalog('albums', store, ids);
  const merged = shrinked.map(({ id, rank }) => {
    const {
      attributes: { artistName, name, url },
    } = dataMap[id];
    return { id, rank, artist: artistName, name, url };
  });
  res.json(merged);
});

function toIds(objects) {
  const set = new Set(objects.map(({ id }) => id));
  return [...set];
}

function merge(objects, dataMap) {
  return objects.map(({ chart, week, id }) => {
    if (dataMap[id] === undefined) {
      return { chart, id };
    }
    const weekString = week.toISOString().substring(0, 10);
    const {
      attributes: {
        artistName,
        name,
        artwork: { url },
      },
    } = dataMap[id];
    return { chart, week: weekString, id, artist: artistName, name, url };
  });
}

router.get('/tops/:store', async (req, res) => {
  const { store } = req.params;
  const [songs, albums] = await chartCurrent.getTops(store);
  const songIds = toIds(songs);
  const albumIds = toIds(albums);
  const [songData, albumData] = await Promise.all([
    searchAppleCatalog('songs', store, songIds),
    searchAppleCatalog('albums', store, albumIds),
  ]);
  const mergedSongs = merge(songs, songData);
  const mergedAlbums = merge(albums, albumData);
  res.json({ songs: mergedSongs, albums: mergedAlbums });
});

module.exports = router;
