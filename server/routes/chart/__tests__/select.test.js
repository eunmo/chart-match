const express = require('express');
const request = require('supertest');
const { dml, query, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry, chartMatch } = require('../../../db');
const { albums, singles, expected } = require('./test-data');
const router = require('..');

jest.setTimeout(10000);
const app = express();
app.use('/', router);

const names = ['us', 'jp', 'gb', 'kr'];
const week = '2020-09-12';
const ymd = '2020/09/12';

async function populate(name) {
  const chartId = chart.ids[name];

  let top10 = singles.cur[name];

  await chartEntry.addMissing('single', chartId, top10);
  let entryIds = await chartEntry.getIds('single', chartId, top10);
  await chart.add('single', chartId, ymd, entryIds);

  const usSongs = expected.single[name].us.map(({ ranking, idx, id }) => ({
    entry: entryIds[ranking - 1].id,
    idx,
    id,
  }));
  const jpSongs = expected.single[name].jp.map(({ ranking, idx, id }) => ({
    entry: entryIds[ranking - 1].id,
    idx,
    id,
  }));
  await chartMatch.add('single', 'us', usSongs);
  await chartMatch.add('single', 'jp', jpSongs);

  top10 = albums.cur[name];

  await chartEntry.addMissing('album', chartId, top10);
  entryIds = await chartEntry.getIds('album', chartId, top10);
  await chart.add('album', chartId, ymd, entryIds);

  const usAlbums = expected.album[name].us.map(({ ranking, idx, id }) => ({
    entry: entryIds[ranking - 1].id,
    idx,
    id,
  }));
  const jpAlbums = expected.album[name].jp.map(({ ranking, idx, id }) => ({
    entry: entryIds[ranking - 1].id,
    idx,
    id,
  }));
  await chartMatch.add('album', 'us', usAlbums);
  await chartMatch.add('album', 'jp', jpAlbums);
}

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS singleChart;');
  await dml('DROP TABLE IF EXISTS singleChartMatch;');
  await dml('DROP TABLE IF EXISTS singleChartEntry;');
  await dml('DROP TABLE IF EXISTS albumChart;');
  await dml('DROP TABLE IF EXISTS albumChartMatch;');
  await dml('DROP TABLE IF EXISTS albumChartEntry;');

  await dml('CREATE TABLE singleChartEntry LIKE chart.singleChartEntry;');
  await dml('CREATE TABLE singleChart LIKE chart.singleChart;');
  await dml('CREATE TABLE singleChartMatch LIKE chart.singleChartMatch;');
  await dml('CREATE TABLE albumChartEntry LIKE chart.albumChartEntry;');
  await dml('CREATE TABLE albumChart LIKE chart.albumChart;');
  await dml('CREATE TABLE albumChartMatch LIKE chart.albumChartMatch;');

  await Promise.all(names.map((name) => populate(name)));
});

afterAll(async () => {
  await dml('DROP TABLE singleChart;');
  await dml('DROP TABLE singleChartMatch;');
  await dml('DROP TABLE singleChartEntry;');
  await dml('DROP TABLE albumChart;');
  await dml('DROP TABLE albumChartMatch;');
  await dml('DROP TABLE albumChartEntry;');
  await cleanup();
});

const dynamiteId = {
  us: '1529518695',
  jp: '1528831888',
};

const bonVoyageId = {
  us: '1530216879',
  jp: '1530379595',
};

