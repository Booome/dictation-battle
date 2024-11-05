import BattlesIcon from '@/assets/images/icons/battles.svg?react';
import HomeIcon from '@/assets/images/icons/home.svg?react';
import { Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

export type SidebarItemProps = {
  title: string;
  route: string;
  icon: React.ReactNode;
};

export const SIDEBAR_ITEMS: SidebarItemProps[] = [
  { title: 'Home', route: '/', icon: <HomeIcon /> },
  // { title: 'Daily Target', route: '/dailyTarget', icon: <DailyTargetIcon /> },
  { title: 'Battles', route: '/battles', icon: <BattlesIcon /> },
];

function Item({ title, route, icon }: SidebarItemProps) {
  const isActive = useLocation().pathname === route;

  return (
    <Box
      component={Link}
      to={route}
      sx={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        m: '0.75rem 0',
        color: 'common.white',
        opacity: isActive ? 1 : 0.7,
        borderLeft: isActive ? '3px solid #fff' : '3px solid transparent',
        paddingLeft: '0.5rem',
        '&:hover': {
          opacity: 1,
          transition: 'all 0.2s',
        },
      }}>
      {icon}
      <Box component="span" sx={{ marginLeft: '0.5rem' }}>
        {title}
      </Box>
    </Box>
  );
}

export function Sidebar() {
  return (
    <Box sx={{ p: '1.5rem' }}>
      {SIDEBAR_ITEMS.map((item) => (
        <Item key={item.route} {...item} />
      ))}
    </Box>
  );
}
