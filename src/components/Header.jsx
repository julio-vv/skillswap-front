import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button, Stack } from '@mui/material';
import { Notifications as NotificationsIcon, Person as PersonIcon, Search as SearchIcon, Home as HomeIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/Auth/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { AUTH } from '../constants/apiEndpoints';
import { ROUTES } from '../constants/routePaths';

const Header = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            // Opcional: notificar logout a la API si existe endpoint
            try {
                await axiosInstance.post(AUTH.LOGOUT);
            } catch (apiErr) {
                // Si el backend no requiere o falla, continuamos con limpieza local
                console.warn('Logout API falló/omitido:', apiErr?._friendlyMessage || apiErr?.message || '');
            }
            // Limpiar el estado local y redirigir
            logout(); // Esto elimina el token del localStorage y actualiza el estado
            navigate(ROUTES.LOGIN);

        } catch (error) {
            // Si el logout de la API falla (ej. token ya inválido), aún debemos limpiar el frontend
            console.error("Error al notificar logout a la API, limpiando localmente.", error);
            logout();
            navigate(ROUTES.LOGIN);
        }
    };

    return (
        <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
                {/* Logo de SkillSwap */}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    Skill Swap
                </Typography>

                {/* ---  BOTÓN: FEED/MATCHES --- */}
                <Box>
                    <IconButton
                        color="inherit"
                        onClick={() => navigate(ROUTES.HOME)}
                    >
                        <HomeIcon />
                    </IconButton>
                </Box>

                {/* Botón de Búsqueda (Página Búsqueda del mockup) */}
                <IconButton color="inherit" onClick={() => navigate(ROUTES.SEARCH)}>
                    <SearchIcon />
                </IconButton>

                {/* Botón de Notificaciones */}
                <IconButton color="inherit" onClick={() => navigate(ROUTES.NOTIFICATIONS)}>
                    <NotificationsIcon />
                </IconButton>

                {/* Botón de Perfil */}
                <IconButton
                    color="inherit"
                    onClick={() => navigate(ROUTES.PROFILE)}
                >
                    <PersonIcon />
                </IconButton>

                {/* Botón de Logout */}
                <IconButton color="inherit" onClick={handleLogout}>
                    <LogoutIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;