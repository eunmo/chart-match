const express = require('express');
const bodyParser = require('body-parser');
const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry, chartMatch } = require('../../../db');
const {
  singles,
  expected: { singles: matched },
} = require('./test-data');
const router = require('../edit');

jest.setTimeout(10000);
const app = express();
app.use(bodyParser.json());
app.use('/', router);

const week = '2020-09-12';
const ymd = '2020/09/12';

async function populate(name) {
  const top10 = singles.cur[name];
  const chartId = chart.ids[name];

  await chartEntry.addMissingSingles(chartId, top10);
  const entryIds = await chartEntry.getSingleIds(chartId, top10);
  await chart.addSingles(chartId, ymd, entryIds);
  return entryIds;
}

let ids;

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS singleChart;');
  await dml('DROP TABLE IF EXISTS singleChartMatch;');
  await dml('DROP TABLE IF EXISTS singleChartEntry;');
  await dml('CREATE TABLE singleChartEntry LIKE chart.singleChartEntry;');
  await dml('CREATE TABLE singleChart LIKE chart.singleChart;');
  await dml('CREATE TABLE singleChartMatch LIKE chart.singleChartMatch;');

  ids = await populate('us');
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

test.each(['us', 'jp'])('delete match %s', async (store) => {
  const songs = matched.us[store].map(({ ranking, track, id }) => ({
    entry: ids[ranking - 1].id,
    track,
    id,
  }));
  await chartMatch.addSingles(store, songs);

  const body = { store, entry: ids[0].id, track: 0 };
  const response = await request(app).delete('/single').send(body);
  expect(response.statusCode).toBe(200);

  const rows = await chart.getSingleMatches(chart.ids.us, week, store);
  expect(rows[0].id).toBe(null);
});

test.each(['us', 'jp'])('update match %s', async (store) => {
  const songs = matched.us[store].map(({ ranking, track, id }) => ({
    entry: ids[ranking - 1].id,
    track,
    id,
  }));
  await chartMatch.addSingles(store, songs);

  const body = { store, entry: ids[0].id, track: 0, id: '200' };
  const response = await request(app).put('/single').send(body);
  expect(response.statusCode).toBe(200);

  const rows = await chart.getSingleMatches(chart.ids.us, week, store);
  expect(rows[0].id).toEqual('200');
});
