import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ROUTES } from '../../constants/routePaths';

const AuthButtons = ({ loginPath = ROUTES.LOGIN, registerPath = ROUTES.REGISTER }) => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Función para el inicio de sesión rápido en desarrollo
    const handleQuickLogin = () => {
        // Genera un token de prueba
        const TEST_TOKEN = "TEST_TOKEN_DEVELOPER_SKILLSWAP_12345";
        
        // Usa la función de login del contexto para guardar el token
        login(TEST_TOKEN); 

        // Redirigir al home
        navigate(ROUTES.HOME); 
    };

    return (
        // Stack organiza los botones verticalmente con espacio entre ellos
        <Stack spacing={2} sx={{ width: '100%', maxWidth: 300, mt: 4 }}>
            <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate(loginPath)}
            >
                INICIAR SESIÓN
            </Button>
            <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={() => navigate(registerPath)}
            >
                REGISTRARSE
            </Button>

            {/* Botón adicional para login rápido en desarrollo */}
            <Button
                variant="text"
                color="inherit"
                size="small"
                onClick={handleQuickLogin}
            >
                [Login Rápido (Desarrollo)]
            </Button>
        </Stack>
    );
};

export default AuthButtons;