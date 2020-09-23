const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');
const fetch = require('node-fetch');
const { dml, query, cleanup } = require('@eunmo/mysql');
const { chart } = require('../../../db');
const router = require('../fetch');
const { albums } = require('./test-data');

const app = express();
app.use('/', router);

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS albumChart;');
  await dml('DROP TABLE IF EXISTS albumChartEntry;');
  await dml('CREATE TABLE albumChartEntry LIKE chart.albumChartEntry;');
  await dml('CREATE TABLE albumChart LIKE chart.albumChart;');
});

afterAll(async () => {
  await dml('DROP TABLE albumChart;');
  await dml('DROP TABLE albumChartEntry;');
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE albumChart;');
  await dml('TRUNCATE TABLE albumChartEntry;');
});

const prevWeek = '2020-09-05';
const curWeek = '2020-09-12';

const expectedRanks = {
  us: [
    [0, 4],
    [1, 1],
    [2, 2],
    [5, 5],
    [6, 6],
    [7, 7],
    [8, 8],
  ],
  gb: [
    [0, 3],
    [2, 8],
    [5, 2],
    [7, 4],
    [8, 6],
    [9, 5],
  ],
  kr: [
    [0, 4],
    [1, 1],
    [2, 5],
    [5, 3],
    [9, 8],
  ],
};
const expectedSum = {
  us: 113,
  gb: 113,
  kr: 133,
};

describe.each(['us', 'gb', 'kr'])('%s', (chartName) => {
  const chartId = chart.ids[chartName];

  const prevData = fs.readFileSync(
    path.join(__dirname, 'html', `${chartName}-album-${prevWeek}.html`)
  );
  const curData = fs.readFileSync(
    path.join(__dirname, 'html', `${chartName}-album-${curWeek}.html`)
  );
  const data = { [prevWeek]: prevData, [curWeek]: curData };

  const prev10 = albums.prev[chartName];
  const cur10 = albums.cur[chartName];

  test.each([
    [prevWeek, prev10],
    [curWeek, cur10],
  ])('fetch clean %s', async (week, expected) => {
    fetch.mockReturnValue(Promise.resolve(new Response(data[week])));

    const url = `/album/${chartName}/${week}`;
    const response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    const entries = await chart.getRawAlbums(chartId, week);
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
    const url = `/album/${chartName}/${week}`;
    let response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    fetch.mockReturnValue(Promise.resolve(new Response(data[week])));
    response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    const entries = await chart.getRawAlbums(chartId, week);
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
    let url = `/album/${chartName}/${prevWeek}`;
    let response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    fetch.mockReturnValue(Promise.resolve(new Response(data[curWeek])));
    url = `/album/${chartName}/${curWeek}`;
    response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    const counts = await query('SELECT count(*) AS count FROM albumChartEntry');
    expect(counts[0].count).toBe(expectedSum[chartName]);

    function getRaw(week) {
      return query(
        `SELECT * FROM albumChart WHERE chart=${chartId} AND week='${week}'`
      );
    }

    const prevEntries = await getRaw(prevWeek);
    const curEntries = await getRaw(curWeek);
    expectedRanks[chartName].forEach(([prevRank, curRank]) => {
      expect(prevEntries[prevRank].entry).toBe(curEntries[curRank].entry);
    });
  });
});
