const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');
const fetch = require('node-fetch');
const { dml, query, cleanup } = require('@eunmo/mysql');
const { chart } = require('../../../db');
const router = require('../fetch');
const { singles } = require('./test-data');

const chartId = chart.ids.jp;
const app = express();
app.use('/', router);

function getData(week, page) {
  return fs.readFileSync(
    path.join(__dirname, 'html', `jp-single-${week}-${page}.html`)
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
  await dml('DROP TABLE IF EXISTS singleChart;');
  await dml('DROP TABLE IF EXISTS singleChartEntry;');
  await dml('CREATE TABLE singleChartEntry LIKE chart.singleChartEntry;');
  await dml('CREATE TABLE singleChart LIKE chart.singleChart;');
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
  await dml('DROP TABLE singleChart;');
  await dml('DROP TABLE singleChartEntry;');
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE singleChart;');
  await dml('TRUNCATE TABLE singleChartEntry;');
});

const prev10 = singles.prev.jp;
const cur10 = singles.cur.jp;

test.each([
  [prevWeek, prev10],
  [curWeek, cur10],
])('fetch clean %s', async (week, expected) => {
  const url = `/single/jp/${week}`;
  const response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const entries = await chart.getRawSingles(chartId, week);
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
  const url = `/single/jp/${week}`;
  let response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const entries = await chart.getRawSingles(chartId, week);
  expect(entries.length).toBe(50);
  expected.forEach(({ ranking, artist, title }, index) => {
    const entry = entries[index];
    expect(entry.ranking).toBe(ranking);
    expect(entry.artist).toEqual(artist);
    expect(entry.title).toEqual(title);
  });
});

test('fetch consecutive', async () => {
  let url = `/single/jp/${prevWeek}`;
  let response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  url = `/single/jp/${curWeek}`;
  response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const counts = await query('SELECT count(*) AS count FROM singleChartEntry');
  expect(counts[0].count).toBe(63);

  function getRaw(week) {
    return query(
      `SELECT * FROM singleChart WHERE chart=${chartId} AND week='${week}'`
    );
  }

  const prevEntries = await getRaw(prevWeek);
  const curEntries = await getRaw(curWeek);
  expect(prevEntries[3].entry).toBe(curEntries[2].entry); // 4 -> 3
  expect(prevEntries[5].entry).toBe(curEntries[4].entry); // 6 -> 5
  expect(prevEntries[6].entry).toBe(curEntries[1].entry); // 7 -> 2
  expect(prevEntries[7].entry).toBe(curEntries[5].entry); // 8 -> 6
  expect(prevEntries[8].entry).toBe(curEntries[8].entry); // 9 -> 9
});
