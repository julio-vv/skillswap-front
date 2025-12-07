import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/Auth/AuthContext';
import { useNotifications } from '../features/Notifications/hooks/useNotifications';
import { useToast } from '../context/ToastContext';
// axiosInstance se cargará dinámicamente sólo cuando se use logout
import { AUTH } from '../constants/apiEndpoints';
import { ROUTES } from '../constants/routePaths';

const Header = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { unreadCount } = useNotifications();
    const { showToast } = useToast();
    // TODO: Debuggear useConversations
    const unreadMessages = 0;

    const handleLogout = async () => {
        try {
            // Opcional: notificar logout a la API si existe endpoint
            try {
                const { default: axiosInstance } = await import('../api/axiosInstance');
                await axiosInstance.post(AUTH.LOGOUT);
            } catch (apiErr) {
                // Si el backend no requiere o falla, continuamos con limpieza local
                console.warn('Logout API falló/omitido:', apiErr?._friendlyMessage || apiErr?.message || '');
            }
            // Limpiar el estado local y redirigir
            logout(); // Esto elimina el token del localStorage y actualiza el estado
            showToast('Sesión cerrada correctamente', 'success');
            navigate('/');

        } catch (error) {
            // Si el logout de la API falla (ej. token ya inválido), aún debemos limpiar el frontend
            console.error("Error al notificar logout a la API, limpiando localmente.", error);
            logout();
            showToast('Sesión cerrada correctamente', 'success');
            navigate('/');
        }
    };

    return (
        <AppBar position="static" color="default" elevation={1}>
            <Toolbar sx={{ gap: 1 }}>
                {/* Logo de SkillSwap */}
                <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                        flexGrow: 1, 
                        fontWeight: 700,
                        background: (theme) => 
                            `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Skill Swap
                </Typography>

                {/* Botones de navegación */}
                <Stack direction="row" spacing={0.5}>
                    {/* BOTÓN: FEED/MATCHES */}
                    <IconButton
                        color="primary"
                        onClick={() => navigate(ROUTES.HOME)}
                        aria-label="Ir a inicio"
                    >
                        <HomeIcon />
                    </IconButton>

                    {/* Botón de Búsqueda */}
                    <IconButton 
                        color="primary" 
                        onClick={() => navigate(ROUTES.SEARCH)}
                        aria-label="Buscar usuarios"
                    >
                        <SearchIcon />
                    </IconButton>

                    {/* Botón de Notificaciones */}
                    <IconButton 
                        color="primary" 
                        onClick={() => navigate(ROUTES.NOTIFICATIONS)}
                        aria-label="Ver notificaciones"
                    >
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    {/* Botón de Amigos */}
                    <IconButton 
                        color="primary" 
                        onClick={() => navigate(ROUTES.FRIENDS)}
                        aria-label="Ver amigos"
                    >
                        <PeopleIcon />
                    </IconButton>

                    {/* Botón de Chat */}
                    <IconButton 
                        color="primary" 
                        onClick={() => navigate(ROUTES.CHAT)}
                        aria-label="Ver chat"
                    >
                        <Badge badgeContent={unreadMessages} color="error">
                            <ChatIcon />
                        </Badge>
                    </IconButton>

                    {/* Botón de Perfil */}
                    <IconButton
                        color="primary"
                        onClick={() => navigate(ROUTES.PROFILE)}
                        aria-label="Ver perfil"
                    >
                        <PersonIcon />
                    </IconButton>

                    {/* Botón de Logout */}
                    <IconButton 
                        color="primary" 
                        onClick={handleLogout}
                        aria-label="Cerrar sesión"
                    >
                        <LogoutIcon />
                    </IconButton>
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default Header;