import { Header } from '@/components/Header';
import { TargetViewer } from '@/components/TargetViewer';
import { BACKEND_URL } from '@/consts';
import { useAccount } from '@gear-js/react-hooks';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

export function Favorite() {
  const [targets, setTargets] = useState<string[]>([]);
  const { account } = useAccount();

  useEffect(() => {
    if (!account) {
      return;
    }

    const url = `${BACKEND_URL}/favorites?account=${account.address}`;

    fetch(url)
      .then((res) => res.json())
      .then((favorites) => {
        setTargets(favorites.reverse());
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [account]);

  return (
    <Box>
      <Header category="Favorite" />
      <TargetViewer targets={targets} />
    </Box>
  );
}
