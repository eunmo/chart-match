/* eslint-disable no-await-in-loop */
const express = require('express');
const { favoriteArtist } = require('../db');
const { queryAppleMusic } = require('./chart/util');

const router = express.Router();

router.put('/add', async (req, res) => {
  const { store, id, name, url, artwork } = req.body;
  await favoriteArtist.add(store, id, id, name, url, artwork);
  res.sendStatus(200);
});

router.put('/edit', async (req, res) => {
  const { store, id, gid } = req.body;
  await favoriteArtist.edit(store, id, gid);
  res.sendStatus(200);
});

router.delete('/', async (req, res) => {
  const { store, id } = req.body;
  await favoriteArtist.remove(store, id);
  res.sendStatus(200);
});

router.get('/list/:store', async (req, res) => {
  const { store } = req.params;
  const [artists, gidCounts] = await Promise.all([
    favoriteArtist.get(store),
    favoriteArtist.getSongCounts(store),
  ]);
  const merged = artists.map((artist) => {
    const { count } = gidCounts.find(({ gid }) => gid === artist.gid) ?? {};
    // eslint-disable-next-line no-param-reassign
    const gidSongCount = count ?? 0;
    return { gidSongCount, ...artist };
  });
  res.json(merged);
});

async function getArtistAlbums(store, id) {
  let queryUrl = `https://api.music.apple.com/v1/catalog/${store}/artists/${id}/albums`;
  let { next, data } = await queryAppleMusic(queryUrl);
  let nextData;
  while (next) {
    queryUrl = `https://api.music.apple.com${next}`;
    ({ next, data: nextData } = await queryAppleMusic(queryUrl));
    data = [...data, ...nextData];
  }
  return data;
}

async function getTracks(store, albums) {
  let songs = [];

  function extractTrack(data) {
    data.forEach(({ relationships }) => {
      const { data: tracks } = relationships.tracks;
      const onlySongs = tracks.filter(({ type }) => type === 'songs');
      songs = [...songs, ...onlySongs];
    });
  }

  for (let i = 0; i < albums.length; i += 25) {
    const ids = albums.slice(i, i + 25).map(({ id }) => id);
    const queryUrl = `https://api.music.apple.com/v1/catalog/${store}/albums?ids=${ids.join(
      ','
    )}&include=tracks`;
    const { data } = await queryAppleMusic(queryUrl);
    extractTrack(data);
  }
  return songs;
}

router.get('/update-songs/:store', async (req, res) => {
  const { store } = req.params;
  await favoriteArtist.clearSongs(store);
  const artists = await favoriteArtist.get(store);
  for (let i = 0; i < artists.length; i += 1) {
    const { id, gid } = artists[i];
    const albums = await getArtistAlbums(store, id);
    const songs = await getTracks(store, albums);
    await favoriteArtist.addSongs(store, gid, songs);
  }
  res.sendStatus(200);
});

module.exports = router;
