import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

/**
 * Componente del encabezado del perfil
 * Muestra el título y el botón de editar si corresponde
 * O botón de enviar solicitud de match si es perfil ajeno
 */
const ProfileHeader = ({ 
    isOwnProfile, 
    isEditing, 
    onEdit, 
    onSendMatchRequest,
    onAcceptRequest,
    onRejectRequest,
    onStartChat,
    onRemoveFriend,
    matchStatus,
    isSendingRequest 
}) => {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
                {isOwnProfile ? 'Mi Perfil' : 'Perfil de Usuario'}
            </Typography>

            <Stack direction="row" spacing={1}>
                {isOwnProfile && !isEditing && (
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={onEdit}
                    >
                        Editar
                    </Button>
                )}

                {!isOwnProfile && (
                    <>
                        {matchStatus === 'matched' ? (
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    startIcon={<CheckCircleIcon />}
                                    disabled
                                >
                                    Son amigos
                                </Button>
                                {onStartChat && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<ChatIcon />}
                                        onClick={onStartChat}
                                    >
                                        Enviar mensaje
                                    </Button>
                                )}
                                {onRemoveFriend && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteOutlineIcon />}
                                        onClick={onRemoveFriend}
                                    >
                                        Eliminar amigo
                                    </Button>
                                )}
                            </Stack>
                        ) : matchStatus === 'pending' ? (
                            <Button
                                variant="outlined"
                                disabled
                            >
                                Solicitud enviada
                            </Button>
                        ) : matchStatus === 'pending-received' ? (
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={onRejectRequest}
                                    disabled={isSendingRequest}
                                >
                                    Rechazar
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={isSendingRequest ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                                    onClick={onAcceptRequest}
                                    disabled={isSendingRequest}
                                >
                                    Aceptar Solicitud
                                </Button>
                            </Stack>
                        ) : (
                            onSendMatchRequest && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={isSendingRequest ? <CircularProgress size={20} /> : <PersonAddIcon />}
                                    onClick={onSendMatchRequest}
                                    disabled={isSendingRequest}
                                >
                                    Enviar Solicitud
                                </Button>
                            )
                        )}
                    </>
                )}
            </Stack>
        </Box>
    );
};

export default ProfileHeader;
