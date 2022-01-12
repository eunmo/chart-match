import React, { useCallback, useEffect, useState, Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import { Album, Clear, Done, Edit, Loupe } from '@mui/icons-material';

import { useStore } from './store';
import { get, put, deleteBody } from './util';
import Grid from './Grid';
import Header from './Header';
import Image from './Image';
import Item from './Item';
import SearchBox from './SearchBox';

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

  const startEdit = useCallback((entry) => {
    setInEdit(entry);
    setGid(entry.gid);
  }, []);

  return (
    <>
      <Header chart={store} lh={50} sx={{ textAlign: 'center' }}>
        <div>Favorite Artists</div>
        <Box textAlign="right">
          <IconButton onClick={() => setShowEdit(!showEdit)} size="large">
            {showEdit ? <Clear /> : <Loupe />}
          </IconButton>
        </Box>
      </Header>
      <SearchBox
        keyword={keyword}
        onChange={setKeyword}
        onSubmit={submitSearch}
        onClear={clearSearch}
      />
      {searchResults && 'Search Results:'}
      {searchResults?.data?.map((e) => (
        <Grid cols="50px 50px 1fr" mb={1} key={e.id}>
          <IconButton onClick={() => choose(e)} size="large">
            <Done />
          </IconButton>
          {entryToImage(e)}
          <Item
            title={e.attributes.name}
            subtitle={e.attributes.genreNames[0]}
          />
        </Grid>
      ))}
      <Grid cols="50px 1fr 50px" rg={1}>
        {entries.map((e) => (
          <Fragment key={e.id}>
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
            {showEdit ? (
              <IconButton onClick={() => startEdit(e)} size="large">
                <Edit />
              </IconButton>
            ) : (
              <div />
            )}
            {inEdit === e && (
              <>
                <div>
                  <IconButton
                    aria-label="favorites"
                    component={RouterLink}
                    to={`/favorite-albums/${e.id}`}
                    sx={{ mt: 0.5 }}
                    size="large"
                  >
                    <Album />
                  </IconButton>
                </div>
                <div style={{ gridColumn: '2 / span 2' }}>
                  <TextField
                    label="Artist Group ID"
                    value={gid}
                    onChange={(event) => setGid(event.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ m: 1 }}
                    onClick={edit}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ my: 1 }}
                    onClick={remove}
                  >
                    Remove
                  </Button>
                </div>
              </>
            )}
          </Fragment>
        ))}
      </Grid>
    </>
  );
}
