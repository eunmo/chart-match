import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';

import Image from './Image';
import Item from './Item';

const useStyles = makeStyles(() => ({
  rank: {
    fontSize: '1.2em',
    lineHeight: '50px',
    textAlign: 'center',
  },
}));

export default ({ entry }) => {
  const classes = useStyles();

  let image = <div />;
  let dataSource = entry.raw;

  if (entry.catalog) {
    dataSource = entry.catalog;
    image = (
      <Link href={entry.catalog.url}>
        <Image url={entry.catalog.artworkUrl} isNew={entry.isNew} />
      </Link>
    );
  } else if (entry.id !== null) {
    const size = 50;
    image = (
      <div style={{ width: size, height: size }}>
        <svg viewBox="0 0 70 70" style={{ width: '100%' }}>
          <polygon
            points="0,20 0,50 20,70 50,70 70,50 70,20 50,0 20,0"
            style={{ fill: 'red', stroke: 'none' }}
          />
          <text
            x={35}
            y={35}
            style={{
              dominantBaseline: 'central',
              textAnchor: 'middle',
              fontSize: '50px',
              fontWeight: 'bold',
              fill: 'white',
            }}
          >
            ?
          </text>
        </svg>
      </div>
    );
  }

  return (
    <>
      {image}
      <div className={classes.rank}>{entry.ranking}</div>
      <Item title={dataSource.title} subtitle={dataSource.artist} />
    </>
  );
};
