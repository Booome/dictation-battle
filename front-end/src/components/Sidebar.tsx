import BattlesIcon from '@/assets/images/icons/battles.svg?react';
import DailyTargetIcon from '@/assets/images/icons/dailyTarget.svg?react';
import HomeIcon from '@/assets/images/icons/home.svg?react';
import { useLocation } from 'react-router-dom';
import styles from './Sidebar.module.scss';

type ItemProps = {
  title: string;
  route: string;
  icon: React.ReactNode;
};

function Item({ title, route, icon }: ItemProps) {
  const isActive = useLocation().pathname === route;

  return (
    <a href={route} className={`${styles.item} ${isActive ? styles.active : ''}`}>
      {icon}
      <span>{title}</span>
    </a>
  );
}

export function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <Item title="Home" route="/" icon={<HomeIcon />} />
      <Item title="Daily Target" route="/daliyTarget" icon={<DailyTargetIcon />} />
      <Item title="Battles" route="/battles" icon={<BattlesIcon />} />
    </div>
  );
}
