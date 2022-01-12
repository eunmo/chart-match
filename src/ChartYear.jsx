import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Clear, Loupe } from '@mui/icons-material';

import { useStore } from './store';
import { get } from './util';
import ChartRows from './ChartRows';
import Flag from './Flag';
import WeekDialog from './WeekDialog';

export default function ChartYear() {
  const [entries, setEntries] = useState(undefined);
  const [showButtons, setShowButtons] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { type, chart, year } = useParams();
  const store = useStore();

  useEffect(() => {
    setEntries(undefined);
    setOpenDialog(false);
    setShowButtons(false);
    const url = `/api/chart/select/year/${type}/${chart}/${year}/10/${store}`;
    get(url, setEntries);
  }, [type, chart, year, store]);

  return (
    <>
      <Box
        display="grid"
        gridTemplateColumns="1fr 50px auto 1fr"
        columnGap={1}
        lineHeight="50px"
      >
        <div style={{ gridColumnStart: 2 }}>
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
      </Box>
      <ChartRows
        type={type}
        chart={chart}
        entries={entries}
        showButtons={showButtons}
      />
      <WeekDialog
        handleClose={() => setOpenDialog(false)}
        week={year}
        type={type}
        chart={chart}
        open={openDialog}
      />
    </>
  );
}
