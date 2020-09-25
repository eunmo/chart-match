const express = require('express');
const request = require('supertest');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry, chartMatch } = require('../../../db');
const { albums, singles, expected } = require('./test-data');
const router = require('../current');

jest.setTimeout(10000);
const app = express();
app.use('/', router);

const names = ['us', 'jp', 'gb', 'kr'];
const ymd = '2020/09/12';

async function populate(name) {
  const chartId = chart.ids[name];

  let top10 = singles.cur[name];

  await chartEntry.addMissingSingles(chartId, top10);
  let entryIds = await chartEntry.getSingleIds(chartId, top10);
  await chart.addSingles(chartId, ymd, entryIds);

  const usSongs = expected.singles[name].us.map(({ ranking, track, id }) => ({
    entry: entryIds[ranking - 1].id,
    track,
    id,
  }));
  const jpSongs = expected.singles[name].jp.map(({ ranking, track, id }) => ({
    entry: entryIds[ranking - 1].id,
    track,
    id,
  }));
  await chartMatch.addSingles('us', usSongs);
  await chartMatch.addSingles('jp', jpSongs);

  top10 = albums.cur[name];

  await chartEntry.addMissingAlbums(chartId, top10);
  entryIds = await chartEntry.getAlbumIds(chartId, top10);
  await chart.addAlbums(chartId, ymd, entryIds);

  const usAlbums = expected.albums[name].us.map(({ ranking, id }) => ({
    entry: entryIds[ranking - 1].id,
    id,
  }));
  const jpAlbums = expected.albums[name].jp.map(({ ranking, id }) => ({
    entry: entryIds[ranking - 1].id,
    id,
  }));
  await chartMatch.addAlbums('us', usAlbums);
  await chartMatch.addAlbums('jp', jpAlbums);
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
  const response = await request(app).get(`/tops/${store}`);
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
