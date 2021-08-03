const { dml, query, cleanup } = require('@eunmo/mysql');
const {
  add,
  edit,
  remove,
  get,
  addAlbums,
  editAlbums,
  getAlbums,
  clearSongs,
  addSongs,
  getSongs,
  getSongCounts,
} = require('../favorite-artist');

beforeEach(async () => {
  await dml('TRUNCATE TABLE favoriteArtistAlbum');
  await dml('TRUNCATE TABLE favoriteArtist');
  await dml('TRUNCATE TABLE favoriteArtistSong');
});

afterAll(async () => {
  await dml('TRUNCATE TABLE favoriteArtistAlbum');
  await dml('TRUNCATE TABLE favoriteArtist');
  await dml('TRUNCATE TABLE favoriteArtistSong');
  await cleanup();
});

test('add', async () => {
  await add('us', '1', '2', 'name', 'url', 'artwork');
  const rows = await query('SELECT * FROM favoriteArtist');
  expect(rows.length).toBe(1);
});

test('add null artwork', async () => {
  await add('us', '1', '2', 'name', 'url');
  const rows = await query('SELECT * FROM favoriteArtist');
  expect(rows.length).toBe(1);
});

test('add then get', async () => {
  await add('us', '1', '2', 'name', 'url', 'artwork');
  let rows = await get('us');
  expect(rows.length).toBe(1);
  expect(rows[0].id).toBe('1');
  expect(rows[0].gid).toBe('2');
  expect(rows[0].name).toBe('name');

  rows = await get('jp');
  expect(rows.length).toBe(0);
});

test('add then remove', async () => {
  await add('us', '1', '2', 'name', 'url', 'artwork');
  let rows = await get('us');
  expect(rows.length).toBe(1);
  expect(rows[0].id).toBe('1');
  expect(rows[0].gid).toBe('2');
  expect(rows[0].name).toBe('name');

  await remove('us', '1');
  rows = await get('us');
  expect(rows.length).toBe(0);
});

test('add then edit', async () => {
  await add('us', '1', '2', 'name', 'url', 'artwork');
  let rows = await get('us');
  expect(rows.length).toBe(1);
  expect(rows[0].id).toBe('1');
  expect(rows[0].gid).toBe('2');
  expect(rows[0].name).toBe('name');

  await edit('us', '1', '3');
  rows = await get('us');
  expect(rows.length).toBe(1);
  expect(rows[0].gid).toBe('3');
});

test('add albums', async () => {
  const artist = 'artist';
  const albums = [{ id: '1' }, { id: '2' }];
  await addAlbums('us', artist, albums);

  const rows = await query('SELECT * FROM favoriteArtistAlbum');
  expect(rows.length).toBe(2);
});

test('add albums then get', async () => {
  const artist = 'artist';
  const albums = [{ id: '1' }, { id: '2' }];
  await addAlbums('us', artist, albums);

  const rows = await getAlbums('us', artist);
  expect(rows.length).toBe(2);
});

test('edit album', async () => {
  const artist = 'artist';
  const albums = [{ id: '1' }, { id: '2' }];
  await addAlbums('us', artist, albums);

  let rows = await getAlbums('us', artist);
  expect(rows.length).toBe(2);
  rows.forEach(({ included }) => {
    expect(included).toBe(true);
  });

  await editAlbums('us', { 1: false, 2: false });

  rows = await getAlbums('us', artist);
  expect(rows.length).toBe(2);
  rows.forEach(({ included }) => {
    expect(included).toBe(false);
  });
});

test('add more albums', async () => {
  const artist = 'artist';
  let albums = [{ id: '1' }, { id: '2' }];
  await addAlbums('us', artist, albums);

  let rows = await getAlbums('us', artist);
  expect(rows.length).toBe(2);
  rows.forEach(({ included }) => {
    expect(included).toBe(true);
  });

  await editAlbums('us', { 1: false, 2: false });

  rows = await getAlbums('us', artist);
  expect(rows.length).toBe(2);
  rows.forEach(({ included }) => {
    expect(included).toBe(false);
  });

  albums = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
  await addAlbums('us', artist, albums);

  rows = await getAlbums('us', artist);
  expect(rows.length).toBe(4);
  rows.forEach(({ id, included }) => {
    expect(included).toBe(id >= '3');
  });
});

test('add songs', async () => {
  const songs = [{ id: '1' }, { id: '2' }];
  await addSongs('us', '3', songs);

  const rows = await query('SELECT * FROM favoriteArtistSong');
  expect(rows.length).toBe(2);
});

test('add songs then get', async () => {
  const songs = [{ id: '1' }, { id: '2' }];
  await addSongs('us', '3', songs);

  let rows = await getSongs('us');
  expect(rows.length).toBe(2);

  rows = await getSongCounts('us');
  expect(rows.length).toBe(1);
});

test('add songs then clear', async () => {
  const songs = [{ id: '1' }, { id: '2' }];
  await addSongs('us', '3', songs);
  let rows = await query('SELECT * FROM favoriteArtistSong');
  expect(rows.length).toBe(2);

  await clearSongs('us');
  rows = await query('SELECT * FROM favoriteArtistSong');
  expect(rows.length).toBe(0);
});

describe('foreign key', () => {
  beforeEach(async () => {
    await dml(`
      ALTER TABLE favoriteArtistAlbum
      ADD CONSTRAINT faa_fk FOREIGN KEY (store, artist) REFERENCES favoriteArtist (store, id) ON DELETE CASCADE`);
  });

  afterEach(async () => {
    await dml('ALTER TABLE favoriteArtistAlbum DROP FOREIGN KEY faa_fk');
  });

  test('cascade on delete', async () => {
    const artist = '1';
    await add('us', artist, '2', 'name', 'url', 'artwork');
    let rows = await query('SELECT * FROM favoriteArtist');
    expect(rows.length).toBe(1);

    const albums = [{ id: '1' }, { id: '2' }];
    await addAlbums('us', artist, albums);

    rows = await getAlbums('us', artist);
    expect(rows.length).toBe(2);

    await remove('us', artist);
    rows = await get('us');
    expect(rows.length).toBe(0);

    rows = await getAlbums('us', artist);
    expect(rows.length).toBe(0);
  });
});
