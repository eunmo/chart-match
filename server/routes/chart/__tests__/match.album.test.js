const express = require('express');
const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry } = require('../../../db');
const { chartIds } = require('../constants');
const router = require('../match');
const { albums } = require('./test-data');

jest.setTimeout(10000);
const app = express();
app.use('/', router);

const names = ['us', 'jp', 'gb', 'kr'];
const week = '2020-09-12';
const ymd = '2020/09/12';

async function populate(name) {
  const top10 = albums.cur[name];
  const chartId = chartIds[name];

  await chartEntry.addMissingAlbums(chartId, top10);
  const entryIds = await chartEntry.getAlbumIds(chartId, top10);
  await chart.addAlbums(chartId, ymd, entryIds);
}

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS albumChart;');
  await dml('DROP TABLE IF EXISTS albumChartMatch;');
  await dml('DROP TABLE IF EXISTS albumChartEntry;');
  await dml('CREATE TABLE albumChartEntry LIKE chart.albumChartEntry;');
  await dml('CREATE TABLE albumChart LIKE chart.albumChart;');
  await dml('CREATE TABLE albumChartMatch LIKE chart.albumChartMatch;');

  await Promise.all(names.map((name) => populate(name)));
});

afterAll(async () => {
  await dml('DROP TABLE albumChart;');
  await dml('DROP TABLE albumChartMatch;');
  await dml('DROP TABLE albumChartEntry;');
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE albumChartMatch;');
});

