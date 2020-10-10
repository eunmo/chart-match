const { URL } = require('url');
const { TextDecoder } = require('util');
const fetch = require('node-fetch');
const config = require('config');
const { JSDOM } = require('jsdom');

const token = config.get('appleMusicToken');

async function queryAppleMusic(url) {
  const response = await fetch(new URL(url), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

async function searchAppleCatalog(type, store, ids) {
  if (ids.length === 0) {
    return {};
  }

  const query = `${type}?ids=${ids.join(',')}`;
  const url = `https://api.music.apple.com/v1/catalog/${store}/${query}`;
  const { data } = await queryAppleMusic(url);
  const dataMap = {};
  data.forEach((row) => {
    dataMap[row.id] = row;
  });
  return dataMap;
}

async function getDoc(url, charset = 'utf-8') {
  const response = await fetch(url);
  let html;
  if (charset === 'utf-8') {
    html = await response.text();
  } else {
    const decoder = new TextDecoder(charset);
    html = decoder.decode(await response.arrayBuffer());
  }
  const dom = new JSDOM(html, { url });
  return dom.window.document;
}

function ymd(date) {
  const [year, month, day] = date.split('-').map((s) => parseInt(s, 10));

  return { year, month, day };
}

function refDateYMD(date, weekDiff, dayDiff) {
  const { year: y, month: m, day: d } = ymd(date);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() - utc.getUTCDay() + weekDiff * 7 + dayDiff);
  return utc.toISOString().substring(0, 10);
}

function refDateWeek(date, weekDiff, dayDiff) {
  const { year: y, month: m, day: d } = ymd(date);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() - utc.getUTCDay() + weekDiff * 7 + dayDiff);
  let year = utc.getUTCFullYear();
  if (year <= 2015) {
    if (year === 2015 && utc.toISOString().substring(0, 10) === '2015-12-26') {
      return [2015, '53'];
    }
    utc.setUTCDate(utc.getUTCDate() + 7);
  }
  year = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const weekNo = Math.ceil(((utc - yearStart) / 86400000 + 1) / 7);
  const week = `${weekNo}`.padStart(2, '0');
  return [year, week];
}

function shouldUpdate(existing, toAdd) {
  if (existing.length === 0) {
    return true;
  }

  if (existing.length !== toAdd.length) {
    return false;
  }

  const diffs = existing.filter(
    ({ artist, title }, index) =>
      artist !== toAdd[index].artist || title !== toAdd[index].title
  );

  return diffs.length > 5;
}

const typeToApple = { single: 'songs', album: 'albums' };

module.exports = {
  queryAppleMusic,
  searchAppleCatalog,
  getDoc,
  refDateYMD,
  refDateWeek,
  shouldUpdate,
  typeToApple,
};
