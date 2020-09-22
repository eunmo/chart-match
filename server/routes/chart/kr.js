const { chart } = require('../../db');
const { chartIds } = require('./constants');
const { getDoc, refDateYMD, refDateWeek } = require('./util');

const chartId = chartIds.kr;

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

async function fetchSingle(date) {
  const [year, refWeek] = refDateWeek(date, 0, 6);
  const url = `http://www.gaonchart.co.kr/main/section/chart/online.gaon?nationGbn=T&serviceGbn=ALL&targetTime=${refWeek}&hitYear=${year}&termGbn=week`;
  const week = refDateYMD(date, 0, 6);
  const [doc, existing] = await Promise.all([
    getDoc(url),
    chart.getRawSingles(chartId, week),
  ]);
  const ranks = extract(doc);
  return { existing, ranks };
}

async function fetchAlbum(date) {
  const [year, refWeek] = refDateWeek(date, 0, 6);
  const url = `http://www.gaonchart.co.kr/main/section/chart/album.gaon?nationGbn=T&serviceGbn=ALL&targetTime=${refWeek}&hitYear=${year}&termGbn=week`;
  const week = refDateYMD(date, 0, 6);
  const [doc, existing] = await Promise.all([
    getDoc(url),
    chart.getRawAlbums(chartId, week),
  ]);
  const ranks = extract(doc);
  return { existing, ranks };
}

module.exports = { fetchSingle, fetchAlbum };
