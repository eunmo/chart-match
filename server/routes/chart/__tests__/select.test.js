const express = require('express');
const request = require('supertest');
const { dml, query, cleanup } = require('@eunmo/mysql');
const { chart, chartEntry, chartMatch } = require('../../../db');
const { albums, singles, expected } = require('./test-data.json');
const router = require('..');

jest.mock('../../../apple/query');

jest.setTimeout(10000);
const app = express();
app.use('/', router);

const names = ['us', 'jp', 'gb', 'fr', 'kr'];
const year = '2020';
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
  await Promise.all(
    ['single', 'album'].map(async (type) => {
      await dml(`TRUNCATE TABLE ${type}Chart`);
      await dml(`TRUNCATE TABLE ${type}ChartMatch`);
      await dml(`TRUNCATE TABLE ${type}ChartEntry`);
    })
  );

  await Promise.all(names.map((name) => populate(name)));
});

afterAll(async () => {
  await Promise.all(
    ['single', 'album'].map(async (type) => {
      await dml(`TRUNCATE TABLE ${type}Chart`);
      await dml(`TRUNCATE TABLE ${type}ChartMatch`);
      await dml(`TRUNCATE TABLE ${type}ChartEntry`);
    })
  );
  await cleanup();
});

const dynamiteId = {
  us: '1529518695',
  jp: '1528831888',
};

const seventeen = {
  us: { id: '1274653476', name: '17' },
  jp: { id: '1528149531', name: '24H - EP' },
};

const goatsHeadSoup = {
  us: { id: '1440852826', name: 'Goats Head Soup' },
  jp: { id: '1521993582', name: 'Goats Head Soup (2020)' },
};

test.each(['us', 'jp'])('get tops %s', async (store) => {
  const response = await request(app).get(`/current/tops/${store}`);
  expect(response.statusCode).toBe(200);

  const {
    body: { songs, albums: resAlbums },
  } = response;

  expect(songs.length).toBe(5);
  expect(songs[0].chart).toBe(0);
  expect(songs[0].id).toEqual('1526746984');
  expect(songs[0].name).toEqual('WAP (feat. Megan Thee Stallion)');
  expect(songs[1].chart).toBe(1);
  expect(songs[1].id).toEqual('1527213875');
  expect(songs[1].name).toEqual('Oh Yeah');
  expect(songs[2].chart).toBe(2);
  expect(songs[2].id).toEqual('1526746984');
  expect(songs[2].name).toEqual('WAP (feat. Megan Thee Stallion)');
  expect(songs[3].chart).toBe(4);
  expect(songs[3].id).toEqual('1525245745');
  expect(songs[3].name).toEqual('Macaroni (feat. Ninho)');
  expect(songs[4].chart).toBe(5);
  expect(songs[4].id).toEqual(dynamiteId[store]);
  expect(songs[4].name).toEqual('Dynamite');

  expect(resAlbums.length).toBe(5);
  expect(resAlbums[0].chart).toBe(0);
  expect(resAlbums[0].id).toEqual('1537026144');
  expect(resAlbums[0].name).toEqual('Detroit 2: Spirit - EP');
  expect(resAlbums[1].chart).toBe(1);
  expect(resAlbums[1].id).toEqual(seventeen[store].id);
  expect(resAlbums[1].name).toEqual(seventeen[store].name);
  expect(resAlbums[2].chart).toBe(2);
  expect(resAlbums[2].id).toEqual(goatsHeadSoup[store].id);
  expect(resAlbums[2].name).toEqual(goatsHeadSoup[store].name);
  expect(resAlbums[3].chart).toBe(4);
  expect(resAlbums[3].id).toEqual('1537762232');
  expect(resAlbums[3].name).toEqual('aimée');
  expect(resAlbums[4].chart).toBe(5);
  expect(resAlbums[4].id).toEqual('1530317819');
  expect(resAlbums[4].name).toEqual(
    'Never Gonna Dance Again : Act 1 - The 3rd Album'
  );
});

const songCount = { us: 44, jp: 44 };
const albumCount = { us: 42, jp: 42 };

describe.each(['', '/full'])('%s', (infix) => {
  test.each(['us', 'jp'])('get current singles %s', async (store) => {
    const response = await request(app).get(`/current${infix}/single/${store}`);
    expect(response.statusCode).toBe(200);

    const { body: songs } = response;
    expect(songs.length).toBe(songCount[store]);
    expect(songs[0].id).toEqual('1526746984'); // wap
    expect(songs[0].name).toEqual('WAP (feat. Megan Thee Stallion)'); // wap
    expect(songs[1].id).toEqual(dynamiteId[store]);
    expect(songs[1].name).toEqual('Dynamite');
  });

  test.each(['us', 'jp'])('get current albums %s', async (store) => {
    const response = await request(app).get(`/current${infix}/album/${store}`);
    expect(response.statusCode).toBe(200);

    const { body } = response;
    expect(body.length).toBe(albumCount[store]);
    expect(body[0].id).toEqual('1537026144');
    expect(body[0].name).toEqual('Detroit 2: Spirit - EP');
    expect(body[1].id).toEqual(seventeen[store].id);
    expect(body[1].name).toEqual(seventeen[store].name);
  });
});

const chartStores = [
  ['us', 'us'],
  ['us', 'jp'],
  ['jp', 'us'],
  ['jp', 'jp'],
  ['gb', 'us'],
  ['gb', 'jp'],
  ['fr', 'us'],
  ['fr', 'jp'],
  ['kr', 'us'],
  ['kr', 'jp'],
];

describe.each(['single', 'album'])('%s', (type) => {
  test.each(chartStores)('select year 1 %s %s', async (chartName, store) => {
    const response = await request(app).get(
      `/select/year/${type}/${chartName}/${year}/1/${store}`
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

  test.each(chartStores)('select year 10 %s %s', async (chartName, store) => {
    const response = await request(app).get(
      `/select/year/${type}/${chartName}/${year}/10/${store}`
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

  test.each(chartStores)('select week %s %s', async (chartName, store) => {
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

  test.each(chartStores)('matched entry %s %s', async (chartName, store) => {
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
