const { getDoc, refDateWeek } = require('./util');

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
  return extract(await getDoc(url));
}

async function fetchAlbum(date) {
  const [year, refWeek] = refDateWeek(date, 0, 6);
  const url = `http://www.gaonchart.co.kr/main/section/chart/album.gaon?nationGbn=T&serviceGbn=ALL&targetTime=${refWeek}&hitYear=${year}&termGbn=week`;
  return extract(await getDoc(url));
}

module.exports = { fetchSingle, fetchAlbum };
