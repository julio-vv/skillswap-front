import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { normalizeSkillName } from '../utils/skillHelpers';
import { MATCH_TYPE_LABELS } from '../constants/matchConstants';

function UserCard({ user, habilidades, tipo, onClick }) {
    const habilidadesLegibles = (habilidades || []).map(normalizeSkillName);
    
    return (
        <Card 
            sx={{ 
                mb: 2, 
                width: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                }
            }}
            onClick={() => onClick && onClick(user.id)}
        >
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    {/* Columna 1: Avatar + datos */}
                    <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                            src={user.media}
                            alt={user.nombre}
                            sx={{ width: 60, height: 60 }}
                        >
                            {user.nombre?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="h6">
                                {user.nombre} {user.apellido}
                            </Typography>
                            {user.email && (
                                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                                    {user.email}
                                </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                {MATCH_TYPE_LABELS[tipo]}
                            </Typography>
                        </Box>
                    </Grid>
                    {/* Columna 2: Habilidades */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {MATCH_TYPE_LABELS[tipo]}
                        </Typography>
                        {habilidadesLegibles.length > 0 ? (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {habilidadesLegibles.slice(0, 5).map((nombre, idx) => (
                                    <Chip key={idx} label={nombre} size="small" variant="outlined" />
                                ))}
                                {habilidadesLegibles.length > 5 && (
                                    <Chip label={`+${habilidadesLegibles.length - 5}`} size="small" variant="outlined" />
                                )}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary">Sin datos</Typography>
                        )}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}

export default UserCard;
