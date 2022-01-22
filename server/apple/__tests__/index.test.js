const { formQuery, queryAppleMusic, searchAppleCatalog } = require('..');

const store = 'us';
const data = {
  songs: [
    { keyword: 'Ed Sheeran Bad Habits', id: '1571330212' },
    { keyword: 'AKMU (악뮤) 낙하 (with 아이유)', id: '1577524107' },
    { keyword: '優里 ドライフラワー', id: '1534620183' },
  ],
  albums: [
    { keyword: "Dave We're All Alone In This Together", id: '1575534808' },
    { keyword: 'SWITCH ON 아스트로(ASTRO)', id: '1578841980' },
    { keyword: 'コブクロ Star Made', id: '1573780747' },
  ],
};

describe.each(['songs', 'albums'])('%s', (type) => {
  const testData = data[type];

  test.each(testData)('search apple music', async ({ keyword, id }) => {
    const query = formQuery(store, keyword, type, true);
    const result = await queryAppleMusic(query);

    const entry = result?.results?.[type]?.data?.[0];
    expect(entry).toBeTruthy();
    expect(entry.id).toBe(id);
  });

  test('search apple catalog', async () => {
    const ids = testData.map(({ id }) => id);
    const result = await searchAppleCatalog(type, store, ids);

    testData.forEach(({ id }) => {
      expect(result[id]).toBeTruthy();
    });
  });

  test('search apple catalog long', async () => {
    const ids = testData.map(({ id }) => id);
    const longIds = ids.flatMap((id) => Array(50).fill(id));
    const result = await searchAppleCatalog(type, store, longIds);

    testData.forEach(({ id }) => {
      expect(result[id]).toBeTruthy();
    });
  });
});
