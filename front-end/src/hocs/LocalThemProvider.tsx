import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2f2f2f',
    },
    background: {
      default: '#f9f7f1',
    },
  },
  typography: {
    fontFamily: 'Noto Sans JP',
    h3: {
      fontSize: '2.5rem',
      textAlign: 'center',
    },
    body1: {
      fontFamily: 'Droid Serif, serif',
      fontSize: '1rem',
    },
  },
});

export const LocalThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
