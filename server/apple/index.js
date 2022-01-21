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

const QUERY_LIMIT = 100;

async function searchAppleCatalogHelper(url) {
  const dataMap = {};
  const { data } = await queryAppleMusic(url);
  data.forEach((row) => {
    dataMap[row.id] = row;
  });
  return dataMap;
}

async function searchAppleCatalog(type, store, ids) {
  if (ids.length === 0) {
    return {};
  }

  const queries = [];
  for (let i = 0; i < ids.length; i += QUERY_LIMIT) {
    const idSlice = ids.slice(i, i + QUERY_LIMIT);
    const query = `${type}?ids=${idSlice.join(',')}`;
    const url = `https://api.music.apple.com/v1/catalog/${store}/${query}`;
    queries.push(searchAppleCatalogHelper(url));
  }

  const results = await Promise.all(queries);

  return Object.assign({}, ...results);
}

const typeToApple = { single: 'songs', album: 'albums' };

module.exports = {
  formQuery,
  queryAppleMusic,
  searchAppleCatalog,
  typeToApple,
};
