import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Clear, Done, Search } from '@material-ui/icons';

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
    marginTop: theme.spacing(1),
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
    gridTemplateColumns: '50px 50px 1fr',
    gridRowGap: theme.spacing(1),
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
}));

export default () => {
  const [keyword, setKeyword] = useState('');
  const [album, setAlbum] = useState(undefined);
  const [searchResults, setSearchResults] = useState(null);
  const { chart, entry } = useParams();
  const [store] = useContext(Context);
  const classes = useStyles();

  useEffect(() => {
    get(`/api/chart/select/album-entry/${chart}/${entry}/${store}`, setAlbum);
    setKeyword('');
    setSearchResults(null);
  }, [chart, entry, store]);

  if (album === undefined) {
    return null;
  }

  function clear() {
    deleteBody('/api/chart/edit/album', { store, entry }, () => {
      get(`/api/chart/select/album-entry/${chart}/${entry}/${store}`, setAlbum);
    });
  }

  function submitSearch(e) {
    e.preventDefault();
    get(`/api/chart/search/album/${keyword}/${store}`, setSearchResults);
  }

  function clearSearch() {
    setKeyword('');
    setSearchResults(null);
  }

  function chooseAlbum(selected) {
    put('/api/chart/edit/album', { store, entry, id: selected.id }, () => {
      setKeyword('');
      setSearchResults(null);
      setAlbum(undefined);
      get(`/api/chart/select/album-entry/${chart}/${entry}/${store}`, setAlbum);
    });
  }

  const { catalog, raw } = album;

  return (
    <Container maxWidth="md">
      <div className={classes.header}>
        <div />
        <div>
          <Flag chart={chart} />
        </div>
        <div>Edit Album</div>
      </div>
      <div className={classes.grid}>
        <div className={classes.raw}>Raw</div>
        <Item title={raw.title} subtitle={raw.artist} />
        {catalog && [
          <Image key="image" url={catalog.url} />,
          <Item key="item" title={catalog.title} subtitle={catalog.artist} />,
        ]}
      </div>
      <Button color="secondary" onClick={() => clear()}>
        Clear
      </Button>
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
      {searchResults?.data?.map((searchedAlbum) => (
        <div className={classes.searchGrid} key={searchedAlbum.id}>
          <IconButton onClick={() => chooseAlbum(searchedAlbum)}>
            <Done />
          </IconButton>
          <Link href={searchedAlbum.attributes.url}>
            <Image url={searchedAlbum.attributes.artwork.url} />
          </Link>
          <Item
            title={<Explicit target={searchedAlbum} />}
            subtitle={searchedAlbum.attributes.artistName}
          />
        </div>
      ))}
    </Container>
  );
};