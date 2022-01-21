import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ArrowDownward, Assignment, Done, DoneAll } from '@mui/icons-material';

import { useStore } from './store';
import { get, put, deleteBody } from './util';
import EditInfo from './EditInfo';
import Explicit from './Explicit';
import Grid from './Grid';
import Image from './Image';
import Item from './Item';
import ManualInput from './ManualInput';
import SearchBox from './SearchBox';

export default function Edit() {
  const [keyword, setKeyword] = useState('');
  const [entries, setEntries] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const { type, chart, entry } = useParams();
  const store = useStore();

  useEffect(() => {
    get(
      `/api/chart/select/entry/${type}/${chart}/${entry}/${store}`,
      setEntries
    );
    setSearchResults(null);
  }, [chart, entry, store, type]);

  useEffect(() => {
    setKeyword('');
  }, [chart, entry, type]);

  const clear = useCallback(() => {
    deleteBody(`/api/chart/edit/${type}`, { store, entry }, () => {
      get(
        `/api/chart/select/entry/${type}/${chart}/${entry}/${store}`,
        setEntries
      );
    });
  }, [chart, entry, store, type]);

  const submitSearch = useCallback(
    (e) => {
      e.preventDefault();
      // TODO: use regex
      const normKeyword = keyword.replaceAll('/', ' ').replaceAll('?', ' ');
      get(`/api/search/${type}/${normKeyword}/${store}`, setSearchResults);
    },
    [keyword, type, store]
  );

  const fillSearchBox = useCallback(() => {
    const { raw } = entries[0];
    const newKeyword = `${raw.artist} ${raw.title}`;
    setKeyword(newKeyword);
    get(`/api/search/${type}/${newKeyword}/${store}`, setSearchResults);
  }, [entries, store, type]);

  const clearSearch = useCallback(() => {
    setKeyword('');
    setSearchResults(null);
  }, []);

  const update = useCallback(() => {
    setSearchResults(null);
    setEntries([]);
    get(
      `/api/chart/select/entry/${type}/${chart}/${entry}/${store}`,
      setEntries
    );
  }, [chart, entry, store, type]);

  const chooseEntry = useCallback(
    (target) => {
      put(`/api/chart/edit/id/${type}`, { store, entry, id: target.id }, () => {
        update();
      });
    },
    [entry, store, type, update]
  );

  const chooseEntries = useCallback(
    (target, count) => {
      const { url } = target.attributes;
      put('/api/chart/edit/singles', { store, entry, url, count }, () => {
        update();
      });
    },
    [entry, store, update]
  );

  const manualInput = useCallback(
    (ids) => {
      if (ids.length > 0) {
        put(`/api/chart/edit/ids/${type}`, { store, entry, ids }, () => {
          update();
        });
      }
    },
    [entry, store, type, update]
  );

  const searchCols = useMemo(() => {
    const postfix = '50px 50px 1fr';
    return type === 'single' ? `50px ${postfix}` : postfix;
  }, [type]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <>
      <EditInfo chart={chart} title={`edit ${type}s`} entries={entries} />
      <Box display="flex" justifyContent="space-between" mb={1}>
        <IconButton onClick={() => fillSearchBox()} size="large">
          <ArrowDownward />
        </IconButton>
        <Button color="secondary" onClick={clear}>
          Clear
        </Button>
      </Box>
      <SearchBox
        keyword={keyword}
        onChange={setKeyword}
        onSubmit={submitSearch}
        onClear={clearSearch}
      />
      {searchResults && 'Search Results:'}
      {searchResults?.data
        ?.filter((e) => e.attributes)
        .map((e) => (
          <Grid cols={searchCols} key={e.id}>
            {type === 'single' && (
              <IconButton onClick={() => setSelected(e)} size="large">
                <DoneAll />
              </IconButton>
            )}
            <IconButton onClick={() => chooseEntry(e)} size="large">
              <Done />
            </IconButton>
            <Link href={e.attributes.url}>
              <Image url={e.attributes.artwork.url} />
            </Link>
            <Item
              title={<Explicit target={e} />}
              subtitle={e.attributes.artistName}
            />
            {selected === e &&
              [2, 3, 4].map((count) => (
                <IconButton
                  key={count}
                  onClick={() => chooseEntries(e, count)}
                  size="large"
                >
                  {`+${count}`}
                </IconButton>
              ))}
          </Grid>
        ))}
      {searchResults && (
        <IconButton
          width="50px"
          component={RouterLink}
          to={`/select-songs/${chart}/${entry}`}
          size="large"
        >
          <Assignment />
        </IconButton>
      )}
      <ManualInput onSubmit={manualInput} multiple />
    </>
  );
}
