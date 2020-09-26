const express = require('express');
const { chart } = require('../../db');
const { searchAppleCatalog } = require('./util');

const router = express.Router();

router.get('/single/:chart/:week/:store', async (req, res) => {
  const { chart: chartName, week, store } = req.params;
  const songs = await chart.getFullSingles(chart.ids[chartName], week, store);
  const ids = songs.map(({ id }) => id).filter((id) => id !== null);
  const dataMap = await searchAppleCatalog('songs', store, ids);
  const merged = songs.map(({ ranking, entry, track, id, artist, title }) => {
    if (dataMap[id] === undefined) {
      return { ranking, entry, track, id, raw: { artist, title } };
    }

    const {
      attributes: {
        artistName,
        name,
        artwork: { url },
      },
    } = dataMap[id];
    return {
      ranking,
      track,
      entry,
      id,
      raw: { artist, title },
      catalog: { artist: artistName, title: name, url },
    };
  });
  res.json(merged);
});

router.get('/album/:chart/:week/:store', async (req, res) => {
  const { chart: chartName, week, store } = req.params;
  const albums = await chart.getFullAlbums(chart.ids[chartName], week, store);
  const ids = albums.map(({ id }) => id).filter((id) => id !== null);
  const dataMap = await searchAppleCatalog('albums', store, ids);
  const merged = albums.map(({ ranking, entry, id, artist, title }) => {
    if (dataMap[id] === undefined) {
      return { ranking, entry, id, raw: { artist, title } };
    }

    const {
      attributes: {
        artistName,
        name,
        artwork: { url },
      },
    } = dataMap[id];
    return {
      ranking,
      entry,
      id,
      raw: { artist, title },
      catalog: { artist: artistName, title: name, url },
    };
  });
  res.json(merged);
});

module.exports = router;
