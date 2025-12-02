import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './features/Auth/AuthContext.jsx'
import { Box, CircularProgress } from '@mui/material'
import ErrorBoundary from './features/Common/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
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
    </ErrorBoundary>
  </StrictMode>,
);
