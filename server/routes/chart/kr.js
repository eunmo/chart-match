const express = require('express');
const { chart, chartEntry } = require('../../db');
const { chartIds } = require('./constants');
const { getDoc, refDateYMD, refDateWeek, shouldUpdate } = require('./util');

const chartId = chartIds.kr;
const router = express.Router();

function extract(doc) {
  const ranks = [];
  let rank = 1;

  const query = 'td[class*="subject"]';
  Array.from(doc.querySelectorAll(query)).some((td) => {
    const titleQuery = 'p';
    let title = td.querySelector(titleQuery).getAttribute('title');

    const artistQuery = 'p[class~="singer"]';
    let artist = td.querySelector(artistQuery).getAttribute('title');

    title = title.replace(/`/g, "'");
    artist = artist.replace(/`/g, "'").replace(/\|.*$/, '').trim();
    ranks.push({ rank, artist, title });
    rank += 1;

    return rank > 100;
  });

  return ranks;
}

router.get('/single/:date', async (req, res) => {
  const { date } = req.params;
  const [year, refWeek] = refDateWeek(date, 0, 6);
  const url = `http://www.gaonchart.co.kr/main/section/chart/online.gaon?nationGbn=T&serviceGbn=ALL&targetTime=${refWeek}&hitYear=${year}&termGbn=week`;
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
  const [year, refWeek] = refDateWeek(date, 0, 6);
  const url = `http://www.gaonchart.co.kr/main/section/chart/album.gaon?nationGbn=T&serviceGbn=ALL&targetTime=${refWeek}&hitYear=${year}&termGbn=week`;
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
