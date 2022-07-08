const nodeFetch = require('node-fetch');
const { getDoc, refDateWeek } = require('./util');

async function fetchAlbums(date) {
  const [year, week] = refDateWeek(date, 0, 0);

  const url = `https://circlechart.kr/data/api/chart/album`;
  const response = await nodeFetch(url, {
    method: 'post',
    body: `nationGbn=T&termGbn=week&hitYear=${year}&targetTime=${week}&yearTime=3&curUrl=circlechart.kr%2Fpage_chart%2Falbum.circle%3F`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
  });
  const { List } = await response.json();
  return Object.entries(List).map(([index, { ALBUM_NAME, ARTIST_NAME }]) => {
    const rank = parseInt(index, 10) + 1;
    const title = ALBUM_NAME.replace(/`/g, "'");
    const artist = ARTIST_NAME.replace(/`/g, "'").replace(/\|.*$/, '').trim();
    return { rank, artist, title };
  });
}

async function fetchSingles(date) {
  const [year, week] = refDateWeek(date, 0, 0);

  const url = `https://circlechart.kr/data/api/chart/onoff`;
  const response = await nodeFetch(url, {
    method: 'post',
    body: `nationGbn=T&termGbn=week&hitYear=${year}&targetTime=${week}&yearTime=3&curUrl=circlechart.kr%2Fpage_chart%2Falbum.onoff%3F`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
  });
  const { List } = await response.json();
  return Object.entries(List)
    .slice(0, 100)
    .map(([index, { ALBUM_NAME, ARTIST_NAME }]) => {
      const rank = parseInt(index, 10) + 1;
      const title = ALBUM_NAME.replace(/`/g, "'");
      const artist = ARTIST_NAME.replace(/`/g, "'").replace(/\|.*$/, '').trim();
      return { rank, artist, title };
    });
}

async function fetch(type, date) {
  const fn = type === 'single' ? fetchSingles : fetchAlbums;
  const ranks = await fn(date);
  return ranks;
}

module.exports = fetch;
