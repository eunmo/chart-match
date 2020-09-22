const express = require('express');
const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry } = require('../../../db');
const { chartIds } = require('../constants');
const router = require('../match');
const { singles } = require('./test-data');

const app = express();
app.use('/', router);

const names = ['us', 'jp', 'gb', 'kr'];
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
  jp: {
    us: [
      {
        ranking: 1,
        track: 0,
        id: '1527213875',
        url: 'https://music.apple.com/us/album/oh-yeah/1527213862?i=1527213875',
      },
      {
        ranking: 2,
        track: 0,
        id: '1508133095',
        url:
          'https://music.apple.com/us/album/naked-heart/1508133094?i=1508133095',
      },
      {
        ranking: 3,
        track: 0,
        id: '1522413698',
        url: 'https://music.apple.com/us/album/hello/1522413697?i=1522413698',
      },
      {
        ranking: 4,
        track: 0,
        id: '1520206112',
        url:
          'https://music.apple.com/us/album/make-you-happy/1520206097?i=1520206112',
      },
      {
        ranking: 5,
        track: 0,
        id: '1490256995',
        url:
          'https://music.apple.com/us/album/%E5%A4%9C%E3%81%AB%E9%A7%86%E3%81%91%E3%82%8B/1490256978?i=1490256995',
      },
      {
        ranking: 6,
        track: 0,
        id: '1529518695',
        url:
          'https://music.apple.com/us/album/dynamite/1529518691?i=1529518695',
      },
      {
        ranking: 7,
        track: 0,
        id: '1528927424',
        url:
          'https://music.apple.com/us/album/spark-again/1528927423?i=1528927424',
      },
      {
        ranking: 8,
        track: 0,
        id: '1529398354',
        url: 'https://music.apple.com/us/album/mirror/1529398352?i=1529398354',
      },
      {
        ranking: 8,
        track: 1,
        id: '1529398355',
        url: 'https://music.apple.com/us/album/dance/1529398352?i=1529398355',
      },
      { ranking: 9, track: 0, id: null, url: null },
      {
        ranking: 10,
        track: 0,
        id: '1524596325',
        url: 'https://music.apple.com/us/album/kousui/1524596324?i=1524596325',
      },
    ],
    jp: [
      {
        ranking: 1,
        track: 0,
        id: '1527213875',
        url: 'https://music.apple.com/jp/album/oh-yeah/1527213862?i=1527213875',
      },
      {
        ranking: 2,
        track: 0,
        id: '1508133095',
        url:
          'https://music.apple.com/jp/album/%E8%A3%B8%E3%81%AE%E5%BF%83/1508133094?i=1508133095',
      },
      {
        ranking: 3,
        track: 0,
        id: '1522413698',
        url: 'https://music.apple.com/jp/album/hello/1522413697?i=1522413698',
      },
      {
        ranking: 4,
        track: 0,
        id: '1519410583',
        url:
          'https://music.apple.com/jp/album/make-you-happy/1519410580?i=1519410583',
      },
      {
        ranking: 5,
        track: 0,
        id: '1490256995',
        url:
          'https://music.apple.com/jp/album/%E5%A4%9C%E3%81%AB%E9%A7%86%E3%81%91%E3%82%8B/1490256978?i=1490256995',
      },
      {
        ranking: 6,
        track: 0,
        id: '1528831888',
        url:
          'https://music.apple.com/jp/album/dynamite/1528831887?i=1528831888',
      },
      {
        ranking: 7,
        track: 0,
        id: '1520367284',
        url:
          'https://music.apple.com/jp/album/spark-again/1520367283?i=1520367284',
      },
      {
        ranking: 8,
        track: 0,
        id: '1529398354',
        url: 'https://music.apple.com/jp/album/mirror/1529398352?i=1529398354',
      },
      {
        ranking: 8,
        track: 1,
        id: '1529398355',
        url: 'https://music.apple.com/jp/album/dance/1529398352?i=1529398355',
      },
      {
        ranking: 9,
        track: 0,
        id: '1521414181',
        url:
          'https://music.apple.com/jp/album/%E6%84%9F%E9%9B%BB/1521414178?i=1521414181',
      },
      {
        ranking: 10,
        track: 0,
        id: '1524596325',
        url:
          'https://music.apple.com/jp/album/%E9%A6%99%E6%B0%B4/1524596324?i=1524596325',
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
  kr: {
    us: [
      {
        ranking: 1,
        track: 0,
        id: '1529518695',
        url:
          'https://music.apple.com/us/album/dynamite/1529518691?i=1529518695',
      },
      {
        ranking: 2,
        track: 0,
        id: '1524262362',
        url:
          'https://music.apple.com/us/album/slightly-tipsy-she-is-my-type/1524262361?i=1524262362',
      },
      {
        ranking: 3,
        track: 0,
        id: '1524236597',
        url:
          'https://music.apple.com/us/album/beach-again/1524236596?i=1524236597',
      },
      {
        ranking: 4,
        track: 0,
        id: '1525184770',
        url:
          'https://music.apple.com/us/album/nunu-nana/1525184769?i=1525184770',
      },
      {
        ranking: 5,
        track: 0,
        id: '1521222426',
        url: 'https://music.apple.com/us/album/maria/1521222154?i=1521222426',
      },
      {
        ranking: 6,
        track: 0,
        id: '1526450436',
        url:
          'https://music.apple.com/us/album/when-we-disco-duet-with-sunmi/1526450252?i=1526450436',
      },
      {
        ranking: 7,
        track: 0,
        id: '1520233767',
        url:
          'https://music.apple.com/us/album/how-you-like-that/1520233748?i=1520233767',
      },
      {
        ranking: 8,
        track: 0,
        id: '1511885178',
        url:
          'https://music.apple.com/us/album/eight-feat-suga/1511885175?i=1511885178',
      },
      {
        ranking: 9,
        track: 0,
        id: '570435819',
        url:
          'https://music.apple.com/us/album/%EC%98%A4%EB%9E%98%EB%90%9C-%EB%85%B8%EB%9E%98/570435818?i=570435819',
      },
      {
        ranking: 10,
        track: 0,
        id: '1508988684',
        url: 'https://music.apple.com/us/album/dolphin/1508988676?i=1508988684',
      },
    ],
    jp: [
      {
        ranking: 1,
        track: 0,
        id: '1528831888',
        url:
          'https://music.apple.com/jp/album/dynamite/1528831887?i=1528831888',
      },
      {
        ranking: 2,
        track: 0,
        id: '1524262362',
        url:
          'https://music.apple.com/jp/album/slightly-tipsy-she-is-my-type/1524262361?i=1524262362',
      },
      {
        ranking: 3,
        track: 0,
        id: '1524236597',
        url:
          'https://music.apple.com/jp/album/beach-again/1524236596?i=1524236597',
      },
      {
        ranking: 4,
        track: 0,
        id: '1525184770',
        url:
          'https://music.apple.com/jp/album/nunu-nana/1525184769?i=1525184770',
      },
      {
        ranking: 5,
        track: 0,
        id: '1521405863',
        url: 'https://music.apple.com/jp/album/maria/1521405861?i=1521405863',
      },
      {
        ranking: 6,
        track: 0,
        id: '1526134385',
        url:
          'https://music.apple.com/jp/album/when-we-disco-duet-with-sunmi/1526134384?i=1526134385',
      },
      {
        ranking: 7,
        track: 0,
        id: '1520164321',
        url:
          'https://music.apple.com/jp/album/how-you-like-that/1520164320?i=1520164321',
      },
      {
        ranking: 8,
        track: 0,
        id: '1511885178',
        url:
          'https://music.apple.com/jp/album/eight-feat-suga/1511885175?i=1511885178',
      },
      {
        ranking: 9,
        track: 0,
        id: '570435819',
        url:
          'https://music.apple.com/jp/album/%EC%98%A4%EB%9E%98%EB%90%9C-%EB%85%B8%EB%9E%98/570435818?i=570435819',
      },
      {
        ranking: 10,
        track: 0,
        id: '1509673709',
        url: 'https://music.apple.com/jp/album/dolphin/1509673705?i=1509673709',
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
  ['jp', 'us'],
  ['jp', 'jp'],
  ['gb', 'us'],
  ['gb', 'jp'],
  ['kr', 'us'],
  ['kr', 'jp'],
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
