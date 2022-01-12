import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as MuiLink } from '@material-ui/core/Link';

export default function Link({ to, children }) {
  return (
    <MuiLink to={to} component={RouterLink} color="inherit" underline="none">
      {children}
    </MuiLink>
  );
}
