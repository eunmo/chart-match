const express = require('express');
const { chart, chartEntry } = require('../../db');
const { searchAppleCatalog, typeToApple } = require('./util');

const router = express.Router();

function toFirstWeekMap(firstWeeks) {
  const map = {};
  firstWeeks.forEach(({ entry, week }) => {
    map[entry] = week.toISOString().substring(0, 10);
  });
  return map;
}

router.get('/week/:type/:chart/:week/:store', async (req, res) => {
  const { type, chart: chartName, week, store } = req.params;
  const entries = await chart.getWeek(type, chart.ids[chartName], week, store);
  const ids = entries.map(({ id }) => id).filter((id) => id !== null);
  const [dataMap, firstWeeks] = await Promise.all([
    searchAppleCatalog(typeToApple[type], store, ids),
    chart.getFirstWeeks(
      type,
      entries.map(({ entry }) => entry)
    ),
  ]);
  const firstWeekMap = toFirstWeekMap(firstWeeks);
  const merged = entries.map(({ ranking, entry, idx, id, artist, title }) => {
    if (dataMap[id] === undefined) {
      return { ranking, entry, idx, id, raw: { artist, title } };
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
      idx,
      entry,
      id,
      isNew: week === firstWeekMap[entry],
      raw: { artist, title },
      catalog: { artist: artistName, title: name, url, artworkUrl },
    };
  });
  res.json(merged);
});

router.get('/entry/:type/:chart/:entry/:store', async (req, res) => {
  const { type, chart: chartName, entry, store } = req.params;
  const entries = await chartEntry.getFull(
    type,
    chart.ids[chartName],
    entry,
    store
  );
  const ids = entries.map(({ id }) => id).filter((id) => id !== null);
  const dataMap = await searchAppleCatalog(typeToApple[type], store, ids);
  const merged = entries.map(({ idx, id, artist, title }) => {
    if (dataMap[id] === undefined) {
      return { idx, id, raw: { artist, title } };
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
      idx,
      id,
      raw: { artist, title },
      catalog: { artist: artistName, title: name, url, artworkUrl },
    };
  });
  res.json(merged);
});

module.exports = router;
