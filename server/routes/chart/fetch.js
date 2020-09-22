const express = require('express');
const { chart, chartEntry } = require('../../db');
const { chartIds } = require('./constants');
const { refDateYMD, shouldUpdate } = require('./util');
const us = require('./us');
const jp = require('./jp');
const gb = require('./gb');
const kr = require('./kr');

const fetchChart = { us, jp, gb, kr };
const router = express.Router();

router.get('/single/:chartName/:date', async (req, res) => {
  const { chartName, date } = req.params;
  const week = refDateYMD(date, 0, 6);

  const chartId = chartIds[chartName];
  if (chartId === undefined) {
    res.sendStatus(200);
    return;
  }

  const [existing, ranks] = await Promise.all([
    chart.getRawSingles(chartId, week),
    fetchChart[chartName].fetchSingle(date),
  ]);
  if (!shouldUpdate(existing, ranks)) {
    res.sendStatus(200);
    return;
  }

  await chartEntry.addMissingSingles(chartId, ranks);
  const entryIds = await chartEntry.getSingleIds(chartId, ranks);
  await chart.addSingles(chartId, week, entryIds);

  res.sendStatus(200);
});

router.get('/album/:chartName/:date', async (req, res) => {
  const { chartName, date } = req.params;
  const week = refDateYMD(date, 0, 6);

  const chartId = chartIds[chartName];
  if (chartId === undefined) {
    res.sendStatus(200);
    return;
  }

  const [existing, ranks] = await Promise.all([
    chart.getRawAlbums(chartId, week),
    fetchChart[chartName].fetchAlbum(date),
  ]);
  if (!shouldUpdate(existing, ranks)) {
    res.sendStatus(200);
    return;
  }

  await chartEntry.addMissingAlbums(chartId, ranks);
  const entryIds = await chartEntry.getAlbumIds(chartId, ranks);
  await chart.addAlbums(chartId, week, entryIds);

  res.sendStatus(200);
});

module.exports = router;
