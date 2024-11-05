import { Wallet } from '@gear-js/wallet-connect';
import { Box } from '@mui/material';
import { Logo } from './Logo';

export function Header() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: '15px 30px',
      }}>
      <Logo />
      <Wallet />
    </Box>
  );
}
