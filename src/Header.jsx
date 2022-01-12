import React from 'react';

import Flag from './Flag';
import Grid from './Grid';

export default function Header({ chart, children }) {
  return (
    <Grid cols="1fr 50px auto 1fr" lh={50} mb={0}>
      <div style={{ gridColumnStart: 2 }}>
        <Flag chart={chart} />
      </div>
      {children}
    </Grid>
  );
}
