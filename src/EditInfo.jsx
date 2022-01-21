import { Fragment } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import Grid from './Grid';
import Header from './Header';
import Item from './Item';
import Image from './Image';

export default function EditInfo({ chart, title, entries }) {
  if (entries.length === 0) {
    return null;
  }

  const { raw } = entries[0];
  const rawIds = entries.map(({ id }) => id).filter((id) => id);

  return (
    <>
      <Header chart={chart}>
        <div style={{ fontSize: '1.5em', textTransform: 'capitalize' }}>
          {title}
        </div>
      </Header>
      <Grid cols="50px 1fr">
        <Box lineHeight="50px" textAlign="center">
          Raw
        </Box>
        <Item title={raw.title} subtitle={raw.artist} />
        {entries
          .filter(({ catalog }) => catalog)
          .map((e) => (
            <Fragment key={e.track}>
              <Link href={e.catalog.url}>
                <Image url={e.catalog.artworkUrl} />
              </Link>
              <Item title={e.catalog.title} subtitle={e.catalog.artist} />
            </Fragment>
          ))}
      </Grid>
      {rawIds.length > 0 && <div>Raw IDs: [{rawIds.join(', ')}]</div>}
    </>
  );
}
