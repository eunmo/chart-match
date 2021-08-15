const express = require('express');
const { formQuery, queryAppleMusic } = require('../apple');

const router = express.Router();

router.get('/single/:keyword/:store', async (req, res) => {
  const { keyword, store } = req.params;
  const queryUrl = formQuery(store, keyword, 'songs', true);
  const { results } = await queryAppleMusic(queryUrl);
  res.json(results?.songs ?? {});
});

router.get('/album/:keyword/:store', async (req, res) => {
  const { keyword, store } = req.params;
  const queryUrl = formQuery(store, keyword, 'albums', true);
  const { results } = await queryAppleMusic(queryUrl);
  res.json(results?.albums ?? {});
});

router.get('/artist/:keyword/:store', async (req, res) => {
  const { keyword, store } = req.params;
  const queryUrl = formQuery(store, keyword, 'artists', true);
  const { results } = await queryAppleMusic(`${queryUrl}&include=albums`);
  res.json(results?.artists ?? {});
});

router.get('/tracks/:id/:store', async (req, res) => {
  const { id, store } = req.params;
  const queryUrl = `https://api.music.apple.com/v1/catalog/${store}/albums/${id}/tracks`;
  let { data } = await queryAppleMusic(queryUrl);
  data = data?.filter(({ type }) => type === 'songs') ?? [];
  res.json(data);
});

module.exports = router;
