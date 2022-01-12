import React, { useMemo, Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Edit } from '@mui/icons-material';

import ChartEntry from './ChartEntry';
import Grid from './Grid';
import Item from './Item';

export default function ChartRows({ type, chart, entries, showButtons }) {
  const columns = useMemo(() => {
    const prefix = '50px 30px 1fr';
    return showButtons ? `${prefix} 50px` : prefix;
  }, [showButtons]);

  return (
    <Grid cols={columns}>
      {entries?.map((entry) => (
        <Fragment key={`${entry.entry} ${entry.track}`}>
          <ChartEntry entry={entry} />
          {showButtons && (
            <IconButton
              component={RouterLink}
              to={`/edit/${type}/${chart}/${entry.entry}`}
              size="large"
            >
              <Edit />
            </IconButton>
          )}
          {showButtons && entry.catalog && (
            <>
              <Box
                lineHeight="50px"
                textAlign="center"
                sx={{ gridColumnStart: 2 }}
              >
                Raw
              </Box>
              <Item title={entry.raw.title} subtitle={entry.raw.artist} />
              <div />
            </>
          )}
        </Fragment>
      ))}
    </Grid>
  );
}
