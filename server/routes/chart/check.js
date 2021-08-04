const express = require('express');
const { chart, chartEntry } = require('../../db');
const { matchSingle, matchAlbum } = require('./match');
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
const match = {
  album: matchAlbum,
  single: matchSingle,
};
const router = express.Router();

router.get('/:type', async (req, res) => {
  const { type } = req.params;
  const weeks = await chart.getLatestWeeks(type);
  await Promise.all(
    weeks.map(async ({ week, chart: chartId }) => {
      const curWeek = week.toISOString().substring(0, 10);
      const nextWeek = refDateYMD(curWeek, 1, 6);
      const [existing, ranks] = await Promise.all([
        chart.getRaw(type, chartId, curWeek),
        fetchChart[chartId](type, nextWeek),
      ]);

      if (!shouldUpdate(existing, ranks)) {
        return;
      }

      await chartEntry.addMissing(type, chartId, ranks);
      const entryIds = await chartEntry.getIds(type, chartId, ranks);
      await chart.add(type, chartId, nextWeek, entryIds);

      await match[type](chartId, nextWeek, 'us');
      await match[type](chartId, nextWeek, 'jp');
    })
  );

  res.sendStatus(200);
});

module.exports = router;
