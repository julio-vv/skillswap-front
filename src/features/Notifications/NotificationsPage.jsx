import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Snackbar,
    Stack,
    Button
} from '@mui/material';
import { useMatchRequests } from './hooks/useMatchRequests';
import MatchRequestCard from './components/MatchRequestCard';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Página principal de notificaciones
 * Muestra solicitudes de match pendientes (única notificación relevante)
 */
const NotificationsPage = () => {
    const {
        requests,
        loading,
        error,
        actionLoading,
        acceptRequest,
        rejectRequest,
        fetchRequests
    } = useMatchRequests();
    
    const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });

    /**
     * Maneja la aceptación de una solicitud
     */
    const handleAcceptRequest = async (requestId) => {
        const result = await acceptRequest(requestId);
        if (result.success) {
            setSnackbar({
                open: true,
                message: '¡Match aceptado! Ahora pueden chatear',
                severity: 'success'
            });
        } else {
            setSnackbar({
                open: true,
                message: result.error || 'Error al aceptar solicitud',
                severity: 'error'
            });
        }
    };

    /**
     * Maneja el rechazo de una solicitud
     */
    const handleRejectRequest = async (requestId) => {
        const result = await rejectRequest(requestId);
        if (result.success) {
            setSnackbar({
                open: true,
                message: 'Solicitud rechazada',
                severity: 'info'
            });
        } else {
            setSnackbar({
                open: true,
                message: result.error || 'Error al rechazar solicitud',
                severity: 'error'
            });
        }
    };

    // Estados de carga y error
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
                    <Typography color="error.dark" variant="h6">
                        {error}
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} mb={2}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Notificaciones
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Solicitudes de Match ({requests.length})
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                    onClick={fetchRequests}
                    disabled={loading}
                >
                    {loading ? 'Actualizando…' : 'Actualizar'}
                </Button>
            </Stack>

            {/* Solicitudes de Match Pendientes */}
            <Box sx={{ mt: 2 }}>
                {requests.length === 0 ? (
                    <Paper sx={{ p: 6, textAlign: 'center', mt: 2 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No tienes solicitudes de match pendientes
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Las nuevas solicitudes aparecerán aquí cuando alguien solicite un match.
                        </Typography>
                    </Paper>
                ) : (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {requests.map(request => (
                            <MatchRequestCard
                                key={request.id}
                                request={request}
                                onAccept={handleAcceptRequest}
                                onReject={handleRejectRequest}
                                isProcessing={actionLoading === request.id}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {/* Snackbar para mensajes de éxito/error */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default NotificationsPage;
