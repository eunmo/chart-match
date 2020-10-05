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
  const [entries, setEntries] = useState(undefined);
  const [showButtons, setShowButtons] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { type, chart, week } = useParams();
  const [store] = useContext(Context);
  const classes = useStyles();

  useEffect(() => {
    setOpenDialog(false);
    setShowButtons(false);
    get(`/api/chart/select/week/${type}/${chart}/${week}/${store}`, setEntries);
  }, [type, chart, week, store]);

  async function fetchChart() {
    setEntries(undefined);
    setLoading(true);
    await fetch(`/api/chart/fetch/${type}/${chart}/${week}`);
    setLoading(false);
    setShowButtons(false);
    get(`/api/chart/select/week/${type}/${chart}/${week}/${store}`, setEntries);
  }

  async function matchChart() {
    setEntries(undefined);
    setLoading(true);
    await fetch(`/api/chart/match/${type}/${chart}/${week}/us`);
    await fetch(`/api/chart/match/${type}/${chart}/${week}/jp`);
    setLoading(false);
    setShowButtons(false);
    get(`/api/chart/select/week/${type}/${chart}/${week}/${store}`, setEntries);
  }

  async function fetchMatchChart() {
    setEntries(undefined);
    setLoading(true);
    await fetch(`/api/chart/fetch/${type}/${chart}/${week}`);
    await fetch(`/api/chart/match/${type}/${chart}/${week}/us`);
    await fetch(`/api/chart/match/${type}/${chart}/${week}/jp`);
    setLoading(false);
    setShowButtons(false);
    get(`/api/chart/select/week/${type}/${chart}/${week}/${store}`, setEntries);
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
      {entries?.map((entry) => (
        <div className={grid} key={`${entry.entry} ${entry.track}`}>
          {entry.catalog ? (
            <Link href={entry.catalog.url}>
              <Image url={entry.catalog.artworkUrl} isNew={entry.isNew} />
            </Link>
          ) : (
            <div />
          )}
          <div className={classes.rank}>{entry.ranking}</div>
          <Item
            title={entry.catalog ? entry.catalog.title : entry.raw.title}
            subtitle={entry.catalog ? entry.catalog.artist : entry.raw.artist}
          />
          {showButtons && (
            <IconButton
              component={RouterLink}
              to={`/edit/${type}/${chart}/${entry.entry}`}
            >
              <Edit />
            </IconButton>
          )}
          {showButtons &&
            entry.catalog && [
              <div
                className={classes.raw}
                style={{ gridColumnStart: 2 }}
                key="raw"
              >
                Raw
              </div>,
              <div key="item">
                <Item title={entry.raw.title} subtitle={entry.raw.artist} />
              </div>,
            ]}
        </div>
      ))}
      {loading && (
        <div>
          <CircularProgress />
        </div>
      )}
      {(showButtons || entries?.length === 0) && !loading && (
        <ButtonGroup>
          <Button onClick={() => fetchChart()}>Fetch</Button>
          <Button onClick={() => matchChart()}>Match</Button>
          <Button onClick={() => fetchMatchChart()}>Do Both</Button>
        </ButtonGroup>
      )}
      <WeekDialog
        handleClose={() => setOpenDialog(false)}
        week={week}
        urlPrefix={`/${type}/${chart}`}
        open={openDialog}
      />
    </Container>
  );
};
