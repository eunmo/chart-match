const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');
const fetch = require('node-fetch');
const { dml, query, cleanup } = require('@eunmo/mysql');
const { chart } = require('../../../db');
const { chartIds } = require('../constants');
const router = require('../billboard');

const chartId = chartIds.us;
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
  path.join(__dirname, 'html', `billboard-album-${prevWeek}.html`)
);
const curData = fs.readFileSync(
  path.join(__dirname, 'html', `billboard-album-${curWeek}.html`)
);
const data = { [prevWeek]: prevData, [curWeek]: curData };

const prev10 = [
  {
    ranking: 1,
    artist: 'Taylor Swift',
    title: 'Folklore',
  },
  {
    ranking: 2,
    artist: 'Pop Smoke',
    title: 'Shoot For The Stars Aim For The Moon',
  },
  {
    ranking: 3,
    artist: 'Juice WRLD',
    title: 'Legends Never Die',
  },
  {
    ranking: 4,
    artist: 'Metallica And San Francisco Symphony',
    title: 'S&M2',
  },
  { ranking: 5, artist: 'Katy Perry', title: 'Smile' },
  {
    ranking: 6,
    artist: 'Original Broadway Cast',
    title: 'Hamilton: An American Musical',
  },
  { ranking: 7, artist: 'Lil Baby', title: 'My Turn' },
  {
    ranking: 8,
    artist: 'Rod Wave',
    title: 'Pray 4 Love',
  },
  {
    ranking: 9,
    artist: 'DaBaby',
    title: 'BLAME IT ON BABY',
  },
  {
    ranking: 10,
    artist: 'Internet Money',
    title: 'B4 The Storm',
  },
];

const cur10 = [
  { ranking: 1, artist: 'Big Sean', title: 'Detroit 2' },
  {
    ranking: 2,
    artist: 'Pop Smoke',
    title: 'Shoot For The Stars Aim For The Moon',
  },
  {
    ranking: 3,
    artist: 'Juice WRLD',
    title: 'Legends Never Die',
  },
  { ranking: 4, artist: '6ix9ine', title: 'TattleTales' },
  {
    ranking: 5,
    artist: 'Taylor Swift',
    title: 'Folklore',
  },
  {
    ranking: 6,
    artist: 'Original Broadway Cast',
    title: 'Hamilton: An American Musical',
  },
  { ranking: 7, artist: 'Lil Baby', title: 'My Turn' },
  {
    ranking: 8,
    artist: 'Rod Wave',
    title: 'Pray 4 Love',
  },
  {
    ranking: 9,
    artist: 'DaBaby',
    title: 'BLAME IT ON BABY',
  },
  {
    ranking: 10,
    artist: 'Post Malone',
    title: "Hollywood's Bleeding",
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
  // taylor swift / folklore 1 -> 5
  expect(prevEntries[0].entry).toBe(curEntries[4].entry);
  // pop smoke / shoot for the stars aim for the moon 2 -> 2
  expect(prevEntries[1].entry).toBe(curEntries[1].entry);
  // juice wrld / legends never die 3 -> 3
  expect(prevEntries[2].entry).toBe(curEntries[2].entry);
  // original broadway cast / hamilton: an american musical 6 -> 6
  expect(prevEntries[5].entry).toBe(curEntries[5].entry);
  // lil baby / my turn 7 -> 7
  expect(prevEntries[6].entry).toBe(curEntries[6].entry);
  // rod wave / pray 4 love 8 -> 8
  expect(prevEntries[7].entry).toBe(curEntries[7].entry);
  // dababy / blame it on baby 9 -> 9
  expect(prevEntries[8].entry).toBe(curEntries[8].entry);
});
