import { PreviewCard } from '@/components/PreviewCard';
import { BACKEND_URL } from '@/consts';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

interface FilePreview {
  id: string;
  content: string;
  numWords: number;
}

export function Home() {
  const [files, setFiles] = useState<FilePreview[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/files/preview?count=10&preview_length=512`)
      .then((res) => res.json())
      .then((data) => setFiles(data));
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px',
        fontSize: '0.8rem',
        p: '5rem',
      }}>
      {files.map((file) => (
        <PreviewCard key={file.id} id={file.id} content={file.content} numWords={file.numWords} />
      ))}
    </Box>
  );
}
