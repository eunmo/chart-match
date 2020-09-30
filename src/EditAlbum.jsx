import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import { ArrowDownward, Done } from '@material-ui/icons';

import { Context } from './store';
import { get, put, deleteBody } from './util';
import Explicit from './Explicit';
import Flag from './Flag';
import Image from './Image';
import Item from './Item';
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

  function fillSearchBox() {
    const { raw } = album;
    const newKeyword = `${raw.artist} ${raw.title}`;
    setKeyword(newKeyword);
    get(`/api/chart/search/album/${newKeyword}/${store}`, setSearchResults);
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
          <Link href={catalog.url} key="image">
            <Image url={catalog.artworkUrl} />
          </Link>,
          <Item key="item" title={catalog.title} subtitle={catalog.artist} />,
        ]}
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
