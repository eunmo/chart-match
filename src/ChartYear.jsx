import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Clear, Loupe } from '@mui/icons-material';

import { useStore } from './store';
import { get } from './util';
import ChartRows from './ChartRows';
import Header from './Header';
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
      <Header chart={chart}>
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
      </Header>
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
