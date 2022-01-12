import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { Clear, Edit, Loupe } from '@mui/icons-material';

import { useStore } from './store';
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

export default function ChartYear() {
  const [entries, setEntries] = useState(undefined);
  const [showButtons, setShowButtons] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { type, chart, year } = useParams();
  const store = useStore();
  const classes = useStyles();

  useEffect(() => {
    setEntries(undefined);
    setOpenDialog(false);
    setShowButtons(false);
    const url = `/api/chart/select/year/${type}/${chart}/${year}/10/${store}`;
    get(url, setEntries);
  }, [type, chart, year, store]);

  const grid = showButtons ? classes.editGrid : classes.showGrid;

  return (
    <Container maxWidth="md">
      <div className={classes.header}>
        <div />
        <div>
          <Flag chart={chart} />
        </div>
        <div>
          <Button onClick={() => setOpenDialog(true)}>
            {year} Top 10 {type}s
          </Button>
        </div>
        <div style={{ textAlign: 'right' }}>
          <IconButton onClick={() => setShowButtons(!showButtons)} size="large">
            {showButtons ? <Clear /> : <Loupe />}
          </IconButton>
        </div>
      </div>
      {entries?.map((entry) => (
        <div className={grid} key={`${entry.entry} ${entry.track}`}>
          {entry.catalog ? (
            <Link href={entry.catalog.url}>
              <Image url={entry.catalog.artworkUrl} />
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
              size="large"
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
      <WeekDialog
        handleClose={() => setOpenDialog(false)}
        week={year}
        type={type}
        chart={chart}
        open={openDialog}
      />
    </Container>
  );
}
