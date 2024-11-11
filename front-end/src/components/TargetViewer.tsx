import { BACKEND_URL } from '@/consts';
import { Box, Typography } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { useEffect, useState } from 'react';

type Props = {
  target: string;
  onClick?: (target: string) => void;
};

export function TargetViewer({ target, onClick }: Props) {
  const [text, setText] = useState('');

  useEffect(() => {
    fetch(`${BACKEND_URL}/targets/${target}`)
      .then((res) => res.text())
      .then((text) => setText(text))
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [target]);

  return (
    <Box
      onClick={() => onClick?.(target)}
      sx={{
        '&:hover': {
          backgroundColor: '#0001',
        },
        cursor: onClick ? 'pointer' : 'default',
      }}>
      {text && text.split('\n').map((line, index) => <div key={`${target}-line-${index}`}>{renderLine(line)}</div>)}
    </Box>
  );
}

function renderImage(imagePath: string) {
  if (imagePath.startsWith('./')) {
    imagePath = imagePath.slice(2);
  }
  const imageUrl = `${BACKEND_URL}/${imagePath}`;
  return (
    <Box
      component="img"
      src={imageUrl}
      alt=""
      sx={{
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
        display: 'block',
        filter: 'grayscale(100%)',
      }}
    />
  );
}

function renderHeader(line: string, headerLevel: number) {
  return <Typography variant={`h${headerLevel + 2}` as Variant}>{line.slice(headerLevel).trim()}</Typography>;
}

function renderLine(line: string) {
  const headerLevel = line.match(/^#+/)?.[0].length;
  if (headerLevel) {
    return renderHeader(line, headerLevel);
  }

  let imagePath = line.match(/!\[.*\]\((.*?)\)/)?.[1];
  if (imagePath) {
    return renderImage(imagePath);
  }

  return (
    <Typography variant="body1" sx={{ mb: 1 }}>
      {line}
    </Typography>
  );
}
