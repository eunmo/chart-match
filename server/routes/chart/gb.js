const { getDoc, refDateYMD } = require('./util');

function extract(doc) {
  const ranks = [];
  let rank = 1;

  Array.from(doc.querySelectorAll('div[class="description block"] p')).some(
    (div) => {
      const titleQuery = 'a.chart-name span:last-child';
      let { textContent: title } = div.querySelector(titleQuery);
      title = title.trim();

      const artistQuery = '.chart-artist';
      let { textContent: artist } = div.querySelector(artistQuery);
      artist = artist.trim();

      ranks.push({ rank, artist, title });
      rank += 1;

      return rank > 100;
    }
  );

  return ranks;
}

async function fetch(type, date) {
  const ymd = refDateYMD(date, 0, 5).replace(/-/g, '');
  const url =
    type === 'single'
      ? `https://www.officialcharts.com/charts/singles-chart/${ymd}/7501`
      : `https://www.officialcharts.com/charts/albums-chart/${ymd}/7502`;
  return extract(await getDoc(url, { useAgent: true }));
}

module.exports = fetch;
