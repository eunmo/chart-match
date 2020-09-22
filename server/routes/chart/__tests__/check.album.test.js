const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');
const fetch = require('node-fetch');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart } = require('../../../db');
const { chartIds } = require('../constants');
const router = require('..');

jest.setTimeout(10000);
const app = express();
app.use('/', router);

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

function getData(chartName, week) {
  return fs.readFileSync(
    path.join(__dirname, 'html', `${chartName}-album-${week}.html`)
  );
}

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS albumChart;');
  await dml('DROP TABLE IF EXISTS albumChartEntry;');
  await dml('CREATE TABLE albumChartEntry LIKE chart.albumChartEntry;');
  await dml('CREATE TABLE albumChart LIKE chart.albumChart;');

  fetch.mockImplementation((url) => {
    if (/billboard.*2020-09-10/.test(url)) {
      return Promise.resolve(new Response(getData('us', '2020-09-05')));
    }
    if (/billboard.*2020-09-17/.test(url)) {
      return Promise.resolve(new Response(getData('us', '2020-09-12')));
    }
    if (/officialcharts.*20200904/.test(url)) {
      return Promise.resolve(new Response(getData('gb', '2020-09-05')));
    }
    if (/officialcharts/.test(url)) {
      return Promise.resolve(new Response(getData('gb', '2020-09-12')));
    }

    return Promise.resolve(new Response('<html></html>'));
  });
});

afterAll(async () => {
  await dml('DROP TABLE albumChart;');
  await dml('DROP TABLE albumChartEntry;');
  await cleanup();
});

test('check album', async () => {
  const week = '2020-09-12';

  let response = await request(app).get('/fetch/album/us/2020-09-05');
  expect(response.statusCode).toBe(200);

  response = await request(app).get('/fetch/album/gb/2020-09-05');
  expect(response.statusCode).toBe(200);

  response = await request(app).get('/check/album');
  expect(response.statusCode).toBe(200);

  let entries = await chart.getRawAlbums(chartIds.us, week);
  expect(entries.length).toBe(100);

  entries = await chart.getRawAlbums(chartIds.gb, week);
  expect(entries.length).toBe(100);

  let rows = await chart.getLatestAlbumWeeks();
  expect(rows.length).toBe(2);
  expect(rows[0].week.toISOString().substring(0, 10)).toBe(week);
  expect(rows[0].chart).toBe(chartIds.us);
  expect(rows[1].week.toISOString().substring(0, 10)).toBe(week);
  expect(rows[1].chart).toBe(chartIds.gb);

  response = await request(app).get('/check/album');
  expect(response.statusCode).toBe(200);

  entries = await chart.getRawAlbums(chartIds.us, week);
  expect(entries.length).toBe(100);

  entries = await chart.getRawAlbums(chartIds.gb, week);
  expect(entries.length).toBe(100);

  rows = await chart.getLatestAlbumWeeks();
  expect(rows.length).toBe(2);
  expect(rows[0].week.toISOString().substring(0, 10)).toBe(week);
  expect(rows[0].chart).toBe(chartIds.us);
  expect(rows[1].week.toISOString().substring(0, 10)).toBe(week);
  expect(rows[1].chart).toBe(chartIds.gb);
});
