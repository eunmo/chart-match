const express = require('express');
const { chart, chartEntry } = require('../../db');
const { refDateYMD, shouldUpdate } = require('./util');
const us = require('./us');
const jp = require('./jp');
const gb = require('./gb');
const kr = require('./kr');

const fetchChart = { us, jp, gb, kr };
const router = express.Router();

router.get('/:type/:chartName/:date', async (req, res) => {
  const { type, chartName, date } = req.params;
  const week = refDateYMD(date, 0, 6);

  const chartId = chart.ids[chartName];
  if (chartId === undefined) {
    res.sendStatus(200);
    return;
  }

  const [existing, ranks] = await Promise.all([
    chart.getRaw(type, chartId, week),
    fetchChart[chartName](type, date),
  ]);

  if (!shouldUpdate(existing, ranks)) {
    res.sendStatus(200);
    return;
  }

  await chartEntry.addMissing(type, chartId, ranks);
  const entryIds = await chartEntry.getIds(type, chartId, ranks);
  await chart.add(type, chartId, week, entryIds);

  res.sendStatus(200);
});

module.exports = router;
