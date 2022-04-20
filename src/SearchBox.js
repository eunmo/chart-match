import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { Clear, Search } from '@mui/icons-material';

const buttonSx = { padding: '10px' };

export default function SearchBox({ keyword, onChange, onSubmit, onClear }) {
  return (
    <Paper
      component="form"
      variant="outlined"
      sx={{
        padding: '2px 4px',
        display: 'flex',
        flexGrow: 1,
        marginBottom: 1,
      }}
      onSubmit={onSubmit}
    >
      <IconButton type="submit" sx={buttonSx} aria-label="search" size="large">
        <Search />
      </IconButton>
      <InputBase
        sx={{ flex: 1 }}
        placeholder="Search Apple Music"
        value={keyword}
        onChange={({ target }) => onChange(target.value)}
        inputProps={{ 'aria-label': 'search apple music' }}
      />
      <IconButton
        sx={buttonSx}
        aria-label="clear search"
        onClick={onClear}
        size="large"
      >
        <Clear />
      </IconButton>
    </Paper>
  );
}
