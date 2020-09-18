const express = require('express');
const { getDoc, refDateYMD } = require('./util');

const router = express.Router();

router.get('/fetch/single/:date', async (req, res) => {
  const { date } = req.params;
  const ymd = refDateYMD(date, 1, 4);
  const url = `https://www.billboard.com/charts/hot-100/${ymd}`;
  const doc = await getDoc(url);

  const ranks = [];
  let rank = 1;

  const query = 'span[class="chart-element__information"]';
  doc.querySelectorAll(query).forEach((span) => {
    const titleQuery = 'span[class*="chart-element__information__song"]';
    const { textContent: title } = span.querySelector(titleQuery);

    const artistQuery = 'span[class*="chart-element__information__artist"]';
    const { textContent: artist } = span.querySelector(artistQuery);

    ranks.push({ rank, artist, titles: [title] });
    rank += 1;
  });

  res.json(ranks);
});

router.get('/fetch/album/:date', async (req, res) => {
  const { date } = req.params;
  const ymd = refDateYMD(date, 1, 4);
  const url = `https://www.billboard.com/charts/billboard-200/${ymd}`;
  const doc = await getDoc(url);

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

  res.json(ranks);
});

module.exports = router;
