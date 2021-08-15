const { getDoc, refDateWeek } = require('./util');

function extract(doc) {
  const ranks = [];
  let rank = 1;

  const query = 'div[class="description"]';
  Array.from(doc.querySelectorAll(query)).some((td) => {
    const titleQuery = 'div[class="titre"]';
    let { textContent: title } = td.querySelector(titleQuery);

    const artistQuery = 'div[class="artiste"]';
    let { textContent: artist } = td.querySelector(artistQuery);

    ranks.push({ rank, artist, title });
    rank += 1;

    return rank > 100;
  });
  return ranks;
}

/*
  '2015-08-01', // 31
  '2016-08-06', // 31
  '2017-08-05', // 31
  '2018-08-04', // 31
  '2019-08-03', // 31
  '2020-08-01', // 31
  '2021-08-07', // 31
 */

async function fetch(type, date) {
  const [year, refWeek] = refDateWeek(date, 0, 3);
  let url = `https://snepmusique.com/les-tops/le-top-de-la-semaine/top-albums/?semaine=${refWeek}?&annee=${year}`;
  if (type === 'single') {
    url += 'categorie=Top%20Singles';
  }
  return extract(await getDoc(url));
}

module.exports = fetch;
