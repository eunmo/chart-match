const express = require('express');
const bodyParser = require('body-parser');
const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry, chartMatch } = require('../../../db');
const {
  albums,
  expected: { albums: matched },
} = require('./test-data');
const router = require('../edit');

jest.setTimeout(10000);
const app = express();
app.use(bodyParser.json());
app.use('/', router);

const week = '2020-09-12';
const ymd = '2020/09/12';

async function populate(name) {
  const top10 = albums.cur[name];
  const chartId = chart.ids[name];

  await chartEntry.addMissingAlbums(chartId, top10);
  const entryIds = await chartEntry.getAlbumIds(chartId, top10);
  await chart.addAlbums(chartId, ymd, entryIds);
  return entryIds;
}

let ids;

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS albumChart;');
  await dml('DROP TABLE IF EXISTS albumChartMatch;');
  await dml('DROP TABLE IF EXISTS albumChartEntry;');
  await dml('CREATE TABLE albumChartEntry LIKE chart.albumChartEntry;');
  await dml('CREATE TABLE albumChart LIKE chart.albumChart;');
  await dml('CREATE TABLE albumChartMatch LIKE chart.albumChartMatch;');

  ids = await populate('us');
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

test.each(['us', 'jp'])('delete match %s', async (store) => {
  const add = matched.us[store].map(({ ranking, id }) => ({
    entry: ids[ranking - 1].id,
    id,
  }));
  await chartMatch.addAlbums(store, add);

  const body = { store, entry: ids[0].id };
  const response = await request(app).delete('/album').send(body);
  expect(response.statusCode).toBe(200);

  const rows = await chart.getAlbumMatches(chart.ids.us, week, store);
  expect(rows[0].id).toBe(null);
});

test.each(['us', 'jp'])('update match %s', async (store) => {
  const add = matched.us[store].map(({ ranking, id }) => ({
    entry: ids[ranking - 1].id,
    id,
  }));
  await chartMatch.addAlbums(store, add);

  const body = { store, entry: ids[0].id, id: '200' };
  const response = await request(app).put('/album').send(body);
  expect(response.statusCode).toBe(200);

  const rows = await chart.getAlbumMatches(chart.ids.us, week, store);
  expect(rows[0].id).toEqual('200');
});
