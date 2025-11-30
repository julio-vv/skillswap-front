import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import { Notifications as NotificationsIcon, Person as PersonIcon, Search as SearchIcon, Home as HomeIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/Auth/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            // Opcional: Llamar a POST /auth/logout/ (Si la API lo requiere)
            // await axiosInstance.post('auth/logout/'); 

            // Limpiar el estado local y redirigir
            logout(); // Esto elimina el token del localStorage y actualiza el estado
            navigate('/login');

        } catch (error) {
            // Si el logout de la API falla (ej. token ya inválido), aún debemos limpiar el frontend
            console.error("Error al notificar logout a la API, limpiando localmente.", error);
            logout();
            navigate('/login');
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
                        onClick={() => navigate('/home')}
                    >
                        <HomeIcon />
                    </IconButton>
                </Box>

                {/* Botón de Búsqueda (Página Búsqueda del mockup) */}
                <IconButton color="inherit" onClick={() => navigate('/search')}>
                    <SearchIcon />
                </IconButton>

                {/* Botón de Notificaciones */}
                <IconButton color="inherit" onClick={() => navigate('/notifications')}>
                    <NotificationsIcon />
                </IconButton>

                {/* Botón de Perfil */}
                <IconButton
                    color="inherit"
                    onClick={() => navigate('/profile')}
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