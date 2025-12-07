import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './features/Auth/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import ErrorBoundary from './features/Common/ErrorBoundary.jsx'
import theme from './theme/theme.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <Suspense
                fallback={
                  <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
                    <CircularProgress />
                  </Box>
                }
              >
                <App />
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
);
