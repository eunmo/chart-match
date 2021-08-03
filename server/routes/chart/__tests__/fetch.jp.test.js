const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');
const fetch = require('node-fetch');
const { dml, query, cleanup } = require('@eunmo/mysql');
const { chart } = require('../../../db');
const router = require('../fetch');
const { singles, albums } = require('./test-data');

const chartId = chart.ids.jp;
const app = express();
app.use('/', router);

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const prevWeek = '2020-09-05';
const curWeek = '2020-09-12';

const testData = { single: singles, album: albums };
const expectedRanks = {
  single: [
    [3, 2],
    [5, 4],
    [6, 1],
    [7, 5],
    [8, 8],
  ],
  album: [
    [0, 4],
    [1, 2],
  ],
};

afterAll(async () => {
  await cleanup();
});

describe.each(['single', 'album'])('%s', (type) => {
  function getData(week, page) {
    return fs.readFileSync(
      path.join(__dirname, 'html', `jp-${type}-${week}-${page}.html`)
    );
  }

  const mockData = {
    [prevWeek]: '12345'.split('').map((p) => getData(prevWeek, p)),
    [curWeek]: '12345'.split('').map((p) => getData(curWeek, p)),
  };

  beforeAll(async () => {
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
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
  });

  beforeEach(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
  });

  const prev10 = testData[type].prev.jp;
  const cur10 = testData[type].cur.jp;

  test.each([
    [prevWeek, prev10],
    [curWeek, cur10],
  ])('fetch clean %s', async (week, expected) => {
    const url = `/${type}/jp/${week}`;
    const response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    const entries = await chart.getRaw(type, chartId, week);
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
    const url = `/${type}/jp/${week}`;
    let response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    const entries = await chart.getRaw(type, chartId, week);
    expect(entries.length).toBe(50);
    expected.forEach(({ ranking, artist, title }, index) => {
      const entry = entries[index];
      expect(entry.ranking).toBe(ranking);
      expect(entry.artist).toEqual(artist);
      expect(entry.title).toEqual(title);
    });
  });

  test('fetch consecutive', async () => {
    let url = `/${type}/jp/${prevWeek}`;
    let response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    url = `/${type}/jp/${curWeek}`;
    response = await request(app).get(url);
    expect(response.statusCode).toBe(200);

    const counts = await query(
      `SELECT count(*) AS count FROM ${type}ChartEntry`
    );
    expect(counts[0].count).toBe({ single: 63, album: 70 }[type]);

    function getRaw(week) {
      return query(
        `SELECT * FROM ${type}Chart WHERE chart=${chartId} AND week='${week}'`
      );
    }

    const prevEntries = await getRaw(prevWeek);
    const curEntries = await getRaw(curWeek);
    expectedRanks[type].forEach(([prevRank, curRank]) => {
      expect(prevEntries[prevRank].entry).toBe(curEntries[curRank].entry);
    });
  });
});
