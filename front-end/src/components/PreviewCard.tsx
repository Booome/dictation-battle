import { useNavigate } from 'react-router-dom';
import styles from './PreviewCard.module.scss';

type PreviewCardProps = {
  id: string;
  content: string;
  numWords: number;
};

export function PreviewCard({ id, content, numWords }: PreviewCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/target/${id}`);
  };

  return (
    <button className={styles.previewCard} onClick={handleClick} type="button">
      {content}
    </button>
  );
}
