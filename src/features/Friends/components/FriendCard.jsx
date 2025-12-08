import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routePaths';
import { useConversations } from '../../Chat/hooks/useConversations';
import { useToast } from '../../../context/ToastContext';

/**
 * Componente para mostrar un amigo/match
 * Muestra información básica y permite iniciar chat o ver perfil
 * Memoizado para prevenir re-renders innecesarios
 * 
 * @param {Object} friend - Objeto con datos del amigo
 */
const FriendCard = ({ friend }) => {
    const navigate = useNavigate();
    const { getOrCreateConversation } = useConversations();
    const { showToast } = useToast();
    const [loadingChat, setLoadingChat] = useState(false);
    
    // Propiedades del amigo
    const { 
        id: friendId,
        nombre = 'Usuario',
        apellido = '',
        email = '',
        media,
        foto_perfil,
        habilidades_ofrecer = [],
        habilidades_aprender = []
    } = friend;
    
    const friendFotoPerfil = media || foto_perfil;

    const handleViewProfile = () => {
        navigate(ROUTES.USUARIO_BY_ID(friendId));
    };

    const handleStartChat = async () => {
        try {
            setLoadingChat(true);
            const conversation = await getOrCreateConversation(friendId);
            navigate(ROUTES.CHAT_CONVERSACION(conversation.id));
        } catch (error) {
            console.error('Error al iniciar chat:', error);
            showToast('No se pudo abrir el chat. Intenta de nuevo.', 'error');
        } finally {
            setLoadingChat(false);
        }
    };

    const getSkillLabel = (skill) => skill?.nombre || skill?.name || skill || '';

    return (
        <Card 
            sx={{ 
                mb: 2,
                '&:hover': { 
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s'
                }
            }}
        >
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    {/* Avatar */}
                    <Avatar 
                        src={friendFotoPerfil} 
                        alt={`${nombre} ${apellido}`}
                        sx={{ width: 60, height: 60 }}
                    >
                        {!friendFotoPerfil && <PersonIcon />}
                    </Avatar>

                    {/* Información del usuario */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            {nombre} {apellido}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            {email}
                        </Typography>

                        {/* Habilidades que puede enseñar */}
                        {habilidades_ofrecer.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Puede enseñar:
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                    {habilidades_ofrecer.slice(0, 3).map((habilidad, index) => (
                                        <Chip 
                                            key={habilidad?.id || habilidad?.nombre || habilidad?.name || index}
                                            label={getSkillLabel(habilidad)}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ mt: 0.5 }}
                                        />
                                    ))}
                                    {habilidades_ofrecer.length > 3 && (
                                        <Chip 
                                            label={`+${habilidades_ofrecer.length - 3}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ mt: 0.5 }}
                                        />
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {/* Habilidades que quiere aprender */}
                        {habilidades_aprender.length > 0 && (
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Quiere aprender:
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                    {habilidades_aprender.slice(0, 3).map((habilidad, index) => (
                                        <Chip 
                                            key={habilidad?.id || habilidad?.nombre || habilidad?.name || index}
                                            label={getSkillLabel(habilidad)}
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                            sx={{ mt: 0.5 }}
                                        />
                                    ))}
                                    {habilidades_aprender.length > 3 && (
                                        <Chip 
                                            label={`+${habilidades_aprender.length - 3}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ mt: 0.5 }}
                                        />
                                    )}
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                {/* Botones de Acción */}
                <Button 
                    size="small" 
                    onClick={handleViewProfile}
                >
                    Ver Perfil
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={loadingChat ? <CircularProgress size={16} color="inherit" /> : <ChatIcon />}
                    onClick={handleStartChat}
                    size="small"
                    disabled={loadingChat}
                >
                    {loadingChat ? 'Abriendo...' : 'Chatear'}
                </Button>
            </CardActions>
        </Card>
    );
};

export default React.memo(FriendCard);
