import BattlesIcon from '@/assets/images/icons/battles.svg?react';
import DailyTargetIcon from '@/assets/images/icons/dailyTarget.svg?react';
import HomeIcon from '@/assets/images/icons/home.svg?react';
import { useLocation } from 'react-router-dom';
import styles from './Sidebar.module.scss';

type ItemProps = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

function Item({ title, href, icon }: ItemProps) {
  const isActive = useLocation().pathname === href;

  return (
    <a href={href} className={`${styles.item} ${isActive ? styles.active : ''}`}>
      {icon}
      <span>{title}</span>
    </a>
  );
}

export function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <Item title="Home" href="/" icon={<HomeIcon />} />
      <Item title="Daily Target" href="/daliyTarget" icon={<DailyTargetIcon />} />
      <Item title="Battles" href="/battles" icon={<BattlesIcon />} />
    </div>
  );
}
