const express = require('express');
const { chartCurrent } = require('../../db');
const { queryAppleMusic } = require('./util');

const router = express.Router();

router.get('/single/:store', async (req, res) => {
  const { store } = req.params;
  const songs = await chartCurrent.getSortedSongs(store);
  const shrinked = songs
    .map(({ id, ranks }) => ({
      id,
      rank: ranks[0].ranking,
    }))
    .filter(({ rank }) => rank <= 10);
  const ids = shrinked.map(({ id }) => id);
  const query = `songs?ids=${ids.join(',')}`;
  const url = `https://api.music.apple.com/v1/catalog/${store}/${query}`;
  const { data } = await queryAppleMusic(url);
  const dataMap = {};
  data.forEach((song) => {
    dataMap[song.id] = song;
  });
  const merged = shrinked.map(({ id, rank }) => {
    const {
      attributes: { artistName, name },
    } = dataMap[id];
    return { id, rank, artist: artistName, name };
  });
  res.json(merged);
});

module.exports = router;
