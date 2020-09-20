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
  path.join(__dirname, 'html', `gb-single-${prevWeek}.html`)
);
const curData = fs.readFileSync(
  path.join(__dirname, 'html', `gb-single-${curWeek}.html`)
);
const data = { [prevWeek]: prevData, [curWeek]: curData };

const prev10 = [
  {
    ranking: 1,
    artist: 'CARDI B FT MEGAN THEE STALLION',
    title: 'WAP',
  },
  {
    ranking: 2,
    artist: 'JOEL CORRY FT MNEK',
    title: 'HEAD & HEART',
  },
  {
    ranking: 3,
    artist: 'NATHAN DAWE FT KSI',
    title: 'LIGHTER',
  },
  {
    ranking: 4,
    artist: '24KGOLDN FT IANN DIOR',
    title: 'MOOD',
  },
  {
    ranking: 5,
    artist: 'HEADIE ONE/AJ TRACEY/STORMZY',
    title: "AIN'T IT DIFFERENT",
  },
  {
    ranking: 6,
    artist: 'POP SMOKE FT LIL TJAY',
    title: 'MOOD SWINGS',
  },
  {
    ranking: 7,
    artist: 'DRAKE FT LIL DURK',
    title: 'LAUGH NOW CRY LATER',
  },
  {
    ranking: 8,
    artist: 'HARRY STYLES',
    title: 'WATERMELON SUGAR',
  },
  {
    ranking: 9,
    artist: 'DJ KHALED FT DRAKE',
    title: 'GREECE',
  },
  {
    ranking: 10,
    artist: 'AJ TRACEY & MABEL',
    title: 'WEST TEN',
  },
];

const cur10 = [
  {
    ranking: 1,
    artist: 'CARDI B FT MEGAN THEE STALLION',
    title: 'WAP',
  },
  {
    ranking: 2,
    artist: '24KGOLDN FT IANN DIOR',
    title: 'MOOD',
  },
  {
    ranking: 3,
    artist: 'HEADIE ONE/AJ TRACEY/STORMZY',
    title: "AIN'T IT DIFFERENT",
  },
  {
    ranking: 4,
    artist: 'NATHAN DAWE FT KSI',
    title: 'LIGHTER',
  },
  {
    ranking: 5,
    artist: 'POP SMOKE FT LIL TJAY',
    title: 'MOOD SWINGS',
  },
  {
    ranking: 6,
    artist: 'JOEL CORRY FT MNEK',
    title: 'HEAD & HEART',
  },
  {
    ranking: 7,
    artist: 'DRAKE FT LIL DURK',
    title: 'LAUGH NOW CRY LATER',
  },
  {
    ranking: 8,
    artist: 'PAUL WOOLFORD & DIPLO/LOMAX',
    title: 'LOOKING FOR ME',
  },
  {
    ranking: 9,
    artist: 'DJ KHALED FT DRAKE',
    title: 'GREECE',
  },
  {
    ranking: 10,
    artist: 'MILEY CYRUS',
    title: 'MIDNIGHT SKY',
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
  expect(prevEntries[0].entry).toBe(curEntries[0].entry); // 1 -> 1
  expect(prevEntries[1].entry).toBe(curEntries[5].entry); // 2 -> 6
  expect(prevEntries[2].entry).toBe(curEntries[3].entry); // 3 -> 4
  expect(prevEntries[3].entry).toBe(curEntries[1].entry); // 4 -> 2
  expect(prevEntries[4].entry).toBe(curEntries[2].entry); // 5 -> 3
  expect(prevEntries[5].entry).toBe(curEntries[4].entry); // 6 -> 5
  expect(prevEntries[6].entry).toBe(curEntries[6].entry); // 7 -> 7
  expect(prevEntries[8].entry).toBe(curEntries[8].entry); // 9 -> 9
});
