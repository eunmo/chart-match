const express = require('express');
const bodyParser = require('body-parser');
const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry, chartMatch } = require('../../../db');
const { singles, albums, expected } = require('./test-data');
const router = require('../edit');

jest.mock('../../../apple/query');

jest.setTimeout(10000);
const app = express();
app.use(bodyParser.json());
app.use('/', router);

const week = '2020-09-12';
const ymd = '2020/09/12';

const testData = { single: singles, album: albums };

afterAll(async () => {
  await cleanup();
});

describe.each(['single', 'album'])('%s', (type) => {
  async function populate(name) {
    const top10 = testData[type].cur[name];
    const chartId = chart.ids[name];

    await chartEntry.addMissing(type, chartId, top10);
    const entryIds = await chartEntry.getIds(type, chartId, top10);
    await chart.add(type, chartId, ymd, entryIds);
    return entryIds;
  }

  let ids;

  beforeAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);

    ids = await populate('us');
  });

  afterAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
  });

  beforeEach(async () => {
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
  });

  test.each(['us', 'jp'])('delete match %s', async (store) => {
    const entries = expected[type].us[store].map(({ ranking, idx, id }) => ({
      entry: ids[ranking - 1].id,
      idx,
      id,
    }));
    await chartMatch.add(type, store, entries);

    const body = { store, entry: ids[0].id };
    const response = await request(app).delete(`/${type}`).send(body);
    expect(response.statusCode).toBe(200);

    const rows = await chart.getMatches(type, chart.ids.us, week, store);
    expect(rows[0].id).toBe(null);
  });

  test.each(['us', 'jp'])('update match %s', async (store) => {
    const entries = expected[type].us[store].map(({ ranking, idx, id }) => ({
      entry: ids[ranking - 1].id,
      idx,
      id,
    }));
    await chartMatch.add(type, store, entries);

    const body = { store, entry: ids[0].id, track: 0, id: '200' };
    const response = await request(app).put(`/id/${type}`).send(body);
    expect(response.statusCode).toBe(200);

    const rows = await chart.getMatches(type, chart.ids.us, week, store);
    expect(rows[0].id).toEqual('200');
  });

  test.each(['us', 'jp'])('update matches %s', async (store) => {
    const entries = expected[type].us[store].map(({ ranking, idx, id }) => ({
      entry: ids[ranking - 1].id,
      idx,
      id,
    }));
    await chartMatch.add(type, store, entries);

    const body = { store, entry: ids[0].id, track: 0, ids: ['200', '201'] };
    const response = await request(app).put(`/ids/${type}`).send(body);
    expect(response.statusCode).toBe(200);

    const rows = await chart.getMatches(type, chart.ids.us, week, store);
    expect(rows[0].id).toEqual('200');
    expect(rows[1].id).toEqual('201');
  });

  test.each(['us', 'jp'])('update matches %s', async (store) => {
    if (type === 'album') {
      return;
    }

    const entries = expected[type].us[store].map(({ ranking, idx, id }) => ({
      entry: ids[ranking - 1].id,
      idx,
      id,
    }));
    await chartMatch.add(type, store, entries);

    const url = `https://music.apple.com/${store}/album/folklore-deluxe-version/1528112358?i=1528112361`;
    const body = { store, entry: ids[0].id, track: 0, url, count: 3 };
    const response = await request(app).put('/singles').send(body);
    expect(response.statusCode).toBe(200);

    const rows = await chart.getMatches(type, chart.ids.us, week, store);
    expect(rows[0].id).toEqual('1528112361');
    expect(rows[1].id).toEqual('1528112362');
    expect(rows[2].id).toEqual('1528112363');
  });
});
