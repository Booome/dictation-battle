import styles from './PreviewCard.module.scss';

type PreviewCardProps = {
  id: string;
  content: string;
  numWords: number;
};

export function PreviewCard({ id, content, numWords }: PreviewCardProps) {
  return <div className={styles.previewCard}>{content}</div>;
}
