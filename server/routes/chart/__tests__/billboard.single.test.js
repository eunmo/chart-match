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
  path.join(__dirname, 'html', `billboard-single-${prevWeek}.html`)
);
const curData = fs.readFileSync(
  path.join(__dirname, 'html', `billboard-single-${curWeek}.html`)
);
const data = { [prevWeek]: prevData, [curWeek]: curData };

const prev10 = [
  { ranking: 1, artist: 'BTS', title: 'Dynamite' },
  {
    ranking: 2,
    artist: 'Cardi B Featuring Megan Thee Stallion',
    title: 'WAP',
  },
  {
    ranking: 3,
    artist: 'Drake Featuring Lil Durk',
    title: 'Laugh Now Cry Later',
  },
  {
    ranking: 4,
    artist: 'DaBaby Featuring Roddy Ricch',
    title: 'Rockstar',
  },
  {
    ranking: 5,
    artist: 'The Weeknd',
    title: 'Blinding Lights',
  },
  {
    ranking: 6,
    artist: 'Harry Styles',
    title: 'Watermelon Sugar',
  },
  {
    ranking: 7,
    artist: 'Jack Harlow Featuring DaBaby, Tory Lanez & Lil Wayne',
    title: 'Whats Poppin',
  },
  {
    ranking: 8,
    artist: '24kGoldn Featuring iann dior',
    title: 'Mood',
  },
  {
    ranking: 9,
    artist: 'Jawsh 685 x Jason Derulo',
    title: 'Savage Love (Laxed - Siren Beat)',
  },
  {
    ranking: 10,
    artist: 'Lewis Capaldi',
    title: 'Before You Go',
  },
];

const cur10 = [
  {
    ranking: 1,
    artist: 'Cardi B Featuring Megan Thee Stallion',
    title: 'WAP',
  },
  { ranking: 2, artist: 'BTS', title: 'Dynamite' },
  {
    ranking: 3,
    artist: 'Drake Featuring Lil Durk',
    title: 'Laugh Now Cry Later',
  },
  {
    ranking: 4,
    artist: 'DaBaby Featuring Roddy Ricch',
    title: 'Rockstar',
  },
  {
    ranking: 5,
    artist: 'The Weeknd',
    title: 'Blinding Lights',
  },
  {
    ranking: 6,
    artist: '24kGoldn Featuring iann dior',
    title: 'Mood',
  },
  {
    ranking: 7,
    artist: 'Harry Styles',
    title: 'Watermelon Sugar',
  },
  {
    ranking: 8,
    artist: 'Jack Harlow Featuring DaBaby, Tory Lanez & Lil Wayne',
    title: 'Whats Poppin',
  },
  {
    ranking: 9,
    artist: 'Jawsh 685 x Jason Derulo',
    title: 'Savage Love (Laxed - Siren Beat)',
  },
  {
    ranking: 10,
    artist: 'DJ Khaled Featuring Drake',
    title: 'Popstar',
  },
];

test.each([
  [prevWeek, prev10],
  [curWeek, cur10],
])('fetch clean %s', async (week, expected) => {
  fetch.mockReturnValue(Promise.resolve(new Response(data[week])));

  const url = `/fetch/single/${week}`;
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
  const url = `/fetch/single/${week}`;
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
  let url = `/fetch/single/${prevWeek}`;
  let response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  fetch.mockReturnValue(Promise.resolve(new Response(data[curWeek])));
  url = `/fetch/single/${curWeek}`;
  response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const counts = await query('SELECT count(*) AS count FROM singleChartEntry');
  expect(counts[0].count).toBe(111);

  function getRaw(week) {
    return query(
      `SELECT * FROM singleChart WHERE chart=${chartId} AND week='${week}'`
    );
  }

  const prevEntries = await getRaw(prevWeek);
  const curEntries = await getRaw(curWeek);
  expect(prevEntries[0].entry).toBe(curEntries[1].entry); // 1 -> 2
  expect(prevEntries[1].entry).toBe(curEntries[0].entry); // 2 -> 1
  expect(prevEntries[2].entry).toBe(curEntries[2].entry); // 3 -> 3
  expect(prevEntries[3].entry).toBe(curEntries[3].entry); // 4 -> 4
  expect(prevEntries[4].entry).toBe(curEntries[4].entry); // 5 -> 5
  expect(prevEntries[5].entry).toBe(curEntries[6].entry); // 6 -> 7
  expect(prevEntries[6].entry).toBe(curEntries[7].entry); // 7 -> 8
  expect(prevEntries[7].entry).toBe(curEntries[5].entry); // 8 -> 6
  expect(prevEntries[8].entry).toBe(curEntries[8].entry); // 9 -> 9
});
