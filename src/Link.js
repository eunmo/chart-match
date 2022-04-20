import { Link as RouterLink } from 'react-router-dom';
import MuiLink from '@mui/material/Link';

export default function Link({ to, children }) {
  return (
    <MuiLink to={to} component={RouterLink} color="inherit" underline="none">
      {children}
    </MuiLink>
  );
}
