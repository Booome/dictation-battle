import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, Button } from '@mui/material';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.scss';
import { withProviders } from './hocs';
import { Favorite } from './pages/Favorite';
import { Home } from './pages/Home';

const routes = [
  { path: '/', Page: Home },
  { path: '/favorite', Page: Favorite },
];

function getRoutes() {
  return routes.map(({ path, Page }) => <Route key={path} path={path} element={<Page />} />);
}

function Component() {
  const location = useLocation();
  const navigate = useNavigate();
  const isFirstPage = location.pathname === routes[0].path;
  const isLastPage = location.pathname === routes[routes.length - 1].path;

  const handlePrevPage = () => {
    const currentIndex = routes.findIndex((route) => route.path === location.pathname);
    if (currentIndex > 0) {
      navigate(routes[currentIndex - 1].path);
    }
  };

  const handleNextPage = () => {
    const currentIndex = routes.findIndex((route) => route.path === location.pathname);
    if (currentIndex < routes.length - 1) {
      navigate(routes[currentIndex + 1].path);
    }
  };

  return (
    <>
      <Button
        onClick={handlePrevPage}
        disabled={isFirstPage}
        sx={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '100px' }}>
        {!isFirstPage && <ArrowBackIosIcon sx={{ fontSize: '3rem', color: 'primary.main' }} />}
      </Button>

      <Box
        maxWidth="xl"
        sx={{
          margin: '0 auto',
          backgroundColor: 'background.default',
          padding: '0 1rem',
          width: 'calc(100% - 240px)',
        }}>
        <Routes>{getRoutes()}</Routes>
      </Box>

      <Button
        onClick={handleNextPage}
        disabled={isLastPage}
        sx={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '100px' }}>
        {!isLastPage && <ArrowForwardIosIcon sx={{ fontSize: '3rem', color: 'primary.main' }} />}
      </Button>
    </>
  );
}

export const App = withProviders(Component);
