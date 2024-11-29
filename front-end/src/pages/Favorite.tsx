import { Header } from '@/components/Header';
import { TargetViewer } from '@/components/TargetViewer';
import { useAccount } from '@gear-js/react-hooks';
import { Box } from '@mui/material';

export function Favorite() {
  const { account } = useAccount();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header category="Favorite" />
      {account && <TargetViewer category="favorite" emptyMessage="No favorite targets" />}
      {!account && (
        <Box sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', py: 4 }}>
          Please connect your wallet to continue.
        </Box>
      )}
    </Box>
  );
}
