const express = require('express');
const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry } = require('../../../db');
const router = require('../match');
const {
  albums,
  expected: { albums: expected },
} = require('./test-data');

jest.setTimeout(10000);
const app = express();
app.use('/', router);

const names = ['us', 'jp', 'gb', 'kr'];
const week = '2020-09-12';
const ymd = '2020/09/12';

async function populate(name) {
  const top10 = albums.cur[name];
  const chartId = chart.ids[name];

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

  const chartId = chart.ids[name];
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

  const chartId = chart.ids[name];
  const matches = await chart.getAlbumMatches(chartId, ymd, store);

  const expectedMatches = expected[name][store];
  expect(matches.length).toBe(expectedMatches.length);
  expectedMatches.forEach((e, index) => {
    const match = { ...matches[index] };
    expect(match).toStrictEqual(e);
  });
});
