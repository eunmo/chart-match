const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');
const fetch = require('node-fetch');
const { dml, query, cleanup } = require('@eunmo/mysql');
const { chart } = require('../../../db');
const { chartIds } = require('../constants');
const router = require('../kr');
const { singles } = require('./test-data');

const chartId = chartIds.kr;
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

const prevData = fs.readFileSync(
  path.join(__dirname, 'html', `kr-single-${prevWeek}.html`)
);
const curData = fs.readFileSync(
  path.join(__dirname, 'html', `kr-single-${curWeek}.html`)
);
const data = { [prevWeek]: prevData, [curWeek]: curData };

const prev10 = singles.prev.kr;
const cur10 = singles.cur.kr;

test.each([
  [prevWeek, prev10],
  [curWeek, cur10],
])('fetch clean %s', async (week, expected) => {
  fetch.mockReturnValue(Promise.resolve(new Response(data[week])));

  const url = `/single/${week}`;
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
  const url = `/single/${week}`;
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
  let url = `/single/${prevWeek}`;
  let response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  fetch.mockReturnValue(Promise.resolve(new Response(data[curWeek])));
  url = `/single/${curWeek}`;
  response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const counts = await query('SELECT count(*) AS count FROM singleChartEntry');
  expect(counts[0].count).toBe(107);

  function getRaw(week) {
    return query(
      `SELECT * FROM singleChart WHERE chart=${chartId} AND week='${week}'`
    );
  }

  const prevEntries = await getRaw(prevWeek);
  const curEntries = await getRaw(curWeek);
  expect(prevEntries[0].entry).toBe(curEntries[0].entry); // 1 -> 1
  expect(prevEntries[1].entry).toBe(curEntries[2].entry); // 2 -> 3
  expect(prevEntries[2].entry).toBe(curEntries[3].entry); // 3 -> 4
  expect(prevEntries[3].entry).toBe(curEntries[4].entry); // 4 -> 5
  expect(prevEntries[4].entry).toBe(curEntries[5].entry); // 5 -> 6
  expect(prevEntries[5].entry).toBe(curEntries[6].entry); // 6 -> 7
  expect(prevEntries[6].entry).toBe(curEntries[1].entry); // 7 -> 2
  expect(prevEntries[8].entry).toBe(curEntries[7].entry); // 9 -> 8
});
