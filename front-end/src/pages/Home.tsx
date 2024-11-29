import { HomePageHeader } from '@/components/Header';
import { TargetViewer } from '@/components/TargetViewer';

export function Home() {
  return (
    <>
      <HomePageHeader />
      <TargetViewer category="random" />
    </>
  );
}