const expected = {
  us: {
    us: [
      {
        ranking: 1,
        id: '1530247672',
        url: 'https://music.apple.com/us/album/detroit-2/1530247672',
      },
      {
        ranking: 2,
        id: '1521889004',
        url:
          'https://music.apple.com/us/album/shoot-for-the-stars-aim-for-the-moon/1521889004',
      },
      {
        ranking: 3,
        id: '1522943749',
        url: 'https://music.apple.com/us/album/legends-never-die/1522943749',
      },
      {
        ranking: 4,
        id: '1529231564',
        url: 'https://music.apple.com/us/album/tattletales/1529231564',
      },
      {
        ranking: 5,
        id: '1524801260',
        url: 'https://music.apple.com/us/album/folklore/1524801260',
      },
      {
        ranking: 6,
        id: '1025210938',
        url:
          'https://music.apple.com/us/album/hamilton-american-musical-original-broadway-cast-recording/1025210938',
      },
      {
        ranking: 7,
        id: '1498988850',
        url: 'https://music.apple.com/us/album/my-turn/1498988850',
      },
      {
        ranking: 8,
        id: '1504192331',
        url: 'https://music.apple.com/us/album/pray-4-love/1504192331',
      },
      {
        ranking: 9,
        id: '1508023035',
        url: 'https://music.apple.com/us/album/blame-it-on-baby/1508023035',
      },
      {
        ranking: 10,
        id: '1477880265',
        url: 'https://music.apple.com/us/album/hollywoods-bleeding/1477880265',
      },
    ],
    jp: [
      {
        ranking: 1,
        id: '1530247672',
        url: 'https://music.apple.com/jp/album/detroit-2/1530247672',
      },
      {
        ranking: 2,
        id: '1521889004',
        url:
          'https://music.apple.com/jp/album/shoot-for-the-stars-aim-for-the-moon/1521889004',
      },
      {
        ranking: 3,
        id: '1522943749',
        url: 'https://music.apple.com/jp/album/legends-never-die/1522943749',
      },
      {
        ranking: 4,
        id: '1529231564',
        url: 'https://music.apple.com/jp/album/tattletales/1529231564',
      },
      {
        ranking: 5,
        id: '1528112358',
        url:
          'https://music.apple.com/jp/album/folklore-deluxe-version/1528112358',
      },
      {
        ranking: 6,
        id: '1025210938',
        url:
          'https://music.apple.com/jp/album/hamilton-american-musical-original-broadway-cast-recording/1025210938',
      },
      {
        ranking: 7,
        id: '1498988850',
        url: 'https://music.apple.com/jp/album/my-turn/1498988850',
      },
      {
        ranking: 8,
        id: '1504192331',
        url: 'https://music.apple.com/jp/album/pray-4-love/1504192331',
      },
      {
        ranking: 9,
        id: '1508023035',
        url: 'https://music.apple.com/jp/album/blame-it-on-baby/1508023035',
      },
      {
        ranking: 10,
        id: '1477880265',
        url: 'https://music.apple.com/jp/album/hollywoods-bleeding/1477880265',
      },
    ],
  },
  jp: {
    us: [
      {
        ranking: 1,
        id: '1528149531',
        url: 'https://music.apple.com/us/album/24h-ep/1528149531',
      },
      {
        ranking: 2,
        id: '1525539754',
        url:
          'https://music.apple.com/us/album/heard-that-theres-good-pasta/1525539754',
      },
      {
        ranking: 3,
        id: '1525512958',
        url: 'https://music.apple.com/us/album/stray-sheep/1525512958',
      },
      {
        ranking: 4,
        id: '1522750384',
        url: 'https://music.apple.com/us/album/no-good-left-to-give/1522750384',
      },
      {
        ranking: 5,
        id: '1155649978',
        url: 'https://music.apple.com/us/album/nisamehe-single/1155649978',
      },
      {
        ranking: 6,
        id: '915220144',
        url:
          'https://music.apple.com/us/album/college-marching-band-practice-songs-classic-fun-songs/915220144',
      },
      { ranking: 7, id: null, url: null },
      { ranking: 8, id: null, url: null },
      {
        ranking: 9,
        id: '1520206097',
        url: 'https://music.apple.com/us/album/make-you-happy-ep/1520206097',
      },
      {
        ranking: 10,
        id: '1479397582',
        url: 'https://music.apple.com/us/album/traveler/1479397582',
      },
    ],
    jp: [
      {
        ranking: 1,
        id: '1528149531',
        url: 'https://music.apple.com/jp/album/24h-ep/1528149531',
      },
      {
        ranking: 2,
        id: '1525539754',
        url:
          'https://music.apple.com/jp/album/heard-that-theres-good-pasta/1525539754',
      },
      {
        ranking: 3,
        id: '1521414178',
        url: 'https://music.apple.com/jp/album/stray-sheep/1521414178',
      },
      {
        ranking: 4,
        id: '1528189387',
        url: 'https://music.apple.com/jp/album/no-good/1528189387',
      },
      {
        ranking: 5,
        id: '1046404054',
        url:
          'https://music.apple.com/jp/album/g-o-d-feat-ice-prince-yung-l-single/1046404054',
      },
      {
        ranking: 6,
        id: '2531863',
        url:
          'https://music.apple.com/jp/album/black-star-liner-reggae-from-africa/2531863',
      },
      { ranking: 7, id: null, url: null },
      { ranking: 8, id: null, url: null },
      {
        ranking: 9,
        id: '1519410580',
        url: 'https://music.apple.com/jp/album/make-you-happy-ep/1519410580',
      },
      {
        ranking: 10,
        id: '1479397582',
        url: 'https://music.apple.com/jp/album/traveler/1479397582',
      },
    ],
  },
  gb: {
    us: [
      {
        ranking: 1,
        id: '1440852826',
        url: 'https://music.apple.com/us/album/goats-head-soup/1440852826',
      },
      {
        ranking: 2,
        id: '1495273077',
        url: 'https://music.apple.com/us/album/zeros/1495273077',
      },
      {
        ranking: 3,
        id: '1521889004',
        url:
          'https://music.apple.com/us/album/shoot-for-the-stars-aim-for-the-moon/1521889004',
      },
      {
        ranking: 4,
        id: '1525361355',
        url: 'https://music.apple.com/us/album/crabs-in-a-bucket/1525361355',
      },
      {
        ranking: 5,
        id: '1524801260',
        url: 'https://music.apple.com/us/album/folklore/1524801260',
      },
      {
        ranking: 6,
        id: '1522943749',
        url: 'https://music.apple.com/us/album/legends-never-die/1522943749',
      },
      {
        ranking: 7,
        id: '1452618876',
        url:
          'https://music.apple.com/us/album/divinely-uninspired-to-a-hellish-extent/1452618876',
      },
      {
        ranking: 8,
        id: '1495799403',
        url: 'https://music.apple.com/us/album/future-nostalgia/1495799403',
      },
      {
        ranking: 9,
        id: '1494284390',
        url: 'https://music.apple.com/us/album/all-rise-deluxe/1494284390',
      },
      {
        ranking: 10,
        id: '1485802965',
        url: 'https://music.apple.com/us/album/fine-line/1485802965',
      },
    ],
    jp: [
      {
        ranking: 1,
        id: '1440852826',
        url: 'https://music.apple.com/jp/album/goats-head-soup/1440852826',
      },
      {
        ranking: 2,
        id: '1521184346',
        url: 'https://music.apple.com/jp/album/zeros/1521184346',
      },
      {
        ranking: 3,
        id: '1521889004',
        url:
          'https://music.apple.com/jp/album/shoot-for-the-stars-aim-for-the-moon/1521889004',
      },
      {
        ranking: 4,
        id: '1525361355',
        url: 'https://music.apple.com/jp/album/crabs-in-a-bucket/1525361355',
      },
      {
        ranking: 5,
        id: '1528112358',
        url:
          'https://music.apple.com/jp/album/folklore-deluxe-version/1528112358',
      },
      {
        ranking: 6,
        id: '1522943749',
        url: 'https://music.apple.com/jp/album/legends-never-die/1522943749',
      },
      {
        ranking: 7,
        id: '1452618876',
        url:
          'https://music.apple.com/jp/album/divinely-uninspired-to-a-hellish-extent/1452618876',
      },
      {
        ranking: 8,
        id: '1495799403',
        url: 'https://music.apple.com/jp/album/future-nostalgia/1495799403',
      },
      {
        ranking: 9,
        id: '1494284390',
        url: 'https://music.apple.com/jp/album/all-rise-deluxe/1494284390',
      },
      {
        ranking: 10,
        id: '1485802965',
        url: 'https://music.apple.com/jp/album/fine-line/1485802965',
      },
    ],
  },
  kr: {
    us: [
      { ranking: 1, id: null, url: null },
      { ranking: 2, id: null, url: null },
      {
        ranking: 3,
        id: '1530216879',
        url: 'https://music.apple.com/us/album/bon-voyage-ep/1530216879',
      },
      {
        ranking: 4,
        id: '1531445989',
        url:
          'https://music.apple.com/us/album/the-first-step-chapter-two-single/1531445989',
      },
      { ranking: 5, id: null, url: null },
      {
        ranking: 6,
        id: '1528946634',
        url:
          'https://music.apple.com/us/album/the-book-of-us-gluon-nothing-can-tear-us-apart/1528946634',
      },
      {
        ranking: 7,
        id: '1523752057',
        url: 'https://music.apple.com/us/album/zero-fever-pt-1/1523752057',
      },
      {
        ranking: 8,
        id: '1530785705',
        url: 'https://music.apple.com/us/album/bird-single/1530785705',
      },
      {
        ranking: 9,
        id: '1528295587',
        url:
          'https://music.apple.com/us/album/hideout-the-new-day-we-step-into-season-2/1528295587',
      },
      {
        ranking: 10,
        id: '1530315721',
        url:
          'https://music.apple.com/us/album/he-dont-wanna-be-alone-single/1530315721',
      },
    ],
    jp: [
      { ranking: 1, id: null, url: null },
      { ranking: 2, id: null, url: null },
      {
        ranking: 3,
        id: '1530379595',
        url: 'https://music.apple.com/jp/album/bon-voyage-ep/1530379595',
      },
      {
        ranking: 4,
        id: '1531654203',
        url:
          'https://music.apple.com/jp/album/the-first-step-chapter-two-single/1531654203',
      },
      { ranking: 5, id: null, url: null },
      {
        ranking: 6,
        id: '1528946634',
        url:
          'https://music.apple.com/jp/album/the-book-of-us-gluon-nothing-can-tear-us-apart/1528946634',
      },
      {
        ranking: 7,
        id: '1523752057',
        url: 'https://music.apple.com/jp/album/zero-fever-pt-1/1523752057',
      },
      {
        ranking: 8,
        id: '1530785705',
        url: 'https://music.apple.com/jp/album/bird-single/1530785705',
      },
      {
        ranking: 9,
        id: '1528295587',
        url:
          'https://music.apple.com/jp/album/hideout-the-new-day-we-step-into-season-2/1528295587',
      },
      {
        ranking: 10,
        id: '1530315721',
        url:
          'https://music.apple.com/jp/album/he-dont-wanna-be-alone-single/1530315721',
      },
    ],
  },
};

