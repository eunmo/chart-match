const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');
const fetch = require('node-fetch');
const { dml, query, cleanup } = require('@eunmo/mysql');
const { chart } = require('../../../db');
const router = require('../fetch');
const { singles, albums } = require('./test-data.json');

const { ids: chartIds } = chart;

jest.setTimeout(10000);
const app = express();
app.use('/', router);

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const prevWeek = '2020-09-05';
const curWeek = '2020-09-12';

const testData = { single: singles, album: albums };

const expectedRanks = {
  single: {
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
    fr: [
      [0, 0],
      [1, 1],
      [2, 4],
      [3, 2],
      [4, 3],
      [5, 5],
      [6, 7],
      [7, 6],
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
  },
  album: {
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
    fr: [
      [0, 2],
      [1, 1],
      [2, 5],
      [5, 7],
      [8, 8],
    ],
    kr: [
      [0, 4],
      [1, 1],
      [2, 5],
      [5, 3],
      [9, 8],
    ],
  },
};
const expectedSum = {
  single: {
    us: 111,
    gb: 111,
    fr: 118,
    kr: 107,
  },
  album: {
    us: 113,
    gb: 113,
    fr: 109,
    kr: 133,
  },
};

afterAll(async () => {
  await cleanup();
});

describe.each(['single', 'album'])('%s', (type) => {
  afterAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
  });

  beforeEach(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
  });

  describe.each(['us', 'gb', 'fr', 'kr'])('%s', (chartName) => {
    const chartId = chartIds[chartName];

    const prevData = fs.readFileSync(
      path.join(__dirname, 'html', `${chartName}-${type}-${prevWeek}.html`)
    );
    const curData = fs.readFileSync(
      path.join(__dirname, 'html', `${chartName}-${type}-${curWeek}.html`)
    );
    const data = { [prevWeek]: prevData, [curWeek]: curData };

    const prev10 = testData[type].prev[chartName];
    const cur10 = testData[type].cur[chartName];

    test.each([
      [prevWeek, prev10],
      [curWeek, cur10],
    ])('fetch clean %s', async (week, expected) => {
      fetch.mockReturnValue(Promise.resolve(new Response(data[week])));

      const url = `/${type}/${chartName}/${week}`;
      const response = await request(app).get(url);
      expect(response.statusCode).toBe(200);

      const entries = await chart.getRaw(type, chartId, week);
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
      const url = `/${type}/${chartName}/${week}`;
      let response = await request(app).get(url);
      expect(response.statusCode).toBe(200);

      fetch.mockReturnValue(Promise.resolve(new Response(data[week])));
      response = await request(app).get(url);
      expect(response.statusCode).toBe(200);

      const entries = await chart.getRaw(type, chartId, week);
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
      let url = `/${type}/${chartName}/${prevWeek}`;
      let response = await request(app).get(url);
      expect(response.statusCode).toBe(200);

      fetch.mockReturnValue(Promise.resolve(new Response(data[curWeek])));
      url = `/${type}/${chartName}/${curWeek}`;
      response = await request(app).get(url);
      expect(response.statusCode).toBe(200);

      const counts = await query(
        `SELECT count(*) AS count FROM ${type}ChartEntry`
      );
      expect(counts[0].count).toBe(expectedSum[type][chartName]);

      function getRaw(week) {
        return query(
          `SELECT * FROM ${type}Chart WHERE chart=${chartId} AND week='${week}'`
        );
      }

      const prevEntries = await getRaw(prevWeek);
      const curEntries = await getRaw(curWeek);
      expectedRanks[type][chartName].forEach(([prevRank, curRank]) => {
        expect(prevEntries[prevRank].entry).toBe(curEntries[curRank].entry);
      });
    });
  });
});
