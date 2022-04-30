const apn = require('apn');
const path = require('path');
const { TextDecoder } = require('util');
const fetch = require('node-fetch');
const config = require('config');
const { JSDOM } = require('jsdom');
const https = require('https');

async function getDoc(url, { charset = 'utf-8', useAgent = false } = {}) {
  let fetchOptions = {};
  if (useAgent) {
    const agent = new https.Agent({ rejectUnauthorized: false });
    fetchOptions = { agent };
  }
  const response = await fetch(url, fetchOptions);
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

  const diffs = existing.filter(
    ({ artist, title }, index) =>
      artist !== toAdd[index].artist || title !== toAdd[index].title
  );

  return diffs.length > 5;
}

async function sendAPN(chart, type) {
  const { device, keyId, teamId } = config.get('apn');
  const key = path.join(__dirname, '../../../authkey.p8');
  const options = { token: { key, keyId, teamId }, production: false };
  const apnProvider = new apn.Provider(options);

  const notification = new apn.Notification();
  notification.expiry = Math.floor(Date.now() / 1000) + 24 * 3600; // will expire in 24 hours from now
  notification.badge = 1;
  notification.alert = `${chart} ${type} chart updated`;
  notification.payload = { messageFrom: 'Chart Match' };

  notification.topic = 'be.eunmo.ChartMatch';

  await apnProvider.send(notification, device);
  apnProvider.shutdown();
}

module.exports = {
  getDoc,
  refDateYMD,
  refDateWeek,
  shouldUpdate,
  sendAPN,
};
