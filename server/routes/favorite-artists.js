const express = require('express');
const { favoriteArtists } = require('../db');
// const { queryAppleMusic } = require('./chart/util');

const router = express.Router();

router.put('/add', async (req, res) => {
  const { store, id, name, url, artwork } = req.body;
  await favoriteArtists.add(store, id, id, name, url, artwork);
  res.sendStatus(200);
});

router.put('/edit', async (req, res) => {
  const { store, id, gid } = req.body;
  await favoriteArtists.edit(store, id, gid);
  res.sendStatus(200);
});

router.delete('/', async (req, res) => {
  const { store, id } = req.body;
  await favoriteArtists.remove(store, id);
  res.sendStatus(200);
});

router.get('/:store', async (req, res) => {
  const { store } = req.params;
  const artists = await favoriteArtists.get(store);
  res.json(artists);
});

module.exports = router;
