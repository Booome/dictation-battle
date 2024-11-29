import LogoSVG from '@/assets/images/logo.svg?react';
import { Box } from '@mui/material';

type Props = {
  category?: string;
  fontSize: string;
};

export function Logo({ category, fontSize }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        width: 'fit-content',
      }}>
      <Box
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
            position: 'relative',
            fontFamily: 'Playfair Display',
            fontSize: fontSize,
            fontWeight: 900,
            color: 'primary.main',
          }}>
          Dictation Battle
        </Box>
      </Box>

      {category && (
        <Box
          sx={{
            fontSize: `calc(${fontSize} / 3 * 2)`,
            fontStyle: 'italic',
            color: 'primary.main',
            paddingLeft: 1.5,
          }}>
          {category}
        </Box>
      )}
    </Box>
  );
}
