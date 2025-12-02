import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routePaths';

// ####################--AUN NO ESTA LISTO--#####################

// Componente placeholder para un Match Activo
const MatchCard = ({ user1, user2, skillOffers, skillWants }) => (
    <Card sx={{ mb: 2, borderLeft: '5px solid #1976d2' }}>
        <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">
                {user1} - {user2}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Habilidad que ofreces: {skillOffers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Habilidad que aprendes: {skillWants}
            </Typography>
        </CardContent>
    </Card>
);

const MatchesPage = () => {
    const navigate = useNavigate();
    // Datos de ejemplo basados en el mockup
    const activeMatches = [
        { id: 1, user1: "Julio Valenzuela", user2: "Maria Inostroza", skillOffers: "Manejo de servidores", skillWants: "Ilustración digital" },
        // ... aquí irían los datos reales de la API
    ];

    return (
        <Box>
            <Container maxWidth="md" sx={{ mt: 4 }}>
                {/* Encabezado de sección con CTA */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h5" component="h2">Matches Activos</Typography>
                    <Button variant="contained" onClick={() => navigate(ROUTES.SEARCH)}>
                        Buscar usuarios / crear match
                    </Button>
                </Stack>
                
                {/* Lista de Matches Activos */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        {activeMatches.map(match => (
                            <MatchCard key={match.id} {...match} />
                        ))}
                        {activeMatches.length === 0 && (
                            <Card sx={{ p: 2 }}>
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary">
                                        Aún no tienes matches. Usa el botón de arriba para buscar usuarios y crear uno.
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', gap: 3 }}>
                    <Card sx={{ p: 2, flexGrow: 1, textAlign: 'center' }}>
                        <Typography variant="h6">10</Typography>
                        <Typography variant="body2" color="text.secondary">Matches Enviados</Typography>
                    </Card>
                    <Card sx={{ p: 2, flexGrow: 1, textAlign: 'center' }}>
                        <Typography variant="h6">4</Typography>
                        <Typography variant="body2" color="text.secondary">Matches Recibidos</Typography>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
};

export default MatchesPage;