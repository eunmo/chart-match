const { chart } = require('../../db');
const { chartIds } = require('./constants');
const { getDoc, refDateYMD } = require('./util');

const chartId = chartIds.jp;

function extract(docs) {
  const ranks = [];
  let rank = 1;

  docs.forEach((doc) => {
    const query = 'section[class="box-rank-entry"] div[class="wrap-text"]';
    Array.from(doc.querySelectorAll(query)).forEach((span) => {
      const titleQuery = 'h2[class="title"]';
      const { textContent: title } = span.querySelector(titleQuery);

      const artistQuery = 'p[class="name"]';
      const { textContent: artist } = span.querySelector(artistQuery);

      ranks.push({ rank, artist, title });
      rank += 1;
    });
  });

  return ranks;
}

async function fetchSingle(date) {
  const ymd = refDateYMD(date, 2, 1);
  const urls = [1, 2, 3, 4, 5].map(
    (p) =>
      `https://www.oricon.co.jp/rank/cos/w/${ymd}/${p > 1 ? `p/${p}/` : ''}`
  );
  const week = refDateYMD(date, 0, 6);
  const promises = await Promise.all(
    urls
      .map((url) => getDoc(url, 'shift_jis'))
      .concat([chart.getRawSingles(chartId, week)])
  );
  const ranks = extract(promises.slice(0, promises.length - 1));
  const existing = promises[promises.length - 1];
  return { existing, ranks };
}

async function fetchAlbum(date) {
  const ymd = refDateYMD(date, 2, 1);
  const urls = [1, 2, 3, 4, 5].map(
    (p) =>
      `https://www.oricon.co.jp/rank/coa/w/${ymd}/${p > 1 ? `p/${p}/` : ''}`
  );
  const week = refDateYMD(date, 0, 6);
  const promises = await Promise.all(
    urls
      .map((url) => getDoc(url, 'shift_jis'))
      .concat([chart.getRawAlbums(chartId, week)])
  );
  const ranks = extract(promises.slice(0, promises.length - 1));
  const existing = promises[promises.length - 1];
  return { existing, ranks };
}

module.exports = { fetchSingle, fetchAlbum };
