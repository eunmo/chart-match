const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');
const fetch = require('node-fetch');
const { dml, query, cleanup } = require('@eunmo/mysql');
const { chart } = require('../../../db');
const { chartIds } = require('../constants');
const router = require('../fetch');
const { singles } = require('./test-data');

const app = express();
app.use('/', router);

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS singleChart;');
  await dml('DROP TABLE IF EXISTS singleChartEntry;');
  await dml('CREATE TABLE singleChartEntry LIKE chart.singleChartEntry;');
  await dml('CREATE TABLE singleChart LIKE chart.singleChart;');
});

afterAll(async () => {
  await dml('DROP TABLE singleChart;');
  await dml('DROP TABLE singleChartEntry;');
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE singleChart;');
  await dml('TRUNCATE TABLE singleChartEntry;');
});

const prevWeek = '2020-09-05';
const curWeek = '2020-09-12';

const expectedRanks = {
  us: [
    [0, 1],
    [1, 0],
    [2, 2],
    [3, 3],
    [4, 4],
    [5, 6],
    [6, 7],
    [7, 5],
    [8, 8],
  ],
  gb: [
    [0, 0],
    [1, 5],
    [2, 3],
    [3, 1],
    [4, 2],
    [5, 4],
    [6, 6],
    [8, 8],
  ],
  kr: [
    [0, 0],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 1],
    [8, 7],
  ],
};
const expectedSum = {
  us: 111,
  gb: 111,
  kr: 107,
};

describe.each(['us', 'gb', 'kr'])('%s', (chartName) => {
  const chartId = chartIds[chartName];

  const prevData = fs.readFileSync(
    path.join(__dirname, 'html', `${chartName}-single-${prevWeek}.html`)
  );
  const curData = fs.readFileSync(
    path.join(__dirname, 'html', `${chartName}-single-${curWeek}.html`)
  );
  const data = { [prevWeek]: prevData, [curWeek]: curData };

  const prev10 = singles.prev[chartName];
  const cur10 = singles.cur[chartName];

  test.each([
    [prevWeek, prev10],
    [curWeek, cur10],
  ])('fetch clean %s', async (week, expected) => {
    fetch.mockReturnValue(Promise.resolve(new Response(data[week])));

    const url = `/single/${chartName}/${week}`;
    const response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    const entries = await chart.getRawSingles(chartId, week);
    expect(entries.length).toBe(100);
    expected.forEach(({ ranking, artist, title }, index) => {
      const entry = entries[index];
      expect(entry.ranking).toBe(ranking);
      expect(entry.artist).toEqual(artist);
      expect(entry.title).toEqual(title);
    });
  });

  test.each([
    [prevWeek, prev10],
    [curWeek, cur10],
  ])('fetch twice %s', async (week, expected) => {
    fetch.mockReturnValue(Promise.resolve(new Response(data[week])));
    const url = `/single/${chartName}/${week}`;
    let response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    fetch.mockReturnValue(Promise.resolve(new Response(data[week])));
    response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    const entries = await chart.getRawSingles(chartId, week);
    expect(entries.length).toBe(100);
    expected.forEach(({ ranking, artist, title }, index) => {
      const entry = entries[index];
      expect(entry.ranking).toBe(ranking);
      expect(entry.artist).toEqual(artist);
      expect(entry.title).toEqual(title);
    });
  });

  test('fetch consecutive', async () => {
    fetch.mockReturnValue(Promise.resolve(new Response(data[prevWeek])));
    let url = `/single/${chartName}/${prevWeek}`;
    let response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    fetch.mockReturnValue(Promise.resolve(new Response(data[curWeek])));
    url = `/single/${chartName}/${curWeek}`;
    response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    const counts = await query(
      'SELECT count(*) AS count FROM singleChartEntry'
    );
    expect(counts[0].count).toBe(expectedSum[chartName]);

    function getRaw(week) {
      return query(
        `SELECT * FROM singleChart WHERE chart=${chartId} AND week='${week}'`
      );
    }

    const prevEntries = await getRaw(prevWeek);
    const curEntries = await getRaw(curWeek);
    expectedRanks[chartName].forEach(([prevRank, curRank]) => {
      expect(prevEntries[prevRank].entry).toBe(curEntries[curRank].entry);
    });
  });
});
