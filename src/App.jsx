import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, NavLink } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './features/Auth/AuthContext';
import Header from './components/Header';
import StartScreen from './features/Auth/StartScreen';
import LoginPage from './features/Auth/LoginPage';
import RegisterPage from './features/Auth/RegisterPage';
import MatchesPage from './features/Matches/MatchesPage';
import ProfilePage from './features/Profile/ProfilePage';
import SearchPage from './features/Search/SearchPage';

// Hook para actualizar el título de la pestaña según la ruta
function usePageTitle() {
    const { pathname } = useLocation();
    useEffect(() => {
        const titles = {
            '/home': 'SkillSwap — Matches',
            '/search': 'SkillSwap — Buscar Usuarios',
            '/profile': 'SkillSwap — Mi Perfil',
            '/login': 'SkillSwap — Iniciar Sesión',
            '/register': 'SkillSwap — Registro',
            '/': 'SkillSwap — Bienvenida',
        };
        const base = 'SkillSwap';
        if (pathname.startsWith('/usuarios/')) {
            document.title = 'SkillSwap — Perfil de Usuario';
            return;
        }
        document.title = titles[pathname] || base;
    }, [pathname]);
}

const ProtectedRoute = ({ element }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }
    return isAuthenticated ? element : <Navigate to="/login" />;
};

// Layout privado: Header + contenido
const PrivateLayout = () => {
    return (
        <Box>
            <Header />
            <Box sx={{ mt: 2 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

function App() {
    usePageTitle();
    return (
        <Routes>
            {/* Público */}
            <Route path="/" element={<StartScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Privado con layout */}
            <Route element={<PrivateLayout />}>
                <Route path="/home" element={<ProtectedRoute element={<MatchesPage />} />} />
                <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
                <Route path="/usuarios/:id" element={<ProtectedRoute element={<ProfilePage />} />} />
                <Route path="/search" element={<ProtectedRoute element={<SearchPage />} />} />
                <Route path="/notifications" element={<ProtectedRoute element={<h1>Notificaciones...</h1>} />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<h1 style={{ padding: 24 }}>404: Página no encontrada</h1>} />
        </Routes>
    );
}

export default App;