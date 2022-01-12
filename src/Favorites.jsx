import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import { Album, Clear, Done, Edit, Loupe } from '@mui/icons-material';

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

function getAlbum(e) {
  const { data } = e.relationships.albums;
  if (data.length === 0) {
    return null;
  }

  const { attributes: album } = data[0];
  return album;
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

  const submitSearch = useCallback(
    (e) => {
      e.preventDefault();
      get(`/api/search/artist/${keyword}/${store}`, setSearchResults);
    },
    [keyword, store]
  );

  const clearSearch = useCallback(() => {
    setKeyword('');
    setSearchResults(null);
  }, []);

  const update = useCallback(() => {
    setKeyword('');
    setSearchResults(null);
    setInEdit(null);
    setEntries([]);
    get(`/api/favorite-artist/list/${store}`, setEntries);
  }, [store]);

  const choose = useCallback(
    (target) => {
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
    },
    [store, update]
  );

  const remove = useCallback(() => {
    const { id } = inEdit;
    deleteBody(`/api/favorite-artist`, { store, id }, () => {
      update();
    });
  }, [inEdit, store, update]);

  const edit = useCallback(() => {
    const { id } = inEdit;
    put(`/api/favorite-artist/edit`, { store, id, gid }, () => {
      update();
    });
  }, [inEdit, gid, store, update]);

  return (
    <>
      <div className={classes.header}>
        <div className={classes.headerText}>Favorite Artists</div>
        <IconButton onClick={() => setShowEdit(!showEdit)} size="large">
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
          <IconButton onClick={() => choose(e)} size="large">
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
              size="large"
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
                size="large"
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
    </>
  );
}
