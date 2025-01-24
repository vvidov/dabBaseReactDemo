import React from 'react';
import CategoriesPage from './components/CategoriesPage';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <ToastProvider>
          <CssBaseline />
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <CategoriesPage />
          </Container>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
