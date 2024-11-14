import { ThemeProvider, createTheme } from '@mui/material';

const mainTheme = createTheme({
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
    body1: {
      fontFamily: 'Droid Serif, serif',
      fontSize: '1rem',
    },
  },
});

export const MainThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider theme={mainTheme}>{children}</ThemeProvider>;
};

const markdownTheme = createTheme({
  ...mainTheme,
  typography: {
    ...mainTheme.typography,
    h1: {
      fontSize: '2.5rem',
      textAlign: 'center',
    },
    body1: {
      fontFamily: 'Droid Serif, serif',
      fontSize: '14px',
    },
  },
});

export const MarkdownThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider theme={markdownTheme}>{children}</ThemeProvider>;
};
