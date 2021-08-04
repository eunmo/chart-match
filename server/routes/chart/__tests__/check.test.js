const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');
const fetch = require('node-fetch');
const { dml, cleanup } = require('@eunmo/mysql');
const { chart } = require('../../../db');
const router = require('..');

const { ids: chartIds } = chart;

jest.setTimeout(10000);
const app = express();
app.use('/', router);

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');
jest.mock('../match');

afterAll(async () => {
  await cleanup();
});

describe.each(['single', 'album'])('%s', (type) => {
  function getData(chartName, week) {
    return fs.readFileSync(
      path.join(__dirname, 'html', `${chartName}-${type}-${week}.html`)
    );
  }

  beforeAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);

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
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
  });

  test('check', async () => {
    const week = '2020-09-12';

    let response = await request(app).get(`/fetch/${type}/us/2020-09-05`);
    expect(response.statusCode).toBe(200);

    response = await request(app).get(`/fetch/${type}/gb/2020-09-05`);
    expect(response.statusCode).toBe(200);

    response = await request(app).get(`/check/${type}`);
    expect(response.statusCode).toBe(200);

    let entries = await chart.getRaw(type, chartIds.us, week);
    expect(entries.length).toBe(100);

    entries = await chart.getRaw(type, chartIds.gb, week);
    expect(entries.length).toBe(100);

    let rows = await chart.getLatestWeeks(type);
    expect(rows.length).toBe(2);
    expect(rows[0].week.toISOString().substring(0, 10)).toBe(week);
    expect(rows[0].chart).toBe(chartIds.us);
    expect(rows[1].week.toISOString().substring(0, 10)).toBe(week);
    expect(rows[1].chart).toBe(chartIds.gb);

    response = await request(app).get(`/check/${type}`);
    expect(response.statusCode).toBe(200);

    entries = await chart.getRaw(type, chartIds.us, week);
    expect(entries.length).toBe(100);

    entries = await chart.getRaw(type, chartIds.gb, week);
    expect(entries.length).toBe(100);

    rows = await chart.getLatestWeeks(type);
    expect(rows.length).toBe(2);
    expect(rows[0].week.toISOString().substring(0, 10)).toBe(week);
    expect(rows[0].chart).toBe(chartIds.us);
    expect(rows[1].week.toISOString().substring(0, 10)).toBe(week);
    expect(rows[1].chart).toBe(chartIds.gb);
  });
});
