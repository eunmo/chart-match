const express = require('express');
const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry } = require('../../../db');
const { chartIds } = require('../constants');
const router = require('../match');
const { albums } = require('./test-data');

const app = express();
app.use('/', router);

const names = ['us', 'gb'];
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
};

test.each([
  ['us', 'us'],
  ['us', 'jp'],
  ['gb', 'us'],
  ['gb', 'jp'],
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
  ['gb', 'us'],
  ['gb', 'jp'],
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
