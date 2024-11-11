import { useContract } from '@/hocs/ContractProvider';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { Box, Button, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Battles.module.scss';

export function Battles() {
  const { api } = useApi();
  const navigate = useNavigate();
  const { account } = useAccount();
  const contract = useContract();

  const [ongoingBattles, setOngoingBattles] = useState<[]>([]);

  useEffect(() => {
    if (account?.meta.source && api) {
      (async () => {
        try {
          contract.setApi(api);
          await contract.services.DictationBattle.queries.GetBattles(account.address, undefined, undefined, 0, 10);
        } catch (error) {
          console.error('error:', error);
        }
      })();
    } else {
      setOngoingBattles([]);
    }
  }, [account, api]);

  return (
    <Box sx={{ p: '0 7rem' }}>
      <Button
        variant="contained"
        sx={{ display: 'block', margin: '1rem auto' }}
        onClick={() => navigate('/create-battle')}>
        Host a Battle
      </Button>

      <Divider>Ongoing Battles</Divider>
      <BattleList />
    </Box>
  );
}

function BattleList() {
  return (
    <div className={styles.battleList}>
      <table className={styles.battleTable}>
        <thead>
          <tr>
            <th>No.</th>
            <th>Status</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Player Count</th>
            <th>Host</th>
          </tr>
        </thead>
        <tbody>{/* Battle rows will be added here */}</tbody>
      </table>
    </div>
  );
}
