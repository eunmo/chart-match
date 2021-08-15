const express = require('express');
const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry } = require('../../../db');
const router = require('..');
const { singles, albums, expected } = require('./test-data');

jest.mock('../../../apple/query');

jest.setTimeout(10000);
const app = express();
app.use('/', router);

const names = ['us', 'jp', 'gb', 'fr', 'kr'];
const week = '2020-09-12';
const ymd = '2020/09/12';

const testData = { single: singles, album: albums };

afterAll(async () => {
  await cleanup();
});

describe.each(['single', 'album'])('%s', (type) => {
  async function populate(name) {
    const top10 = testData[type].cur[name];
    const chartId = chart.ids[name];

    await chartEntry.addMissing(type, chartId, top10);
    const entryIds = await chartEntry.getIds(type, chartId, top10);
    await chart.add(type, chartId, ymd, entryIds);
  }

  beforeAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);

    await Promise.all(names.map((name) => populate(name)));
  });

  afterAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
  });

  beforeEach(async () => {
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
  });

  test.each([
    ['us', 'us'],
    ['us', 'jp'],
    ['jp', 'us'],
    ['jp', 'jp'],
    ['gb', 'us'],
    ['gb', 'jp'],
    ['fr', 'us'],
    ['fr', 'jp'],
    ['kr', 'us'],
    ['kr', 'jp'],
  ])('match %s %s', async (name, store) => {
    const url = `/match/${type}/${name}/${week}/${store}`;
    const response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    const chartId = chart.ids[name];
    const matches = await chart.getMatches(type, chartId, ymd, store);

    const expectedMatches = expected[type][name][store];
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
    ['fr', 'us'],
    ['fr', 'jp'],
    ['kr', 'us'],
    ['kr', 'jp'],
  ])('match partial %s %s', async (name, store) => {
    const url = `/match/${type}/${name}/${week}/${store}`;
    let response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    await dml(`DELETE FROM ${type}ChartMatch where entry % 3 = 0`);

    response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    const chartId = chart.ids[name];
    const matches = await chart.getMatches(type, chartId, ymd, store);

    const expectedMatches = expected[type][name][store];
    expect(matches.length).toBe(expectedMatches.length);
    expectedMatches.forEach((e, index) => {
      const match = { ...matches[index] };
      expect(match).toStrictEqual(e);
    });
  });
});
