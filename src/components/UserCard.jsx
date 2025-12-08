import React, { useCallback, useMemo } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routePaths';
import { getSkillName, formatSkillsForDisplay } from '../utils/skillsDisplay';

/**
 * Componente reutilizable para mostrar una tarjeta de usuario
 * Usado en búsqueda, matches, solicitudes, etc.
 * Memoizado para evitar re-renders innecesarios
 * 
 * @param {Object} user - Datos del usuario
 * @param {Map} skillsMap - Mapa opcional de { skillId: skillName }
 * @param {boolean} hideButton - Si true, oculta el botón de chevron
 * @param {Function} onCustomAction - Callback opcional para acciones personalizadas
 */
const UserCard = React.memo(({ 
    user, 
    skillsMap = new Map(), 
    hideButton = false,
    onCustomAction 
}) => {
    const navigate = useNavigate();
    
    // Deconstruyendo con valores por defecto
    const {
        id,
        nombre = 'Usuario',
        apellido = '',
        email = '',
        media,
        foto_perfil,
        habilidades_que_se_saben = [],
        habilidades_por_aprender = []
    } = user;

    const fotoPerfil = media || foto_perfil;

    // Preparar habilidades para display (memoizado)
    const skillsToTeach = useMemo(() => 
        formatSkillsForDisplay(habilidades_que_se_saben, skillsMap),
        [habilidades_que_se_saben, skillsMap]
    );

    const skillsToLearn = useMemo(() => 
        formatSkillsForDisplay(habilidades_por_aprender, skillsMap),
        [habilidades_por_aprender, skillsMap]
    );

    const handleCardClick = useCallback(() => {
        if (onCustomAction) {
            onCustomAction(id);
        } else {
            navigate(ROUTES.USUARIO_BY_ID(id));
        }
    }, [id, navigate, onCustomAction]);

    const handleIconClick = useCallback((e) => {
        e.stopPropagation();
        handleCardClick();
    }, [handleCardClick]);

    return (
        <Card 
            sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                }
            }}
            onClick={handleCardClick}
        >
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    {/* Columna 1: Avatar + datos */}
                    <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                            src={fotoPerfil} 
                            alt={nombre}
                            sx={{ width: 60, height: 60, flexShrink: 0 }}
                        >
                            {nombre?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" noWrap>
                                {nombre} {apellido}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {email}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Columna 2: Habilidades que enseña */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Sabe enseñar
                        </Typography>
                        {skillsToTeach.length > 0 ? (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {skillsToTeach.slice(0, 3).map((skill) => (
                                    <Chip 
                                        key={skill._displayKey}
                                        label={skill.nombre}
                                        size="small"
                                        variant="outlined"
                                    />
                                ))}
                                {skillsToTeach.length > 3 && (
                                    <Chip 
                                        label={`+${skillsToTeach.length - 3}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary">Sin datos</Typography>
                        )}
                    </Grid>

                    {/* Columna 3: Habilidades que quiere aprender */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Quiere aprender
                        </Typography>
                        {skillsToLearn.length > 0 ? (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {skillsToLearn.slice(0, 3).map((skill) => (
                                    <Chip 
                                        key={skill._displayKey}
                                        label={skill.nombre}
                                        size="small"
                                        variant="outlined"
                                    />
                                ))}
                                {skillsToLearn.length > 3 && (
                                    <Chip 
                                        label={`+${skillsToLearn.length - 3}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary">Sin datos</Typography>
                        )}
                    </Grid>

                    {/* Botón de acción */}
                    {!hideButton && (
                        <Grid size={{ xs: 12, md: 1 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            <IconButton 
                                color="primary"
                                onClick={handleIconClick}
                                size="small"
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
}, (prevProps, nextProps) => {
    // Custom comparison para memo
    return (
        prevProps.user.id === nextProps.user.id &&
        prevProps.user.nombre === nextProps.user.nombre &&
        prevProps.user.habilidades_que_se_saben?.length === nextProps.user.habilidades_que_se_saben?.length &&
        prevProps.user.habilidades_por_aprender?.length === nextProps.user.habilidades_por_aprender?.length &&
        prevProps.hideButton === nextProps.hideButton
    );
});

UserCard.displayName = 'UserCard';

export default UserCard;
