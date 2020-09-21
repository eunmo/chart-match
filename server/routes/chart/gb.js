const express = require('express');
const { chart, chartEntry } = require('../../db');
const { chartIds } = require('./constants');
const { getDoc, refDateYMD, shouldUpdate } = require('./util');

const chartId = chartIds.gb;
const router = express.Router();

function extract(doc) {
  const ranks = [];
  let rank = 1;

  Array.from(doc.querySelectorAll('div[class="title-artist"]')).some((div) => {
    const titleQuery = 'div[class="title"]';
    let { textContent: title } = div.querySelector(titleQuery);
    title = title.trim();

    const artistQuery = 'div[class="artist"]';
    let { textContent: artist } = div.querySelector(artistQuery);
    artist = artist.trim();

    ranks.push({ rank, artist, title });
    rank += 1;

    return rank > 100;
  });

  return ranks;
}

router.get('/single/:date', async (req, res) => {
  const { date } = req.params;
  const ymd = refDateYMD(date, 0, 5).replace('-', '');
  const url = `https://www.officialcharts.com/charts/singles-chart/${ymd}/7501`;
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

router.get('/album/:date', async (req, res) => {
  const { date } = req.params;
  const ymd = refDateYMD(date, 0, 5).replace('-', '');
  const url = `https://www.officialcharts.com/charts/albums-chart/${ymd}/7502`;
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
