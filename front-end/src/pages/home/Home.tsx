import { BACKEND_URL } from '@/consts';
import { useEffect, useState } from 'react';

interface FilePreview {
  id: string;
  content: string;
  num_words: number;
}

export function Home() {
  const [files, setFiles] = useState<FilePreview[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/files/preview?count=10`)
      .then((res) => res.json())
      .then((data) => setFiles(data));
  }, []);

  return (
    <div>
      {files.map((file) => (
        <div key={file.id}>{file.id}</div>
      ))}
    </div>
  );
}
