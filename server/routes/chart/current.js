const express = require('express');
const { chartCurrent } = require('../../db');

const router = express.Router();

router.get('/single/:store', async (req, res) => {
  const { store } = req.params;
  const songs = await chartCurrent.getSortedSongs(store);
  const shrinked = songs
    .map(({ id, url, ranks }) => ({
      id,
      url,
      rank: ranks[0].ranking,
    }))
    .filter(({ rank }) => rank <= 10);
  res.json(shrinked);
});

module.exports = router;
