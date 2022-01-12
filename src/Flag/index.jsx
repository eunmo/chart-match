import React from 'react';
import { useTheme } from '@material-ui/core/styles';

import { ReactComponent as US } from './us.svg';
import { ReactComponent as JP } from './jp.svg';
import { ReactComponent as GB } from './gb.svg';
import { ReactComponent as FR } from './fr.svg';
import { ReactComponent as KR } from './kr.svg';

export default function Flag({ chart, size = 50 }) {
  const theme = useTheme();
  const Flag = { us: US, jp: JP, gb: GB, fr: FR, kr: KR }[chart];
  if (Flag === undefined) {
    return null;
  }
  const gray = theme.palette.flag;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <g>
        <Flag />
      </g>
      <polygon
        points="50,5 5,50 50,95 95,50"
        fill="none"
        stroke={gray}
        strokeWidth="7"
      />
    </svg>
  );
}
