import { Box } from '@mui/material';
import debounce from 'debounce';
import { useEffect, useState } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { TargetCard } from './TargetCard';

type Props = {
  targets: string[];
};

export function TargetViewer({ targets }: Props) {
  const [visibleTargets, setVisibleTargets] = useState<number>(32);

  useEffect(() => {
    const increaseVisibleTargets = debounce(() => {
      if (window.innerHeight + window.scrollY > document.body.offsetHeight * 0.75) {
        console.log('increaseVisibleTargets');
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

  const handleClick = (target: string) => {
    console.log(target);
  };

  return (
    <Box sx={{ padding: '2rem' }}>
      {targets && (
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
          <Masonry gutter="16px">
            {targets.slice(0, visibleTargets).map((item: string) => (
              <TargetCard key={item} target={item} />
            ))}
          </Masonry>
        </ResponsiveMasonry>
      )}
    </Box>
  );
}
