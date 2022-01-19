import Box from '@mui/material/Box';

export default function Grid({
  cols,
  cg = 1,
  rg = 1,
  lh = 25,
  mb = 1,
  sx = {},
  children,
}) {
  return (
    <Box
      display="grid"
      gridTemplateColumns={cols}
      columnGap={cg}
      rowGap={rg}
      mb={mb}
      lineHeight={`${lh}px`}
      sx={sx}
    >
      {children}
    </Box>
  );
}
