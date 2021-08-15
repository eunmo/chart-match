const queryAppleMusic = require('./query');

function formQuery(store, keyword, type, replaceFT = false) {
  let query = keyword.split(' ').join('+');
  query = query.replace(/&/g, '%26');
  if (replaceFT) {
    query = query.replace(/\+FT\+/g, '+Feat+');
  }
  query = `term=${query}&types=artists,${type}`;
  return `https://api.music.apple.com/v1/catalog/${store}/search?${query}`;
}

async function searchAppleCatalog(type, store, ids) {
  if (ids.length === 0) {
    return {};
  }

  const query = `${type}?ids=${ids.join(',')}`;
  const url = `https://api.music.apple.com/v1/catalog/${store}/${query}`;
  const { data } = await queryAppleMusic(url);
  const dataMap = {};
  data.forEach((row) => {
    dataMap[row.id] = row;
  });
  return dataMap;
}

const typeToApple = { single: 'songs', album: 'albums' };

module.exports = {
  formQuery,
  queryAppleMusic,
  searchAppleCatalog,
  typeToApple,
};
