import { Link } from 'react-router-dom';

import LogoSVG from '@/assets/images/logo.svg?react';

export function Logo() {
  return (
    <Link to="/">
      <LogoSVG />
    </Link>
  );
}
