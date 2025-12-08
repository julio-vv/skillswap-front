import React from 'react';
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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routePaths';

/**
 * Componente para mostrar una solicitud de match pendiente
 * Permite aceptar o rechazar la solicitud
 * Memoizado para prevenir re-renders innecesarios
 * 
 * @param {Object} request - Objeto de solicitud con emisor, estado, creado_en, etc.
 * @param {Function} onAccept - Callback al aceptar
 * @param {Function} onReject - Callback al rechazar
 * @param {boolean} isProcessing - Si la solicitud está siendo procesada
 */
const MatchRequestCard = ({ request, onAccept, onReject, isProcessing }) => {
    const navigate = useNavigate();
    
    // Destructuring con valores por defecto
    const { 
        id,
        emisor = {},
        creado_en
    } = request;
    
    const { 
        id: emisorId,
        nombre = 'Usuario',
        apellido = '',
        media,
        foto_perfil,
        habilidades_ofrecer = [],
        habilidades_aprender = []
    } = emisor;
    
    const fotoPerfil = media || foto_perfil;

    const handleViewProfile = () => {
        navigate(ROUTES.USUARIO_BY_ID(emisorId));
    };

    const resolveSkillKey = (habilidad, idx) => {
        if (habilidad && typeof habilidad === 'object') {
            return habilidad.id ?? habilidad.key ?? habilidad.value ?? `skill-${idx}`;
        }
        return habilidad ?? `skill-${idx}`;
    };

    const resolveSkillLabel = (habilidad) => {
        if (habilidad && typeof habilidad === 'object') {
            return habilidad.nombre || habilidad.nombre_habilidad || habilidad.name || String(habilidad.id ?? '');
        }
        return String(habilidad || '');
    };

    const handleAccept = () => {
        onAccept(id);
    };

    const handleReject = () => {
        onReject(id);
    };

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
                        src={fotoPerfil} 
                        alt={`${nombre} ${apellido}`}
                        sx={{ width: 60, height: 60 }}
                    >
                        {!fotoPerfil && <PersonIcon />}
                    </Avatar>

                    {/* Información del usuario */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            {nombre} {apellido}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            Te ha enviado una solicitud de match
                        </Typography>

                        {/* Habilidades ofrecidas */}
                        {habilidades_ofrecer.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Puede enseñar:
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                    {habilidades_ofrecer.slice(0, 3).map((habilidad, index) => (
                                        <Chip 
                                            key={resolveSkillKey(habilidad, index)}
                                            label={resolveSkillLabel(habilidad)}
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

                        {/* Habilidades buscadas */}
                        {habilidades_aprender.length > 0 && (
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Quiere aprender:
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                    {habilidades_aprender.slice(0, 3).map((habilidad, index) => (
                                        <Chip 
                                            key={resolveSkillKey(habilidad, index)}
                                            label={resolveSkillLabel(habilidad)}
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

                        {/* Fecha */}
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            {new Date(creado_en).toLocaleString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                {/* Botón Ver Perfil */}
                <Button 
                    size="small" 
                    onClick={handleViewProfile}
                    disabled={isProcessing}
                >
                    Ver Perfil
                </Button>

                {/* Botones de Acción */}
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={isProcessing ? <CircularProgress size={16} /> : <CloseIcon />}
                        onClick={handleReject}
                        disabled={isProcessing}
                        size="small"
                    >
                        Rechazar
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={isProcessing ? <CircularProgress size={16} /> : <CheckIcon />}
                        onClick={handleAccept}
                        disabled={isProcessing}
                        size="small"
                    >
                        Aceptar
                    </Button>
                </Stack>
            </CardActions>
        </Card>
    );
};

export default React.memo(MatchRequestCard);
