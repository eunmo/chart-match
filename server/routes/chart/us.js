const { chart } = require('../../db');
const { chartIds } = require('./constants');
const { getDoc, refDateYMD } = require('./util');

const chartId = chartIds.us;

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

async function fetchSingle(date) {
  const ymd = refDateYMD(date, 1, 4);
  const url = `https://www.billboard.com/charts/hot-100/${ymd}`;
  const week = refDateYMD(date, 0, 6);
  const [doc, existing] = await Promise.all([
    getDoc(url),
    chart.getRawSingles(chartId, week),
  ]);
  const ranks = extract(doc);
  return { existing, ranks };
}

async function fetchAlbum(date) {
  const ymd = refDateYMD(date, 1, 4);
  const url = `https://www.billboard.com/charts/billboard-200/${ymd}`;
  const week = refDateYMD(date, 0, 6);
  const [doc, existing] = await Promise.all([
    getDoc(url),
    chart.getRawAlbums(chartId, week),
  ]);
  const ranks = extract(doc);
  return { existing, ranks };
}

module.exports = { fetchSingle, fetchAlbum };