test.each([
  ['us', 'us'],
  ['us', 'jp'],
  ['jp', 'us'],
  ['jp', 'jp'],
  ['gb', 'us'],
  ['gb', 'jp'],
  ['kr', 'us'],
  ['kr', 'jp'],
])('match album %s %s', async (name, store) => {
  const url = `/album/${name}/${week}/${store}`;
  const response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const chartId = chartIds[name];
  const matches = await chart.getAlbumMatches(chartId, ymd, store);

  const expectedMatches = expected[name][store];
  expect(matches.length).toBe(expectedMatches.length);
  expectedMatches.forEach((e, index) => {
    const match = { ...matches[index] };
    expect(match).toStrictEqual(e);
  });
});

test.each([
  ['us', 'us'],
  ['us', 'jp'],
  ['jp', 'us'],
  ['jp', 'jp'],
  ['gb', 'us'],
  ['gb', 'jp'],
  ['kr', 'us'],
  ['kr', 'jp'],
])('match partial album %s %s', async (name, store) => {
  const url = `/album/${name}/${week}/${store}`;
  let response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  await dml('DELETE FROM albumChartMatch where entry % 3 = 0');

  response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const chartId = chartIds[name];
  const matches = await chart.getAlbumMatches(chartId, ymd, store);

  const expectedMatches = expected[name][store];
  expect(matches.length).toBe(expectedMatches.length);
  expectedMatches.forEach((e, index) => {
    const match = { ...matches[index] };
    expect(match).toStrictEqual(e);
  });
});
