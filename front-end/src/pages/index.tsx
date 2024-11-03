import { Route, Routes } from 'react-router-dom';
import { Battles } from './Battles';
import { CreateBattle } from './CreateBattle';
import { Home } from './Home';

const routes = [
  { path: '/', Page: Home },
  { path: '/battles', Page: Battles },
  { path: '/create-battle', Page: CreateBattle },
];

export function Routing() {
  const getRoutes = () => routes.map(({ path, Page }) => <Route key={path} path={path} element={<Page />} />);

  return <Routes>{getRoutes()}</Routes>;
}
