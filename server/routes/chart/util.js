const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

async function getDoc(url) {
  const response = await fetch(url);
  const html = await response.text();
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

module.exports = { getDoc, refDateYMD };
