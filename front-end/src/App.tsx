import { Box } from '@mui/material';
import './App.scss';
import { Body } from './components/Body';
import { Header } from './components/Header';
import { withProviders } from './hocs';

function Component() {
  return (
    <Box
      maxWidth="xl"
      sx={{
        margin: '0 auto',
        backgroundColor: 'background.default',
        padding: '0 1rem',
      }}>
      <Header page={1} totalPages={2} />
      <Body />
    </Box>
  );
}

export const App = withProviders(Component);
