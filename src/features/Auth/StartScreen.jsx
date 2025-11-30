import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import AuthButtons from './AuthButtons';

const StartScreen = () => {
    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh', // Ocupa toda la altura de la vista
                textAlign: 'center',
            }}
        >
            {/* Logo de SkillSwap */}
            {/* TODO: Reemplazar con el logo real  */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Skill Swap
                </Typography>
            </Box>

            {/* Texto de bienvenida del mockup */}
            <Typography variant="h5" component="p" sx={{ mb: 4 }}>
                Intercambio colaborativo de conocimientos
            </Typography>

            {/* Componente de Botones */}
            <AuthButtons />

            {/* Texto adicional de Copyright si es necesario */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 5 }}>
                © 2025 SkillSwap
            </Typography>
        </Container>
    );
};

export default StartScreen;