test.each(['us', 'jp'])('get current albums %s', async (store) => {
  const response = await request(app).get(`/current/tops/${store}`);
  expect(response.statusCode).toBe(200);

  const {
    body: { songs, albums: resAlbums },
  } = response;

  expect(songs.length).toBe(4);
  expect(songs[0].chart).toBe(0);
  expect(songs[0].id).toEqual('1526746984');
  expect(songs[0].name).toEqual('WAP (feat. Megan Thee Stallion)');
  expect(songs[1].chart).toBe(1);
  expect(songs[1].id).toEqual('1527213875');
  expect(songs[1].name).toEqual('Oh Yeah');
  expect(songs[2].chart).toBe(2);
  expect(songs[2].id).toEqual('1526746984');
  expect(songs[2].name).toEqual('WAP (feat. Megan Thee Stallion)');
  expect(songs[3].chart).toBe(5);
  expect(songs[3].id).toEqual(dynamiteId[store]);
  expect(songs[3].name).toEqual('Dynamite');

  expect(resAlbums.length).toBe(4);
  expect(resAlbums[0].chart).toBe(0);
  expect(resAlbums[0].id).toEqual('1530247672');
  expect(resAlbums[0].name).toEqual('Detroit 2');
  expect(resAlbums[1].chart).toBe(1);
  expect(resAlbums[1].id).toEqual('1528149531');
  expect(resAlbums[1].name).toEqual('24H - EP');
  expect(resAlbums[2].chart).toBe(2);
  expect(resAlbums[2].id).toEqual('1440852826');
  expect(resAlbums[2].name).toEqual('Goats Head Soup');
  expect(resAlbums[3].chart).toBe(5);
  expect(resAlbums[3].id).toEqual(bonVoyageId[store]);
  expect(resAlbums[3].name).toEqual('Bon Voyage - EP');
});

const songCount = { us: 35, jp: 36 };

test.each(['us', 'jp'])('get current singles %s', async (store) => {
  const response = await request(app).get(`/current/single/${store}`);
  expect(response.statusCode).toBe(200);

  const { body: songs } = response;
  expect(songs.length).toBe(songCount[store]);
  expect(songs[0].id).toEqual('1526746984'); // wap
  expect(songs[0].name).toEqual('WAP (feat. Megan Thee Stallion)'); // wap
  expect(songs[1].id).toEqual(dynamiteId[store]);
  expect(songs[1].name).toEqual('Dynamite');
});

const albumCount = { us: 32, jp: 32 };

test.each(['us', 'jp'])('get current albums %s', async (store) => {
  const response = await request(app).get(`/current/album/${store}`);
  expect(response.statusCode).toBe(200);

  const { body } = response;
  expect(body.length).toBe(albumCount[store]);
  expect(body[0].id).toEqual('1530247672');
  expect(body[0].name).toEqual('Detroit 2');
  expect(body[1].id).toEqual('1528149531');
  expect(body[1].name).toEqual('24H - EP');
});

describe.each(['single', 'album'])('%s', (type) => {
  test.each([
    ['us', 'us'],
    ['us', 'jp'],
    ['jp', 'us'],
    ['jp', 'jp'],
    ['gb', 'us'],
    ['gb', 'jp'],
    ['kr', 'us'],
    ['kr', 'jp'],
  ])('select %s %s', async (chartName, store) => {
    const response = await request(app).get(
      `/select/week/${type}/${chartName}/${week}/${store}`
    );
    expect(response.statusCode).toBe(200);

    const { body } = response;
    body.forEach(({ id, raw, catalog }) => {
      expect(raw).not.toBe(null);
      if (id === null) {
        expect(catalog).toBe(undefined);
      } else {
        expect(catalog).not.toBe(undefined);
      }
    });
  });

  test.each([
    ['us', 'us'],
    ['us', 'jp'],
    ['jp', 'us'],
    ['jp', 'jp'],
    ['gb', 'us'],
    ['gb', 'jp'],
    ['kr', 'us'],
    ['kr', 'jp'],
  ])('matched entry %s %s', async (chartName, store) => {
    const match = expected[type][chartName][store].find(({ id }) => id);
    const rows = await query(
      `SELECT entry from ${type}ChartMatch WHERE id = ${match.id}`
    );
    const { entry } = rows[0];

    const response = await request(app).get(
      `/select/entry/${type}/${chartName}/${entry}/${store}`
    );
    expect(response.statusCode).toBe(200);

    const { body } = response;
    body.forEach(({ raw, catalog }) => {
      expect(raw).not.toBe(null);
      expect(catalog).not.toBe(undefined);
    });
  });
});
