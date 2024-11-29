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
            right: 0,
            bottom: 0,
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

export function Header({ category }: { category?: string }) {
  return (
    <>
      <Box
        sx={{
          position: 'relative',
        }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem',
          }}>
          <Logo category={category} fontSize="2.5rem"></Logo>
          <Wallet fontSize="0.75rem" direction="row" />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            textTransform: 'uppercase',
            paddingY: '0.5rem',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 1.2,
          }}>
          {getFormattedDate()}
        </Box>
      </Box>

      <Divider sx={{ borderWidth: '1px', borderColor: 'primary.main' }} />
    </>
  );
}
