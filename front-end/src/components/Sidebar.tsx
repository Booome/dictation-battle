import BattlesIcon from '@/assets/images/icons/battles.svg?react';
import DailyTargetIcon from '@/assets/images/icons/dailyTarget.svg?react';
import HomeIcon from '@/assets/images/icons/home.svg?react';
import { useLocation } from 'react-router-dom';
import styles from './Sidebar.module.scss';

export type SidebarItemProps = {
  title: string;
  route: string;
  icon: React.ReactNode;
};

export const SIDEBAR_ITEMS: SidebarItemProps[] = [
  { title: 'Home', route: '/', icon: <HomeIcon /> },
  { title: 'Daily Target', route: '/dailyTarget', icon: <DailyTargetIcon /> },
  { title: 'Battles', route: '/battles', icon: <BattlesIcon /> },
];

function Item({ title, route, icon }: SidebarItemProps) {
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
      {SIDEBAR_ITEMS.map((item) => (
        <Item key={item.route} {...item} />
      ))}
    </div>
  );
}
