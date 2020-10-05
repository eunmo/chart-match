const { getDoc, refDateYMD } = require('./util');

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

async function fetch(type, date) {
  const ymd = refDateYMD(date, 1, 4);
  const url =
    type === 'single'
      ? `https://www.billboard.com/charts/hot-100/${ymd}`
      : `https://www.billboard.com/charts/billboard-200/${ymd}`;
  return extract(await getDoc(url));
}

module.exports = fetch;
