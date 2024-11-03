import { PreviewCard } from '@/components/PreviewCard';
import { BACKEND_URL } from '@/consts';
import { useEffect, useState } from 'react';
import styles from './Home.module.scss';

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
    <div className={styles.filesContainer}>
      {files.map((file) => (
        <PreviewCard key={file.id} id={file.id} content={file.content} numWords={file.numWords} />
      ))}
    </div>
  );
}
