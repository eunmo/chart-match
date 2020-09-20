const express = require('express');
const { chart, chartEntry } = require('../../db');
const { chartIds } = require('./constants');
const { getDoc, refDateYMD, shouldUpdate } = require('./util');

const chartId = chartIds.us;
const router = express.Router();

function extract(doc) {
  const ranks = [];
  let rank = 1;

  const query = 'span[class="chart-element__information"]';
  Array.from(doc.querySelectorAll(query)).some((span) => {
    const titleQuery = 'span[class*="chart-element__information__song"]';
    const { textContent: title } = span.querySelector(titleQuery);

    const artistQuery = 'span[class*="chart-element__information__artist"]';
    const { textContent: artist } = span.querySelector(artistQuery);

    ranks.push({ rank, artist, title });
    rank += 1;

    return rank > 100;
  });

  return ranks;
}

router.get('/fetch/single/:date', async (req, res) => {
  const { date } = req.params;
  const ymd = refDateYMD(date, 1, 4);
  const url = `https://www.billboard.com/charts/hot-100/${ymd}`;
  const week = refDateYMD(date, 0, 6);
  const [doc, existing] = await Promise.all([
    getDoc(url),
    chart.getRawSingles(chartId, week),
  ]);
  const ranks = extract(doc);

  if (!shouldUpdate(existing, ranks)) {
    res.sendStatus(200);
    return;
  }

  await chartEntry.addMissingSingles(chartId, ranks);
  const entryIds = await chartEntry.getSingleIds(chartId, ranks);
  await chart.addSingles(chartId, week, entryIds);

  res.sendStatus(200);
});

router.get('/fetch/album/:date', async (req, res) => {
  const { date } = req.params;
  const ymd = refDateYMD(date, 1, 4);
  const url = `https://www.billboard.com/charts/billboard-200/${ymd}`;
  const week = refDateYMD(date, 0, 6);
  const [doc, existing] = await Promise.all([
    getDoc(url),
    chart.getRawAlbums(chartId, week),
  ]);
  const ranks = extract(doc);

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
