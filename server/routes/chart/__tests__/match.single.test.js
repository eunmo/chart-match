const express = require('express');
const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry } = require('../../../db');
const { chartIds } = require('../constants');
const router = require('../match');
const { singles } = require('./test-data');

const app = express();
app.use('/', router);

const names = ['us', 'gb'];
const week = '2020-09-12';
const ymd = '2020/09/12';

async function populate(name) {
  const top10 = singles.cur[name];
  const chartId = chartIds[name];

  await chartEntry.addMissingSingles(chartId, top10);
  const entryIds = await chartEntry.getSingleIds(chartId, top10);
  await chart.addSingles(chartId, ymd, entryIds);
}

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS singleChart;');
  await dml('DROP TABLE IF EXISTS singleChartMatch;');
  await dml('DROP TABLE IF EXISTS singleChartEntry;');
  await dml('CREATE TABLE singleChartEntry LIKE chart.singleChartEntry;');
  await dml('CREATE TABLE singleChart LIKE chart.singleChart;');
  await dml('CREATE TABLE singleChartMatch LIKE chart.singleChartMatch;');

  await Promise.all(names.map((name) => populate(name)));
});

afterAll(async () => {
  await dml('DROP TABLE singleChart;');
  await dml('DROP TABLE singleChartMatch;');
  await dml('DROP TABLE singleChartEntry;');
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE singleChartMatch;');
});

