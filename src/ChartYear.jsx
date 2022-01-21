import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Clear, Loupe, QuestionMark } from '@mui/icons-material';

import { useStore } from './store';
import { get } from './util';
import ChartRows from './ChartRows';
import Flag from './Flag';
import Grid from './Grid';
import WeekDialog from './WeekDialog';

export default function ChartYear() {
  const [entries, setEntries] = useState(undefined);
  const [showButtons, setShowButtons] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { type, chart, year } = useParams();
  const store = useStore();

  useEffect(() => {
    setEntries(undefined);
    setOpenDialog(false);
    setShowButtons(false);
    setShowMissing(false);
    const url = `/api/chart/select/year/${type}/${chart}/${year}/10/${store}`;
    get(url, setEntries);
  }, [type, chart, year, store]);

  const missing = useMemo(
    () => (entries ?? []).filter(({ catalog, id }) => !catalog && id),
    [entries]
  );

  const displayEntries = showMissing ? missing : entries;

  return (
    <>
      <Grid cols="1fr 50px auto 1fr" lh={50} mb={0}>
        <div>
          {missing && (
            <IconButton
              onClick={() => setShowMissing(!showMissing)}
              size="large"
            >
              <QuestionMark />
            </IconButton>
          )}
        </div>
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
      </Grid>
      <ChartRows
        type={type}
        chart={chart}
        entries={displayEntries}
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
