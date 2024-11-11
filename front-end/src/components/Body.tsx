import Masonry from '@mui/lab/Masonry';
import { useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { BACKEND_URL } from '../consts';
import { TargetViewer } from './TargetViewer';

export function Body() {
  const theme = useTheme();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const url = `${BACKEND_URL}/targets/preview?count=10`;
    console.log('url:', url);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        console.log(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <Masonry
      columns={{
        xl: 4,
        md: 3,
        sm: 2,
      }}
      spacing={2}
      sx={{
        margin: 0,
        paddingTop: 2,
      }}>
      {data?.map((item: string, index: number) => (
        <TargetViewer key={index} target={item} />
      ))}
    </Masonry>
  );
}
