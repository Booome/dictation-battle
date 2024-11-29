import { BACKEND_URL } from '@/consts';
import { useAccount } from '@gear-js/react-hooks';
import { Box } from '@mui/material';
import debounce from 'debounce';
import { useEffect, useState } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { TargetCard } from './TargetCard';

type Props = {
  category: 'random' | 'favorite';
  onSelect?: (target: string) => void;
  showInfoBar?: boolean;
  emptyMessage?: string;
};

export function TargetViewer({ category, onSelect, showInfoBar = true, emptyMessage }: Props) {
  const { account } = useAccount();
  const [targets, setTargets] = useState<string[]>([]);
  const [visibleTargets, setVisibleTargets] = useState<number>(32);
  const [fetched, setFetched] = useState<boolean>(false);

  let url = '';
  if (category === 'favorite') {
    url = `${BACKEND_URL}/favorites?account=${account?.address}`;
  } else if (category === 'random') {
    url = `${BACKEND_URL}/targets/preview?count=1024`;
  }

  useEffect(() => {
    setFetched(false);
    console.log('url: ', url);

    fetch(url)
      .then((res) => res.json())
      .then((favorites) => {
        setTargets(favorites.reverse());
        setFetched(true);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [url]);

  useEffect(() => {
    const increaseVisibleTargets = debounce(() => {
      if (window.innerHeight + window.scrollY > document.body.offsetHeight * 0.75) {
        setVisibleTargets((prev) => prev + 32);
      }
    }, 200);

    window.addEventListener('scroll', increaseVisibleTargets);
    window.addEventListener('resize', increaseVisibleTargets);

    return () => {
      window.removeEventListener('scroll', increaseVisibleTargets);
      window.removeEventListener('resize', increaseVisibleTargets);
    };
  }, []);

  return (
    <Box sx={{ padding: '2rem' }}>
      {targets && (
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
          <Masonry gutter="16px">
            {targets.slice(0, visibleTargets).map((item: string) => (
              <TargetCard key={item} target={item} onClick={onSelect} showInfoBar={showInfoBar} />
            ))}
          </Masonry>
        </ResponsiveMasonry>
      )}

      {fetched && emptyMessage && targets.length === 0 && (
        <Box sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>{emptyMessage}</Box>
      )}
    </Box>
  );
}
