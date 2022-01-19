import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

export default function Explicit({ target }) {
  const { contentRating, name } = target.attributes;

  if (contentRating === undefined) {
    return name;
  }

  return (
    <Box display="flex">
      {name}
      <Avatar sx={{ width: '25px', height: '25px', ml: 1, fontSize: '1em' }}>
        {contentRating[0].toUpperCase()}
      </Avatar>
    </Box>
  );
}
