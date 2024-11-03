import { Route, Routes } from 'react-router-dom';
import { Battles } from './Battles';
import { Home } from './Home';

const routes = [
  { path: '/', Page: Home },
  { path: '/battles', Page: Battles },
];

export function Routing() {
  const getRoutes = () => routes.map(({ path, Page }) => <Route key={path} path={path} element={<Page />} />);

  return <Routes>{getRoutes()}</Routes>;
}
