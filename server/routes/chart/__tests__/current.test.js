const express = require('express');
const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry, chartMatch } = require('../../../db');
const {
  singles,
  expected: { singles: matched },
} = require('./test-data');
const router = require('../current');

jest.setTimeout(10000);
const app = express();
app.use('/', router);

const names = ['us', 'jp', 'gb', 'kr'];
const ymd = '2020/09/12';

async function populate(name) {
  const top10 = singles.cur[name];
  const chartId = chart.ids[name];

  await chartEntry.addMissingSingles(chartId, top10);
  const entryIds = await chartEntry.getSingleIds(chartId, top10);
  await chart.addSingles(chartId, ymd, entryIds);

  const usSongs = matched[name].us.map(({ ranking, track, id, url }) => ({
    entry: entryIds[ranking - 1].id,
    track,
    id,
    url,
  }));
  const jpSongs = matched[name].jp.map(({ ranking, track, id, url }) => ({
    entry: entryIds[ranking - 1].id,
    track,
    id,
    url,
  }));
  await chartMatch.addSingles('us', usSongs);
  await chartMatch.addSingles('jp', jpSongs);
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

const songCount = { us: 35, jp: 36 };
const dynamiteId = {
  us: '1529518695',
  jp: '1528831888',
};

test.each(['us', 'jp'])('get current singles %s', async (store) => {
  const response = await request(app).get(`/single/${store}`);
  expect(response.statusCode).toBe(200);

  const { body: songs } = response;
  expect(songs.length).toBe(songCount[store]);
  expect(songs[0].id).toEqual('1526746984'); // wap
  expect(songs[0].name).toEqual('WAP (feat. Megan Thee Stallion)'); // wap
  expect(songs[1].id).toEqual(dynamiteId[store]);
  expect(songs[1].name).toEqual('Dynamite');
});
