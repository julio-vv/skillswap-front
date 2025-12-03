import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import AuthButtons from './AuthButtons';

const StartScreen = () => {
    // Prefetch suave de páginas de Auth al pasar el mouse por la zona de botones
    const prefetchAuthPages = () => {
        // Carga paralela, no bloqueante
        import('./LoginPage');
        import('./RegisterPage');
    };
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

            {/* Componente de Botones con prefetch en hover */}
            <Box onMouseEnter={prefetchAuthPages}>
                <AuthButtons />
            </Box>

            {/* Texto adicional de Copyright si es necesario */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 5 }}>
                © 2025 SkillSwap
            </Typography>
        </Container>
    );
};

export default StartScreen;