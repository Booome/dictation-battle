import { HomePageHeader } from '@/components/Header';
import { TargetViewer } from '@/components/TargetViewer';
import { BACKEND_URL } from '@/consts';
import { useEffect, useState } from 'react';

export function Home() {
  const [targets, setTargets] = useState<string[]>([]);

  useEffect(() => {
    const url = `${BACKEND_URL}/targets/preview?count=1024`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setTargets(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <>
      <HomePageHeader />
      <TargetViewer targets={targets} />
    </>
  );
}
