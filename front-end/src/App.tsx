import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { SIDEBAR_ITEMS, Sidebar } from './components/Sidebar';
import { withProviders } from './hocs';
import { Routing } from './pages';

function Component() {
  const location = useLocation();
  const showSidebar = SIDEBAR_ITEMS.some((item) => location.pathname === item.route);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'primary.main',
      }}>
      <Header />

      <Box
        sx={{
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}>
        <Box sx={{ width: '180px', bgcolor: 'primary.main', borderTop: '1px solid', borderTopColor: 'primary.light' }}>
          <Sidebar />
        </Box>

        <Box
          maxWidth="xl"
          sx={{
            margin: '0 auto',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}>
          <Routing />
        </Box>
      </Box>
    </Box>
  );
}

export const App = withProviders(Component);
