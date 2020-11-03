const express = require('express');
const { favoriteArtists } = require('../db');
const { queryAppleMusic } = require('./chart/util');

const router = express.Router();

router.put('/', async (req, res) => {
  const { store, id: artist } = req.body;
  await favoriteArtists.add(store, artist);
  res.sendStatus(200);
});

router.delete('/', async (req, res) => {
  const { store, id: artist } = req.body;
  await favoriteArtists.remove(store, artist);
  res.sendStatus(200);
});

router.get('/:store', async (req, res) => {
  const { store } = req.params;
  const artists = await favoriteArtists.get(store);
  if (artists.length === 0) {
    res.json([]);
    return;
  }

  const ids = artists.map(({ artist }) => artist).sort();
  const query = `artists?ids=${ids.join(',')}&include=albums`;
  const url = `https://api.music.apple.com/v1/catalog/${store}/${query}`;
  const { data } = await queryAppleMusic(url);
  res.json(data ?? []);
});

module.exports = router;
