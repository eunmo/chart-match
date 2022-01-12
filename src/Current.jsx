import React, { useEffect, useState, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';

import { get } from './util';
import { useStore } from './store';
import Flag from './Flag';
import Image from './Image';
import Item from './Item';

const charts = ['us', 'jp', 'gb', 'fr', 'kr'];
const chartIds = { us: 0, jp: 1, gb: 2, fr: 4, kr: 5 };
const chartPos = {
  us: '2 / 4',
  jp: '4 / 6',
  gb: '1 / 3',
  fr: '3 / 5',
  kr: '5 / 7',
};

const flagGridSx = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  lineHeight: '25px',
  '& div': {
    height: '25px',
  },
};

export default function Current() {
  const [entries, setEntries] = useState(undefined);
  const { type } = useParams();
  const store = useStore();

  useEffect(() => {
    setEntries(undefined);
    get(`/api/chart/current/full/${type}/${store}`, setEntries);
  }, [type, store]);

  return (
    <Container maxWidth="md">
      <Box
        display="grid"
        gridTemplateColumns="50px 30px 75px 1fr"
        columnGap={1}
        rowGap={1}
        lineHeight="25px"
        marginBottom={1}
      >
        <Box sx={{ ...flagGridSx, gridColumnStart: 3 }}>
          {charts.map((chart) => (
            <Box key={chart} sx={{ gridColumn: chartPos[chart] }}>
              <Flag chart={chart} size="25" />
            </Box>
          ))}
        </Box>
        <Box
          fontSize="1.5em"
          lineHeight="50px"
          sx={{ textTransform: 'capitalize' }}
        >
          current {type}s
        </Box>
        {entries?.map((entry, index) => (
          <Fragment key={entry.id}>
            <Link href={entry.url}>
              <Image url={entry.artworkUrl} />
            </Link>
            <Box fontSize="1.2em" lineHeight="50px" textAlign="center">
              {index + 1}
            </Box>
            <Box sx={flagGridSx}>
              {charts.map((chart) => {
                const chartId = chartIds[chart];
                const rank = entry.ranks.find((r) => r.chart === chartId);
                const sx = { gridColumn: chartPos[chart] };

                if (rank === undefined) {
                  return <div key={chart} sx={sx} />;
                }

                return (
                  <Box
                    key={chart}
                    textAlign="center"
                    backgroundColor="divider"
                    sx={sx}
                  >
                    {rank.ranking}
                  </Box>
                );
              })}
            </Box>
            <Item title={entry.name} subtitle={entry.artist} />
          </Fragment>
        ))}
      </Box>
    </Container>
  );
}
