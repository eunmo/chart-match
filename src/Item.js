import Box from '@mui/material/Box';

const ellipsisSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export default function Item({ title, subtitle }) {
  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Box sx={{ ...ellipsisSx, color: 'text.primary' }}>{title}</Box>
      <Box sx={{ ...ellipsisSx, color: 'text.secondary' }}>{subtitle}</Box>
    </Box>
  );
}
