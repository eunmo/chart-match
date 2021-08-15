const express = require('express');
const request = require('supertest');

const router = require('../search');

jest.mock('../../apple/query');

const app = express();
app.use('/', router);

test('single', async () => {
  const url = encodeURI('/single/IU Good Day/us');

  const response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const { body } = response;
  expect(body.data).not.toBe(null);
});

test('album', async () => {
  const url = encodeURI('/album/IU Real/us');

  const response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const { body } = response;
  expect(body.data).not.toBe(null);
});

test('artist', async () => {
  const url = encodeURI('/artist/IU/us');

  const response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const { body } = response;
  expect(body.data).not.toBe(null);
});
