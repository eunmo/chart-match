import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

import Image from './Image';
import Item from './Item';

export default function ChartEntry({ entry }) {
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
    image = (
      <Box width="50px" height="50px">
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
      </Box>
    );
  }

  return (
    <>
      {image}
      <Box fontSize="1.2em" lineHeight="50px" textAlign="center">
        {entry.ranking}
      </Box>
      <Item title={dataSource.title} subtitle={dataSource.artist} />
    </>
  );
}
