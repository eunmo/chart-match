import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import {
  ArrowDownward,
  Clear,
  Done,
  DoneAll,
  Search,
} from '@material-ui/icons';

import { Context } from './store';
import { get, put, deleteBody } from './util';
import Explicit from './Explicit';
import Flag from './Flag';
import Image from './Image';
import Item from './Item';

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
  searchBox: {
    padding: '2px 4px',
    display: 'flex',
    flexGrow: 1,
    marginBottom: theme.spacing(1),
  },
  input: {
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  searchGrid: {
    display: 'grid',
    gridTemplateColumns: '50px 50px 50px 1fr',
    gridRowGap: theme.spacing(1),
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
}));

export default () => {
  const [keyword, setKeyword] = useState('');
  const [songs, setSongs] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const { chart, entry } = useParams();
  const [store] = useContext(Context);
  const classes = useStyles();

  useEffect(() => {
    get(`/api/chart/select/single-entry/${chart}/${entry}/${store}`, setSongs);
    setKeyword('');
    setSearchResults(null);
  }, [chart, entry, store]);

  if (songs.length === 0) {
    return null;
  }

  function clear() {
    deleteBody('/api/chart/edit/single', { store, entry }, () => {
      get(
        `/api/chart/select/single-entry/${chart}/${entry}/${store}`,
        setSongs
      );
    });
  }

  function submitSearch(e) {
    e.preventDefault();
    get(`/api/chart/search/single/${keyword}/${store}`, setSearchResults);
  }

  function fillSearchBox() {
    const { raw } = songs[0];
    const newKeyword = `${raw.artist} ${raw.title}`;
    setKeyword(newKeyword);
    get(`/api/chart/search/single/${newKeyword}/${store}`, setSearchResults);
  }

  function clearSearch() {
    setKeyword('');
    setSearchResults(null);
  }

  function chooseSong(song) {
    put('/api/chart/edit/single', { store, entry, id: song.id }, () => {
      setKeyword('');
      setSearchResults(null);
      setSongs([]);
      get(
        `/api/chart/select/single-entry/${chart}/${entry}/${store}`,
        setSongs
      );
    });
  }

  function chooseSongs(song, count) {
    const { url } = song.attributes;
    put('/api/chart/edit/singles', { store, entry, url, count }, () => {
      setKeyword('');
      setSearchResults(null);
      setSongs([]);
      get(
        `/api/chart/select/single-entry/${chart}/${entry}/${store}`,
        setSongs
      );
    });
  }

  const { raw } = songs[0];

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
        {songs
          .filter(({ catalog }) => catalog)
          .map((song) => [
            <Link href={song.catalog.url} key={`${song.track} image`}>
              <Image url={song.catalog.artworkUrl} />
            </Link>,
            <Item
              key={`${song.track} item`}
              title={song.catalog.title}
              subtitle={song.catalog.artist}
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
      <Paper
        component="form"
        variant="outlined"
        className={classes.searchBox}
        onSubmit={(e) => submitSearch(e)}
      >
        <IconButton
          type="submit"
          className={classes.iconButton}
          aria-label="search"
        >
          <Search />
        </IconButton>
        <InputBase
          className={classes.input}
          placeholder="Search Apple Music"
          value={keyword}
          onChange={({ target }) => setKeyword(target.value)}
          inputProps={{ 'aria-label': 'search apple music' }}
        />
        <IconButton
          className={classes.iconButton}
          aria-label="clear search"
          onClick={clearSearch}
        >
          <Clear />
        </IconButton>
      </Paper>
      {searchResults && 'Search Results:'}
      {searchResults?.data?.map((song) => (
        <div className={classes.searchGrid} key={song.id}>
          <IconButton onClick={() => setSelected(song)}>
            <DoneAll />
          </IconButton>
          <IconButton onClick={() => chooseSong(song)}>
            <Done />
          </IconButton>
          <Link href={song.attributes.url}>
            <Image url={song.attributes.artwork.url} />
          </Link>
          <Item
            title={<Explicit target={song} />}
            subtitle={song.attributes.artistName}
          />
          {selected === song &&
            [2, 3, 4].map((count) => [
              <IconButton key={count} onClick={() => chooseSongs(song, count)}>
                {`+${count}`}
              </IconButton>,
            ])}
        </div>
      ))}
    </Container>
  );
};
