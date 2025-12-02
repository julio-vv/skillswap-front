import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, NavLink } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './features/Auth/AuthContext';
import { ROUTES } from './constants/routePaths';
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
            [ROUTES.HOME]: 'SkillSwap — Matches',
            [ROUTES.SEARCH]: 'SkillSwap — Buscar Usuarios',
            [ROUTES.PROFILE]: 'SkillSwap — Mi Perfil',
            [ROUTES.LOGIN]: 'SkillSwap — Iniciar Sesión',
            [ROUTES.REGISTER]: 'SkillSwap — Registro',
            [ROUTES.ROOT]: 'SkillSwap — Bienvenida',
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
    return isAuthenticated ? element : <Navigate to={ROUTES.LOGIN} />;
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
            <Route path={ROUTES.ROOT} element={<StartScreen />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

            {/* Privado con layout */}
            <Route element={<PrivateLayout />}>
                <Route path={ROUTES.HOME} element={<ProtectedRoute element={<MatchesPage />} />} />
                <Route path={ROUTES.PROFILE} element={<ProtectedRoute element={<ProfilePage />} />} />
                <Route path="/usuarios/:id" element={<ProtectedRoute element={<ProfilePage />} />} />
                <Route path={ROUTES.SEARCH} element={<ProtectedRoute element={<SearchPage />} />} />
                <Route path={ROUTES.NOTIFICATIONS} element={<ProtectedRoute element={<h1>Notificaciones...</h1>} />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<h1 style={{ padding: 24 }}>404: Página no encontrada</h1>} />
        </Routes>
    );
}

export default App;