const expected = {
  us: {
    us: [
      {
        ranking: 1,
        track: 0,
        id: '1526746984',
        url:
          'https://music.apple.com/us/album/wap-feat-megan-thee-stallion/1526746980?i=1526746984',
      },
      {
        ranking: 2,
        track: 0,
        id: '1529518695',
        url:
          'https://music.apple.com/us/album/dynamite/1529518691?i=1529518695',
      },
      {
        ranking: 3,
        track: 0,
        id: '1527584879',
        url:
          'https://music.apple.com/us/album/laugh-now-cry-later-feat-lil-durk/1527584873?i=1527584879',
      },
      {
        ranking: 4,
        track: 0,
        id: '1508023280',
        url:
          'https://music.apple.com/us/album/rockstar-feat-roddy-ricch/1508023035?i=1508023280',
      },
      {
        ranking: 5,
        track: 0,
        id: '1488408568',
        url:
          'https://music.apple.com/us/album/blinding-lights/1488408555?i=1488408568',
      },
      {
        ranking: 6,
        track: 0,
        id: '1522994920',
        url:
          'https://music.apple.com/us/album/mood-feat-iann-dior/1522994918?i=1522994920',
      },
      {
        ranking: 7,
        track: 0,
        id: '1485802967',
        url:
          'https://music.apple.com/us/album/watermelon-sugar/1485802965?i=1485802967',
      },
      {
        ranking: 8,
        track: 0,
        id: '1519349225',
        url:
          'https://music.apple.com/us/album/whats-poppin-remix-feat-dababy-tory-lanez-lil-wayne/1519349212?i=1519349225',
      },
      {
        ranking: 9,
        track: 0,
        id: '1517696110',
        url:
          'https://music.apple.com/us/album/savage-love-laxed-siren-beat/1517696097?i=1517696110',
      },
      {
        ranking: 10,
        track: 0,
        id: '1523923824',
        url:
          'https://music.apple.com/us/album/popstar-feat-drake/1523923474?i=1523923824',
      },
    ],
    jp: [
      {
        ranking: 1,
        track: 0,
        id: '1526746984',
        url:
          'https://music.apple.com/jp/album/wap-feat-megan-thee-stallion/1526746980?i=1526746984',
      },
      {
        ranking: 2,
        track: 0,
        id: '1528831888',
        url:
          'https://music.apple.com/jp/album/dynamite/1528831887?i=1528831888',
      },
      {
        ranking: 3,
        track: 0,
        id: '1527584879',
        url:
          'https://music.apple.com/jp/album/laugh-now-cry-later-feat-lil-durk/1527584873?i=1527584879',
      },
      {
        ranking: 4,
        track: 0,
        id: '1508023280',
        url:
          'https://music.apple.com/jp/album/rockstar-feat-roddy-ricch/1508023035?i=1508023280',
      },
      {
        ranking: 5,
        track: 0,
        id: '1488408568',
        url:
          'https://music.apple.com/jp/album/blinding-lights/1488408555?i=1488408568',
      },
      {
        ranking: 6,
        track: 0,
        id: '1522994920',
        url:
          'https://music.apple.com/jp/album/mood-feat-iann-dior/1522994918?i=1522994920',
      },
      {
        ranking: 7,
        track: 0,
        id: '1485802967',
        url:
          'https://music.apple.com/jp/album/watermelon-sugar/1485802965?i=1485802967',
      },
      {
        ranking: 8,
        track: 0,
        id: '1519349225',
        url:
          'https://music.apple.com/jp/album/whats-poppin-remix-feat-dababy-tory-lanez-lil-wayne/1519349212?i=1519349225',
      },
      {
        ranking: 9,
        track: 0,
        id: '1517696110',
        url:
          'https://music.apple.com/jp/album/savage-love-laxed-siren-beat/1517696097?i=1517696110',
      },
      {
        ranking: 10,
        track: 0,
        id: '1523923824',
        url:
          'https://music.apple.com/jp/album/popstar-feat-drake/1523923474?i=1523923824',
      },
    ],
  },
  gb: {
    us: [
      {
        ranking: 1,
        track: 0,
        id: '1526746984',
        url:
          'https://music.apple.com/us/album/wap-feat-megan-thee-stallion/1526746980?i=1526746984',
      },
      {
        ranking: 2,
        track: 0,
        id: '1522994920',
        url:
          'https://music.apple.com/us/album/mood-feat-iann-dior/1522994918?i=1522994920',
      },
      {
        ranking: 3,
        track: 0,
        id: '1527453622',
        url:
          'https://music.apple.com/us/album/aint-it-different-feat-aj-tracey-stormzy/1527453508?i=1527453622',
      },
      {
        ranking: 4,
        track: 0,
        id: '1522012311',
        url:
          'https://music.apple.com/us/album/lighter-feat-ksi/1522012310?i=1522012311',
      },
      {
        ranking: 5,
        track: 0,
        id: '1521889940',
        url:
          'https://music.apple.com/us/album/mood-swings-feat-lil-tjay/1521889004?i=1521889940',
      },
      {
        ranking: 6,
        track: 0,
        id: '1518804165',
        url:
          'https://music.apple.com/us/album/head-heart-feat-mnek/1518804164?i=1518804165',
      },
      {
        ranking: 7,
        track: 0,
        id: '1527584879',
        url:
          'https://music.apple.com/us/album/laugh-now-cry-later-feat-lil-durk/1527584873?i=1527584879',
      },
      {
        ranking: 8,
        track: 0,
        id: '1511808887',
        url:
          'https://music.apple.com/us/album/looking-for-me/1511808751?i=1511808887',
      },
      {
        ranking: 9,
        track: 0,
        id: '1523923826',
        url:
          'https://music.apple.com/us/album/greece-feat-drake/1523923810?i=1523923826',
      },
      {
        ranking: 10,
        track: 0,
        id: '1527145752',
        url:
          'https://music.apple.com/us/album/midnight-sky/1527145746?i=1527145752',
      },
    ],
    jp: [
      {
        ranking: 1,
        track: 0,
        id: '1526746984',
        url:
          'https://music.apple.com/jp/album/wap-feat-megan-thee-stallion/1526746980?i=1526746984',
      },
      {
        ranking: 2,
        track: 0,
        id: '1522994920',
        url:
          'https://music.apple.com/jp/album/mood-feat-iann-dior/1522994918?i=1522994920',
      },
      {
        ranking: 3,
        track: 0,
        id: '1527453622',
        url:
          'https://music.apple.com/jp/album/aint-it-different-feat-aj-tracey-stormzy/1527453508?i=1527453622',
      },
      {
        ranking: 4,
        track: 0,
        id: '1522012311',
        url:
          'https://music.apple.com/jp/album/lighter-feat-ksi/1522012310?i=1522012311',
      },
      {
        ranking: 5,
        track: 0,
        id: '1521889940',
        url:
          'https://music.apple.com/jp/album/mood-swings-feat-lil-tjay/1521889004?i=1521889940',
      },
      {
        ranking: 6,
        track: 0,
        id: '1518804165',
        url:
          'https://music.apple.com/jp/album/head-heart-feat-mnek/1518804164?i=1518804165',
      },
      {
        ranking: 7,
        track: 0,
        id: '1527584879',
        url:
          'https://music.apple.com/jp/album/laugh-now-cry-later-feat-lil-durk/1527584873?i=1527584879',
      },
      {
        ranking: 8,
        track: 0,
        id: '1513872008',
        url:
          'https://music.apple.com/jp/album/looking-for-me/1513871854?i=1513872008',
      },
      {
        ranking: 9,
        track: 0,
        id: '1523923826',
        url:
          'https://music.apple.com/jp/album/greece-feat-drake/1523923810?i=1523923826',
      },
      {
        ranking: 10,
        track: 0,
        id: '1527145752',
        url:
          'https://music.apple.com/jp/album/midnight-sky/1527145746?i=1527145752',
      },
    ],
  },
};

test.each([
  ['us', 'us'],
  ['us', 'jp'],
  ['gb', 'us'],
  ['gb', 'jp'],
])('match single %s %s', async (name, store) => {
  const url = `/single/${name}/${week}/${store}`;
  const response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const chartId = chartIds[name];
  const matches = await chart.getSingleMatches(chartId, ymd, store);

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
])('match partial single %s %s', async (name, store) => {
  const url = `/single/${name}/${week}/${store}`;
  let response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  await dml('DELETE FROM singleChartMatch where entry % 3 = 0');

  response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const chartId = chartIds[name];
  const matches = await chart.getSingleMatches(chartId, ymd, store);

  const expectedMatches = expected[name][store];
  expect(matches.length).toBe(expectedMatches.length);
  expectedMatches.forEach((e, index) => {
    const match = { ...matches[index] };
    expect(match).toStrictEqual(e);
  });
});
