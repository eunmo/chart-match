const express = require('express');
const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry, chartMatch } = require('../../../db');
const {
  albums,
  expected: { albums: matched },
} = require('./test-data');
const router = require('../current');

jest.setTimeout(10000);
const app = express();
app.use('/', router);

const names = ['us', 'jp', 'gb', 'kr'];
const ymd = '2020/09/12';

async function populate(name) {
  const top10 = albums.cur[name];
  const chartId = chart.ids[name];

  await chartEntry.addMissingAlbums(chartId, top10);
  const entryIds = await chartEntry.getAlbumIds(chartId, top10);
  await chart.addAlbums(chartId, ymd, entryIds);

  const usAlbums = matched[name].us.map(({ ranking, id }) => ({
    entry: entryIds[ranking - 1].id,
    id,
  }));
  const jpAlbums = matched[name].jp.map(({ ranking, id }) => ({
    entry: entryIds[ranking - 1].id,
    id,
  }));
  await chartMatch.addAlbums('us', usAlbums);
  await chartMatch.addAlbums('jp', jpAlbums);
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

const albumCount = { us: 32, jp: 32 };

test.each(['us', 'jp'])('get current albums %s', async (store) => {
  const response = await request(app).get(`/album/${store}`);
  expect(response.statusCode).toBe(200);

  const { body } = response;
  expect(body.length).toBe(albumCount[store]);
  expect(body[0].id).toEqual('1440852826'); // Goats Head Soup
  expect(body[0].name).toEqual('Goats Head Soup'); // wap
  expect(body[1].id).toEqual('1528149531'); // 24H
  expect(body[1].name).toEqual('24H - EP');
});
