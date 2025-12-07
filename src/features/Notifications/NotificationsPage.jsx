import React from 'react';
import {
    Box,
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Paper,
    Chip,
    CircularProgress,
    Stack,
    Divider,
    Alert,
    Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNotifications } from './hooks/useNotifications';
import { useMatchRequests } from './hooks/useMatchRequests';
import MatchRequestCard from './components/MatchRequestCard';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routePaths';

/**
 * Página principal de notificaciones
 * Muestra todas las notificaciones visibles del usuario
 * Permite marcar como leídas y ocultar notificaciones
 * También muestra solicitudes de match pendientes
 */
const NotificationsPage = () => {
    const { 
        notifications, 
        loading, 
        error, 
        markAsRead, 
        hideNotification 
    } = useNotifications();
    
    const {
        requests,
        loading: requestsLoading,
        error: requestsError,
        actionLoading,
        acceptRequest,
        rejectRequest
    } = useMatchRequests();
    
    const navigate = useNavigate();
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

    /**
     * Obtiene el icono apropiado según el tipo de notificación
     */
    const getNotificationIcon = (tipo) => {
        switch (tipo) {
            case 'solicitud_match':
                return <PersonAddIcon color="primary" />;
            case 'match_aceptado':
                return <CheckIcon color="success" />;
            case 'match_rechazado':
                return <CancelIcon color="error" />;
            default:
                return <PersonAddIcon />;
        }
    };

    /**
     * Obtiene el color de fondo del avatar según el tipo
     */
    const getAvatarColor = (tipo) => {
        switch (tipo) {
            case 'solicitud_match':
                return 'primary.light';
            case 'match_aceptado':
                return 'success.light';
            case 'match_rechazado':
                return 'error.light';
            default:
                return 'grey.300';
        }
    };

    /**
     * Maneja el clic en una notificación
     * - Marca como leída
     * - Navega a la sección correspondiente
     */
    const handleNotificationClick = async (notification) => {
        await markAsRead(notification.id);
        
        // Navegar según el tipo de notificación
        if (notification.tipo === 'solicitud_match') {
            // Redirigir a la página de notificaciones para ver/aceptar solicitudes
            navigate(ROUTES.NOTIFICATIONS);
        } else if (notification.tipo === 'match_aceptado') {
            // Redirigir a la lista de amigos
            navigate(ROUTES.FRIENDS);
        }
    };

    // Estados de carga y error
    if (loading && notifications.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
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

    // Filtrar solo notificaciones visibles
    const visibleNotifications = notifications.filter(n => n.mostrar);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Notificaciones
            </Typography>

            {/* Sección de Solicitudes de Match Pendientes */}
            {requests.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3, mb: 2 }}>
                        Solicitudes de Match ({requests.length})
                    </Typography>
                    
                    {requestsLoading && requests.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box>
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
            )}

            {/* Sección de Notificaciones Generales */}
            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3, mb: 2 }}>
                Historial de Notificaciones
            </Typography>

            {visibleNotifications.length === 0 && requests.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', mt: 3 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No tienes notificaciones nuevas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Las notificaciones sobre solicitudes de match y aceptaciones aparecerán aquí
                    </Typography>
                </Paper>
            ) : (
                <Paper sx={{ mt: 3, borderRadius: 2 }}>
                    <List sx={{ p: 0 }}>
                        {visibleNotifications.map((notification, index) => (
                            <React.Fragment key={notification.id}>
                                <ListItem
                                    sx={{
                                        py: 2,
                                        px: 3,
                                        bgcolor: notification.leido ? 'transparent' : 'action.hover',
                                        '&:hover': { 
                                            bgcolor: notification.leido ? 'action.hover' : 'action.selected',
                                            cursor: 'pointer'
                                        },
                                        transition: 'background-color 0.2s'
                                    }}
                                    secondaryAction={
                                        <IconButton 
                                            edge="end" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                hideNotification(notification.id);
                                            }}
                                            aria-label="Ocultar notificación"
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    }
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: getAvatarColor(notification.tipo) }}>
                                            {getNotificationIcon(notification.tipo)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                <Typography variant="body1" component="span">
                                                    {notification.titulo}
                                                </Typography>
                                                {!notification.leido && (
                                                    <Chip 
                                                        label="Nuevo" 
                                                        size="small" 
                                                        color="primary"
                                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                                    />
                                                )}
                                            </Stack>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(notification.fecha).toLocaleString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                {index < visibleNotifications.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

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
