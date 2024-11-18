import { useAccount } from '@gear-js/react-hooks';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { HostBattleModal } from './HostBattleModal';

type Props = {
  onSucceed: () => void;
};

export function HostBattleButton({ onSucceed: onHostBattleFinish }: Props) {
  const [hostBattleModalOpen, setHostBattleModalOpen] = useState(false);
  const { account } = useAccount();

  const handleHostBattle = () => {
    setHostBattleModalOpen(true);
  };

  useEffect(() => {
    if (!hostBattleModalOpen) {
      onHostBattleFinish();
    }
  }, [hostBattleModalOpen]);

  return (
    <>
      <Button
        variant="outlined"
        disabled={!account}
        onClick={handleHostBattle}
        sx={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          border: '3px solid #000',
          margin: '0 auto',
          marginBottom: '1rem',
        }}>
        Host a Battle
      </Button>
      <HostBattleModal open={hostBattleModalOpen} onClose={() => setHostBattleModalOpen(false)} />
    </>
  );
}
