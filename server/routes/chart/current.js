const express = require('express');
const { chartCurrent } = require('../../db');
const { searchAppleCatalog, typeToApple } = require('./util');

const router = express.Router();

function toIds(objects) {
  const set = new Set(objects.map(({ id }) => id));
  return [...set];
}

function merge(objects, dataMap) {
  return objects.map(({ chart, week, id }) => {
    const weekString = week.toISOString().substring(0, 10);
    const base = { chart, week: weekString, id };
    if (dataMap[id] === undefined) {
      return base;
    }
    const {
      attributes: {
        artistName,
        name,
        artwork: { url },
      },
    } = dataMap[id];
    return { ...base, artist: artistName, name, url };
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

router.get('/:type/:store', async (req, res) => {
  const { type, store } = req.params;
  const songs = await chartCurrent.getSorted(type, store);
  const shrinked = songs
    .map(({ id, ranks }) => ({ id, rank: ranks[0].ranking }))
    .filter(({ rank }) => rank <= 10);
  const ids = shrinked.map(({ id }) => id);
  const dataMap = await searchAppleCatalog(typeToApple[type], store, ids);
  const merged = shrinked
    .filter(({ id }) => dataMap[id] !== undefined)
    .map(({ id, rank }) => {
      const {
        attributes: { artistName, name },
      } = dataMap[id];
      return { id, rank, artist: artistName, name };
    });
  res.json(merged);
});

router.get('/full/:type/:store', async (req, res) => {
  const { type, store } = req.params;
  const entries = await chartCurrent.getSorted(type, store);
  const shrinked = entries.filter(({ ranks }) => ranks[0].ranking <= 10);
  const ids = shrinked.map(({ id }) => id);
  const dataMap = await searchAppleCatalog(typeToApple[type], store, ids);
  const merged = shrinked
    .filter(({ id }) => dataMap[id] !== undefined)
    .map(({ id, ranks }) => {
      const {
        attributes: {
          artistName: artist,
          name,
          url,
          artwork: { url: artworkUrl },
        },
      } = dataMap[id];
      return { id, ranks, artist, name, url, artworkUrl };
    });
  res.json(merged);
});

module.exports = router;
