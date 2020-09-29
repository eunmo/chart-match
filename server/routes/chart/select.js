const express = require('express');
const { chart, chartEntry } = require('../../db');
const { searchAppleCatalog } = require('./util');

const router = express.Router();

function toFirstWeekMap(firstWeeks) {
  const map = {};
  firstWeeks.forEach(({ entry, week }) => {
    map[entry] = week.toISOString().substring(0, 10);
  });
  return map;
}

router.get('/single/:chart/:week/:store', async (req, res) => {
  const { chart: chartName, week, store } = req.params;
  const songs = await chart.getFullSingles(chart.ids[chartName], week, store);
  const ids = songs.map(({ id }) => id).filter((id) => id !== null);
  const entries = songs.map(({ entry }) => entry);
  const [dataMap, firstWeeks] = await Promise.all([
    searchAppleCatalog('songs', store, ids),
    chart.getSingleFirstWeek(entries),
  ]);
  const firstWeekMap = toFirstWeekMap(firstWeeks);
  const merged = songs.map(({ ranking, entry, track, id, artist, title }) => {
    if (dataMap[id] === undefined) {
      return { ranking, entry, track, id, raw: { artist, title } };
    }

    const {
      attributes: {
        artistName,
        name,
        url,
        artwork: { url: artworkUrl },
      },
    } = dataMap[id];
    return {
      ranking,
      track,
      entry,
      id,
      isNew: week === firstWeekMap[entry],
      raw: { artist, title },
      catalog: { artist: artistName, title: name, url, artworkUrl },
    };
  });
  res.json(merged);
});

router.get('/album/:chart/:week/:store', async (req, res) => {
  const { chart: chartName, week, store } = req.params;
  const albums = await chart.getFullAlbums(chart.ids[chartName], week, store);
  const ids = albums.map(({ id }) => id).filter((id) => id !== null);
  const entries = albums.map(({ entry }) => entry);
  const [dataMap, firstWeeks] = await Promise.all([
    searchAppleCatalog('albums', store, ids),
    chart.getAlbumFirstWeek(entries),
  ]);
  const firstWeekMap = toFirstWeekMap(firstWeeks);
  const merged = albums.map(({ ranking, entry, id, artist, title }) => {
    if (dataMap[id] === undefined) {
      return { ranking, entry, id, raw: { artist, title } };
    }

    const {
      attributes: {
        artistName,
        name,
        url,
        artwork: { url: artworkUrl },
      },
    } = dataMap[id];
    return {
      ranking,
      entry,
      id,
      isNew: week === firstWeekMap[entry],
      raw: { artist, title },
      catalog: { artist: artistName, title: name, url, artworkUrl },
    };
  });
  res.json(merged);
});

router.get('/single-entry/:chart/:entry/:store', async (req, res) => {
  const { chart: chartName, entry, store } = req.params;
  const songs = await chartEntry.getFullSingle(
    chart.ids[chartName],
    entry,
    store
  );
  const ids = songs.map(({ id }) => id).filter((id) => id !== null);
  const dataMap = await searchAppleCatalog('songs', store, ids);
  const merged = songs.map(({ track, id, artist, title }) => {
    if (dataMap[id] === undefined) {
      return { track, id, raw: { artist, title } };
    }

    const {
      attributes: {
        artistName,
        name,
        url,
        artwork: { url: artworkUrl },
      },
    } = dataMap[id];
    return {
      track,
      id,
      raw: { artist, title },
      catalog: { artist: artistName, title: name, url, artworkUrl },
    };
  });
  res.json(merged);
});

router.get('/album-entry/:chart/:entry/:store', async (req, res) => {
  const { chart: chartName, entry, store } = req.params;
  const album = await chartEntry.getFullAlbum(
    chart.ids[chartName],
    entry,
    store
  );
  if (album === undefined) {
    res.json(undefined);
    return;
  }
  const { id, artist, title } = album;
  const ids = id ? [id] : [];
  const dataMap = await searchAppleCatalog('albums', store, ids);
  const out = { raw: { artist, title } };
  if (dataMap[album.id]) {
    const {
      attributes: {
        artistName,
        name,
        url,
        artwork: { url: artworkUrl },
      },
    } = dataMap[id];
    out.catalog = { artist: artistName, title: name, url, artworkUrl };
  }
  res.json(out);
});

module.exports = router;
