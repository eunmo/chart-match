import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';

import { get } from './util';
import { useStore } from './store';
import Flag from './Flag';
import Image from './Image';
import Item from './Item';

const useStyles = makeStyles((theme) => ({
  header: {
    fontSize: '1.5em',
    lineHeight: '50px',
    textTransform: 'capitalize',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '50px 30px 75px 1fr',
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
  flagGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    lineHeight: '25px',
    '& div': {
      height: '25px',
    },
  },
  us: {
    gridColumn: '2 / 4',
  },
  jp: {
    gridColumn: '4 / 6',
  },
  gb: {
    gridColumn: '1 / 3',
  },
  fr: {
    gridColumn: '3 / 5',
  },
  kr: {
    gridColumn: '5 / 7',
  },
  index: {
    fontSize: '1.2em',
    lineHeight: '50px',
    textAlign: 'center',
  },
  rank: {
    textAlign: 'center',
    backgroundColor: theme.palette.divider,
  },
}));

const charts = ['us', 'jp', 'gb', 'fr', 'kr'];
const chartIds = { us: 0, jp: 1, gb: 2, fr: 4, kr: 5 };

export default function Current() {
  const [entries, setEntries] = useState(undefined);
  const { type } = useParams();
  const store = useStore();
  const classes = useStyles();

  useEffect(() => {
    setEntries(undefined);
    get(`/api/chart/current/full/${type}/${store}`, setEntries);
  }, [type, store]);

  return (
    <Container maxWidth="md">
      <div className={classes.grid}>
        <div />
        <div />
        <div className={classes.flagGrid}>
          {charts.map((chart) => (
            <div key={chart} className={classes[chart]}>
              <Flag chart={chart} size="25" />
            </div>
          ))}
        </div>
        <div className={classes.header}>current {type}s</div>
      </div>
      {entries?.map((entry, index) => (
        <div className={classes.grid} key={entry.id}>
          <Link href={entry.url}>
            <Image url={entry.artworkUrl} />
          </Link>
          <div className={classes.index}>{index + 1}</div>
          <div className={classes.flagGrid}>
            {charts.map((chart) => {
              const chartId = chartIds[chart];
              const rank = entry.ranks.find((r) => r.chart === chartId);

              if (rank === undefined) {
                return <div key={chart} className={classes[chart]} />;
              }

              return (
                <div
                  key={chart}
                  className={`${classes.rank} ${classes[chart]}`}
                >
                  {rank.ranking}
                </div>
              );
            })}
          </div>
          <Item title={entry.name} subtitle={entry.artist} />
        </div>
      ))}
    </Container>
  );
}
