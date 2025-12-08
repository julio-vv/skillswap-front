import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ROUTES } from '../../constants/routePaths';

const AuthButtons = ({ loginPath = ROUTES.LOGIN, registerPath = ROUTES.REGISTER }) => {
    const navigate = useNavigate();
    const { login } = useAuth();

    return (
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
        </Stack>
    );
};

export default AuthButtons;