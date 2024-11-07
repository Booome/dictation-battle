import { Box } from '@mui/material';
import './App.scss';
import { Header } from './components/Header';
import { withProviders } from './hocs';

function Component() {
  return (
    <Box
      maxWidth="xl"
      sx={{
        margin: '0 auto',
        height: '100vh',
        backgroundColor: 'background.default',
        padding: '0 1rem',
      }}>
      <Header page={1} totalPages={2} />
    </Box>
  );
}

export const App = withProviders(Component);
