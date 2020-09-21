const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');
const fetch = require('node-fetch');
const { dml, query, cleanup } = require('@eunmo/mysql');
const { chart } = require('../../../db');
const { chartIds } = require('../constants');
const router = require('../jp');
const { albums } = require('./test-data');

const chartId = chartIds.jp;
const app = express();
app.use('/', router);

function getData(week, page) {
  return fs.readFileSync(
    path.join(__dirname, 'html', `jp-album-${week}-${page}.html`)
  );
}
const prevWeek = '2020-09-05';
const curWeek = '2020-09-12';
const mockData = {
  [prevWeek]: '12345'.split('').map((p) => getData(prevWeek, p)),
  [curWeek]: '12345'.split('').map((p) => getData(curWeek, p)),
};

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS albumChart;');
  await dml('DROP TABLE IF EXISTS albumChartEntry;');
  await dml('CREATE TABLE albumChartEntry LIKE chart.albumChartEntry;');
  await dml('CREATE TABLE albumChart LIKE chart.albumChart;');
  fetch.mockImplementation((url) => {
    const split = url.split('/');
    const len = split.length;
    let week;
    let page;
    if (split[len - 3] === 'w') {
      week = split[len - 2];
      page = 0;
    } else {
      week = split[len - 4];
      page = parseInt(split[len - 2], 10) - 1;
    }
    if (week === '2020-09-21') {
      week = curWeek;
    } else if (week === '2020-09-14') {
      week = prevWeek;
    }
    return Promise.resolve(new Response(mockData[week][page]));
  });
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

const prev10 = albums.prev.jp;
const cur10 = albums.cur.jp;

test.each([
  [prevWeek, prev10],
  [curWeek, cur10],
])('fetch clean %s', async (week, expected) => {
  const url = `/album/${week}`;
  const response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const entries = await chart.getRawAlbums(chartId, week);
  expect(entries.length).toBe(50);
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
  const url = `/album/${week}`;
  let response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const entries = await chart.getRawAlbums(chartId, week);
  expect(entries.length).toBe(50);
  expected.forEach(({ ranking, artist, title }, index) => {
    const entry = entries[index];
    expect(entry.ranking).toBe(ranking);
    expect(entry.artist).toEqual(artist);
    expect(entry.title).toEqual(title);
  });
});

test('fetch consecutive', async () => {
  let url = `/album/${prevWeek}`;
  let response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  url = `/album/${curWeek}`;
  response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const counts = await query('SELECT count(*) AS count FROM albumChartEntry');
  expect(counts[0].count).toBe(70);

  function getRaw(week) {
    return query(
      `SELECT * FROM albumChart WHERE chart=${chartId} AND week='${week}'`
    );
  }

  const prevEntries = await getRaw(prevWeek);
  const curEntries = await getRaw(curWeek);
  expect(prevEntries[0].entry).toBe(curEntries[4].entry); // 1 -> 5
  expect(prevEntries[1].entry).toBe(curEntries[2].entry); // 2 -> 3
});
