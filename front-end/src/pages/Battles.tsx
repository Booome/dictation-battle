import { BattleFilter } from '@/components/BattleFilter';
import { BattleList } from '@/components/BattleList';
import { Header } from '@/components/Header';
import { HostBattleButton } from '@/components/HostBattleButton';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

export function Battles() {
  const { api } = useApi();
  const { account } = useAccount();
  const [battleListKey, setBattleListKey] = useState(0);
  const [filter, setFilter] = useState('All');
  const [includeRecruiting, setIncludeRecruiting] = useState(true);
  const [includeRecruitFailed, setIncludeRecruitFailed] = useState(false);
  const [includeExecuting, setIncludeExecuting] = useState(true);
  const [includeCompleted, setIncludeCompleted] = useState(false);

  const handleFilterChange = (
    filter: string,
    includeRecruiting: boolean,
    includeRecruitFailed: boolean,
    includeExecuting: boolean,
    includeCompleted: boolean,
  ) => {
    setFilter(filter);
    setIncludeRecruiting(includeRecruiting);
    setIncludeRecruitFailed(includeRecruitFailed);
    setIncludeExecuting(includeExecuting);
    setIncludeCompleted(includeCompleted);
  };

  const handleHostBattleSucceed = () => {
    setBattleListKey(battleListKey + 1);
  };

  const handleJoinBattleFinish = (id: number) => {
    setBattleListKey(battleListKey + 1);
  };

  useEffect(() => {
    setBattleListKey(battleListKey + 1);
  }, [api, account]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header category="Battles" />

      {account && (
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            padding: '2rem',
          }}>
          <Box sx={{ flexGrow: 1, overflow: 'hidden', marginRight: '1rem' }}>
            <Box sx={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Battles:</Box>

            <BattleList
              key={battleListKey}
              filter={filter as 'All' | 'Hosted' | 'Joined' | 'Sponsored'}
              includeRecruiting={includeRecruiting}
              includeRecruitFailed={includeRecruitFailed}
              includeExecuting={includeExecuting}
              includeCompleted={includeCompleted}
              onJoinSucceed={handleJoinBattleFinish}
            />
          </Box>
          <Box sx={{ width: '20rem', display: 'flex', flexDirection: 'column' }}>
            <HostBattleButton onSucceed={handleHostBattleSucceed} />

            <BattleFilter
              filter={filter}
              includeRecruiting={includeRecruiting}
              includeRecruitFailed={includeRecruitFailed}
              includeExecuting={includeExecuting}
              includeCompleted={includeCompleted}
              onChange={handleFilterChange}
            />
          </Box>
        </Box>
      )}
      {!account && (
        <Box sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', py: 4 }}>
          Please connect your wallet to continue.
        </Box>
      )}
    </Box>
  );
}
