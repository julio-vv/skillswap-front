import React from 'react';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

/**
 * Componente de error para ProfilePage
 * Muestra un mensaje de error y un botón para volver al login
 */
const ProfileError = ({ error, onLogout }) => {
    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
                {error || 'No se pudo cargar el perfil.'}
            </Alert>
            <Button onClick={onLogout} variant="contained">
                Volver a Iniciar Sesión
            </Button>
        </Container>
    );
};

export default ProfileError;
