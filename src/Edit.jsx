import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import { ArrowDownward, Done, DoneAll } from '@material-ui/icons';

import { Context } from './store';
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
  rank: {
    fontSize: '1.2em',
    lineHeight: '50px',
    textAlign: 'center',
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
}));

export default () => {
  const [keyword, setKeyword] = useState('');
  const [entries, setEntries] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const { type, chart, entry } = useParams();
  const [store] = useContext(Context);
  const classes = useStyles();

  useEffect(() => {
    get(
      `/api/chart/select/entry/${type}/${chart}/${entry}/${store}`,
      setEntries
    );
    setKeyword('');
    setSearchResults(null);
  }, [type, chart, entry, store]);

  if (entries.length === 0) {
    return null;
  }

  function clear() {
    deleteBody(`/api/chart/edit/${type}`, { store, entry }, () => {
      get(
        `/api/chart/select/entry/${type}/${chart}/${entry}/${store}`,
        setEntries
      );
    });
  }

  function submitSearch(e) {
    e.preventDefault();
    get(`/api/chart/search/${type}/${keyword}/${store}`, setSearchResults);
  }

  function fillSearchBox() {
    const { raw } = entries[0];
    const newKeyword = `${raw.artist} ${raw.title}`;
    setKeyword(newKeyword);
    get(`/api/chart/search/${type}/${newKeyword}/${store}`, setSearchResults);
  }

  function clearSearch() {
    setKeyword('');
    setSearchResults(null);
  }

  function update() {
    setKeyword('');
    setSearchResults(null);
    setEntries([]);
    get(
      `/api/chart/select/entry/${type}/${chart}/${entry}/${store}`,
      setEntries
    );
  }

  function chooseEntry(target) {
    put(`/api/chart/edit/id/${type}`, { store, entry, id: target.id }, () => {
      update();
    });
  }

  function chooseEntries(target, count) {
    const { url } = target.attributes;
    put('/api/chart/edit/singles', { store, entry, url, count }, () => {
      update();
    });
  }

  function manualInput(ids) {
    if (ids.length > 0) {
      put(`/api/chart/edit/ids/${type}`, { store, entry, ids }, () => {
        update();
      });
    }
  }

  const { raw } = entries[0];

  return (
    <Container maxWidth="md">
      <div className={classes.header}>
        <div />
        <div>
          <Flag chart={chart} />
        </div>
        <div>Edit Single</div>
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
        <IconButton onClick={() => fillSearchBox()}>
          <ArrowDownward />
        </IconButton>
        <Button color="secondary" onClick={() => clear()}>
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
      {searchResults?.data?.map((e) => (
        <div className={classes[`${type}SearchGrid`]} key={e.id}>
          {type === 'single' && (
            <IconButton onClick={() => setSelected(e)}>
              <DoneAll />
            </IconButton>
          )}
          <IconButton onClick={() => chooseEntry(e)}>
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
            [2, 3, 4].map((count) => [
              <IconButton key={count} onClick={() => chooseEntries(e, count)}>
                {`+${count}`}
              </IconButton>,
            ])}
        </div>
      ))}
      <ManualInput onSubmit={manualInput} multiple={type === 'album'} />
    </Container>
  );
};
