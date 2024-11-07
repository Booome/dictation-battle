import { Link } from 'react-router-dom';

import LogoSVG from '@/assets/images/logo.svg?react';
import { Box } from '@mui/material';

export function Logo({ fontSize }: { fontSize: string }) {
  return (
    <Box
      component={Link}
      to="/"
      sx={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        textTransform: 'uppercase',
        width: 'fit-content',
        '&:visited': { color: 'inherit' },
      }}>
      <Box sx={{ width: fontSize, aspectRatio: 1 }}>
        <LogoSVG style={{ height: '100%' }} />
      </Box>
      <Box
        sx={{
          fontFamily: 'Playfair Display',
          fontSize: fontSize,
          fontWeight: 900,
          color: 'primary.main',
        }}>
        Dictation Battle
      </Box>
    </Box>
  );
}
