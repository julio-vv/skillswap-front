import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorShown: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Aquí puedes enviar el error a un servicio externo (Sentry, etc.)
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorShown: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', p: 3 }}>
          <Box sx={{ maxWidth: 520, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Algo salió mal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Se produjo un error al renderizar la aplicación. Puedes intentar recargar.
            </Typography>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                <Typography variant="caption">{String(this.state.error)}</Typography>
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button variant="contained" onClick={this.handleReload}>Recargar página</Button>
              <Button variant="outlined" onClick={this.handleReset}>Intentar continuar</Button>
            </Box>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}
