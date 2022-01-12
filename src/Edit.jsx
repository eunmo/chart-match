import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ArrowDownward, Assignment, Done, DoneAll } from '@mui/icons-material';

import { useStore } from './store';
import { get, put, deleteBody } from './util';
import Explicit from './Explicit';
import Flag from './Flag';
import Image from './Image';
import Item from './Item';
import ManualInput from './ManualInput';
import SearchBox from './SearchBox';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'grid',
    gridTemplateColumns: '1fr 50px auto 1fr',
    gridColumnGap: theme.spacing(1),
    fontSize: '1.5em',
    lineHeight: '50px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '50px 1fr',
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
  raw: {
    lineHeight: '50px',
    textAlign: 'center',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  singleSearchGrid: {
    display: 'grid',
    gridTemplateColumns: '50px 50px 50px 1fr',
    gridRowGap: theme.spacing(1),
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
  albumSearchGrid: {
    display: 'grid',
    gridTemplateColumns: '50px 50px 1fr',
    gridRowGap: theme.spacing(1),
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
  assignment: {
    width: '50px',
  },
}));

export default function Edit() {
  const [keyword, setKeyword] = useState('');
  const [entries, setEntries] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const { type, chart, entry } = useParams();
  const store = useStore();
  const classes = useStyles();

  useEffect(() => {
    get(
      `/api/chart/select/entry/${type}/${chart}/${entry}/${store}`,
      setEntries
    );
    setKeyword('');
    setSearchResults(null);
  }, [chart, entry, store, type]);

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
      get(`/api/search/${type}/${keyword}/${store}`, setSearchResults);
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
    setKeyword('');
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

  if (entries.length === 0) {
    return null;
  }

  const { raw } = entries[0];

  return (
    <>
      <div className={classes.header}>
        <div />
        <div>
          <Flag chart={chart} />
        </div>
        <div style={{ textTransform: 'capitalize' }}>{`Edit ${type}`}</div>
      </div>
      <div className={classes.grid}>
        <div className={classes.raw}>Raw</div>
        <Item title={raw.title} subtitle={raw.artist} />
        {entries
          .filter(({ catalog }) => catalog)
          .map((e) => [
            <Link href={e.catalog.url} key={`${e.track} image`}>
              <Image url={e.catalog.artworkUrl} />
            </Link>,
            <Item
              key={`${e.track} item`}
              title={e.catalog.title}
              subtitle={e.catalog.artist}
            />,
          ])}
      </div>
      <div className={classes.buttons}>
        <IconButton onClick={() => fillSearchBox()} size="large">
          <ArrowDownward />
        </IconButton>
        <Button color="secondary" onClick={clear}>
          Clear
        </Button>
      </div>
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
          <div className={classes[`${type}SearchGrid`]} key={e.id}>
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
          </div>
        ))}
      {searchResults && (
        <IconButton
          className={classes.assignment}
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
