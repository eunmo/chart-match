const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');
const fetch = require('node-fetch');
const { dml, query, cleanup } = require('@eunmo/mysql');
const { chart } = require('../../../db');
const { chartIds } = require('../constants');
const router = require('../gb');

const chartId = chartIds.gb;
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

const prevData = fs.readFileSync(
  path.join(__dirname, 'html', `gb-album-${prevWeek}.html`)
);
const curData = fs.readFileSync(
  path.join(__dirname, 'html', `gb-album-${curWeek}.html`)
);
const data = { [prevWeek]: prevData, [curWeek]: curData };

const prev10 = [
  {
    ranking: 1,
    artist: 'NINES',
    title: 'CRABS IN A BUCKET',
  },
  { ranking: 2, artist: 'METALLICA', title: 'S&M2' },
  {
    ranking: 3,
    artist: 'GREGORY PORTER',
    title: 'ALL RISE',
  },
  { ranking: 4, artist: 'DISCLOSURE', title: 'ENERGY' },
  { ranking: 5, artist: 'KATY PERRY', title: 'SMILE' },
  {
    ranking: 6,
    artist: 'POP SMOKE',
    title: 'SHOOT FOR THE STARS AIM FOR THE MOON',
  },
  {
    ranking: 7,
    artist: 'KILLERS',
    title: 'IMPLODING THE MIRAGE',
  },
  {
    ranking: 8,
    artist: 'TAYLOR SWIFT',
    title: 'FOLKLORE',
  },
  {
    ranking: 9,
    artist: 'LEWIS CAPALDI',
    title: 'DIVINELY UNINSPIRED TO A HELLISH EXTENT',
  },
  {
    ranking: 10,
    artist: 'JUICE WRLD',
    title: 'LEGENDS NEVER DIE',
  },
];

const cur10 = [
  {
    ranking: 1,
    artist: 'ROLLING STONES',
    title: 'GOATS HEAD SOUP',
  },
  {
    ranking: 2,
    artist: 'DECLAN MCKENNA',
    title: 'ZEROS',
  },
  {
    ranking: 3,
    artist: 'POP SMOKE',
    title: 'SHOOT FOR THE STARS AIM FOR THE MOON',
  },
  {
    ranking: 4,
    artist: 'NINES',
    title: 'CRABS IN A BUCKET',
  },
  {
    ranking: 5,
    artist: 'TAYLOR SWIFT',
    title: 'FOLKLORE',
  },
  {
    ranking: 6,
    artist: 'JUICE WRLD',
    title: 'LEGENDS NEVER DIE',
  },
  {
    ranking: 7,
    artist: 'LEWIS CAPALDI',
    title: 'DIVINELY UNINSPIRED TO A HELLISH EXTENT',
  },
  {
    ranking: 8,
    artist: 'DUA LIPA',
    title: 'FUTURE NOSTALGIA',
  },
  {
    ranking: 9,
    artist: 'GREGORY PORTER',
    title: 'ALL RISE',
  },
  {
    ranking: 10,
    artist: 'HARRY STYLES',
    title: 'FINE LINE',
  },
];

test.each([
  [prevWeek, prev10],
  [curWeek, cur10],
])('fetch clean %s', async (week, expected) => {
  fetch.mockReturnValue(Promise.resolve(new Response(data[week])));

  const url = `/fetch/album/${week}`;
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
  const url = `/fetch/album/${week}`;
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
  let url = `/fetch/album/${prevWeek}`;
  let response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  fetch.mockReturnValue(Promise.resolve(new Response(data[curWeek])));
  url = `/fetch/album/${curWeek}`;
  response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const counts = await query('SELECT count(*) AS count FROM albumChartEntry');
  expect(counts[0].count).toBe(113);

  function getRaw(week) {
    return query(
      `SELECT * FROM albumChart WHERE chart=${chartId} AND week='${week}'`
    );
  }

  const prevEntries = await getRaw(prevWeek);
  const curEntries = await getRaw(curWeek);
  expect(prevEntries[0].entry).toBe(curEntries[3].entry); // 1 -> 4
  expect(prevEntries[2].entry).toBe(curEntries[8].entry); // 3 -> 9
  expect(prevEntries[5].entry).toBe(curEntries[2].entry); // 6 -> 3
  expect(prevEntries[7].entry).toBe(curEntries[4].entry); // 8 -> 5
  expect(prevEntries[8].entry).toBe(curEntries[6].entry); // 9 -> 7
  expect(prevEntries[9].entry).toBe(curEntries[5].entry); // 10 -> 6
});
