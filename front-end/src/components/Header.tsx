import { Box, Divider } from '@mui/material';
import { Logo } from './Logo';
import { Wallet } from './Wallet';

function getFormattedDate() {
  const date = new Date();
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function HomePageHeader() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <Box sx={{ margin: '0 auto' }}>
          <Logo fontSize="5rem" />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            padding: '0.5rem',
          }}>
          <Wallet fontSize="0.75rem" direction="column" />
        </Box>
      </Box>
      <Divider sx={{ borderWidth: '1px', borderColor: 'primary.main' }} />
      <Box sx={{ textAlign: 'center', textTransform: 'uppercase', paddingY: '0.5rem' }}>{getFormattedDate()}</Box>
      <Divider sx={{ borderWidth: '1px', borderColor: 'primary.main' }} />
    </Box>
  );
}
