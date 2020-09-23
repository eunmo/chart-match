const express = require('express');
const { chart, chartEntry } = require('../../db');
const { refDateYMD, shouldUpdate } = require('./util');
const us = require('./us');
const jp = require('./jp');
const gb = require('./gb');
const kr = require('./kr');

const fetchChart = {
  [chart.ids.us]: us,
  [chart.ids.jp]: jp,
  [chart.ids.gb]: gb,
  [chart.ids.kr]: kr,
};
const router = express.Router();

router.get('/single', async (req, res) => {
  const weeks = await chart.getLatestSingleWeeks();
  await Promise.all(
    weeks.map(async ({ week, chart: chartId }) => {
      const curWeek = week.toISOString().substring(0, 10);
      const nextWeek = refDateYMD(curWeek, 1, 6);
      const [existing, ranks] = await Promise.all([
        chart.getRawSingles(chartId, curWeek),
        fetchChart[chartId].fetchSingle(nextWeek),
      ]);

      if (!shouldUpdate(existing, ranks)) {
        return;
      }

      await chartEntry.addMissingSingles(chartId, ranks);
      const entryIds = await chartEntry.getSingleIds(chartId, ranks);
      await chart.addSingles(chartId, nextWeek, entryIds);
    })
  );

  res.sendStatus(200);
});

router.get('/album', async (req, res) => {
  const weeks = await chart.getLatestAlbumWeeks();
  await Promise.all(
    weeks.map(async ({ week, chart: chartId }) => {
      const curWeek = week.toISOString().substring(0, 10);
      const nextWeek = refDateYMD(curWeek, 1, 6);
      const [existing, ranks] = await Promise.all([
        chart.getRawAlbums(chartId, curWeek),
        fetchChart[chartId].fetchAlbum(nextWeek),
      ]);

      if (!shouldUpdate(existing, ranks)) {
        return;
      }

      await chartEntry.addMissingAlbums(chartId, ranks);
      const entryIds = await chartEntry.getAlbumIds(chartId, ranks);
      await chart.addAlbums(chartId, nextWeek, entryIds);
    })
  );

  res.sendStatus(200);
});

module.exports = router;
