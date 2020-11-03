import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import { Clear, Done, Loupe } from '@material-ui/icons';

import { useStore } from './store';
import { get, put, deleteBody } from './util';
import Image from './Image';
import Item from './Item';
import SearchBox from './SearchBox';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'grid',
    gridTemplateColumns: '50px 1fr 50px',
    fontSize: '1.5em',
    lineHeight: '50px',
    textAlign: 'center',
  },
  headerText: {
    gridColumn: '2/3',
  },
  searchGrid: {
    display: 'grid',
    gridTemplateColumns: '50px 50px 1fr',
    gridRowGap: theme.spacing(1),
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
  entryGrid: {
    display: 'grid',
    gridTemplateColumns: '50px 1fr 50px',
    gridRowGap: theme.spacing(1),
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
}));

export default () => {
  const [showDelete, setShowDelete] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [entries, setEntries] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const store = useStore();
  const classes = useStyles();

  useEffect(() => {
    get(`/api/favorite-artists/${store}`, setEntries);
    setKeyword('');
    setSearchResults(null);
  }, [store]);

  function submitSearch(e) {
    e.preventDefault();
    get(`/api/search/artist/${keyword}/${store}`, setSearchResults);
  }

  function clearSearch() {
    setKeyword('');
    setSearchResults(null);
  }

  function update() {
    setKeyword('');
    setSearchResults(null);
    setEntries([]);
    get(`/api/favorite-artists/${store}`, setEntries);
  }

  function choose(target) {
    put(`/api/favorite-artists`, { store, id: target.id }, () => {
      update();
    });
  }

  function remove(target) {
    deleteBody(`/api/favorite-artists`, { store, id: target.id }, () => {
      update();
    });
  }

  function entryToImage(e) {
    const { attributes: album } = e.relationships.albums.data[0];

    return (
      <Link href={e.attributes.url}>
        <Image url={album.artwork.url} />
      </Link>
    );
  }

  return (
    <Container maxWidth="md">
      <div className={classes.header}>
        <div className={classes.headerText}>Favorite Artists</div>
        <IconButton onClick={() => setShowDelete(!showDelete)}>
          {showDelete ? <Clear /> : <Loupe />}
        </IconButton>
      </div>
      <SearchBox
        keyword={keyword}
        onChange={setKeyword}
        onSubmit={submitSearch}
        onClear={clearSearch}
      />
      {searchResults && 'Search Results:'}
      {searchResults?.data?.map((e) => (
        <div className={classes.searchGrid} key={e.id}>
          <IconButton onClick={() => choose(e)}>
            <Done />
          </IconButton>
          {entryToImage(e)}
          <Item
            title={e.attributes.name}
            subtitle={e.attributes.genreNames[0]}
          />
        </div>
      ))}
      {entries.map((e) => (
        <div className={classes.entryGrid} key={e.id}>
          {entryToImage(e)}
          <Item
            title={e.attributes.name}
            subtitle={e.attributes.genreNames[0]}
          />
          {showDelete && (
            <IconButton onClick={() => remove(e)}>
              <Clear />
            </IconButton>
          )}
        </div>
      ))}
    </Container>
  );
};
