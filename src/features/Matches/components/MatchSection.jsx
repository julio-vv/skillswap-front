import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UserCard from './UserCard';
import { MATCH_SECTION_TITLES, MATCH_EMPTY_MESSAGES } from '../constants/matchConstants';

function MatchSection({ tipo, users, hasMore, onLoadMore, onUserClick, fullWidth = false }) {
    return (
        <Box sx={{ mb: fullWidth ? 4 : 0 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {MATCH_SECTION_TITLES[tipo]}
            </Typography>
            {users.length > 0 ? (
                fullWidth ? (
                    <Grid container spacing={2}>
                        {users.map((user, idx) => (
                            <Grid size={{ xs: 12 }} key={user.id || idx}>
                                <UserCard 
                                    user={user} 
                                    habilidadesOfrecer={tipo === 'mutual' ? user.puede_ensenar : user[tipo === 'teach' ? 'puede_ensenar' : 'puede_aprender']}
                                    habilidadesBuscar={tipo === 'mutual' ? user.puede_aprender : undefined}
                                    tipo={tipo} 
                                    onClick={onUserClick} 
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    users.map((user, idx) => (
                        <UserCard 
                            key={user.id || idx}
                            user={user} 
                            habilidadesOfrecer={tipo === 'mutual' ? user.puede_ensenar : user[tipo === 'teach' ? 'puede_ensenar' : 'puede_aprender']}
                            habilidadesBuscar={tipo === 'mutual' ? user.puede_aprender : undefined}
                            tipo={tipo} 
                            onClick={onUserClick} 
                        />
                    ))
                )
            ) : (
                <Alert severity="info">{MATCH_EMPTY_MESSAGES[tipo]}</Alert>
            )}
            {hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                        variant="outlined"
                        endIcon={<ArrowForwardIcon />}
                        onClick={onLoadMore}
                    >
                        Ver más
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default MatchSection;
