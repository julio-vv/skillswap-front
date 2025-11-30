import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';
import Header from '../../components/Header'; // Importamos el Header

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
    // Datos de ejemplo basados en el mockup
    const activeMatches = [
        { id: 1, user1: "Julio Valenzuela", user2: "Maria Inostroza", skillOffers: "Manejo de servidores", skillWants: "Ilustración digital" },
        // ... aquí irían los datos reales de la API
    ];

    return (
        <Box>
            <Header /> {/* Muestra la barra de navegación */}
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Matches Activos
                </Typography>
                
                {/* Lista de Matches Activos */}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {activeMatches.map(match => (
                            <MatchCard key={match.id} {...match} />
                        ))}
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