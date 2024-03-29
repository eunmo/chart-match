const { getDoc, refDateYMD } = require('./util');

function extract(doc) {
  const ranks = [];
  let rank = 1;

  const query = 'div[class="o-chart-results-list-row-container"]';
  Array.from(doc.querySelectorAll(query)).some((div) => {
    const titleQuery = 'h3[class*="c-title"]';
    const { textContent: title } = div.querySelector(titleQuery);

    const artistQuery = `${titleQuery} + span[class*="c-label"]`;
    const { textContent: artist } = div.querySelector(artistQuery);

    ranks.push({ rank, artist: artist.trim(), title: title.trim() });
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
