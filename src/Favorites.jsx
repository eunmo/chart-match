import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import { Album, Clear, Done, Edit, Loupe } from '@material-ui/icons';

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
    '& button': {
      marginTop: theme.spacing(1),
      marginLeft: theme.spacing(1),
    },
  },
}));

export default function Favorites() {
  const [showEdit, setShowEdit] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [entries, setEntries] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [inEdit, setInEdit] = useState(null);
  const [gid, setGid] = useState('');
  const store = useStore();
  const classes = useStyles();

  useEffect(() => {
    get(`/api/favorite-artist/list/${store}`, setEntries);
    setKeyword('');
    setSearchResults(null);
    setInEdit(null);
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
    setInEdit(null);
    setEntries([]);
    get(`/api/favorite-artist/list/${store}`, setEntries);
  }

  function getAlbum(e) {
    const { data } = e.relationships.albums;
    if (data.length === 0) {
      return null;
    }

    const { attributes: album } = data[0];
    return album;
  }

  function choose(target) {
    const { id } = target;
    const { name, url } = target.attributes;
    let artwork = null;
    const album = getAlbum(target);
    if (album) {
      ({ url: artwork } = album.artwork);
    }
    put(`/api/favorite-artist/add`, { store, id, name, url, artwork }, () => {
      update();
    });
  }

  function remove() {
    const { id } = inEdit;
    deleteBody(`/api/favorite-artist`, { store, id }, () => {
      update();
    });
  }

  function edit() {
    const { id } = inEdit;
    put(`/api/favorite-artist/edit`, { store, id, gid }, () => {
      update();
    });
  }

  function entryToImage(e) {
    const album = getAlbum(e);
    if (album === null) {
      return <div />;
    }

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
        <IconButton onClick={() => setShowEdit(!showEdit)}>
          {showEdit ? <Clear /> : <Loupe />}
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
          {e.artwork ? (
            <Link href={e.url}>
              <Image url={e.artwork} />
            </Link>
          ) : (
            <div />
          )}
          <Item
            title={e.name}
            subtitle={`${e.gid} (${e.gidSongCount} Songs)`}
          />
          {showEdit && (
            <IconButton
              onClick={() => {
                setInEdit(e);
                setGid(e.gid);
              }}
            >
              <Edit />
            </IconButton>
          )}
          {inEdit === e && [
            <div key="edit artist albums">
              <IconButton
                aria-label="favorites"
                component={RouterLink}
                to={`/favorite-albums/${e.id}`}
              >
                <Album />
              </IconButton>
            </div>,
            <div key="edit artist">
              <TextField
                label="Artist Group ID"
                value={gid}
                onChange={(event) => setGid(event.target.value)}
              />
              <Button variant="contained" color="primary" onClick={edit}>
                Edit
              </Button>
              <Button variant="contained" color="secondary" onClick={remove}>
                Remove
              </Button>
            </div>,
          ]}
        </div>
      ))}
    </Container>
  );
}
