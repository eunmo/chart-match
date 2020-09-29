import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import { Clear, Edit, Loupe } from '@material-ui/icons';

import { Context } from './store';
import { get } from './util';
import Flag from './Flag';
import Image from './Image';
import Item from './Item';
import WeekDialog from './WeekDialog';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'grid',
    gridTemplateColumns: '1fr 50px auto 1fr',
    gridColumnGap: theme.spacing(1),
    lineHeight: '50px',
  },
  showGrid: {
    display: 'grid',
    gridTemplateColumns: '50px 30px 1fr',
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
  editGrid: {
    display: 'grid',
    gridTemplateColumns: '50px 30px 1fr 50px',
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
}));

export default () => {
  const [songs, setSongs] = useState(undefined);
  const [showButtons, setShowButtons] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { chart, week } = useParams();
  const [store] = useContext(Context);
  const classes = useStyles();

  useEffect(() => {
    setOpenDialog(false);
    setShowButtons(false);
    get(`/api/chart/select/single/${chart}/${week}/${store}`, setSongs);
  }, [chart, week, store]);

  async function fetchChart() {
    setSongs(undefined);
    setLoading(true);
    await fetch(`/api/chart/fetch/single/${chart}/${week}`);
    setLoading(false);
    setShowButtons(false);
    get(`/api/chart/select/single/${chart}/${week}/${store}`, setSongs);
  }

  async function matchChart() {
    setSongs(undefined);
    setLoading(true);
    await fetch(`/api/chart/match/single/${chart}/${week}/us`);
    await fetch(`/api/chart/match/single/${chart}/${week}/jp`);
    setLoading(false);
    setShowButtons(false);
    get(`/api/chart/select/single/${chart}/${week}/${store}`, setSongs);
  }

  async function fetchMatchChart() {
    setSongs(undefined);
    setLoading(true);
    await fetch(`/api/chart/fetch/single/${chart}/${week}`);
    await fetch(`/api/chart/match/single/${chart}/${week}/us`);
    await fetch(`/api/chart/match/single/${chart}/${week}/jp`);
    setLoading(false);
    setShowButtons(false);
    get(`/api/chart/select/single/${chart}/${week}/${store}`, setSongs);
  }

  const grid = showButtons ? classes.editGrid : classes.showGrid;

  return (
    <Container maxWidth="md">
      <div className={classes.header}>
        <div />
        <div>
          <Flag chart={chart} />
        </div>
        <div>
          <Button onClick={() => setOpenDialog(true)}>{week} Singles</Button>
        </div>
        <div style={{ textAlign: 'right' }}>
          <IconButton onClick={() => setShowButtons(!showButtons)}>
            {showButtons ? <Clear /> : <Loupe />}
          </IconButton>
        </div>
      </div>
      {songs?.map((song) => (
        <div className={grid} key={song.ranking + song.track}>
          {song.catalog ? (
            <Link href={song.catalog.url}>
              <Image url={song.catalog.artworkUrl} isNew={song.isNew} />
            </Link>
          ) : (
            <div />
          )}
          <div className={classes.rank}>{song.ranking}</div>
          <Item
            title={song.catalog ? song.catalog.title : song.raw.title}
            subtitle={song.catalog ? song.catalog.artist : song.raw.artist}
          />
          {showButtons && (
            <IconButton
              component={RouterLink}
              to={`/edit/single/${chart}/${song.entry}`}
            >
              <Edit />
            </IconButton>
          )}
          {showButtons &&
            song.catalog && [
              <div
                className={classes.raw}
                style={{ gridColumnStart: 2 }}
                key="raw"
              >
                Raw
              </div>,
              <div key="item">
                <Item title={song.raw.title} subtitle={song.raw.artist} />
              </div>,
            ]}
        </div>
      ))}
      {loading && (
        <div>
          <CircularProgress />
        </div>
      )}
      {(showButtons || songs?.length === 0) && !loading && (
        <ButtonGroup>
          <Button onClick={() => fetchChart()}>Fetch</Button>
          <Button onClick={() => matchChart()}>Match</Button>
          <Button onClick={() => fetchMatchChart()}>Do Both</Button>
        </ButtonGroup>
      )}
      <WeekDialog
        handleClose={() => setOpenDialog(false)}
        week={week}
        urlPrefix={`/single/${chart}`}
        open={openDialog}
      />
    </Container>
  );
};
